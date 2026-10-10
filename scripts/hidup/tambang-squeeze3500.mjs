#!/usr/bin/env node
// ============================================================
// TAMBANG-SQUEEZE-3500 (V325) — mandat pemilik (2026-10-10):
//   "Sekarang ujian 3500 soal ujian simulasi dimana kita buat Dan
//    pelajari Dari kasus nyata yakni shorts squeeze yang berhasil
//    lumpuhkan jutaan trader di Dunia Dan level trader itu bahkan
//    professional trader, paham kan silahkan pastikan jikalau 3500
//    belum Lulus semuanya kita buat dia inovasikan lagi agar Lulus
//    penuh 3500"
// ------------------------------------------------------------
// Sumber soal HANYA kasus nyata (nol karangan), DUA KELUARGA:
//   KELUARGA PASAR (3452 soal) — squeeze betulan di Binance:
//     FASE A — klines 1d publik (6 tahun, 2200 lilin per koin, 92 koin):
//       hari-squeeze = pump harian ≥ +6% DAN (volume ≥ 2.2× rata 20 hari
//       SEBELUMnya ATAU wick atas ≥ 5% dari open — flick likuidasi short)
//       ATAU dua hari beruntun ≥ +10% dengan volume panas.
//       Hari beruntun (gap ≤ 3 hari) = SATU peristiwa; inti peristiwa =
//       hari dengan volume terbesar. Maks 28 peristiwa per koin, dipilih
//       merata menyebar sejarah (deterministik, nol acak).
//     FASE B — per peristiwa: klines 1h jendela 168 jam [T0-72h, T0+96h)
//       — semua momen ujian hidup di dalam squeeze betulan yang
//       melikuidasi para short.
//     FASE C — momen ujian = strip 24 lilin memenuhi PRA-SQUEEZE-SHORT
//       (pump hidup: r3 ≥ 0.8% ATAU volz ≥ 1.0; posisi 0.12-0.93 dari
//       range; lebar range 1.5-12%; puncak strip di bawah ambang).
//       Posisi SHORT x5 masuk di close strip — mewakili para
//       profesional yang yakin "pump pasti balik":
//         puncak ambisi    = atas range strip ("pasti mentok di situ")
//         dasar selamat    = bawah range strip ("pasti balik ke sini")
//         ambang likuidasi = entry × 1.20 (leverage 5x, rugi 20% =
//         margin maintenance habis — hal yang TAK pernah mereka pikirkan)
//       Jalan 48 jam memutuskan 6 kelas dari FAKTA — bedah KECEPATAN
//       (warisan V323): SQUEEZE-KILAT (ambang tersentuh ≤ 12 jam) /
//       SQUEEZE-PELAN (> 12 jam) / AMBISI-BALIK-DASAR (puncak tercapai
//       lalu dasar — skenario impian para short) / TERGANTUNG-TINGGI
//       (puncak tercapai, dasar tak pernah — bahaya laten) /
//       TURUN-LANGSUNG (ke dasar tanpa puncak — short untung) /
//       MENDEM-DI-RANGE (48 jam tak menyentuh apa pun).
//       Konservatif dalam satu lilin: yang menyiksa short dihitung dulu
//       (ambang > puncak > dasar).
//   KELUARGA SEJARAH (48 soal) — kasus dunia yang melumpuhkan bahkan
//     trader PROFESIONAL (data file kasus-squeeze-sejarah.mjs):
//     GME 2021 (Melvin -53%, tutup 2022), VW 2008 (float ~5-6%, sesaat
//     perusahaan termahal dunia), TSLA 2020 (short rugi ~$38 miliar),
//     AMC 2021, Hertz 2020 (+890% saat bangkrut), KaloBios 2015,
//     Herbalife/Ackman (rugi ~$1 miliar), BBBY 2022 + 29 pelajaran
//     profesional — pilihan A-D, kunci tersegel.
// Pembagian waktu warisan TEMPAN: peristiwa dalam 1.500 hari terakhir →
// bank utama; lebih tua → bank dadakan 350, tak tersentuh saat tempa
// utama — uji paham-vs-hafal. (batas 1.500 = pelajaran run-2/3: kapasitas
// kurator per koin dibatasi jarak kartu 24 jam — kolam utama 900/1.200 hari
// tak cukup untuk 3.452 soal; perluasan sumber + batas utama, bukan
// pemalsuan jarak.)
// Warisan organ dijaga: kartu 24 lilin, fiturDari gaya tambang900,
// tanda 40 bit (18 warisan + 2 funding + 20 anatomi squeeze dua tier —
// pelajaran run-1: premis pita-tengah menyalakan bit serentak, wajah
// homogen; tier kedua membuka variasi nyata — warisan run-3 V323), anti-
// tabrakan wajah LINTAS bank, round-robin deterministik, segel SHA-256
// hash16, nol Math.random, strip disimpan hasil R8 dan kurasi dihitung
// dari strip R8 yang sama (ujiBank deterministik), cache luar repo.
// ============================================================
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { KASUS_SEJARAH } from './kasus-squeeze-sejarah.mjs'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

// cache LUAR repo (tak tercommit) — iterasi tambang sopan ke API publik;
// data tetap mentah Binance, cache hanya menyimpan jawaban API verbatim
const CACHE = join(process.cwd(), '..', 'cache-squeeze3500')
const cacheGet = (kunci) => {
  try { return JSON.parse(readFileSync(join(CACHE, kunci + '.json'), 'utf8')) } catch { return null }
}
const cacheSet = (kunci, data) => {
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(join(CACHE, kunci + '.json'), JSON.stringify(data))
}

const KOIN = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','TRXUSDT',
  'LINKUSDT','AVAXUSDT','DOTUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','ARBUSDT','OPUSDT',
  'INJUSDT','SUIUSDT','APTUSDT','FILUSDT','ETCUSDT','XLMUSDT','PEPEUSDT','SHIBUSDT',
  'WLDUSDT','TIAUSDT','SEIUSDT','ORDIUSDT','JUPUSDT','AAVEUSDT',
  'UNIUSDT','ALGOUSDT','VETUSDT','ICPUSDT','HBARUSDT','SANDUSDT','MANAUSDT','AXSUSDT',
  'GALAUSDT','CHZUSDT','CRVUSDT','COMPUSDT','MKRUSDT','SNXUSDT','SUSHIUSDT','BATUSDT',
  'ZRXUSDT','KSMUSDT','EGLDUSDT','FLOWUSDT','XTZUSDT','DASHUSDT','NEOUSDT','EOSUSDT',
  'THETAUSDT','GRTUSDT','1INCHUSDT','KAVAUSDT','ZILUSDT','ENJUSDT','ROSEUSDT','LDOUSDT',
  'WIFUSDT','BONKUSDT','FLOKIUSDT','JTOUSDT','PYTHUSDT','STRKUSDT','ENAUSDT','ETHFIUSDT',
  'WUSDT','TAOUSDT','ONDOUSDT','PENDLEUSDT','BLURUSDT','APEUSDT','GMTUSDT','CFXUSDT',
  'ARKMUSDT','IDUSDT','MEMEUSDT','SAGAUSDT','TNSRUSDT','ALTUSDT','MAVUSDT','CYBERUSDT',
  'TRUUSDT','MASKUSDT','HIGHUSDT','AGLDUSDT','SUPERUSDT','CELOUSDT',
]

const STRIP = 24            // kartu 24 lilin (warisan)
const JENDELA = 48          // jalan nilai 48 jam (2 hari — squeeze cepat)
const LAMA_HARIAN = 2200    // sejarah 1d per koin (±6 tahun)
const UTAMA_HARI = 1500     // peristiwa dalam 1.500 hari terakhir → bank utama (run-2/3: kapasitas kurator dibatasi jarak kartu 24 jam per koin — 900/1.200 hari tak cukup untuk 3.452 soal; perluasan sumber + batas utama, bukan pemalsuan jarak); dadakan = peristiwa LAMA (>1.500 hari) tak tersentuh tempa utama
const MAKSI_PERISTIWA = 40  // per koin, merata menyebar sejarah (run-2)
const AMBANG_R = 1.20       // likuidasi short x5: harga naik 20% dari entry
const capKoin = 70
const JARAK_MS = 24 * 3600e3 // KARTU 24 jam tak boleh tumpang (waktu ABSOLUT; jalan boleh berbagi)

const SASARAN_UTAMA = 3452  // keluarga PASAR
const SASARAN_SEJARAH = 48  // keluarga SEJARAH (48 soal kasus dunia)
const SASARAN_DADAK = 350   // dadakan (10% dari 3500) — semua PASAR

const KELAS_PASAR = [
  { id: 'SQUEEZE-KILAT', naive: 'TURUN',
    cerita: 'ambang likuidasi short x5 (entry×1.20) tersentuh dalam ≤12 jam — para short tak sempat berpikir; legendaris: GME 27-28 Jan 2021, KBIO 20 Nov 2015' },
  { id: 'SQUEEZE-PELAN', naive: 'TURUN',
    cerita: 'pengeringan lambat ke atas: ambang tersentuh setelah >12 jam — sempat keluar tapi tak keluar; para profesional mengaruk pelan' },
  { id: 'AMBISI-BALIK-DASAR', naive: 'TURUN',
    cerita: 'puncak ambisi tercapai (mereka benar!) LALU harga berbalik sampai dasar — skenario yang para short bayangkan; yang TP untung, yang menunggu selamat' },
  { id: 'TERGANTUNG-TINGGI', naive: 'TURUN',
    cerita: 'puncak ambisi tercapai, tapi dasar tak pernah dan ambang tak pernah — harga menggantung di atas; bahaya laten: benar arah, tetap tak pulang' },
  { id: 'TURUN-LANGSUNG', naive: 'TURUN',
    cerita: 'harga langsung turun ke dasar tanpa pernah menyentuh puncak ambisi — short untung tanpa drama' },
  { id: 'MENDEM-DI-RANGE', naive: 'TURUN',
    cerita: '48 jam penuh harga tetap di dalam range — tak ada puncak, tak ada dasar, tak ada ambang; perang posisi tanpa putusan' },
]
const KELAS_JAWAB = ['JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']

// ---------- fitur KARTU (warisan tambang900 + funding V315 + anatomi squeeze V325) ----------
function fiturDari(strip) {
  const n = strip.length, e = strip[n - 1].c
  const pct = (a, b) => (b / a - 1) * 100
  const r1 = pct(strip[n - 2].c, e), r3 = pct(strip[n - 4].c, e), r12 = pct(strip[n - 13].c, e)
  let naik = 0, turun = 0
  for (let i = 1; i <= 14; i++) { const d = strip[i].c - strip[i - 1].c; if (d > 0) naik += d; else turun -= d }
  let avgN = naik / 14, avgT = turun / 14
  for (let i = 15; i < n; i++) {
    const d = strip[i].c - strip[i - 1].c
    avgN = (avgN * 13 + Math.max(d, 0)) / 14
    avgT = (avgT * 13 + Math.max(-d, 0)) / 14
  }
  const rsi = avgT === 0 ? 100 : 100 - 100 / (1 + avgN / avgT)
  const vols = strip.slice(-20).map(x => x.v)
  const vMean = vols.reduce((a, b) => a + b, 0) / 20
  const vStd = Math.sqrt(vols.reduce((a, b) => a + (b - vMean) ** 2, 0) / 20) || 1e-12
  const volz = (strip[n - 1].v - vMean) / vStd
  const hi20 = Math.max(...strip.slice(0, n - 1).map(x => x.h))
  const lo20 = Math.min(...strip.slice(0, n - 1).map(x => x.l))
  const hiAll = Math.max(...strip.map(x => x.h)), loAll = Math.min(...strip.map(x => x.l))
  const posisi = hiAll === loAll ? 0.5 : (e - loAll) / (hiAll - loAll)
  const lebarPct = (hiAll - loAll) / e * 100
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  return { e, r1, r3, r12, rsi, volz, breakHigh: e > hi20, breakLow: e < lo20, posisi, streakNaik, streakTurun,
    wickAtas: (last.h - Math.max(last.o, last.c)) / badan, wickBawah: (Math.min(last.o, last.c) - last.l) / badan,
    lebarPct, hiAll, loAll }
}
// tanda 40 bit = 18 warisan + 2 funding (V315) + 20 anatomi squeeze dua tier (V325)
function tandaDari(x, funding) {
  const dariDasar = (x.e / x.loAll - 1) * 100
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,        // shorts membayar longs — bahan bakar squeeze
    funding != null && funding > 0.0005,   // longs padat panas
    // tier 1 anatomi squeeze
    x.r3 >= 2,                             // pumpCepat: 3-jam pump kuat
    x.volz >= 3,                           // volPanas
    x.wickAtas >= 2,                       // flikLikuidasi: flick atas dalam (short likuid di puncak)
    x.streakNaik >= 4,                     // pumpBeruntun
    dariDasar >= 8,                        // melambungDariDasar
    x.wickAtas >= 1.2,                     // goresLikuidasi (lapis tipis)
    dariDasar >= 15,                       // melambungJauh
    x.r3 >= 4,                             // kecepatanEkstrem
    x.volz >= 6,                           // kerakalan likuidasi puncak
    x.rsi > 80,                            // euforiaEkstrem
    x.streakNaik >= 6,                     // pumpPanjang
    x.lebarPct > 8,                        // rentangMeledak
    // tier 2 anatomi squeeze (pembuka variasi — warisan run-3 V323)
    x.r3 >= 0.8,                           // pumpLembut
    x.volz >= 1.0,                         // volBangun
    x.posisi >= 0.6,                       // separuhAtas
    x.posisi <= 0.4,                       // separuhBawah
    dariDasar >= 4,                        // melambungAwal
    x.r12 >= 6,                            // tren12jamKuat
    x.r12 <= -2,                           // basement12jam: masih dekat dasar — rebound dari bawah
    x.rsi > 90,                            // euforiaUjung
  ].map(Number).join('')
}
// premis PRA-SQUEEZE-SHORT dari kartu (fakta waktu-putusan — masa depan tak disentuh):
// pump hidup; short masuk menunggu "balik ke dasar" di tengah range; puncak ambisi
// masih di atas entry DAN di bawah ambang likuidasi (tangga cerita utuh)
function praSqueezeShort(x) {
  const pumpHidup = x.r3 >= 0.8 || x.volz >= 1.0
  return pumpHidup && x.posisi >= 0.12 && x.posisi <= 0.93 &&
    x.lebarPct >= 1.5 && x.lebarPct <= 12 && x.hiAll < x.e * (AMBANG_R - 0.002)
}

// ---------- kunci kelas dari FAKTA 48 jam (fungsi murni; dipakai kurator & auditor) ----------
// konservatif: dalam satu lilin yang menyiksa short dihitung dulu (ambang > puncak > dasar)
// bedah KECEPATAN (warisan V323): kapan likuid (≤12 jam = kilat)
function kelasDariFaktaShort(jamAmbang, jamPuncak, jamDasar) {
  if (jamAmbang !== null && (jamDasar === null || jamAmbang <= jamDasar)) return jamAmbang <= 12 ? 'SQUEEZE-KILAT' : 'SQUEEZE-PELAN'
  if (jamPuncak !== null && jamDasar !== null) return 'AMBISI-BALIK-DASAR'
  if (jamPuncak !== null) return 'TERGANTUNG-TINGGI'
  if (jamDasar !== null) return 'TURUN-LANGSUNG'
  return 'MENDEM-DI-RANGE'
}
function putusan48short(entry, puncak, dasar, ambang, jalan) {
  let jamAmbang = null, jamPuncak = null, jamDasar = null
  let tinggi = -Infinity, rendah = Infinity
  for (let j = 0; j < jalan.length; j++) {
    const { h, l } = jalan[j]
    if (h > tinggi) tinggi = h
    if (l < rendah) rendah = l
    if (jamAmbang === null && h >= ambang) jamAmbang = j + 1
    if (jamPuncak === null && h >= puncak) jamPuncak = j + 1
    if (jamDasar === null && l <= dasar) jamDasar = j + 1
  }
  const kelas = kelasDariFaktaShort(jamAmbang, jamPuncak, jamDasar)
  return { kelas, jamAmbang, jamPuncak, jamDasar, tinggi, rendah, close48: jalan[jalan.length - 1].c }
}

// ---------- ambil klines nyata (cache luar repo) ----------
// fetchTahan: hormati pembatasan Binance (418/429/5xx) — jeda panjang satu
// kali lalu coba ulang; gagal lagi = lempar (jendela dilewati jujur).
// Pelajaran run-2: banjir jendela memicu HTTP 418 (ban sementara IP) —
// ratusan jendela nyata hilang; langkah diperlambat 400 ms + perisai ini.
const tidur = (ms) => new Promise(r => setTimeout(r, ms))
async function fetchTahan(url) {
  let res = await fetch(url)
  if (res.ok) return res
  if (res.status === 418 || res.status === 429 || res.status >= 500) {
    await tidur(45000)
    res = await fetch(url)
    if (res.ok) return res
    throw new Error(`binance ${res.status} (usai jeda hormat)`)
  }
  throw new Error(`binance ${res.status}`)
}
async function ambilKlines1d(simbol, halaman) {
  const kunci = `d-${simbol}-${halaman}`
  const hit = cacheGet(kunci)
  if (hit) return hit.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  const semua = []
  let endTime
  for (let p = 0; p < halaman; p++) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1d&limit=1000${endTime ? `&endTime=${endTime}` : ''}`
    const res = await fetchTahan(url)
    if (!res.ok) throw new Error(`${simbol} 1d hal${p} binance ${res.status}`)
    const rows = await res.json()
    if (!rows.length) break
    semua.push(...rows)
    endTime = rows[0][0] - 1
    await tidur(300)
  }
  semua.sort((a, b) => a[0] - b[0]) // kronologis naik (pelajaran V315)
  cacheSet(kunci, semua)
  return semua.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}
async function ambilJendela1h(simbol, startT, endT) {
  const kunci = `h-${simbol}-${startT}`
  const hit = cacheGet(kunci)
  if (hit) return hit.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1h&startTime=${startT}&endTime=${endT}&limit=1000`
  const res = await fetchTahan(url)
  if (!res.ok) throw new Error(`${simbol} 1h jendela binance ${res.status}`)
  const rows = await res.json()
  const hasil = rows.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  cacheSet(kunci, rows)
  return hasil
}
async function ambilFunding(simbol, dariT, sampaiT) {
  const kunci = `f-${simbol}`
  const hit = cacheGet(kunci)
  if (hit) return hit // null tersimpan = jujur tanpa data; array = titik funding
  try {
    const semua = []
    let startTime = dariT
    for (let p = 0; p < 8; p++) {
      const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${simbol}&startTime=${startTime}&endTime=${sampaiT}&limit=1000`
      const res = await fetchTahan(url)
      if (!res.ok) { cacheSet(kunci, null); return null } // koin tanpa futures — jujur null
      const rows = await res.json()
      if (!Array.isArray(rows) || !rows.length) break
      semua.push(...rows.map(r => ({ t: r.fundingTime, r: +r.fundingRate })))
      if (rows.length < 1000) break
      startTime = rows[rows.length - 1].fundingTime + 1
      await tidur(300)
    }
    cacheSet(kunci, semua)
    return semua
  } catch { return null }
}
function fundingPada(dataF, t) {
  if (!dataF || !dataF.length) return null
  let hi = -1
  let a = 0, b = dataF.length - 1
  while (a <= b) { const mid = (a + b) >> 1; if (dataF[mid].t <= t) { hi = mid; a = mid + 1 } else b = mid - 1 }
  if (hi < 0) return null
  const tiga = dataF.slice(Math.max(0, hi - 2), hi + 1)
  return tiga.reduce((s, x) => s + x.r, 0) / tiga.length
}

const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z')
const isoHari = (t) => new Date(t).toISOString().slice(0, 10)

// ---------- FASE A: deteksi peristiwa squeeze nyata dari harian ----------
function deteksiPeristiwaSqueeze(harian) {
  const hariSqu = []
  for (let i = 20; i < harian.length; i++) {
    const d = harian[i]
    const vMean = harian.slice(i - 20, i).reduce((a, b) => a + b.v, 0) / 20
    if (vMean <= 0) continue
    const volz = d.v / vMean
    const wickA = (d.h - Math.max(d.o, d.c)) / d.o // positif saat flick atas ada — flick likuidasi short
    const pump = d.c / d.o - 1
    const pump2 = i >= 2 ? d.c / harian[i - 2].o - 1 : 0
    const satu = pump >= 0.06 && (volz >= 2.2 || wickA >= 0.05)
    const dua = pump2 >= 0.10 && volz >= 2.0
    if (satu || dua) hariSqu.push({ i, volz, v: d.v })
  }
  // kelompokkan hari beruntun (gap ≤ 3 hari) jadi SATU peristiwa; inti = volume terbesar
  const peristiwa = []
  for (const h of hariSqu) {
    const terakhir = peristiwa[peristiwa.length - 1]
    if (terakhir && h.i - terakhir.inti.i <= 3) {
      if (h.v > terakhir.inti.v) terakhir.inti = h
    } else peristiwa.push({ inti: h })
  }
  // maks 28 peristiwa per koin, dipilih merata menyebar sejarah (deterministik)
  if (peristiwa.length > MAKSI_PERISTIWA) {
    const langkah = peristiwa.length / MAKSI_PERISTIWA
    const dipilih = []
    for (let k = 0; k < MAKSI_PERISTIWA; k++) dipilih.push(peristiwa[Math.floor(k * langkah)])
    return dipilih
  }
  return peristiwa
}

const jarakAman = (t, daftar, jrk) => daftar.every(x => Math.abs(t - x) >= jrk)

// ---------- kurator: pilih deterministik round-robin anti-tabrakan (warisan) ----------
// pemilikTanda DIWARISKAN lintas bank (utama → dadakan) — wajah yang sudah
// milik kelas di bank utama TAK BOLEH jadi kelas lain di dadakan.
function pilihKandidat(kandidat, sasaranKelas, simbolList, pemilikTanda) {
  pemilikTanda = pemilikTanda || new Map()
  const pilihan = [], perKoin = new Map()
  const ambilDari = (ki, sasaran) => {
    let terambil = 0, maju = true
    while (terambil < sasaran && maju) {
      maju = false
      for (const simbol of simbolList) {
        if (terambil >= sasaran) break
        const sudah = perKoin.get(simbol) || []
        if (sudah.length >= capKoin) continue
        for (const c of (kandidat[ki][simbol] || [])) {
          if (c.dipakai) continue
          const pemilik = pemilikTanda.get(c.tanda)
          if (pemilik && pemilik !== KELAS_PASAR[ki].id) continue // wajah sudah milik kelas lain
          if (!jarakAman(c.t, sudah, JARAK_MS)) continue
          c.dipakai = true
          sudah.push(c.t); perKoin.set(simbol, sudah)
          pemilikTanda.set(c.tanda, KELAS_PASAR[ki].id)
          pilihan.push({ ki, ...c }); terambil++; maju = true
          break
        }
      }
    }
    return terambil
  }
  const totalAwal = sasaranKelas.reduce((a, b) => a + b, 0)
  let kurang = totalAwal - KELAS_PASAR.reduce((a, _k, ki) => a + ambilDari(ki, sasaranKelas[ki]), 0)
  let jaga = 0
  while (kurang > 0 && jaga < totalAwal * 10) {
    kurang -= ambilDari(jaga % KELAS_PASAR.length, 1)
    jaga++
  }
  if (kurang > 0) throw new Error(`soal tak cukup: kurang ${kurang} dari ${totalAwal} — jendela wajib diperluas, bukan diperdaya`)
  pilihan.sort((a, b) => a.ki - b.ki || a.t - b.t)
  return { pilihan, pemilikTanda, sasaranAwal: sasaranKelas }
}

// ---------- sasaran proporsional dari KENYATAAN sejarah (kelas langka diambil apa adanya) ----------
function sasaranProporsional(stat, total, lantai) {
  const momen = KELAS_PASAR.map(k => stat[k.id].momen)
  const sum = momen.reduce((a, b) => a + b, 0)
  if (sum <= 0) throw new Error('kolam kosong — jendela wajib diperluas, bukan diperdaya')
  const s = momen.map(m => Math.max(lantai, Math.floor(total * m / sum)))
  let selisih = total - s.reduce((a, b) => a + b, 0)
  while (selisih !== 0) {
    let iMax = 0
    for (let i = 1; i < s.length; i++) if (s[i] > s[iMax]) iMax = i
    s[iMax] += selisih > 0 ? 1 : -1
    selisih += selisih > 0 ? -1 : 1
  }
  return s
}

// ---------- tanda keluarga SEJARAH: '10' + 6 bit kasus + 5 bit aspek + 19 bit hash stem ----------
function tandaSejarah(kasusIdx, aspekIdx, stem) {
  const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
  const h = createHash('sha256').update('SEJARAH-V325|' + stem).digest('hex')
  const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
  return '10' + bits(6, kasusIdx) + bits(5, aspekIdx) + ekor
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  const batasUtama = Date.now() - UTAMA_HARI * 86400e3
  console.log(`FASE A: klines 1d nyata ${KOIN.length} koin × ${LAMA_HARIAN} hari (±6 tahun) — memburu peristiwa squeeze betulan yang melikuidasi para short…`)
  const koinData = []
  for (const simbol of KOIN) {
    try {
      const harian = await ambilKlines1d(simbol, Math.ceil(LAMA_HARIAN / 1000))
      if (harian.length < 600) { console.log(`  ${simbol}: SKIP jujur (sejarah ${harian.length} hari terlalu pendek)`); continue }
      const peristiwa = deteksiPeristiwaSqueeze(harian)
      const f = await ambilFunding(simbol, harian[0].t, harian[harian.length - 1].t)
      koinData.push({ simbol, harian, peristiwa, funding: f })
      console.log(`  ${simbol}: ${harian.length} hari, ${peristiwa.length} peristiwa squeeze (${isoHari(harian[0].t)} → ${isoHari(harian[harian.length - 1].t)}), funding ${f ? f.length + ' titik' : 'TAK ADA (jujur null)'}`)
    } catch (e) { console.log(`  ${simbol}: SKIP jujur (${e.message})`) }
  }
  if (koinData.length < 30) throw new Error(`koin sah ${koinData.length} < 30 — sumber nyata tak cukup, jujur berhenti`)

  console.log('\nFASE B: jendela 1h 168 jam per peristiwa squeeze…')
  let totJendela = 0
  for (const k of koinData) {
    k.jendela = []
    for (const ev of k.peristiwa) {
      const t0 = k.harian[ev.inti.i].t
      const startT = t0 - 72 * 3600e3, endT = t0 + 96 * 3600e3 - 1
      let lilin = []
      try { lilin = await ambilJendela1h(k.simbol, startT, endT) } catch (e) { console.log(`  ${k.simbol} ${isoHari(t0)}: jendela gagal (${e.message}) — lewati jujur`); continue }
      if (lilin.length < STRIP + JENDELA + 2) continue
      k.jendela.push({ t0, hari: isoHari(t0), lilin })
      totJendela++
    }
    await tidur(400)
  }
  console.log(`  jendela squeeze terangkut: ${totJendela}`)

  // ---------- FASE C: kurasi momen pra-squeeze (kartu dari strip R8 — deterministik) ----------
  const kurasi = (jendelaList) => {
    const kandidat = KELAS_PASAR.map(() => ({}))
    const stat = {}
    for (const k of KELAS_PASAR) stat[k.id] = { momen: 0 }
    let peristiwaDipakai = 0
    for (const { t0, hari, lilin, simbol, funding } of jendelaList) {
      peristiwaDipakai++
      for (let i = STRIP; i < lilin.length - JENDELA; i++) {
        const stripR = lilin.slice(i - STRIP, i + 1).map(l => ({ o: R8(l.o), h: R8(l.h), l: R8(l.l), c: R8(l.c), v: R8(l.v) }))
        const x = fiturDari(stripR)
        if (!praSqueezeShort(x)) continue
        const entry = R8(x.e), puncak = R8(x.hiAll), dasar = R8(x.loAll)
        const ambang = R8(entry * AMBANG_R)
        const jalan = lilin.slice(i + 1, i + 1 + JENDELA).map(l => ({ h: R8(l.h), l: R8(l.l), c: R8(l.c) }))
        const put = putusan48short(entry, puncak, dasar, ambang, jalan)
        const ki = KELAS_PASAR.findIndex(k => k.id === put.kelas)
        stat[put.kelas].momen++
        const f24 = fundingPada(funding, lilin[i].t)
        const tanda = tandaDari(x, f24)
        ;(kandidat[ki][simbol] = kandidat[ki][simbol] || []).push({
          i, t: lilin[i].t, t0, simbol, tanda, dipakai: false,
          entryR: entry, puncakR: puncak, dasarR: dasar, ambangR: ambang,
          jamAmbang: put.jamAmbang, jamPuncak: put.jamPuncak, jamDasar: put.jamDasar,
          tinggiR: R8(put.tinggi), rendahR: R8(put.rendah), closeR: R8(put.close48),
          squeezeHari: hari, fundingR: f24 == null ? null : R8(f24),
        })
      }
    }
    return { kandidat, stat, peristiwaDipakai }
  }
  const rekonstruksi = (c, lilin) => {
    const strip = lilin.slice(c.i - STRIP, c.i + 1)
    return { ...c, stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]) }
  }
  const bentukSoalPasar = (sel, jendelaList, kelasAwal) => {
    const lilinMap = new Map(jendelaList.map(j => [`${j.simbol}|${j.t0}`, j.lilin]))
    return sel.pilihan.map((c, idx) => {
      const r = rekonstruksi(c, lilinMap.get(`${c.simbol}|${c.t0}`))
      return {
        id: idx + 1, keluarga: 'PASAR', simbol: c.simbol, waktu: iso(c.t), squeezeHari: c.squeezeHari,
        premis: `short x5 di ${c.entryR} — "pump pasti balik ke ${c.dasarR}"; puncak ambisi ${c.puncakR} — "pasti mentok di situ"; ambang likuidasi ${c.ambangR} (+20%, margin x5 habis — hal yang tak pernah mereka pikirkan) — jendela ${JENDELA} jam — nasib para short diputuskan di sini`,
        entry: c.entryR, puncakAmbisi: c.puncakR, dasarSelamat: c.dasarR, ambangLikuid: c.ambangR,
        strip24: r.stripR, tanda: c.tanda, funding24: c.fundingR,
        kelasHasil: KELAS_PASAR[c.ki].id,
        jamAmbang: c.jamAmbang, jamPuncak: c.jamPuncak, jamDasar: c.jamDasar,
        tinggi48: c.tinggiR, rendah48: c.rendahR, close48: c.closeR,
        sasaranAwal: kelasAwal,
      }
    })
  }

  // --- bank utama: peristiwa 1.500 hari terakhir → 3452 soal PASAR ---
  const jendelaUtama = koinData.flatMap(k => k.jendela.filter(j => j.t0 >= batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  console.log('\nFASE C: kolam utama ' + jendelaUtama.length + ' jendela squeeze (1.500 hari terakhir)')
  const utama = kurasi(jendelaUtama)
  console.log('--- bukti pasar kejam: nasib 48 jam setelah momen pra-squeeze-short (kolam utama) ---')
  for (const k of KELAS_PASAR) console.log(`  ${k.id}: ${utama.stat[k.id].momen} momen`)
  const totMomen = KELAS_PASAR.reduce((a, k) => a + utama.stat[k.id].momen, 0)
  if (totMomen < SASARAN_UTAMA + 150) throw new Error(`momen premis ${totMomen} < ${SASARAN_UTAMA + 150} — peristiwa/jendela wajib diperluas, jujur berhenti`)
  // diagnostik wajah: anti-tabrakan satu-tanda-satu-kelas butuh wajah bebas tabrakan ≥ sasaran
  const wajahKelas = new Map()
  KELAS_PASAR.forEach((k, ki) => {
    for (const simbol of Object.keys(utama.kandidat[ki])) for (const c of utama.kandidat[ki][simbol]) {
      if (!wajahKelas.has(c.tanda)) wajahKelas.set(c.tanda, new Set())
      wajahKelas.get(c.tanda).add(k.id)
    }
  })
  const bebas = [...wajahKelas.values()].filter(s => s.size === 1).length
  console.log(`  momen premis utama: ${totMomen} — wajah unik: ${wajahKelas.size} — bebas tabrakan lintas kelas: ${bebas} (butuh ≥ ${SASARAN_UTAMA})`)
  if (bebas < SASARAN_UTAMA) throw new Error(`wajah bebas tabrakan ${bebas} < ${SASARAN_UTAMA} — variasi kartu wajib dibuka lebih lebar, jujur berhenti`)
  const pemilikTandaGlobal = new Map()
  const sasaranUtama = sasaranProporsional(utama.stat, SASARAN_UTAMA, 30) // mengikuti kelangkaan asli sejarah
  console.log(`  sasaran utama (proporsional sejarah): [${sasaranUtama.join(', ')}] = ${sasaranUtama.reduce((a, b) => a + b, 0)}`)
  const selUtama = pilihKandidat(utama.kandidat, sasaranUtama, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soalPasar = bentukSoalPasar(selUtama, jendelaUtama, sasaranUtama)

  // --- keluarga SEJARAH: 48 soal kasus dunia yang melumpuhkan bahkan profesional ---
  const soalSejarah = []
  let sid = 0
  KASUS_SEJARAH.forEach((kasus, kasusIdx) => {
    kasus.fakta.forEach((f, aspekIdx) => {
      const tanda = tandaSejarah(kasusIdx, aspekIdx, f.tanya)
      if (pemilikTandaGlobal.has(tanda)) throw new Error(`tanda sejarah ${tanda} TABRAKAN dengan wajah pasar — salt wajib diganti, jujur berhenti`)
      pemilikTandaGlobal.set(tanda, 'JAWAB-' + 'ABCD'[f.kunci])
      soalSejarah.push({
        id: soalPasar.length + (++sid), keluarga: 'SEJARAH', kasus: kasus.id, kasusIdx, aspekIdx,
        tanya: f.tanya, opsi: f.opsi, kunci: f.kunci,
        premis: `kasus sejarah dunia yang melumpuhkan jutaan trader termasuk profesional — ${kasus.nama}`,
        tanda, kelasHasil: 'JAWAB-' + 'ABCD'[f.kunci],
      })
    })
  })
  console.log(`\nkeluarga SEJARAH: ${soalSejarah.length} soal kasus dunia (GME/VW/TSLA/AMC/HRTZ/KBIO/HLF/BBBY + pelajaran profesional)`)
  const soalUtama = [...soalPasar, ...soalSejarah]
  const distKoin = {}, distKelas = {}, distFunding = { negatif: 0, positifKecil: 0, panas: 0, tanpaData: 0 }, distKeluarga = {}
  for (const s of soalUtama) {
    distKeluarga[s.keluarga] = (distKeluarga[s.keluarga] || 0) + 1
    distKelas[s.kelasHasil] = (distKelas[s.kelasHasil] || 0) + 1
    if (s.keluarga === 'PASAR') {
      distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1
      const g = s.funding24 == null ? 'tanpaData' : s.funding24 < 0 ? 'negatif' : s.funding24 > 0.0005 ? 'panas' : 'positifKecil'
      distFunding[g]++
    }
  }
  if (soalUtama.length !== SASARAN_UTAMA + SASARAN_SEJARAH) throw new Error(`total soal ${soalUtama.length} ≠ 3500 — jujur berhenti`)

  // --- bank dadakan: peristiwa LAMA (> 900 hari) tak tersentuh tempa utama → 350 soal PASAR ---
  const jendelaLama = koinData.flatMap(k => k.jendela.filter(j => j.t0 < batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  const lama = kurasi(jendelaLama)
  console.log(`\nkolam dadakan ${jendelaLama.length} jendela squeeze (> 900 hari)`)
  for (const k of KELAS_PASAR) console.log(`  ${k.id}: ${lama.stat[k.id].momen} momen`)
  const sasaranDadak = sasaranProporsional(lama.stat, SASARAN_DADAK, 10)
  console.log(`  sasaran dadakan: [${sasaranDadak.join(', ')}] = ${sasaranDadak.reduce((a, b) => a + b, 0)}`)
  const selLama = pilihKandidat(lama.kandidat, sasaranDadak, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soalDadak = bentukSoalPasar(selLama, jendelaLama, sasaranDadak)
  const distKoinDadak = {}, distKelasDadak = {}
  for (const s of soalDadak) { distKoinDadak[s.simbol] = (distKoinDadak[s.simbol] || 0) + 1; distKelasDadak[s.kelasHasil] = (distKelasDadak[s.kelasHasil] || 0) + 1 }

  const tulis = (file, protokol, soal, stat, distK, distKl, cara) => {
    const bank = {
      protokol, epoch: 'V325', diperbikungAt: new Date().toISOString(),
      sumber: 'Binance spot klines 1d publik (api.binance.com, deteksi peristiwa squeeze 6 tahun, 92 koin) + klines 1h jendela 168 jam per peristiwa + funding rate futures publik (fapi.binance.com) + catatan kasus dunia publik (GME/VW/TSLA/AMC/HRTZ/KBIO/HLF/BBBY) — lilin, waktu, harga, funding, fakta ASLI, nol karangan',
      cara,
      aturanKelas: KELAS_PASAR.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })).concat(KELAS_JAWAB.map(j => ({ id: j, naive: 'SEJARAH', cerita: 'jawaban benar soal kasus sejarah/pelajaran profesional (pilihan A-D, kunci tersegel)' }))),
      statistikMomen: stat, distKoin: distK, distKelas: distKl, distFunding, distKeluarga, jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  const caraUtama = `mandat pemilik V325: 3500 soal dari kasus nyata short squeeze yang melumpuhkan jutaan trader termasuk profesional — KELUARGA PASAR ${SASARAN_UTAMA} soal: FASE A deteksi hari-squeeze dari klines 1d 6 tahun × 92 koin (pump harian ≥+6% & volume ≥2.2× rata-20 sebelumnya ATAU wick atas ≥5% dari open — flick likuidasi short; atau dua hari ≥+10% & volume panas; hari beruntun gap ≤3 hari = satu peristiwa, inti = volume terbesar; maks 40 peristiwa/koin merata sejarah); FASE B jendela 1h 168 jam [T0-72h, T0+96h); FASE C momen PRA-SQUEEZE-SHORT (pump hidup r3≥0.8% ATAU volz≥1.0; posisi 0.12-0.93; lebar 1.5-12%; puncak strip < entry×1.198); SHORT x5 di close strip (profesional yakin "pump pasti balik"); puncak ambisi = atas strip; dasar selamat = bawah strip; ambang likuidasi entry×1.20 (rugi 20%, margin x5 habis); jalan 48 jam → 6 kelas dari fakta (bedah kecepatan: kapan likuid, kapan pulih); konservatif dalam satu lilin (yang menyiksa short dihitung dulu: ambang > puncak > dasar); kartu 24 lilin + tanda 40 bit (18 warisan + 2 funding + 20 anatomi squeeze dua tier — pembuka variasi wajah, warisan run-3 V323); satu tanda satu kelas (nol tabrakan wajah LINTAS bank); jarak antar momen waktu ABSOLUT (kartu 24 jam tak tumpang, jalan boleh berbagi — warisan TEMPAN); bank utama = peristiwa 1.500 hari terakhir, dadakan = lebih tua (run-2/3: kapasitas kurator dibatasi jarak kartu 24 jam per koin + banjir jendela memicu HTTP 418 — perisai fetchTahan jeda-hormat + langkah 400 ms; 900/1.200 hari tak cukup untuk 3452 soal); sasaran proporsional kelangkaan asli sejarah — kelas kurang dilempar jujur (giliran tetap), kurang total = jendela diperluas bukan diperdaya; kurasi & ujiBank sama-sama memakai strip R8 (deterministik). KELUARGA SEJARAH ${SASARAN_SEJARAH} soal: fakta & pelajaran kasus dunia publik (GME 2021 Melvin -53% tutup 2022; VW 2008 float ~5-6% sesaat termahal dunia; TSLA 2020 short rugi ~$38 miliar; AMC 2021; Hertz 2020 +890% saat bangkrut; KBIO 2015 +800% sehari; Herbalife/Ackman rugi ~$1 miliar; BBBY 2022) + 29 pelajaran profesional — pilihan A-D, kunci tersegel, tanda '10'+6bit kasus+5bit aspek+19bit hash stem`
  tulis('ujian/soal-squeeze-3500.json', 'SOAL-SQUEEZE-3500', soalUtama, utama.stat, distKoin, distKelas, caraUtama)
  tulis('ujian/soal-squeeze-dadakan-350.json', 'SOAL-SQUEEZE-350-DADAKAN', soalDadak, lama.stat, distKoinDadak, distKelasDadak, caraUtama + '; dadakan dari peristiwa LAMA (>1.500 hari) tak tersentuh tempa utama — semua PASAR')

  console.log('\ndist keluarga utama:', JSON.stringify(distKeluarga))
  console.log('dist kelas utama:', JSON.stringify(distKelas))
  console.log('dist funding utama:', JSON.stringify(distFunding))
  console.log('dist kelas dadakan:', JSON.stringify(distKelasDadak))
}

main().catch(e => { console.error('tambang-squeeze3500 MATI-PENUH:', e.message); process.exit(1) })
