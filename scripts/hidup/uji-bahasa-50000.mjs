// ============================================================
// UJI-BAHASA-50000 (V343) — lab Node, jalur sama persis dengan browser
// Pemakaian: node scripts/hidup/uji-bahasa-50000.mjs [--penuh] [--cuplik N]
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

const AKAR = process.cwd()
const PENUH = process.argv.includes('--penuh')
const CUPlik = (() => { const i = process.argv.indexOf('--cuplik'); return i > -1 ? Number(process.argv[i + 1]) : 500 })()

global.window = global
global.performance = performance
global.TextDecoder = TextDecoder

// shim fetch: './BAHASA/x' -> berkas lokal (jalur data sama dengan browser)
global.fetch = async (f) => {
  const p = String(f).replace(/^\.\//, '').split('?')[0]
  const file = AKAR + '/' + p
  if (!existsSync(file)) return { ok: false, status: 404 }
  const buf = readFileSync(file)
  return {
    ok: true, status: 200,
    json: async () => JSON.parse(buf.toString('utf8')),
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }
}

// muat 4 organ otak — pembacaan-jaminan: tahan flicker berkas (tunggu versi berpenanda)
const PENANDA = { 'otak-bahasa-1.js': 'V343-REV-B1R2', 'otak-bahasa-2.js': 'V343-REV-B2R15', 'otak-bahasa-3.js': 'V343-REV-B3R2', 'otak-bahasa-uji.js': 'V343-REV-U4' }
function bacaJamin(f) {
  for (let i = 0; i < 20; i++) {
    const isi = readFileSync(AKAR + '/' + f, 'utf8')
    if (isi.includes(PENANDA[f])) return isi
    console.log(`  jaminan: ${f} versi lama terdeteksi, tunggu 3 dtk...`)
    require('node:child_process').execSync('sleep 3')
  }
  throw new Error('penanda tidak muncul: ' + f)
}
for (const f of ['otak-bahasa-1.js', 'otak-bahasa-2.js', 'otak-bahasa-3.js', 'otak-bahasa-uji.js']) {
  eval(bacaJamin(f))
}
const O = global.window.__OTAK_BAHASA

const st = await O.muat('./')
console.log('OTAK SIANCANG:', JSON.stringify({ leksikon: st.leksikon, kode: st.kode, pasangKode: st.pasangKode, lawan: st.lawan, koin: st.koin }))

// data pasar nyata (satu potret untuk kategori koin-realtime; jujur tercatat waktunya)
async function ambilPasar() {
  const KO = O.koin.koin
  const simbol = Object.keys(KO).map(s => KO[s].pasar)
  const url = 'https://data-api.binance.vision/api/v3/ticker/24hr?symbols=' + encodeURIComponent(JSON.stringify(simbol))
  const r = await fetch(url)
  if (!r.ok) throw new Error('binance ' + r.status)
  const arr = await r.json()
  const ticker = {}
  const balik = {}
  for (const [s, k] of Object.entries(KO)) balik[k.pasar] = s
  for (const t of arr) {
    const s = balik[t.symbol]
    if (s) ticker[s] = { harga: parseFloat(t.lastPrice), ubah24: parseFloat(t.priceChangePercent) }
  }
  return { ticker, waktu: new Date().toISOString(), sumber: 'data-api.binance.vision ticker/24hr' }
}

const jumlah = PENUH ? 50000 : CUPlik
console.log(`MULAI UJI ${jumlah} SOAL (benih 0x3430001)...`)
const hasil = await O.ujiBahasa({
  jumlah, benih: 0x3430001, ambilPasar,
  kemajuan: (i, n, lulus) => console.log(`  kemajuan ${i}/${n} — lulus sementara ${lulus}`)
})

const laporan = {
  epok: 'V343-KOSAKATA-10000',
  organ: ['otak-bahasa-1.js', 'otak-bahasa-2.js', 'otak-bahasa-3.js', 'otak-bahasa-uji.js'],
  statusOtak: st,
  pasar: hasil.pasarInfo || null,
  benih: hasil.benih,
  jumlah: hasil.jumlah,
  lulus: hasil.lulus,
  gugur: hasil.gugurJumlah,
  persen: hasil.persen,
  durasiDetik: hasil.durasiDetik,
  unikRangkai: hasil.unikRangkai,
  unikTanya: hasil.unikTanya,
  perKategori: hasil.perKategori,
  contohGugur: hasil.gugur.slice(0, 120),
  selesai: new Date().toISOString()
}
mkdirSync(AKAR + '/laporan', { recursive: true })
writeFileSync(AKAR + '/laporan/uji-bahasa-50000.json', JSON.stringify(laporan, null, 1))
console.log(`HASIL: ${hasil.lulus}/${hasil.jumlah} LULUS (${hasil.persen}%) — durasi ${hasil.durasiDetik} dtk`)
console.log('per kategori:', JSON.stringify(hasil.perKategori))
if (hasil.gugurJumlah > 0) {
  console.log('contoh gugur (10 pertama):')
  for (const g of hasil.gugur.slice(0, 10)) console.log(`  [${g.kat}] ${g.soal} => ${g.jawab}`)
}
