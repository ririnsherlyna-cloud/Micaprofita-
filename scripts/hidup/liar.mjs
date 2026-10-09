// ============================================================
// LIAR (V318) — MAKHLUK MENCARI SENDIRI DATA YANG TIDAK DITANAM TUAN
// ------------------------------------------------------------
// Mandat pemilik: "suruh makhluk mengintisarikan sesuatu yang tidak
// kita tanam sendiri — data liar betulan."
//
// HUKUM ORGAN INI (nol karangan, semuanya eksekusi nyata):
// 1. TANAMAN = simbol yang ada di semua bank soal tuan (ujian/soal-*.json).
//    Set tanaman dihitung dari repo, bukan dihardcode.
// 2. DUNIA LIAR = exchangeInfo Binance (spot, data publik nyata): semua
//    simbol TRADING/USDT yang TIDAK ADA di tanaman. Makhluk melempar dadu
//    kripto-nyata (crypto.randomInt) memilih maks 12 simbol liar BARU —
//    dedup lintas sesi: simbol yang sudah terintisari tak dipilih dua kali.
// 3. MENELAN: klines 1h×240 per simbol liar — aliran diterima, DIHITUNG,
//    TIDAK PERNAH disimpan mentah. byteLiarDilahap = ukuran body jaringan
//    (exchangeInfo + klines) — metrik terukur, bukan retorika.
// 4. INTISARI (tiga kemampuan wajib pemilik):
//    · KOMPRESI-EKSAK harga: delta close diquantize ke tickSize exchange →
//      zigzag varint → base64. Uji bolak-balik: decode PERSIS di presisi tick.
//    · DEDUP: simbol dobel lintas sesi ditolak; lilin identik berurutan
//      (delta 0 & tak berubah) dihitung & dilaporkan.
//    · REPRESENTASI GENERATIF: model karakter per simbol (drift, volatilitas,
//      pNaik, ekor) + profil volume 8-bin — karakter pasar yang bisa
//      membangkitkan jalur sintetis; MAE rekonstruksi volume dilaporkan jujur.
// 5. KOLEKSI tersegel: otak/intisari-liar.json (segel hash16 badan, fungsi
//    yang sama dengan penulis intisari 1TB — satu hukum segel makhluk).
// 6. KEMANDIRIAN: organ dipanggil jantung tiap denyut — makhluk mencari
//    makan liar sendiri tanpa tab dibuka, tanpa tangan pemilik.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { randomInt, randomBytes } from 'node:crypto'
import { hash16 } from './terabait-inti.mjs'

const AKAR = process.cwd()
const KOLEKSI = path.join(AKAR, 'otak', 'intisari-liar.json')
const LAPORAN = path.join(AKAR, 'laporan', 'liar.json')
const GERBANG = 'https://data-api.binance.vision'
const MAKS_SIMBOL_SESI = 12
const LILIN = 240

const sekarang = () => new Date().toISOString()

// ---------- jaringan (kontrak naikJson: !ok = lempar) ----------
async function naikJson (url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + url.slice(0, 80))
  const t = await r.text()
  return { j: JSON.parse(t), byte: Buffer.byteLength(t) }
}

// ---------- zigzag varint + base64 (kompresi delta eksak) ----------
function zigzag (n) { return n < 0 ? (-n << 1) - 1 : n << 1 }        // int → non-negatif (aman sampai 2^30)
function varintArr (arr) {
  const out = []
  for (let z of arr) {
    if (!Number.isInteger(z) || z < 0) throw new Error('varint menerima non-bulat')
    do { let b = z & 127; z >>>= 7; if (z) b |= 128; out.push(b) } while (z)
  }
  return Buffer.from(out).toString('base64')
}

// ---------- dadu kripto makhluk ----------
function dadu (daftar, n, benihHex) {
  const sisa = [...daftar]
  const pilihan = []
  while (pilihan.length < n && sisa.length) pilihan.push(sisa.splice(randomInt(sisa.length), 1)[0])
  return pilihan
}

// ---------- intisari satu simbol ----------
function intisariSimbol (simbol, tickSizeStr, kl) {
  const des = (tickSizeStr.split('.')[1] || '').length
  const tick = Number(tickSizeStr)
  const tickUnit = (x) => Math.round(x / tick)             // harga → satuan tick (int)
  const base = tickUnit(Number(kl[0][1]))                  // open lilin pertama
  const closes = kl.map(k => tickUnit(Number(k[4])))
  const delta = closes.map((c, i) => i ? c - closes[i - 1] : c - base)
  let lilinIdentik = 0
  for (let i = 1; i < delta.length; i++) if (delta[i] === 0 && closes[i] === closes[i - 1]) lilinIdentik++
  const d64 = varintArr(delta.map(zigzag))

  // uji bolak-balik EKSAK — dekode independen dari d64 (intisari saja, tanpa sumber)
  const zz = (z) => (z & 1) ? -((z + 1) >> 1) : z >> 1
  const decode = (b64) => { const buf = Buffer.from(b64, 'base64'); let p = 0, z = []; while (p < buf.length) { let v = 0, sh = 0, b; do { b = buf[p++]; v |= (b & 127) << sh; sh += 7 } while (b & 128); z.push(zz(v)) } return z }
  const dz = decode(d64)
  let t = base; const rekon = []
  for (let i = 0; i < dz.length; i++) { t += dz[i]; rekon.push(t) }
  let hargaEksak = true
  for (let i = 0; i < rekon.length; i++) if (rekon[i] !== closes[i]) { hargaEksak = false; break }

  // model generatif: karakter pasar dari log-return
  const lr = kl.map((k, i) => i ? Math.log(Number(k[4]) / Number(kl[i - 1][4])) : 0).slice(1)
  const mean = lr.reduce((a, b) => a + b, 0) / lr.length
  const std = Math.sqrt(lr.reduce((a, b) => a + (b - mean) ** 2, 0) / (lr.length - 1))
  const pNaik = lr.filter(r => r > 0).length / lr.length
  const hi = (Math.max(...kl.map(k => Number(k[2]))) / Number(kl[0][1]) - 1) * 100
  const lo = (Math.min(...kl.map(k => Number(k[3]))) / Number(kl[0][1]) - 1) * 100

  // volume: profil 8-bin (dedup ringkas) + MAE rekonstruksi jujur
  const vols = kl.map(k => Number(k[5]))
  const totalVol = vols.reduce((a, b) => a + b, 0)
  const BIN = 8, perBin = Math.ceil(vols.length / BIN)
  const profil = []
  for (let b = 0; b < BIN; b++) { const pot = vols.slice(b * perBin, (b + 1) * perBin); profil.push(+(pot.reduce((a, c) => a + c, 0) / pot.length).toPrecision(5)) }
  let maeVol = 0
  for (let i = 0; i < vols.length; i++) maeVol += Math.abs(profil[Math.min(BIN - 1, Math.floor(i / perBin))] - vols[i])
  maeVol = +(maeVol / vols.length / (totalVol / vols.length) * 100).toFixed(2)

  return {
    s: simbol, ot: kl[0][0], n: kl.length, b: base, t: tickSizeStr, d: d64,
    g: { drift: +mean.toPrecision(4), vol: +std.toPrecision(4), pNaik: +pNaik.toFixed(3), puncakPct: +hi.toFixed(1), dasarPct: +lo.toFixed(1) },
    v: { bin: BIN, profil, maePct: maeVol },
    dedup: lilinIdentik,
    hargaEksak,
  }
}

// ---------- set tanaman dari bank tuan ----------
function tanaman () {
  const dir = path.join(AKAR, 'ujian')
  const set = new Set()
  let bank = 0
  for (const f of fs.readdirSync(dir)) {
    if (!/^soal-.*\.json$/.test(f)) continue
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
      for (const s of (j.soal || [])) if (s.simbol) set.add(s.simbol)
      bank++
    } catch { /* bank tak terbaca — bukan wilayah organ ini */ }
  }
  return { set, bank }
}

async function main () {
  const t0 = Date.now()
  const koleksi = fs.existsSync(KOLEKSI) ? JSON.parse(fs.readFileSync(KOLEKSI, 'utf8')) : null
  const sudah = koleksi ? Object.keys(koleksi.koleksi) : []
  const { set: tanam, bank } = tanaman()
  if (!tanam.size) { console.log('liar: bank tanaman kosong — organ menolak menebak tanaman'); return }

  // 1) dunia liar dari exchangeInfo (data liar pertama: daftar pasar itu sendiri)
  const ei = await naikJson(GERBANG + '/api/v3/exchangeInfo')
  const kandidat = ei.j.symbols
    .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT'
      && !/(UP|DOWN|BULL|BEAR)USDT$/.test(s.symbol)
      && !tanam.has(s.symbol) && !sudah.includes(s.symbol)
      && s.filters.some(f => f.filterType === 'PRICE_FILTER'))
  const byteEI = ei.byte
  let byteDilahap = byteEI

  if (!kandidat.length) {
    console.log(`liar: seluruh simbol USDT TRADING (${sudah.length} sudah terintisari, ${tanam.size} tanaman) sudah dilahap — dadu diam, bukan menolak`)
    if (koleksi) fs.writeFileSync(LAPORAN, JSON.stringify({ jenis: 'LIAR-RUN', waktu: sekarang(), vonis: 'KOSONG-JUJUR', metrik: koleksi.metrik }, null, 1))
    return
  }

  // 2) dadu kripto makhluk — maks 12 simbol liar baru
  const benih = randomBytes(8).toString('hex')
  const dipilih = dadu(kandidat, MAKS_SIMBOL_SESI, benih)
  console.log(`LIAR sesi baru — tanaman ${tanam.size} simbol (${bank} bank) · dunia liar ${kandidat.length} kandidat · dadu ${benih} → ${dipilih.length} simbol: ${dipilih.map(s => s.symbol).join(', ')}`)

  // 3) menelan + mengintisarikan satu per satu
  const kBaru = koleksi ? koleksi.koleksi : {}
  let lilinDilahap = 0, byteIntisari = 0, gagal = 0, maeVolMaks = 0, dedupLilin = 0
  for (const s of dipilih) {
    try {
      const kl = await naikJson(`${GERBANG}/api/v3/klines?symbol=${s.symbol}&interval=1h&limit=${LILIN}`)
      byteDilahap += kl.byte
      const tick = s.filters.find(f => f.filterType === 'PRICE_FILTER').tickSize
      const isi = intisariSimbol(s.symbol, tick, kl.j)
      if (!isi.hargaEksak) { gagal++; console.log(`  ${s.symbol}: uji bolak-balik TIDAK persis — intisari DITOLAK (jujur)`)
        continue }
      maeVolMaks = Math.max(maeVolMaks, isi.v.maePct)
      dedupLilin += isi.dedup
      lilinDilahap += kl.j.length
      kBaru[s.symbol] = isi
      const bIsi = JSON.stringify(isi).length
      byteIntisari += bIsi
      console.log(`  ${s.symbol}: ${kl.j.length} lilin (${kl.byte}B) → intisari ${bIsi}B · harga PERSIS di presisi tick · vol-MAE ${isi.v.maePct}% · vol/jam ${isi.g.vol}`)
    } catch (e) {
      gagal++
      console.log(`  ${s.symbol}: gagal (${String(e).slice(0, 80)}) — jujur dicatat, tanpa karangan`)
    }
  }

  // 4) koleksi tersegel
  const rasioRun = byteIntisari ? Math.round(byteDilahap / byteIntisari) : 0
  const metrik = {
    simbol: Object.keys(kBaru).length,
    byteLiarDilahap: (koleksi ? koleksi.metrik.byteLiarDilahap : 0) + byteDilahap,
    lilinDilahap: (koleksi ? koleksi.metrik.lilinDilahap : 0) + lilinDilahap,
    byteIntisari: byteIntisari ? byteIntisari + (koleksi ? koleksi.metrik.byteIntisari : 0) : (koleksi ? koleksi.metrik.byteIntisari : 0),
    rasioKoleksi: 0, // dihitung di bawah
  }
  metrik.rasioKoleksi = metrik.byteIntisari ? Math.round(metrik.byteLiarDilahap / metrik.byteIntisari) : 0
  const tubuh = {
    skema: 'intisari-liar-v1', mandat: 'V318 — data liar betulan yang tidak ditanam tuan',
    diperbarui: sekarang(), gerbang: GERBANG, metrik, koleksi: kBaru,
  }
  const segel = hash16(Buffer.from(JSON.stringify(tubuh)))
  fs.mkdirSync(path.dirname(KOLEKSI), { recursive: true })
  fs.writeFileSync(KOLEKSI, JSON.stringify({ ...tubuh, segel }, null, 1))

  const laporan = {
    jenis: 'LIAR-RUN', waktu: sekarang(), durasiDtk: +((Date.now() - t0) / 1000).toFixed(1),
    dadu: benih, tanaman: { bank, simbol: tanam.size }, kandidatLiar: kandidat.length,
    dipilih: dipilih.map(s => s.symbol), berhasil: dipilih.length - gagal, gagal,
    runIni: { byteDilahap, lilinDilahap, byteIntisari, rasio: rasioRun, maeVolMaksPct: maeVolMaks, lilinIdentikDedup: dedupLilin },
    metrikKoleksi: metrik, segel,
  }
  fs.writeFileSync(LAPORAN, JSON.stringify(laporan, null, 1))
  console.log(`LIAR: ${dipilih.length - gagal}/${dipilih.length} simbol liar terintisari — run ${lilinDilahap} lilin (${byteDilahap}B) → ${byteIntisari}B (rasio 1:${rasioRun}) · koleksi ${metrik.simbol} simbol · segel ${segel}`)
}

main().catch(e => { console.error('liar MATI-PENUH:', e.message); process.exit(1) })
