// V351 UJI-AKURASI-400 — penempaan atas mandat pemilik (2026-10-15):
// "tempa lagi dia — makin bertambah hari, akurasi makin tajam".
// 400 soal BUTA dari klines Binance nyata (sumber pangan yang sama dengan
// denyut hidup — publik, tanpa kunci, tanpa sambungan luar lain): 40 koin
// likuid × 10 momen waktu tetap. Di momen T hanya lilin ≤ T yang boleh
// dibaca (buta dijamin lapisan data), vonis dinilai dari lilin T+24 jam − fee
// — aturan penilaian yang sama persis dengan medan hidup penjaga.
// Dibandingkan di soal yang SAMA:
//   (1) bobot-lama    = GENOME_AWAL (komite dimensi hidup sebelum empu)
//   (2) bobot-empu-k  = hasil fit dari ledger pengalaman sendiri yang dipotong
//                       di k pengalaman pertama (40/80/120/160/200/penuh)
//                       → KURVA BELAJAR: makin banyak pengalaman, makin tajam
// nol Math.random — pemilihan koin & momen deterministik.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FEE = 0.002
const H = 'https://data-api.binance.vision/api/v3'
const DIM = ['struktur', 'momentum', 'sr', 'tekanan', 'perubahan']
const GENOME_AWAL = { struktur: 0.24, momentum: 0.26, sr: 0.16, tekanan: 0.18, perubahan: 0.16 }
const STABIL = new Set(['USDC', 'FDUSD', 'TUSD', 'USDP', 'DAI', 'AEUR', 'USD1', 'USDE', 'PYUSD', 'FRAX', 'BUSD', 'PAXG', 'XUSD', 'USDtb', 'EURI', 'USDS'])
const JEDA_MS = 140
const tidur = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log('[UJI-400]', ...a)

// ---- bobot empu dari ledger sendiri (regresi logistik — sama dengan organ EMPU di penjaga) ----
function empuFitLogistik(soal, langkah = 4000) {
  const J = DIM.length
  const w = new Array(J + 1).fill(0)
  for (let t = 0; t < langkah; t++) {
    const lr = 0.35 / (1 + t * 0.002)
    const g = new Array(J + 1).fill(0)
    for (const s of soal) {
      let z = w[J]
      for (let j = 0; j < J; j++) z += w[j] * s.x[j]
      const p = 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))))
      const err = p - s.y
      for (let j = 0; j < J; j++) g[j] += err * s.x[j]
      g[J] += err
    }
    for (let j = 0; j <= J; j++) w[j] -= (lr * g[j]) / soal.length
  }
  return w
}

// ---- replika setia dewanBukti (5 dimensi ARAH) pada jendela 200 lilin 1 jam ----
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const tanh = Math.tanh
function ema(arr, n) {
  const k = 2 / (n + 1)
  let e = arr.slice(0, n).reduce((a, b) => a + b, 0) / n
  const out = new Array(n - 1).fill(NaN).concat([e])
  for (let i = n; i < arr.length; i++) { e = arr[i] * k + e * (1 - k); out.push(e) }
  return out
}
function dims5(c) {           // c = jendela lilin ≤ T, panjang 200 (sama seperti denyut hidup)
  const closes = c.map((x) => x.c)
  const n = closes.length, la = n - 1
  const e20 = ema(closes, 20), e50 = ema(closes, 50)
  const hi20 = Math.max(...c.slice(-20).map((x) => x.h)), lo20 = Math.min(...c.slice(-20).map((x) => x.l))
  const p = hi20 > lo20 ? (closes[la] - lo20) / (hi20 - lo20) : 0.5
  const tbr = c.slice(-6).reduce((a, x) => a + (x.v > 0 ? x.tb / x.v : 0.5), 0) / 6
  const m7 = closes[la] / closes[la - 7] - 1, m30 = closes[la] / closes[la - 30] - 1
  const sl50 = (e50[la] - e50[la - 10]) / e50[la - 10]
  return [
    clamp(tanh(4 * (e20[la] - e50[la]) / e50[la]) * 0.6 + tanh(3 * (closes[la] - e20[la]) / e20[la]) * 0.4, -1, 1),
    clamp(tanh(22 * m7) * 0.7 + tanh(10 * m30) * 0.3, -1, 1),
    clamp((p - 0.5) * 2.5, -1, 1),
    clamp(tanh(8 * (tbr - 0.5)), -1, 1),
    clamp(tanh(160 * sl50), -1, 1),
  ]
}

async function ambil(url) {
  for (let coba = 1; coba <= 4; coba++) {
    try {
      const r = await fetch(url)
      if (r.status === 418 || r.status === 429) { await tidur(3000 * coba); continue }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.json()
    } catch (e) {
      if (coba === 4) throw e
      await tidur(2000 * coba)
    }
  }
}

// ---- 1. pengalaman: ledger vonis matang milik sendiri ----
const ledger = existsSync(join(ROOT, 'laporan/prakira-server.jsonl'))
  ? readFileSync(join(ROOT, 'laporan/prakira-server.jsonl'), 'utf8').split('\n').filter((l) => l.trim())
      .map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
  : []
const matang = ledger
  .filter((e) => (e.status === 'BENAR' || e.status === 'SALAH') && e.bukti && Number.isFinite(e.net) && (e.jalur || 'ARAH') === 'ARAH')
  .sort((a, b) => (a.waktuDinilai || a.waktuKunci || '').localeCompare(b.waktuDinilai || b.waktuKunci || ''))
  .map((e) => {
    const ret24 = (e.net + FEE) * (e.arah === 'BUY' ? 1 : -1)
    return { x: DIM.map((k) => e.bukti[k] ?? 0), ret24, y: ret24 > 0 ? 1 : 0 }
  })
log(`pengalaman tersedia: ${matang.length} vonis matang dari ledger sendiri`)
if (matang.length < 80) { console.error('pengalaman kurang dari 80 — empu menunggu'); process.exit(1) }

// ---- 2. kanvas soal: 40 koin likuid × 10 momen tetap = 400 soal buta ----
log('mengambil kanvas pasar (ticker 24 jam)...')
const tick = await ambil(`${H}/ticker/24hr`)
const dasar = new Set(tick.filter((t) => typeof t.symbol === 'string' && t.symbol.endsWith('USDT')).map((t) => t.symbol.slice(0, -4)))
const kandidat = tick
  .filter((t) => typeof t.symbol === 'string' && t.symbol.endsWith('USDT') && +t.lastPrice > 0)
  .filter((t) => { const b = t.symbol.slice(0, -4); if (STABIL.has(b)) return false; if (/(UP|DOWN|BULL|BEAR)$/.test(b) && dasar.has(b.replace(/(UP|DOWN|BULL|BEAR)$/, ''))) return false; return true })
  .sort((a, b) => +b.quoteVolume - +a.quoteVolume)
  .slice(0, 56)
  .map((t) => t.symbol)
const KOIN_MAKS = 40, TITIK = 10
const koinPakai = [], gagalKoin = []
for (const sym of kandidat) {
  if (koinPakai.length >= KOIN_MAKS) break
  try {
    const k = await ambil(`${H}/klines?symbol=${sym}&interval=1h&limit=1000`)
    if (!Array.isArray(k) || k.length < 950) { gagalKoin.push({ sym, alasan: `lilin ${Array.isArray(k) ? k.length : 0} < 950` }); continue }
    koinPakai.push({ sym, lilin: k.map((x) => ({ t: +x[0], c: +x[4], h: +x[2], l: +x[3], v: +x[5], tb: +x[9] })) })
    log(`koin ${koinPakai.length}/${KOIN_MAKS}: ${sym} (${k.length} lilin)`)
  } catch (e) { gagalKoin.push({ sym, alasan: String(e.message).slice(0, 60) }) }
  await tidur(JEDA_MS)
}
// momen T deterministik: indeks 250 + k·72 (jendela 200 lilin ≤ T, nilai ulang T+24h ≤ akhir data)
const TITIK_IDX = Array.from({ length: TITIK }, (_, k) => 250 + k * 72)

const soal = []
for (const { sym, lilin } of koinPakai) {
  for (const i of TITIK_IDX) {
    if (i - 199 < 0 || i + 24 >= lilin.length) continue
    const jendela = lilin.slice(i - 199, i + 1)
    const x = dims5(jendela)
    const entry = jendela[jendela.length - 1].c
    const exit = lilin[i + 24].c
    const ret24 = exit / entry - 1
    soal.push({ simbol: sym, idx: i, waktuT: new Date(lilin[i].t).toISOString(), x, entry, exit, ret24 })
  }
}
log(`soal buta terkumpul: ${soal.length}`)

// ---- 3. nilai semua kandidat bobot di soal yang SAMA ----
const nilai = (w5) => {
  let benar = 0, benarArah = 0
  for (const s of soal) {
    const skor = w5.reduce((a, k, j) => a + k * s.x[j], 0)
    const dir = skor > 0 ? 1 : -1
    if (dir * s.ret24 - FEE > 0) benar++
    if (dir * s.ret24 > 0) benarArah++
  }
  return { hitPct: +(benar / soal.length * 100).toFixed(1), hitArahPct: +(benarArah / soal.length * 100).toFixed(1), netPct: +(soal.reduce((a, s) => a + ((w5.reduce((b, k, j) => b + k * s.x[j], 0)) > 0 ? 1 : -1) * s.ret24 - FEE, 0) * 100).toFixed(2) }
}
const potongan = [40, 80, 120, 160, 200, matang.length]
const kurva = []
for (const k of potongan) {
  const w = empuFitLogistik(matang.slice(0, k))
  const w5 = w.slice(0, DIM.length)
  const rata = w5.reduce((a, v) => a + Math.abs(v), 0) / DIM.length
  const skala = rata > 0 ? 0.2 / rata : 1
  kurva.push({
    latihDari: k, bobot: w5.map((v) => +(v * skala).toFixed(4)),
    ...nilai(w5.map((v) => v * skala)),
  })
  log(`empu latih-${k}: hit ${kurva[kurva.length - 1].hitPct}% (arah ${kurva[kurva.length - 1].hitArahPct}%) · net ${kurva[kurva.length - 1].netPct}%`)
}
const lama = nilai(DIM.map((k) => GENOME_AWAL[k]))
log(`bobot-lama (genome): hit ${lama.hitPct}% (arah ${lama.hitArahPct}%) · net ${lama.netPct}%`)

// ---- 4. segel rapor ----
const empuPenuh = kurva[kurva.length - 1]
const vonis = empuPenuh.hitPct >= lama.hitPct
  ? 'EMPULULUS — bobot pengalaman mengalahkan bobot awal di soal buta yang sama'
  : 'EMPUGUGUR — jujur: pengalaman belum mengalahkan bobot awal di luar sampel'
const rapor = {
  protokol: 'UJI-AKURASI-400-V351',
  dihasilkan: new Date().toISOString(),
  mandat: 'pemilik: tempa lagi — makin bertambah hari akurasi makin tajam',
  sumber: 'klines 1h Binance publik (data-api.binance.vision) — sumber pangan yang sama dengan denyut hidup; nol kunci, nol sambungan luar lain',
  buta: 'di momen T hanya lilin ≤ T dibaca; vonis dinilai close T+24 jam − fee 0,2% — aturan penilaian sama dengan medan hidup',
  soal: { total: soal.length, koin: koinPakai.length, titikWaktuPerKoin: TITIK, koinDaftar: koinPakai.map((k) => k.sym), gagalKoin, momenIdx: TITIK_IDX },
  pengalaman: matang.length,
  hasil: { bobotLama: { bobot: GENOME_AWAL, ...lama }, kurvaBelajar: kurva },
  vonis,
  kurvaCocok: kurva.length >= 2 && kurva[kurva.length - 1].hitPct >= kurva[0].hitPct,
  ket: 'kurvaBelajar = fit dari k pengalaman pertama, dinilai di 400 soal buta yang sama — makin panjang latihan makin tajam itulah bukti akurasi menumpuk',
}
{
  const p = join(ROOT, 'laporan/uji-akurasi-400.json')
  writeFileSync(p, JSON.stringify(rapor, null, 2) + '\n')
  log(`segel: ${p}`)
}
console.log('\n=== VONIS UJI-400 ===')
console.log(`bobot-lama: hit ${lama.hitPct}% · arah ${lama.hitArahPct}% · net ${lama.netPct}%`)
console.log(`empu-penuh (latih ${matang.length}): hit ${empuPenuh.hitPct}% · arah ${empuPenuh.hitArahPct}% · net ${empuPenuh.netPct}%`)
for (const k of kurva) console.log(`  latih-${k.latihDari}: hit ${k.hitPct}% · net ${k.netPct}%`)
console.log(vonis)
