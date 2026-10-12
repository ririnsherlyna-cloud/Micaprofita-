// ============================================================
// SEMBANG-V344 — asap cepat (smoke test) giliran santai, jalur Node
// Pemakaian: node scripts/hidup/sembang-v344.mjs
// ============================================================
import { readFileSync, existsSync } from 'node:fs'
const AKAR = process.cwd()
global.window = global
global.performance = { now: () => Date.now() }
global.TextDecoder = TextDecoder
global.fetch = async (f) => {
  const p = String(f).replace(/^\.\//, '').split('?')[0]
  const file = AKAR + '/' + p
  if (!existsSync(file)) return { ok: false, status: 404 }
  const buf = readFileSync(file)
  return { ok: true, status: 200, json: async () => JSON.parse(buf.toString('utf8')), arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) }
}
for (const f of ['otak-bahasa-1.js', 'otak-bahasa-2.js', 'otak-bahasa-3.js']) {
  // eval sederhana: marker V344 wajib
  const isi = readFileSync(AKAR + '/' + f, 'utf8')
  if (!isi.includes('V344')) throw new Error(f + ' belum V344');
  (0, eval)(isi);
}
const O = global.window.__OTAK_BAHASA
const st = await O.muat('./')
console.log('SIAP:', JSON.stringify({ leksikon: st.leksikon, kode: st.kode.jumlah, pasang: st.pasangKode, koin: st.koin }))
O.diriLahirAt = Date.parse(JSON.parse(readFileSync('versi.json', 'utf8')).memoriWaktu)

const pasar = { ticker: {}, waktu: new Date().toISOString(), lilin: {} }
for (const [s, k] of Object.entries(O.koin.koin)) pasar.ticker[s] = { harga: 100 + s.length, ubah24: s.length % 2 ? 1.5 : -2.25 }

const obrolan = [
  ['halo'],
  ['namaku Ririn'],
  ['siapa namaku?'],
  ['apa kabar?'],
  ['berapa umurmu?'],
  ['kapan kamu lahir?'],
  ['apa itu burung?'],
  ['dia bisa terbang?'],
  ['kenapa burung bisa terbang?'],
  ['apa itu ikan?'],
  ['kenapa ikan tidak bisa terbang?'],
  ['dia tinggal di mana?'],
  ['berapa harga btc sekarang?'],
  ['dan eth?'],
  ['dan yang tadi?'],
  ['tampilkan grafik sol'],
  ['iya betul'],
  ['kamu pintar'],
  ['kamu salah'],
  ['maaf ya'],
  ['apakah kamu bosan?'],
  ['kamu bisa apa?'],
  ['kamu bisa terbang?'],
  ['perkenalkan dirimu'],
  ['tolong bantu aku'],
  ['terima kasih'],
  ['what is a bird?'],
  ['can it swim?'],
  ['why can birds fly?'],
  ['how old are you?'],
  ['how are you?'],
  ['you are smart'],
  ['sorry'],
  ['yes right'],
  ['what can you do?'],
  ['2 tambah 3 kali 4'],
  ['hari ini hari apa?'],
  ['apa itu batu?'],
  ['apakah batu bisa tidur?'],
  ['kenapa batu tidak bisa terbang?']
]
let giliran = 0
for (const [q] of obrolan) {
  giliran++
  let r
  try { r = O.jawab(q, { mode: 'auto', pasar }) } catch (e) { console.log('SALAH-PROGRAM ' + q + ' :: ' + e.stack.split('\n').slice(0, 3).join(' | ')); continue }
  console.log('[' + giliran + '] ' + q + '\n    → (' + r.intent + '/' + r.bahasa + (r.grafik ? '/GRAFIK' : '') + ') ' + r.teks.slice(0, 190) + (r.periksa && r.periksa.sah ? '' : '  [PERIKSA GUGUR→diperbaiki:' + r.diperbaiki + ']'))
}
