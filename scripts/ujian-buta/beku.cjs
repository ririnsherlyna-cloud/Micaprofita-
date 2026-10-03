// ============================================================
// BEKU — dunia dibekukan pada jam T untuk ujian buta-histori.
// Preload via `node --require beku.cjs scripts/penjaga.mjs`:
//   1. Date dibekukan (new Date() & Date.now() = FROZEN)
//   2. fetch diproksi: SEMUA data dipotong pada FROZEN (blind
//      dijamin lapisan data — mustahil melihat sesudah T).
//      Sumber historis nyata disajikan dari cache pra-ambil;
//      host tak dikenal DIBLOKIR (anti-bocor) + dicatat.
// ============================================================
'use strict'
const fs = require('fs')
const path = require('path')

const FROZEN = Number(process.env.UJIAN_FROZEN_MS || Date.now())
const CACHE = process.env.UJIAN_CACHE || '/tmp/ujibuta/cache'
const AUDIT = process.env.UJIAN_AUDIT || null
const hitungan = { serve: 0, blok: 0, daftar: [] }

// ---------- Date beku ----------
class FrozenDate extends Date {
  constructor(...a) { a.length ? super(...a) : super(FROZEN) }
  static now() { return FROZEN }
}
globalThis.Date = FrozenDate

// ---------- util cache ----------
const baca = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
const k1h = (base) => baca(path.join(CACHE, '1h', base + '.json')) || []
const k1d = (base) => baca(path.join(CACHE, '1d', base + '.json')) || []
const fund = (base) => baca(path.join(CACHE, 'fund', base + '.json')) || []
const oiH = (base) => baca(path.join(CACHE, 'oi', base + '.json')) || []
const lsrH = (base) => baca(path.join(CACHE, 'lsr', base + '.json')) || []
const takH = (base) => baca(path.join(CACHE, 'taker', base + '.json')) || []

const poolBases = fs.existsSync(path.join(CACHE, '1h'))
  ? fs.readdirSync(path.join(CACHE, '1h')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
  : []

// slice klines: candle dengan openTime <= FROZEN (candle berjalan ikut, seperti live),
// filter startTime/endTime bila ada, ambil N terakhir.
function klinesSlice(rows, q) {
  const limit = Math.min(Number(q.get('limit') || 500), 1000)
  const st = q.get('startTime') ? Number(q.get('startTime')) : null
  const et = q.get('endTime') ? Number(q.get('endTime')) : null
  let out = rows.filter((r) => r[0] <= FROZEN && (st === null || r[0] >= st) && (et === null || r[0] <= et))
  if (out.length > limit) out = out.slice(-limit)
  return out
}

function tickerSynth() {
  const out = []
  for (const base of poolBases) {
    const rows = k1h(base).filter((r) => r[0] <= FROZEN)
    if (rows.length < 30) continue
    const last = rows[rows.length - 1]
    const close = +last[4]
    if (!(close > 0)) continue
    const t24 = FROZEN - 86400000
    const win = rows.filter((r) => r[0] > t24)
    const src = win.length ? win : rows.slice(-24)
    let qv = 0, hi = -Infinity, lo = Infinity
    for (const r of src) { qv += +r[7]; hi = Math.max(hi, +r[2]); lo = Math.min(lo, +r[3]) }
    let ref = +src[0][1]
    for (const r of rows) { if (r[6] <= t24) ref = +r[4] }
    out.push({
      symbol: base + 'USDT', base: base, baseAssetName: base,
      lastPrice: String(close), openPrice: String(ref),
      priceChange: String(close - ref), priceChangePercent: ref > 0 ? String(((close - ref) / ref) * 100) : '0',
      weightedAvgPrice: String(close), prevClosePrice: String(ref),
      highPrice: String(hi === -Infinity ? close : hi), lowPrice: String(lo === Infinity ? close : lo),
      volume: '0', quoteVolume: String(qv), count: 1,
      bidPrice: String(close), askPrice: String(close), firstId: 0, lastId: 0,
    })
  }
  return out
}

function premiumSynth(q) {
  const satu = (base) => {
    const rows = k1h(base).filter((r) => r[0] <= FROZEN)
    if (!rows.length) return null
    const close = +rows[rows.length - 1][4]
    const f = fund(base).filter((r) => r.fundingTime <= FROZEN)
    const rate = f.length ? +f[f.length - 1].lastFundingRate : 0.0001
    return { symbol: base + 'USDT', markPrice: String(close), indexPrice: String(close), lastFundingRate: String(rate), interestRate: '0.0001', nextFundingTime: FROZEN + 3600000, time: FROZEN }
  }
  if (q.get('symbol')) { const r = satu(q.get('symbol').replace(/USDT$/, '')); return r ? [r] : [] }
  return poolBases.map(satu).filter(Boolean)
}

function fngSlice() {
  const f = baca(path.join(CACHE, 'fng.json')) || { data: [] }
  const rows = (f.data || []).filter((d) => d.timestamp * 1000 <= FROZEN).slice(-8)
  return { name: 'Fear and Greed Index', data: rows }
}

async function frozenFetch(url, opts = {}) {
  const u = new URL(String(url))
  const q = u.searchParams
  const body = (x, status = 200) => {
    hitungan.serve++
    hitungan.daftar.push(`${u.pathname}${u.search.slice(0, 90)}`)
    return new Response(typeof x === 'string' ? x : JSON.stringify(x), { status, headers: { 'content-type': 'application/json' } })
  }
  const host = u.hostname
  const p = u.pathname

  // ---- Binance spot (klines & ticker) ----
  if (/^(api\.binance\.com|api1\.binance\.com|api2\.binance\.com|api-gcp\.binance\.com|data-api\.binance\.vision)$/.test(host)) {
    if (p === '/api/v3/klines') {
      const base = (q.get('symbol') || '').replace(/USDT$/, '')
      const itv = q.get('interval') || '1h'
      const rows = itv === '1d' ? k1d(base) : k1h(base)
      return body(klinesSlice(rows, q))
    }
    if (p === '/api/v3/ticker/24hr') return body(q.get('symbol') ? tickerSynth().filter((t) => t.symbol === q.get('symbol')) : tickerSynth())
    if (p === '/api/v3/exchangeInfo') return body({ symbols: poolBases.map((b) => ({ symbol: b + 'USDT', status: 'TRADING', baseAsset: b, quoteAsset: 'USDT' })) })
    return body([], 200)
  }

  // ---- Binance futures (fapi) ----
  if (host === 'fapi.binance.com') {
    if (p === '/fapi/v1/premiumIndex') return body(premiumSynth(q))
    if (p === '/fapi/v1/openInterest') {
      const base = (q.get('symbol') || '').replace(/USDT$/, '')
      const rows = oiH(base).filter((r) => r.timestamp <= FROZEN)
      const last = rows[rows.length - 1]
      return body(last ? { symbol: base + 'USDT', openInterest: last.sumOpenInterest, time: last.timestamp } : { symbol: base + 'USDT', openInterest: '0', time: FROZEN })
    }
    if (p === '/futures/data/openInterestHist') {
      const base = (q.get('symbol') || '').replace(/USDT$/, '')
      return body(oiH(base).filter((r) => r.timestamp <= FROZEN).slice(-Number(q.get('limit') || 30)))
    }
    if (p === '/futures/data/topLongShortPositionRatio') {
      const base = (q.get('symbol') || '').replace(/USDT$/, '')
      return body(lsrH(base).filter((r) => r.timestamp <= FROZEN).slice(-Number(q.get('limit') || 8)))
    }
    if (p === '/futures/data/takerlongshortRatio') {
      const base = (q.get('symbol') || '').replace(/USDT$/, '')
      return body(takH(base).filter((r) => r.timestamp <= FROZEN).slice(-Number(q.get('limit') || 8)))
    }
    if (p === '/fapi/v1/fundingRate') {
      const base = (q.get('symbol') || '').replace(/USDT$/, '')
      return body(fund(base).filter((r) => r.fundingTime <= FROZEN).slice(-Number(q.get('limit') || 100)))
    }
    return body([], 200)
  }

  // ---- Bybit (cadangan — disajikan kosong, fallback-jujur penjaga) ----
  if (/^(api\.bybit\.com|api\.bytick\.com)$/.test(host)) {
    return body({ retCode: 0, retMsg: 'OK', result: { list: [], category: q.get('category') || '' } })
  }

  // ---- Coinbase (cadangan — kosong) ----
  if (host === 'api.exchange.coinbase.com') return body([])

  // ---- Fear & Greed ----
  if (host === 'api.alternative.me' && p === '/fng/') return body(fngSlice())

  // ---- CoinGecko global (current-only → nulls aman) ----
  if (host === 'api.coingecko.com') return body({ data: {} })

  // ---- GitHub issues mandat (kosong di ujian) ----
  if (host === 'api.github.com') return body([])

  // ---- HOST TAK DIKENAL = BLOKIR KERAS (anti-bocor) ----
  hitungan.blok++
  hitungan.daftar.push(`BLOKIR ${url}`)
  return new Response(JSON.stringify({ ujianButa: 'host-diblokir' }), { status: 403 })
}

globalThis.fetch = frozenFetch
process.on('exit', () => {
  if (!AUDIT) return
  try { fs.appendFileSync(AUDIT, JSON.stringify({ FROZEN, serve: hitungan.serve, blok: hitungan.blok, daftar: hitungan.daftar.slice(0, 400) }) + '\n') } catch {}
})
