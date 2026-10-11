#!/usr/bin/env node
// ============================================================
// TAMBANG-CERMIN-100RB (V334) — membangun UJIAN SEKALI-JALAN
// 100.000 SOAL "CERMIN-100RB" dari kasus pasar NYATA.
// Mandat pemilik (2026-10-11):
//   "ujian simulasi besar besaran ... sekali jalan namun ujiannya
//    100.000 soal trading yang semuanya jebakan saling terintegrasi
//    ... menentukan arah entry Dan take profit terbaik ke berapa Dan
//    dengan alasan kenapa ... karena saat menyentuh harga segitu
//    koin akan turun ... atau napas sudah lelah untuk naik harga
//    lagi sehingga take profit di ambang segitu bukan diatasnya
//    ... yang terpenting ... benar benar terintegrasi dikerjakan
//    semuanya dengan kondisi dia saat ini ... kita perlu Tau dia
//    benar berapa agar kita paham dimana kecacatan Dan kenapa"
// Sifat ujian (beda dari V329-V333):
//   - SEKALI JALAN, TANPA PENEMPAAN: makhluk menjawab semua soal
//     dengan KONDISI SAAT INI; salah bukan kegagalan gerbang,
//     melainkan CERMIN untuk peta cacat (diagnostik jujur).
//   - Setiap soal menuntut TIGA jawaban: ARAH (BUY/SELL — aturan
//     ARAH-DUA pemilik), TP "ke berapa" (harga pasti), dan ALASAN
//     PROFESIONAL (kenapa arah itu; kenapa TP di ambang itu, bukan
//     di atasnya — bahasa "ambil dana untuk napas / napas lelah").
// Sumber nyata: Binance spot klines 1h (75+ koin teratas, 4.000 jam
// per koin, cache luar repo, perisai fetchTahan 418/429/5xx) +
// funding rate futures publik fapi.binance.com. Nol karangan.
// Deterministik: nol Math.random — PRNG mulberry32 kunci-tetap
// 20261011 (pemilihan 100rb + dadakan + sampel).
// Kartu soal: fiturDari 24 lilin terakhir (kosakata wajah 40-bit
// WARISAN identik V323-V333 — ingatan 5 garis syaraf tetap terbaca)
// + konteks struktur 48 jam (aturan lama hi48/lo48) untuk TP.
// Kunci dari FAKTA jalan 48 jam setelah keputusan:
//   - kelasHasil: close48 > entry = BUY, < = SELL (ARAH-DUA),
//     sama persis = dibuang dari bank.
//   - tpKunci: AMBANG NAPAS SEJATI — puncak/lembah ekstrem sebelum
//     retrace >= max(0.6%, 0.6×ATR%) terkonfirmasi tutupan. Di atas
//     ambang itu = zona serakah ("diatasnya lagi"); di bawahnya =
//     meninggalkan dana. jamNapas = jam konfirmasi; buruk48 =
//     eksursi terburuk sebelum napas.
//   - mekanismeKunci: 7 kosakata cerita 48 jam sejati.
//   - kunci.alasan: contoh alasan profesional berangka fakta.
// Segel: sha256 per shard + segel total. Dadakan-1000 = out-of-
// sample (tidak masuk bank utama, tak disentuh penempaan — tidak
// ada penempaan di V334, dadakan murni untuk ujian-ulang pasca-
// belajar). Sampel-1200 = subhimpun bank utama untuk jantung.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import zlib from 'node:zlib'

const DIR_BANK = 'ujian/cermin100rb'
const FILE_SEGEL = DIR_BANK + '/segel.json'
const FILE_DADAK = 'ujian/soal-cermin-dadakan-1000.json'
const FILE_SAMPEL = 'ujian/soal-cermin-sampel-1200.json'
const FILE_STAT = 'laporan/tambang-cermin100rb.json'
const DIR_CACHE = '/home/z/my-project/cache-cermin'
const KUNCI_PRNG = 20261011
const TARGET_SOAL = 100000
const TARGET_DADAKAN = 1000
const TARGET_SAMPEL = 1200
const HAL_KOIN = 4          // 4 halaman × 1000 lilin 1h
const MIN_LILIN = 400       // koin dengan < 400 lilin dilewati
const MAKS_KOIN = 110       | 0
const JEDA_MS = 280
const EPS = 1e-9

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const hashFull = (s) => createHash('sha256').update(s).digest('hex')
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
const tidur = (ms) => new Promise(r => setTimeout(r, ms))
const ISO = (ms) => new Date(ms).toISOString().slice(0, 16) + 'Z'
const fmt = (v) => { // angka pasti tanpa orbital
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

// ---------- fitur KARTU (VERBATIM warisan tempa-pumpspike3500 — kosakata wajah identik) ----------
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

// ATR% 14 dari konteks (untuk ambang napas & TP kartu)
function atrPctDari(strip) {
  const n = strip.length
  let sum = 0, c = 0
  for (let i = Math.max(1, n - 14); i < n; i++) {
    sum += Math.max(strip[i].h - strip[i].l, Math.abs(strip[i].h - strip[i - 1].c), Math.abs(strip[i].l - strip[i - 1].c)); c++
  }
  return c ? (sum / c) / strip[n - 1].c * 100 : 0.5
}

// ---------- keluarga jebakan (dari KARTU saja — sah untuk makhluk) ----------
function dekatBulat(p) {
  const m = Math.pow(10, Math.floor(Math.log10(Math.max(p, 1e-12))))
  let terdekat = Infinity
  for (const k of [m / 10, m, m * 10]) for (const d of [1, 2, 2.5, 5]) {
    const L = d * k
    if (L > 0) terdekat = Math.min(terdekat, Math.abs(p - L) / p)
  }
  return terdekat * 100 // %
}
function keluargaDariKartu(x, atrPct) {
  if (x.wickAtas > 1.5 && x.posisi > 0.75) return 'LIMPAK'
  if (x.wickBawah > 1.5 && x.posisi < 0.25) return 'PUKUL-TANAH'
  if ((x.streakNaik >= 4 && x.rsi > 66) || (x.streakTurun >= 4 && x.rsi < 34)) return 'NAPAS-LELAH'
  if (x.volz > 3) return 'KEJUT-VOLUME'
  if (dekatBulat(x.e) < 0.6) return 'MAGNET-BULAT'
  if (x.lebarPct < 3 && x.rsi > 38 && x.rsi < 62) return 'UMpan-DATAR'
  return 'ARUS-KENCANG'
}
const TRAP_LINE = {
  'LIMPAK': 'lonjakan menyapu dana di atas aturan lama — pembeli terakhir masuk di ujung wick',
  'PUKUL-TANAH': 'tikus turun menyapu stop di bawah dasar — yang panik menyerahkan koin murah',
  'NAPAS-LELAH': 'badan lilin mengecil saat jalan berlanjut — pembeli kehabisan napas',
  'KEJUT-VOLUME': 'volume jauh di atas biasa — ada yang menumpang, ada yang kabur',
  'MAGNET-BULAT': 'angka bulat adalah dinding dana — pengambilan dana menagih di situ',
  'UMpan-DATAR': 'papan harga datar — dua sisi sama-sama dipangkas bergantian',
  'ARUS-KENCANG': 'arus deras — bahkan arus sejati selalu menagih napas di tengah jalan',
}

// ---------- AMBANG NAPAS SEJATI dari jalan 48 jam (kunci, bukan kartu) ----------
// BUY: puncak ekstrem sebelum retrace >= R terkonfirmasi tutupan.
function ambangNapas(jalan, arah, atrPct, entry) {
  const R = Math.max(0.006, 0.6 * atrPct / 100)
  let ekstrem = arah === 'BUY' ? -Infinity : Infinity
  let idxEkstrem = 0, tpKunci = null, jamNapas = null
  for (let j = 0; j < jalan.length; j++) {
    const l = jalan[j]
    if (arah === 'BUY') {
      if (l.h > ekstrem) { ekstrem = l.h; idxEkstrem = j }
      if (tpKunci === null && l.c < ekstrem * (1 - R)) { tpKunci = ekstrem; jamNapas = j }
    } else {
      if (l.l < ekstrem) { ekstrem = l.l; idxEkstrem = j }
      if (tpKunci === null && l.c > ekstrem * (1 + R)) { tpKunci = ekstrem; jamNapas = j }
    }
  }
  if (tpKunci === null) { tpKunci = ekstrem; jamNapas = idxEkstrem } // tanpa napas: ambang di ujung jendela
  // eksursi terburuk SEBELUM napas (risiko yang harus ditanggung profesional)
  let buruk = arah === 'BUY' ? Infinity : -Infinity
  for (let j = 0; j <= jamNapas; j++) {
    if (arah === 'BUY') buruk = Math.min(buruk, jalan[j].l)
    else buruk = Math.max(buruk, jalan[j].h)
  }
  return { tpKunci, jamNapas, buruk }
}

// ---------- mekanismeKunci: cerita 48 jam sejati (7 kosakata) ----------
function mekanismeDariJalan(arah, jalan, tpKunci, jamNapas, entry, close48) {
  const bal = (close48 / entry - 1) * 100
  if (Math.abs(bal) < 0.3) return 'MELANTAI-DI-UDARA'
  const setelahNapas = jalan.slice(jamNapas + 1)
  if (setelahNapas.length === 0) return arah === 'BUY' ? 'RAKIT-TANPA-NAPAS' : 'RUNTUH-LURUS'
  const ekor = arah === 'BUY'
    ? Math.min(...setelahNapas.map(l => l.l))
    : Math.max(...setelahNapas.map(l => l.h))
  const retracePct = arah === 'BUY' ? (tpKunci - ekor) / tpKunci * 100 : (ekor - tpKunci) / tpKunci * 100
  const balikLewatEntry = arah === 'BUY' ? ekor < entry : ekor > entry
  if (retracePct > 3 || balikLewatEntry) return arah === 'BUY' ? 'LIMPAK-TERPOTONG' : 'PUKUL-LALU-PANTUL'
  return arah === 'BUY' ? 'NAPAS-LANJUT' : 'MELUNCUR-BERNAPAS'
}
const MEKANISME = ['MELANTAI-DI-UDARA', 'RAKIT-TANPA-NAPAS', 'LIMPAK-TERPOTONG', 'NAPAS-LANJUT', 'RUNTUH-LURUS', 'PUKUL-LALU-PANTUL', 'MELUNCUR-BERNAPAS']
const MEK_SEJALAN = { 'RAKIT-TANPA-NAPAS': 'NAPAS-LANJUT', 'NAPAS-LANJUT': 'RAKIT-TANPA-NAPAS', 'RUNTUH-LURUS': 'MELUNCUR-BERNAPAS', 'MELUNCUR-BERNAPAS': 'RUNTUH-LURUS', 'LIMPAK-TERPOTONG': 'MELANTAI-DI-UDARA', 'MELANTAI-DI-UDARA': 'LIMPAK-TERPOTONG', 'PUKUL-LALU-PANTUL': 'MELANTAI-DI-UDARA' }

function alasanKunci(arah, entry, tpKunci, jamNapas, mekanisme, jalan, close48) {
  const pct = ((arah === 'BUY' ? tpKunci / entry - 1 : 1 - tpKunci / entry) * 100)
  const setelahNapas = jalan.slice(jamNapas + 1)
  const ekor = setelahNapas.length === 0 ? null
    : (arah === 'BUY' ? Math.min(...setelahNapas.map(l => l.l)) : Math.max(...setelahNapas.map(l => l.h)))
  let kenapaBukanDiAtas
  if (ekor === null) kenapaBukanDiAtas = `dalam 48 jam harga tak pernah menarik napas setelah ambang ini — keluar di sini adalah puncak sejati jendela`
  else {
    const retracePct = arah === 'BUY' ? (tpKunci - ekor) / tpKunci * 100 : (ekor - tpKunci) / tpKunci * 100
    kenapaBukanDiAtas = `faktanya usai menyentuh ${fmt(tpKunci)}, harga menarik napas ${fmt(retracePct)}% — di atas ambang itu dana justru diambil, bukan diberi`
  }
  const arahKenapa = arah === 'BUY'
    ? `harga menyentuh wilayah ini lalu dana diambil untuk napas naik`
    : `napas naik sudah lelah di wilayah ini — dana turun mencari dasar`
  return `${arah} dari ${fmt(entry)} — ${arahKenapa}; TP di ${fmt(tpKunci)} (+${fmt(pct)}%), bukan di atasnya: ${kenapaBukanDiAtas}.`
}

// ---------- utama ----------
async function main() {
  const t0 = Date.now()
  mkdirSync(DIR_CACHE, { recursive: true })
  mkdirSync(DIR_BANK, { recursive: true })
  mkdirSync('laporan', { recursive: true })

  // 1) pilih koin: 75+ teratas per volume 24 jam (deterministik)
  const resT = await fetchTahan('https://api.binance.com/api/v3/ticker/24hr')
  if (!resT.ok) throw new Error('ticker 24hr gagal ' + resT.status)
  const tick = await resT.json()
  const JAHAT = /(UP|DOWN|BULL|BEAR)USDT$/
  const STABLE = new Set(['USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'BUSDUSDT', 'DAIUSDT', 'EURUSDT', 'AEURUSDT', 'USD1USDT', 'XUSDUSDT'])
  const koin = tick.filter(t => t.symbol.endsWith('USDT') && !JAHAT.test(t.symbol) && !STABLE.has(t.symbol)
    && +t.quoteVolume > 0 && +t.lastPrice > 0)
    .sort((a, b) => +b.quoteVolume - +a.quoteVolume || (a.symbol < b.symbol ? -1 : 1))
    .map(t => t.symbol)
  console.log(`kandidat koin USDT: ${koin.length}; ambil hingga ${MAKS_KOIN} / cukup soal`)

  // 2) tarik lilin 1h per koin (cache luar repo) + funding fapi
  const buku = [] // {simbol, lilin:[{t,o,h,l,c,v}], funding:[{t,rate}]}
  let ambil = 0
  for (const simbol of koin.slice(0, MAKS_KOIN)) {
    const cacheF = `${DIR_CACHE}/${simbol}.json`
    let paket = null
    if (existsSync(cacheF)) { try { paket = JSON.parse(readFileSync(cacheF, 'utf8')) } catch { paket = null } }
    if (!paket || !paket.lilin || paket.lilin.length < MIN_LILIN || (paket.pages || 0) < HAL_KOIN) {
      const lilin = []
      let endT = Date.now()
      for (let p = 0; p < HAL_KOIN; p++) {
        const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1h&endTime=${endT}&limit=1000`
        const res = await fetchTahan(url)
        if (!res.ok) throw new Error(`${simbol} klines ${res.status}`)
        const rows = await res.json()
        if (!Array.isArray(rows) || rows.length === 0) break
        for (const r of rows) lilin.push({ t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4], v: +r[5] })
        if (rows.length < 1000) break
        endT = rows[0][0] - 1
        ambil++
        await tidur(JEDA_MS)
      }
      lilin.sort((a, b) => a.t - b.t)
      let funding = null
      try {
        const rf = await fetchTahan(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${simbol}&limit=1000`)
        if (rf.ok) funding = (await rf.json()).map(x => ({ t: +x.fundingTime, rate: +x.fundingRate }))
      } catch { funding = null }
      await tidur(JEDA_MS >> 1)
      if (lilin.length >= MIN_LILIN) { paket = { lilin, funding, pages: HAL_KOIN, diambil: Date.now() }; writeFileSync(cacheF, JSON.stringify(paket)) }
      else continue
    }
    buku.push({ simbol, lilin: paket.lilin, funding: paket.funding })
    if (buku.length % 10 === 0) console.log(`  koin siap: ${buku.length}`)
  }
  if (buku.length < 40) throw new Error(`koin cukup hanya ${buku.length} — tambang digugurkan (jujur)`)
  console.log(`koin terpakai: ${buku.length}; fetch halaman baru: ${ambil}`)

  const fundingPada = (f, t) => {
    if (!f || f.length === 0) return null
    const lalu = f.filter(x => x.t <= t).slice(-3)
    if (lalu.length === 0) return null
    return lalu.reduce((a, b) => a + b.rate, 0) / lalu.length
  }

  // 3) bangun SEMUA kandidat soal (fakta dari jalan 48 jam)
  const kandidat = []
  for (const b of buku) {
    const L = b.lilin, n = L.length
    if (n < 48 + 48 + 14) continue
    for (let i = 48; i < n - 48; i++) {
      const kartu = L.slice(i - 24, i)          // 24 lilin → wajah warisan
      const kontek = L.slice(i - 48, i)          // 48 jam → aturan lama
      const jalan = L.slice(i, i + 48)           // 48 jam → nasib
      const entry = kartu[kartu.length - 1].c
      const close48 = jalan[jalan.length - 1].c
      if (!(entry > 0) || !(close48 > 0)) continue
      const rel = close48 / entry - 1
      if (Math.abs(rel) < 2e-6) continue         // ARAH-DUA: tanpa arah dibuang
      const arah = rel > 0 ? 'BUY' : 'SELL'
      const x = fiturDari(kartu)
      const atrPct = atrPctDari(kontek)
      const funding24 = fundingPada(b.funding, jalan[0].t)
      const tanda = tandaDari(x, funding24)
      const keluarga = keluargaDariKartu(x, atrPct)
      const tinggi48 = Math.max(...jalan.map(l => l.h))
      const rendah48 = Math.min(...jalan.map(l => l.l))
      const { tpKunci, jamNapas, buruk } = ambangNapas(jalan, arah, atrPct, entry)
      const mekanisme = mekanismeDariJalan(arah, jalan, tpKunci, jamNapas, entry, close48)
      const hi48 = Math.max(...kontek.map(l => l.h)), lo48 = Math.min(...kontek.map(l => l.l))
      kandidat.push({
        simbol: b.simbol, waktu: ISO(jalan[0].t), tms: jalan[0].t, entry, close48, tinggi48, rendah48,
        arah, x, atrPct, funding24, tanda, keluarga, tpKunci, jamNapas, buruk, mekanisme, hi48, lo48
      })
    }
  }
  console.log(`kandidat momen nyata: ${kandidat.length}`)
  if (kandidat.length < TARGET_SOAL + TARGET_DADAKAN + 2000) throw new Error(`kandidat kurang (${kandidat.length}) — perluas tambang, jujur`)

  // 4) acak deterministik → 100rb bank + 1000 dadakan
  const rng = mulberry32(KUNCI_PRNG)
  const idx = kandidat.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t }
  const pilihUtama = idx.slice(0, TARGET_SOAL)
  const pilihDadak = idx.slice(TARGET_SOAL, TARGET_SOAL + TARGET_DADAKAN)

  // simpan jalan sementara pada kandidat terpilih saja (hemat memori)
  const posisiKoin = new Map(buku.map(b => [b.simbol, b]))
  for (const i of [...pilihUtama, ...pilihDadak]) {
    const k = kandidat[i]
    const b = posisiKoin.get(k.simbol)
    const L = b.lilin
    const t0 = k.tms
    // temukan indeks jalan: binari pada lilin t
    let lo = 0, hi = L.length - 1, mid = -1
    while (lo <= hi) { const m = (lo + hi) >> 1; if (L[m].t === t0) { mid = m; break } if (L[m].t < t0) lo = m + 1; else hi = m - 1 }
    if (mid < 0) continue
    k._jalan = L.slice(mid, mid + 48)
  }

  const susunSoal = (i, id) => {
    const k = kandidat[i]
    const pctTp = (k.arah === 'BUY' ? k.tpKunci / k.entry - 1 : 1 - k.tpKunci / k.entry) * 100
    const alasan = alasanKunci(k.arah, k.entry, k.tpKunci, k.jamNapas, k.mekanisme, k._jalan || [], k.close48)
    const pctBuruk = (k.arah === 'BUY' ? 1 - k.buruk / k.entry : k.buruk / k.entry - 1) * 100
    const bulat = dekatBulat(k.entry)
    const sisiKartu = k.arah === 'BUY'
      ? (k.x.breakHigh ? 'harga baru menembus aturan lama' : 'harga berdiri di bawah aturan lama')
      : (k.x.breakLow ? 'harga baru jatuh di bawah aturan lama' : 'harga bertahan di atas aturan lama')
    return {
      id, keluarga: 'PASAR', simbol: k.simbol, waktu: k.waktu,
      entry: +fmt(k.entry), close48: +fmt(k.close48), tinggi48: +fmt(k.tinggi48), rendah48: +fmt(k.rendah48),
      kelasHasil: k.arah, atrPct: +k.atrPct.toFixed(4), funding24: k.funding24 == null ? null : +k.funding24.toFixed(8),
      hi48: +fmt(k.hi48), lo48: +fmt(k.lo48), tanda: k.tanda,
      x: { e: +fmt(k.x.e), r1: +k.x.r1.toFixed(4), r3: +k.x.r3.toFixed(4), r12: +k.x.r12.toFixed(4), rsi: +k.x.rsi.toFixed(3), volz: +k.x.volz.toFixed(3), breakHigh: k.x.breakHigh, breakLow: k.x.breakLow, posisi: +k.x.posisi.toFixed(4), streakNaik: k.x.streakNaik, streakTurun: k.x.streakTurun, wickAtas: +k.x.wickAtas.toFixed(3), wickBawah: +k.x.wickBawah.toFixed(3), lebarPct: +k.x.lebarPct.toFixed(3), hiAll: +fmt(k.x.hiAll), loAll: +fmt(k.x.loAll), hi20: +fmt(k.x.hi20), lo20: +fmt(k.x.lo20) },
      keluargaJebakan: k.keluarga,
      kasus: `Kartu 48 jam ${k.simbol} @ ${k.waktu}: RSI ${k.x.rsi.toFixed(1)}, ${k.x.r1 > 0 ? k.x.streakNaik + ' naik' : k.x.streakTurun + ' turun'} beruntun, wick atas ${k.x.wickAtas.toFixed(1)}× badan, wick bawah ${k.x.wickBawah.toFixed(1)}×, posisi ${(k.x.posisi * 100).toFixed(0)}% lebar papan, volume z ${k.x.volz.toFixed(1)}, jarak angka bulat ${bulat.toFixed(2)}%; ${sisiKartu}. Keluarga jebakan ${k.keluarga}: ${TRAP_LINE[k.keluarga]}.`,
      tanya: `Kamu memutuskan SEKARANG. Arah entry apa (BUY/SELL)? Take profit ke berapa (harga pasti)? Alasan profesional: kenapa ke arah itu, dan kenapa TP di ambang itu — bukan di atasnya?`,
      kunci: { arah: k.arah, tp: +fmt(k.tpKunci), pctTp: +pctTp.toFixed(3), jamNapas: k.jamNapas, buruk48: +fmt(k.buruk), pctBuruk: +pctBuruk.toFixed(3), mekanisme: k.mekanisme, alasan }
    }
  }

  // bank utama 100rb → urut id → shard jsonl.gz
  pilihUtama.sort((a, b2) => (kandidat[a].simbol + kandidat[a].tms) < (kandidat[b2].simbol + kandidat[b2].tms) ? -1 : 1)
  const SOAL_PER_SHARD = 10000
  const shardHashes = []
  for (let s = 0; s < TARGET_SOAL / SOAL_PER_SHARD; s++) {
    let teks = ''
    for (let j = 0; j < SOAL_PER_SHARD; j++) {
      const i = pilihUtama[s * SOAL_PER_SHARD + j]
      const k = kandidat[i]
      const id = `C-${String(s * SOAL_PER_SHARD + j + 1).padStart(6, '0')}-${k.simbol}`
      teks += JSON.stringify(susunSoal(i, id)) + '\n'
    }
    const gz = zlib.gzipSync(Buffer.from(teks, 'utf8'), { level: 6 })
    const nama = `${DIR_BANK}/bank-${String(s).padStart(2, '0')}.jsonl.gz`
    writeFileSync(nama, gz)
    shardHashes.push({ file: nama, sha256: hashFull(gz) })
    console.log(`  shard ${s} tertulis (${(gz.length / 1048576).toFixed(2)} MB gz)`)
  }

  // dadakan-1000 (out-of-sample)
  const dadakSoal = pilihDadak.map((i, j) => susunSoal(i, `D-${String(j + 1).padStart(4, '0')}-${kandidat[i].simbol}`))
  const dadak = { protokol: 'CERMIN-100RB-DADAKAN', epoch: 'V334', diperbarui: ISO(Date.now()), jumlah: dadakSoal.length, sifat: 'out-of-sample — di luar bank utama, untuk ujian-ulang pasca-belajar', soal: dadakSoal }
  const dadakHash = hash16(JSON.stringify({ ...dadak, segel: null }))
  dadak.segel = { hash: dadakHash, algoritma: 'sha256-16-tanpa-segel' }
  writeFileSync(FILE_DADAK, JSON.stringify(dadak))

  // sampel-1200 (stratified dari bank utama, untuk jantung)
  const langkah = Math.floor(TARGET_SOAL / TARGET_SAMPEL)
  const sampelSoal = []
  for (let j = 0; j < TARGET_SAMPEL; j++) sampelSoal.push(susunSoal(pilihUtama[j * langkah + (langkah >> 1)], `S-${String(j + 1).padStart(4, '0')}`))
  const sampel = { protokol: 'CERMIN-100RB-SAMPEL', epoch: 'V334', diperbarui: ISO(Date.now()), jumlah: sampelSoal.length, sifat: 'subhimpun bank utama — denyut jantung menjawab ulang (tebakan dikunci dulu, kunci dibaca sesudahnya)', soal: sampelSoal }
  const sampelHash = hash16(JSON.stringify({ ...sampel, segel: null }))
  sampel.segel = { hash: sampelHash, algoritma: 'sha256-16-tanpa-segel' }
  writeFileSync(FILE_SAMPEL, JSON.stringify(sampel))

  // segel total
  const hashTotal = hashFull(shardHashes.map(s => s.sha256).join('|'))
  const segel = { protokol: 'CERMIN-100RB', epoch: 'V334', jumlah: TARGET_SOAL, shard: shardHashes, hashTotal, dibuat: ISO(Date.now()), prng: `mulberry32(${KUNCI_PRNG})`, sumber: 'Binance spot klines 1h publik (75+ koin teratas × 4.000 jam, cache luar repo) + funding futures publik fapi.binance.com — lilin, harga, funding ASLI, nol karangan; kunci dari jalan 48 jam sejati (ambang napas sejati = puncak/lembah sebelum retrace >= max(0.6%, 0.6×ATR%) terkonfirmasi tutupan)' }
  writeFileSync(FILE_SEGEL, JSON.stringify(segel, null, 1))

  // statistik
  const dist = (arr, key) => { const m = {}; for (const a of arr) { const v = typeof key === 'function' ? key(a) : a[key]; m[v] = (m[v] || 0) + 1 } return m }
  const terpilih = pilihUtama.map(i => kandidat[i])
  const stat = {
    epoch: 'V334', jumlah: TARGET_SOAL, dadakan: TARGET_DADAKAN, sampel: TARGET_SAMPEL,
    koin: buku.length, kandidatTotal: kandidat.length, fetchHalaman: ambil,
    distKeluarga: dist(terpilih, 'keluarga'), distArah: dist(terpilih, 'arah'), distMekanisme: dist(terpilih, 'mekanisme'),
    distFunding: dist(terpilih, k => k.funding24 == null ? 'tanpa-fapi' : k.funding24 < 0 ? 'negatif' : k.funding24 > 0.0005 ? 'positif-tinggi' : 'positif-rendah'),
    distRegime: dist(terpilih, k => k.x.r12 > 3 ? 'tren-naik' : k.x.r12 < -3 ? 'tren-turun' : 'datar'),
    distTpPct: dist(terpilih, k => { const p = (k.arah === 'BUY' ? k.tpKunci / k.entry - 1 : 1 - k.tpKunci / k.entry) * 100; return p < 1 ? '<1%' : p < 2 ? '1-2%' : p < 4 ? '2-4%' : p < 8 ? '4-8%' : '>=8%' }),
    koinList: buku.map(b => b.simbol),
    durasiDetik: Math.round((Date.now() - t0) / 1000)
  }
  writeFileSync(FILE_STAT, JSON.stringify(stat, null, 1))
  console.log('=== TAMBANG CERMIN-100RB SELESAI ===')
  console.log(JSON.stringify({ jumlah: stat.jumlah, dadakan: stat.dadakan, sampel: stat.sampel, koin: stat.koin, kandidat: stat.kandidatTotal, hashTotal: segel.hashTotal.slice(0, 16), distArah: stat.distArah, distKeluarga: stat.distKeluarga, distTpPct: stat.distTpPct }, null, 1))
}

main().catch(e => { console.error('TAMBANG GUGUR:', e.message); process.exit(1) })
