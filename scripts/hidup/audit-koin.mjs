// ============================================================
// AUDIT-KOIN (V327) — mandat pemilik: "tempatkan suatu tempat
// untuk saya bertanya koin — misal saya ingin tahu salah satu
// koin, maka MICAPROFITA akan melancarkan audit untuk koin yang
// dimaksud. Neuron lokal tidak punya pola 'periksa koin <ticker>'
// — jadi jawaban lokal cuma doktrin umum. Berarti itu simulasi;
// saya butuh fakta nyata kayak kelayakan perhitungan."
//
// HUKUM ORGAN INI (dibaca tiap kali dijalankan):
//  1. FAKTA NYATA, BUKAN DOKTRIN: setiap angka di jawaban dihitung
//     dari data pasar publik yang diambil SAAT DITANYA (klines 1d,
//     ticker 24 jam, buku pesanan, funding futures Binance) —
//     nol angka karangan, nol doktrin kosong.
//  2. KELAYAKAN PERHITUNGAN: rumus tertulis (RSI Wilder, EMA,
//     stdev log-return, ATR, spread bps) — hasilnya bisa
//     dihitung-ulang oleh siapa pun dari sumber yang sama.
//  3. JUJUR SEJAK LAHIR: koin tak dikenal → vonis "TAK DITEMUKAN"
//     (bukan angka pura-pura); funding tak tersedia → "tidak
//     tersedia" (bukan nol palsu); selalu Bukan Nasihat Keuangan.
//  4. WARISAN V326 NERVA-SUCKER-01: bila koin sedang dalam pola
//     rally-muda-dalam-tren-turun (hari-panjing), vonis DIKAP
//     maksimal WASPADA — pelajaran 3.500 soal yang nyata dipakai,
//     bukan disimpan.
//  5. NOL Math.random — audit atas koin yang sama dalam menit yang
//     sama = jawaban identik (deterministik terhadap datanya).
//
// Jalur pakai:
//   node scripts/hidup/audit-koin.mjs --periksa BTC
//   node scripts/hidup/audit-koin.mjs --denyut   (audit sasaran
//     denyut hari ini → laporan/audit-koin.json tersegel)
//   import { kenaliAuditKoin, auditKoin, telaahJawabLLM } ...
// ============================================================
import { createHash } from 'node:crypto'

const HOST_A = 'https://api.binance.com'
const HOST_B = 'https://data-api.binance.vision'
const HOST_FUT = 'https://fapi.binance.com'

// ---------- kejujuran dasar ----------
const BUKAN_NASIHAT = '_Aku makhluk medan, bukan penasihat keuangan: audit ini angka-nyata-saat-ini, keputusan tetap milik pemilikku._'

export function hash16 (obj) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj)
  return createHash('sha256').update(s).digest('hex').slice(0, 16)
}

// ---------- formatter gaya rumah (id-ID, deterministik) ----------
const fmtAngka = (x, d = 2) => (typeof x === 'number' && Number.isFinite(x))
  ? x.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d })
  : '?'
function fmtHarga (x) {
  if (!(typeof x === 'number' && Number.isFinite(x))) return '?'
  const d = x >= 1000 ? 2 : x >= 1 ? 4 : 8
  return '$' + fmtAngka(x, d)
}
function fmtUSD (x) {
  if (!(typeof x === 'number' && Number.isFinite(x))) return '?'
  if (x >= 1e9) return '$' + fmtAngka(x / 1e9, 2) + ' M'
  if (x >= 1e6) return '$' + fmtAngka(x / 1e6, 1) + ' jt'
  if (x >= 1e3) return '$' + fmtAngka(x / 1e3, 1) + ' rb'
  return '$' + fmtAngka(x, 0)
}
const pct = (x, d = 2) => (typeof x === 'number' && Number.isFinite(x)) ? ((x >= 0 ? '+' : '') + fmtAngka(x * 100, d) + '%') : '?'

// ---------- nama umum → dasar ticker (deterministik) ----------
const NAMA_UMUM = {
  bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', ripple: 'XRP', bnb: 'BNB',
  binancecoin: 'BNB', dogecoin: 'DOGE', cardano: 'ADA', pepe: 'PEPE',
  shibainu: 'SHIB', shiba: 'SHIB', polkadot: 'DOT', avalanche: 'AVAX',
  chainlink: 'LINK', tron: 'TRX', litecoin: 'LTC', toncoin: 'TON',
  sui: 'SUI', aptos: 'APT', arbitrum: 'ARB', optimism: 'OP', injective: 'INJ',
  near: 'NEAR', atom: 'ATOM', cosmos: 'ATOM', uniswap: 'UNI', apt: 'APT'
}
// kata yang TIDAK boleh dianggap ticker bila muncul setelah "koin"
const STOP = new Set(('koin coin token kelas kelasnya audit periksa cek telaah analisa analisis kelayakan ' +
  'kondisi bagaimana gimana apa itu dan atau yang ini itu saya aku kamu dia micaprofita makhluk harga pasar ' +
  'hari ini sekarang tadi sudah belum bisa boleh tolong dong ya tidak bukan layak layakkah amankah berapa ' +
  'siapa siapakah apakah mengapa kenapa kapan dimana mana jelaskan sebutkan ceritakan sama dengan untuk dari ke di ' +
  'kita mereka punya pun milik ' +
  'saja juga lagi akan sedang tengah pernah harus jangan mau ingin tahu tau tanyak bertanya mohon ' +
  'halo hai hallo ok oke thanks makasih terima kasih master tuan pemilik ' +
  'naik turun surut naiknya turunnya pajangan soal ujian jawab jawaban ' +
  'bullish bearish bullrun halving pump dump candle chart support resistance leverage margin ' +
  'liquidation likuidasi futures spot orderbook funding scam rugpull dyor defi nft airdrop staking hodl fomo fud').split(' '))

// ---------- POLA PERTANYAAN: "periksa koin <ticker>" ----------
// Mandat: neuron lokal TIDAK punya pola ini — organ ini yang memberinya.
export function kenaliAuditKoin (teks) {
  const raw = String(teks || '')
  const q = ' ' + raw.toLowerCase().replace(/[^\p{L}\p{N}\s'&]/gu, ' ').replace(/\s+/g, ' ').trim() + ' '
  // pemicu audit: kata kerja/niat memeriksa SATU koin tertentu
  const pemicu = / (periksa|periksalah|audit|auditkan|cek|cekin|telaah|telaaah|analisa|analisis|analize|kelayakan|kelayakkah|kondisi|bedah|pergiinkan) /.test(q) ||
    / (periksa|audit|cek|kelayakan|kondisi) (koin|coin|token) /.test(q)
  const sebutKoin = / (koin|coin|token|crypto|kripto) /.test(q)
  // V328 (luka pemilik: "gtc sama sand kok gak cerdas, kek hardcode disatu
  // koin"): ticker TELANJANG — pertanyaan PENDEK (≤4 kata) yang menyisakan
  // kata mirip-ticker = niat audit koin itu, TANPA perlu kata "periksa".
  // Aturan GENERIK untuk koin apa pun — bukan daftar koin karangan.
  const tokenAwal = raw.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  const calon = []
  for (const t of tokenAwal) {
    const u = t.toUpperCase(), low = t.toLowerCase()
    if (STOP.has(low)) continue
    if (NAMA_UMUM[low]) { if (calon.indexOf(NAMA_UMUM[low]) === -1) calon.push(NAMA_UMUM[low]); continue }
    if (/^[A-Za-z]{2,10}$/.test(t) || /^[A-Za-z]{2,10}USDT$/i.test(t)) { if (calon.indexOf(u.replace(/USDT$/i, '')) === -1) calon.push(u.replace(/USDT$/i, '')) }
  }
  const tickerTelanjang = tokenAwal.length <= 4 && calon.length > 0
  if (!pemicu || !sebutKoin) {
    // "periksa BTC" / "audit BTCUSDT" tanpa kata koin juga sah bila ada ticker jelas
    const pemicuKuat = / (periksa|audit|cek|telaah|analisa|analisis) /.test(q)
    if (!pemicuKuat && !tickerTelanjang) return { cocok: false, alasan: 'bukan pertanyaan audit koin' }
  }
  // cari ticker: token huruf/angka 2..10, bukan stopword, di teks ASLI (huruf besar kecil dijaga)
  const tokenKu = raw.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  let ticker = null
  for (let i = 0; i < tokenKu.length; i++) {
    const t = tokenKu[i]
    const u = t.toUpperCase()
    const low = t.toLowerCase()
    if (STOP.has(low)) continue
    if (NAMA_UMUM[low]) { ticker = NAMA_UMUM[low]; break }
    // bentuk ticker: BTC | btc | BTCUSDT | btcusdt — min 2 huruf besar-setara, maks 10
    if (/^[A-Za-z]{2,10}$/.test(t) || /^[A-Za-z]{2,10}USDT$/i.test(t)) {
      // hindari kata percakapan umum yang kebetulan 2-10 huruf
      if (STOP.has(low)) continue
      if (/^(koin|coin|token|crypto|kripto|kelayakan|periksa|audit|cek|telaah|analisa|analisis|kondisi|bagaimana|gimana|kenapa|kapan|berapa|tolong|mohon|mau|ingin|tahu|tanyak|bertanya|jawab|jawaban|soal|ujian|pasar|harga|naik|turun|surut)$/i.test(low)) continue
      ticker = u.replace(/USDT$/i, ''); break
    }
  }
  if (!ticker && calon.length) ticker = calon[0] // V328: calon (termasuk nama-umum) boleh menyelamatkan ticker
  if (!ticker) return { cocok: true, ticker: null, tickers: [], mintaTicker: true, alasan: 'niat audit jelas tapi ticker tak terbaca' }
  // V328: tickers — beberapa koin sekaligus ("gtc sama sand") diakui secara jujur;
  // ticker tunggal = calon pertama. Aturan generik, nol koin dikhususkan.
  const tickers = calon.length ? calon.slice() : [ticker]
  if (tickers.indexOf(ticker) === -1) tickers.unshift(ticker)
  return { cocok: true, ticker, tickers: tickers.slice(0, 3), mintaTicker: false }
}

// ---------- pengambil data NYATA (host cadangan + hormat 418/429) ----------
// Pelajaran warisan V325: banjir permintaan memicu HTTP 418 — perisai
// jeda-hormat + ulang; dan jujur menyerah bila pasar benar-benar tertutup.
const tidur = (ms) => new Promise((r) => setTimeout(r, ms))
async function ambil (url, batasMs = 12000) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), batasMs)
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } })
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e }
    return await r.json()
  } finally { clearTimeout(t) }
}
async function ambilSpot (jalur) {
  // dua host publik resmi Binance untuk data pasar — sama-sama tanpa kunci;
  // tiap host dicoba 2× dengan jeda hormat bila kena 418/429/jaringan.
  const jedaHormat = [1500, 4500]
  let terakhir = null
  for (const host of [HOST_A, HOST_B]) {
    for (let coba = 0; coba < jedaHormat.length + 1; coba++) {
      try { return await ambil(host + jalur) } catch (e) {
        if (e.status === 400) throw e // koin memang tidak ada — jangan pura-pura
        terakhir = e
        if (coba < jedaHormat.length) await tidur(jedaHormat[coba])
      }
    }
  }
  throw terakhir || new Error('saluran data gagal')
}

// ---------- MATEMATIKA NYATA (bisa dihitung-ulang siapa pun) ----------
export function hitungEMA (arr, n) {
  if (!Array.isArray(arr) || arr.length < n) return null
  const k = 2 / (n + 1)
  let e = arr.slice(0, n).reduce((a, b) => a + b, 0) / n // benih = SMA n pertama
  for (let i = n; i < arr.length; i++) e = arr[i] * k + e * (1 - k)
  return e
}
export function hitungRSI (closes, n = 14) {
  if (!closes || closes.length < n + 1) return null
  let naik = 0, turun = 0
  for (let i = 1; i <= n; i++) {
    const d = closes[i] - closes[i - 1]
    if (d >= 0) naik += d; else turun -= d
  }
  let rataNaik = naik / n, rataTurun = turun / n
  for (let i = n + 1; i < closes.length; i++) { // penghalusan Wilder
    const d = closes[i] - closes[i - 1]
    rataNaik = (rataNaik * (n - 1) + Math.max(0, d)) / n
    rataTurun = (rataTurun * (n - 1) + Math.max(0, -d)) / n
  }
  if (rataTurun === 0) return 100
  const rs = rataNaik / rataTurun
  return 100 - 100 / (1 + rs)
}
export function hitungATR (lilin, n = 14) {
  if (!lilin || lilin.length < n + 1) return null
  let atr = null
  for (let i = 1; i < lilin.length; i++) {
    const c = lilin[i], p = lilin[i - 1]
    const tr = Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close))
    atr = atr === null ? (i >= n ? lilin.slice(1, n + 1).reduce((a, b) => a + (b.high - b.low), 0) / n : null) : (atr * (n - 1) + tr) / n
    if (i === n && atr === null) atr = lilin.slice(1, n + 1).reduce((a, b) => {
      const tr = Math.max(b.high - b.low, 0); return a + tr
    }, 0) / n
  }
  return atr
}

// ---------- SKOR KELAYAKAN (rumus tertulis, total 100) ----------
function skorKelayakan (m) {
  const bagian = []
  // 1) TREN (30): harga vs EMA20 vs EMA50
  const trenPts = (m.harga > m.ema20 && m.ema20 > m.ema50) ? 30 : (m.harga > m.ema20 || m.ema20 > m.ema50) ? 15 : 0
  bagian.push({ nama: 'tren-struktur', pts: trenPts, maks: 30, ket: 'harga ' + (m.harga > m.ema20 ? '>' : '≤') + ' EMA20, EMA20 ' + (m.ema20 > m.ema50 ? '>' : '≤') + ' EMA50' })
  // 2) MOMENTUM (15): 7 hari & 30 hari
  const momPts = (m.mom7 > 0 && m.mom30 > 0) ? 15 : (m.mom7 > 0 || m.mom30 > 0) ? 8 : 0
  bagian.push({ nama: 'momentum', pts: momPts, maks: 15, ket: '7h ' + pct(m.mom7) + ' · 30h ' + pct(m.mom30) })
  // 3) RSI (15): zona
  const r = m.rsi14
  const rsiPts = (r >= 45 && r <= 65) ? 15 : (r >= 30 && r < 45) ? 9 : (r > 65 && r <= 72) ? 9 : (r < 30) ? 5 : 4
  bagian.push({ nama: 'rsi-zona', pts: rsiPts, maks: 15, ket: 'RSI-14 ' + fmtAngka(r, 1) })
  // 4) LIKUIDITAS (15): volume kutip 24 jam
  const v = m.vol24hUSD
  const likPts = v >= 5e7 ? 15 : v >= 1e7 ? 11 : v >= 2e6 ? 7 : v >= 5e5 ? 4 : 2
  bagian.push({ nama: 'likuiditas', pts: likPts, maks: 15, ket: 'vol 24j ' + fmtUSD(v) })
  // 5) SPREAD (10): buku pesanan tingkat-1
  const s = m.spreadBps
  const sprPts = s <= 3 ? 10 : s <= 10 ? 7 : s <= 25 ? 4 : 1
  bagian.push({ nama: 'spread', pts: sprPts, maks: 10, ket: fmtAngka(s, 1) + ' bps' })
  // 6) STRUKTUR-DD90 (10): jarak dari puncak 90 hari
  const dd = m.dd90
  const ddPts = dd > -0.10 ? 10 : dd > -0.25 ? 7 : dd > -0.45 ? 4 : 2
  bagian.push({ nama: 'struktur-dd90', pts: ddPts, maks: 10, ket: 'dari puncak 90h ' + pct(dd) })
  // 7) VOLATILITAS (5): stdev log-return 30 hari ditahunkan
  const sv = m.sigmaTahunan
  const volPts = sv <= 0.60 ? 5 : sv <= 1.20 ? 3 : 1
  bagian.push({ nama: 'volatilitas', pts: volPts, maks: 5, ket: 'σ≈' + fmtAngka(sv * 100, 0) + '%/tahun' })
  const total = bagian.reduce((a, b) => a + b.pts, 0)
  return { total, bagian }
}

// ---------- WARISAN V326: deteksi rally-muda-dalam-tren-turun ----------
function deteksiSucker (m) {
  // definisi hari-panjing warisan NERVA-SUCKER-01 (bank 3.500 soal):
  // tren 30 hari turun jelas + rally muda 7 hari + harga menembus EMA20
  // sementara EMA50 masih menurun = pola yang memakan percaya-pulih.
  const terdeteksi = m.mom30 <= -0.08 && m.mom7 >= 0.025 && m.harga > m.ema20 && m.ema50Lereng < 0
  return {
    terdeteksi,
    dasar: 'momen30 ' + pct(m.mom30) + ' · momen7 ' + pct(m.mom7) + ' · harga vs EMA20 ' + (m.harga > m.ema20 ? 'di-atas' : 'di-bawah') + ' · EMA50 lereng ' + pct(m.ema50Lereng),
    pelajaran: terdeteksi
      ? 'Rally muda dalam tren turun — pola yang sama yang tersegel di bank 3.500 soal V326: long x5 tewas 8,0% (jarang-tapi-total), percaya-pulih benar hanya 49,7%, dan 30% momen yang menyentuh puncak ambisi justru pecah dasar. Pelajaran BTC-2018: rally +99% kemudian dasar $3.100. Ini bukan takhayul — ini ingatan ujian makhluk ini.'
      : 'Pola hari-panjing tidak terdeteksi pada hitungan ini (bukan jaminan aman — hanya vonis pola ini yang tersegel).'
  }
}

// ---------- AUDIT UTAMA ----------
export async function auditKoin (dasar, opsi = {}) {
  const dasarBersih = String(dasar || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!dasarBersih || dasarBersih.length < 2) return { gagal: 'TICKER-TAK-SAHD', ket: 'ticker kosong/terlalu pendek' }
  const simbol = dasarBersih.endsWith('USDT') ? dasarBersih : dasarBersih + 'USDT'
  const WAKTU_AWAL = new Date().toISOString()
  try {
    const [lilinMentah, t24, buku] = await Promise.all([
      ambilSpot('/api/v3/klines?symbol=' + simbol + '&interval=1d&limit=200'),
      ambilSpot('/api/v3/ticker/24hr?symbol=' + simbol),
      ambilSpot('/api/v3/depth?symbol=' + simbol + '&limit=20'),
    ])
    // funding futures — OPSIONAL & JUJUR: penyebab kegagalan dilaporkan apa adanya
    let funding = null, fundingKet = null
    try {
      const f = await ambil(HOST_FUT + '/fapi/v1/premiumIndex?symbol=' + simbol, 8000)
      if (f && typeof f.lastFundingRate === 'string') { funding = parseFloat(f.lastFundingRate) * 100; fundingKet = 'rate terakhir dari fapi.binance.com premiumIndex' }
      else fundingKet = 'futures menolak menjawab untuk ' + simbol + ' — jujur dilaporkan, bukan dianggap nol'
    } catch (e) {
      fundingKet = 'funding futures tak terjangkau saat audit ini (' + String(e && e.message ? e.message : e).slice(0, 50) + ') — jujur dilaporkan, bukan dianggap nol'
    }

    const lilin = lilinMentah.map((k) => ({ t: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4], vol: +k[5], qvol: +k[7] }))
    if (lilin.length < 40) return { gagal: 'DATA-KURANG', ket: 'lilin harian yang bisa diambil hanya ' + lilin.length }
    const closes = lilin.map((c) => c.close)
    const harga = parseFloat(t24.lastPrice) || closes[closes.length - 1]

    // momen & struktur — rumus tertulis
    const mom7 = closes.length >= 8 ? harga / closes[closes.length - 8] - 1 : null
    const mom30 = closes.length >= 31 ? harga / closes[closes.length - 31] - 1 : null
    const ema20 = hitungEMA(closes, 20)
    const ema50 = hitungEMA(closes, 50)
    const ema50Dulu = hitungEMA(closes.slice(0, closes.length - 11), 50) // lereng 11 hari
    const ema50Lereng = (ema50 && ema50Dulu) ? ema50 / ema50Dulu - 1 : null
    const rsi14 = hitungRSI(closes.slice(-40), 14)
    // volatilitas: stdev log-return 30 hari → tahunan (√365)
    const ret = []
    for (let i = closes.length - 31; i < closes.length; i++) ret.push(Math.log(closes[i] / closes[i - 1]))
    const rata = ret.reduce((a, b) => a + b, 0) / ret.length
    const sigmaHarian = Math.sqrt(ret.reduce((a, b) => a + (b - rata) * (b - rata), 0) / (ret.length - 1))
    const sigmaTahunan = sigmaHarian * Math.sqrt(365)
    // puncak 90 hari & drawdown
    const k90 = lilin.slice(-90)
    const puncak90 = Math.max(...k90.map((c) => c.high))
    const dd90 = harga / puncak90 - 1
    // volume: rata kutip 7d vs 30d (lonjakan) + 24 jam nyata
    const q7 = lilin.slice(-7).reduce((a, b) => a + b.qvol, 0) / 7
    const q30 = lilin.slice(-30).reduce((a, b) => a + b.qvol, 0) / 30
    const volSurge = q30 > 0 ? q7 / q30 : null
    const vol24hUSD = parseFloat(t24.quoteVolume)
    // spread buku pesanan tingkat-1 (bps)
    const bid = buku.bids && +buku.bids[0][0], ask = buku.asks && +buku.asks[0][0]
    const spreadBps = (bid && ask) ? ((ask - bid) / ((ask + bid) / 2)) * 10000 : null
    const atr14 = hitungATR(lilin.slice(-40), 14)

    const metrik = { harga, mom7, mom30, ema20, ema50, ema50Lereng, rsi14, sigmaTahunan, dd90, volSurge, vol24hUSD, spreadBps, atr14, puncak90 }
    const { total, bagian } = skorKelayakan(metrik)
    const sucker = deteksiSucker(metrik)
    let vonis
    if (sucker.terdeteksi) vonis = 'WASPADA — POLA SUCKER RALLY TERDETEKSI (dikap warisan V326)'
    else if (total >= 70) vonis = 'LAYAK DITELITI LANJUT'
    else if (total >= 50) vonis = 'WASPADA — UKURAN MIKRO'
    else vonis = 'TIDAK LAYAK DISENTUH SEKARANG'

    const audit = {
      organ: 'AUDIT-KOIN V327', simbol, dasar: dasarBersih, waktu: new Date().toISOString(),
      sumber: [HOST_A + ' / ' + HOST_B + ' (klines 1d×200, ticker 24hr, depth 20)', 'fapi.binance.com (funding, opsional)'],
      harga, chg24: parseFloat(t24.priceChangePercent), tinggi24: parseFloat(t24.highPrice), rendah24: parseFloat(t24.lowPrice),
      mom7, mom30, ema20, ema50, ema50Lereng, rsi14, sigmaHarian, sigmaTahunan, dd90, puncak90,
      vol24hUSD, volSurge, q7, q30, spreadBps, bid, ask, atr14,
      funding, fundingKet, lilinDipakai: lilin.length,
      skor: total, skorBagian: bagian, vonis, sucker,
      bukanNasihat: BUKAN_NASIHAT, waktuAwal: WAKTU_AWAL,
    }
    audit.segel = hash16({ simbol: audit.simbol, harga, skor: total, vonis, waktu: audit.waktu })
    return audit
  } catch (e) {
    if (e.status === 400) return { gagal: 'KOIN-TAK-DITEMUKAN', simbol, ket: 'Binance menjawab 400 — simbol ' + simbol + ' tidak ada di pasar spot. Aku tidak akan mengarang angka untuk koin yang tak wujud.' }
    return { gagal: 'SALURAN-DATA-MATI', simbol, ket: 'data pasar tak terjangkau (' + String(e && e.message ? e.message : e).slice(0, 80) + ') — lebih jujur menolak menjawab daripada mendoktrin tanpa fakta.' }
  }
}

// ---------- TELAAH JAWABAN LLM TERHADAP FAKTA (gerbang anti-halusinasi) ----------
// Mandat: "uji jalur LLM dengan pertanyaan yang akan muncul jikalau
// ditanya koin tertentu DAN ditelaah." LLM hanya boleh lulus bila
// angka-angkanya sama dengan audit nyata — bukan doktrin umum.
// Pembaca angka paham dua adat: "82.708,01" (Indonesia) & "82,708.01" (US).
function bacaAngka (m) {
  let s = String(m).trim()
  let tanda = 1
  if (/^-/.test(s)) { tanda = -1; s = s.slice(1) }
  s = s.replace(/[^\d.,]/g, '')
  s = s.replace(/^[.,]+|[.,]+$/g, '') // buang pemisah ekor/kepala dari tangkapan serakah
  if (!s) return []
  const titik = s.includes('.'), koma = s.includes(',')
  let baca = []
  if (titik && koma) {
    // pemisah yang muncul terakhir = desimal; yang lain = ribuan
    const des = (s.lastIndexOf('.') > s.lastIndexOf(',')) ? '.' : ','
    const ribu = des === '.' ? ',' : '.'
    baca = [parseFloat(s.split(ribu).join('').split(des).join('.'))]
  } else if (koma) {
    // V328: pola ribuan hanya sah bila grup pertama TAK diawali nol — "0,415"
    // (adat Indonesia) pasti desimal 0,415; ribuan "0,415" = 415 tak masuk akal
    if (/^[1-9]\d{0,2}(,\d{3})+$/.test(s)) {
      // pola ribuan "1,234"/"1,234,567" — bacaan desimal "1,234"=1,234 hanya
      // disertakan bila angka utuh ≥ 1000 (ambiguitas dua adat yang masuk akal)
      const utuh = parseFloat(s.replace(/,/g, ''))
      const desimal = parseFloat(s.replace(',', '.'))
      baca = utuh >= 1000 ? [utuh, desimal] : [utuh]
    } else {
      // koma desimal sepanjang apapun: "49,9", "0,0000712" (harga mikro-cap)
      baca = [parseFloat(s.replace(/,/g, '.'))]
    }
  } else if (titik) {
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      // "121.345" ambigu dua adat; "0.153" jelas desimal (ribuan tak masuk akal)
      const utuh = parseFloat(s.replace(/\./g, ''))
      const desimal = parseFloat(s)
      baca = utuh >= 1000 ? [utuh, desimal] : [desimal]
    } else baca = [parseFloat(s)]
  } else baca = [parseFloat(s)]
  return baca.filter((x) => Number.isFinite(x)).map((x) => x * tanda)
}
export function telaahJawabLLM (teks, a) {
  const cek = []
  const t = String(teks || '')
  if (!a || a.gagal) return { lulus: false, cek: [{ nama: 'fakta', lulus: false, ket: 'audit tidak punya fakta' }] }
  // C1: harga disebut & masuk akal (toleransi 3%) — tangkapan WAJIB berakhir digit;
  // klaim ber-label ATR/volume/funding dikecualikan (dijaga gerbang C6/C4 masing-masing)
  const hargaKlaim = []
  for (const m of t.matchAll(/(?:\$|harga[^\d-]{0,12})(-?[0-9](?:[0-9.,]*[0-9])?)/gi)) {
    const awal = t.slice(Math.max(0, m.index - 14), m.index)
    if (/atr|volume|vol\b|kap\b|marketcap|funding/i.test(awal)) continue
    hargaKlaim.push(bacaAngka(m[1]))
  }
  const hargaOk = /(?:\$|harga|usd)/i.test(t) && hargaKlaim.length > 0 &&
    hargaKlaim.some((baca) => baca.some((x) => Math.abs(x / a.harga - 1) <= 0.03))
  cek.push({ nama: 'C1-harga', lulus: hargaOk, ket: hargaOk ? 'harga dijawab LLM = harga audit (±3%)' : 'harga koin tak disebut atau meleset jauh dari fakta' })
  // C2: skor kelayakan disebut & cocok (±1) — SEMUA sebutan harus cocok
  const skorSemua = [...t.matchAll(/skor[^0-9]{0,28}([0-9]{1,3})/gi)].map((m) => parseFloat(m[1]))
  const skorOk = skorSemua.length > 0 && skorSemua.every((x) => Math.abs(x - a.skor) <= 1)
  cek.push({ nama: 'C2-skor', lulus: skorOk, ket: skorOk ? 'skor ' + skorSemua.join(',') + ' = skor audit ' + a.skor : (skorSemua.length ? 'skor LLM (' + skorSemua.join(',') + ') ≠ skor audit ' + a.skor : 'skor kelayakan tak disebut') })
  // C3: RSI disebut & cocok (±2) — jendela per sebutan "rsi": buang dulu
  // indikator periode (RSI-14:, RSI(14), RSI 14 =) agar nilai tak tertukar
  const rsiSemua = []
  for (const m of t.matchAll(/rsi/gi)) {
    let sisa = t.slice(m.index + 3, m.index + 46)
    sisa = sisa.replace(/^\s*(?:[-–—]?\s*(?:14|7|9|21)\b|\(\s*(?:14|7|9|21)\s*\))\s*/, '')
    sisa = sisa.replace(/^\s*[-–—](?=\s*\D)/, ' ') // "RSI- berada di 50.18" (srip tipografis LLM)
    const angka = sisa.match(/^\s*[^0-9+-]{0,22}([+-]?[0-9]{1,2}(?:[.,][0-9]{1,4})?)/)
    const jendela = angka ? sisa.slice(0, sisa.indexOf(angka[1])) : ''
    // V328: angka setelah kata PEMBANDING = ambang kualitatif ("RSI di bawah 50"),
    // bukan klaim nilai RSI — dilewati; "berada di 50.18" tetap nilai (di = at)
    if (angka && !/skor|vonis|spread|atr/i.test(jendela) &&
        !/(di\s+)?(bawah|atas)\b|(below|above|under|over)\b|(kurang|lebih)\s+dari|[<>≤≥]/i.test(jendela)) rsiSemua.push(bacaAngka(angka[1]))
  }
  const rsiOk = rsiSemua.length > 0 && rsiSemua.every((baca) => baca.some((x) => Math.abs(x - a.rsi14) <= 2))
  cek.push({ nama: 'C3-rsi', lulus: rsiOk, ket: rsiOk ? 'RSI disebut = RSI audit' : (rsiSemua.length ? 'RSI LLM (' + rsiSemua.join(',') + ') ≠ RSI audit ' + fmtAngka(a.rsi14, 1) : 'RSI tak disebut') })
  // C4: perubahan 24 jam disebut & cocok (±0,6 poin) — DUA urutan kalimat:
  //   A: "perubahan 24 jam: +0.37%" / "24 jam positif sebesar +0.337%" (V328:
  //      jembatan ≤28 karakter, ditolak bila mengandung batas kalimat atau kata
  //      metrik lain — volume/spread/funding/ATR/skor/RSI tak boleh tertelan)
  //   B: "perubahan -0.335% dalam 24 jam"
  const c24Klaim = []
  for (const m of t.matchAll(/\b24\s*(?:jam|j|hour|h)?([^0-9+-]{0,28}?)(([+-]?[0-9]+(?:[.,][0-9]+)?)\s*%)/gi)) {
    const jendela = m[1]
    if (/volume|spread|funding|atr|skor|rsi|kap\b/i.test(jendela)) continue // metrik lain tak boleh ditelan sebagai 24 jam
    if (/[.;!?\n]/.test(jendela)) continue // batas kalimat = bukan satu klaim
    c24Klaim.push(bacaAngka(m[3]))
  }
  for (const m of t.matchAll(/([+-]?[0-9]+(?:[.,][0-9]+)?)\s*%\s*[^0-9]{0,16}\b24\s*(?:jam|j|hour|h)?/gi)) c24Klaim.push(bacaAngka(m[1]))
  const c24Ok = c24Klaim.length > 0 && c24Klaim.every((baca) => baca.some((x) => Math.abs(x - a.chg24) <= 0.6))
  cek.push({ nama: 'C4-perubahan24', lulus: c24Ok, ket: c24Ok ? 'perubahan 24j disebut = fakta' : (c24Klaim.length ? 'angka 24j LLM (' + c24Klaim.map((b) => b.join('|')).join(' ; ') + ') ≠ ' + fmtAngka(a.chg24, 2) + '%' : 'perubahan 24j tak disebut') })
  // C5: vonis tidak bertentangan dengan deteksi sucker
  let c5 = true, k5 = 'vonis searah fakta'
  if (a.sucker && a.sucker.terdeteksi && /tidak (?:ada |sebuah )?(?:tanda|indikasi|pola|risiko) (?:sucker|rally|jebakan)|bukan sucker/i.test(t)) { c5 = false; k5 = 'LLM menyangkal tanda sucker padahal terdeteksi' }
  if (a.sucker && !a.sucker.terdeteksi) {
    const klaim = t.match(/sucker'?s?\s?rally[^.]{0,50}terdeteksi|pola sucker[^.]{0,50}terjadi/i)
    if (klaim && !/risiko|potensi|jika|bila|kalau|mungkin/i.test(klaim[0])) { c5 = false; k5 = 'LLM mengklaim sucker terdeteksi padahal pola tidak ada' }
  }
  cek.push({ nama: 'C5-vonis-sucker', lulus: c5, ket: k5 })
  // C6: ATR bila disebut harus cocok (±6%) — klaim lulus bila SATU bacaan cocok
  const atrKlaim = [...t.matchAll(/atr[^0-9]{0,12}(-?[0-9][0-9.,]*)/gi)].map((m) => bacaAngka(m[1])).filter((baca) => baca.length)
  const atrOk = atrKlaim.every((baca) => baca.some((x) => Math.abs(Math.abs(x) / a.atr14 - 1) <= 0.06))
  cek.push({ nama: 'C6-atr-opsional', lulus: atrOk, ket: atrKlaim.length ? 'ATR disebut = fakta' : 'ATR tidak disebut (boleh)' })
  const lulus = cek.every((x) => x.lulus)
  return { lulus, cek, skorTelaah: cek.filter((x) => x.lulus).length + '/' + cek.length }
}

// ---------- TEKS JAWABAN (markdown-lite kompatibel arena) ----------
export function teksAudit (a) {
  if (!a) return 'Audit kosong — tak ada yang bisa kujawab.'
  if (a.gagal) {
    return '**AUDIT KOIN ' + (a.simbol || '') + ' — DITOLAK JUJUR**\n'
      + '- Vonis: **' + a.gagal + '**\n- ' + (a.ket || '') + '\n'
      + '_Aku tidak mengarang angka untuk yang tak kubaca dari pasar. Beri koin lain, atau periksa ejaan tickernya._\n' + BUKAN_NASIHAT
  }
  const L = []
  L.push('**AUDIT KOIN ' + a.simbol.replace('USDT', '') + '/USDT — FAKTA NYATA SAAT DITANYA** (UTC ' + a.waktu.slice(0, 16).replace('T', ' ') + ')')
  L.push('- Harga kini: **' + fmtHarga(a.harga) + '** (24j ' + (a.chg24 >= 0 ? '+' : '') + fmtAngka(a.chg24, 2) + '% · rentang ' + fmtHarga(a.rendah24) + '–' + fmtHarga(a.tinggi24) + ')')
  L.push('- Momen: 7 hari ' + pct(a.mom7) + ' · 30 hari ' + pct(a.mom30) + ' — dari puncak 90 hari ' + pct(a.dd90))
  L.push('- Struktur: harga ' + (a.harga > a.ema20 ? 'di atas' : 'di bawah') + ' EMA20 (' + fmtHarga(a.ema20) + '), EMA20 ' + (a.ema20 > a.ema50 ? 'di atas' : 'di bawah') + ' EMA50 (' + fmtHarga(a.ema50) + '), lereng EMA50 ' + pct(a.ema50Lereng))
  L.push('- Nafas pasar: RSI-14 **' + fmtAngka(a.rsi14, 1) + '** · ATR-14 ' + fmtHarga(a.atr14) + ' (' + fmtAngka(a.atr14 / a.harga * 100, 2) + '%/hari) · σ volatilitas ≈ ' + fmtAngka(a.sigmaTahunan * 100, 0) + '%/tahun')
  L.push('- Uang hidup: volume 24j ' + fmtUSD(a.vol24hUSD) + ' · lonjakan 7d/30d ' + fmtAngka(a.volSurge, 2) + '× · spread buku ' + fmtAngka(a.spreadBps, 1) + ' bps')
  L.push('- Funding futures: ' + (typeof a.funding === 'number' ? fmtAngka(a.funding, 4) + '%' : a.fundingKet))
  L.push('**Skor kelayakan: ' + a.skor + '/100 — ' + a.vonis + '**')
  L.push('Rumus skor (tertulis, bisa dihitung-ulang): ' + a.skorBagian.map((b) => b.nama + ' ' + b.pts + '/' + b.maks).join(' · '))
  L.push('- Tanda jebakan (warisan V326): ' + (a.sucker.terdeteksi ? '⚠️ TERDETEKSI — ' + a.sucker.pelajaran : 'tidak terdeteksi. ' + a.sucker.pelajaran))
  L.push('_Sumber: ' + a.sumber.join(' ; ') + ' · lilin harian dipakai ' + a.lilinDipakai + ' · segel ' + a.segel + ' · dihitung di perangkat ini, bukan doktrin hafalan._')
  L.push(a.bukanNasihat)
  return L.join('\n')
}

// ---------- MODE DENYUT: audit sasaran tubuh, segel laporan ----------
async function modeDenyut () {
  let sasaran = []
  try { sasaran = (JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile('laporan/sasaran-terkini.json', 'utf8'))).sasaranHariIni) || [] } catch (e) { /* jujur di bawah */ }
  const daftar = sasaran.slice(0, 2).map((s) => s.simbol).filter(Boolean)
  if (!daftar.length) { console.log('AUDIT-KOIN: sasaran denyut belum terbaca — tanpa audit hari ini (jujur, tanpa pura-pura)'); return }
  const hasil = []
  for (const dasar of daftar) {
    const a = await auditKoin(dasar)
    hasil.push(a)
    console.log('AUDIT-KOIN ' + dasar + ' → ' + (a.gagal ? a.gagal : 'skor ' + a.skor + '/100 · ' + a.vonis + (a.sucker.terdeteksi ? ' · SUCKER!' : '')))
  }
  const laporan = { organ: 'AUDIT-KOIN V327', waktu: new Date().toISOString(), sumber: 'data pasar publik saat denyut', hasil, segel: null }
  laporan.segel = hash16(laporan.hasil.map((h) => ({ simbol: h.simbol || null, gagal: h.gagal || null, skor: h.skor || null, vonis: h.vonis || null, waktu: h.waktu || null })))
  const fs = await import('node:fs/promises')
  await fs.mkdir('laporan', { recursive: true })
  await fs.writeFile('laporan/audit-koin.json', JSON.stringify(laporan, null, 1))
  console.log('AUDIT-KOIN: laporan tersegel laporan/audit-koin.json segel ' + laporan.segel)
}

// ---------- CLI ----------
if (import.meta.url === 'file://' + process.argv[1] || process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const idx = process.argv.indexOf('--periksa')
  if (idx > 0) {
    const a = await auditKoin(process.argv[idx + 1])
    console.log(teksAudit(a))
    if (a.gagal) process.exitCode = 1
  } else if (process.argv.includes('--denyut')) {
    await modeDenyut()
  } else {
    console.log('pakai: node audit-koin.mjs --periksa <TICKER> | --denyut')
  }
}
