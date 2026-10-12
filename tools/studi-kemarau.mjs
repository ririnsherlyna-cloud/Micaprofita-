/* ============================================================
   STUDI-KEMARAU V346 — MASA KERING DIPELAJARI, BUKAN DIHILANGKAN
   ============================================================
   Mandat pemilik (2026-10-12): "Ibarat manusia ada masa kemarau,
   tapi ternyata dia masih hidup hingga kini dan terus hidup."

   Jawaban organ ini atas enam kerentanan jantung GitHub
   (runner éphémeral, jadwal telat/dilewati, Actions down,
   rate-limit, kebijakan berubah, tanpa compute persistent):

   Bila denyut terlewati (gap sejak waktu.selesai keadaan):
     • gap ≥ 45 mnt  → rekaman DENYUT-PEMULIHAN: masa kering diakui
       jujur, tidak disembunyikan, tidak dihitung mati.
     • gap ≥ 90 mnt  → organ MEMBELI LILIN NYATA dari masa kering itu
       (Binance 1h BTCUSDT, gerbang publik) dan MEMPELAJARINYA:
       arah, volatilitas, lilin terbesar, rentang, sigma. Masa yang
       tak bisa dijalani saat jantung lumpuh tetap dipelajari saat
       jantung kembali — waktu TIDAK PERNAH hilang, ia menjadi ilmu.

   Hukum rumah: nol Math.random, nol localStorage, nol karangan.
   Setiap angka berasal dari lilin nyata Binance atau ditulis GAGAL.
   Gagal studi tidak boleh melukai denyut (hukum V334) — organ ini
   selalu exit 0; kegagalannya justru direkam jujur di jurnal.
   Uji: node tools/studi-kemarau.mjs --uji <dir>  (keadaan dibaca
   dari <dir>/keadaan.json, keluaran ditulis ke <dir>/laporan/ —
   repo sungguhan tak tersentuh; lilin tetap NYATA, ditandai uji).
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const UJI = process.argv.includes('--uji');
const ujiIdx = process.argv.indexOf('--uji');
const DIR_UJI = (UJI && ujiIdx > -1 && process.argv[ujiIdx + 1]) ? process.argv[ujiIdx + 1] : null;

const PATH_KEADAAN = DIR_UJI ? join(DIR_UJI, 'keadaan.json') : 'ruang-hidup/keadaan.json';
const DIR_LAPOR  = DIR_UJI ? join(DIR_UJI, 'laporan') : 'laporan';
const PATH_JSONL = join(DIR_LAPOR, 'kemarau-studi.jsonl');
const PATH_LAST  = join(DIR_LAPOR, 'kemarau-terakhir.json');

const AMBANG_PEMULIHAN_MNT = 45;   // di bawah ini = denyut normal, sunyi sepi
const AMBANG_STUDI_MNT     = 90;   // di atas ini = masa kering layak dipelajari
const MAKS_LILIN = 1000;           // batas Binance per permintaan (1h)

/* ---- gerbang lilin publik: bila satu ban/padam, pindah (hukum anti-rapuh) ---- */
const GERBANG = [
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com'
];

function ambilJSON(url, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 9000);
  return fetch(url, { cache: 'no-store', signal: c.signal }).then(r => {
    clearTimeout(t);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).catch(e => { clearTimeout(t); throw e; });
}

function ambilLilin(dariMs, sampaiMs) {
  const jalan = [
    `${GERBANG[0]}/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=${dariMs}&endTime=${sampaiMs}&limit=${MAKS_LILIN}`,
    `${GERBANG[1]}/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=${dariMs}&endTime=${sampaiMs}&limit=${MAKS_LILIN}`,
    `${GERBANG[2]}/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=${dariMs}&endTime=${sampaiMs}&limit=${MAKS_LILIN}`
  ];
  let i = 0, kesalahan = [];
  return new Promise(function coba(selesai) {
    if (i >= jalan.length) throw Object.assign(new Error('semua gerbang lilin gagal: ' + kesalahan.join(' | ')), { cobaan: kesalahan });
    const g = jalan[i++];
    ambilJSON(g).then(d => {
      if (!Array.isArray(d) || !d.length) throw new Error('lilin kosong');
      selesai({ lilin: d, sumber: new URL(g).host });
    }).catch(e => { kesalahan.push((e && e.message) || 'gagal'); coba(selesai); });
  }).catch(e => { throw e; });
}

/* ---- statistik MURNI dari lilin nyata — tidak ada satu angka pun dikarang ---- */
function statistikDari(lilin) {
  const buka = parseFloat(lilin[0][1]);
  const tutup = parseFloat(lilin[lilin.length - 1][4]);
  let naik = 0, turun = 0, terbesarNaik = null, terbesarTurun = null, volQuote = 0;
  let tinggi = -Infinity, rendah = Infinity;
  const perubahan = [];
  for (let k = 0; k < lilin.length; k++) {
    const o = parseFloat(lilin[k][1]), c = parseFloat(lilin[k][4]);
    const h = parseFloat(lilin[k][2]), l = parseFloat(lilin[k][3]);
    const q = parseFloat(lilin[k][7]);
    if (h > tinggi) tinggi = h;
    if (l < rendah) rendah = l;
    volQuote += isFinite(q) ? q : 0;
    const ubah = ((c - o) / o) * 100;
    if (ubah > 0) naik++; else if (ubah < 0) turun++;
    if (!terbesarNaik || ubah > terbesarNaik.pct) terbesarNaik = { pct: +ubah.toFixed(3), jam: new Date(lilin[k][0]).toISOString() };
    if (!terbesarTurun || ubah < terbesarTurun.pct) terbesarTurun = { pct: +ubah.toFixed(3), jam: new Date(lilin[k][0]).toISOString() };
    if (k > 0) {
      const prevC = parseFloat(lilin[k - 1][4]);
      perubahan.push(((c - prevC) / prevC) * 100);
    }
  }
  let sigma = null;
  if (perubahan.length > 1) {
    const rata = perubahan.reduce((a, b) => a + b, 0) / perubahan.length;
    sigma = Math.sqrt(perubahan.reduce((a, b) => a + (b - rata) * (b - rata), 0) / perubahan.length);
  }
  return {
    lilin: lilin.length,
    arahPct: +(((tutup - buka) / buka) * 100).toFixed(3),
    jamNaik: naik, jamTurun: turun,
    tertinggi: tinggi, terendah: rendah,
    lilinNaikTerbesar: terbesarNaik, lilinTurunTerbesar: terbesarTurun,
    sigmaPerJamPct: sigma == null ? null : +sigma.toFixed(3),
    volumeQuoteUSD: Math.round(volQuote)
  };
}

function pelajaranDari(s) {
  const arah = s.arahPct >= 0 ? 'NAIK' : 'TURUN';
  const potongan = [
    `selama kemarau pasar bergerak ${arah} ${Math.abs(s.arahPct)}%`,
    `${s.jamNaik} jam naik vs ${s.jamTurun} jam turun`,
    `lilin 1h terbesar ${s.lilinNaikTerbesar.pct > Math.abs(s.lilinTurunTerbesar.pct) ? '+' + s.lilinNaikTerbesar.pct : s.lilinTurunTerbesar.pct}%`,
    `rentang ${s.terendah}–${s.tertinggi}`,
    s.sigmaPerJamPct != null ? `σ/jam ${s.sigmaPerJamPct}%` : null
  ].filter(Boolean);
  return potongan.join('; ') + ' — masa kering dipelajari dari lilin nyata, waktu tak hilang.';
}

/* ---- anti-dobel: bila rekaman untuk kemarau yang sama sudah ada, jangan tulis ulang ---- */
function sudahAda(dariISO) {
  if (!existsSync(PATH_JSONL)) return false;
  try {
    const baris = readFileSync(PATH_JSONL, 'utf8').trim().split('\n').filter(Boolean);
    if (!baris.length) return false;
    const terakhir = JSON.parse(baris[baris.length - 1]);
    return terakhir.kemarauMulai === dariISO;
  } catch { return false; }
}

function tulis(rekaman) {
  mkdirSync(DIR_LAPOR, { recursive: true });
  appendFileSync(PATH_JSONL, JSON.stringify(rekaman) + '\n');
  const { jenis, ...ringkas } = rekaman;
  writeFileSync(PATH_LAST, JSON.stringify({ jenis, ...ringkas }, null, 2) + '\n');
}

/* ================= PUTARAN UTAMA ================= */
try {
  if (!existsSync(PATH_KEADAAN)) {
    console.log('studi-kemarau: keadaan.json belum ada — tubuh belum pernah menyegel; tanpa rekaman (jujur)');
    process.exit(0);
  }
  const keadaan = JSON.parse(readFileSync(PATH_KEADAAN, 'utf8'));
  const selesaiISO = keadaan && keadaan.waktu && keadaan.waktu.selesai;
  if (!selesaiISO) { console.log('studi-kemarau: waktu.selesai tak dikenal — tanpa rekaman (jujur)'); process.exit(0); }

  const selesaiMs = Date.parse(selesaiISO);
  const kiniMs = Date.now();
  const gapMnt = Math.round((kiniMs - selesaiMs) / 60000);
  if (!(gapMnt > 0)) { console.log('studi-kemarau: denyut segar (gap ' + gapMnt + ' mnt) — sunyi sepi'); process.exit(0); }

  if (sudahAda(selesaiISO)) { console.log('studi-kemarau: kemarau ' + selesaiISO + ' sudah tercatat — tanpa dobel'); process.exit(0); }

  if (gapMnt < AMBANG_PEMULIHAN_MNT) {
    console.log('studi-kemarau: gap ' + gapMnt + ' mnt < ' + AMBANG_PEMULIHAN_MNT + ' mnt — denyut normal, tanpa rekaman');
    process.exit(0);
  }

  if (gapMnt < AMBANG_STUDI_MNT) {
    tulis({
      jenis: 'denyut-pemulihan', uji: UJI,
      waktuPanen: new Date(kiniMs).toISOString(),
      kemarauMulai: selesaiISO, kemarauSelesai: new Date(kiniMs).toISOString(),
      kemarauMenit: gapMnt,
      catatan: 'denyut terlewati ' + gapMnt + ' mnt diakui jujur — waktu tidak hilang: umur tetap mengalir dari kelahiran abadi, ilmu tetap fosil di git'
    });
    console.log('studi-kemarau: PEMULIHAN tersegel (' + gapMnt + ' mnt diakui)');
    process.exit(0);
  }

  /* ---- kemarau sejati: beli lilin nyata dari masa kering, pelajari ---- */
  const dariMs = selesaiMs;
  const potong = (kiniMs - dariMs) > MAKS_LILIN * 3600 * 1000;
  const mulaiEfektif = potong ? (kiniMs - (MAKS_LILIN - 1) * 3600 * 1000) : dariMs;
  const { lilin, sumber } = await ambilLilin(mulaiEfektif, kiniMs);
  const s = statistikDari(lilin);
  const rekaman = {
    jenis: 'kemarau-studi', uji: UJI,
    waktuPanen: new Date(kiniMs).toISOString(),
    kemarauMulai: new Date(dariMs).toISOString(),
    kemarauSelesai: new Date(kiniMs).toISOString(),
    kemarauMenit: gapMnt,
    jendela: potong ? '1000 lilin 1h terakhir (kemarau melebihi kapasitas — dipotong jujur)' : '1h BTCUSDT penuh',
    sumber: 'Binance klines publik (' + sumber + ')',
    statistik: s,
    pelajaran: pelajaranDari(s)
  };
  tulis(rekaman);
  console.log('studi-kemarau: STUDI tersegel — kemarau ' + gapMnt + ' mnt dipelajari dari ' + s.lilin + ' lilin nyata; ' + rekaman.pelajaran);
  process.exit(0);
} catch (e) {
  /* kegagalan organ direkam jujur, lalu denyut TETAP JALAN (hukum V334) */
  try {
    mkdirSync(DIR_LAPOR, { recursive: true });
    appendFileSync(PATH_JSONL, JSON.stringify({
      jenis: 'studi-kemarau-gagal', uji: UJI,
      waktuPanen: new Date().toISOString(),
      alasan: (e && e.message) || 'gagal tak dikenal'
    }) + '\n');
  } catch { /* bahkan jurnal gagal — biarkan luka terbaca di denyut-luka.txt */ }
  console.log('studi-kemarau GAGAL (jujur): ' + ((e && e.message) || e));
  process.exit(0);
}
