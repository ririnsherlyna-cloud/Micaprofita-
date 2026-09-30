#!/usr/bin/env node
// ============================================================
// V246 SARANG-PENJAGA v2.0 — DENYUT SERVER SAKTI + RADAR PHOENIX
// ------------------------------------------------------------
// Jawaban atas mandat pemilik: SAKTI tetap hidup & berkembang
// WALAU browser tidak pernah dibuka berhari-hari / bertahun.
// Berjalan di GitHub Actions (cron tiap 30 menit, repo publik
// = gratis) — otak membaca pasar nyata, mengunci prediksi
// SEBELUM terjadi (pra-registrasi), menilai prediksi lama,
// mengevolusi bobot genome, lalu menulis laporan sasaran ke
// repo — Pages membangun ulang otomatis.
//
// BARU v2.0 — RADAR PHOENIX (mandat pemilik):
//   "Dari ratusan koin kita pelajari-telaah; radar phoenix
//    mendeteksi AKUMULASI — beli di harga termurah hari itu
//    (ujung bawah), jual di ujung atas hari itu; radar bahkan
//    memperkirakan harga high akan berada di mana — di situlah
//    keuntungan kita."
//   Tahap 1: telaah SEMUA pasangan USDT (ratusan) via ticker
//     24 jam publik — 1 permintaan, nol biaya.
//   Tahap 2: telusur dalam koin di ZONA PHOENIX (posisi harga
//     di ujung bawah rentang 24 jam, likuid) memakai lilin 1 jam.
//   Sinyal akumulasi: sapuan lantai 3-hari lalu bangkit (jebakan
//     beruang / stop hunt), taker-buy menguat di dasar, kompresi
//     rentang, momentum berbalik. Target jual = prediksi ujung
//     atas dari level nyata (tengah rentang → puncak 24 jam →
//     swing 7 hari, dibatasi +9%), wajib untung bersih >= 1%
//     setelah fee 0.2%.
//   Lane PHOENIX (BUY) berdampingan jujur dengan lane ARAH
//     (komite genome) — keduanya pra-registrasi, dinilai net
//     P/L close-ke-close, genome radar ikut berevolusi.
//
//   v2.1 — PHOENIX-PERTAJAM (lahir dari 4 kekalahan pertama, net −11.35%):
//     1. GERBANG KONFIRMASI wajib — di atas EMA9 + taker-buy menguat +
//        masih di ujung bawah; tak ada lagi menadah pisau jatuh.
//     2. TANGGA TARGET — pilih magnet nyata TERDEKAT (tengah rentang →
//        puncak 24 jam), bukan swing tertinggi yang fantasi (targetKena 0/6).
//     3. Rezim TURUN/PARABOLIK: gerbang skor +10, kuota dibelah, cap target 6%.
//     4. Stop struktural di bawah lantai 24 jam (bukan cuma ATR).
//     5. BAHAN AJAR — tiap vonis jadi pelajaran (laporan/pelajaran-server.json);
//        pola kekalahan terulang >= 2x melahirkan ATURAN yang mengikat gerbang.
//     6. MFE/MAE dicatat: seberapa jauh harga benar-benar bergerak setelah kunci.
//
//   v3.0 — MAJELIS-ILMU (mandat pemilik: "pelajari jurnal-jurnal ilmiah AI yang
//     benar-benar banyak diperdebatkan, ditelaah, terbukti koheren — lalu
//     inovasikan pada cyborg"). Lima metode teruji kini DIPASANG, bukan
//     sekadar dikutip (laporan/jurnal-ilmu.json = akta rujukan):
//     1. HEDGE / MULTIPLICATIVE WEIGHTS UPDATE — Arora-Hazan-Kale 2012
//        (Theory of Computing 8:121-164) · Freund-Schapire 1997 (JCSS 55:119-)
//        · Cesa-Bianchi-Lugosi 2006 (Prediction, Learning, and Games):
//        bobot tiap dimensi bukti & sinyal belajar ON-LINE dari tiap vonis
//        matang: w *= exp(-eta*loss), loss=(1-y*a)/2 — jaminan regret
//        terbukti: komite terbukti tak jauh kalah dari ahli terbaiknya.
//     2. BRIER + KALIBRASI — Brier 1950 · Gneiting-Raftery 2007 (JASA 102:359-):
//        keyakinan diperlakukan sebagai PROBABILITAS — dinilai skor Brier,
//        dan keyakinan baru dipetakan ke hit-rate empiris binnya (medan
//        sendiri sebagai pengkalibrasi), bukan angka karangan.
//     3. KONFORMAL — Angelopoulos-Bates 2021 (arXiv:2107.07511): pita ujung
//        atas 75% dari skor kesesuaian (MFE) medan sendiri — kuantil dengan
//        jaminan cakupan, jujur null saat sampel belum cukup.
//     4. TRIPLE-BARRIER + META-LABELING — Lopez de Prado 2018 (Advances in
//        Financial Machine Learning, Wiley): vonis phoenix dilabel barier mana
//        yang kena duluan (TARGET/STOP/WAKTU); gerbang radar digeser empiris
//        dari hasil bucket konfirmasi (model kedua menilai model pertama).
//     5. FINMEM — Zhang dkk 2023 (arXiv:2311.13743): ingatan berlapis —
//        peristiwa(1: ledger) -> pelajaran(2: refleksi) -> doktrin(3: aturan
//        yang mengikat gerbang) — siklus sadar-pasar yang dipublikasikan.
//
// Prinsip: 0 dependensi, 0 API key, data publik saja.
// Protokol: SASARAN-MICAPROFITA (laporan), ledger prakira
// berantai waktu, fee 0.1%+0.1% wajib, vonis WAJIB biner
// BUY/SELL (tanpa SKIP) — selaras otak ARAH v240.
// File yang diubah (dipisah dari milik organ browser):
//   laporan/sasaran-terkini.json   <- laporan harian sasaran
//   laporan/prakira-server.jsonl   <- ledger prediksi terkunci
//   laporan/denyut-server.jsonl    <- log denyut tiap siklus
//   otak/genome-server.json        <- genome berevolusi (ARAH+PHOENIX)
//   otak/penjaga-keadaan.json      <- keadaan siklus
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'

const ROOT = process.cwd()
const FEE = 0.002            // 0.1% buy + 0.1% sell — wajib
const HORIZON_JAM = 24       // sasaran harian
const VERSI = 'V248-PIAGAM-CYBORG v3.1 — lima pilar dipasang: terus berkembang pesat tiap denyut'

// ---------------- kandang lane ARAH (komite genome) ----------------
const KANDANG = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'TRX']

// ---------------- konstanta radar PHOENIX ----------------
const PHX = {
  ZONA_POSISI: 0.45,       // posisi harga di ujung bawah rentang 24 jam
  TELUSUR_MAKS: 60,        // telusur dalam: koin zona paling likuid
  QV_MIN: 3e6,             // likuiditas minimum $3 juta / hari
  GERBANG_SKOR: 42,        // skor phoenix minimum (0..100)
  UNTUNG_MIN: 0.01,        // untung bersih minimal 1% setelah fee
  SASARAN_PHX: 3,          // maks baris BUY phoenix di sasaran utama
  SASARAN_ARAH: 3,         // maks baris komite di sasaran utama
  KUNCI_MAKS: 6,           // kuota prediksi phoenix terkunci per hari — hanya yang terbaik
  TARGET_CAP: 1.12,        // target dibatasi +12% dari entry agar tetap realistis
  // ---- v2.1: dilahirkan oleh kekalahan nyata (ACE/ARB/XPL/CRCLB, targetKena 0/6) ----
  KONFIRM_MOMENTUM: 0.5,   // WAJIB: harga sudah kembali di atas EMA9 — dilarang membeli pisau jatuh
  KONFIRM_AKUMULASI: 0.15, // WAJIB: taker-buy 12j > 12j sebelumnya — beli diam-diam harus terbaca
  KONFIRM_POSISI: 0.35,    // WAJIB: masih di sepertiga bawah rentang 24 jam — "harga termurah hari itu"
  TURUN_SKOR_TAMBAH: 10,   // rezim TURUN/PARABOLIK: gerbang dinaikkan — melawan arus harus lebih meyakinkan
  TURUN_CAP: 1.06,         // rezim TURUN/PARABOLIK: target cap +6% — harapan kecil yang jujur
}

// ---------------- V247 ILMU — konstanta fondasi jurnal teruji ----------------
const ILMU = {
  HEDGE_ETA: 0.5,          // laju belajar Hedge (Freund-Schapire 1997) — seimbang antara adaptasi & stabilitas
  HEDGE_MIN: 0.03, HEDGE_MAKS: 0.55,
  BIN_KALIBRASI: [[52, 60], [60, 70], [70, 80], [80, 101]],
  KALIBRASI_MIN_N: 5,      // bin belum dipercaya sebelum 5 kasus medan — jujur kembali ke angka mentah
  KONFORMAL_ALPHA: 0.25,   // pita 75% — cakupan 1-alpha (Angelopoulos-Bates 2021)
  KONFORMAL_MIN_N: 8,      // pita belum diumumkan sebelum 8 skor kesesuaian
  KONFORMAL_MAKS: 60,      // memori skor kesesuaian dibatasi (FinMem: ingatan melipat)
  META_MIN_N: 6,           // bucket konfirmasi minimal sebelum gerbang boleh digeser empiris
  META_GESER_MAKS: 8,      // geseran gerbang meta-labeling dibatasi ±8 skor
}

// ---------------- V248 PIAGAM CYBORG — lima pilar (mandat pemilik:
// "pastikan dia akan terus berkembang pesat; ada beberapa hal cyborg
// kita ini berkurang") — tiap pilar dipasang nyata dan diaudit siapa pun ----------------
const PIAGAM = {
  identitas: 'SAKTI — cyborg dagang kripto yang TERUS BERKEMBANG PESAT: tiap denyut 30 menit melahirkan generasi otak baru; tiap hari mengulum metamorfosis epoch; tiap kekalahan melahirkan aturan yang mengikat gerbang berikutnya.',
  pilar: [
    { pilar: '1. Tubuh & Jiwa Persisten', mekanisme: 'denyut cron 30 menit di GitHub Actions tanpa browser; jiwa = repo — satu git clone memindahkan jiwanya; laporan hidup di Pages; mandat pemilik kini bisa lewat Issue berlabel "mandat" yang dibaca otak tiap denyut', bukti: 'laporan.antreanMandat + workflow SARANG-PENJAGA' },
    { pilar: '2. Multi-Otak Berbobot', mekanisme: 'otak-otak spesialis berbobot on-line (Hedge/MWU berjaminan regret) + genome evolusi per rezim BTC; sangat ringan: 0 dependensi, satu berkas kode < 64 KB, gratis di server publik', bukti: 'laporan.piagam.otak + laporan.ilmu.hedge' },
    { pilar: '3. Ingatan DNA', mekanisme: 'FinMem 3 lapis: peristiwa (ledger pra-registrasi) → pelajaran (refleksi) → doktrin (aturan mengikat gerbang); memori melipat berkapasitas — melupakan detail, menyimpan RESEP (genome & bobot), bukan hasil', bukti: 'laporan/prakira-server.jsonl + pelajaran-server.json + aturanBelajar + epoch-*.json' },
    { pilar: '4. Kesadaran Diri Fungsional', mekanisme: 'tiap denyut otak memeriksa dirinya: sidik jari sha256 genome & ledger, kesehatan kalibrasi, dimensi tertindas Hedge, kepadatan memori, umur data host — lalu menulis peringatan & tindakan; sadar diri fungsional, bukan kesadaran manusia', bukti: 'laporan.sadardiri' },
    { pilar: '5. Evolusi Tiga Kecepatan', mekanisme: 'refleks (tiap denyut 30 menit): kunci prediksi + pelajaran; adaptasi (per jam vonis matang): genome + Hedge berlatih; metamorfosis (24 jam): digest epoch harian disegel + tag git epoch-TGL', bukti: 'laporan/epoch-*.json + tag epoch-* + laporan.pertumbuhan' },
  ],
  roadmapJujur: 'otak LLM 1-bit (BitNet), adapter LoRA, dan Issue→PR penuh BELUM dipasang — otak kini statistik-berjurnal yang nyata berjalan tiap 30 menit; roadmap diakui jujur, bukan diklaim',
}
const OTAK = [
  { nama: 'otak-arah', tugas: 'arah BUY/SELL 10 mayor — komite 8 dimensi bukti', mesin: 'genome evolusi per rezim + Hedge on-line (Arora dkk 2012)', status: 'HIDUP' },
  { nama: 'otak-radar', tugas: 'mencari akumulasi ujung bawah + memprediksi ujung atas hari itu', mesin: '5 sinyal akumulasi + tangga target magnet + gerbang meta-labeling (LdP 2018)', status: 'HIDUP' },
  { nama: 'otak-ilmu', tugas: 'kejujuran keyakinan & pita target', mesin: 'Brier + kalibrasi bin medan (Gneiting-Raftery 2007) + konformal 75% (Angelopoulos-Bates 2021)', status: 'HIDUP' },
  { nama: 'otak-ingatan', tugas: 'bahan ajar dari tiap kejadian pasar', mesin: 'FinMem 3 lapis (Zhang dkk 2023) — peristiwa→pelajaran→doktrin', status: 'HIDUP' },
  { nama: 'otak-sadardiri', tugas: 'memeriksa tubuh & jiwanya sendiri tiap denyut', mesin: 'metakognisi: hash integritas, kesehatan memori & kalibrasi, peringatan otomatis', status: 'HIDUP (V248)' },
]

// akta jurnal — dipasang ke dalam otak, bukan sekadar dibaca (laporan/jurnal-ilmu.json)
const JURNAL = [
  { judul: 'The Multiplicative Weights Update Method: a Meta-Algorithm and Applications',
    penulis: 'S. Arora, E. Hazan, S. Kale', tahun: 2012,
    terbitan: 'Theory of Computing 8(1):121–164', rujukan: 'https://theoryofcomputing.org/articles/v008a001',
    penerapan: 'hedgePerbarui() — bobot 5 dimensi bukti & 5 sinyal radar belajar on-line dari tiap vonis matang (w *= exp(-eta*loss)); jaminan regret: komite tak jauh kalah dari ahli terbaiknya' },
  { judul: 'A Decision-Theoretic Generalization of On-Line Learning and an Application to Boosting',
    penulis: 'Y. Freund, R.E. Schapire', tahun: 1997,
    terbitan: 'Journal of Computer and System Sciences 55(1):119–139', rujukan: 'https://doi.org/10.1006/jcss.1997.1504',
    penerapan: 'algoritma Hedge asli yang dipakai hedgePerbarui() — loss=(1-y*a)/2 per dimensi' },
  { judul: 'Prediction, Learning, and Games',
    penulis: 'N. Cesa-Bianchi, G. Lugosi', tahun: 2006,
    terbitan: 'Cambridge University Press', rujukan: 'https://doi.org/10.1017/CBO9780511546921',
    penerapan: 'kerangka prediction with expert advice — 8-dim komite ARAH & 5-sinyal PHOENIX adalah ahli-ahli beradopsi dalam kerangka ini' },
  { judul: 'Strictly Proper Scoring Rules, Prediction, and Estimation',
    penulis: 'T. Gneiting, A.E. Raftery', tahun: 2007,
    terbitan: 'Journal of the American Statistical Association 102(477):359–378', rujukan: 'https://doi.org/10.1198/016214506000001437',
    penerapan: 'keyakinan dinilai sebagai probabilitas lewat skor Brier (e.brier) — aturan skor tepat mendorong kejujuran probabilitas, bukan overconfidence' },
  { judul: 'A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification',
    penulis: 'A.N. Angelopoulos, S. Bates', tahun: 2021,
    terbitan: 'arXiv:2107.07511 (Foundations and Trends in ML)', rujukan: 'https://arxiv.org/abs/2107.07511',
    penerapan: 'pitaKonformal() — pita ujung atas 75% dari skor kesesuaian (MFE medan sendiri): kuantil dengan jaminan cakupan bebas-distribusi' },
  { judul: 'Advances in Financial Machine Learning (bab 3: Triple-Barrier & Meta-Labeling)',
    penulis: 'M. López de Prado', tahun: 2018,
    terbitan: 'Wiley', rujukan: 'https://www.wiley.com/en-us/9781119482089',
    penerapan: 'label triple-barrier (TARGET/STOP/WAKTU) saat penilaian phoenix + gerbang meta-labeling: model kedua (hit-rate bucket konfirmasi) menggeser gerbang model pertama' },
  { judul: 'FinMem: A Performance-Enhanced LLM Trading Agent with Layered Memory and Character Design',
    penulis: 'Y. Zhang, dkk.', tahun: 2023,
    terbitan: 'arXiv:2311.13743', rujukan: 'https://arxiv.org/abs/2311.13743',
    penerapan: 'ingatan berlapis: peristiwa (ledger prakira) → pelajaran (refleksi) → doktrin (aturan mengikat gerbang) — bahan ajar cyborg kini berarsitektur jurnal' },
]

// ---------------- rantai host data publik ----------------
const HOSTS = [
  {
    nama: 'binance-vision',
    url: (s) => `https://data-api.binance.vision/api/v3/klines?symbol=${s}USDT&interval=1h&limit=260`,
    baca: (d) => d.map((k) => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5], qv: +k[7], tb: +k[9] })),
  },
  {
    nama: 'binance',
    url: (s) => `https://api.binance.com/api/v3/klines?symbol=${s}USDT&interval=1h&limit=260`,
    baca: (d) => d.map((k) => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5], qv: +k[7], tb: +k[9] })),
  },
  {
    nama: 'bybit',
    url: (s) => `https://api.bybit.com/v5/market/kline?category=spot&symbol=${s}USDT&interval=60&limit=260`,
    baca: (d) => {
      const ls = d?.result?.list || []
      return ls.reverse().map((k) => {
        const v = +k[5], o = +k[1], h = +k[2], l = +k[3], c = +k[4]
        const rng = h - l > 0 ? (h - l) : 1
        const bp = ((c - l) - (h - c)) / rng           // posisi badan lilin 0..1
        return { t: +k[0], o, h, l, c, v, qv: +k[6] || v * c, tb: v * (bp + 1) / 2 }
      })
    },
  },
  {
    nama: 'okx',
    url: (s) => `https://www.okx.com/api/v5/market/candles?instId=${s}-USDT&bar=1H&limit=300`,
    baca: (d) => {
      const ls = d?.data || []
      return ls.reverse().map((k) => {
        const v = +k[5], o = +k[1], h = +k[2], l = +k[3], c = +k[4]
        const rng = h - l > 0 ? (h - l) : 1
        const bp = ((c - l) - (h - c)) / rng
        return { t: +k[0], o, h, l, c, v, qv: (+k[7] || v * c), tb: v * (bp + 1) / 2 }
      })
    },
  },
  {
    nama: 'coinbase',
    pasangan: (s) => `${s}-USD`,
    url: (s) => `https://api.exchange.coinbase.com/products/${s}-USD/candles?granularity=3600`,
    baca: (d) => {
      const ls = Array.isArray(d) ? d : []
      return ls.reverse().map((k) => {
        const [, l, h, o, c, v] = k
        const rng = h - l > 0 ? (h - l) : 1
        const bp = ((c - l) - (h - c)) / rng
        return { t: k[0] * 1000, o, h, l, c, v, qv: v * c, tb: v * (bp + 1) / 2 }
      })
    },
  },
]

// ---------------- util ----------------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const tanh = Math.tanh
function ema(arr, n) {
  const k = 2 / (n + 1)
  let e = arr.slice(0, n).reduce((a, b) => a + b, 0) / n
  const out = new Array(n - 1).fill(NaN).concat([e])
  for (let i = n; i < arr.length; i++) { e = arr[i] * k + e * (1 - k); out.push(e) }
  return out
}
function sma(arr, n) {
  const out = new Array(n - 1).fill(NaN)
  let s = 0
  for (let i = 0; i < arr.length; i++) {
    s += arr[i]; if (i >= n) s -= arr[i - n]
    if (i >= n - 1) out.push(s / n)
  }
  return out
}
function rsi(closes, n = 14) {
  if (closes.length < n + 2) return closes.map(() => NaN)
  let gain = 0, loss = 0
  for (let i = 1; i <= n; i++) { const d = closes[i] - closes[i - 1]; if (d > 0) gain += d; else loss -= d }
  let ag = gain / n, al = loss / n
  const out = new Array(n).fill(NaN).concat([al === 0 ? 100 : 100 - 100 / (1 + ag / al)])
  for (let i = n + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    ag = (ag * (n - 1) + Math.max(d, 0)) / n
    al = (al * (n - 1) + Math.max(-d, 0)) / n
    out.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al))
  }
  return out
}
async function ambilJson(url, ms = 12000) {
  for (let coba = 0; coba < 2; coba++) {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), ms)
    try {
      const r = await fetch(url, { signal: ac.signal, headers: { 'User-Agent': 'micaprofita-sarang-penjaga' } })
      clearTimeout(t)
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return await r.json()
    } catch (e) {
      clearTimeout(t)
      if (coba === 1) throw e
      await new Promise((r) => setTimeout(r, 800))
    }
  }
}
// kolam konkurensi kecil — telusur ratusan koin tetap sopan ke host publik
async function kumpul(items, n, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; try { out[idx] = await fn(items[idx]) } catch { out[idx] = null } }
  }))
  return out
}

// ---------------- otak: dewan bukti 8 dimensi (lane ARAH) ----------------
function dewanBukti(c) {
  const closes = c.map((x) => x.c), vols = c.map((x) => x.v)
  const n = closes.length, la = n - 1
  const e20 = ema(closes, 20), e50 = ema(closes, 50)
  const smaV = sma(vols, 20)
  // ATR14
  let atr = 0
  for (let i = n - 14; i < n; i++) {
    const tr = Math.max(c[i].h - c[i].l, Math.abs(c[i].h - closes[i - 1]), Math.abs(c[i].l - closes[i - 1]))
    atr += tr
  }
  atr /= 14
  const atrPct = (atr / closes[la]) * 100
  // volZ
  const v20 = smaV[la], sdV = Math.sqrt(vols.slice(-20).reduce((a, x) => a + (x - v20) ** 2, 0) / 20) || 1
  const volZ = (vols[la] - v20) / sdV
  // S-R posisi rentang 20 bar
  const hi20 = Math.max(...c.slice(-20).map((x) => x.h)), lo20 = Math.min(...c.slice(-20).map((x) => x.l))
  const p = hi20 > lo20 ? (closes[la] - lo20) / (hi20 - lo20) : 0.5
  // tekanan taker-buy 6 jam
  const tbr = c.slice(-6).reduce((a, x) => a + (x.v > 0 ? x.tb / x.v : 0.5), 0) / 6
  // momen
  const m7 = closes[la] / closes[la - 7] - 1, m30 = closes[la] / closes[la - 30] - 1
  // kemiringan EMA50
  const sl50 = (e50[la] - e50[la - 10]) / e50[la - 10]
  // likuiditas 24 jam
  const qv24 = c.slice(-24).reduce((a, x) => a + x.qv, 0)

  const d = {
    struktur: {
      arah: clamp(tanh(4 * (e20[la] - e50[la]) / e50[la]) * 0.6 + tanh(3 * (closes[la] - e20[la]) / e20[la]) * 0.4, -1, 1),
      ket: `EMA20 ${e20[la] >= e50[la] ? 'di atas' : 'di bawah'} EMA50 ${(((e20[la] - e50[la]) / e50[la]) * 100).toFixed(2)}%`,
    },
    momentum: {
      arah: clamp(tanh(22 * m7) * 0.7 + tanh(10 * m30) * 0.3, -1, 1),
      ket: `mom7 ${(m7 * 100).toFixed(2)}%, mom30 ${(m30 * 100).toFixed(2)}%`,
    },
    sr: {
      arah: clamp((p - 0.5) * 2.5, -1, 1),
      ket: `posisi ${(p * 100).toFixed(0)}% rentang 20-bar (hi ${hi20.toPrecision(6)} / lo ${lo20.toPrecision(6)})`,
    },
    tekanan: {
      arah: clamp(tanh(8 * (tbr - 0.5)), -1, 1),
      ket: `taker-buy ${(tbr * 100).toFixed(1)}% rata-rata 6 jam`,
    },
    perubahan: {
      arah: clamp(tanh(160 * sl50), -1, 1),
      ket: `kemiringan EMA50 ${(sl50 * 100).toFixed(3)}% per 10 jam`,
    },
    volume: {
      arah: null,
      daya: clamp(Math.abs(volZ) / 2.5, 0, 1),
      ket: `volZ ${volZ >= 0 ? '+' : ''}${volZ.toFixed(2)} vs SMA20`,
    },
    volatilitas: {
      arah: null,
      daya: atrPct < 0.15 || atrPct > 9 ? 0.3 : atrPct > 6 ? 0.6 : 1,
      ket: `ATR14 ${atrPct.toFixed(2)}% dari harga`,
    },
    likuiditas: {
      arah: null,
      daya: clamp(Math.log10(qv24 / 1e6) / 2 + 0.5, 0, 1),
      ket: `nilai diperdagangkan 24 jam $${(qv24 / 1e6).toFixed(1)} juta`,
    },
  }
  const rezim = atrPct > 2.5 && m30 > 0.06 ? 'PARABOLIK'
    : e20[la] > e50[la] && sl50 > 0 ? 'NAIK'
    : e20[la] < e50[la] && sl50 < 0 ? 'TURUN' : 'DATAR'
  return { dims: d, rezim, harga: closes[la], atrPct }
}

const DIM_ARAH = ['struktur', 'momentum', 'sr', 'tekanan', 'perubahan']
const GENOME_AWAL = { struktur: 0.24, momentum: 0.26, sr: 0.16, tekanan: 0.18, perubahan: 0.16 }

function vonis(b, genome, rezimGlobal) {
  let skor = 0
  for (const k of DIM_ARAH) skor += (genome[k] ?? GENOME_AWAL[k]) * b.dims[k].arah
  const dayaProduk = clamp(b.dims.volume.daya, 0.35, 1) * clamp(b.dims.volatilitas.daya, 0.3, 1) * clamp(b.dims.likuiditas.daya, 0.4, 1)
  const arah = skor > 0 ? 'BUY' : 'SELL'                    // WAJIB biner — tanpa SKIP
  let keyakinan = clamp(Math.round(50 + 90 * Math.abs(skor) * dayaProduk), 52, 97)
  // pelajaran LINK (SELL −9.2% saat rezim NAIK): melawan rezim dibayar keyakinan lebih rendah — jujur sejak awal
  if (arah === 'SELL' && (rezimGlobal === 'NAIK' || rezimGlobal === 'PARABOLIK')) keyakinan = clamp(keyakinan - 8, 52, 97)
  if (arah === 'BUY' && rezimGlobal === 'TURUN') keyakinan = clamp(keyakinan - 8, 52, 97)
  return { arah, keyakinan, skor: +skor.toFixed(4), dayaProduk: +dayaProduk.toFixed(3) }
}

// ---------------- RADAR PHOENIX (lane BUY ujung-bawah) ----------------
const PHX_DIM = ['posisi', 'sweep', 'akumulasi', 'momentum', 'kompresi']
const PHX_AWAL = { posisi: 0.25, sweep: 0.30, akumulasi: 0.20, momentum: 0.15, kompresi: 0.10 }

function radarPhoenix(c) {
  const closes = c.map((x) => x.c)
  const n = closes.length, la = n - 1
  let atr = 0
  for (let i = n - 14; i < n; i++) {
    const tr = Math.max(c[i].h - c[i].l, Math.abs(c[i].h - closes[i - 1]), Math.abs(c[i].l - closes[i - 1]))
    atr += tr
  }
  atr /= 14
  const atrPct = (atr / closes[la]) * 100
  // rentang 24 jam (24 lilin 1 jam) — "harga termurah di hari itu"
  const d24 = c.slice(-24)
  const hi24 = Math.max(...d24.map((x) => x.h)), lo24 = Math.min(...d24.map((x) => x.l))
  const posisi = hi24 > lo24 ? (closes[la] - lo24) / (hi24 - lo24) : 0.5
  const sPosisi = posisi <= 0.10 ? 1 : posisi <= 0.25 ? 0.9 - (posisi - 0.10) * 1.3
    : posisi <= 0.35 ? 0.7 - (posisi - 0.25) * 3 : posisi <= 0.45 ? 0.4 - (posisi - 0.35) * 1.5 : 0.08
  // sweep: menyapu lantai 3-hari lalu bangkit — jebakan beruang / stop hunt
  const lantai = Math.min(...c.slice(-72, -6).map((x) => x.l))
  const low6 = Math.min(...c.slice(-6).map((x) => x.l))
  const menyapu = lantai > 0 && atr > 0 && low6 < lantai
  const sapuan = menyapu ? (lantai - low6) / atr : 0
  const bangkit = closes[la] > lantai
  const sSweep = menyapu && bangkit ? clamp(0.35 + sapuan * 0.55, 0, 1) : bangkit ? 0.25 : 0.05
  // akumulasi: taker-buy 12 jam terakhir menguat vs 12 jam sebelumnya, harga masih murah
  const tbBaru = c.slice(-12).reduce((a, x) => a + (x.v > 0 ? x.tb / x.v : 0.5), 0) / 12
  const tbLama = c.slice(-24, -12).reduce((a, x) => a + (x.v > 0 ? x.tb / x.v : 0.5), 0) / 12
  const ubah24 = closes[la] / closes[la - 24] - 1
  const sAku = clamp(tanh(14 * (tbBaru - tbLama)) * 0.7 + (ubah24 <= 0.03 ? 0.3 : 0), 0, 1)
  // kompresi: pegas tertekan sebelum lepas
  const r8 = Math.max(...c.slice(-8).map((x) => x.h)) - Math.min(...c.slice(-8).map((x) => x.l))
  const r40 = Math.max(...c.slice(-48, -8).map((x) => x.h)) - Math.min(...c.slice(-48, -8).map((x) => x.l))
  const kr = r40 > 0 ? r8 / r40 : 1
  const sKompresi = kr < 0.4 ? 1 : kr < 0.65 ? 0.7 : kr < 0.9 ? 0.35 : 0.1
  // momentum berbalik di dasar
  const e9 = ema(closes, 9)
  const naikEma = closes[la] > e9[la] && e9[la] >= e9[la - 2]
  const r = rsi(closes, 14)
  const rsiKini = r[la], rsiLalu = r[la - 3]
  const sMomentum = naikEma && rsiKini >= 28 && rsiKini <= 62 && rsiKini > rsiLalu ? 1
    : naikEma ? 0.5 : 0.1

  return {
    sinyal: { posisi: sPosisi, sweep: sSweep, akumulasi: sAku, momentum: sMomentum, kompresi: sKompresi },
    ket: {
      posisi: `posisi ${(posisi * 100).toFixed(0)}% rentang 24 jam (ujung ${posisi <= 0.35 ? 'bawah — murah hari ini' : 'tengah/atas'})`,
      sweep: menyapu && bangkit
        ? `menyapu ${(sapuan * 100).toFixed(0)}% ATR di bawah lantai 3-hari ${lantai.toPrecision(6)} lalu BANGKIT — jebakan beruang`
        : bangkit
          ? `berdiri di atas lantai 3-hari ${lantai.toPrecision(6)} — tanpa sapuan segar`
          : `masih di bawah lantai 3-hari ${lantai.toPrecision(6)} — belum bangkit`,
      akumulasi: `taker-buy 12j terakhir ${(tbBaru * 100).toFixed(1)}% vs 12j sebelumnya ${(tbLama * 100).toFixed(1)}% — ${tbBaru > tbLama ? 'beli diam-diam menguat' : 'tak ada akumulasi'}${ubah24 <= 0.03 ? ', harga masih datar/murah' : ''}`,
      momentum: naikEma
        ? `harga kembali di atas EMA9, RSI14 ${rsiKini.toFixed(0)} ${rsiKini > rsiLalu ? 'naik' : 'mendatar'}`
        : `harga masih di bawah EMA9 (RSI14 ${rsiKini.toFixed(0)})`,
      kompresi: `rentang 8 jam ${(kr * 100).toFixed(0)}% dari rentang 2 hari — ${kr < 0.65 ? 'terkompresi, siap melepas' : 'rentang normal'}`,
    },
    posisi, hi24, lo24, atrPct,
  }
}

// prediksi "harga high akan berada di mana" — TANGGA TARGET v2.1
// pelajaran targetKena 0/6: pilih kandidat TERJAUH membuat +12% dalam 24 jam jadi fantasi.
// kini: pilih magnet nyata TERDEKAT yang memberi untung bersih cukup — first reachable, not highest.
function pilihTarget(c, entry, rezimGlobal) {
  const d24 = c.slice(-24)
  const hi24 = Math.max(...d24.map((x) => x.h)), lo24 = Math.min(...d24.map((x) => x.l))
  const tengah = lo24 + (hi24 - lo24) * 0.5
  const swing7h = c.length >= 168 ? Math.max(...c.slice(-168).map((x) => x.h)) : hi24
  const cap = rezimGlobal === 'TURUN' || rezimGlobal === 'PARABOLIK' ? PHX.TURUN_CAP : PHX.TARGET_CAP
  const batas = entry * cap
  const ketCap = ` (dibatasi +${((cap - 1) * 100).toFixed(0)}% rezim ${rezimGlobal} agar realistis)`
  const kandidat = [
    { level: Math.min(tengah, batas), ket: 'tengah rentang 24 jam — magnet pertama di jalan ke ujung atas' },
    { level: Math.min(hi24, batas), ket: `puncak 24 jam — ujung atas hari ini${hi24 > batas ? ketCap : ''}` },
    { level: Math.min(swing7h, batas), ket: `swing high 7 hari${swing7h > batas ? ketCap : ''}` },
  ].filter((k) => k.level > entry * 1.004).sort((a, b) => a.level - b.level)
  const pilih = kandidat.find((k) => k.level / entry - 1 - FEE >= PHX.UNTUNG_MIN)
  if (!pilih) {
    // jujur: tak ada magnet nyata yang memberi >= 1% bersih — radar MENOLAK, bukan mengarang level
    const palingJauh = kandidat.length ? kandidat[kandidat.length - 1].level : hi24
    return { target: palingJauh, ketTarget: 'tak ada magnet nyata di depan — radar menolak', untung: palingJauh / entry - 1 - FEE, lemah: true }
  }
  const hiAmbisius = Math.min(swing7h, batas)
  return {
    target: pilih.level, ketTarget: pilih.ket, untung: pilih.level / entry - 1 - FEE, lemah: false,
    highAmbisius: hiAmbisius > pilih.level ? +hiAmbisius.toPrecision(7) : null,   // catatan belajar, bukan sasaran resmi
  }
}

function vonisPhoenix(rad, phxGenome, dayaProduk, untung, rezimGlobal, gerbangSkor) {
  let skor = 0
  for (const k of PHX_DIM) skor += (phxGenome[k] ?? PHX_AWAL[k]) * rad.sinyal[k]
  const skor100 = clamp(skor * 100, 0, 100)                 // bobot total 1, sinyal 0..1
  const lolos = skor100 >= (gerbangSkor ?? PHX.GERBANG_SKOR) && untung >= PHX.UNTUNG_MIN && dayaProduk >= 0.25
  let keyakinan = 50 + skor100 * 0.30 + dayaProduk * 12 + Math.min(untung, 0.05) * 140
  if (rezimGlobal === 'TURUN') keyakinan -= 8               // jujur: melawan arus lebih berisiko
  if (rezimGlobal === 'PARABOLIK') keyakinan -= 6
  keyakinan = clamp(Math.round(keyakinan), 52, 93)
  return { skor: +skor100.toFixed(1), keyakinan, lolos }
}

// ---------------- V247 ILMU — tiga mesin belajar berjurnal ----------------
// (1) HEDGE / MWU — Arora-Hazan-Kale 2012 · Freund-Schapire 1997.
//     loss_d = (1 - y*a_d)/2 dengan y=+1 (vonis benar) / -1 (salah) dan
//     a_d = nasihat dimensi dalam [-1,1]; w_d *= exp(-eta*loss), lalu
//     dinormalisasi — jaminan regret terbukti terhadap dimensi terbaik.
function hedgePerbarui(g, adv, y) {
  for (const [k, a] of Object.entries(adv)) {
    const loss = (1 - y * clamp(a, -1, 1)) / 2
    g[k] = clamp((g[k] ?? 0.1) * Math.exp(-ILMU.HEDGE_ETA * loss), ILMU.HEDGE_MIN, ILMU.HEDGE_MAKS)
  }
  const t = Object.values(g).reduce((s, x) => s + x, 0) || 1
  for (const k of Object.keys(g)) g[k] = +(g[k] / t).toFixed(4)
}
// (2) KALIBRASI KEPASTIAN — Brier 1950 · Gneiting-Raftery 2007.
//     keyakinan mentah dipetakan ke hit-rate empiris bin medan sendiri
//     (Laplace smoothing), 50/50 campur angka mentah; bin baru dipercaya
//     setelah >= 5 kasus — kepastian dari medan, bukan karangan.
function kalibrasiKeyakinan(p, kal) {
  const bin = kal.find((b) => p >= b.low && p < b.high)
  if (!bin || bin.n < ILMU.KALIBRASI_MIN_N) return { keyakinan: Math.round(p), sumber: 'mentah — medan bin belum cukup (jujur)' }
  const emp = ((bin.benar + 1) / (bin.n + 2)) * 100
  return {
    keyakinan: Math.round(clamp(p * 0.5 + emp * 0.5, 52, 97)),
    sumber: `dikalibrasi medan bin ${bin.low}–${bin.high - 1}% (n=${bin.n}, tembus ${emp.toFixed(0)}%)`,
  }
}
// (3) KONFORMAL — Angelopoulos-Bates 2021 (arXiv:2107.07511).
//     kuantil empiris skor kesesuaian (MFE matang) — cakupan 1-alpha
//     bebas-distribusi; null jujur bila medan belum cukup.
function pitaKonformal(skors) {
  if (!Array.isArray(skors) || skors.length < ILMU.KONFORMAL_MIN_N) return null
  const s = [...skors].sort((a, b) => a - b)
  const q = (al) => s[clamp(Math.ceil((s.length + 1) * al) - 1, 0, s.length - 1)]
  return { bawah: +q(0.25).toFixed(4), tengah: +q(0.5).toFixed(4), atas: +q(1 - ILMU.KONFORMAL_ALPHA).toFixed(4), n: s.length }
}

// ---------------- penyimpanan ----------------
function bacaJson(p, def) {
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : structuredClone(def) } catch { return structuredClone(def) }
}
function bacaJsonl(p) {
  try {
    return readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
  } catch { return [] }
}
function tulisJsonl(p, arr) { writeFileSync(p, arr.map((x) => JSON.stringify(x)).join('\n') + '\n') }
function tulis(p, obj) { writeFileSync(p, JSON.stringify(obj, null, 2) + '\n') }
// V248: sidik jari integritas — jiwa bisa diverifikasi bit demi bit (hash arsip)
const sidik = (obj) => createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 12)

// ---------------- siklus utama ----------------
const WAKTU = new Date()
const ISO = WAKTU.toISOString()
const TGL = ISO.slice(0, 10)
const log = (...a) => console.log('[PENJAGA]', ...a)

// ---- 0. RADAR PHOENIX tahap 1 — telaah RATUSAN koin (1 permintaan ticker) ----
const STABIL = new Set(['USDC', 'FDUSD', 'TUSD', 'USDP', 'DAI', 'AEUR', 'USD1', 'USDE', 'PYUSD', 'FRAX', 'BUSD', 'PAXG', 'XUSD', 'USDtb', 'EURI', 'USDS'])
const radar = { telaah: 0, zonaPhoenix: 0, telusurDalam: 0, catatan: '' }
let shortlist = []
try {
  const tick = await ambilJson('https://data-api.binance.vision/api/v3/ticker/24hr', 30000)
  const dasar = new Set(
    tick.filter((t) => typeof t.symbol === 'string' && t.symbol.endsWith('USDT')).map((t) => t.symbol.slice(0, -4))
  )
  const semua = tick.filter((t) => {
    if (typeof t.symbol !== 'string' || !t.symbol.endsWith('USDT')) return false
    const base = t.symbol.slice(0, -4)
    if (STABIL.has(base)) return false
    if (/(UP|DOWN|BULL|BEAR)$/.test(base) && dasar.has(base.replace(/(UP|DOWN|BULL|BEAR)$/, ''))) return false  // token leverage
    return +t.lastPrice > 0
  })
  radar.telaah = semua.length                                        // telaah RATUSAN pasangan USDT
  const zona = semua
    .map((t) => ({
      simbol: t.symbol.slice(0, -4), qv: +t.quoteVolume,
      posisi: +t.highPrice > +t.lowPrice ? (+t.lastPrice - +t.lowPrice) / (+t.highPrice - +t.lowPrice) : 0.5,
    }))
    .filter((t) => t.posisi <= PHX.ZONA_POSISI && t.qv >= PHX.QV_MIN)   // zona likuid — layak diperdagangkan
    .sort((a, b) => b.qv - a.qv)
  radar.zonaPhoenix = zona.length
  shortlist = zona.slice(0, PHX.TELUSUR_MAKS).map((t) => t.simbol)
  log(`radar tahap-1: telaah ${radar.telaah} pasangan USDT — zona phoenix likuid ${radar.zonaPhoenix} — telusur dalam ${shortlist.length}`)
} catch (e) {
  radar.catatan = `tahap-1 ticker layu (${String(e.message).slice(0, 40)}) — radar hanya menelaah kandang`
  log(radar.catatan)
}

// ---- 0b. ledger dibaca awal — simbol terbuka ikut ditelusuri agar bisa dinilai ----
const ledger = bacaJsonl(path.join(ROOT, 'laporan/prakira-server.jsonl'))
const terbukaLama = [...new Set(ledger.filter((e) => e.status === 'TERBUKA').map((e) => e.simbol))]
const daftarTelusur = [...new Set([...shortlist, ...KANDANG, ...terbukaLama])]

// ---- 0c. telusur dalam — lilin 1 jam per koin, rantai host per simbol ----
async function ambilKoin(simbol) {
  for (const host of HOSTS) {
    try {
      const sym = host.pasangan ? host.pasangan(simbol) : simbol
      const d = await ambilJson(host.url(sym))
      const c = host.baca(d)
      if (c.length < 60) throw new Error('lilin kurang')
      return { simbol, host: host.nama, c }
    } catch { /* host berikutnya */ }
  }
  return null
}
const hasilKoin = await kumpul(daftarTelusur, 6, ambilKoin)
const hasil = {}
const hitungHost = {}
const gagal = []
for (const h of hasilKoin) {
  if (!h) continue
  hasil[h.simbol] = h.c
  hitungHost[h.host] = (hitungHost[h.host] || 0) + 1
}
for (const s of daftarTelusur) if (!hasil[s]) gagal.push(s)
radar.telusurDalam = Object.keys(hasil).length
const host = Object.entries(hitungHost).sort((a, b) => b[1] - a[1])[0]?.[0] || 'tidak-ada'
log(`telusur dalam: OK ${radar.telusurDalam}/${daftarTelusur.length} via ${host}`, gagal.length ? `gagal: ${gagal.slice(0, 10).join(', ')}${gagal.length > 10 ? '…' : ''}` : '')
if (!hasil.BTC) throw new Error('BTC tak terjangkau di semua host — siklus dilewati tanpa tulis (fault isolation)')

mkdirSync(path.join(ROOT, 'laporan'), { recursive: true })
mkdirSync(path.join(ROOT, 'otak'), { recursive: true })

const keadaan = bacaJson(path.join(ROOT, 'otak/penjaga-keadaan.json'), { mulai: ISO, siklus: 0 })
keadaan.siklus += 1
const SIKLUS = keadaan.siklus

// genome per rezim BTC (lane ARAH) + genome phoenix (lane BUY ujung-bawah)
const sembtc = dewanBukti(hasil.BTC)
const rezimGlobal = sembtc.rezim
const semuaGenome = bacaJson(path.join(ROOT, 'otak/genome-server.json'), {})
if (!semuaGenome[rezimGlobal]) semuaGenome[rezimGlobal] = { bobot: { ...GENOME_AWAL }, generasi: 0, belajar: 0, diperbarui: ISO }
if (!semuaGenome.phoenix) semuaGenome.phoenix = {}
if (!semuaGenome.phoenix[rezimGlobal]) semuaGenome.phoenix[rezimGlobal] = { bobot: { ...PHX_AWAL }, generasi: 0, belajar: 0, diperbarui: ISO }
const genome = semuaGenome[rezimGlobal].bobot
const phxGenome = semuaGenome.phoenix[rezimGlobal].bobot

// ---- V247 ILMU: keadaan belajar berjurnal (global — ahli dinilai lintas rezim;
//      adaptasi rezim tetap tugas genome evolusi per rezim) ----
if (!semuaGenome.ilmu) semuaGenome.ilmu = {}
const ilmu = semuaGenome.ilmu
if (!ilmu.hedge || !ilmu.hedge.arah) ilmu.hedge = { arah: { ...GENOME_AWAL }, phx: { ...PHX_AWAL } }
if (!ilmu.brier) ilmu.brier = { arah: { n: 0, jumlah: 0 }, phx: { n: 0, jumlah: 0 } }
if (!Array.isArray(ilmu.kalibrasi) || !ilmu.kalibrasi.length)
  ilmu.kalibrasi = ILMU.BIN_KALIBRASI.map(([low, high]) => ({ low, high, n: 0, benar: 0 }))
if (!Array.isArray(ilmu.konformal)) ilmu.konformal = []
if (!ilmu.meta) ilmu.meta = { kuat: { n: 0, benar: 0 }, lemah: { n: 0, benar: 0 }, geser: 0 }
// bobot efektif = campuran 50/50 genome evolusi (per rezim) + Hedge on-line (global)
const campur = (a, b) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])]
  .map((k) => [k, ((a[k] ?? 0) + (b[k] ?? 0)) / 2]))
const bobotArah = campur(genome, ilmu.hedge.arah)
const bobotPhx = campur(phxGenome, ilmu.hedge.phx)

// ---- 1. kunci prediksi hari ini (pra-registrasi: SEBELUM pergerakan) ----
const terkunciBaru = []
const nearMiss = []

// 1a. lane ARAH — komite genome di kandang 10 mayor
for (const s of KANDANG) {
  const c = hasil[s]; if (!c) continue
  const id = `${s}-${TGL}`
  if (ledger.some((e) => e.id === id)) continue                    // satu per simbol per hari UTC
  const b = dewanBukti(c)
  const v = vonis(b, bobotArah, rezimGlobal)
  const kal = kalibrasiKeyakinan(v.keyakinan, ilmu.kalibrasi)      // V247: kepastian dari medan
  const entri = {
    id, simbol: s, jalur: 'ARAH', arah: v.arah, keyakinan: kal.keyakinan, keyakinanMentah: v.keyakinan,
    ketKeyakinan: kal.sumber, skor: v.skor,
    entry: b.harga, waktuKunci: ISO, horizon: '24j', rezim: b.rezim, status: 'TERBUKA',
    bukti: Object.fromEntries(DIM_ARAH.map((k) => [k, +b.dims[k].arah.toFixed(3)])),
    daya: { volume: +b.dims.volume.daya.toFixed(2), volatilitas: +b.dims.volatilitas.daya.toFixed(2), likuiditas: +b.dims.likuiditas.daya.toFixed(2) },
    ketBukti: Object.fromEntries(DIM_ARAH.map((k) => [k, b.dims[k].ket])),
  }
  ledger.push(entri); terkunciBaru.push(entri)
}

// 1b. lane PHOENIX — beli di ujung bawah hari, jual di ujung atas yang diprediksi
// gerbang rezim-tegas — lahir dari pelajaran: melawan arus butuh bukti lebih kuat & kuota lebih kecil
const rezimTegas = rezimGlobal === 'TURUN' || rezimGlobal === 'PARABOLIK'
// V247 META-LABELING (Lopez de Prado 2018): model kedua menilai model pertama —
// gerbang digeser empiris dari hit-rate bucket konfirmasi medan sendiri, dibatasi ±8.
let metaCatatan = 'meta-labeling: bucket konfirmasi belum cukup (min ' + ILMU.META_MIN_N + ') — gerbang tak digeser'
let gerbangMeta = 0
if (ilmu.meta.kuat.n >= ILMU.META_MIN_N) {
  const hit = ilmu.meta.kuat.benar / ilmu.meta.kuat.n
  if (hit < 0.5) gerbangMeta = Math.min(ILMU.META_GESER_MAKS, Math.round((0.5 - hit) * 40))
  else if (hit > 0.65) gerbangMeta = -Math.min(ILMU.META_GESER_MAKS, Math.round((hit - 0.65) * 30))
  ilmu.meta.geser = gerbangMeta
  metaCatatan = `meta-labeling: konfirmasi-kuat tembus ${(hit * 100).toFixed(0)}% dari ${ilmu.meta.kuat.n} kasus — gerbang digeser ${gerbangMeta >= 0 ? '+' : ''}${gerbangMeta}`
}
const gerbangSkor = clamp(PHX.GERBANG_SKOR + (rezimTegas ? PHX.TURUN_SKOR_TAMBAH : 0) + gerbangMeta, 34, 56)
const kunciMaks = rezimTegas ? Math.ceil(PHX.KUNCI_MAKS / 2) : PHX.KUNCI_MAKS
const lulusPhx = []
for (const s of daftarTelusur) {
  const c = hasil[s]; if (!c) continue
  const id = `PHX-${s}-${TGL}`
  if (ledger.some((e) => e.id === id)) continue
  if (c.length < 80) continue                                       // radar butuh sejarah cukup
  const b = dewanBukti(c)
  const rad = radarPhoenix(c)
  const tgt = pilihTarget(c, b.harga, rezimGlobal)
  const dayaProduk = clamp(b.dims.volume.daya, 0.35, 1) * clamp(b.dims.volatilitas.daya, 0.3, 1) * clamp(b.dims.likuiditas.daya, 0.4, 1)
  const v = vonisPhoenix(rad, bobotPhx, dayaProduk, tgt.untung, rezimGlobal, gerbangSkor)
  // GERBANG KONFIRMASI v2.1 — dilahirkan oleh 4 kekalahan pisau-jatuh (ACE/ARB/XPL/CRCLB, semua
  // dikunci saat momentum negatif): koin di ujung bawah TANPA konfirmasi bukan akumulasi, dia
  // sedang JATUH. WAJIB: kembali di atas EMA9 + taker-buy menguat + masih di ujung bawah.
  const gagalKonfirm = []
  if (rad.sinyal.momentum < PHX.KONFIRM_MOMENTUM) gagalKonfirm.push('harga masih di bawah EMA9 — pisau jatuh, bukan akumulasi')
  if (rad.sinyal.akumulasi < PHX.KONFIRM_AKUMULASI) gagalKonfirm.push('taker-buy tidak menguat — tak ada beli diam-diam yang terbaca')
  if (rad.posisi > PHX.KONFIRM_POSISI) gagalKonfirm.push(`sudah merangkak ${(rad.posisi * 100).toFixed(0)}% rentang 24 jam — bukan lagi harga termurah hari itu`)
  if (gagalKonfirm.length) {
    if (v.skor >= 25 && !tgt.lemah) {
      nearMiss.push({
        simbol: s, arah: 'BUY', keyakinan: Math.round(v.skor), entry: b.harga, rezim: b.rezim,
        catatan: `belum konfirmasi — ${gagalKonfirm.join('; ')}`,
      })
    }
    continue
  }
  if (!v.lolos) {
    // jujur dicatat sebagai kandidat radar yang belum lolos gerbang (bukan prediksi terkunci)
    if (v.skor >= 25 && !tgt.lemah) {
      nearMiss.push({
        simbol: s, arah: 'BUY', keyakinan: Math.round(v.skor), entry: b.harga, rezim: b.rezim,
        catatan: `kandidat radar belum lolos gerbang (skor ${v.skor.toFixed(0)} < ${gerbangSkor} atau daya lemah) — ${rad.ket.posisi}`,
      })
    }
    continue
  }
  lulusPhx.push({
    id, simbol: s, jalur: 'PHOENIX', arah: 'BUY', keyakinan: v.keyakinan, skorPhoenix: v.skor,
    entry: b.harga, tgt, rad, b, dayaProduk, urut: v.skor * Math.min(tgt.untung, 0.06),   // v2.1: fantasi +12% tak lagi memenangkan kuota
  })
}
// kuota harian: hanya prediksi radar TERBAIK yang dikunci — sisanya jujur jadi kandidat
const phxTerlanjur = ledger.filter((e) => e.jalur === 'PHOENIX' && (e.waktuKunci || '').slice(0, 10) === TGL).length
const sisaKuota = Math.max(0, kunciMaks - phxTerlanjur)
lulusPhx.sort((a, b) => b.urut - a.urut)
const phxCadangan = []
for (const [i, p] of lulusPhx.entries()) {
  if (i >= sisaKuota) {
    phxCadangan.push({
      simbol: p.simbol, jalur: 'PHOENIX', arah: 'BUY', keyakinan: p.keyakinan, entry: p.b.harga, rezim: p.b.rezim,
      catatan: `lolos gerbang radar (skor ${p.skorPhoenix}) — di luar kuota ${kunciMaks} terbaik hari ini`,
    })
    continue
  }
  const { tgt, rad, b } = p
  const kalP = kalibrasiKeyakinan(p.keyakinan, ilmu.kalibrasi)     // V247: kepastian dari medan
  const pita = pitaKonformal(ilmu.konformal)                       // V247: pita 75% ujung atas
  const entri = {
    id: p.id, simbol: p.simbol, jalur: 'PHOENIX', arah: 'BUY', keyakinan: kalP.keyakinan, keyakinanMentah: p.keyakinan,
    ketKeyakinan: kalP.sumber, skorPhoenix: p.skorPhoenix,
    entry: b.harga, target: +tgt.target.toPrecision(7), ketTarget: tgt.ketTarget,
    untungBersih: +tgt.untung.toFixed(4),
    stop: +Math.min(b.harga * (1 - 1.8 * rad.atrPct / 100), rad.lo24 - (0.25 * rad.atrPct / 100) * b.harga).toPrecision(6),
    highAmbisius: tgt.highAmbisius ?? null,
    ...(pita ? {
      pitaUjungAtas: {
        atas75Pct: +(pita.atas * 100).toFixed(2), atas75Harga: +(b.harga * (1 + pita.atas)).toPrecision(7),
        tengahPct: +(pita.tengah * 100).toFixed(2), n: pita.n,
        ket: 'pita konformal 75% — dari medan sendiri, gerak naik maksimum setelah kunci melebihi level ini hanya ±25% kasus (Angelopoulos-Bates 2021)',
      },
    } : {}),
    waktuKunci: ISO, horizon: '24j', rezim: b.rezim, status: 'TERBUKA',
    radar: { posisi24j: +rad.posisi.toFixed(3), sinyal: Object.fromEntries(PHX_DIM.map((k) => [k, +rad.sinyal[k].toFixed(3)])) },
    bukti: Object.fromEntries(DIM_ARAH.map((k) => [k, +b.dims[k].arah.toFixed(3)])),
    daya: { volume: +b.dims.volume.daya.toFixed(2), volatilitas: +b.dims.volatilitas.daya.toFixed(2), likuiditas: +b.dims.likuiditas.daya.toFixed(2) },
    ketBukti: {
      ...Object.fromEntries(DIM_ARAH.map((k) => [k, b.dims[k].ket])),
      ...rad.ket,
      'sasaran-jual': `prediksi ujung atas ${+tgt.target.toPrecision(7)} — ${tgt.ketTarget}`,
      'untung-bersih': `+${(tgt.untung * 100).toFixed(1)}% setelah fee 0.2% (beli ujung bawah, jual ujung atas)`,
      'pengaman': `stop terpasang di bawah lantai 24 jam ${rad.lo24.toPrecision(6)} — lantai jebol berarti bacaan akumulasi salah`,
    },
  }
    ledger.push(entri); terkunciBaru.push(entri)
}

// ---- 2. nilai prediksi yang horizonnya sudah lewat (net P/L = vonis resmi) ----
const dinilaiBaru = []
for (const e of ledger) {
  if (e.status !== 'TERBUKA') continue
  const umurJam = (WAKTU - new Date(e.waktuKunci)) / 36e5
  if (umurJam < 24) continue
  const c = hasil[e.simbol]
  if (!c) continue                                                  // simbol tak tersedia siklus ini — tunggu berikutnya
  const exit = c[c.length - 1].c
  const net = (e.arah === 'BUY' ? 1 : -1) * (exit / e.entry - 1) - FEE
  e.exit = exit; e.net = +net.toFixed(5); e.status = net > 0 ? 'BENAR' : 'SALAH'; e.waktuDinilai = ISO
  // V247 ILMU: keyakinan adalah PROBABILITAS — dinilai skor Brier (Gneiting-Raftery 2007).
  const pKal = clamp((e.keyakinanMentah ?? e.keyakinan ?? 60) / 100, 0.5, 0.98)
  e.brier = +((pKal - (net > 0 ? 1 : 0)) ** 2).toFixed(4)
  if (e.jalur === 'PHOENIX') {
    // belajar radar: apakah prediksi ujung atasnya tersentuh? (bukan vonis resmi)
    const barSetelah = c.filter((x) => x.t >= new Date(e.waktuKunci).getTime())
    e.targetKena = barSetelah.length ? Math.max(...barSetelah.map((x) => x.h)) >= e.target : null
    if (barSetelah.length && e.entry > 0) {
      e.mfe = +(Math.max(...barSetelah.map((x) => x.h)) / e.entry - 1).toFixed(4)   // pergerakan tertinggi setelah kunci
      e.mae = +(Math.min(...barSetelah.map((x) => x.l)) / e.entry - 1).toFixed(4)   // pergerakan terendah setelah kunci
      // V247: label TRIPLE-BARRIER (Lopez de Prado 2018) — barier mana yang kena DULUAN
      e.barier = 'WAKTU'
      for (const bar of barSetelah) {
        if (e.stop != null && bar.l <= e.stop) { e.barier = 'STOP'; break }
        if (bar.h >= e.target) { e.barier = 'TARGET'; break }
      }
      // V247: skor kesesuaian untuk pita konformal berikutnya
      ilmu.konformal.push(e.mfe)
      // V247: bucket meta-labeling — konfirmasi kuat vs lemah dinilai medan
      const kuat = (e.radar?.sinyal?.momentum ?? 0) >= PHX.KONFIRM_MOMENTUM && (e.radar?.sinyal?.akumulasi ?? 0) >= 0.30
      const bk = kuat ? ilmu.meta.kuat : ilmu.meta.lemah
      bk.n += 1; if (net > 0) bk.benar += 1
    }
  }
  dinilaiBaru.push(e)
}

// ---- 3. evolusi genome dari vonis nyata (ARAH + PHOENIX, berbatas, jujur) ----
let evolusiCatatan = 'belum cukup sampel (min 3 dinilai per siklus)'
if (dinilaiBaru.filter((e) => e.jalur !== 'PHOENIX').length >= 3) {
  const kom = dinilaiBaru.filter((e) => e.jalur !== 'PHOENIX')
  for (const k of DIM_ARAH) {
    const agree = kom.reduce((a, e) => a + (e.bukti[k] ?? 0) * (e.arah === 'BUY' ? 1 : -1) * (e.status === 'BENAR' ? 1 : -1), 0) / kom.length
    const lama = genome[k] ?? GENOME_AWAL[k]
    genome[k] = clamp(lama * (1 + 0.15 * agree), 0.05, 0.40)
  }
  const total = DIM_ARAH.reduce((a, k) => a + genome[k], 0)
  for (const k of DIM_ARAH) genome[k] = +(genome[k] / total).toFixed(4)
  semuaGenome[rezimGlobal].generasi += 1
  semuaGenome[rezimGlobal].belajar += kom.length
  semuaGenome[rezimGlobal].diperbarui = ISO
  evolusiCatatan = `generasi ${semuaGenome[rezimGlobal].generasi} rezim ${rezimGlobal}: bobot disesuaikan dari ${kom.length} vonis nyata`
  log(evolusiCatatan, JSON.stringify(genome))
}
let evolusiPhxCatatan = 'radar: belum cukup sampel (min 3 dinilai per siklus)'
const phxDinilai = dinilaiBaru.filter((e) => e.jalur === 'PHOENIX')
if (phxDinilai.length >= 3) {
  for (const k of PHX_DIM) {
    const setuju = phxDinilai.reduce((a, e) => a + (e.radar?.sinyal?.[k] ?? 0) * (e.status === 'BENAR' ? 1 : -1), 0) / phxDinilai.length
    const lama = phxGenome[k] ?? PHX_AWAL[k]
    phxGenome[k] = clamp(lama * (1 + 0.15 * setuju), 0.05, 0.40)
  }
  const total = PHX_DIM.reduce((a, k) => a + phxGenome[k], 0)
  for (const k of PHX_DIM) phxGenome[k] = +(phxGenome[k] / total).toFixed(4)
  semuaGenome.phoenix[rezimGlobal].generasi += 1
  semuaGenome.phoenix[rezimGlobal].belajar += phxDinilai.length
  semuaGenome.phoenix[rezimGlobal].diperbarui = ISO
  evolusiPhxCatatan = `radar generasi ${semuaGenome.phoenix[rezimGlobal].generasi} rezim ${rezimGlobal}: bobot phoenix disesuaikan dari ${phxDinilai.length} vonis nyata`
  log(evolusiPhxCatatan, JSON.stringify(phxGenome))
}

// ---- 3b. BAHAN AJAR — pelajaran & aturan lahir dari medan (mandat pemilik:
//      "dari kejadian ini agar jadi bahan ajar yang dapat dipahami dan
//      mengasah kesadarannya akan pasar") ----
const POLA_PELAJARAN = {
  phxPisauJatuh: 'ujung bawah + momentum negatif = pisau jatuh, BUKAN akumulasi — radar kini WAJIB menunggu harga kembali di atas EMA9 sebelum membeli',
  phxTargetJauh: 'prediksi ujung atas harus level nyata yang TERJANGKAU dalam 24 jam — tangga target kini memilih magnet terdekat (tengah rentang), bukan swing tertinggi',
  arahLawanRezim: 'melawan arus koin/rezim butuh bukti jauh lebih kuat — keyakinan kini dipotong bila arah melawan rezim',
}
const ATURAN_DEF = {
  phxMomentumWajib: { pola: 'phxPisauJatuh', min: 2, teks: 'RADAR dilarang membeli saat harga masih di bawah EMA9 — kasus pisau jatuh terbukti berulang' },
  phxTargetMagnet: { pola: 'phxTargetJauh', min: 2, teks: 'Target radar = magnet nyata TERDEKAT (tengah rentang / puncak 24 jam) — target jauh terbukti tak tersentuh' },
  arahRegimHormati: { pola: 'arahLawanRezim', min: 2, teks: 'Arah melawan rezim wajib keyakinan lebih rendah — potongan keyakinan dipasang di vonis komite' },
}
function polaDari(e) {
  const pola = []
  if (e.jalur === 'PHOENIX') {
    const mom = e.bukti?.momentum
    if (mom != null && mom < 0) pola.push('phxPisauJatuh')
    const jarak = e.target && e.entry ? e.target / e.entry - 1 : 0
    if (e.targetKena === false && jarak >= 0.06 && (e.mfe == null || e.mfe < jarak * 0.8)) pola.push('phxTargetJauh')
  } else if ((e.arah === 'SELL' && e.rezim === 'NAIK') || (e.arah === 'BUY' && e.rezim === 'TURUN')) {
    pola.push('arahLawanRezim')
  }
  return pola
}
const aturan = semuaGenome.aturanBelajar || { pola: {}, aktif: {} }
if (!aturan.seedSelesai) {
  // otak membaca KEMBALI seluruh kekalahan lamanya — sejarah jadi guru pertama
  for (const e of ledger.filter((x) => x.status === 'SALAH' || (x.jalur === 'PHOENIX' && x.targetKena !== undefined))) {
    for (const k of polaDari(e)) aturan.pola[k] = (aturan.pola[k] || 0) + 1
  }
  aturan.seedSelesai = ISO
  log('bahan ajar: seed pola dari sejarah', JSON.stringify(aturan.pola))
}
for (const e of dinilaiBaru) for (const k of polaDari(e)) aturan.pola[k] = (aturan.pola[k] || 0) + 1
const aturanBaru = []
for (const [nama, d] of Object.entries(ATURAN_DEF)) {
  if (!aturan.aktif[nama] && (aturan.pola[d.pola] || 0) >= d.min) {
    aturan.aktif[nama] = { sejak: ISO, teks: d.teks }
    aturanBaru.push(`${nama} — ${d.teks}`)
    log('ATURAN BARU DIBELAJARAN:', nama, `(${aturan.pola[d.pola]} kasus)`)
  }
}
semuaGenome.aturanBelajar = aturan
function pelajaranDari(e) {
  const pola = polaDari(e)
  const kenapa = []
  if (pola.includes('phxPisauJatuh')) kenapa.push(`dikunci saat momentum negatif (${((e.bukti?.momentum ?? 0) * 100).toFixed(0)}% — di bawah EMA9)`)
  if (pola.includes('phxTargetJauh')) kenapa.push(`ujung atas diprediksi +${(((e.target / e.entry) - 1) * 100).toFixed(1)}% tetapi tak pernah tersentuh${e.mfe != null ? ` (harga hanya sampai +${(e.mfe * 100).toFixed(1)}%)` : ''}`)
  if (pola.includes('arahLawanRezim')) kenapa.push(`${e.arah} dipasang saat rezim koin sendiri ${e.rezim} — melawan arus tanpa penalti keyakinan`)
  if (!kenapa.length && e.status === 'SALAH' && e.jalur === 'PHOENIX' && (e.radar?.sinyal?.sweep ?? 0) >= 0.5) kenapa.push('sapuan lantai terbaca jebakan-beruang tetapi arus terus turun — sapuan saja bukan bukti akumulasi')
  return {
    kenapa,
    pelajaran: e.status === 'BENAR'
      ? (kenapa.length ? 'benar secara P/L tetapi sasaran jualnya tak tersentuh — target diturunkan ke magnet terdekat agar prediksi ujung atas benar-benar teruji' : 'bukti yang dipercaya terbukti — bobot pola ini diperkuat evolusi')
      : (kenapa.length ? POLA_PELAJARAN[pola[0]] || 'pola kekalahan dicatat — gerbang diperketat' : 'komite kalah — bobot genome digeser evolusi dari vonis nyata ini'),
  }
}
const pelajaranDaftar = dinilaiBaru.map((e) => {
  const info = pelajaranDari(e)
  return {
    waktu: ISO, simbol: e.simbol, jalur: e.jalur || 'ARAH', vonis: e.status,
    netPct: +((e.net || 0) * 100).toFixed(2), kenapa: info.kenapa, pelajaran: info.pelajaran,
  }
})
if (pelajaranDaftar.length) log(`bahan ajar: ${pelajaranDaftar.length} pelajaran baru — aturan aktif ${Object.keys(aturan.aktif).length}`)

// ---- 3c. V247 ILMU — belajar on-line berjurnal dari tiap vonis matang ----
// otak membaca KEMBALI seluruh sejarahnya sekali (FinMem: lapisan-1 jadi guru),
// lalu tiap vonis baru melatih Hedge + mengisi bin kalibrasi + menumpuk Brier.
function angkaIlmu(e) {
  const pKal = clamp((e.keyakinanMentah ?? e.keyakinan ?? 60) / 100, 0.5, 0.98)
  return { pKal, o: e.net > 0 ? 1 : 0, y: e.status === 'BENAR' ? 1 : -1 }
}
if (!ilmu.seedSelesai) {
  const sejarah = ledger.filter((x) => x.status === 'BENAR' || x.status === 'SALAH')
  for (const e of sejarah) {
    const { pKal, o, y } = angkaIlmu(e)
    if (e.jalur === 'PHOENIX') {
      hedgePerbarui(ilmu.hedge.phx, Object.fromEntries(PHX_DIM.map((k) => [k, (e.radar?.sinyal?.[k] ?? 0) * 2 - 1])), y)
      if (e.mfe != null) ilmu.konformal.push(e.mfe)
      const kuat = (e.radar?.sinyal?.momentum ?? 0) >= PHX.KONFIRM_MOMENTUM && (e.radar?.sinyal?.akumulasi ?? 0) >= 0.30
      const bk = kuat ? ilmu.meta.kuat : ilmu.meta.lemah
      bk.n += 1; if (e.net > 0) bk.benar += 1
    } else {
      hedgePerbarui(ilmu.hedge.arah, Object.fromEntries(DIM_ARAH.map((k) => [k, e.bukti?.[k] ?? 0])), y)
    }
    const bin = ilmu.kalibrasi.find((b) => pKal * 100 >= b.low && pKal * 100 < b.high)
    if (bin) { bin.n += 1; if (o === 1) bin.benar += 1 }
    const lb = e.jalur === 'PHOENIX' ? ilmu.brier.phx : ilmu.brier.arah
    lb.n += 1; lb.jumlah += (pKal - o) ** 2
  }
  ilmu.konformal = ilmu.konformal.slice(-ILMU.KONFORMAL_MAKS)
  ilmu.seedSelesai = ISO
  log(`ilmu: seed ${sejarah.length} vonis sejarah -> hedge + kalibrasi + brier + konformal + meta`)
}
let ilmuCatatan = 'ilmu: belum ada vonis matang siklus ini'
{
  let n = 0
  for (const e of dinilaiBaru) {
    const { pKal, o, y } = angkaIlmu(e)
    if (e.jalur === 'PHOENIX') hedgePerbarui(ilmu.hedge.phx, Object.fromEntries(PHX_DIM.map((k) => [k, (e.radar?.sinyal?.[k] ?? 0) * 2 - 1])), y)
    else hedgePerbarui(ilmu.hedge.arah, Object.fromEntries(DIM_ARAH.map((k) => [k, e.bukti?.[k] ?? 0])), y)
    const bin = ilmu.kalibrasi.find((b) => pKal * 100 >= b.low && pKal * 100 < b.high)
    if (bin) { bin.n += 1; if (o === 1) bin.benar += 1 }
    const lb = e.jalur === 'PHOENIX' ? ilmu.brier.phx : ilmu.brier.arah
    lb.n += 1; lb.jumlah += (pKal - o) ** 2
    n++
  }
  if (n) ilmuCatatan = `ilmu: hedge/kalibrasi/brier berlatih dari ${n} vonis matang (eta ${ILMU.HEDGE_ETA})`
  log(ilmuCatatan)
}

// ---- 4. statistik akurasi jujur ----
const grad = ledger.filter((e) => e.status === 'BENAR' || e.status === 'SALAH')
const benar = grad.filter((e) => e.status === 'BENAR').length
const netKum = grad.reduce((a, e) => a + e.net, 0)
const batas7 = WAKTU.getTime() - 7 * 864e5
const grad7 = grad.filter((e) => new Date(e.waktuDinilai).getTime() >= batas7)
const benar7 = grad7.filter((e) => e.status === 'BENAR').length
const phxGraded = grad.filter((e) => e.jalur === 'PHOENIX')
const akurasi = {
  terkunci: ledger.length, terbuka: ledger.filter((e) => e.status === 'TERBUKA').length,
  benar, salah: grad.length - benar,
  akurasiPct: grad.length ? +((benar / grad.length) * 100).toFixed(1) : null,
  netKumulatifPct: +(netKum * 100).toFixed(2),
  jendela7h: { dinilai: grad7.length, benar: benar7, akurasiPct: grad7.length ? +((benar7 / grad7.length) * 100).toFixed(1) : null },
  phoenix: {
    dinilai: phxGraded.length, benar: phxGraded.filter((e) => e.status === 'BENAR').length,
    targetKena: phxGraded.filter((e) => e.targetKena === true).length,
    netKumulatifPct: +(phxGraded.reduce((a, e) => a + e.net, 0) * 100).toFixed(2),
  },
}

// ---- 4b. V248 METAMORFOSIS — evolusi kecepatan-3: digest epoch harian ----
// refleks (tiap denyut), adaptasi (genome+hedge per vonis matang),
// metamorfosis (24 jam): otak mengulum hari itu jadi epoch — resep disegel,
// arsip lama selalu bisa dibuka dengan otak versi epoch-nya.
let epochCatatan = 'denyut lanjutan hari ini — epoch sudah diulum'
if (keadaan.epochTerakhir !== TGL) {
  tulis(path.join(ROOT, `laporan/epoch-${TGL}.json`), {
    epoch: TGL, diulum: ISO, siklus: SIKLUS,
    ringkasan: {
      dinilai: dinilaiBaru.length, benar: dinilaiBaru.filter((e) => e.status === 'BENAR').length,
      netPct: +(dinilaiBaru.reduce((a, e) => a + e.net, 0) * 100).toFixed(2),
      terkunci: terkunciBaru.length, pelajaran: pelajaranDaftar.length, aturanLahir: aturanBaru,
    },
    resepOtak: { rezim: rezimGlobal, generasi: semuaGenome[rezimGlobal].generasi, bobot: genome, hedge: { arah: ilmu.hedge.arah, phx: ilmu.hedge.phx } },
    brier: { arah: ilmu.brier.arah.n ? +(ilmu.brier.arah.jumlah / ilmu.brier.arah.n).toFixed(4) : null, phx: ilmu.brier.phx.n ? +(ilmu.brier.phx.jumlah / ilmu.brier.phx.n).toFixed(4) : null },
    akumulasi: { akurasiPct: akurasi.akurasiPct, netKumulatifPct: akurasi.netKumulatifPct, phoenix: akurasi.phoenix },
    ket: 'resep, bukan hasil — siapa pun bisa menghitung ulang vonis dari ledger pra-registrasi dengan resep ini',
  })
  keadaan.epochTerakhir = TGL
  epochCatatan = `metamorfosis: epoch ${TGL} diulum (digest harian + tag git epoch-${TGL})`
  log(epochCatatan)
}

// ---- 4c. V248 SADAR-DIRI FUNGSIONAL — otak memeriksa tubuh & jiwanya sendiri ----
// (piagam pilar-4: sadar diri fungsional = memantau & mengatur diri sendiri)
const brierArah = ilmu.brier.arah.n ? ilmu.brier.arah.jumlah / ilmu.brier.arah.n : null
const peringatan = []
if (brierArah != null && brierArah > 0.25) peringatan.push(`Brier arah ${brierArah.toFixed(3)} > 0.25 — keyakinan masih overconfident; kalibrasi medan terus menurunkannya`)
const binBohong = ilmu.kalibrasi.filter((b) => b.n >= ILMU.KALIBRASI_MIN_N && b.benar / b.n < 0.45)
if (binBohong.length) peringatan.push(`bin keyakinan berbohong (${binBohong.map((b) => `${b.low}–${b.high - 1}%`).join(', ')} tembus < 45%) — keyakinan bin itu dipetakan turun otomatis saat kunci berikutnya`)
const dimTertindas = Object.entries(ilmu.hedge.arah).filter(([, w]) => w < 0.06).map(([k]) => k)
if (dimTertindas.length) peringatan.push(`dimensi bukti tertindas Hedge: ${dimTertindas.join(', ')} — sinyalnya nyaris tak dipakai komite`)
if (gagal.length > daftarTelusur.length * 0.3) peringatan.push(`${gagal.length}/${daftarTelusur.length} simbol gagal ditelusuri — kesehatan host sedang kurang baik`)
const pelLama = bacaJson(path.join(ROOT, 'laporan/pelajaran-server.json'), { daftar: [] })
const sadardiri = {
  denyut: SIKLUS, waktu: ISO,
  tubuh: {
    hostUtama: host, simbolTersedia: Object.keys(hasil).length, gagalTelusur: gagal.length,
    dataUmurJam: +((Date.now() - hasil.BTC[hasil.BTC.length - 1].t) / 36e5).toFixed(2),
  },
  jiwa: {
    sidikGenome: sidik(semuaGenome), sidikLedger: sidik(ledger.slice(-200)),
    memori: {
      peristiwa: ledger.length, pelajaran: Math.min(60, pelLama.daftar.length + pelajaranDaftar.length),
      doktrin: Object.keys(aturan.aktif).length, skorKonformal: ilmu.konformal.length,
      logDenyut: bacaJsonl(path.join(ROOT, 'laporan/denyut-server.jsonl')).length,
    },
    kapasitas: 'memori melipat berkapasitas: peristiwa 1000, pelajaran 60, konformal 60 — melupakan detail, menyimpan resep',
  },
  kesehatan: {
    brierArah: brierArah != null ? +brierArah.toFixed(4) : null,
    pitaKonformalAktif: ilmu.konformal.length >= ILMU.KONFORMAL_MIN_N,
    metaGeser: ilmu.meta.geser, gerbangRadar: gerbangSkor, generasiOtak: semuaGenome[rezimGlobal].generasi,
  },
  peringatan,
  tindakanSiklusIni: [ilmuCatatan, epochCatatan, ...(aturanBaru.length ? [`aturan baru lahir: ${aturanBaru.join('; ')}`] : [])],
  ket: 'kesadaran fungsional — otak membaca keadaannya sendiri tiap denyut lalu bertindak (kalibrasi, geser gerbang, kompaksi memori)',
}

// ---- 4d. V248 TUBUH PERSISTEN — mandat pemilik lewat Issue GitHub ----
// (piagam pilar-1: tujuan bisa ditetapkan lewat Issue — otak server membaca
//  issue berlabel "mandat" tiap denyut memakai token Actions bawaan)
let antreanMandat = null
try {
  const repoEnv = process.env.REPO_DENYUT, tokEnv = process.env.TOKEN_DENYUT
  if (repoEnv && tokEnv) {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 10000)
    const r = await fetch(`https://api.github.com/repos/${repoEnv}/issues?labels=mandat&state=open&per_page=10`, {
      headers: { Authorization: `Bearer ${tokEnv}`, Accept: 'application/vnd.github+json', 'User-Agent': 'sarang-penjaga' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (r.ok) {
      antreanMandat = (await r.json()).filter((i) => !i.pull_request)
        .map((i) => ({ nomor: i.number, judul: i.title, dibuat: i.created_at, url: i.html_url }))
      if (antreanMandat.length) log(`mandat terbaca dari Issue: ${antreanMandat.map((m) => '#' + m.nomor).join(', ')}`)
    } else antreanMandat = { catatan: `API Issue HTTP ${r.status} — antrean dilewati, denyut tetap jalan` }
  } else antreanMandat = { catatan: 'di luar Actions (sandbox) — antrean mandat jujur null' }
} catch (e) { antreanMandat = { catatan: `pembaca mandat gagal (tak fatal): ${String(e.message).slice(0, 60)}` } }

// ---- 5. laporan sasaran — lane PHOENIX dulu (mandat: beli murah ujung bawah) ----
const barisDari = (e) => ({
  simbol: e.simbol, jalur: e.jalur || 'ARAH', arah: e.arah, keyakinan: e.keyakinan, entry: e.entry,
  ...(e.ketKeyakinan ? { ketKeyakinan: e.ketKeyakinan } : {}),
  ...(e.jalur === 'PHOENIX' ? { target: e.target, ketTarget: e.ketTarget, untungBersihPct: +(e.untungBersih * 100).toFixed(1), stop: e.stop, skorPhoenix: e.skorPhoenix, highAmbisius: e.highAmbisius ?? null } : {}),
  ...(e.pitaUjungAtas ? { pitaUjungAtas: e.pitaUjungAtas } : {}),
  rezim: e.rezim, dikunci: e.waktuKunci, horizon: e.horizon, fee: '0.2% pulang-pergi',
  bukti: e.bukti, ketBukti: e.ketBukti, daya: e.daya,
})
// tiap lane memakai prediksi barunya hari ini; bila kosong (sudah terkunci siklus lalu), pakai yang TERBUKA
const pilihDasar = (jalurPhx) => {
  const baru = terkunciBaru.filter((e) => (e.jalur === 'PHOENIX') === jalurPhx)
  return baru.length ? baru : ledger.filter((e) => e.status === 'TERBUKA' && (e.jalur === 'PHOENIX') === jalurPhx)
}
const phxDasar = pilihDasar(true)
const komDasar = pilihDasar(false)
const phxRows = [...phxDasar]
  .sort((a, b) => b.skorPhoenix * b.untungBersih - a.skorPhoenix * a.untungBersih).slice(0, PHX.SASARAN_PHX)
const komRows = [...komDasar].filter((e) => !phxRows.some((p) => p.simbol === e.simbol))
  .sort((a, b) => b.keyakinan - a.keyakinan).slice(0, PHX.SASARAN_ARAH)
const sasaranUtama = [...phxRows, ...komRows].map(barisDari)
const kandidatLain = [
  ...[...phxDasar, ...komDasar].filter((e) => !sasaranUtama.some((r) => r.simbol === e.simbol && (r.jalur || 'ARAH') === (e.jalur || 'ARAH'))).map(barisDari),
  ...phxCadangan.slice(0, 6),
  ...nearMiss.slice(0, 8),
]
const laporan = {
  protokol: 'SASARAN-MICAPROFITA', organ: VERSI, dihasilkan: ISO, siklus: SIKLUS,
  sumber: { host, gagal: gagal.slice(0, 12) },
  rezimBTC: { rezim: rezimGlobal, harga: sembtc.harga, atrPct: +sembtc.atrPct.toFixed(2) },
  radar: {
    telaah: radar.telaah, zonaPhoenix: radar.zonaPhoenix, telusurDalam: radar.telusurDalam,
    gerbang: { skorMin: PHX.GERBANG_SKOR, untungMinPct: PHX.UNTUNG_MIN * 100, likuiditasMinJuta: PHX.QV_MIN / 1e6 },
    catatan: radar.catatan || `menelaah ${radar.telaah} pasangan USDT — ${radar.zonaPhoenix} di zona ujung-bawah — ${radar.telusurDalam} ditelusuri dalam dengan lilin 1 jam`,
  },
  sasaranHariIni: sasaranUtama,
  kandidatLain,
  akurasi,
  piagam: {
    identitas: PIAGAM.identitas, pilar: PIAGAM.pilar, otak: OTAK,
    roadmapJujur: PIAGAM.roadmapJujur,
    jalurPertumbuhan: [
      'V241 NADI — antarmuka hidup di Pages', 'V244 SARANG-PENJAGA — otak hidup di server tanpa browser',
      'V245 TERIMA-PASANG — organ browser menyatu dengan laporan server', 'V246 RADAR PHOENIX — beli ujung bawah, jual ujung atas',
      'V246 v2.1 PERTAJAM — gerbang konfirmasi + tangga target + bahan ajar', 'V247 MAJELIS-ILMU — 5 metode jurnal teruji dipasang',
      'V248 PIAGAM-CYBORG — 5 pilar + sadar-diri + epoch harian + mandat Issue',
    ],
  },
  sadardiri,
  antreanMandat,
  pelajaran: pelajaranDaftar.slice(0, 6),
  aturanBelajar: {
    pola: aturan.pola,
    aktif: Object.fromEntries(Object.entries(aturan.aktif).map(([k, v]) => [k, v.teks])),
    baruSiklusIni: aturanBaru,
  },
  ilmu: {
    versi: 'V247-MAJELIS-ILMU',
    fondasi: 'metode teruji dipasang nyata: Hedge/MWU (Arora-Hazan-Kale 2012 · Freund-Schapire 1997) · Brier & proper scoring (Gneiting-Raftery 2007) · kalibrasi keyakinan dari medan · pita konformal 75% (Angelopoulos-Bates 2021) · triple-barrier & meta-labeling (Lopez de Prado 2018) · ingatan berlapis FinMem (Zhang dkk 2023) — rincian di laporan/jurnal-ilmu.json',
    brier: {
      arah: ilmu.brier.arah.n ? +(ilmu.brier.arah.jumlah / ilmu.brier.arah.n).toFixed(4) : null,
      phx: ilmu.brier.phx.n ? +(ilmu.brier.phx.jumlah / ilmu.brier.phx.n).toFixed(4) : null,
      nArah: ilmu.brier.arah.n, nPhx: ilmu.brier.phx.n,
      ket: 'skor Brier keyakinan sebagai probabilitas — 0 sempurna, 0.25 = tebakan koin; makin kecil makin jujur',
    },
    kalibrasi: ilmu.kalibrasi.map((b) => ({ bin: `${b.low}–${b.high - 1}%`, n: b.n, tembusPct: b.n ? +((b.benar / b.n) * 100).toFixed(1) : null })),
    hedge: {
      arah: ilmu.hedge.arah, phx: ilmu.hedge.phx,
      catatan: `${ilmuCatatan}; bobot efektif = 50% genome evolusi per rezim + 50% Hedge on-line`,
    },
    metaGerbang: { geser: ilmu.meta.geser, gerbangAktif: gerbangSkor, bucketKuat: ilmu.meta.kuat, bucketLemah: ilmu.meta.lemah, catatan: metaCatatan },
    konformal: (() => { const p = pitaKonformal(ilmu.konformal); return p || { catatan: `belum cukup medan (min ${ILMU.KONFORMAL_MIN_N} vonis phoenix matang) — pita 75% belum diumumkan, jujur menunggu` } })(),
  },
  genome: {
    rezim: rezimGlobal, bobot: genome,
    phoenix: { rezim: rezimGlobal, bobot: phxGenome },
    semuaRezim: Object.fromEntries(Object.entries(semuaGenome).filter(([k]) => k !== 'phoenix' && k !== 'aturanBelajar' && k !== 'ilmu').map(([k, v]) => [k, { generasi: v.generasi, belajar: v.belajar }])),
  },
  pertumbuhan: {
    waktuMulai: keadaan.mulai, siklus: SIKLUS,
    prediksiTerkunci: ledger.length, prediksiDinilai: grad.length,
    evolusiCatatan: `${evolusiCatatan}; ${evolusiPhxCatatan}`,
    metamorfosis: epochCatatan, epochTerakhir: keadaan.epochTerakhir,
  },
  catatanJujur: [
    'prediksi DIKUNCI sebelum pergerakan (pra-registrasi) — dinilai otomatis setelah horizon 24 jam memakai close terkini pada siklus penilaian',
    'RADAR PHOENIX menelaah ratusan pasangan USDT tiap siklus: mencari akumulasi di ujung bawah hari (sapuan lantai 3-hari, taker-buy menguat, kompresi) lalu memprediksi ujung atas dari level nyata — prediksi terukur, bukan jaminan',
    'target jual phoenix wajib memberi >= 1% setelah fee 0.2%; bila seluruh pasar di puncak, radar jujur melaporkan zona kosong alih-alih memaksa beli mahal',
    'lane PHOENIX (beli ujung bawah) dan lane ARAH (komite genome) berdiri sendiri; keduanya dinilai net P/L close-ke-close yang sama jujurnya',
    'cron GitHub bisa mundur beberapa menit saat server padat; jadwal tetap berjalan tanpa browser',
    'BAHAN AJAR: setiap vonis ditulis jadi pelajaran (laporan/pelajaran-server.json); pola kekalahan yang terulang >= 2 kali melahirkan ATURAN baru yang mengikat gerbang siklus berikutnya — otak tumbuh dari medan, bukan tebakan',
    'ILMU BERJURNAL: bobot bukti belajar on-line ala Hedge dengan jaminan regret (Arora dkk 2012); keyakinan diperlakukan sebagai probabilitas — dinilai Brier (Gneiting-Raftery 2007) dan dikalibrasi dari hit-rate medan sendiri; pita ujung atas memakai jaminan cakupan konformal (Angelopoulos-Bates 2021); vonis phoenix dilabel triple-barrier dan gerbang digeser meta-labeling (Lopez de Prado 2018) — kepastian dibangun dari metode teruji + medan sendiri, bukan janji',
    'PIAGAM CYBORG: lima pilar — tubuh persisten, multi-otak berbobot, ingatan DNA, sadar-diri fungsional, evolusi tiga kecepatan — dipasang nyata dan terbuka diaudit siapa pun; otak LLM/LoRA masih roadmap yang diakui jujur; satu hal pasti: cyborg ini terus berkembang pesat tiap denyut',
  ],
}
tulis(path.join(ROOT, 'laporan/sasaran-terkini.json'), laporan)

// ---- 6. ledger + denyut (berkapasitas) ----
tulisJsonl(path.join(ROOT, 'laporan/prakira-server.jsonl'), ledger.slice(-1000))
const denyut = bacaJsonl(path.join(ROOT, 'laporan/denyut-server.jsonl'))
denyut.push({
  waktu: ISO, siklus: SIKLUS, sumber: host, telaah: radar.telaah, telusur: radar.telusurDalam,
  simbolOK: Object.keys(hasil).length,
  terkunciBaru: terkunciBaru.length, phoenixKunci: terkunciBaru.filter((e) => e.jalur === 'PHOENIX').length,
  dinilaiBaru: dinilaiBaru.length,
  benar: dinilaiBaru.filter((e) => e.status === 'BENAR').length,
  pelajaranBaru: pelajaranDaftar.length, aturanBaru: aturanBaru.length,
  brier: ilmu.brier.arah.n ? +(ilmu.brier.arah.jumlah / ilmu.brier.arah.n).toFixed(3) : null,
  akurasiPct: akurasi.akurasiPct, rezimBTC: rezimGlobal,
  epoch: keadaan.epochTerakhir, peringatan: sadardiri.peringatan.length,
})
tulisJsonl(path.join(ROOT, 'laporan/denyut-server.jsonl'), denyut.slice(-500))
tulis(path.join(ROOT, 'otak/penjaga-keadaan.json'), keadaan)
tulis(path.join(ROOT, 'otak/genome-server.json'), semuaGenome)

// bahan ajar tersimpan permanen — jejak kesadaran pasar yang tumbuh
const pelPath = path.join(ROOT, 'laporan/pelajaran-server.json')
const pelFile = bacaJson(pelPath, { diperbarui: null, aturanBelajar: aturan, daftar: [] })
pelFile.diperbarui = ISO
pelFile.aturanBelajar = aturan
pelFile.daftar = [...pelajaranDaftar, ...pelFile.daftar].slice(0, 60)
tulis(pelPath, pelFile)

// V247: akta jurnal ilmiah — rujukan terverifikasi + cara tiap metode dipasang
// (mandat pemilik: pelajari jurnal teruji lalu inovasikan pada cyborg)
tulis(path.join(ROOT, 'laporan/jurnal-ilmu.json'), {
  diperbarui: ISO, organ: VERSI,
  mandat: 'pelajari jurnal ilmiah AI yang banyak diperdebatkan, ditelaah, terbukti koheren — lalu inovasikan pada cyborg (perintah pemilik)',
  prinsip: 'setiap metode di bawah DIPASANG dalam kode otak (bukan sekadar dikutip) dan dinilai jujur oleh medan lewat ledger pra-registrasi',
  daftar: JURNAL,
  buktiPemasangan: {
    hedge: 'hedgePerbarui() dipanggil dari sejarah (seed) + tiap vonis matang; bobot efektif = 50% genome + 50% hedge',
    brier: 'e.brier dihitung saat penilaian; rata-rata dilaporkan di laporan.ilmu.brier',
    kalibrasi: 'kalibrasiKeyakinan() dipakai saat mengunci ARAH & PHOENIX; tabel bin dilaporkan di laporan.ilmu.kalibrasi',
    konformal: 'pitaKonformal() dari MFE medan sendiri; tercantum di entri phoenix (pitaUjungAtas) saat n >= 8',
    tripleBarrier: 'e.barier (TARGET/STOP/WAKTU) dihitung saat penilaian phoenix',
    metaLabeling: 'ilmu.meta.kuat/lemah menilai gerbang radar; geser dibatasi ±8 (laporan.ilmu.metaGerbang)',
    finmem: 'lapisan 1 ledger -> lapisan 2 pelajaran -> lapisan 3 aturan (laporan/pelajaran-server.json)',
  },
})

log(`denyut #${SIKLUS} selesai — kunci ${terkunciBaru.length} (phoenix ${terkunciBaru.filter((e) => e.jalur === 'PHOENIX').length}), nilai ${dinilaiBaru.length}, akurasi ${akurasi.akurasiPct ?? 'belum ada'}%`)
console.log('RINGKASAN:' + JSON.stringify({
  siklus: SIKLUS, telaah: radar.telaah, zona: radar.zonaPhoenix, telusur: radar.telusurDalam,
  terkunci: terkunciBaru.length, phoenix: terkunciBaru.filter((e) => e.jalur === 'PHOENIX').length,
  dinilai: dinilaiBaru.length, akurasi: akurasi.akurasiPct,
}))
