#!/usr/bin/env node
/* ================================================================
   GALI-TERUS — V335 TANPA-TUNGGU (hukum pemilik 2026-10-11)
   ----------------------------------------------------------------
   Mandat pemilik: "kalau ada label tunggu berarti ini gak layak
   untuk diambil ... koin yang disebut adalah BUY bukan tunggu ...
   kalau tidak ada, gali terus" + pelajaran CERMIN-100RB:
   dinding arah 48,88% (semua nalar berhimpit) → yang dikuasai
   adalah CARA KELUAR; TP wajib di AMBANG NAPAS, bukan di atasnya
   (21,78% soal sejati mati serakah melampaui ambang).

   Organ ini MENGGALI: menyapu ~110 koin USDT terlikuid Binance
   (klines 1h ×200), mengklasifikasi keluarga jebakan & rezim 12j
   dengan kosakata yang SAMA dengan bank 100.000 soal (verbatim
   tambang-cermin100rb), membaca pengalaman-cermin.json (distilasi
   100.000 jalan sejati), lalu menerbitkan SASARAN BUY terbaik —
   TANPA SATU PUN label TUNGGU — masing-masing membawa
   PAKEM-LIMA-BARIS:
     1. Entry di berapa
     2. Stop loss di berapa   (bawah dasar napas — bukan angka acak)
     3. Jual profit di berapa (ambang napas p50 keluarganya —
                              di ambang itu, BUKAN di atasnya)
     4. Jual profit ambisius di berapa (p75 keluarganya)
     5. Alasan kenapa ambisius segitu (nafas/dana — bukan
        "mencari titik aman")

   SELL adalah eksekusi jual hasil koin BUY: entry = buy,
   jual profit = sell. Karena itu semua vonis publik = BUY.
   nol Math.random — seluruhnya deterministik dari data pasar.
   Mode:  (tanpa arg) gali & cetak
          --denyut    gali + segel laporan/gali-terus.json
          --uji       uji invarian pakem (gerbang lahir organ)
   ================================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_PENGALAMAN = 'laporan/pengalaman-cermin.json'
const FILE_LAPOR = 'laporan/gali-terus.json'
const MAKS_KOIN = 110
const JEDA_MS = 120
const MIN_LILIN = 60
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const tidur = (ms) => new Promise(r => setTimeout(r, ms))
const fmt = (v) => {
  if (!isFinite(v)) return String(v)
  const a = Math.abs(v)
  if (a >= 1000) return String(Math.round(v * 100) / 100)
  if (a >= 1) return String(Math.round(v * 10000) / 10000)
  if (a >= 0.01) return String(Math.round(v * 1000000) / 1000000)
  return String(Math.round(v * 1e8) / 1e8)
}

// ---------- perisai fetch warisan (418/429/5xx hormat lalu ulang) ----------
async function fetchTahan(url) {
  for (let i = 0; i < 3; i++) {
    let res
    try { res = await fetch(url) } catch (e) { await tidur(2000 * (i + 1)); continue }
    if (res.status === 418 || res.status === 429 || res.status >= 500) {
      await tidur(res.status === 418 ? 45000 : 12000 * (i + 1)); continue
    }
    return res
  }
  throw new Error(`binance menolak terus: ${url.slice(0, 90)}`)
}

async function lilinAmbil(sym) {
  for (const g of ['https://data-api.binance.vision', 'https://api.binance.com', 'https://api1.binance.com']) {
    try {
      const res = await fetchTahan(`${g}/api/v3/klines?symbol=${sym}&interval=1h&limit=200`)
      if (!res.ok) continue
      const d = await res.json()
      if (Array.isArray(d) && d.length >= MIN_LILIN)
        return d.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
    } catch (e) {}
  }
  return null
}

// ---------- fitur KARTU (VERBATIM warisan tambang-cermin100rb — kosakata wajah identik) ----------
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

// ---------- keluarga jebakan & rezim (VERBATIM bank 100.000 soal) ----------
function dekatBulat(p) {
  const m = Math.pow(10, Math.floor(Math.log10(Math.max(p, 1e-12))))
  let terdekat = Infinity
  for (const k of [m / 10, m, m * 10]) for (const d of [1, 2, 2.5, 5]) {
    const L = d * k
    if (L > 0) terdekat = Math.min(terdekat, Math.abs(p - L) / p)
  }
  return terdekat * 100 // %
}
function keluargaDariKartu(x) {
  if (x.wickAtas > 1.5 && x.posisi > 0.75) return 'LIMPAK'
  if (x.wickBawah > 1.5 && x.posisi < 0.25) return 'PUKUL-TANAH'
  if ((x.streakNaik >= 4 && x.rsi > 66) || (x.streakTurun >= 4 && x.rsi < 34)) return 'NAPAS-LELAH'
  if (x.volz > 3) return 'KEJUT-VOLUME'
  if (dekatBulat(x.e) < 0.6) return 'MAGNET-BULAT'
  if (x.lebarPct < 3 && x.rsi > 38 && x.rsi < 62) return 'UMpan-DATAR'
  return 'ARUS-KENCANG'
}
const regimeDari = (x) => x.r12 > 3 ? 'tren-naik' : x.r12 < -3 ? 'tren-turun' : 'datar'
const TRAP_LINE = {
  'LIMPAK': 'lonjakan menyapu dana di atas aturan lama — pembeli terakhir masuk di ujung wick',
  'PUKUL-TANAH': 'tikus turun menyapu stop di bawah dasar — yang panik menyerahkan koin murah',
  'NAPAS-LELAH': 'badan lilin mengecil saat jalan berlanjut — pembeli kehabisan napas',
  'KEJUT-VOLUME': 'volume jauh di atas biasa — ada yang menumpang, ada yang kabur',
  'MAGNET-BULAT': 'angka bulat adalah dinding dana — pengambilan dana menagih di situ',
  'UMpan-DATAR': 'papan harga datar — dua sisi sama-sama dipangkas bergantian',
  'ARUS-KENCANG': 'arus deras — bahkan arus sejati selalu menagih napas di tengah jalan',
}

// ATR% 14 dari strip (VERBATIM)
function atrPctDari(strip) {
  const n = strip.length
  let sum = 0, c = 0
  for (let i = Math.max(1, n - 14); i < n; i++) {
    sum += Math.max(strip[i].h - strip[i].l, Math.abs(strip[i].h - strip[i - 1].c), Math.abs(strip[i].l - strip[i - 1].c)); c++
  }
  return c ? (sum / c) / strip[n - 1].c * 100 : 0.5
}

// ---------- pengalaman-cermin (distilasi 100.000 jalan sejati) ----------
// fallback = salinan fakta tersegel laporan/pengalaman-cermin.json (segel 8dc601a31a5ca998)
const PENGALAMAN_FALLBACK = {
  arahRegime: {
    'KEJUT-VOLUME|tren-turun': { arah: 'BUY', majoritas: 0.5223, n: 337 },
    'NAPAS-LELAH|tren-turun': { arah: 'BUY', majoritas: 0.5014, n: 710 },
    'NAPAS-LELAH|tren-naik': { arah: 'BUY', majoritas: 0.5114, n: 833 },
    'LIMPAK|datar': { arah: 'BUY', majoritas: 0.5032, n: 3154 },
  },
  tp: {
    'PUKUL-TANAH|BUY': { p25: 0.00436, p50: 0.01056, p75: 0.0227, n: 3102 },
    'ARUS-KENCANG|BUY': { p25: 0.00468, p50: 0.01135, p75: 0.02355, n: 34261 },
    'UMpan-DATAR|BUY': { p25: 0.00364, p50: 0.00826, p75: 0.01521, n: 4516 },
    'LIMPAK|BUY': { p25: 0.00439, p50: 0.01114, p75: 0.02373, n: 2579 },
    'KEJUT-VOLUME|BUY': { p25: 0.00496, p50: 0.01134, p75: 0.02408, n: 1122 },
    'MAGNET-BULAT|BUY': { p25: 0.0004, p50: 0.0009, p75: 0.01132, n: 1501 },
    'NAPAS-LELAH|BUY': { p25: 0.00559, p50: 0.01319, p75: 0.02873, n: 1204 },
  },
}
function pengalamanMuat() {
  try {
    const p = JSON.parse(readFileSync(FILE_PENGALAMAN, 'utf8'))
    if (p && p.tp && p.arahRegime) return { data: p, sumber: FILE_PENGALAMAN, segel: p.segel || '-' }
  } catch (e) {}
  return { data: PENGALAMAN_FALLBACK, sumber: 'fallback-tersegel (file pengalaman tak terbaca)', segel: '8dc601a31a5ca998' }
}

// ---------- SKOR LAYAK-BELI 0-100 (dari pelajaran 100.000 soal) ----------
// Dinding arah 48,88% mengajarkan: arah tak dibaca dari kartu; yang
// dikuasai adalah ASIMETRI JALAN KELUAR + tempat napas menagih dana.
function skorLayakBeli(x, kel, peng, atrPct, rezim) {
  const tp = (peng.tp && peng.tp[kel + '|BUY']) || { p50: 0.01135, p75: 0.02355 }
  const p50 = tp.p50
  // dasar napas = lantai 16 jam terakhir; stop di bawahnya 0,25×ATR
  const lantai = Math.min(...x.kartu.slice(-16).map(l => l.l))
  const risikoMentah = (x.e - (lantai - 0.25 * x.atrAbs)) / x.e * 100
  // lantai risiko 0,35%: koin datar-mati tak boleh mengarang rr palsu
  const risikoPct = Math.max(risikoMentah, 0.35)
  const rr = risikoPct > 0 ? (p50 * 100) / risikoPct : 0
  let s = 0, rincian = []
  // 1) asimetri jalan keluar (maks 30) — lantai risiko dipakai agar rr jujur
  const skorRR = rr <= 0 ? 0 : rr >= 1.8 ? 30 : rr <= 0.8 ? rr / 0.8 * 12 : 12 + (rr - 0.8) * 15
  s += skorRR; rincian.push(`rr-ambang ${rr.toFixed(2)} (risiko ${risikoPct.toFixed(2)}%) → ${skorRR.toFixed(1)}`)
  if (risikoMentah < 0.35) rincian.push(`lantai-risiko: napas mentah ${risikoMentah.toFixed(2)}% terlalu sempit — diukur 0,35% (anti rr-palsu)`)
  // 2) keluarga favorit-BUY dari fakta cermin (maks 25)
  const bKel = { 'PUKUL-TANAH': 25, 'NAPAS-LELAH': 22, 'LIMPAK': 18, 'UMpan-DATAR': 14, 'KEJUT-VOLUME': 14, 'ARUS-KENCANG': 10, 'MAGNET-BULAT': 6 }[kel] ?? 10
  s += bKel; rincian.push(`keluarga ${kel} → ${bKel}`)
  // 3) struktur (maks 20)
  const emaN = x.ema20 > x.ema50
  const sStruk = emaN && x.r1 > 0 ? 20 : emaN ? 12 : 4
  s += sStruk; rincian.push(`struktur ${emaN ? '20>50' : '20<50'} r1 ${x.r1.toFixed(2)} → ${sStruk}`)
  // 4) anti-lelah (maks 15): napas yang sudah melar tak dikejar di harga atas
  const sLelah = x.rsi < 70 ? 15 : x.rsi <= 78 ? 7 : 2
  s += sLelah; rincian.push(`rsi ${x.rsi.toFixed(1)} → ${sLelah}`)
  // 5) dana hadir (maks 10)
  const sDana = Math.max(0, Math.min(10, x.volz * 4))
  s += sDana; rincian.push(`volz ${x.volz.toFixed(2)} → ${sDana.toFixed(1)}`)
  // 6) sel condong-BUY dari pengalaman keluarga|rezim (bonus +10 / penalti −6)
  const cell = peng.arahRegime && peng.arahRegime[kel + '|' + rezim]
  if (cell) {
    if (cell.arah === 'BUY') { s += 10; rincian.push(`sel ${kel}|${rezim} condong BUY (${(cell.majoritas * 100).toFixed(1)}%, n=${cell.n}) → +10`) }
    else if (cell.majoritas > 0.53) { s -= 6; rincian.push(`sel ${kel}|${rezim} condong SELL kuat (${(cell.majoritas * 100).toFixed(1)}%, n=${cell.n}) → −6`) }
  }
  // potongan pengaman dari bank soal:
  if (x.r1 < -6) { s -= 25; rincian.push('anti-pisau: r1 < −6% → −25 (jatuh dalam ≤−2,5% terbukti racun)') }
  if (x.posisi > 0.9 && x.rsi > 72) { s -= 15; rincian.push('anti-kejar: harga di ujung rentang & RSI panas → −15 (zona-chase diblok)') }
  if (x.lebarPct < 1.5) { s -= 30; rincian.push('papan-mati: lebar rentang 24j < 1,5% → −30 (koin tak bernapas — napas tak cukup untuk jual profit)') }
  return { skor: Math.max(0, Math.round(s * 10) / 10), rr, risikoPct, risikoMentah, p50, p75: tp.p75, tpN: tp.n || 0, lantai, rincian, cell }
}

// ---------- PAKEM-LIMA-BARIS ----------
function pakemDari(sym, lilin, x, kel, rezim, skor, peng) {
  const entry = x.e
  const stop = skor.lantai - 0.25 * x.atrAbs
  // LANTAI BIAYA 0,3%: ambang napas faktual tetap dicatat, tapi rencana jual
  // tak boleh di bawah biaya tempoh — rencana yang tak lewat biaya bukan rencana
  const ambangFakta = skor.p50
  const jualPct = Math.max(ambangFakta, 0.003)
  const jual = entry * (1 + jualPct)
  // ambisius = p75 keluarga; dilantai 1,6× JARAK jual profit (bukan 1,6× harga!) —
  // sasaran peregangan, bukan angan orbital
  const ambisius = entry * (1 + Math.max(skor.p75, jualPct * 1.6))
  const hi16 = Math.max(...lilin.slice(-16).map(l => l.h))
  const condong = skor.cell || null
  const sifatCondong = condong
    ? (condong.arah === 'BUY'
      ? `Dari ${condong.n} soal sejati, keluarga ${kel} pada rezim ${rezim} condong BUY (${(condong.majoritas * 100).toFixed(1)}%) — arus peluang ada di sisiku. `
      : `Dari ${condong.n} soal sejati, keluarga ${kel} pada rezim ${rezim} condong ${condong.arah} (${(condong.majoritas * 100).toFixed(1)}%) — hampir koin; karena itu bukan di sini kupasang nalar arah, melainkan asimetri jalan keluar: stop rapat di dasar napas, jual di ambang yang terukur. `)
    : ''
  const alasanEntry =
    `${sym} (${kel}, rezim ${rezim}): ${TRAP_LINE[kel]}. ` +
    `Harga kini ${fmt(entry)} di posisi ${(x.posisi * 100).toFixed(0)}% rentang, RSI ${x.rsi.toFixed(1)}, lilin terakhir ${x.r1 > 0 ? '+' : ''}${x.r1.toFixed(2)}%, volume ${x.volz >= 1 ? 'di atas biasa (volz ' + x.volz.toFixed(1) + ')' : 'biasa (volz ' + x.volz.toFixed(1) + ')'}, lebar rentang ${x.lebarPct.toFixed(1)}%. ` +
    sifatCondong +
    `kubeli di zona ini karena napas yang sudah lelah menagih pantulan — bukan karena kejar-kejaran angan.`
  const ambangKalimat = ambangFakta < 0.003
    ? `ambang napas faktual keluarga ${kel} p50 dari ${skor.tpN} soal sejati hanya +${(ambangFakta * 100).toFixed(2)}% (di bawah biaya tempoh — jadi yang menentukan lantai biaya 0,3%)`
    : `ambang napas keluarga ${kel} (p50 dari ${skor.tpN} soal sejati, +${(ambangFakta * 100).toFixed(2)}%)`
  const alasanAmbisius =
    `Jual profit ${fmt(jual)} = ${ambangKalimat}: faktanya usai menyentuh ambang segitu dana biasa diambil lagi untuk menghirup napas — ` +
    `di atas ambang itu dana justru diambil, bukan diberi; 21,78% dari 100.000 soal mati karena serakah melampaui ambang. ` +
    `Ambisius ${fmt(ambisius)} (+${((ambisius / entry - 1) * 100).toFixed(2)}%) hanya ditempuh bila dana baru membuktikan: lilin utuh menembus aturan lama 16 jam di ${fmt(hi16)} dengan volume — ` +
    `di situ dana lama menunggu lepas; tembus dengan dana = jalan lanjut, gagal = napas kusambut di ambang pertama. `
  const rr = skor.risikoPct > 0 ? (jualPct * 100) / skor.risikoPct : 0
  return {
    simbol: sym, arah: 'BUY', keluarga: kel, rezim,
    layakSkor: skor.skor,
    pakem: {
      entry: +entry.toPrecision(8),
      stopLoss: +stop.toPrecision(8),
      jualProfit: +jual.toPrecision(8),
      jualAmbisius: +ambisius.toPrecision(8),
      rrAmbang: Math.round(rr * 100) / 100,
      holdJam: 24,
      risikoPct: Math.round(skor.risikoPct * 100) / 100,
      jarakJualPct: Math.round(jualPct * 10000) / 100,
      jarakAmbisiusPct: Math.round((ambisius / entry - 1) * 10000) / 100,
      ambangFaktaPct: Math.round(ambangFakta * 10000) / 100,
      sumberAmbang: skor.tpN + ' soal sejati keluarga ' + kel,
    },
    alasanEntry, alasanAmbisius,
    rincianSkor: skor.rincian,
    disiplin: 'risiko maks 1% modal · stop di bawah dasar napas, tidak digeser · jual profit di ambang napas (bukan di atasnya) · ambisius hanya bila dana baru membuktikan · 24 jam tanpa bukti = kusambut napasku sendiri',
  }
}

// ---------- GALI ----------
async function gali() {
  const t0 = Date.now()
  const peng = pengalamanMuat()
  const resT = await fetchTahan('https://api.binance.com/api/v3/ticker/24hr')
  if (!resT.ok) throw new Error('ticker 24hr gagal ' + resT.status)
  const tick = await resT.json()
  const JAHAT = /(UP|DOWN|BULL|BEAR)USDT$/
  // STABLECOIN BAN V335: koin pegar tak bernapas — jual profit tak pernah terjangkau;
  // koin pegar (USD1, RLUSD, USDe, dst.) tak boleh jadi sasaran BUY
  const PEGAR = /^(USDC|FDUSD|TUSD|BUSD|DAI|EUR|AEUR|USD1|XUSD|RLUSD|USDE|USDS|USDG|PYUSD|EURC|USDP|FRAX|USDX|USDtb|USDF|BUSD|SUSD|BUIDL|FDUSD|USD)USDT$/
  const STABLE = new Set(['USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'BUSDUSDT', 'DAIUSDT', 'EURUSDT', 'AEURUSDT', 'USD1USDT', 'XUSDUSDT'])
  const koin = tick.filter(t => t.symbol.endsWith('USDT') && !JAHAT.test(t.symbol) && !STABLE.has(t.symbol) && !PEGAR.test(t.symbol)
    && +t.quoteVolume > 0 && +t.lastPrice > 0)
    .sort((a, b) => +b.quoteVolume - +a.quoteVolume || (a.symbol < b.symbol ? -1 : 1))
    .slice(0, MAKS_KOIN)
  console.log(`[gali-terus] menyapu ${koin.length} koin terlikuid — pengalaman: ${peng.sumber} (segel ${peng.segel})`)
  const kandidat = []
  let gagal = 0
  for (const t of koin) {
    const sym = t.symbol
    const lilin = await lilinAmbil(sym)
    if (!lilin || lilin.length < 24 + 16) { gagal++; await tidur(JEDA_MS); continue }
    try {
      const kartu = lilin.slice(-24)
      const x = fiturDari(kartu)
      // ema & atr absolut dari kartu (rumus sadar1 — dua jalur satu matematika)
      const c = kartu.map(l => l.c)
      const emaCalc = (arr, n) => { const k = 2 / (n + 1); let e = arr[0]; for (let i = 1; i < arr.length; i++) e = arr[i] * k + e * (1 - k); return e }
      x.ema20 = emaCalc(c, 20); x.ema50 = c.length > 50 ? emaCalc(lilin.map(l => l.c), 50) : emaCalc(c, 50)
      x.atrAbs = atrPctDari(kartu) / 100 * x.e
      const kel = keluargaDariKartu(x)
      const rezim = regimeDari(x)
      const skor = skorLayakBeli({ ...x, kartu }, kel, peng.data, atrPctDari(kartu), rezim)
      kandidat.push(pakemDari(sym, lilin, x, kel, rezim, skor, peng.data))
    } catch (e) { gagal++ }
    await tidur(JEDA_MS)
  }
  kandidat.sort((a, b) => b.layakSkor - a.layakSkor)
  const pakem = kandidat.slice(0, 5)
  console.log(`[gali-terus] ${kandidat.length} koin sah digali (gagal ${gagal}) dalam ${((Date.now() - t0) / 1000).toFixed(0)} dtk`)
  return { peng, koinDisapu: koin.length, koinSah: kandidat.length, gagal, durasiMs: Date.now() - t0, pakem }
}

function segelkan(hasil) {
  const lapor = {
    protokol: 'GALI-TERUS-V335', dihasilkan: new Date().toISOString(),
    hukum: [
      'HUKUM-TANPA-TUNGGU (pemilik 2026-10-11): label TUNGGU dihapus dari seluruh info koin — koin yang disebut WAJIB BUY; yang tak layak DIGANTI dengan hasil galian lebih dalam',
      'SELL = eksekusi jual hasil koin BUY: entry = buy, jual profit = sell — karena itu semua vonis publik = BUY dengan tangga jual di dalamnya',
      'TP wajib di AMBANG NAPAS, bukan di atasnya — 21,78% dari 100.000 soal sejati mati serakah melampaui ambang (CERMIN-100RB V334)',
      'Dinding arah 48,88% → yang dikuasai asimetri jalan keluar (rr) + tempat napas menagih dana, bukan meramal arah 48 jam',
    ],
    sumberPengalaman: { file: hasil.peng.sumber, segel: hasil.peng.segel },
    koinDisapu: hasil.koinDisapu, koinSah: hasil.koinSah, gagalAmbil: hasil.gagal, durasiMs: hasil.durasiMs,
    pakem: hasil.pakem,
    catatan: 'nol Math.random — deterministik dari data pasar nyata; setiap angka bisa diaudit ulang siapa pun',
  }
  lapor.segel = hash16(JSON.stringify(lapor.pakem))
  mkdirSync('laporan', { recursive: true })
  writeFileSync(FILE_LAPOR, JSON.stringify(lapor, null, 1))
  console.log(`[gali-terus] tersegel ${FILE_LAPOR} — segel ${lapor.segel}`)
  return lapor
}

function ujiInvarian(lapor) {
  const E = []
  if (!lapor || !Array.isArray(lapor.pakem) || lapor.pakem.length === 0) E.push('pakem kosong')
  else for (const p of lapor.pakem) {
    const t = JSON.stringify(p)
    if (!p.pakem || !(p.pakem.entry > 0)) E.push(p.simbol + ': entry tidak sah')
    if (!(p.pakem.stopLoss < p.pakem.entry)) E.push(p.simbol + ': stop tidak di bawah entry')
    if (!(p.pakem.jualProfit > p.pakem.entry)) E.push(p.simbol + ': jual profit tidak di atas entry')
    if (!(p.pakem.jualAmbisius >= p.pakem.jualProfit)) E.push(p.simbol + ': ambisius tidak di atas profit')
    if (!(p.arah === 'BUY')) E.push(p.simbol + ': arah bukan BUY')
    if (/tunggu/i.test(t)) E.push(p.simbol + ': ada kata TUNGGU')
    if (/robot/i.test(t)) E.push(p.simbol + ': kata terlarang')
    if (!p.alasanEntry || p.alasanEntry.length < 80) E.push(p.simbol + ': alasan entry terlalu kurus')
    if (!p.alasanAmbisius || !/ambang|napas|dana/.test(p.alasanAmbisius)) E.push(p.simbol + ': alasan ambisius bukan nafas-logic')
  }
  return E
}

// ---------- utama ----------
const mode = process.argv[2] || ''
try {
  const hasil = await gali()
  if (!hasil.pakem.length) throw new Error('kolam galian kosong — jujur gugur (tak ada karangan)')
  const lapor = mode === '--denyut' ? segelkan(hasil) : { protokol: 'GALI-TERUS-V335', dihasilkan: new Date().toISOString(), sumberPengalaman: { file: hasil.peng.sumber, segel: hasil.peng.segel }, koinDisapu: hasil.koinDisapu, koinSah: hasil.koinSah, pakem: hasil.pakem, segel: hash16(JSON.stringify(hasil.pakem)) }
  const E = ujiInvarian(lapor)
  if (E.length) { console.error('[gali-terus] INVARIAN GUGUR (jujur): ' + E.join(' | ')); process.exit(1) }
  console.log('')
  for (const p of lapor.pakem) {
    console.log(`BUY ${p.simbol} — layak ${p.layakSkor} (${p.keluarga}, ${p.rezim})`)
    console.log(`   Entry          ${fmt(p.pakem.entry)}`)
    console.log(`   Stop loss      ${fmt(p.pakem.stopLoss)}  (bawah dasar napas, risiko ${p.pakem.risikoPct}%)`)
    console.log(`   Jual profit    ${fmt(p.pakem.jualProfit)}  (ambang napas +${p.pakem.jarakJualPct}%, rr ${p.pakem.rrAmbang})`)
    console.log(`   Jual ambisius  ${fmt(p.pakem.jualAmbisius)}  (+${p.pakem.jarakAmbisiusPct}%)`)
    console.log(`   Alasan         ${p.alasanEntry}`)
    console.log(`   Alasan ambisius ${p.alasanAmbisius}`)
    console.log('')
  }
  console.log(`[gali-terus] segel ${lapor.segel} — sasarannya BUY semua, nol TUNGGU.`)
} catch (e) {
  console.error('[gali-terus] GAGAL (jujur, tak sembunyi):', e && e.message || e)
  process.exit(1)
}
