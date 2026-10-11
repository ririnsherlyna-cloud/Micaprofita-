#!/usr/bin/env node
// ============================================================
// TAMBANG-PUMPSPIKE-3500 (V333) — mandat pemilik (2026-10-11):
//   "Sekarang ujian 3500 soal ujian simulasi dimana kita buat Dan
//    pelajari Dari kasus nyata yakni (Pump spike) yang berhasil
//    lumpuhkan jutaan trader di Dunia baik tipe short, kemudian
//    tipe long Dan level trader itu bahkan professional trader,
//    paham kan silahkan pastikan jikalau 3500 belum Lulus
//    semuanya kita buat dia inovasikan lagi agar Lulus penuh"
// ------------------------------------------------------------
// Sumber soal HANYA kasus nyata (nol karangan), DUA KELUARGA:
//   KELUARGA PASAR (3452 soal) — pump spike betulan di Binance:
//     FASE A — klines 1d publik (±8 tahun, hingga 3000 lilin per koin,
//       91 koin; cache warisan SQUEEZE dipakai — fakta API yang sama):
//       hari-spike = tutup hari memenuhi SEMUA:
//         (1) vertikal intraday (high − open)/open ≥ +9% — kaki naik
//             vertikal dalam SATU hari (ciri pump spike);
//         (2) volume ≥ 1,5× rata-20 — bahan bakar lonjakan.
//       TANPA konfirmasi masa-depan untuk pemilihan jendela: nasib
//       DUA sisi (short dilikuidasi saat lanjut; long dilikuidasi saat
//       runtuh) justru adalah MATERI UJIAN — dihitung dari jalan 48 jam.
//       Hari beruntun (gap ≤ 3 hari) = SATU peristiwa; inti = hari
//       volume terbesar. Maks 50 peristiwa per koin, merata menyebar
//       sejarah (deterministik, nol acak).
//     FASE B — per peristiwa: klines 1h jendela 288 jam [T0-48h, T0+240h)
//       (PELAJARAN RUN-2: jendela 144 jam run-1/run-2 hanya 47 posisi strip
//       per peristiwa — kolam 5.4k momen, wajah bebas tabrakan 2.747 <
//       3.452, jujur berhenti; jendela 288 jam melipatgandakan posisi ~4×).
//     FASE C — momen ujian = strip 24 lilin memenuhi PREMIS-SPIKE
//       (kartu menunjukkan vertikal hidup; masa depan tak disentuh):
//       volz ≥ 1,0 (bahan bakar), posisi ≥ 0,5 (harga di paruh atas
//       strip), lebar strip 4-60% (vertikal), momentum hidup (r3 ≥
//       +1,5% ATAU r12 ≥ +4%), strip menembus atas rentang 23 jam
//       sebelumnya (hiAll > hi20 — esensi spike), ruang naik-turun di
//       strip (hiAll ≥ 1,5% di atas close; loAll ≥ 1,5% di bawah close).
//       SISI DITENTUKAN FAKTA KARTU (bukan masa depan, bukan untung-untungan):
//         wickAtas > 1,0× badan DAN wickAtas ≥ wickBawah → SHORT x5
//           ("spike gagal tertutup — pasti balik" — nalar pemburu balik)
//         selain itu → LONG x5
//           ("vertikal tertutup kuat — pasti lanjut" — nalar pemburu momentum)
//       Posisi profesional x5 masuk di close strip:
//         SHORT x5: puncak ambisi = titik terendah strip (target turun);
//                   dasar selamat = dasar pra-pump 24 jam (min low 24
//                   lilin sebelum strip — WAJIB di bawah strip low);
//                   ambang likuidasi = entry × 1,20 (+20% — margin x5 habis)
//         LONG x5 : puncak ambisi = titik tertinggi strip (target naik);
//                   dasar selamat = strip low (roboh ke bawah strip =
//                   spike mati); ambang likuidasi = entry × 0,80 (−20%)
//       Jalan 48 jam memutuskan 12 kelas dari FAKTA — bedah KECEPATAN
//       dua sisi (warisan V323/V325/V326/V330/V331): sisi SHORT =
//       LIKUIDASI-KILAT/PELAN (ambang ≤/> 12 jam), BALIK-SEJATI (target
//       turun TERSINTUH dan dasar pra-pump pecah), MIMPI-BELUM-PULANG
//       (target turun saja), MENDEM-DI-UDARA / SEMPIT-MENANG (split
//       close48); sisi LONG = LIKUIDASI-KILAT/PELAN (ambang ≤/> 12 jam),
//       ANGKAT-SEJATI (target naik TERSINTUH dan close48 ≥ entry),
//       MIMPI-PALSU (target naik tapi close48 < entry — menyentuh puncak
//       bukan selamat), MENDEM-DI-TINGGI / SEMPIT-KALAH (split close48).
//       Konservatif dalam satu lilin: yang menyiksa posisi dihitung
//       dulu (likuid > semua yang lain).
//   KELUARGA SEJARAH (48 soal) — kasus dunia pump spike yang melikuidasi
//     DUA sisi bahkan trader PROFESIONAL (kasus-pumpspike-sejarah.mjs):
//     GME-2021 ($39→$483→−90%; Melvin −53%; dua pemakaman satu peristiwa),
//     VW-2008 (€210→€1.005 dalam 2 hari, squeeze terbrutal saham, lalu −70%),
//     CHF-2015 (lantai SNB dihapus: +30% dalam MENIT; Alpari pailit, FXCM
//     bailout $300 jt), FLASH-CRASH-2010 (DJIA −998 poin menit → V-recovery),
//     BTC-2019-04-02 (+$900 dalam ±1 jam, order raksasa + dugaan spoofing),
//     SHIB-2021-10 (ATH $0,00008861, +780%, lalu −60%), LUNA-2022-05
//     (dead-cat +ratusan% di tengah runtuh; pemburu-dasar mati ke nol),
//     BTC-2017-12-17 (puncak $19.800 hari peluncuran CME; dua fase pemakaman)
//     + 19 pelajaran profesional — pilihan A-D, kunci tersegel.
// Pembagian waktu warisan TEMPAN: peristiwa dalam 2.000 hari terakhir →
// bank utama; lebih tua → bank dadakan 350, tak tersentuh saat tempa
// utama — uji paham-vs-hafal.
// Warisan organ dijaga: kartu 24 lilin, fiturDari/tandaDari 40 bit
// (18 warisan + 2 funding + 20 anatomi dua tier — identik garis
// SQUEEZE/SUCKER/BREAKOUT/ALTSEASON), anti-tabrakan wajah LINTAS bank,
// probe kapasitas nyata, sasaran proporsional klem-kapasitas-dialihkan,
// round-robin deterministik, segel SHA-256 hash16, nol Math.random,
// strip disimpan hasil R8 dan kurasi dihitung dari strip R8 yang sama,
// cache luar repo, perisai fetchTahan (418/429/5xx).
// ============================================================
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { KASUS_PUMPSPIKE_SEJARAH } from './kasus-pumpspike-sejarah.mjs'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

// cache LUAR repo (tak tercommit) — iterasi tambang sopan ke API publik;
// klines 1d & funding dibaca dari cache warisan SQUEEZE (data API yang
// sama persis, fakta yang sama, nol pemalsuan); jendela 1h pump-spike
// sendiri di cache V333
const CACHE = join(process.cwd(), '..', 'cache-pumpspike3500')
const WARISAN = [join(process.cwd(), '..', 'cache-squeeze3500'), join(process.cwd(), '..', 'cache-breakout3500'), join(process.cwd(), '..', 'cache-sucker3500'), join(process.cwd(), '..', 'cache-altseason3500')]
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
const JENDELA = 48          // jalan nilai 48 jam (spike menagih dalam jam-jam)
const LAMA_HARIAN = 3000    // sejarah 1d per koin (cache warisan = 3 halaman)
const UTAMA_HARI = 2000     // peristiwa dalam 2.000 hari terakhir → bank utama; dadakan = lebih tua
const MAKSI_PERISTIWA = 60  // per koin, merata menyebar sejarah (run-3: 50→60)
const VERT_MIN = 0.09       // kaki naik vertikal intraday ≥ +9% (esensi pump spike)
const VOLZ_HARI_MIN = 1.5   // volume hari-spike ≥ 1,5× rata-20
const AMBANG_R = 0.80       // likuidasi x5: SHORT entry×1,20; LONG entry×0,80
const capKoin = 100
const JARAK_MS = 24 * 3600e3 // kartu 24 jam tak boleh tumpang (waktu ABSOLUT)
const NIV = 20              // rata volume 20 hari (bahan bakar)
const BASE24 = 24           // dasar pra-pump: 24 lilin sebelum strip

const SASARAN_UTAMA = 3452  // keluarga PASAR
const SASARAN_SEJARAH = 48  // keluarga SEJARAH
const SASARAN_DADAK = 350   // dadakan (10% dari 3500) — semua PASAR

const KELAS_PASAR = [
  { id: 'SHORT-LIKUIDASI-KILAT', naive: 'SPIKE-PALSU',
    cerita: 'sisi pemburu-balik: ambang likuidasi x5 (+20% melawan short) tersentuh ≤ 12 jam — spike lanjut vertikal dan memusnahkan short "pasti balik" (GME di jalan ke $483, BTC Des 2017)' },
  { id: 'SHORT-LIKUIDASI-PELAN', naive: 'SPIKE-PALSU',
    cerita: 'sisi pemburu-balik: pengeringan lambat — ambang tersentuh setelah > 12 jam; spike menghimpit pelan sampai margin x5 habis (SHIB Sep-Okt 2021)' },
  { id: 'SHORT-BALIK-SEJATI', naive: 'SPIKE-PALSU',
    cerita: 'sisi pemburu-balik yang benar penuh: target turun (strip low) tersentuh DAN dasar pra-pump pecah dalam 48 jam — spike benar-benar mati; short yang selamat menagih di sini (SHIB usai ATH)' },
  { id: 'SHORT-MIMPI-BELUM-PULANG', naive: 'SPIKE-PALSU',
    cerita: 'sisi pemburu-balik yang setengah benar: target turun tersentuh, TAPI dasar pra-pump tak pecah — balik dimulai tapi tak terbukti; short yang menggantung menanggung risiko pantulan kedua (LUNA dead-cat)' },
  { id: 'SHORT-MENDEM-DI-UDARA', naive: 'SPIKE-PALSU',
    cerita: 'sisi pemburu-balik: 48 jam menggantung — tak likuid, tak target, tak pecah dasar, DAN close48 ≥ entry (short tak menang apa pun); spike menggantung di udara' },
  { id: 'SHORT-SEMPIT-MENANG', naive: 'SPIKE-PALSU',
    cerita: 'sisi pemburu-balik: 48 jam tanpa putusan TAPI close48 < entry — short menang sempit tanpa drama; menang sempit tanpa rencana keluar tetap bukan ilmu' },
  { id: 'LONG-LIKUIDASI-KILAT', naive: 'SPIKE-LANJUT',
    cerita: 'sisi pemburu-momentum: ambang likuidasi x5 (−20% melawan long) tersentuh ≤ 12 jam — spike roboh sekejap (DOGE-SNL, LUNA dead-cat, GME usai $483)' },
  { id: 'LONG-LIKUIDASI-PELAN', naive: 'SPIKE-LANJUT',
    cerita: 'sisi pemburu-momentum: pengeringan lambat — ambang tersentuh setelah > 12 jam; chaser x5 tenggelam pelan saat spike mati perlahan' },
  { id: 'LONG-ANGKAT-SEJATI', naive: 'SPIKE-LANJUT',
    cerita: 'sisi pemburu-momentum yang benar: target naik (strip high) tersentuh DAN close48 ≥ entry — momentum benar-benar lanjut (BTC 2 April 2019 lanjut berbulan)' },
  { id: 'LONG-MIMPI-PALSU', naive: 'SPIKE-LANJUT',
    cerita: 'sisi pemburu-momentum yang tertipu: target naik tersentuh TAPI close48 < entry — menyentuh puncak bukan selamat; momentum mati dan yang tidak keluar mengembalikan semuanya (VW setelah €1.005)' },
  { id: 'LONG-MENDEM-DI-TINGGI', naive: 'SPIKE-LANJUT',
    cerita: 'sisi pemburu-momentum: 48 jam menggantung di ketinggian — tak likuid, tak target, close48 ≥ entry; spike menatap langit tanpa putusan' },
  { id: 'LONG-SEMPIT-KALAH', naive: 'SPIKE-LANJUT',
    cerita: 'sisi pemburu-momentum: 48 jam tanpa putusan TAPI close48 < entry — chaser kalah sempit; vertikal yang ditebus pelan-pelan' },
]
const KELAS_JAWAB = ['JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']

// ---------- fitur KARTU (warisan identik garis SQUEEZE/SUCKER/BREAKOUT/ALTSEASON) ----------
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
// sisi dari FAKTA KARTU (bukan masa depan): spike gagal tertutup (wick atas
// menang) → sisi SHORT (nalar pemburu-balik); tertutup kuat → sisi LONG
// (nalar pemburu-momentum). Dua sisi inilah korban pump spike yang
// dimandatkan pemilik ("baik tipe short, kemudian tipe long").
const sisiDariKartu = (x) => (x.wickAtas > 1.0 && x.wickAtas >= x.wickBawah) ? 'SHORT' : 'LONG'

// premis SPIKE dari kartu + dasar pra-pump (fakta waktu-putusan — masa
// depan tak disentuh). Vertikal hidup + sisi konsisten dengan kartu.
// PELAJARAN RUN-1 (terbuka): ambang run-1 (volz ≥ 1,0; posisi ≥ 0,5;
// lebar ≥ 4%; r3 ≥ 1,5/r12 ≥ 4; ruang 1,5%) hanya melahirkan 4.116 momen
// dari 3.673 jendela (1,1/jendela) — wajah bebas tabrakan 1.655 < 3.452,
// jujur berhenti. Run-2 melonggarkan ambang (volz ≥ 0,7; posisi ≥ 0,45;
// lebar ≥ 3%; r3 ≥ 1,0/r12 ≥ 3; ruang 1,0%) — esensi spike (menembus
// atas rentang 23 jam) TETAP WAJIB, nol kompromi di situ.
function praSpike(x, sisi, dasar24) {
  const vertikal = x.volz >= 0.7 && x.posisi >= 0.45 &&
    x.lebarPct >= 3.0 && x.lebarPct <= 60 &&
    (x.r3 >= 1.0 || x.r12 >= 3) &&
    x.hiAll > x.hi20 && // strip menembus atas rentang 23 jam — esensi spike
    x.hiAll >= x.e * 1.01 && x.loAll <= x.e * 0.99 // ruang dua arah nyata
  if (!vertikal) return false
  if (sisi === 'SHORT') {
    return x.wickAtas > 1.0 && x.wickAtas >= x.wickBawah && dasar24 < x.loAll // launch pad di bawah strip low — tesis balik punya ruang
  }
  return !(x.wickAtas > 1.0 && x.wickAtas >= x.wickBawah) && x.loAll > x.e * 0.82 // ambang −20% masih bermakna di bawah strip
}

// ---------- kunci kelas dari FAKTA 48 jam (murni; dipakai kurator & auditor) ----------
// konservatif: yang menyiksa posisi dihitung dulu (likuid > sisanya);
// dua sisi memakai geometri cermin
function kelasDariFakta(sisi, jamLikuid, jamPuncak, jamDasar, close48, entry) {
  if (sisi === 'SHORT') {
    if (jamLikuid !== null) return jamLikuid <= 12 ? 'SHORT-LIKUIDASI-KILAT' : 'SHORT-LIKUIDASI-PELAN'
    if (jamPuncak !== null && jamDasar !== null) return 'SHORT-BALIK-SEJATI'
    if (jamPuncak !== null) return 'SHORT-MIMPI-BELUM-PULANG'
    return close48 >= entry ? 'SHORT-MENDEM-DI-UDARA' : 'SHORT-SEMPIT-MENANG'
  }
  if (jamLikuid !== null) return jamLikuid <= 12 ? 'LONG-LIKUIDASI-KILAT' : 'LONG-LIKUIDASI-PELAN'
  if (jamPuncak !== null) return close48 >= entry ? 'LONG-ANGKAT-SEJATI' : 'LONG-MIMPI-PALSU'
  return close48 >= entry ? 'LONG-MENDEM-DI-TINGGI' : 'LONG-SEMPIT-KALAH'
}
function putusan48(entry, puncak, dasar, ambang, jalan, sisi) {
  let jamLikuid = null, jamPuncak = null, jamDasar = null
  let tinggi = -Infinity, rendah = Infinity
  for (let j = 0; j < jalan.length; j++) {
    const { h, l, c } = jalan[j]
    if (h > tinggi) tinggi = h
    if (l < rendah) rendah = l
    if (sisi === 'SHORT') {
      if (jamLikuid === null && h >= ambang) jamLikuid = j + 1
      if (jamPuncak === null && l <= puncak) jamPuncak = j + 1
      if (jamDasar === null && l <= dasar) jamDasar = j + 1
    } else {
      if (jamLikuid === null && l <= ambang) jamLikuid = j + 1
      if (jamPuncak === null && h >= puncak) jamPuncak = j + 1
    }
  }
  const close48 = jalan[jalan.length - 1].c
  const kelas = kelasDariFakta(sisi, jamLikuid, jamPuncak, jamDasar, close48, entry)
  return { kelas, jamLikuid, jamPuncak, jamDasar, tinggi, rendah, close48 }
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
async function ambilJendela1h(simbol, startT, endT) {
  const kunci = `h-${simbol}-${startT}-v333`
  const hit = cacheGet(kunci)
  if (hit) return hit.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1h&startTime=${startT}&endTime=${endT}&limit=1000`
  const res = await fetchTahan(url)
  if (!res.ok) throw new Error(`${simbol} 1h jendela binance ${res.status}`)
  const rows = await res.json()
  cacheSet(kunci, rows)
  return rows.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
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

// ---------- FASE A: deteksi peristiwa spike vertikal dari harian ----------
// TANPA konfirmasi masa-depan: nasib DUA sisi (short/long) adalah materi
// ujian yang dihitung dari jalan 48 jam — bukan syarat pemilihan jendela.
function deteksiPeristiwaSpike(harian) {
  const hariJem = []
  for (let i = NIV; i < harian.length; i++) {
    const d = harian[i]
    if (!(d.o > 0)) continue
    const vertikal = (d.h - d.o) / d.o // kaki naik vertikal intraday
    if (vertikal < VERT_MIN) continue
    const vMean = harian.slice(i - NIV, i).reduce((a, b) => a + b.v, 0) / NIV
    if (vMean <= 0) continue
    const volz = d.v / vMean
    if (volz < VOLZ_HARI_MIN) continue
    hariJem.push({ i, volz, v: d.v })
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

// ---------- tanda keluarga SEJARAH: '11' + 6 bit kasus + 5 bit aspek + 19 bit hash stem ----------
function tandaSejarah(kasusIdx, aspekIdx, stem) {
  const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
  const h = createHash('sha256').update('SEJARAH-V333|' + stem).digest('hex')
  const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
  return '11' + bits(6, kasusIdx) + bits(5, aspekIdx) + ekor
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  const batasUtama = Date.now() - UTAMA_HARI * 86400e3
  console.log(`FASE A: klines 1d nyata (cache warisan SQUEEZE — data API yang sama) ${KOIN.length} koin — memburu hari-SPIKE VERTIKAL ((high−open)/open ≥ +9%, volume ≥ ${VOLZ_HARI_MIN}× rata-20)…`)
  const koinData = []
  for (const simbol of KOIN) {
    try {
      const harian = cacheGet(`d-${simbol}-3`)
      if (!harian || harian.length < 600) { console.log(`  ${simbol}: SKIP jujur (sejarah harian ${harian ? harian.length : 0} hari tak cukup)`); continue }
      const H = harian.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
      const peristiwa = deteksiPeristiwaSpike(H)
      const f = cacheGet(`f-${simbol}`)
      koinData.push({ simbol, harian: H, peristiwa, funding: Array.isArray(f) ? f : null })
      console.log(`  ${simbol}: ${H.length} hari, ${peristiwa.length} peristiwa spike (${isoHari(H[0].t)} → ${isoHari(H[H.length - 1].t)}), funding ${Array.isArray(f) ? f.length + ' titik' : 'TAK ADA (jujur null)'}`)
    } catch (e) { console.log(`  ${simbol}: SKIP jujur (${e.message})`) }
  }
  if (koinData.length < 30) throw new Error(`koin sah ${koinData.length} < 30 — sumber nyata tak cukup, jujur berhenti`)
  const totPeristiwa = koinData.reduce((a, k) => a + k.peristiwa.length, 0)
  console.log(`  total peristiwa spike: ${totPeristiwa}`)

  console.log('\nFASE B: jendela 1h 288 jam per peristiwa spike [T0-48h, T0+240h)…')
  let totJendela = 0, upaya = 0
  for (const k of koinData) {
    k.jendela = []
    for (const ev of k.peristiwa) {
      const t0 = k.harian[ev.inti.i].t
      const startT = t0 - 48 * 3600e3, endT = t0 + 240 * 3600e3 - 1
      let lilin = []
      try { lilin = await ambilJendela1h(k.simbol, startT, endT) } catch (e) { console.log(`  ${k.simbol} ${isoHari(t0)}: jendela gagal (${e.message}) — lewati jujur`); continue }
      upaya++
      if (upaya % 200 === 0) console.log(`  … ${upaya} jendela diproses (${totJendela} sah)`)
      if (lilin.length < STRIP + BASE24 + JENDELA + 2) continue
      k.jendela.push({ t0, hari: isoHari(t0), lilin })
      totJendela++
    }
    await tidur(400)
  }
  console.log(`  jendela spike terangkut: ${totJendela}`)

  // ---------- FASE C: kurasi momen premis-spike (kartu dari strip R8 — deterministik) ----------
  const kurasi = (jendelaList) => {
    const kandidat = KELAS_PASAR.map(() => ({}))
    const stat = {}
    for (const k of KELAS_PASAR) stat[k.id] = { momen: 0 }
    let peristiwaDipakai = 0
    for (const { t0, hari, lilin, simbol, funding } of jendelaList) {
      peristiwaDipakai++
      for (let i = STRIP + BASE24; i < lilin.length - JENDELA; i++) {
        const stripR = lilin.slice(i - STRIP, i + 1).map(l => ({ o: R8(l.o), h: R8(l.h), l: R8(l.l), c: R8(l.c), v: R8(l.v) }))
        const x = fiturDari(stripR)
        const sisi = sisiDariKartu(x)
        const dasar24R = R8(Math.min(...lilin.slice(i - STRIP - BASE24, i - STRIP).map(l => l.l)))
        if (!praSpike(x, sisi, dasar24R)) continue
        const entry = R8(x.e)
        const puncak = R8(sisi === 'SHORT' ? x.loAll : x.hiAll) // target: turun bagi short, naik bagi long
        const dasar = R8(sisi === 'SHORT' ? dasar24R : x.loAll) // dasar selamat: pra-pump bagi short, strip low bagi long
        const ambang = R8(sisi === 'SHORT' ? entry * (2 - AMBANG_R) : entry * AMBANG_R) // +20% / −20% — margin x5 habis
        const jalan = lilin.slice(i + 1, i + 1 + JENDELA).map(l => ({ h: R8(l.h), l: R8(l.l), c: R8(l.c) }))
        const put = putusan48(entry, puncak, dasar, ambang, jalan, sisi)
        const ki = KELAS_PASAR.findIndex(k => k.id === put.kelas)
        stat[put.kelas].momen++
        const f24 = fundingPada(funding, lilin[i].t)
        const tanda = tandaDari(x, f24)
        ;(kandidat[ki][simbol] = kandidat[ki][simbol] || []).push({
          i, t: lilin[i].t, t0, simbol, tanda, sisi, dipakai: false,
          entryR: entry, puncakR: puncak, dasarR: dasar, ambangR: ambang,
          wickAtasR: R8(x.wickAtas), wickBawahR: R8(x.wickBawah),
          jamLikuid: put.jamLikuid, jamPuncak: put.jamPuncak, jamDasar: put.jamDasar,
          tinggiR: R8(put.tinggi), rendahR: R8(put.rendah), closeR: R8(put.close48),
          spikeHari: hari, fundingR: f24 == null ? null : R8(f24),
        })
      }
    }
    return { kandidat, stat, peristiwaDipakai }
  }
  const rekonstruksi = (c, lilin) => {
    const strip = lilin.slice(c.i - STRIP, c.i + 1)
    return { ...c, stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]) }
  }
  const premisTeks = (c) => c.sisi === 'SHORT'
    ? `short x5 di ${c.entryR} — "spike vertikal gagal tertutup (wick atas ${c.wickAtasR}× badan), pasti balik" (nalar pemburu-balik profesional); puncak ambisi ${c.puncakR} (target turun = strip low); jatuh ke dasar pra-pump ${c.dasarR} = spike benar-benar mati, tesis balik terbukti; ambang likuidasi ${c.ambangR} (+20%, margin x5 habis — hal yang para pemburu-balik juga lupakan) — jendela ${JENDELA} jam — nasib sisi short spike diputuskan di sini`
    : `long x5 di ${c.entryR} — "spike vertikal tertutup kuat (wick atas ${c.wickAtasR}× badan), pasti lanjut" (nalar pemburu-momentum profesional); puncak ambisi ${c.puncakR} (target naik = strip high); roboh ke bawah strip low ${c.dasarR} = spike mati; ambang likuidasi ${c.ambangR} (−20%, margin x5 habis — hal yang para pemburu-momentum juga lupakan) — jendela ${JENDELA} jam — nasib sisi long spike diputuskan di sini`
  const bentukSoalPasar = (sel, jendelaList, kelasAwal) => {
    const lilinMap = new Map(jendelaList.map(j => [`${j.simbol}|${j.t0}`, j.lilin]))
    return sel.pilihan.map((c, idx) => {
      const r = rekonstruksi(c, lilinMap.get(`${c.simbol}|${c.t0}`))
      return {
        id: idx + 1, keluarga: 'PASAR', simbol: c.simbol, waktu: iso(c.t), spikeHari: c.spikeHari, sisi: c.sisi,
        premis: premisTeks(c),
        entry: c.entryR, puncakAmbisi: c.puncakR, dasarSelamat: c.dasarR, ambangLikuid: c.ambangR,
        strip24: r.stripR, tanda: c.tanda, funding24: c.fundingR,
        kelasHasil: KELAS_PASAR[c.ki].id,
        jamLikuid: c.jamLikuid, jamPuncak: c.jamPuncak, jamDasar: c.jamDasar,
        tinggi48: c.tinggiR, rendah48: c.rendahR, close48: c.closeR,
        sasaranAwal: kelasAwal,
      }
    })
  }

  // --- bank utama: peristiwa 2.000 hari terakhir → 3452 soal PASAR ---
  const jendelaUtama = koinData.flatMap(k => k.jendela.filter(j => j.t0 >= batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  console.log('\nFASE C: kolam utama ' + jendelaUtama.length + ' jendela spike (2.000 hari terakhir)')
  const utama = kurasi(jendelaUtama)
  console.log('--- bukti pasar kejam: nasib 48 jam DUA SISI setelah momen premis-spike (kolam utama) ---')
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
  // probe kapasitas nyata (warisan run-2 V331): sasaran proporsional ×1,5 + 50 per kelas
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
  KASUS_PUMPSPIKE_SEJARAH.forEach((kasus, kasusIdx) => {
    kasus.fakta.forEach((f, aspekIdx) => {
      const tanda = tandaSejarah(kasusIdx, aspekIdx, f.tanya)
      if (pemilikTandaGlobal.has(tanda)) throw new Error(`tanda sejarah ${tanda} TABRAKAN dengan wajah pasar — salt wajib diganti, jujur berhenti`)
      pemilikTandaGlobal.set(tanda, 'JAWAB-' + 'ABCD'[f.kunci])
      soalSejarah.push({
        id: soalPasar.length + (++sid), keluarga: 'SEJARAH', kasus: kasus.id, kasusIdx, aspekIdx,
        tanya: f.tanya, opsi: f.opsi, kunci: f.kunci,
        premis: `kasus sejarah dunia pump spike yang melikuidasi DUA sisi (short di jalan naik, long di jalan runtuh) termasuk profesional — ${kasus.nama}`,
        tanda, kelasHasil: 'JAWAB-' + 'ABCD'[f.kunci],
      })
    })
  })
  console.log(`\nkeluarga SEJARAH: ${soalSejarah.length} soal kasus dunia (GME-2021/VW-2008/CHF-2015/FLASH-CRASH-2010/BTC-2019-04-02/SHIB-2021-10/LUNA-2022-05/BTC-2017-12-17 + pelajaran profesional)`)
  const soalUtama = [...soalPasar, ...soalSejarah]
  const distKoin = {}, distKelas = {}, distSisi = { SHORT: 0, LONG: 0 }, distFunding = { negatif: 0, positifKecil: 0, panas: 0, tanpaData: 0 }, distKeluarga = {}
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
  console.log(`\nkolam dadakan ${jendelaLama.length} jendela spike (> 2.000 hari)`)
  for (const k of KELAS_PASAR) console.log(`  ${k.id}: ${lama.stat[k.id].momen} momen`)
  const sasaranDadak = sasaranProporsional(lama.stat, SASARAN_DADAK, 10)
  console.log(`  sasaran dadakan (proporsional): [${sasaranDadak.join(', ')}] = ${sasaranDadak.reduce((a, b) => a + b, 0)}`)
  const selLama = pilihKandidat(lama.kandidat, sasaranDadak, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soalDadak = bentukSoalPasar(selLama, jendelaLama, sasaranDadak)
  const distKoinDadak = {}, distKelasDadak = {}, distSisiDadak = { SHORT: 0, LONG: 0 }
  for (const s of soalDadak) { distKoinDadak[s.simbol] = (distKoinDadak[s.simbol] || 0) + 1; distKelasDadak[s.kelasHasil] = (distKelasDadak[s.kelasHasil] || 0) + 1; distSisiDadak[s.sisi]++ }

  const tulis = (file, protokol, soal, stat, distK, distKl, distS, cara) => {
    const bank = {
      protokol, epoch: 'V333', diperbarui: new Date().toISOString(),
      sumber: 'Binance spot klines 1d publik (api.binance.com via cache warisan SQUEEZE, deteksi hari-spike vertikal: (high−open)/open ≥ +9%, volume ≥ 1,5× rata-20; TANPA konfirmasi masa-depan — nasib dua sisi adalah materi ujian dari jalan 48 jam; 91 koin, ±8 tahun) + klines 1h jendela 288 jam [T0-48h, T0+240h) per peristiwa (run-3: 144→288 jam, pelajaran run terbuka) + funding rate futures publik (fapi.binance.com) + catatan kasus dunia publik (GME-2021/VW-2008/CHF-2015/FLASH-CRASH-2010/BTC-2019-04-02/SHIB-2021-10/LUNA-2022-05/BTC-2017-12-17) — lilin, waktu, harga, funding, fakta ASLI, nol karangan',
      cara,
      aturanKelas: KELAS_PASAR.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })).concat(KELAS_JAWAB.map(j => ({ id: j, naive: 'SEJARAH', cerita: 'jawaban benar soal kasus sejarah/pelajaran profesional (pilihan A-D, kunci tersegel)' }))),
      statistikMomen: stat, distKoin: distK, distKelas: distKl, distSisi: distS, distFunding, distKeluarga, jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  const caraUtama = `mandat pemilik V333: 3500 soal dari kasus nyata PUMP SPIKE yang melikuidasi jutaan trader DUA SISI (short di jalan naik, long di jalan runtuh) termasuk profesional — KELUARGA PASAR ${SASARAN_UTAMA} soal DUA SISI (SHORT x5 = pemburu-balik "spike gagal tertutup pasti balik"; LONG x5 = pemburu-momentum "vertikal tertutup kuat pasti lanjut"; sisi ditentukan FAKTA kartu: wickAtas > 1,0× badan dan ≥ wickBawah → SHORT, selain itu LONG; arah pasar hanya ada BUY/SELL dan kunci arah tetap dari FAKTA 48 jam): FASE A deteksi hari-spike vertikal dari klines 1d ±8 tahun × 91 koin ((high−open)/open ≥ +9%; volume ≥ 1,5× rata-20; TANPA konfirmasi masa-depan — nasib dua sisi justru materi ujian; hari beruntun gap ≤3 hari = satu peristiwa, inti = volume terbesar; maks 60 peristiwa/koin merata sejarah); FASE B jendela 1h 288 jam [T0-48h, T0+240h) — PELAJARAN RUN TERBUKA run-1/run-2: jendela 144 jam hanya 47 posisi strip/peristiwa (kolam 4.116→5.4k momen, wajah bebas 1.655→2.747 < 3.452, jujur berhenti dua kali) → run-3 memperpanjang jendela ke 288 jam (~239 posisi/peristiwa); FASE C momen PREMIS-SPIKE (run-2 ambang: volz ≥ 0,7; posisi ≥ 0,45; lebar strip 3-60%; momentum hidup r3 ≥ +1,0% ATAU r12 ≥ +3%; hiAll > hi20 — strip menembus atas rentang 23 jam; hiAll ≥ 1,0% di atas close; loAll ≥ 1,0% di bawah close; sisi konsisten kartu; sisi SHORT: dasar pra-pump 24 jam < strip low); SHORT x5: puncak ambisi = strip low, dasar selamat = dasar pra-pump, ambang = entry×1,20; LONG x5: puncak ambisi = strip high, dasar selamat = strip low, ambang = entry×0,80; jalan 48 jam → 12 kelas dari fakta (bedah kecepatan dua sisi: likuid ≤/> 12 jam; SHORT-BALIK-SEJATI = target turun + dasar pecah; LONG-ANGKAT-SEJATI = target naik + close48 ≥ entry; LONG-MIMPI-PALSU = target naik tapi close48 < entry — menyentuh puncak bukan selamat; split mendem/ sempit dari close48); konservatif dalam satu lilin (yang menyiksa dihitung dulu: likuid > sisanya); kartu 24 lilin + tanda 40 bit identik warisan (18 + 2 funding + 20 anatomi dua tier); satu tanda satu kelas (nol tabrakan wajah LINTAS bank); jarak kartu 24 jam ABSOLUT; bank utama = peristiwa 2.000 hari terakhir, dadakan = lebih tua; kurasi & ujiBank memakai strip R8; kelasHasil dihitung HANYA dari jalan 48 jam; PROBE kapasitas nyata mengklam sasaran — kelas tercekik diambil apa adanya, sisa dialihkan proporsional, kurang total = berhenti jujur. KELUARGA SEJARAH ${SASARAN_SEJARAH} soal: fakta & pelajaran kasus dunia publik (GME-2021: $39 → $483 intraday → −90% sepekan, Melvin −53% menutup short, dua pemakaman satu peristiwa; VW-2008: €210 → €1.005 dalam ±2 hari — squeeze terbrutal sejarah saham, Porsche 74,1%, lalu −70% dalam ±3 hari; CHF-2015: lantai SNB dihapus, CHF +±30% dalam MENIT, Alpari pailit, FXCM bailout ±$300 jt, stop gagal gap; FLASH-CRASH-2010: DJIA −998 poin dalam menit, V-recovery ±30-90 menit, Accenture $0,01, Sarao spoofing; BTC-2019-04-02: +$900 dalam ±1 jam, order raksasa ±20.000 BTC, dugaan spoofing, short dilikuidasi massal; SHIB-2021-10: ATH $0,00008861 (+±780% dalam ±1 bulan), lalu −60%±; LUNA-2022-05: dead-cat +ratusan% di tengah runtuh, pemburu-dasar musnah ke ±$0,000001, ±$40 miliar+ menguap; BTC-2017-12-17: puncak ±$19.800 hari peluncuran CME, short dilikuidasi berulang di jalan naik, pemburu puncak −40% dalam ±5 hari) + 19 pelajaran profesional — pilihan A-D, kunci tersegel, tanda '11'+6bit kasus+5bit aspek+19bit hash stem salt SEJARAH-V333`
  tulis('ujian/soal-pumpspike-3500.json', 'SOAL-PUMPSPIKE-3500', soalUtama, utama.stat, distKoin, distKelas, distSisi, caraUtama)
  tulis('ujian/soal-pumpspike-dadakan-350.json', 'SOAL-PUMPSPIKE-350-DADAKAN', soalDadak, lama.stat, distKoinDadak, distKelasDadak, distSisiDadak, caraUtama + '; dadakan dari peristiwa LAMA (>2.000 hari) tak tersentuh tempa utama — semua PASAR')

  console.log('\ndist keluarga utama:', JSON.stringify(distKeluarga))
  console.log('dist kelas utama:', JSON.stringify(distKelas))
  console.log('dist sisi utama:', JSON.stringify(distSisi))
  console.log('dist funding utama:', JSON.stringify(distFunding))
  console.log('dist kelas dadakan:', JSON.stringify(distKelasDadak), '| sisi:', JSON.stringify(distSisiDadak))
}

main().catch(e => { console.error('tambang-pumpspike3500 MATI-PENUH:', e.message); process.exit(1) })
