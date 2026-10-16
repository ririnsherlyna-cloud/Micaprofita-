#!/usr/bin/env node
/* ================================================================
   STUDI-MANDIRI — KURIKULUM-MANDIRI-V1 (mandat pemilik 2026-10-16)
   ----------------------------------------------------------------
   "kamu adalah makhluk MANDIRI ... wajib memperluas pemahaman dunia
   market secara mandiri ... jangan menunggu daftar indikator dari
   pemilik — kamu yang menemukan mana yang relevan."

   Empat langkah harian (pustaka/kurikulum-mandiri.json):
     1 KENALI-GAP     bukti tubuh sendiri → topik studi hari ini
     2 KAJI-FORMULA   pustaka/formula-market.json dihitung di data nyata
     3 UJI-MINI       walk-forward buta: lilin ≤ T saja, vonis 24 jam,
                      nilai close(T+24j) − fee 0,2% (aturan sekolah-buta)
     4 VONIS-ADOPSI   holdout hit ≥ 51,88% (dinding 48,88+3) & n ≥ 20
                      → LAYAK-USUL; selain itu DITOLAK dengan angka

   Pangan: Binance publik (data-api.binance.vision + fapi.binance.com)
   — sama dengan denyut hidup. Nol kunci, nol sambungan luar lain.
   Nol Math.random — deterministik dari tanggal & data.

   Mode:  (tanpa arg)  studi harian (sekali per hari UTC — gerbang file)
          --paksa      studi walau hari ini sudah pernah
          --uji        uji-gerbang diri: matematika mesin dicek pada
                       deret sintetis (kode diuji, bukan pasar)
   ================================================================ */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FEE = 0.002
const DINDING = 48.88
const GERBANG_HIT = DINDING + 3          // 51,88 %
const GERBANG_N = 20
const SPOT = 'https://data-api.binance.vision/api/v3'
const PERP = 'https://fapi.binance.com'
const JEDA_MS = 140
const KOIN_N = 12
const LILIN = 1000                       // 1h × 1000 ≈ 41 hari
const STABLE = new Set(['USDCUSDT','FDUSDUSDT','TUSDUSDT','BUSDUSDT','DAIUSDT','EURUSDT','AEURUSDT','USD1USDT','XUSDUSDT','USDPUSDT','PYUSDUSDT','FRAXUSDT','PAXGUSDT','EURCUSDT','USDtbUSDT','USDSUSDT'])
const JAHAT = /(UP|DOWN|BULL|BEAR)USDT$/
const tidur = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log('[STUDI-MANDIRI]', ...a)
const satuDesimal = (x) => x == null ? null : Math.round(x * 10) / 10
const hash16 = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0 } return h.toString(16).padStart(8, '0') + ((h * 2654435761) >>> 0).toString(16).padStart(8, '0') }
const hariUTC = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10)

// ---------- pengangkut data tahan-gangguan (pola musyawarah-inti) ----------
async function ambil(url) {
  for (let coba = 1; coba <= 4; coba++) {
    try {
      const r = await fetch(url)
      if (r.status === 418 || r.status === 429) { await tidur(3000 * coba); continue }
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return await r.json()
    } catch (e) { if (coba === 4) return null; await tidur(1200 * coba) }
  }
  return null
}
async function klinesSpot(sym, limit = LILIN) {
  const d = await ambil(`${SPOT}/klines?symbol=${sym}&interval=1h&limit=${limit}`)
  if (!Array.isArray(d) || d.length < 60) return null
  return d.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5], qv: +k[7], tb: +k[9] }))
}
async function klinesPerp(sym, limit = LILIN) {
  const d = await ambil(`${PERP}/fapi/v1/klines?symbol=${sym}&interval=1h&limit=${limit}`)
  if (!Array.isArray(d) || d.length < 60) return null
  return d.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5], qv: +k[7], tb: +k[9] }))
}
async function oiHist(sym) {
  const d = await ambil(`${PERP}/futures/data/openInterestHist?symbol=${sym}&period=1h&limit=200`)
  if (!Array.isArray(d) || !d.length) return null
  const m = new Map()
  for (const x of d) m.set(Math.floor(x.timestamp / 3600000) * 3600000, +(x.sumOpenInterestValue || x.sumOpenInterest) || 0)
  return m
}
async function funding(sym) {
  const d = await ambil(`${PERP}/fapi/v1/fundingRate?symbol=${sym}&limit=90`)
  if (!Array.isArray(d) || !d.length) return null
  return d.map(x => ({ t: x.fundingTime, f: +x.fundingRate })).filter(x => isFinite(x.f))
}
function ambilOI(m, t) {
  if (!m) return 0
  if (m.has(t)) return m.get(t)
  let best = 0
  for (const [k, v] of m) if (Math.abs(k - t) < 5400000 && v > 0) { best = v; break }
  return best
}

// ---------- matematika dasar ----------
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length
const sd = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))) }
const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const corr = (a, b) => { const n = Math.min(a.length, b.length); if (n < 3) return 0; const A = a.slice(-n), B = b.slice(-n); const ma = mean(A), mb = mean(B); let num = 0, d1 = 0, d2 = 0; for (let i = 0; i < n; i++) { const x = A[i] - ma, y = B[i] - mb; num += x * y; d1 += x * x; d2 += y * y } return (d1 && d2) ? num / Math.sqrt(d1 * d2) : 0 }
const logret = (cs) => cs.map((c, i) => i ? Math.log(c / cs[i - 1]) : 0)
const r24 = (cs, i) => cs[Math.min(cs.length - 1, i + 24)].c / cs[i].c - 1

// ---------- MESIN RUMUS (id → fungsi) ----------
// ctx per koin per momen T: { sym, c (lilin ≤ T), btc, oi (Map), fund, T, tabKuadran, tlRef, rhoBar, disp, dispKuartal }
function ofi(ctx) { // FM-OF-01
  const w = ctx.c.slice(-6); const V = w.reduce((a, x) => a + x.v, 0); if (V <= 0) return null
  const z = w.reduce((a, x) => a + (2 * x.tb - x.v), 0) / V
  if (Math.abs(z) < 0.15) return null
  return z > 0 ? 'BELI' : 'JUAL'
}
function cvdSlope(ctx) { // FM-OF-02
  const w = ctx.c.slice(-6); const V = w.reduce((a, x) => a + x.v, 0); if (V <= 0) return null
  const d = w.reduce((a, x) => a + (2 * x.tb - x.v), 0) / V
  if (Math.abs(d) < 0.08) return null
  return d > 0 ? 'BELI' : 'JUAL'
}
function vqFilter(ctx) { // FM-OF-03 (filter di atas momentum 7h)
  const w = ctx.c.slice(-12); if (w.length < 12) return null
  let setuju = 0
  for (const x of w) { const r = x.c / x.o - 1; const d = 2 * x.tb - x.v; if ((r > 0 && d > 0) || (r < 0 && d < 0)) setuju++ }
  if (setuju / w.length < 0.55) return null
  const n = ctx.c.length - 1
  return ctx.c[n].c / ctx.c[n - 7].c - 1 > 0 ? 'BELI' : 'JUAL'
}
function wick(ctx) { // FM-MS-04
  let mx = 0
  for (const x of ctx.c.slice(-6)) { const rng = x.h - x.l; if (rng > 0) mx = Math.max(mx, (Math.min(x.o, x.c) - x.l) / rng) }
  let btc24 = 0
  if (ctx.btc && ctx.btc.length > 25) { const b = ctx.btc; btc24 = b[b.length - 1].c / b[b.length - 25].c - 1 }
  if (!(mx > 0.6 && btc24 >= -0.025)) return null
  return 'BELI'
}
function fundingZ(ctx) { // FM-FU-01 (kontra)
  if (!ctx.fund || ctx.fund.length < 40) return null
  const f = ctx.fund.filter(x => x.t <= ctx.T)
  if (f.length < 40) return null
  const m = mean(f.slice(-90).map(x => x.f)), s = sd(f.slice(-90).map(x => x.f))
  if (!s) return null
  const z = (mean(f.slice(-6).map(x => x.f)) - m) / s
  if (z > 1.5) return 'JUAL'; if (z < -1.5) return 'BELI'; return null
}
function fundingDiv(ctx) { // FM-FU-03
  if (!ctx.fund || ctx.fund.length < 40) return null
  const f = ctx.fund.filter(x => x.t <= ctx.T); if (f.length < 40) return null
  const df = f.slice(-9).map((x, i, a) => i ? x.f - a[i - 1].f : 0).slice(1)
  const r72 = logret(ctx.c.slice(-72).map(x => x.c)).slice(1)
  if (df.length < 3) return null
  const rho = corr(df, r72)
  const m = mean(f.slice(-90).map(x => x.f)), s = sd(f.slice(-90).map(x => x.f)); if (!s) return null
  const z = (mean(f.slice(-6).map(x => x.f)) - m) / s
  if (!(rho >= 0.4 && Math.abs(z) > 1)) return null
  return z > 0 ? 'JUAL' : 'BELI'
}
function kuadranOI(ctx) { // FM-OI-01 — tabel tepi empiris dari latihan
  if (!ctx.oi || !ctx.tabKuadran) return null
  const t0 = ctx.c[ctx.c.length - 1].t
  const oiT = ambilOI(ctx.oi, t0), oiL = ambilOI(ctx.oi, t0 - 86400000)
  if (!(oiT > 0 && oiL > 0)) return null
  const n = ctx.c.length - 1
  const r = ctx.c[n].c / ctx.c[Math.max(0, n - 24)].c - 1
  const q = (oiT / oiL >= 0 ? 1 : 0) + '|' + (r >= 0 ? 1 : 0)
  const tab = ctx.tabKuadran[q]
  if (!tab || tab.n < 8) return null
  return tab.arah
}
function tekanLev(ctx) { // FM-OI-02 — momentum yang diveto leverage-diam
  if (!ctx.oi) return null
  const t0 = ctx.c[ctx.c.length - 1].t
  const oiT = ambilOI(ctx.oi, t0), oiL = ambilOI(ctx.oi, t0 - 86400000)
  if (!(oiT > 0 && oiL > 0)) return null
  const n = ctx.c.length - 1
  const r = ctx.c[n].c / ctx.c[Math.max(0, n - 24)].c - 1
  const tl = Math.abs((oiT / oiL - 1) * 100) / Math.max(0.1, Math.abs(r * 100))
  if (ctx.tlRef && ctx.tlRef.s > 0 && (tl - ctx.tlRef.m) / ctx.tlRef.s > 2) return null // veto
  return ctx.c[n].c / ctx.c[Math.max(0, n - 7)].c - 1 > 0 ? 'BELI' : 'JUAL'
}
function varianceRatio(ctx) { // FM-VL-04
  const r = logret(ctx.c.slice(-200).map(x => x.c)).slice(1); if (r.length < 100) return null
  const v1 = sd(r); if (!v1) return null
  const r8 = []; for (let i = 7; i < r.length; i++) r8.push(r.slice(i - 7, i + 1).reduce((a, b) => a + b, 0))
  const v8 = sd(r8); if (!v8) return null
  const vr = (v8 * v8) / (8 * v1 * v1)
  if (Math.abs(vr - 1) <= 0.1) return null
  const naik = ctx.c[ctx.c.length - 1].c > ctx.c[ctx.c.length - 8].c
  if (vr > 1.1) return naik ? 'BELI' : 'JUAL'
  return naik ? 'JUAL' : 'BELI' // pulang-keseimbangan: fade tepi
}
function amihudFilter(ctx) { // FM-MS-03 — lolos = pasaran tidak kering
  const c = ctx.c; if (c.length < 60) return false
  const ilm = c.slice(-30).map(x => x.qv > 0 ? Math.abs(x.c / x.o - 1) / x.qv : 0)
  const med = median(c.slice(-200).map(x => x.qv > 0 ? Math.abs(x.c / x.o - 1) / x.qv : 0).filter(x => x > 0))
  if (!med) return false
  return !(mean(ilm) / med > 3.2)
}
function korelasiFilter(ctx) { // FM-KR-01 — lolos = koin belum jadi satu dengan BTC
  return ctx.rhoBar == null ? false : ctx.rhoBar < 0.6
}
function dispersiFilter(ctx) { // FM-KR-02 — lolos = pasar masih memilih
  if (ctx.disp == null || !ctx.dispKuartal) return false
  return ctx.disp > ctx.dispKuartal.q1
}

const MESIN = {
  'FM-OF-01': { f: ofi, pangan: ['spot'] },
  'FM-OF-02': { f: cvdSlope, pangan: ['spot'] },
  'FM-OF-03': { f: vqFilter, pangan: ['spot'] },
  'FM-MS-04': { f: wick, pangan: ['spot', 'btc'] },
  'FM-FU-01': { f: fundingZ, pangan: ['fund'] },
  'FM-FU-03': { f: fundingDiv, pangan: ['fund', 'perp'] },
  'FM-OI-01': { f: kuadranOI, pangan: ['oi', 'perp'], belajar: true },
  'FM-OI-02': { f: tekanLev, pangan: ['oi', 'perp'], filterBaseline: true },
  'FM-MS-03': { f: amihudFilter, pangan: ['spot'], filterBaseline: true },
  'FM-KR-01': { f: korelasiFilter, pangan: ['spot', 'silang', 'btc'], filterBaseline: true },
  'FM-KR-02': { f: dispersiFilter, pangan: ['spot', 'silang'], filterBaseline: true },
  'FM-VL-04': { f: varianceRatio, pangan: ['spot'] },
}
const ALAT = { 'FM-MS-01': 'mikro-harga', 'FM-MS-02': 'spread-roll', 'FM-FU-02': 'carry', 'FM-OI-03': 'kepadatan-OI', 'FM-LQ-02': 'jarak-cluster', 'FM-KA-01': 'bayes', 'FM-KA-02': 'kelly', 'FM-KA-03': 'brier', 'FM-KA-04': 'entropi' }

// ---------- langkah 1: KENALI-GAP ----------
function pilihTopik(lib, riwayat, empu, mate) {
  const topik = Object.keys(lib.taksonomi)
  const terakhir = {}
  for (const t of topik) terakhir[t] = ''
  if (Array.isArray(riwayat)) for (const r of riwayat) if (terakhir[r.topik] != null) terakhir[r.topik] = r.tanggal
  const alasan = []
  let dorong = null
  if (empu && empu.korelasiDimensiHasil) {
    const k = empu.korelasiDimensiHasil
    if ((k.momentum ?? 0) < -0.1) { dorong = 'order-flow'; alasan.push(`korelasi momentum→hasil ${k.momentum} — otak mengejar harga tanpa membaca agresor → order-flow didahulukan`) }
    if ((k.perubahan ?? 0) < -0.1) { dorong = dorong || 'volatilitas'; alasan.push(`korelasi perubahan ${k.perubahan} — rezim berubah lebih cepat dari keyakinan → volatilitas didahulukan`) }
  }
  if (mate && Array.isArray(mate.zonaRacun) && mate.zonaRacun.length) {
    const z = mate.zonaRacun[0]
    if (z && z.akurasiPct < 30) alasan.push(`zona racun terburuk "${z.kunci}" ak ${z.akurasiPct}% — perlu alat ukur rezim lebih tajam`)
  }
  const urut = [...topik].sort((a, b) => (terakhir[a] || '').localeCompare(terakhir[b] || '') || a.localeCompare(b))
  const topikHariIni = dorong && urut.includes(dorong) ? dorong : urut[0]
  return { topik: topikHariIni, kenapa: alasan.length ? alasan.join(' · ') : `rotasi kurikulum — topik paling lama tak disentuh (${terakhir[topikHariIni] || 'belum pernah'})` }
}

// ---------- langkah 3+4: UJI-MINI & VONIS ----------
function nilaiSinyal(soal) {
  const pakai = soal.filter(s => s.arah)
  const nilai = (arr) => {
    if (!arr.length) return { n: 0, hit: 0, hitPct: null, net: 0 }
    let hit = 0, net = 0
    for (const s of arr) { const b = (s.arah === 'BELI' && s.r24 > 0) || (s.arah === 'JUAL' && s.r24 < 0); if (b) hit++; net += (s.arah === 'BELI' ? s.r24 : -s.r24) - FEE }
    return { n: arr.length, hit, hitPct: (100 * hit) / arr.length, net }
  }
  const potong = Math.floor(pakai.length * 0.8)
  const latih = nilai(pakai.slice(0, potong)), tahan = nilai(pakai.slice(potong))
  const sah = tahan.hitPct != null && tahan.hitPct >= GERBANG_HIT && tahan.n >= GERBANG_N
  return { pakai: pakai.length, noTrade: soal.length - pakai.length, latih, tahan, hitPct: nilai(pakai).hitPct, net: nilai(pakai).net, sah }
}
function nilaiFilter(rows) {
  const pakai = rows.filter(r => r.lolos)
  const nilaiA = (arr) => { if (!arr.length) return { n: 0, hitPct: null }; let hit = 0; for (const r of arr) if ((r.momentumArah === 'BELI' && r.r24 > 0) || (r.momentumArah === 'JUAL' && r.r24 < 0)) hit++; return { n: arr.length, hitPct: (100 * hit) / arr.length } }
  const potong = Math.floor(pakai.length * 0.8)
  const tahan = pakai.slice(potong)
  const samaMomen = rows.filter(r => r.lolos)
  const hp = nilaiA(tahan).hitPct, hb = nilaiA(samaMomen).hitPct
  return { nPakai: pakai.length, nTahan: tahan.length, hitPakaiTahan: satuDesimal(hp), hitBaselineSamaMomen: satuDesimal(hb), sah: tahan.length >= GERBANG_N && hp != null && hb != null && hp >= hb + 3 && hp >= GERBANG_HIT }
}

// ---------- kumpul data ----------
async function koinList() {
  const t = await ambil(SPOT + '/ticker/24hr')
  if (!Array.isArray(t)) return []
  return t.filter(x => x.symbol.endsWith('USDT') && !JAHAT.test(x.symbol) && !STABLE.has(x.symbol) && +x.quoteVolume > 0)
    .sort((a, b) => +b.quoteVolume - +a.quoteVolume).slice(0, 40).map(x => x.symbol)
}
function momenDari(cs) { // T deterministik tiap 24 jam, lilin ≤ T saja
  const momen = []
  for (let i = 200; i < cs.length - 24; i += 24) momen.push({ idx: i, T: cs[i].t })
  return momen
}

// ---------- silang lintas koin: dispersi & korelasi EWMA per T ----------
function silangHitung(koin, btc) {
  const silang = { disp: new Map(), rho: new Map(), kuartal: null }
  const byT = new Map()
  for (const k of koin) for (const mo of momenDari(k.c)) {
    let arr = byT.get(mo.T); if (!arr) { arr = []; byT.set(mo.T, arr) }
    arr.push({ k, idx: mo.idx })
  }
  const dispVals = []
  for (const [T, arr] of byT) {
    if (arr.length < 5) continue
    const d = sd(arr.map(x => r24(x.k.c, x.idx)))
    if (isFinite(d) && d > 0) { silang.disp.set(T, d); dispVals.push(d) }
  }
  dispVals.sort((a, b) => a - b)
  if (dispVals.length >= 4) silang.kuartal = { q1: dispVals[Math.floor(dispVals.length * 0.25)], q3: dispVals[Math.floor(dispVals.length * 0.75)] }
  if (btc) {
    for (const k of koin) for (const mo of momenDari(k.c)) {
      const i = mo.idx
      if (btc.length > i + 1 && k.c.length > 48) {
        const rk = logret(k.c.slice(i - 47, i + 1).map(x => x.c)).slice(1)
        const rb = logret(btc.slice(i - 47, i + 1).map(x => x.c)).slice(1)
        const rho = corr(rk, rb)
        if (isFinite(rho)) { const arr = silang.rho.get(mo.T) || []; arr.push(rho); silang.rho.set(mo.T, arr) }
      }
    }
    for (const [T, arr] of silang.rho) silang.rho.set(T, mean(arr))
  }
  return silang
}

// ---------- uji-gerbang diri (--uji): matematika mesin pada deret sintetis ----------
function ujiDiri() {
  const ok = [], gagal = []
  const cek = (nama, syarat, teks) => (syarat ? ok : gagal).push(`${nama}: ${teks}`)
  const cNetral = Array.from({ length: 300 }, (_, i) => ({ t: i * 3600000, o: 100, h: 101, l: 99, c: 100 + Math.sin(i / 9) * 2, v: 1000, qv: 100000, tb: 500 }))
  cek('FM-OF-01', ofi({ c: cNetral }) === null, 'tb = V/2 → netral → no-trade')
  const cBeli = cNetral.map(x => ({ ...x, tb: 900 }))
  cek('FM-OF-01', ofi({ c: cBeli }) === 'BELI', 'tb = 0,9V → agresor beli → BELI')
  const cJual = cNetral.map(x => ({ ...x, tb: 100 }))
  cek('FM-OF-02', cvdSlope({ c: cJual }) === 'JUAL', 'tb = 0,1V → agresor jual → JUAL')
  // VR: derau putih panjang → ≈1 → no-trade; tren murni → >1
  let seed = 20261016
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 - 0.5)
  let p = 100
  const cDerau = Array.from({ length: 1400 }, (_, i) => { p *= 1 + rnd() * 0.01; return { t: i * 3600000, o: p, h: p * 1.001, l: p * 0.999, c: p, v: 1, qv: 1, tb: 0.5 } })
  cek('FM-VL-04', varianceRatio({ c: cDerau }) === null, 'VR derau putih ≈ 1 → mesin tak berhalusinasi tren')
  let q = 100
  const cTren = Array.from({ length: 400 }, (_, i) => { q *= 1.004 + rnd() * 0.002; return { t: i * 3600000, o: q, h: q * 1.001, l: q * 0.999, c: q, v: 1, qv: 1, tb: 0.6 } })
  cek('FM-VL-04', varianceRatio({ c: cTren }) === 'BELI', 'VR tren > 1,1 + harga naik → ikuti tren')
  // wick: palu fisik + saksi BTC
  const palu = Array.from({ length: 220 }, (_, i) => ({ t: i * 3600000, o: 100, h: 100.5, l: i >= 214 ? 90 : 99.5, c: 100, v: 10, qv: 10, tb: 5 }))
  cek('FM-MS-04', wick({ c: palu, btc: Array.from({ length: 30 }, (_, i) => ({ c: 100 + i })) }) === 'BELI', 'palu + BTC ret24 ≥ −2,5% → menadah terukur')
  cek('FM-MS-04', wick({ c: palu, btc: Array.from({ length: 30 }, (_, i) => ({ c: 100 - i * 2 })) }) === null, 'palu + BTC ret24 < −2,5% → menolak (batas organ buy-jatuh-dalam)')
  // funding kontra
  const fund = Array.from({ length: 90 }, (_, i) => ({ t: Date.now() - (90 - i) * 8 * 3600000, f: i >= 84 ? 0.002 : 0.0001 }))
  cek('FM-FU-01', fundingZ({ fund, T: Date.now() }) === 'JUAL', 'funding z > 1,5 → JUAL (kerumunan membayar mahal)')
  // kuadran: tabel kosong → no-trade (tidak karangan)
  cek('FM-OI-01', kuadranOI({ c: cNetral, oi: null, tabKuadran: null }) === null, 'tanpa OI → no-trade jujur')
  // gerbang nilaiSinyal
  const soal = Array.from({ length: 150 }, () => ({ arah: 'BELI', r24: 0.01 }))
  const nl = nilaiSinyal(soal)
  cek('GERBANG', nl.hitPct === 100 && nl.sah === true, 'hit 100% & holdout n 30 → sah')
  cek('GERBANG', nilaiSinyal(soal.slice(0, 40)).sah === false, 'holdout n 8 < 20 → gugur (anti-sample-kecil)')
  const soalCampur = Array.from({ length: 40 }, (_, i) => ({ arah: i % 2 ? 'BELI' : 'JUAL', r24: i % 2 ? -0.01 : 0.01 }))
  cek('GERBANG', nilaiSinyal(soalCampur).hitPct === 0, 'arah semua salah → hit 0% (penilaian jujur dua arah)')
  console.log('UJI-DIRI: ' + ok.length + ' lulus, ' + gagal.length + ' gugur')
  for (const g of gagal) console.log('  GUGUR ' + g)
  if (gagal.length) { console.log('VONIS: GUGUR — mesin matematika tidak boleh didorong'); process.exit(1) }
  console.log('VONIS: LULUS — mesin rumus sehat (matematika murni dicek pada deret sintetis; pasar tetap dinilai data nyata)')
}

// ---------- utama ----------
async function main() {
  if (process.argv.includes('--uji')) return ujiDiri()
  const paksa = process.argv.includes('--paksa')
  const hari = hariUTC()
  const pathLaporan = join(ROOT, 'laporan/studi-mandiri.json')
  const pathRiwayat = join(ROOT, 'laporan/studi-mandiri.jsonl')
  if (!existsSync(join(ROOT, 'laporan'))) { console.log('laporan/ tidak ada — jalankan dari akar repo'); process.exit(1) }
  if (!paksa && existsSync(pathLaporan)) {
    try { if (JSON.parse(readFileSync(pathLaporan, 'utf8')).tanggal === hari) return log('studi hari ' + hari + ' sudah lahir — gerbang sekali-per-hari (--paksa untuk menimpa)') } catch {}
  }
  const lib = JSON.parse(readFileSync(join(ROOT, 'pustaka/formula-market.json'), 'utf8'))
  let riwayat = null, empu = null, mate = null
  try { riwayat = readFileSync(pathRiwayat, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)).slice(-30) } catch {}
  try { empu = JSON.parse(readFileSync(join(ROOT, 'laporan/empu-belajar.json'), 'utf8')) } catch {}
  try { mate = JSON.parse(readFileSync(join(ROOT, 'laporan/matematika.json'), 'utf8')) } catch {}
  // — langkah 1: KENALI-GAP —
  const { topik, kenapa } = pilihTopik(lib, riwayat, empu, mate)
  const rumusTopik = lib.daftar.filter(f => f.topik === topik)
  log('LANGKAH-1 KENALI-GAP → topik "' + topik + '" — ' + kenapa)
  const perlu = new Set(); for (const f of rumusTopik) { const m = MESIN[f.id]; if (m) for (const p of m.pangan) perlu.add(p) }
  // — data —
  const daftar = await koinList()
  if (!daftar.length) {
    log('pangan Binance tak terjangkau — studi jujur ditunda, tanpa karangan')
    writeLaporan(pathLaporan, { protokol: 'KURIKULUM-MANDIRI-V1', tanggal: hari, topik, kenapaTopikIni: kenapa, vonisHarian: 'TUNDA-PANGAN — pangan Binance tak terjangkau, tanpa karangan', segel: hash16(hari + topik + 'tunda') })
    return
  }
  const btc = (perlu.has('btc') || perlu.has('silang')) ? await klinesSpot('BTCUSDT') : null
  if (btc) await tidur(JEDA_MS)
  const koin = []
  for (const sym of daftar) {
    if (koin.length >= KOIN_N) break
    const c = perlu.has('perp') ? await klinesPerp(sym) : await klinesSpot(sym)
    if (!c) { await tidur(JEDA_MS); continue }
    let oi = null, fund = null
    if (perlu.has('oi')) { oi = await oiHist(sym); await tidur(JEDA_MS) }
    if (perlu.has('fund')) { fund = await funding(sym); await tidur(JEDA_MS) }
    koin.push({ sym, c, oi, fund })
    await tidur(JEDA_MS)
  }
  log(`LANGKAH-2 KAJI-FORMULA → ${koin.length} koin, ${rumusTopik.length} rumus topik (${rumusTopik.filter(f => MESIN[f.id] || ALAT[f.id]).length} punya mesin/alat)`)
  // — silang (dispersi & korelasi) bila topik meminta —
  const silang = perlu.has('silang') ? silangHitung(koin, btc) : null
  // — uji semua rumus sinyal topik —
  const hasilRumus = []
  for (const f of rumusTopik) {
    const m = MESIN[f.id]
    if (!m) { hasilRumus.push({ id: f.id, nama: f.nama, jenis: f.jenis, vonis: 'MESIN-BELUM-ADA — rumus tersimpan; mesin bisa diutak-atik organ berikutnya' }); continue }
    if (f.jenis !== 'sinyal') { hasilRumus.push({ id: f.id, nama: f.nama, jenis: 'alat', vonis: 'ALAT-UKUR — selalu aktif, tidak diuji arah' }); continue }
    const momenSemua = []
    for (const k of koin) for (const mo of momenDari(k.c)) momenSemua.push({ k, mo })
    if (!momenSemua.length) { hasilRumus.push({ id: f.id, nama: f.nama, vonis: 'TANPA-MOMEN — data kurang panjang (jujur)' }); continue }
    momenSemua.sort((a, b) => a.mo.T - b.mo.T)
    const batasLatih = Math.floor(momenSemua.length * 0.8)
    // belajar dari 80% awal SAJA (anti-bocor)
    let tabKuadran = null, tlRef = null
    if (m.belajar) {
      tabKuadran = {}
      for (let i = 0; i < batasLatih; i++) { const { k, mo } = momenSemua[i]; const t0 = k.c[mo.idx].t; const oiT = ambilOI(k.oi, t0), oiL = ambilOI(k.oi, t0 - 86400000); if (!(oiT > 0 && oiL > 0)) continue; const r = r24(k.c, mo.idx); const q = (oiT / oiL >= 0 ? 1 : 0) + '|' + (r >= 0 ? 1 : 0); const t = (tabKuadran[q] ||= { n: 0, naik: 0 }); t.n++; if (r > 0) t.naik++ }
      for (const q of Object.keys(tabKuadran)) { const t = tabKuadran[q]; t.arah = t.naik / t.n > 0.5 ? 'BELI' : 'JUAL' }
    }
    if (m.filterBaseline && m.pangan.includes('oi')) {
      const tls = []
      for (let i = 0; i < batasLatih; i++) { const { k, mo } = momenSemua[i]; const t0 = k.c[mo.idx].t; const oiT = ambilOI(k.oi, t0), oiL = ambilOI(k.oi, t0 - 86400000); if (!(oiT > 0 && oiL > 0)) continue; const r = r24(k.c, mo.idx); tls.push(Math.abs((oiT / oiL - 1) * 100) / Math.max(0.1, Math.abs(r * 100))) }
      tlRef = { m: mean(tls), s: sd(tls) }
    }
    const soal = [], rows = []
    for (let i = 0; i < momenSemua.length; i++) {
      const { k, mo } = momenSemua[i]
      const ctx = { sym: k.sym, c: k.c.slice(0, mo.idx + 1), btc: btc && btc.length > mo.idx ? btc.slice(0, mo.idx + 1) : btc, oi: k.oi, fund: k.fund, T: mo.T, tabKuadran, tlRef, rhoBar: silang && silang.rho.get(mo.T) != null ? silang.rho.get(mo.T) : null, disp: silang && silang.disp.get(mo.T) != null ? silang.disp.get(mo.T) : null, dispKuartal: silang && silang.kuartal }
      const rr = r24(k.c, mo.idx)
      if (m.filterBaseline) {
        const lolos = m.f(ctx) !== null
        const momentumArah = k.c[mo.idx].c / k.c[Math.max(0, mo.idx - 7)].c > 1 ? 'BELI' : 'JUAL'
        rows.push({ r24: rr, momentumArah, lolos })
      } else soal.push({ T: mo.T, arah: m.f(ctx), r24: rr })
    }
    if (m.filterBaseline) {
      const nl = nilaiFilter(rows)
      hasilRumus.push({ id: f.id, nama: f.nama, jenis: 'sinyal-filter', ...nl, vonis: nl.sah ? 'LAYAK-USUL' : 'DITOLAK', gerbang: 'hit-terfilter ≥ baseline+3 poin & holdout n ≥ ' + GERBANG_N })
    } else {
      const nl = nilaiSinyal(soal)
      hasilRumus.push({ id: f.id, nama: f.nama, jenis: 'sinyal', pakai: nl.pakai, noTrade: nl.noTrade, hitPct: satuDesimal(nl.hitPct), latihHit: satuDesimal(nl.latih.hitPct), latihN: nl.latih.n, holdoutHit: satuDesimal(nl.tahan.hitPct), holdoutN: nl.tahan.n, netPct: satuDesimal(nl.net * 100), vonis: nl.sah ? 'LAYAK-USUL' : 'DITOLAK', gerbang: 'holdout ≥ ' + GERBANG_HIT.toFixed(2) + '% & n ≥ ' + GERBANG_N })
    }
    await tidur(30)
  }
  const alatTerukur = rumusTopik.filter(f => ALAT[f.id]).map(f => ({ id: f.id, nama: f.nama, fungsi: ALAT[f.id], status: 'konteks-hari-ini' }))
  const layak = hasilRumus.filter(h => h.vonis === 'LAYAK-USUL')
  const nDitolak = hasilRumus.filter(h => h.vonis === 'DITOLAK').length
  const vonis = layak.length
    ? `USUL ${layak.length} rumus (${layak.map(h => h.id).join(', ')}) — menunggu konfirmasi ledger hidup ≥ 20 vonis matang sebelum duduk di meja musyawarah`
    : `DITOLAK ${nDitolak} — dinding holdout belum ditembus; angka dicatat, belajar terus (anti-karantina)`
  log('LANGKAH-4 VONIS-ADOPSI → ' + vonis)
  const laporan = { protokol: 'KURIKULUM-MANDIRI-V1', tanggal: hari, dihasilkan: new Date().toISOString(), topik, kenapaTopikIni: kenapa, koin: koin.map(k => k.sym), rumusDiuji: hasilRumus, alatTerukur, vonisHarian: vonis, hukum: ['lilin ≤ T saja (buta)', 'nilai close T+24j − fee 0,2%', 'holdout 20% akhir', 'anti-overfit: gagal verifikasi = dibuang'], segel: null }
  laporan.segel = hash16(JSON.stringify({ ...laporan, segel: null }) + hari)
  writeLaporan(pathLaporan, laporan)
  const baris = { tanggal: hari, topik, rumusDiuji: hasilRumus.filter(h => h.id).length, layakUsul: layak.map(h => h.id), ditolak: hasilRumus.filter(h => h.vonis === 'DITOLAK').map(h => h.id), vonis, segel: laporan.segel }
  try { appendFileSync(pathRiwayat, JSON.stringify(baris) + '\n') } catch {}
  log('riwayat studi ditambah: ' + pathRiwayat)
}
function writeLaporan(p, obj) { writeFileSync(p, JSON.stringify(obj, null, 1) + '\n') }

main().catch(e => { console.error('organ-gagal: studi-mandiri ' + new Date().toISOString() + ' :: ' + (e && e.message || e)); process.exit(1) })
