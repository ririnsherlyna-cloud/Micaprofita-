// ============================================================
// CERNA-TERABAIT — LAMBUNG & AKAL makhluk (V317)
// ------------------------------------------------------------
// Makhluk menerima HANYA aliran byte (pipe). Ia tidak diberi
// tahu genom, tidak diberi tahu ukuran dunia, tidak diberi tahu
// rumus. Yang ia punya: lambung berdagu (RAM terbatas, checkpoint
// resumable), dedup berbingkai, pustaka hipotesis format, dan
// akal pencocok rekursi. Tujuan: 1TB -> intisari <= 8KB yang
// mampu MEREDUPLIKASI dunia byte-exact.
// ------------------------------------------------------------
// Mode:
//   --telan [--deadline MS]  : buka mulut ke aliran dunia, cerna berdagu
//   --akal                   : temukan struktur -> intisari tersegel
//   --regenerasi [--penuh]   : reduplikasi dari intisari SAJA
//   --status                 : keadaan lambung
// Makhluk dilarang membaca ujian/terabait-genom.json — kejujuran
// ujian dijaga: semua pengetahuannya lahir dari aliran.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import {
  sha256, hash16, uraiHeader, materialkanPayload,
  UKURAN_TOKEN, UKURAN_HEADER, UKURAN_PAYLOAD,
} from './terabait-inti.mjs'

const AKAR = process.cwd()
const UJI = process.argv.includes('--skala-uji')
const akh = UJI ? '-uji' : ''
const berkasKeadaan = path.join(AKAR, 'otak', `terabait-cerna${akh}.json`)
const berkasIntisari = path.join(AKAR, 'otak', `terabait-intisari${akh}.json`)
const LANGKAH_SEGEL = 16384 // contoh digest tiap 16.384 token + token 0

function bacaKeadaan() {
  if (!fs.existsSync(berkasKeadaan)) return null
  return JSON.parse(fs.readFileSync(berkasKeadaan, 'utf8'))
}
function tulisKeadaan(s) {
  fs.mkdirSync(path.dirname(berkasKeadaan), { recursive: true })
  fs.writeFileSync(berkasKeadaan, JSON.stringify(s))
}
function keadaanBaru() {
  return {
    jenis: 'CERNA-TERABAIT-KEADAAN-1',
    status: 'berjalan',
    byteCount: 0,
    tokenCount: 0,
    rantaiByte: '',
    rantaiId: '',
    kunciKeId: {},
    tercerna: [], // {id,kunciB64,koin,openTime,digest16,hist32}
    idsB64: '',
    contoh: [],
    puncakHeapMB: 0,
    detikProses: 0,
    catatan: [],
  }
}

// ------------------------------------------------------------
// LAMBUNG — telan berdagu, RAM terbatas, resumable per token.
// ------------------------------------------------------------
async function telan() {
  const deadlineMs = (() => {
    const ix = process.argv.indexOf('--deadline')
    return ix > 0 ? Number(process.argv[ix + 1]) || 470000 : 470000
  })()
  let s = bacaKeadaan()
  if (s && s.status === 'lengkap') { console.log(JSON.stringify({ status: 'lengkap', tokenCount: s.tokenCount, byteCount: s.byteCount })); return }
  if (!s) s = keadaanBaru()
  s.status = 'berjalan'

  let ids = new Uint8Array(Math.max(131072, s.tokenCount + 131072)) // kapasitas + ruang tumbuh
  if (s.idsB64) { const b = Buffer.from(s.idsB64, 'base64'); ids.set(b) }
  let kapasitas = ids.length

  let rantaiByte = s.rantaiByte ? Buffer.from(s.rantaiByte, 'base64') : Buffer.alloc(32)
  let rantaiId = s.rantaiId ? Buffer.from(s.rantaiId, 'base64') : Buffer.alloc(32)
  const kunciKeId = { ...s.kunciKeId }
  const tercerna = s.tercerna.slice()

  const buf = Buffer.alloc(UKURAN_TOKEN)
  let posisi = 0
  let byteCount = s.byteCount
  let tokenCount = s.tokenCount
  const t0 = Date.now()
  let terakhirCatat = t0
  let puncak = s.puncakHeapMB

  const prosesToken = () => {
    const h = uraiHeader(buf)
    if (!h) {
      s.catatan.push(`bingkai rusak di token ${tokenCount}`)
      return false
    }
    let id = kunciKeId[h.kunciB64]
    if (id === undefined) {
      id = tercerna.length
      kunciKeId[h.kunciB64] = id
      const payload = buf.subarray(UKURAN_HEADER)
      const hist = Buffer.alloc(32)
      for (let i = 0; i < payload.length; i++) hist[payload[i] >> 3]++
      tercerna.push({
        id, kunciB64: h.kunciB64, koin: h.koin, openTime: h.openTime,
        digest16: hash16(payload), hist32: hist.toString('base64'),
      })
    }
    rantaiByte = sha256(rantaiByte, buf)          // rantai atas SEMUA byte
    rantaiId = sha256(rantaiId, Buffer.from([id])) // rantai atas urutan
    ids[tokenCount] = id
    if (tokenCount === 0 || tokenCount % LANGKAH_SEGEL === 0) {
      s.contoh.push({ idx: tokenCount, digest16: hash16(buf) })
    }
    tokenCount++
    byteCount += buf.length
    if (tokenCount >= kapasitas) { // lambung tumbuh: kapasitas digandakan
      kapasitas *= 2
      const baru = new Uint8Array(kapasitas)
      baru.set(ids)
      ids = baru
    }
    return true
  }

  const flush = (status) => {
    s.byteCount = byteCount
    s.tokenCount = tokenCount
    s.rantaiByte = rantaiByte.toString('base64')
    s.rantaiId = rantaiId.toString('base64')
    s.kunciKeId = kunciKeId
    s.tercerna = tercerna
    s.idsB64 = Buffer.from(ids.buffer, ids.byteOffset, tokenCount).toString('base64')
    s.puncakHeapMB = puncak
    if (status) s.status = status
    const kini = Date.now()
    s.detikProses = Number((s.detikProses + (kini - terakhirCatat) / 1000).toFixed(2))
    terakhirCatat = kini
    tulisKeadaan(s)
  }

  const anak = spawn(process.execPath, [
    path.join(AKAR, 'scripts', 'hidup', 'tambang-terabait.mjs'),
    '--alirkan', '--dari', String(tokenCount),
    ...(UJI ? ['--skala-uji'] : []),
  ], { stdio: ['ignore', 'pipe', 'inherit'] })

  let dipotongWaktu = false
  const pembatas = setTimeout(() => { dipotongWaktu = true; anak.kill('SIGKILL') }, deadlineMs)

  await new Promise((selesai) => {
    anak.stdout.on('data', (chunk) => {
      let sisa = chunk
      while (sisa.length > 0) {
        const butuh = UKURAN_TOKEN - posisi
        const ambil = Math.min(butuh, sisa.length)
        sisa.copy(buf, posisi, 0, ambil)
        posisi += ambil
        sisa = sisa.subarray(ambil)
        if (posisi === UKURAN_TOKEN) {
          if (!prosesToken()) { anak.kill('SIGKILL'); break }
          posisi = 0
          if (tokenCount % 1024 === 0) {
            const heapMB = process.memoryUsage().heapUsed / 1048576
            if (heapMB > puncak) puncak = Number(heapMB.toFixed(1))
            const dtk = (Date.now() - t0) / 1000
            const mbs = ((byteCount - s.byteCount) / 1048576 / Math.max(0.001, dtk)).toFixed(0)
            console.error(`cerna: token=${tokenCount} +${mbs}MiB/s heap=${heapMB.toFixed(0)}MB tercerna=${tercerna.length}`)
            flush(null)
          }
        }
      }
    })
    anak.stdout.on('end', () => selesai())
    anak.on('error', (e) => { s.catatan.push('anak error: ' + e.message); selesai() })
  })
  clearTimeout(pembatas)

  let status
  if (dipotongWaktu) status = 'berlanjut'
  else if (s.catatan.length && s.catatan[s.catatan.length - 1].startsWith('bingkai rusak')) status = 'terputus'
  else if (posisi === 0) status = 'lengkap' // aliran habis tanpa sisa = dunia selesai ditelan
  else status = 'terputus'

  flush(status)
  console.log(JSON.stringify({
    status, tokenCount, byteCount, tercerna: tercerna.length,
    detapTahap: Number(((Date.now() - t0) / 1000).toFixed(1)),
  }))
}

// ------------------------------------------------------------
// AKAL — pustaka hipotesis format + pencocok rekursi linier.
// ------------------------------------------------------------
function genXorshift128(kunciBuf, panjang) {
  let x = kunciBuf.readUInt32LE(0) || 1
  let y = kunciBuf.readUInt32LE(4) || 2
  let z = kunciBuf.readUInt32LE(8) || 3
  let w = kunciBuf.readUInt32LE(12) || 4
  const out = Buffer.alloc(panjang)
  for (let i = 0; i < panjang; i += 4) {
    const t = (x ^ (x << 11)) >>> 0
    x = y; y = z; z = w
    w = ((w ^ (w >>> 19) ^ t ^ (t >>> 8)) >>> 0)
    out.writeUInt32LE(w, i)
  }
  return out
}
function genLcg32(kunciBuf, panjang) {
  let st = kunciBuf.readUInt32LE(0) || 1
  const out = Buffer.alloc(panjang)
  for (let i = 0; i < panjang; i += 4) {
    st = (Math.imul(st, 1664525) + 1013904223) >>> 0
    out.writeUInt32LE(st, i)
  }
  return out
}
const PUSTAKA_FORMAT = [
  {
    nama: 'aes-ctr-amplop',
    materialkan: (kunciB64) => materialkanPayload(Buffer.from(kunciB64, 'base64')),
  },
  { nama: 'xorshift128-kunci', materialkan: (kb) => genXorshift128(Buffer.from(kb, 'base64'), UKURAN_PAYLOAD) },
  { nama: 'lcg32-kunci', materialkan: (kb) => genLcg32(Buffer.from(kb, 'base64'), UKURAN_PAYLOAD) },
]

// Cari (p,a,b,c, sigma) yang merekonstruksi urutan id persis.
// sigma: id kemunculan-pertama -> residu rekursi. Backtracking dengan
// pemangkasan: posisi i>=p harus memenuhi t[i]=(a t[i-1]+b t[i-p]+c) mod K.
function cobaSegelkan(ids, K, p, a, b, c, batas) {
  const n = Math.min(ids.length, batas)
  const segel = new Array(K).fill(-1)
  const t = new Array(n).fill(-1)
  const dipakai = new Array(K).fill(false)
  let lolos = false
  const coba = (i) => {
    if (lolos) return
    if (i >= n) { lolos = true; return }
    if (i < p) {
      const v0 = segel[ids[i]]
      if (v0 >= 0) { t[i] = v0; coba(i + 1); return }
      for (let v = 0; v < K && !lolos; v++) {
        if (dipakai[v]) continue
        dipakai[v] = true; segel[ids[i]] = v; t[i] = v
        coba(i + 1)
        if (!lolos) { dipakai[v] = false; segel[ids[i]] = -1; t[i] = -1 }
      }
      return
    }
    const pred = (a * t[i - 1] + b * t[i - p] + c) % K
    const v0 = segel[ids[i]]
    if (v0 >= 0) { if (v0 === pred) { t[i] = v0; coba(i + 1) } return }
    if (dipakai[pred]) return
    dipakai[pred] = true; segel[ids[i]] = pred; t[i] = pred
    coba(i + 1)
    if (!lolos) { dipakai[pred] = false; segel[ids[i]] = -1; t[i] = -1 }
  }
  coba(0)
  return lolos ? { segel, awal: t.slice(0, p) } : null
}

function verifikasiPenuh(ids, K, p, a, b, c, awal, segel) {
  const n = ids.length
  const t = new Uint8Array(n)
  for (let i = 0; i < p; i++) t[i] = awal[i]
  for (let i = p; i < n; i++) t[i] = (a * t[i - 1] + b * t[i - p] + c) % K
  for (let i = 0; i < n; i++) if (t[i] !== segel[ids[i]]) return false
  return t
}

function akal() {
  const s = bacaKeadaan()
  if (!s || s.status !== 'lengkap') {
    console.error('akal menolak: lambung belum lengkap (status ' + (s ? s.status : 'kosong') + ')')
    process.exit(1)
  }
  const ids = new Uint8Array(Buffer.from(s.idsB64, 'base64'))
  const K = s.tercerna.length
  const t0 = Date.now()

  // 1) PUSTAKA HIPOTESIS — uji format payload pada SEMUA segmen tercerna
  let format = null
  for (const kandidat of PUSTAKA_FORMAT) {
    let cocok = 0
    for (const e of s.tercerna) {
      try {
        if (hash16(kandidat.materialkan(e.kunciB64)) === e.digest16) cocok++
      } catch { /* kandidat gagal pada segmen ini */ }
    }
    if (cocok === s.tercerna.length) { format = kandidat; break }
  }
  if (!format) {
    console.error('akal GAGAL jujur: tak ada format di pustaka yang cocok — dunia tak terbaca, perlu inovasi')
    process.exit(2)
  }
  console.error(`akal: format payload ditemukan = ${format.nama} (${s.tercerna.length}/${s.tercerna.length} segmen)`)

  // 2) PENCOCOK REKURSI — temukan (p,a,b,c,sigma) persis
  let model = null
  luar: for (let p = 1; p <= 8; p++) {
    for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) for (let c = 0; c < K; c++) {
      const coba = cobaSegelkan(ids, K, p, a, b, c, 512)
      if (!coba) continue
      const t = verifikasiPenuh(ids, K, p, a, b, c, coba.awal, coba.segel)
      if (t) { model = { K, p, a, b, c, awal: coba.awal, segel: coba.segel, t }; break luar }
    }
  }
  if (!model) {
    console.error('akal GAGAL jujur: tak ada rekursi linier mod-K (p<=8) yang persis — struktur tak ditemukan')
    process.exit(3)
  }
  console.error(`akal: rekursi ditemukan K=${model.K} p=${model.p} a=${model.a} b=${model.b} c=${model.c} — persis atas ${ids.length} token`)

  // 3) INTISARI — beberapa KB, tersegel
  const kamus = s.tercerna
    .slice()
    .sort((x, y) => model.segel[x.id] - model.segel[y.id])
    .map((e) => ({
      residu: model.segel[e.id],
      kunciB64: e.kunciB64,
      koin: e.koin,
      openTime: e.openTime,
      digest16: e.digest16,
      hist32: e.hist32,
    }))
  const intisari = {
    jenis: 'INTISARI-TERABAIT-1',
    dibuat: new Date().toISOString(),
    dunia: {
      totalByte: s.byteCount,
      totalToken: s.tokenCount,
      ukuranToken: UKURAN_TOKEN,
      ukuranHeader: UKURAN_HEADER,
    },
    format: format.nama,
    resep: { K: model.K, p: model.p, a: model.a, b: model.b, c: model.c, awal: model.awal },
    pemetaan: model.segel.slice(),
    kamus,
    rantaiByte: s.rantaiByte,
    rantaiId: s.rantaiId,
    contoh: s.contoh,
    kinerja: {
      detikCerna: s.detikProses,
      puncakHeapMB: s.puncakHeapMB,
      detikAkal: Number(((Date.now() - t0) / 1000).toFixed(2)),
    },
  }
  const badan = JSON.stringify(intisari)
  const ukuran = Buffer.byteLength(badan)
  const segel = hash16(Buffer.from(badan))
  const final = JSON.stringify({ ...intisari, segel })
  const ukuranFinal = Buffer.byteLength(final)
  fs.mkdirSync(path.dirname(berkasIntisari), { recursive: true })
  fs.writeFileSync(berkasIntisari, final)
  console.log(JSON.stringify({
    status: 'intisari-terbit',
    format: format.nama,
    K, resep: intisari.resep,
    byteIntisari: ukuranFinal,
    rasio: Math.round(s.byteCount / ukuranFinal),
    segel,
    lulusBatas: ukuranFinal <= 8192,
  }))
}

// ------------------------------------------------------------
// REGENERASI — reduplikasi dari intisari SAJA (tanpa aliran,
// tanpa genom, tanpa lambung). --penuh = rantai byte 1TB penuh.
// ------------------------------------------------------------
async function regenerasi() {
  const penuh = process.argv.includes('--penuh')
  if (!fs.existsSync(berkasIntisari)) { console.error('intisari belum ada'); process.exit(1) }
  const isi = JSON.parse(fs.readFileSync(berkasIntisari, 'utf8'))
  const { dunia, resep, pemetaan, kamus, rantaiByte, rantaiId, contoh } = isi
  const t0 = Date.now()
  const inti = await import('./terabait-inti.mjs')
  const t = inti.hitungUrutan(resep, 0, dunia.totalToken)

  // invers pemetaan: residu -> id kemunculan pertama
  const inv = new Array(resep.K).fill(-1)
  for (let id = 0; id < pemetaan.length; id++) inv[pemetaan[id]] = id

  // 1) kamus: materialkan tiap segmen dari kunci — digest harus cocok
  const payloadCache = new Map()
  const payloadDari = (residu) => {
    if (!payloadCache.has(residu)) {
      const k = kamus.find((x) => x.residu === residu)
      payloadCache.set(residu, materialkanPayload(Buffer.from(k.kunciB64, 'base64'), dunia.ukuranToken - dunia.ukuranHeader))
    }
    return payloadCache.get(residu)
  }
  let segmenOK = 0
  for (const k of kamus) {
    if (hash16(payloadDari(k.residu)) === k.digest16) segmenOK++
  }

  // 2+3) rantai id + (penuh) rantai byte + contoh — bercheckpoint bila penuh
  const berkasCek = path.join(AKAR, 'otak', `terabait-regen${akh}.json`)
  let cek = { idx: 0, hByteB64: Buffer.alloc(32).toString('base64'), contohOK: 0, detikProses: 0 }
  if (penuh && fs.existsSync(berkasCek)) cek = JSON.parse(fs.readFileSync(berkasCek, 'utf8'))
  let hByte = Buffer.from(cek.hByteB64, 'base64')
  let hId = Buffer.alloc(32) // fold id murah: dihitung penuh tiap kali
  for (let i = 0; i < cek.idx; i++) hId = sha256(hId, Buffer.from([inv[t[i]]]))
  const counts = new Array(resep.K).fill(0)
  { // counts s.d. cek.idx (untuk seq bingkai contoh)
    for (let i = 0; i < cek.idx; i++) counts[t[i]]++
  }
  const contohPeta = new Map(contoh.map((c) => [c.idx, c]))
  let contohOK = cek.contohOK
  const deadlineMs = (() => {
    const ix = process.argv.indexOf('--deadline')
    return ix > 0 ? Number(process.argv[ix + 1]) || 470000 : 470000
  })()
  const simpanCek = (idx, status) => {
    fs.writeFileSync(berkasCek, JSON.stringify({
      idx, hByteB64: hByte.toString('base64'), contohOK,
      detikProses: Number((cek.detikProses + (Date.now() - t0) / 1000).toFixed(2)),
      status,
    }))
  }
  let i = cek.idx
  let terpotong = false
  for (; i < dunia.totalToken; i++) {
    if (penuh && (Date.now() - t0) > deadlineMs) { terpotong = true; break }
    const residu = t[i]
    if (contohPeta.has(i) || penuh) {
      const k = kamus.find((x) => x.residu === residu)
      const header = inti.bangunHeader({
        idx: i, koin: k.koin, openTime: k.openTime, seq: counts[residu], kunciB64: k.kunciB64,
      })
      const token = Buffer.concat([header, payloadDari(residu)])
      if (contohPeta.has(i) && hash16(token) === contohPeta.get(i).digest16) contohOK++
      if (penuh) hByte = sha256(hByte, token)
    }
    hId = sha256(hId, Buffer.from([inv[residu]]))
    counts[residu]++
    if (penuh && i % 32768 === 32767) simpanCek(i + 1, 'berlanjut')
  }
  if (penuh) {
    if (terpotong) {
      simpanCek(i, 'berlanjut')
      console.log(JSON.stringify({ status: 'regenerasi-berlanjut', idx: i, total: dunia.totalToken, persen: Number((100 * i / dunia.totalToken).toFixed(2)) }))
      return
    }
    fs.rmSync(berkasCek, { force: true })
  }
  const rantaiIdOK = hId.toString('base64') === rantaiId
  const penuhOK = penuh ? hByte.toString('base64') === rantaiByte : null
  const hasil = {
    status: 'regenerasi-selesai',
    mode: penuh ? 'penuh' : 'cuplik',
    segmenOK, segmenTotal: kamus.length,
    rantaiIdOK,
    contohOK, contohTotal: contoh.length,
    penuhOK,
    byteIntisari: Buffer.byteLength(fs.readFileSync(berkasIntisari)),
    rasio: Math.round(dunia.totalByte / Buffer.byteLength(fs.readFileSync(berkasIntisari))),
    detik: Number(((Date.now() - t0) / 1000).toFixed(2)),
    lulus: segmenOK === kamus.length && rantaiIdOK && contohOK === contoh.length && (penuh ? penuhOK : true),
  }
  console.log(JSON.stringify(hasil))
  if (!hasil.lulus) process.exit(4)
}

// ------------------------------------------------------------
const mode = process.argv.includes('--telan') ? 'telan'
  : process.argv.includes('--akal') ? 'akal'
  : process.argv.includes('--regenerasi') ? 'regenerasi'
  : process.argv.includes('--status') ? 'status' : 'bantu'

if (mode === 'telan') telan().catch((e) => { console.error('telan gagal:', e.message); process.exit(1) })
else if (mode === 'akal') { try { akal() } catch (e) { console.error('akal gagal:', e.message); process.exit(1) } }
else if (mode === 'regenerasi') regenerasi().catch((e) => { console.error('regenerasi gagal:', e.message); process.exit(1) })
else if (mode === 'status') {
  const s = bacaKeadaan()
  console.log(s ? JSON.stringify({ status: s.status, tokenCount: s.tokenCount, byteCount: s.byteCount, tercerna: s.tercerna.length, puncakHeapMB: s.puncakHeapMB, detikProses: s.detikProses }) : 'lambung kosong')
} else {
  console.log('cerna-terabait — pakai: --telan [--deadline MS] | --akal | --regenerasi [--penuh] | --status  [--skala-uji]')
}
