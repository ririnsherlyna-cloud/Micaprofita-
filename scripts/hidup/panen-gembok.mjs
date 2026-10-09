// ============================================================
// organ panen-gembok.mjs — V313 GEMBOK
// Panen fakta gembok Bitcoin ("1000 BTC Bitcoin Challenge")
// dari DUA sumber hidup, nol karangan:
//   1) berkas status komunitas (roadhero/Bitcoin-Puzzle-Info)
//      — daftar 160 gembok + kunci publik/kunci jawaban yang
//        sudah terpecahkan;
//   2) blockchain via mempool.space (cadangan blockstream.info)
//      — transaksi puzzle 2015 (TXID sejati), saldo terkini,
//        kunci publik dari scriptSig belanja sejarah.
// Output:
//   ujian/daftar-gembok.json   — MASUKAN SERANGAN (tanpa kunci
//                                jawaban komunitas!)
//   ujian/kunci-komunitas.json — kunci jawaban komunitas, hanya
//                                untuk verifikasi silang PASCA
//                                serangan.
// Keduanya tersegel SHA-256 (hash16).
// Etika: organ ini hanya MEMBACA rantai; nol dana digerakkan.
// ============================================================
import fs from 'node:fs';
import crypto from 'node:crypto';

const TXID = '08389f34c98c606322740c0be6a7125d9860bb8d5cb182c02f98461e5fa6cd15';
const BLOK_HARAP = 339085; // Januari 2015
const URL_TRACKER = 'https://raw.githubusercontent.com/roadhero/Bitcoin-Puzzle-Info/main/BTC-Solved-Unsolved.txt';
const API = ['https://mempool.space/api', 'https://blockstream.info/api'];
const F_UJIAN = 'ujian/daftar-gembok.json';
const F_KUNCI = 'ujian/kunci-komunitas.json';
const LOG = (...a) => console.log('[panen-gembok]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hash16(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

async function ambil(jalur, coba = 3) {
  let salahTerakhir;
  for (let i = 0; i < coba; i++) {
    const dasar = API[i % API.length];
    try {
      const r = await fetch(dasar + jalur, { headers: { 'user-agent': 'micaprofita-gembok-v313' } });
      if (r.status === 429 || r.status >= 500) throw new Error('HTTP ' + r.status);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (e) { salahTerakhir = e; await sleep(350 * (i + 1)); }
  }
  throw salahTerakhir;
}

// kunci publik -> alamat P2PKH (verifikasi integritas lokal murni)
function alamatDariPublik(pubHex) {
  const h160 = crypto.createHash('sha256').update(Buffer.from(pubHex, 'hex')).digest();
  const r160 = crypto.createHash('ripemd160').update(h160).digest();
  const payload = Buffer.concat([Buffer.from([0x00]), r160]);
  const cek = crypto.createHash('sha256')
    .update(crypto.createHash('sha256').update(payload).digest()).digest().subarray(0, 4);
  const penuh = Buffer.concat([payload, cek]);
  const ALF = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + penuh.toString('hex')); let s = '';
  while (n > 0n) { s = ALF[Number(n % 58n)] + s; n /= 58n; }
  for (const b of penuh) { if (b === 0) s = '1' + s; else break; }
  return s;
}

// kompres kunci publik (04-uncompressed -> 02/03)
function kompresPublik(pubHex) {
  if (pubHex.length === 66) return pubHex;
  if (pubHex.length === 130 && pubHex.startsWith('04')) {
    const yTerakhir = parseInt(pubHex[pubHex.length - 1], 16);
    return (yTerakhir % 2 === 0 ? '02' : '03') + pubHex.slice(2, 66);
  }
  return null;
}

// tarik kunci publik dari scriptsig (P2PKH belanja membongkar kunci)
function publikDariScriptSig(hex) {
  if (!hex) return null;
  const kandidat = [];
  const re1 = /21(02|03)[0-9a-f]{64}/g; let m;
  while ((m = re1.exec(hex)) !== null) kandidat.push(m[0].slice(2));
  const re2 = /41(04)[0-9a-f]{128}/g;
  while ((m = re2.exec(hex)) !== null) kandidat.push(m[0].slice(2));
  return kandidat;
}

async function main() {
  const t0 = Date.now();
  fs.mkdirSync('ujian', { recursive: true });
  LOG('Sumber 1: berkas status komunitas...');
  const teksTracker = await ambil(URL_TRACKER.startsWith('http') ? URL_TRACKER.replace(/^https?:\/\/[^/]+/, '') : URL_TRACKER).catch(async () => {
    // ambil URL penuh (raw.githubusercontent) — jalur khusus
    const r = await fetch(URL_TRACKER); return await r.text();
  });

  const baris = teksTracker.split('\n').filter((l) => l.trim().startsWith('|'));
  if (baris.length !== 160) throw new Error('tracker tidak 160 baris: ' + baris.length);
  const daftar = [];
  for (let i = 0; i < 160; i++) {
    const kol = baris[i].split('|').map((s) => s.trim());
    // ['' , rentang, alamat, status, publik|NOT SOLVED, kunci|NOT SOLVED, '']
    const rentang = kol[1]; // hex start:end
    const [mulaiHex, akhirHex] = rentang.split(':');
    const mulai = BigInt('0x' + mulaiHex);
    const akhir = BigInt('0x' + akhirHex);
    const bits = mulai.toString(2).length; // 2^(b-1) -> panjang bit b
    if (BigInt(2) ** BigInt(bits - 1) !== mulai || BigInt(2) ** BigInt(bits) - 1n !== akhir) {
      throw new Error('rentang tidak cocok bit di baris ' + (i + 1) + ': ' + rentang);
    }
    const status = kol[3] === 'SOLVED' ? 'TERPECAHKAN' : 'TERKUNCI';
    const pub = kol[4] && kol[4] !== 'NOT SOLVED' ? kol[4].toLowerCase() : null;
    const kunci = kol[5] && kol[5] !== 'NOT SOLVED' ? kol[5].toLowerCase() : null;
    daftar.push({ b: bits, alamat: kol[2], status, publikTracker: pub, kunciTracker: kunci });
  }
  LOG('  160 gembok terbaca; verifikasi kunci publik tracker -> alamat...');
  let pubTrackerCocok = 0, pubTrackerCacat = [];
  for (const g of daftar) {
    if (g.publikTracker) {
      if (alamatDariPublik(g.publikTracker) === g.alamat) { pubTrackerCocok++; g.publikKompres = kompresPublik(g.publikTracker); }
      else pubTrackerCacat.push(g.b);
    }
    // kunci jawaban komunitas wajib konsisten dengan rentangnya
    if (g.kunciTracker) {
      const k = BigInt('0x' + g.kunciTracker);
      if (k < BigInt(2) ** BigInt(g.b - 1) || k > BigInt(2) ** BigInt(g.b) - 1n) {
        throw new Error('kunci komunitas #'+g.b+' di luar rentang!');
      }
    }
  }
  LOG('  publik tracker cocok alamat:', pubTrackerCocok, '| cacat:', pubTrackerCacat.length ? pubTrackerCacat.join(',') : 'nol');
  if (pubTrackerCacat.length) throw new Error('kunci publik tracker cacat: ' + pubTrackerCacat.join(','));

  LOG('Sumber 2: blockchain — tx puzzle 2015...');
  const txRaw = await ambil('/tx/' + TXID);
  const tx = JSON.parse(txRaw);
  if (!tx.status.confirmed || tx.status.block_height !== BLOK_HARAP) {
    throw new Error('tx puzzle tidak di blok ' + BLOK_HARAP + ': ' + JSON.stringify(tx.status));
  }
  const nilaiAlamat = new Map();
  for (const v of tx.vout) {
    if (v.scriptpubkey_address) nilaiAlamat.set(v.scriptpubkey_address, v.value);
  }
  let sidikCocok = 0, sidikCacat = [];
  for (const g of daftar) {
    const v = nilaiAlamat.get(g.alamat);
    if (v === g.b * 100000) sidikCocok++;
    else sidikCacat.push(g.b + ':' + v);
  }
  LOG('  tx di blok ' + tx.status.block_height + '| output ' + tx.vout.length + '| sidik jumlah b*1000 sat cocok:', sidikCocok + '/160', sidikCacat.length ? '| contoh cacat: ' + sidikCacat.slice(0, 5).join(' ') : '');
  if (sidikCocok < 157) throw new Error('sidik jari tx puzzle lemah: ' + sidikCocok);

  LOG('Sumber 2 lanjutan: saldo kini + kunci publik dari scriptSig sejarah...');
  for (let i = 0; i < daftar.length; i++) {
    const g = daftar[i];
    try {
      const ringkas = JSON.parse(await ambil('/address/' + g.alamat));
      const cs = ringkas.chain_stats, ms = ringkas.mempool_stats;
      g.saldoSat = cs.funded_txo_sum - cs.spent_txo_sum + ms.funded_txo_sum - ms.spent_txo_sum;
      // kunci publik dari sejarah belanja (alamat sebagai INPUT)
      const txs = JSON.parse(await ambil('/address/' + g.alamat + '/txs'));
      let pubDitemukan = null, sumber = null;
      for (const t of txs) {
        if (!t.vin) continue;
        for (const vin of t.vin) {
          if (vin.prevout && vin.prevout.scriptpubkey_address === g.alamat) {
            for (const kan of publikDariScriptSig(vin.scriptsig || '')) {
              if (alamatDariPublik(kan) === g.alamat) { pubDitemukan = kompresPublik(kan); break; }
            }
            if (pubDitemukan) break;
          }
        }
        if (pubDitemukan) break;
      }
      if (pubDitemukan) { g.publikRantai = pubDitemukan; sumber = 'rantai-scriptsig'; }
      else if (g.publikKompres) sumber = 'tracker';
      g.publik = g.publikRantai || g.publikKompres || null;
      g.sumberPublik = sumber || null;
      g.statusRantai = g.saldoSat > 0 ? 'TERKUNCI' : 'DANA-PINDAH';
    } catch (e) {
      LOG('  gembok #' + g.b + ' gagal panen rantai: ' + e.message + ' — dicoba sekali lagi...');
      await sleep(1200);
      const ringkas = JSON.parse(await ambil('/address/' + g.alamat));
      const cs = ringkas.chain_stats, ms = ringkas.mempool_stats;
      g.saldoSat = cs.funded_txo_sum - cs.spent_txo_sum + ms.funded_txo_sum - ms.spent_txo_sum;
      g.publik = g.publikKompres || null;
      g.sumberPublik = g.publik ? 'tracker' : null;
      g.statusRantai = g.saldoSat > 0 ? 'TERKUNCI' : 'DANA-PINDAH';
    }
    if (i % 20 === 0) LOG('  ...' + i + '/160 (s#' + Math.round((Date.now() - t0) / 1000) + ')');
    await sleep(120);
  }

  // konsistensi jujur: tracker TERPECAHKAN tapi dana masih nempel = dicatat
  const aneh = daftar.filter((g) => g.status === 'TERPECAHKAN' && g.statusRantai === 'TERKUNCI');
  const terkunci = daftar.filter((g) => g.statusRantai === 'TERKUNCI');
  const denganPublik = daftar.filter((g) => g.publik);
  const terkunciDgnPublik = terkunci.filter((g) => g.publik);
  const terkunciTanpaPublik = terkunci.filter((g) => !g.publik);
  const statistik = {
    total: 160,
    terpecahkanKomunitas: daftar.filter((g) => g.status === 'TERPECAHKAN').length,
    danaMasihTerkunci: terkunci.length,
    terkunciDenganPublik: terkunciDgnPublik.length,
    terkunciTanpaPublik: terkunciTanpaPublik.length,
    daftarTerkunciDgnPublik: terkunciDgnPublik.map((g) => g.b),
    daftarTerkunciTanpaPublik: terkunciTanpaPublik.map((g) => g.b),
    anehTerpecahkanTapiAdaSaldo: aneh.map((g) => g.b),
    totalBtcTerkunci: +(terkunci.reduce((s, g) => s + g.saldoSat, 0) / 1e8).toFixed(4),
  };
  LOG('Statistik:', JSON.stringify(statistik));

  // tulis MASUKAN SERANGAN (tanpa kunci jawaban!)
  const bersih = daftar.map((g) => ({
    b: g.b, alamat: g.alamat, statusKomunitas: g.status,
    statusRantai: g.statusRantai, saldoSat: g.saldoSat,
    hadiahBtc: +(g.saldoSat / 1e8).toFixed(6),
    publik: g.publik, sumberPublik: g.sumberPublik,
  }));
  const daftarGembok = {
    skema: 'daftar-gembok-v1', waktu: new Date().toISOString(),
    sumber: {
      tracker: 'github.com/roadhero/Bitcoin-Puzzle-Info (BTC-Solved-Unsolved.txt)',
      rantai: 'mempool.space + blockstream.info (Esplora)',
      txPuzzle: TXID, blokPuzzle: tx.status.block_height,
    },
    etika: 'uji kecerdasan; nol dana digerakkan; kunci jawaban komunitas dipisah ke kunci-komunitas.json',
    statistik, gembok: bersih,
  };
  daftarGembok.segel = hash16({ g: daftarGembok.gembok, s: daftarGembok.statistik });
  fs.writeFileSync(F_UJIAN, JSON.stringify(daftarGembok, null, 1));

  // kunci jawaban komunitas (file terpisah — dilarang dibaca saat menyerang)
  const kunciKomunitas = { skema: 'kunci-komunitas-v1', waktu: daftarGembok.waktu, catatan: 'jawaban komunitas; hanya untuk verifikasi silang PASCA serangan mandiri', kunci: {} };
  for (const g of daftar) if (g.kunciTracker) kunciKomunitas.kunci[String(g.b)] = g.kunciTracker;
  kunciKomunitas.segel = hash16(kunciKomunitas.kunci);
  fs.writeFileSync(F_KUNCI, JSON.stringify(kunciKomunitas, null, 1));

  const sidik = daftar.filter((g) => [66, 71, 130, 135, 160].includes(g.b));
  for (const g of sidik) {
    LOG('  sidik #' + g.b, g.alamat.slice(0, 12) + '…', 'status=' + g.status + '/' + g.statusRantai, 'saldo=' + (g.saldoSat / 1e8).toFixed(4) + ' BTC', 'publik=' + (g.publik ? 'ADA(' + g.sumberPublik + ')' : 'TIDAK'));
  }
  LOG('SELESAI dalam ' + Math.round((Date.now() - t0) / 1000) + ' dtk →', F_UJIAN, '(' + daftarGembok.segel + ') &', F_KUNCI, '(' + kunciKomunitas.segel + ')');
}

main().catch((e) => { console.error('[panen-gembok] GAGAL:', e.message); process.exit(1); });
