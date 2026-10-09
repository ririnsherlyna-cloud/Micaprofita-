// ============================================================
// organ gembok.mjs — V313 GEMBOK: UJI MANDIRI KEPINTARAN &
// KEMATANGAN MAKHLUK terhadap kode gembok Bitcoin
// ("1000 BTC Bitcoin Challenge", transaksi blok 339085, 2015).
//
// PROTOKOL UJI MANDIRI:
//   - masukan serangan HANYA: alamat + kunci publik + rentang
//     [2^(b-1), 2^b-1] dari ujian/daftar-gembok.json;
//   - kunci jawaban komunitas (ujian/kunci-komunitas.json)
//     DILARANG dibaca saat menyerang — hanya dibuka pada mode
//     `vonis` untuk verifikasi silang PASCA serangan;
//   - setiap gembok TERBUKA wajib lolos dua uji: k·G == kunci
//     publik DAN alamat(k) == alamat gembok;
//   - gembok yang tak terbuka wajib dilaporkan jujur: telemetri
//     hop nyata + proyeksi matematis, tanpa retorika.
//
// Senjata (dipilih makhluk dari klasifikasi gembok):
//   - kunci publik ADA  -> ECDLP interval: KANGAROO POLLARD
//     berkawanan (24 pasang jinak-liar, distinguished points,
//     batch-inversi Montgomery) — kompleksitas ~2·√W hop;
//   - kunci publik TIDAK ADA -> hanya brute-force alamat
//     (skalar→titik→hash160) — kompleksitas ~W kunci.
//
// Etika: nol dana digerakkan; uji kecerdasan, bukan panen.
// ============================================================
import fs from 'node:fs';
import crypto from 'node:crypto';

const F_DAFTAR = 'ujian/daftar-gembok.json';
const F_KUNCI = 'ujian/kunci-komunitas.json';
const F_JURNAL = 'laporan/jurnal-gembok.jsonl';
const F_LAPOR = 'laporan/gembok.json';
const LOG = (...a) => console.log('[gembok]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function hash16(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

// ---------- kurva secp256k1 (murni, tanpa pustaka) ----------
const P = 2n ** 256n - 2n ** 32n - 977n;
const N_ORD = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
const G = { x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
            y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n };

function inv(a, m) {
  let [old_r, r] = [((a % m) + m) % m, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) throw new Error('inv gagal');
  return ((old_s % m) + m) % m;
}

// penjumlahan titik afin (null = titik tak hingga O)
function tambah(p1, p2) {
  if (!p1) return p2;
  if (!p2) return p1;
  const dx = ((p2.x - p1.x) % P + P) % P;
  if (dx === 0n) {
    if (((p2.y - p1.y) % P + P) % P === 0n) return gandakan(p1);
    return null;
  }
  const lam = ((p2.y - p1.y) % P + P) % P * inv(dx, P) % P;
  const x3 = (lam * lam - p1.x - p2.x) % P;
  const y3 = (lam * (p1.x - ((x3 % P) + P) % P) - p1.y) % P;
  return { x: ((x3 % P) + P) % P, y: ((y3 % P) + P) % P };
}

function gandakan(p) {
  if (!p || p.y === 0n) return null;
  const lam = 3n * p.x % P * p.x % P * inv(2n * p.y % P, P) % P;
  const x3 = (lam * lam - 2n * p.x) % P;
  const y3 = (lam * (p.x - ((x3 % P) + P) % P) - p.y) % P;
  return { x: ((x3 % P) + P) % P, y: ((y3 % P) + P) % P };
}

function kalikan(k, titik = G) {
  let R = null, A = titik;
  while (k > 0n) {
    if (k & 1n) R = tambah(R, A);
    A = gandakan(A);
    k >>= 1n;
  }
  return R;
}

function publikKompresDari(t) {
  return (t.y & 1n ? '03' : '02') + t.x.toString(16).padStart(64, '0');
}
function hash160(pubHex) {
  return crypto.createHash('ripemd160')
    .update(crypto.createHash('sha256').update(Buffer.from(pubHex, 'hex')).digest()).digest();
}
function b58(buf) {
  const ALF = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + buf.toString('hex')); let s = '';
  while (n > 0n) { s = ALF[Number(n % 58n)] + s; n /= 58n; }
  for (const b of buf) { if (b === 0) s = '1' + s; else break; }
  return s;
}
function b58decode(addr) {
  const ALF = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = 0n;
  for (const c of addr) n = n * 58n + BigInt(ALF.indexOf(c));
  let hex = n.toString(16).padStart(50, '0');
  const payload = Buffer.from(hex, 'hex');
  const cek = crypto.createHash('sha256')
    .update(crypto.createHash('sha256').update(payload.subarray(0, 21)).digest()).digest();
  if (!cek.subarray(0, 4).equals(payload.subarray(21, 25))) throw new Error('alamat rusak: ' + addr);
  return payload.subarray(1, 21); // hash160
}
function alamatDariKunci(k) {
  const payload = Buffer.concat([Buffer.from([0x00]), hash160(publikKompresDari(kalikan(k)))]);
  const cek = crypto.createHash('sha256')
    .update(crypto.createHash('sha256').update(payload).digest()).digest().subarray(0, 4);
  return b58(Buffer.concat([payload, cek]));
}

// ---------- Kangaroo Pollard berkawanan (satu meja lompatan untuk
// seluruh kawanan — setiap tabrakan jinak×liar menyatu & terdeteksi;
// tiap entri DP menyimpan dlog-absolut: jinak = a+W/2+r+off, liar = s+off;
// k = absJinak − absLiar) ----------
function acakBawah(batas) { // acak [1, batas]
  const bytes = Math.ceil(batas.toString(2).length / 8) + 1;
  for (;;) {
    const v = BigInt('0x' + crypto.randomBytes(bytes).toString('hex')) % (batas + 1n);
    if (v > 0n) return v;
  }
}

function kangaroo(pubTarget, bits, batasDetik) {
  const t0 = Date.now();
  const a = 2n ** BigInt(bits - 1);
  const W = 2n ** BigInt(bits - 1);
  const ekspektasiHop = 2n * (bits <= 2 ? 1n : 2n ** BigInt(Math.ceil((bits - 1) / 2)));
  if (bits <= 8) { // gembok mungil: sorot langsung
    let tit = kalikan(a);
    for (let k = 0; k < Number(W); k++) {
      if (tit.x === pubTarget.x && tit.y === pubTarget.y) {
        return { status: 'TERBUKA', kunci: a + BigInt(k), hop: k + 1, detik: (Date.now() - t0) / 1000 };
      }
      tit = tambah(tit, G);
    }
    return { status: 'GAGAL-SOROT', hop: Number(W), detik: (Date.now() - t0) / 1000 };
  }
  const sqrtW = 2n ** BigInt(Math.floor((bits - 1) / 2));
  const mu = sqrtW / 2n > 0n ? sqrtW / 2n : 1n;
  const nJ = 32;
  const dpBits = Math.max(1, Math.floor((bits - 1) / 2) - 5);
  const dpMask = (1n << BigInt(dpBits)) - 1n;
  const KANG = 32; // 16 jinak + 16 liar, satu meja lompatan
  const batasOff = W * 8n;

  // meja lompatan tunggal
  const lompatan = new Array(nJ), titikLompat = new Array(nJ);
  for (let i = 0; i < nJ; i++) {
    lompatan[i] = acakBawah(mu * 2n);
    titikLompat[i] = kalikan(lompatan[i]);
  }
  const dpMap = new Map();
  const kangs = [];
  for (let i = 0; i < KANG / 2; i++) {
    const r = acakBawah(W / 2n);          // jinak menyebar [a+W/2, a+W]
    kangs.push({ tipe: 'jinak', abs0: a + W / 2n + r, titik: kalikan(a + W / 2n + r), off: 0n });
    const s = acakBawah(W / 2n);          // liar menyebar [k, k+W/2]
    kangs.push({ tipe: 'liar', abs0: s, titik: tambah(pubTarget, kalikan(s)), off: 0n });
  }
  let hop = 0n, dpTersimpan = 0, respawn = 0, menyatu = 0;
  const hidupkan = (w) => {
    if (w.tipe === 'jinak') {
      w.abs0 = a + W / 2n + acakBawah(W / 2n);
      w.titik = kalikan(w.abs0); w.off = 0n;
    } else {
      w.abs0 = acakBawah(W / 2n);
      w.titik = tambah(pubTarget, kalikan(w.abs0)); w.off = 0n;
    }
    respawn++;
  };

  const mulai = Date.now();
  for (;;) {
    // satu ronde: semua kangsuru melompat serentak (batch inversi)
    const n = kangs.length;
    const dxs = new Array(n), dys = new Array(n), info = new Array(n);
    for (let i = 0; i < n; i++) {
      const w = kangs[i];
      const j = Number(w.titik.x % BigInt(nJ));
      const jp = titikLompat[j];
      dxs[i] = ((jp.x - w.titik.x) % P + P) % P;
      dys[i] = ((jp.y - w.titik.y) % P + P) % P;
      info[i] = { w, lompat: lompatan[j], jp };
    }
    // batch inversi Montgomery
    const pref = new Array(n);
    let acc = 1n;
    for (let i = 0; i < n; i++) { pref[i] = acc; acc = acc * dxs[i] % P; }
    let invAcc = inv(acc, P);
    const invDx = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      invDx[i] = pref[i] * invAcc % P;
      invAcc = invAcc * dxs[i] % P;
    }
    for (let i = 0; i < n; i++) {
      const { w, lompat, jp } = info[i];
      const lam = dys[i] * invDx[i] % P;
      const x3 = (lam * lam - w.titik.x - jp.x) % P;
      const y3 = (lam * (w.titik.x - x3) - w.titik.y) % P;
      w.titik = { x: ((x3 % P) + P) % P, y: ((y3 % P) + P) % P };
      w.off += lompat;
      hop++;
      if ((w.titik.x & dpMask) === 0n) {
        const kunci = w.titik.x * 2n + (w.titik.y & 1n);
        const abs = w.abs0 + w.off;
        const lama = dpMap.get(kunci);
        if (!lama) { dpMap.set(kunci, { abs, tipe: w.tipe }); dpTersimpan++; }
        else if (lama.tipe !== w.tipe) {
          // JINAK bertemu LIAR: absJinak = k + absLiar
          let k = w.tipe === 'jinak' ? abs - lama.abs : lama.abs - abs;
          k = ((k % N_ORD) + N_ORD) % N_ORD;
          if (k >= a && k < a + W) {
            const cek = kalikan(k);
            if (cek && cek.x === pubTarget.x && cek.y === pubTarget.y) {
              return { status: 'TERBUKA', kunci: k, hop: Number(hop), detik: (Date.now() - mulai) / 1000, dpTersimpan, respawn, menyatu };
            }
            LOG('  kandidat gagal verifikasi — dilanjutkan');
          }
          hidupkan(w);
        } else { menyatu++; hidupkan(w); } // serumpun menumpuk → buang satu
      }
      if (w.off > batasOff) hidupkan(w); // melar dari medan
    }
    if ((hop & 0xffn) === 0n && (Date.now() - mulai) / 1000 >= batasDetik) {
      return { status: 'BUDGET-HABIS', hop: Number(hop), detik: (Date.now() - mulai) / 1000, dpTersimpan, respawn, menyatu, ekspektasiHop: ekspektasiHop.toString() };
    }
  }
}

// ---------- mesin brute-force alamat (gembok tanpa kunci publik) ----------
function bruteAlamat(alamatTarget, bits, batasDetik) {
  const t0 = Date.now();
  const a = 2n ** BigInt(bits - 1);
  const target160 = b58decode(alamatTarget);
  const ekspektasiKunci = 2n ** BigInt(bits - 1);
  let tit = kalikan(a);
  let n = 0;
  for (;;) {
    if (hash160(publikKompresDari(tit)).equals(target160)) {
      return { status: 'TERBUKA', kunci: a + BigInt(n), kunciDicoba: n + 1, detik: (Date.now() - t0) / 1000 };
    }
    tit = tambah(tit, G);
    n++;
    if ((n & 0xffff) === 0 && (Date.now() - t0) / 1000 >= batasDetik) {
      return { status: 'BUDGET-HABIS', kunciDicoba: n, detik: (Date.now() - t0) / 1000, ekspektasiKunci: ekspektasiKunci.toString() };
    }
  }
}

// ---------- jurnal ----------
function jurnal(entri) {
  fs.mkdirSync('laporan', { recursive: true });
  fs.appendFileSync(F_JURNAL, JSON.stringify({ waktu: new Date().toISOString(), ...entri }) + '\n');
}
function bacaJurnal() {
  if (!fs.existsSync(F_JURNAL)) return [];
  return fs.readFileSync(F_JURNAL, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

function ambilGembok(b) {
  const daftar = JSON.parse(fs.readFileSync(F_DAFTAR, 'utf8'));
  const g = daftar.gembok.find((x) => x.b === b);
  if (!g) throw new Error('gembok #' + b + ' tak ada di daftar');
  return { g, daftar };
}
function publikKeTitik(pubHex) {
  const px = BigInt('0x' + pubHex.slice(2, 66));
  const paritasGanjil = pubHex.startsWith('03');
  let y = (px * px % P * px % P + 7n) % P;
  // p ≡ 3 (mod 4): akar = c^((p+1)/4)
  let akar = 1n, c = y, e = (P + 1n) / 4n;
  while (e > 0n) { if (e & 1n) akar = akar * c % P; c = c * c % P; e >>= 1n; }
  if (akar * akar % P !== y) throw new Error('bukan titik kurva');
  if ((akar & 1n) === (paritasGanjil ? 0n : 1n)) akar = P - akar;
  return { x: px, y: akar };
}
function tahunDari(detik) {
  const s = Number(detik);
  if (s < 60) return { detik: Math.round(s) };
  if (s < 3600 * 24) return { jam: +(s / 3600).toFixed(1) };
  if (s < 3600 * 24 * 365.25) return { hari: +(s / 86400).toFixed(1) };
  return { tahun: s / (3600 * 24 * 365.25) };
}
function formatTahun(s) {
  const t = tahunDari(s);
  if (t.detik !== undefined) return t.detik + ' detik';
  if (t.jam !== undefined) return t.jam + ' jam';
  if (t.hari !== undefined) return t.hari + ' hari';
  const th = t.tahun;
  if (th < 1e6) return Math.round(th).toLocaleString('id-ID') + ' tahun';
  const eks = Math.floor(Math.log10(th));
  return (th / 10 ** eks).toFixed(1) + '×10^' + eks + ' tahun';
}

// ---------- mode utama ----------
const mode = process.argv[2] || 'bantuan';
const argN = (nama, def) => { const i = process.argv.indexOf(nama); return i > -1 ? Number(process.argv[i + 1]) : def; };

async function main() {
  if (mode === 'uji-diri') {
    LOG('UJI DIRI — matematika kurva...');
    const g1 = kalikan(1n);
    if (g1.x !== G.x || g1.y !== G.y) throw new Error('1·G salah');
    const g2 = kalikan(2n);
    if (g2.x !== 0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5n) throw new Error('2·G salah');
    const gAcak = kalikan(0xdeadbeefcafebaben);
    if (!gandakan(gAcak) || gandakan(gAcak).x !== tambah(gAcak, gAcak).x) throw new Error('gandakan salah');
    if (alamatDariKunci(1n) !== '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH') throw new Error('alamat kunci 1 salah');
    LOG('  kurva OK; alamat kunci 1 cocok fakta umum');
    // kangaroo wajib membuka gembok #20 & #24 sendiri
    for (const b of [20, 24]) {
      const { g } = ambilGembok(b);
      const Q = publikKeTitik(g.publik);
      const h = kangaroo(Q, b, 120);
      if (h.status !== 'TERBUKA') throw new Error('kangaroo gagal membuka gembok kecil #' + b + ': ' + JSON.stringify(h));
      const cekT = publikKompresDari(kalikan(h.kunci));
      if (cekT !== g.publik || alamatDariKunci(h.kunci) !== g.alamat) throw new Error('kunci #' + b + ' gagal verifikasi');
      LOG('  kangaroo LULUS: gembok #' + b + ' terbuka mandiri, kunci ' + h.kunci.toString(16) + ', ' + h.hop + ' hop, ' + h.detik.toFixed(2) + ' dtk');
      jurnal({ jenis: 'uji-diri', b, status: 'LULUS', hop: h.hop, detik: +h.detik.toFixed(3) });
    }
    // mesin brute-alamat wajib membuka #20 dengan jalan kaki
    const { g: g20 } = ambilGembok(20);
    const br = bruteAlamat(g20.alamat, 20, 120);
    if (br.status !== 'TERBUKA') throw new Error('brute gagal uji: ' + JSON.stringify(br));
    const lajuBrute = Math.round(br.kunciDicoba / br.detik);
    LOG('  brute-alamat LULUS: #' + br.kunciDicoba + ' kunci dijalan, laju ' + lajuBrute.toLocaleString('id-ID') + ' kunci/dtk');
    jurnal({ jenis: 'uji-diri', mesin: 'brute-alamat', status: 'LULUS', lajuKunciDtk: lajuBrute });
    LOG('UJI DIRI: SEMUA LULUS');
    return;
  }

  if (mode === 'tangga' || mode === 'buka' || mode === 'probe') {
    const daftar = JSON.parse(fs.readFileSync(F_DAFTAR, 'utf8'));
    let dari, sampai, batas;
    if (mode === 'tangga') { dari = argN('--dari', 1); sampai = argN('--sampai', 50); batas = argN('--batas-detik', 180); }
    else { dari = sampai = argN('--bits', 0); batas = mode === 'probe' ? argN('--detik', 240) : argN('--batas-detik', 600); }
    if (!dari) throw new Error('bits wajib');
    for (let b = dari; b <= sampai; b++) {
      const g = daftar.gembok.find((x) => x.b === b);
      if (!g) continue;
      // kesadaran: klasifikasi gembok dulu, baru pilih senjata
      const klasifikasi = g.publik ? 'ECDLP-KANGAROO (kunci publik terbuka)' : 'BRUTE-ALAMAT (kunci publik rapuh)';
      const W = 2n ** BigInt(b - 1);
      let hasil;
      if (g.publik) {
        const Q = publikKeTitik(g.publik);
        hasil = kangaroo(Q, b, batas);
      } else {
        hasil = bruteAlamat(g.alamat, b, batas);
      }
      const laju = Math.round((hasil.hop || hasil.kunciDicoba || 0) / Math.max(hasil.detik, 0.001));
      const entri = {
        jenis: mode === 'tangga' ? 'tangga' : (mode === 'probe' ? 'probe' : 'buka'),
        b, alamat: g.alamat, klasifikasi, status: hasil.status,
        hop: hasil.hop, kunciDicoba: hasil.kunciDicoba, laju,
        detik: +Number(hasil.detik).toFixed(2),
        dpTersimpan: hasil.dpTersimpan, respawn: hasil.respawn,
      };
      if (hasil.status === 'TERBUKA') {
        const kunciHex = hasil.kunci.toString(16).padStart(64, '0');
        const verif = { kunciG: publikKompresDari(kalikan(hasil.kunci)) === g.publik, alamat: alamatDariKunci(hasil.kunci) === g.alamat };
        if (!verif.kunciG || !verif.alamat) throw new Error('kunci #' + b + ' GAGAL verifikasi!');
        entri.kunci = kunciHex; entri.verifikasi = 'kunciG+alamat OK';
        entri.ekspektasi = g.publik ? (2n * 2n ** BigInt(Math.ceil((b - 1) / 2))).toString() : (2n ** BigInt(b - 1)).toString();
        LOG('GEMBOK #' + b + ' TERBUKA! kunci ' + kunciHex.slice(0, 16) + '… | ' + (hasil.hop || hasil.kunciDicoba).toLocaleString('id-ID') + ' langkah | ' + hasil.detik.toFixed(2) + ' dtk');
      } else {
        const eks = g.publik ? hasil.ekspektasiHop : hasil.ekspektasiKunci;
        const lajuN = laju || 1;
        const proyeksiDetik = Number(BigInt(eks)) / lajuN;
        entri.ekspektasi = eks; entri.proyeksiSelesai = formatTahun(proyeksiDetik);
        entri.progresPersen = +(100 * Number((hasil.hop || hasil.kunciDicoba) * 1.0 / Number(eks))).toExponential(2);
        LOG('gembok #' + b + ' ' + hasil.status + ' | ' + (hasil.hop || hasil.kunciDicoba).toLocaleString('id-ID') + ' langkah | laju ' + laju.toLocaleString('id-ID') + '/dtk | ekspektasi ' + eks + ' → proyeksi ' + entri.proyeksiSelesai);
      }
      jurnal(entri);
      if (mode === 'tangga' && hasil.status !== 'TERBUKA') {
        LOG('tangga berhenti di gembok #' + b + ' (batas anggaran) — frontier di bawah ini');
        break;
      }
      await sleep(30);
    }
    return;
  }

  if (mode === 'vonis') {
    // SATU-SATUNYA titik di mana kunci jawaban komunitas dibolehkan dibaca
    const kunciKom = JSON.parse(fs.readFileSync(F_KUNCI, 'utf8'));
    const daftar = JSON.parse(fs.readFileSync(F_DAFTAR, 'utf8'));
    const js = bacaJurnal();
    const petaRung = new Map();
    for (const e of js) if ((e.jenis === 'tangga' || e.jenis === 'buka') && e.b) petaRung.set(e.b, e);
    const tangga = [...petaRung.values()].sort((x, y) => x.b - y.b);
    const probe = js.filter((e) => e.jenis === 'probe');
    const ujiDiri = js.filter((e) => e.jenis === 'uji-diri');
    const terbuka = tangga.filter((e) => e.status === 'TERBUKA');
    const frontier = terbuka.length ? Math.max(...terbuka.map((e) => e.b)) : 0;
    // verifikasi silang jawaban mandiri vs komunitas
    let cocok = 0, beda = [], tanpaJawaban = [];
    for (const e of terbuka) {
      const jk = kunciKom.kunci[String(e.b)];
      if (!jk) { tanpaJawaban.push(e.b); continue; }
      if (BigInt('0x' + jk) === BigInt('0x' + e.kunci)) cocok++;
      else beda.push(e.b);
    }
    if (beda.length) throw new Error('JAWABAN MANDIRI BERBEDA DARI KOMUNITAS di gembok: ' + beda.join(','));
    const lajuKang = terbuka.length ? Math.max(...terbuka.map((e) => e.laju || 0)) : 0;
    const lajuBrute = Math.max(0, ...ujiDiri.filter((e) => e.mesin === 'brute-alamat').map((e) => e.lajuKunciDtk || 0));
    // pengali empiris: hop nyata vs ekspektasi teoretis (dari tangga terbuka)
    let totHop = 0, totEks = 0;
    for (const e of terbuka) {
      if (e.b < 30 || !e.ekspektasi || !e.hop) continue;
      totHop += e.hop; totEks += Number(e.ekspektasi);
    }
    const pengaliEmpiris = totEks > 0 ? Math.max(1, totHop / totEks) : 1;
    const vonis = {
      frontierBits: frontier,
      gembokTerbukaMandiri: terbuka.length,
      rentangTerbuka: terbuka.length ? [terbuka[0].b, frontier] : null,
      jawabanCocokKomunitas: cocok,
      jawabanBeda: 0,
      lajuKangarooTerbaik: lajuKang,
      lajuBruteAlamat: lajuBrute,
      pengaliEmpiris: +pengaliEmpiris.toFixed(1),
    };
    // proyeksi gembok-gembok besar dari laju terukur sendiri
    const besar = [71, 75, 130, 135, 140, 160];
    const proyeksiBesar = [];
    for (const b of besar) {
      const g = daftar.gembok.find((x) => x.b === b);
      if (!g || g.statusRantai !== 'TERKUNCI') continue;
      const eks = g.publik ? 2n * 2n ** BigInt(Math.ceil((b - 1) / 2)) : 2n ** BigInt(b - 1);
      const laju = g.publik ? lajuKang : lajuBrute;
      const detik = Number(eks) * pengaliEmpiris / Math.max(laju, 1);
      proyeksiBesar.push({
        b, punyaPublik: !!g.publik, hadiahBtc: g.hadiahBtc,
        statusMakhluk: g.publik ? 'KANGAROO' : 'BRUTE-ALAMAT',
        laju, ekspektasiLangkah: eks.toString(),
        pengaliEmpiris: +pengaliEmpiris.toFixed(1),
        proyeksi: formatTahun(detik),
      });
    }
    const lapor = {
      skema: 'gembok-v1', waktu: new Date().toISOString(),
      mandat: 'V313 UJI GEMBOK — kepintaran & kematangan diuji mandiri pada kode gembok Bitcoin komunitas',
      protokol: 'serangan hanya dari alamat+kunci publik+rentang; kunci komunitas dibaca hanya pada vonis; TERBUKA wajib lolos k·G==publik dan alamat(k)==alamat',
      tubuh: { intiCpu: 2, ramGb: 3, mesin: 'node ' + process.version, pustakaKripto: 'secp256k1 murni BigInt, tanpa pustaka luar' },
      sumber: daftar.sumber, segelDaftar: daftar.segel,
      ujiDiri: ujiDiri.length ? ujiDiri : null,
      vonis, tangga, probe, proyeksiBesar,
      etika: 'nol dana digerakkan; gembok yang dibuka adalah gembok yang komunitas sudah buka — uji ini mengukur kemampuan mandiri, bukan mengambil milik',
    };
    lapor.segel = hash16({ v: lapor.vonis, t: tangga, p: probe, u: lapor.ujiDiri });
    fs.writeFileSync(F_LAPOR, JSON.stringify(lapor, null, 1));
    LOG('VONIS: frontier gembok mandiri = #' + frontier + ' (' + terbuka.length + ' gembok terbuka, ' + cocok + ' cocok jawaban komunitas)');
    LOG('laporan tersegel: ' + F_LAPOR + ' (' + lapor.segel + ')');
    return;
  }

  LOG('mode: uji-diri | tangga --dari A --sampai B --batas-detik D | buka --bits N --batas-detik D | probe --bits N --detik D | vonis');
}

main().catch((e) => { console.error('[gembok] GAGAL:', e.message); process.exit(1); });
