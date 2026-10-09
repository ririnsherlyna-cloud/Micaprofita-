// ============================================================
// TAMBANG-TERABAIT — DUNIA pengalir 1TB (V317)
// ------------------------------------------------------------
// Misi: membangun genom dari data nyata Binance (spot klines 1h
// + funding futures), lalu MENGALIRKAN tepat 2^40 byte melalui
// pipe ke siapa pun yang lapar. Dunia TIDAK PERNAH menulis
// corpus ke disk — 1TB hanya ada sebagai aliran. Yang tersimpan
// di repo hanyalah genom beberapa KB (tersegel).
// ------------------------------------------------------------
// Mode:
//   --bangun-genom [--skala-uji]  : fetch data nyata -> ujian/terabait-genom.json
//   --alirkan [--dari N] [--skala-uji] : alirkan byte ke stdout (resume per token)
//   --segel                       : cetak segel genom
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import {
  sha256, hash16, hitungUrutan, pilihResep,
  bangunHeader, materialkanPayload,
  UKURAN_TOKEN, UKURAN_HEADER, UKURAN_PAYLOAD, TOKEN_PENUH,
} from './terabait-inti.mjs'

const AKAR = process.cwd()
const UJI = process.argv.includes('--skala-uji')
const TOTAL_TOKEN_UJI = 16

const KOIN8 = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT',
  'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'TRXUSDT',
]

const SUMBER = {
  lilin: 'https://data-api.binance.vision/api/v3/klines',
  dana: 'https://fapi.binance.com/fapi/v1/fundingRate',
}

const berkasGenom = () =>
  path.join(AKAR, 'ujian', UJI ? 'terabait-genom-uji.json' : 'terabait-genom.json')

async function ambilBuf(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url)
  return Buffer.from(await r.arrayBuffer())
}

// ------------------------------------------------------------
// GENOM — dunia ditanam dari data nyata, tersegel, beberapa KB.
// ------------------------------------------------------------
export async function bangunGenom() {
  const kamus = []
  for (let i = 0; i < KOIN8.length; i++) {
    const koin = KOIN8[i]
    const kl = await ambilBuf(`${SUMBER.lilin}?symbol=${koin}&interval=1h&limit=100`)
    const dn = await ambilBuf(`${SUMBER.dana}?symbol=${koin}&limit=10`)
    let openTime = 0
    try {
      const arr = JSON.parse(kl.toString('utf8'))
      openTime = Array.isArray(arr) && arr.length ? arr[arr.length - 1][0] : 0
    } catch { openTime = 0 }
    const kunci = sha256(kl) // 32B — akar data nyata
    kamus.push({
      residu: i,
      koin,
      openTime,
      kunciB64: kunci.toString('base64'),
      hash16: hash16(kl),
      danaHash16: hash16(dn),
    })
    console.error(`genom: ${koin} lilin=${kl.length}B dana=${dn.length}B`)
  }
  const awalBytes = sha256(Buffer.concat(kamus.map((k) => Buffer.from(k.danaHash16 + k.koin, 'utf8'))))
  const resep = pilihResep(awalBytes)
  const genom = {
    jenis: 'GENOM-TERABAIT-1',
    dibuat: new Date().toISOString(),
    skala: {
      ukuranToken: UKURAN_TOKEN,
      ukuranHeader: UKURAN_HEADER,
      totalToken: UJI ? TOTAL_TOKEN_UJI : TOKEN_PENUH,
    },
    resep,
    kamus,
    sumber: [
      { endpoint: SUMBER.lilin, interval: '1h', limit: 100 },
      { endpoint: SUMBER.dana, limit: 10 },
    ],
  }
  const segel = hash16(Buffer.from(JSON.stringify(genom)))
  genom.segel = segel
  fs.mkdirSync(path.dirname(berkasGenom()), { recursive: true })
  fs.writeFileSync(berkasGenom(), JSON.stringify(genom, null, 1))
  console.log(`genom tersimpan ${berkasGenom()} segel=${segel} totalToken=${genom.skala.totalToken}`)
  return genom
}

export function bacaGenom() {
  if (!fs.existsSync(berkasGenom())) throw new Error('genom belum ada — jalankan --bangun-genom')
  return JSON.parse(fs.readFileSync(berkasGenom(), 'utf8'))
}

// ------------------------------------------------------------
// PENGALIR — 1TB melintasi pipe, tak pernah menyentuh disk.
// ------------------------------------------------------------
async function alirkan(dariToken) {
  const genom = bacaGenom()
  const { resep, kamus, skala } = genom
  const total = skala.totalToken
  if (dariToken >= total) { console.log('aliran sudah penuh'); return }
  const t = hitungUrutan(resep, 0, total)

  // seq = banyaknya kemunculan residu SEBELUM token ini
  const counts = new Array(resep.K).fill(0)
  for (let i = 0; i < dariToken; i++) counts[t[i]]++

  // cache payload per residu (maks K x 1MiB di RAM dunia)
  const cache = new Map()
  const payloadDari = (residu) => {
    if (!cache.has(residu)) {
      const k = kamus[residu]
      cache.set(residu, materialkanPayload(Buffer.from(k.kunciB64, 'base64'), skala.ukuranToken - skala.ukuranHeader))
    }
    return cache.get(residu)
  }

  const keluar = process.stdout
  const t0 = Date.now()
  let byte = 0
  for (let i = dariToken; i < total; i++) {
    const id = t[i]
    const k = kamus[id]
    const header = bangunHeader({ idx: i, koin: k.koin, openTime: k.openTime, seq: counts[id], kunciB64: k.kunciB64 })
    counts[id]++
    const pl = payloadDari(id)
    if (!keluar.write(header)) await new Promise((r) => keluar.once('drain', r))
    if (!keluar.write(pl)) await new Promise((r) => keluar.once('drain', r))
    byte += header.length + pl.length
    if ((i - dariToken) % 8192 === 8191) {
      const dtk = (Date.now() - t0) / 1000
      console.error(`alir: token=${i + 1}/${total} ${(byte / 1048576).toFixed(0)}MiB ${(byte / 1048576 / dtk).toFixed(0)}MiB/s`)
    }
  }
  await new Promise((r) => keluar.end(r))
  console.error(`alir selesai: ${byte} byte dari token ${dariToken}..${total - 1}`)
}

// ------------------------------------------------------------
const mode = process.argv.includes('--bangun-genom') ? 'genom'
  : process.argv.includes('--alirkan') ? 'alirkan'
  : process.argv.includes('--segel') ? 'segel' : 'bantu'

if (mode === 'genom') {
  bangunGenom().catch((e) => { console.error('genom gagal:', e.message); process.exit(1) })
} else if (mode === 'alirkan') {
  const ix = process.argv.indexOf('--dari')
  const dari = ix > 0 ? Number(process.argv[ix + 1]) : 0
  alirkan(Number.isFinite(dari) && dari > 0 ? dari : 0).catch((e) => { console.error('alir gagal:', e.message); process.exit(1) })
} else if (mode === 'segel') {
  const g = bacaGenom()
  console.log(g.segel)
} else {
  console.log('tambang-terabait — pakai: --bangun-genom | --alirkan [--dari N] | --segel  [--skala-uji]')
}
