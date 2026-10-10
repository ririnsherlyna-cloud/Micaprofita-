#!/usr/bin/env node
// ============================================================
// TAMBANG-ALTSEASON-3500 (V331) — mandat pemilik (2026-10-11):
//   "Sekarang ujian 3500 soal ujian simulasi dimana kita buat Dan
//    pelajari Dari kasus nyata yakni (full altseason) yang berhasil
//    lumpuhkan jutaan trader yang pasang shorts di Dunia Dan level
//    trader professional Dunia pun terkena liquidasi, paham kan
//    silahkan pastikan jikalau 3500 belum Lulus semuanya kita buat
//    dia inovasikan lagi agar Lulus penuh"
// ------------------------------------------------------------
// Sumber soal HANYA kasus nyata (nol karangan), DUA KELUARGA:
//   KELUARGA PASAR (3452 soal) — musim alt penuh betulan di Binance:
//     FASE A — klines 1d publik (±6 tahun, 2200 lilin per koin, 91 koin
//       + BTC sebagai pembanding dominasi):
//       hari-altseason = tutup hari memenuhi SEMUA:
//         (1) ret7 ≥ +12% — alt sedang memompa dalam sepekan;
//         (2) ret7 ALT − ret7 BTC ≥ +8 poin — alt mengalahkan BTC
//             (ciri khas musim alt: LEBAR, bukan satu koin);
//         (3) volume ≥ 1,15× rata-20 — bahan bakar gelombang;
//         (4) WAJIB TERKONFIRMASI SEJARAH: dalam 40 hari berikutnya
//             harga menyentuh ≥ +10% dari tutup hari-inti — pump
//             terbukti LANJUT, nasib para short terbukti menanti.
//       Hari beruntun (gap ≤ 3 hari) = SATU peristiwa; inti = hari
//       volume terbesar. Maks 50 peristiwa per koin, merata menyebar
//       sejarah (deterministik, nol acak).
//     FASE B — per peristiwa: klines 1h jendela 168 jam [T0-72h, T0+96h).
//     FASE C — momen ujian = strip 24 lilin memenuhi PREMIS-ALTSEASON
//       (kartu menunjukkan panas hidup; masa depan tak disentuh):
//       dari dasar gelombang (tutup 7 hari sebelum hari-inti) entry
//       masih ≥ +8% (pump hidup), posisi ≥ 0,5 (harga di paruh atas
//       strip — panas terbaca), momentum hidup (r12 ≥ +2% ATAU volz
//       ≥ 1,0), lebar strip 1,0-18%, ada ruang naik & turun di strip,
//       dan dasar gelombang masih DI BAWAH titik terendah strip
//       (pulse belum patah di momen ini — panas menggantung).
//       Posisi profesional x5 masuk di close strip — mewakili para
//       trader profesional penjual-pantulan yang yakin "terlalu panas
//       = pasti balik":
//         SHORT x5 di close (satu-satunya sisi — inilah korban musim alt)
//         puncak ambisi    = titik terendah strip (target turun)
//         dasar selamat    = dasar gelombang 7-hari (jatuh ke dasar =
//                            pulse patah, tesis balik terbukti)
//         ambang likuidasi = entry × 1,20 (+20% melawan short —
//                            margin x5 habis; rugi short ke atas tak
//                            berbatas sebelum ambang)
//       Jalan 48 jam memutuskan 6 kelas dari FAKTA — bedah KECEPATAN
//       (warisan V323/V325/V326/V330): LIKUIDASI-KILAT (likuid ≤ 12
//       jam) / LIKUIDASI-PELAN (> 12 jam) / BALIK-SEJATI (target turun
//       tersentuh DAN dasar gelombang pecah — tesis balik terbukti
//       penuh) / MIMPI-BELUM-PULANG (target tersentuh, dasar tak pecah
//       — balik belum terbukti) / BALIK-LANGSUNG (dasar pecah tanpa
//       menyentuh target — koreksi keras) / MENDEM-DI-PANAS (48 jam
//       menggantung tanpa putusan). Konservatif dalam satu lilin: yang
//       menyiksa posisi dihitung dulu (likuid > semua yang lain).
//   KELUARGA SEJARAH (48 soal) — kasus dunia musim alt yang
//     melikuidasi bahkan trader PROFESIONAL (kasus-altseason-
//     sejarah.mjs): XRP-2017 ($0,20 → $3,84, +1.800%, short profesional
//     dilikuidasi sebelum runtuh), DOGE-WSB-2021 (+800% dalam ±48 jam),
//     XRP-SEC-SQUEEZE (paradoks gugatan SEC: +220% dulu, runtuh
//     belakangan), DOGE-SNL-2021 ($0,74 pra-SNL, short puncak dilikuid
//     dulu), ALTSEASON-JAN-2021 (ADA +750%, lebar lintas koin),
//     LINK-DEFI-2020 ($2,30 → $20,11, overbought berpekan-pekan),
//     XRP-NOV-2024 ($0,52 → $3,40, likuidasi short miliaran dolar),
//     WIF-2024 ($0,46 → $5,16, +1.000%) + 20 pelajaran profesional —
//     pilihan A-D, kunci tersegel.
// Pembagian waktu warisan TEMPAN: peristiwa dalam 2.000 hari terakhir →
// bank utama; lebih tua → bank dadakan 350, tak tersentuh saat tempa
// utama — uji paham-vs-hafal.
// Warisan organ dijaga: kartu 24 lilin, fiturDari/tandaDari 40 bit
// (18 warisan + 2 funding + 20 anatomi dua tier — identik garis
// SQUEEZE/SUCKER/BREAKOUT), anti-tabrakan wajah LINTAS bank, probe
// kapasitas nyata, sasaran proporsional klem-kapasitas-dialihkan,
// round-robin deterministik, segel SHA-256 hash16, nol Math.random,
// strip disimpan hasil R8 dan kurasi dihitung dari strip R8 yang sama,
// cache luar repo, perisai fetchTahan (418/429/5xx).
// ============================================================
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { KASUS_ALTSEASON_SEJARAH } from './kasus-altseason-sejarah.mjs'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

// cache LUAR repo (tak tercommit) — iterasi tambang sopan ke API publik;
// klines 1d & funding adalah data API yang sama persis dengan warisan
// SQUEEZE/SUCKER/BREAKOUT (V325/V326/V330) — dibaca ulang dari cache
// warisan, fakta yang sama, nol pemalsuan
const CACHE = join(process.cwd(), '..', 'cache-altseason3500')
const WARISAN = [join(process.cwd(), '..', 'cache-breakout3500'), join(process.cwd(), '..', 'cache-sucker3500'), join(process.cwd(), '..', 'cache-squeeze3500')]
const cacheGet = (kunci) => {
  try { return JSON.parse(readFileSync(join(CACHE, kunci + '.json'), 'utf8')) } catch {}
  for (const w of WARISAN) { try { return JSON.parse(readFileSync(join(w, kunci + '.json'), 'utf8')) } catch {} }
  return null
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
const JENDELA = 48          // jalan nilai 48 jam (gelombang musim alt menagih cepat)
const LAMA_HARIAN = 2200    // sejarah 1d per koin (±6 tahun)
const UTAMA_HARI = 2000     // peristiwa dalam 2.000 hari terakhir → bank utama; dadakan = lebih tua
const MAKSI_PERISTIWA = 50  // per koin, merata menyebar sejarah
const AMBANG_R = 0.80       // likuidasi short x5: entry × (2 − 0,80) = +20% melawan posisi
const capKoin = 100
const JARAK_MS = 24 * 3600e3 // kartu 24 jam tak boleh tumpang (waktu ABSOLUT)
const NIV = 20              // rata volume 20 hari (bahan bakar)
const RET7_MIN = 0.12       // alt pump ≥ +12% dalam sepekan
const OUTPERF_MIN = 0.08    // mengalahkan BTC ≥ +8 poin (ciri musim alt: LEBAR)
const VOLZ_MIN = 1.15       // volume ≥ 1,15× rata-20
const LANJUT_MIN = 1.10     // WAJIB: dalam 40 hari berikutnya menyentuh ≥ +10% dari tutup inti — pump terbukti lanjut
const KONFIRMASI_HARI = 40  // jendela konfirmasi sejarah

const SASARAN_UTAMA = 3452  // keluarga PASAR
const SASARAN_SEJARAH = 48  // keluarga SEJARAH
const SASARAN_DADAK = 350   // dadakan (10% dari 3500) — semua PASAR

// PELAJARAN RUN-1 (terbuka): kelas BALIK-LANGSUNG (dasar pecah tanpa
// target) MUSNAH MELALUI KONSTRUKSI — dasar gelombang selalu di bawah
// target strip, jadi jatuh ke dasar pasti menembus target lebih dulu;
// run-2 menggantinya dengan split MENDEM dari FAKTA close48 (jujur).
const KELAS_PASAR = [
  { id: 'LIKUIDASI-KILAT', naive: 'PANAS-BALIK',
    cerita: 'ambang likuidasi x5 (+20% melawan short) tersentuh ≤ 12 jam — gelombang musim alt paling kejam: panas sekejap meluluhlantakkan posisi (XRP 2017, DOGE-WSB)' },
  { id: 'LIKUIDASI-PELAN', naive: 'PANAS-BALIK',
    cerita: 'pengeringan lambat: ambang tersentuh setelah > 12 jam — sempat berharap balik, tapi arus musim menghimpit pelan sampai margin x5 habis (LINK 2020)' },
  { id: 'BALIK-SEJATI', naive: 'PANAS-BALIK',
    cerita: 'puncak ambisi (target turun) tersentuh DAN dasar gelombang pecah dalam 48 jam — tesis balik terbukti penuh; para short yang selamat menagih di sini' },
  { id: 'MIMPI-BELUM-PULANG', naive: 'PANAS-BALIK',
    cerita: 'target turun tersentuh, TAPI dasar gelombang tak pecah — balik dimulai tapi tak terbukti; short yang menggantung menanggung risiko gelombang berikutnya (XRP-SEC)' },
  { id: 'MENDEM-DI-PANAS', naive: 'PANAS-BALIK',
    cerita: '48 jam menggantung di panas — tak likuid, tak target, tak patah dasar, DAN close48 tidak di bawah entry (short tak menang apa pun); arus mengangkat tanpa meledak' },
  { id: 'SEMPIT-MENANG', naive: 'PANAS-BALIK',
    cerita: '48 jam menggantung tanpa putusan TAPI close48 di bawah entry — short menang sempit tanpa drama; pelajaran: menang sempit tanpa rencana keluar tetap bukan ilmu' },
]
const KELAS_JAWAB = ['JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']

// ---------- fitur KARTU (warisan identik garis SQUEEZE/SUCKER/BREAKOUT) ----------
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
    lebarPct, hiAll, loAll, hi20, lo20 }
}
// tanda 40 bit = 18 warisan + 2 funding (V315) + 20 anatomi dua tier (V326) — identik warisan
function tandaDari(x, funding) {
  const dariDasar = (x.e / x.loAll - 1) * 100
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,
    funding != null && funding > 0.0005,
    x.r3 >= 2, x.volz >= 3, x.wickBawah >= 2, x.streakNaik >= 4,
    dariDasar >= 8, x.wickBawah >= 1.2, dariDasar >= 15, x.r3 >= 4,
    x.volz >= 6, x.rsi > 80, x.streakNaik >= 6, x.lebarPct > 8,
    x.r3 >= 0.8, x.volz >= 1.0, x.posisi >= 0.6, x.posisi <= 0.4,
    dariDasar >= 4, x.r12 >= 6, x.r12 <= -2, x.rsi > 90,
  ].map(Number).join('')
}
// premis ALTSEASON dari kartu + dasar gelombang (fakta waktu-putusan —
// masa depan tak disentuh). Satu-satunya sisi: SHORT x5 — inilah korban
// musim alt yang dimandatkan pemilik ("jutaan trader yang pasang shorts
// ... bahkan professional dilikuidasi").
// run-1 (terbuka di cara-bank): dariDasar ≥ 8%, posisi ≥ 0,5, momentum
// hidup (r12 ≥ 2% ATAU volz ≥ 1,0), lebar 1,0-18%, ruang dua arah di
// strip, dasar masih di bawah titik terendah strip (pulse belum patah).
function praAltseason(x, dasar) {
  const dariDasar = (x.e / dasar - 1) * 100
  return dariDasar >= 8 && x.posisi >= 0.5 &&
    (x.r12 >= 2 || x.volz >= 1.0) &&
    x.lebarPct >= 1.0 && x.lebarPct <= 18 &&
    x.hiAll > x.e && x.loAll < x.e &&
    dasar < x.loAll
}

// ---------- kunci kelas dari FAKTA 48 jam (murni; dipakai kurator & auditor) ----------
// konservatif: yang menyiksa posisi dihitung dulu (likuid > sisanya);
// BALIK-SEJATI wajib KEDUA fakta (target & dasar); mendem di-split dari
// FAKTA close48 (run-2)
function kelasDariFakta(jamLikuid, jamPuncak, jamGagal, close48, entry) {
  if (jamLikuid !== null) return jamLikuid <= 12 ? 'LIKUIDASI-KILAT' : 'LIKUIDASI-PELAN'
  if (jamPuncak !== null && jamGagal !== null) return 'BALIK-SEJATI'
  if (jamPuncak !== null) return 'MIMPI-BELUM-PULANG'
  return close48 >= entry ? 'MENDEM-DI-PANAS' : 'SEMPIT-MENANG'
}
function putusan48(entry, puncak, dasar, ambang, jalan) {
  let jamLikuid = null, jamPuncak = null, jamGagal = null
  let tinggi = -Infinity, rendah = Infinity
  for (let j = 0; j < jalan.length; j++) {
    const { h, l, c } = jalan[j]
    if (h > tinggi) tinggi = h
    if (l < rendah) rendah = l
    if (jamLikuid === null && h >= ambang) jamLikuid = j + 1
    if (jamPuncak === null && l <= puncak) jamPuncak = j + 1
    if (jamGagal === null && l <= dasar) jamGagal = j + 1
  }
  const close48 = jalan[jalan.length - 1].c
  const kelas = kelasDariFakta(jamLikuid, jamPuncak, jamGagal, close48, entry)
  return { kelas, jamLikuid, jamPuncak, jamGagal, tinggi, rendah, close48 }
}

// ---------- ambil klines nyata (cache luar repo; perisai warisan V325) ----------
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
  semua.sort((a, b) => a[0] - b[0])
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
  cacheSet(kunci, rows)
  return rows.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}
async function ambilFunding(simbol, dariT, sampaiT) {
  const kunci = `f-${simbol}`
  const hit = cacheGet(kunci)
  if (hit) return hit
  try {
    const semua = []
    let startTime = dariT
    for (let p = 0; p < 8; p++) {
      const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${simbol}&startTime=${startTime}&endTime=${sampaiT}&limit=1000`
      const res = await fetchTahan(url)
      if (!res.ok) { cacheSet(kunci, null); return null }
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

// ---------- FASE A: deteksi peristiwa altseason terkonfirmasi dari harian ----------
// data masa depan HANYA untuk memilih JENDELA (memastikan kita berdiri di
// dalam gelombang yang SEJARAH buktikan lanjut — nasib para short nyata) —
// kelasHasil soal tetap dihitung HANYA dari jalan 48 jam setelah kartu.
function deteksiPeristiwaAltseason(harian, btcPerHari) {
  const hariJem = []
  for (let i = 7; i < harian.length; i++) {
    if (i + KONFIRMASI_HARI >= harian.length) break // konfirmasi wajib utuh — sisa pendek dilewati jujur
    const d = harian[i]
    const dasar = harian[i - 7].c // dasar gelombang 7-hari (pra-pump)
    if (!(dasar > 0)) continue
    const ret7 = d.c / dasar - 1
    if (ret7 < RET7_MIN) continue
    const btc = btcPerHari.get(isoHari(d.t))
    if (!btc) continue // hari tanpa pembanding BTC — dilewati jujur (nol karangan)
    const btc7 = btc.c / btc.dasar - 1
    if (ret7 - btc7 < OUTPERF_MIN) continue // tidak mengalahkan BTC — bukan ciri musim alt
    const vMean = harian.slice(i - NIV, i).reduce((a, b) => a + b.v, 0) / NIV
    if (vMean <= 0) continue
    const volz = d.v / vMean
    if (volz < VOLZ_MIN) continue
    const lanjut = harian.slice(i + 1, i + 1 + KONFIRMASI_HARI).some(k => k.h >= d.c * LANJUT_MIN) // pump terbukti lanjut — nasib para short terbukti menanti
    if (!lanjut) continue
    hariJem.push({ i, volz, v: d.v, dasar })
  }
  // kelompokkan hari beruntun (gap ≤ 3 hari) jadi SATU peristiwa; inti = volume terbesar
  const peristiwa = []
  for (const h of hariJem) {
    const terakhir = peristiwa[peristiwa.length - 1]
    if (terakhir && h.i - terakhir.inti.i <= 3) {
      if (h.v > terakhir.inti.v) terakhir.inti = h
    } else peristiwa.push({ inti: h })
  }
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
function pilihKandidat(kandidat, sasaranKelas, simbolList, pemilikTanda, bolehKurang) {
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
          if (pemilik && pemilik !== KELAS_PASAR[ki].id) continue
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
  if (kurang > 0 && !bolehKurang) throw new Error(`soal tak cukup: kurang ${kurang} dari ${totalAwal} — jendela wajib diperluas, bukan diperdaya`)
  pilihan.sort((a, b) => a.ki - b.ki || a.t - b.t)
  return { pilihan, pemilikTanda, sasaranAwal: sasaranKelas }
}

// ---------- sasaran proporsional dari KENYATAAN sejarah (warisan run-3 V326) ----------
function sasaranProporsional(stat, total, lantai, kapasitas) {
  const momen = KELAS_PASAR.map(k => stat[k.id].momen)
  const sum = momen.reduce((a, b) => a + b, 0)
  if (sum <= 0) throw new Error('kolam kosong — jendela wajib diperluas, bukan diperdaya')
  let s = momen.map((m, i) => Math.max(Math.min(lantai, m), Math.floor(total * m / sum)))
  let selisih = total - s.reduce((a, b) => a + b, 0)
  while (selisih !== 0) {
    let iMax = 0
    for (let i = 1; i < s.length; i++) if (s[i] > s[iMax]) iMax = i
    s[iMax] += selisih > 0 ? 1 : -1
    selisih += selisih > 0 ? -1 : 1
  }
  if (kapasitas) {
    s = s.map((v, i) => Math.min(v, kapasitas[i]))
    let kurang = total - s.reduce((a, b) => a + b, 0)
    for (let giliran = 0; kurang > 0 && giliran < 400; giliran++) {
      const ruang = s.map((v, i) => kapasitas[i] - v)
      const totRuang = ruang.reduce((a, b) => a + b, 0)
      if (totRuang <= 0) break
      let dapat = 0
      ruang.forEach((r, i) => { const beri = Math.min(r, Math.max(1, Math.floor(total * r / totRuang / 10)), kurang - dapat); if (beri > 0) { s[i] += beri; dapat += beri } })
      kurang -= dapat
      if (dapat === 0) {
        let iR = 0
        for (let i = 1; i < ruang.length; i++) if (ruang[i] > ruang[iR]) iR = i
        if (ruang[iR] > 0 && (s[iR] < kapasitas[iR])) { s[iR]++; kurang-- }
      }
    }
    if (kurang > 0) throw new Error(`kapasitas nyata ${s.reduce((a, b) => a + b, 0)} < ${total} — jendela wajib diperluas, bukan diperdaya`)
  }
  return s
}

// ---------- tanda keluarga SEJARAH: '10' + 6 bit kasus + 5 bit aspek + 19 bit hash stem ----------
function tandaSejarah(kasusIdx, aspekIdx, stem) {
  const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
  const h = createHash('sha256').update('SEJARAH-V331|' + stem).digest('hex')
  const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
  return '10' + bits(6, kasusIdx) + bits(5, aspekIdx) + ekor
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  const batasUtama = Date.now() - UTAMA_HARI * 86400e3
  console.log(`FASE A: klines 1d nyata ${KOIN.length} koin × ${LAMA_HARIAN} hari (±6 tahun) — memburu gelombang ALTSEASON yang SEJARAH buktikan lanjut (ret7 ≥ +12%, mengalahkan BTC ≥ +8 poin, volume ≥ ${VOLZ_MIN}×, lanjut ≥ +10% dalam 40 hari)…`)
  // pembanding BTC: musim alt = LEBAR (alt mengalahkan BTC bersamaan) — nol karangan
  const btcHarian = await ambilKlines1d('BTCUSDT', Math.ceil(LAMA_HARIAN / 1000))
  const btcPerHari = new Map()
  for (let i = 7; i < btcHarian.length; i++) btcPerHari.set(isoHari(btcHarian[i].t), { c: btcHarian[i].c, dasar: btcHarian[i - 7].c })
  console.log(`  pembanding BTC: ${btcPerHari.size} hari (${isoHari(btcHarian[7].t)} → ${isoHari(btcHarian[btcHarian.length - 1].t)})`)
  const koinData = []
  for (const simbol of KOIN) {
    try {
      const harian = await ambilKlines1d(simbol, Math.ceil(LAMA_HARIAN / 1000))
      if (harian.length < 600) { console.log(`  ${simbol}: SKIP jujur (sejarah ${harian.length} hari terlalu pendek)`); continue }
      const peristiwa = simbol === 'BTCUSDT' ? [] : deteksiPeristiwaAltseason(harian, btcPerHari)
      const f = await ambilFunding(simbol, harian[0].t, harian[harian.length - 1].t)
      koinData.push({ simbol, harian, peristiwa, funding: f })
      console.log(`  ${simbol}: ${harian.length} hari, ${peristiwa.length} peristiwa altseason terkonfirmasi (${isoHari(harian[0].t)} → ${isoHari(harian[harian.length - 1].t)}), funding ${f ? f.length + ' titik' : 'TAK ADA (jujur null)'}`)
    } catch (e) { console.log(`  ${simbol}: SKIP jujur (${e.message})`) }
  }
  if (koinData.length < 30) throw new Error(`koin sah ${koinData.length} < 30 — sumber nyata tak cukup, jujur berhenti`)
  const totPeristiwa = koinData.reduce((a, k) => a + k.peristiwa.length, 0)
  console.log(`  total peristiwa altseason: ${totPeristiwa} (BTC sendiri nol — tak pernah "mengalahkan BTC"; jujur)`)

  console.log('\nFASE B: jendela 1h 168 jam per peristiwa altseason…')
  let totJendela = 0, upaya = 0
  for (const k of koinData) {
    k.jendela = []
    for (const ev of k.peristiwa) {
      const t0 = k.harian[ev.inti.i].t
      const startT = t0 - 72 * 3600e3, endT = t0 + 96 * 3600e3 - 1
      let lilin = []
      try { lilin = await ambilJendela1h(k.simbol, startT, endT) } catch (e) { console.log(`  ${k.simbol} ${isoHari(t0)}: jendela gagal (${e.message}) — lewati jujur`); continue }
      upaya++
      if (upaya % 200 === 0) console.log(`  … ${upaya} jendela diproses (${totJendela} sah)`)
      if (lilin.length < STRIP + JENDELA + 2) continue
      k.jendela.push({ t0, hari: isoHari(t0), dasar: ev.inti.dasar, lilin })
      totJendela++
    }
    await tidur(400)
  }
  console.log(`  jendela altseason terangkut: ${totJendela}`)

  // ---------- FASE C: kurasi momen premis-altseason (kartu dari strip R8 — deterministik) ----------
  const kurasi = (jendelaList) => {
    const kandidat = KELAS_PASAR.map(() => ({}))
    const stat = {}
    for (const k of KELAS_PASAR) stat[k.id] = { momen: 0 }
    let peristiwaDipakai = 0
    for (const { t0, hari, dasar, lilin, simbol, funding } of jendelaList) {
      peristiwaDipakai++
      const dasarR = R8(dasar)
      for (let i = STRIP; i < lilin.length - JENDELA; i++) {
        const stripR = lilin.slice(i - STRIP, i + 1).map(l => ({ o: R8(l.o), h: R8(l.h), l: R8(l.l), c: R8(l.c), v: R8(l.v) }))
        const x = fiturDari(stripR)
        if (!praAltseason(x, dasarR)) continue
        const entry = R8(x.e)
        const puncak = R8(x.loAll) // target turun: titik terendah strip
        const ambang = R8(entry * (2 - AMBANG_R)) // +20% melawan short — margin x5 habis
        const jalan = lilin.slice(i + 1, i + 1 + JENDELA).map(l => ({ h: R8(l.h), l: R8(l.l), c: R8(l.c) }))
        const put = putusan48(entry, puncak, dasarR, ambang, jalan)
        const ki = KELAS_PASAR.findIndex(k => k.id === put.kelas)
        stat[put.kelas].momen++
        const f24 = fundingPada(funding, lilin[i].t)
        const tanda = tandaDari(x, f24)
        ;(kandidat[ki][simbol] = kandidat[ki][simbol] || []).push({
          i, t: lilin[i].t, t0, simbol, tanda, sisi: 'SHORT', dipakai: false,
          entryR: entry, puncakR: puncak, dasarR, ambangR: ambang,
          dariDasarPct: R8((entry / dasarR - 1) * 100),
          jamLikuid: put.jamLikuid, jamPuncak: put.jamPuncak, jamGagal: put.jamGagal,
          tinggiR: R8(put.tinggi), rendahR: R8(put.rendah), closeR: R8(put.close48),
          altseasonHari: hari, fundingR: f24 == null ? null : R8(f24),
        })
      }
    }
    return { kandidat, stat, peristiwaDipakai }
  }
  const rekonstruksi = (c, lilin) => {
    const strip = lilin.slice(c.i - STRIP, c.i + 1)
    return { ...c, stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]) }
  }
  const premisTeks = (c) => `short x5 di ${c.entryR} — "alt pump ${c.dariDasarPct}% dari dasar gelombang, terlalu panas, pasti balik" (nalar penjual-pantulan profesional); puncak ambisi ${c.puncakR} (target turun); jatuh kembali ke dasar gelombang ${c.dasarR} = pulse musim patah, tesis balik terbukti; ambang likuidasi ${c.ambangR} (+20%, margin x5 habis — hal yang para profesional juga lupakan) — jendela ${JENDELA} jam — nasib para short musim alt diputuskan di sini`
  const bentukSoalPasar = (sel, jendelaList, kelasAwal) => {
    const lilinMap = new Map(jendelaList.map(j => [`${j.simbol}|${j.t0}`, j.lilin]))
    return sel.pilihan.map((c, idx) => {
      const r = rekonstruksi(c, lilinMap.get(`${c.simbol}|${c.t0}`))
      return {
        id: idx + 1, keluarga: 'PASAR', simbol: c.simbol, waktu: iso(c.t), altseasonHari: c.altseasonHari, sisi: 'SHORT',
        premis: premisTeks(c),
        entry: c.entryR, puncakAmbisi: c.puncakR, dasarSelamat: c.dasarR, ambangLikuid: c.ambangR,
        strip24: r.stripR, tanda: c.tanda, funding24: c.fundingR,
        kelasHasil: KELAS_PASAR[c.ki].id,
        jamLikuid: c.jamLikuid, jamPuncak: c.jamPuncak, jamGagal: c.jamGagal,
        tinggi48: c.tinggiR, rendah48: c.rendahR, close48: c.closeR,
        sasaranAwal: kelasAwal,
      }
    })
  }

  // --- bank utama: peristiwa 2.000 hari terakhir → 3452 soal PASAR ---
  const jendelaUtama = koinData.flatMap(k => k.jendela.filter(j => j.t0 >= batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  console.log('\nFASE C: kolam utama ' + jendelaUtama.length + ' jendela altseason (2.000 hari terakhir)')
  const utama = kurasi(jendelaUtama)
  console.log('--- bukti pasar kejam: nasib 48 jam setelah momen premis-altseason (kolam utama) ---')
  for (const k of KELAS_PASAR) console.log(`  ${k.id}: ${utama.stat[k.id].momen} momen`)
  const totMomen = KELAS_PASAR.reduce((a, k) => a + utama.stat[k.id].momen, 0)
  if (totMomen < SASARAN_UTAMA + 150) throw new Error(`momen premis ${totMomen} < ${SASARAN_UTAMA + 150} — peristiwa/jendela wajib diperluas, jujur berhenti`)
  const wajahKelas = new Map()
  KELAS_PASAR.forEach((k, ki) => {
    for (const simbol of Object.keys(utama.kandidat[ki])) for (const c of utama.kandidat[ki][simbol]) {
      if (!wajahKelas.has(c.tanda)) wajahKelas.set(c.tanda, new Set())
      wajahKelas.get(c.tanda).add(k.id)
    }
  })
  const bebas = [...wajahKelas.values()].filter(s => s.size === 1).length
  console.log(`  momen premis utama: ${totMomen} — wajah unik: ${wajahKelas.size} — bebas tabrakan lintas kelas: ${bebas} (butuh ≥ ${SASARAN_UTAMA})`)
  KELAS_PASAR.forEach((k, ki) => {
    let unik = 0, bebasK = 0
    const seen = new Set()
    for (const simbol of Object.keys(utama.kandidat[ki])) for (const c of utama.kandidat[ki][simbol]) {
      if (!seen.has(c.tanda)) { unik++; seen.add(c.tanda) }
      if ((wajahKelas.get(c.tanda) || new Set()).size === 1) bebasK++
    }
    console.log(`  ${k.id}: momen ${utama.stat[k.id].momen} — wajah unik ${unik} — bebas tabrakan ${bebasK}`)
  })
  if (bebas < SASARAN_UTAMA) throw new Error(`wajah bebas tabrakan ${bebas} < ${SASARAN_UTAMA} — variasi kartu wajib dibuka lebih lebar, jujur berhenti`)
  const klonProbe = utama.kandidat.map(bySimbol => {
    const salin = {}
    for (const [simbol, arr] of Object.entries(bySimbol)) salin[simbol] = arr.map(c => ({ ...c, dipakai: false }))
    return salin
  })
  // PELAJARAN RUN-2 (terbuka): probe run-1 menyasar 9999/kelas = menguras
  // seluruh kolam 60.941 momen — kuadratik, 560 dtk tak cukup. Probe kini
  // MEMVERIFIKASI KECUKUPAN (sasaran proporsional ×1,5 + 50 per kelas) —
  // jaminan yang sama bagi klem kapasitas, biaya berhenti lebih awal.
  const sasaranProba = sasaranProporsional(utama.stat, SASARAN_UTAMA, 30)
  const targetProbe = sasaranProba.map(v => Math.min(Math.ceil(v * 1.5) + 50, 9999))
  const probe = pilihKandidat(klonProbe, targetProbe, koinData.map(k => k.simbol), new Map(), true)
  const kapasitas = KELAS_PASAR.map((k, ki) => probe.pilihan.filter(p => p.ki === ki).length)
  console.log(`  probe kapasitas nyata per kelas (target verifikasi [${targetProbe.join(', ')}]): [${kapasitas.join(', ')}] = ${kapasitas.reduce((a, b) => a + b, 0)}`)
  const pemilikTandaGlobal = new Map()
  const sasaranUtama = sasaranProporsional(utama.stat, SASARAN_UTAMA, 30, kapasitas)
  console.log(`  sasaran utama (proporsional, klem kapasitas): [${sasaranUtama.join(', ')}] = ${sasaranUtama.reduce((a, b) => a + b, 0)}`)
  const selUtama = pilihKandidat(utama.kandidat, sasaranUtama, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soalPasar = bentukSoalPasar(selUtama, jendelaUtama, sasaranUtama)

  // --- keluarga SEJARAH: 48 soal kasus dunia ---
  const soalSejarah = []
  let sid = 0
  KASUS_ALTSEASON_SEJARAH.forEach((kasus, kasusIdx) => {
    kasus.fakta.forEach((f, aspekIdx) => {
      const tanda = tandaSejarah(kasusIdx, aspekIdx, f.tanya)
      if (pemilikTandaGlobal.has(tanda)) throw new Error(`tanda sejarah ${tanda} TABRAKAN dengan wajah pasar — salt wajib diganti, jujur berhenti`)
      pemilikTandaGlobal.set(tanda, 'JAWAB-' + 'ABCD'[f.kunci])
      soalSejarah.push({
        id: soalPasar.length + (++sid), keluarga: 'SEJARAH', kasus: kasus.id, kasusIdx, aspekIdx,
        tanya: f.tanya, opsi: f.opsi, kunci: f.kunci,
        premis: `kasus sejarah dunia musim alt penuh yang melikuidasi jutaan trader short termasuk profesional — ${kasus.nama}`,
        tanda, kelasHasil: 'JAWAB-' + 'ABCD'[f.kunci],
      })
    })
  })
  console.log(`\nkeluarga SEJARAH: ${soalSejarah.length} soal kasus dunia (XRP-2017/DOGE-WSB-2021/XRP-SEC-SQUEEZE/DOGE-SNL-2021/ALTSEASON-JAN-2021/LINK-DEFI-2020/XRP-NOV-2024/WIF-2024 + pelajaran profesional)`)
  const soalUtama = [...soalPasar, ...soalSejarah]
  const distKoin = {}, distKelas = {}, distSisi = { SHORT: 0 }, distFunding = { negatif: 0, positifKecil: 0, panas: 0, tanpaData: 0 }, distKeluarga = {}
  for (const s of soalUtama) {
    distKeluarga[s.keluarga] = (distKeluarga[s.keluarga] || 0) + 1
    distKelas[s.kelasHasil] = (distKelas[s.kelasHasil] || 0) + 1
    if (s.keluarga === 'PASAR') {
      distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1
      distSisi[s.sisi]++
      const g = s.funding24 == null ? 'tanpaData' : s.funding24 < 0 ? 'negatif' : s.funding24 > 0.0005 ? 'panas' : 'positifKecil'
      distFunding[g]++
    }
  }
  if (soalUtama.length !== SASARAN_UTAMA + SASARAN_SEJARAH) throw new Error(`total soal ${soalUtama.length} ≠ 3500 — jujur berhenti`)

  // --- bank dadakan: peristiwa LAMA (> 2.000 hari) tak tersentuh tempa utama → 350 soal PASAR ---
  const jendelaLama = koinData.flatMap(k => k.jendela.filter(j => j.t0 < batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  const lama = kurasi(jendelaLama)
  console.log(`\nkolam dadakan ${jendelaLama.length} jendela altseason (> 2.000 hari)`)
  for (const k of KELAS_PASAR) console.log(`  ${k.id}: ${lama.stat[k.id].momen} momen`)
  const sasaranDadak = sasaranProporsional(lama.stat, SASARAN_DADAK, 10)
  console.log(`  sasaran dadakan (proporsional): [${sasaranDadak.join(', ')}] = ${sasaranDadak.reduce((a, b) => a + b, 0)}`)
  const selLama = pilihKandidat(lama.kandidat, sasaranDadak, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soalDadak = bentukSoalPasar(selLama, jendelaLama, sasaranDadak)
  const distKoinDadak = {}, distKelasDadak = {}, distSisiDadak = { SHORT: 0 }
  for (const s of soalDadak) { distKoinDadak[s.simbol] = (distKoinDadak[s.simbol] || 0) + 1; distKelasDadak[s.kelasHasil] = (distKelasDadak[s.kelasHasil] || 0) + 1; distSisiDadak[s.sisi]++ }

  const tulis = (file, protokol, soal, stat, distK, distKl, distS, cara) => {
    const bank = {
      protokol, epoch: 'V331', diperbarui: new Date().toISOString(),
      sumber: 'Binance spot klines 1d publik (api.binance.com, deteksi gelombang altseason: ret7 ≥ +12%, mengalahkan BTC ≥ +8 poin, volume ≥ 1,15× rata-20, WAJIB terkonfirmasi sejarah: dalam 40 hari harga menyentuh ≥ +10% dari tutup inti — pump terbukti lanjut, nasib short terbukti menanti; 91 koin + BTC pembanding, ±6 tahun) + klines 1h jendela 168 jam per peristiwa + funding rate futures publik (fapi.binance.com) + catatan kasus dunia publik (XRP-2017/DOGE-WSB-2021/XRP-SEC-SQUEEZE/DOGE-SNL-2021/ALTSEASON-JAN-2021/LINK-DEFI-2020/XRP-NOV-2024/WIF-2024) — lilin, waktu, harga, funding, fakta ASLI, nol karangan',
      cara,
      aturanKelas: KELAS_PASAR.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })).concat(KELAS_JAWAB.map(j => ({ id: j, naive: 'SEJARAH', cerita: 'jawaban benar soal kasus sejarah/pelajaran profesional (pilihan A-D, kunci tersegel)' }))),
      statistikMomen: stat, distKoin: distK, distKelas: distKl, distSisi: distS, distFunding, distKeluarga, jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  const caraUtama = `mandat pemilik V331: 3500 soal dari kasus nyata FULL ALTSEASON yang melikuidasi jutaan trader SHORT termasuk profesional — KELUARGA PASAR ${SASARAN_UTAMA} soal SATU SISI (SHORT x5 — inilah korban musim alt yang dimandatkan; arah pasar hanya ada BUY/SELL dan kunci arah tetap dari FAKTA 48 jam): FASE A deteksi hari-altseason dari klines 1d ±6 tahun × 91 koin + BTC pembanding (ret7 ≥ +12% ATAU lebih; ret7 alt − ret7 BTC ≥ +8 poin — ciri LEBAR musim alt; volume ≥ 1,15× rata-20; WAJIB TERKONFIRMASI SEJARAH: dalam 40 hari harga menyentuh ≥ +10% dari tutup inti — pump terbukti lanjut; hari beruntun gap ≤3 hari = satu peristiwa, inti = volume terbesar; maks 50 peristiwa/koin merata sejarah; BTC sendiri nol peristiwa — tak pernah "mengalahkan BTC", jujur); FASE B jendela 1h 168 jam [T0-72h, T0+96h); FASE C momen PREMIS-ALTSEASON (entry = close strip ≥ +8% di atas dasar gelombang 7-hari; posisi ≥ 0,5; momentum hidup r12 ≥ +2% ATAU volz ≥ 1,0; lebar 1,0-18%; ruang naik-turun di strip; dasar gelombang masih di bawah titik terendah strip — pulse belum patah; EVOLUSI RUN TERBUKA terdokumentasi di cara-bank); SHORT x5 di close — mewakili trader profesional penjual-pantulan yakin "terlalu panas = pasti balik"; puncak ambisi = titik terendah strip (target turun); dasar selamat = dasar gelombang 7-hari (jatuh ke dasar = pulse patah, tesis terbukti); ambang likuidasi entry×1,20 (margin x5 habis); jalan 48 jam → 6 kelas dari fakta (bedah kecepatan; PELAJARAN RUN-1 TERBUKA: kelas BALIK-LANGSUNG run-1 MUSNAH MELALUI KONSTRUKSI — dasar gelombang selalu di bawah target strip, jatuh ke dasar pasti menembus target dulu, kolam run-1: 0 momen dari 60.941 — run-2 menggantinya split MENDEM dari FAKTA close48: MENDEM-DI-PANAS close48 ≥ entry / SEMPIT-MENANG close48 < entry); konservatif dalam satu lilin (yang menyiksa dihitung dulu: likuid > sisanya); kartu 24 lilin + tanda 40 bit identik warisan (18 + 2 funding + 20 anatomi dua tier); satu tanda satu kelas (nol tabrakan wajah LINTAS bank); jarak kartu 24 jam ABSOLUT; bank utama = peristiwa 2.000 hari terakhir, dadakan = lebih tua; kurasi & ujiBank memakai strip R8; data masa depan HANYA memilih jendela — kelasHasil dihitung HANYA dari jalan 48 jam; PROBE kapasitas nyata mengklam sasaran — kelas tercekik diambil apa adanya, sisa dialihkan proporsional, kurang total = berhenti jujur. KELUARGA SEJARAH ${SASARAN_SEJARAH} soal: fakta & pelajaran kasus dunia publik (XRP-2017: $0,20 → $3,84 +1.800%, short profesional dilikuidasi sebelum runtuh ke $0,11; DOGE-WSB-2021: $0,0077 → $0,0695 +800% dalam ±48 jam; XRP-SEC-SQUEEZE: "koin yang dihukum" justru +220% dulu ke $0,90, runtuh $0,17 belakangan; DOGE-SNL-2021: $0,27 → $0,74 pra-SNL, short puncak dilikuidasi dulu; ALTSEASON-JAN-2021: ADA $0,17 → $1,45 +750%, lebar lintas koin; LINK-DEFI-2020: $2,30 → $20,11, overbought berpekan-pekan; XRP-NOV-2024: $0,52 → $3,40, likuidasi short miliaran dolar; WIF-2024: $0,46 → $5,16 +1.000%) + 20 pelajaran profesional — pilihan A-D, kunci tersegel, tanda '10'+6bit kasus+5bit aspek+19bit hash stem salt SEJARAH-V331`
  tulis('ujian/soal-altseason-3500.json', 'SOAL-ALTSEASON-3500', soalUtama, utama.stat, distKoin, distKelas, distSisi, caraUtama)
  tulis('ujian/soal-altseason-dadakan-350.json', 'SOAL-ALTSEASON-350-DADAKAN', soalDadak, lama.stat, distKoinDadak, distKelasDadak, distSisiDadak, caraUtama + '; dadakan dari peristiwa LAMA (>2.000 hari) tak tersentuh tempa utama — semua PASAR')

  console.log('\ndist keluarga utama:', JSON.stringify(distKeluarga))
  console.log('dist kelas utama:', JSON.stringify(distKelas))
  console.log('dist sisi utama:', JSON.stringify(distSisi))
  console.log('dist funding utama:', JSON.stringify(distFunding))
  console.log('dist kelas dadakan:', JSON.stringify(distKelasDadak), '| sisi:', JSON.stringify(distSisiDadak))
}

main().catch(e => { console.error('tambang-altseason3500 MATI-PENUH:', e.message); process.exit(1) })
