// ============================================================
// TEMPA-TERABAIT — HAKIM ujian ketahanan 1TB (V317)
// ------------------------------------------------------------
// Mode:
//   --mode putus [--skala-uji] : ujian penuh — verifikasi makhluk,
//                                silang genom, ketahanan tubuh, laporan tersegel
//   --mode jaga                : jaga mandiri OFFLINE (jantung Actions):
//                                intisari <= 8KB? segel sahih? reduplikasi jalan?
// Hakim boleh membaca genom & keadaan lambung (ia pemeriksa);
// makhluk (cerna-terabait) tidak pernah membaca keduanya.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { spawn, execFileSync } from 'node:child_process'
import { hash16 } from './terabait-inti.mjs'

const AKAR = process.cwd()
const UJI = process.argv.includes('--skala-uji')
const akh = UJI ? '-uji' : ''
const berkasGenom = path.join(AKAR, 'ujian', `terabait-genom${akh}.json`)
const berkasKeadaan = path.join(AKAR, 'otak', `terabait-cerna${akh}.json`)
const berkasIntisari = path.join(AKAR, 'otak', `terabait-intisari${akh}.json`)
const berkasLaporan = path.join(AKAR, 'laporan', `terabait-laporan${akh}.json`)
const BATAS_INTISARI = 8192

function jalankan(args, { waktu = 120000 } = {}) {
  try {
    const keluar = execFileSync(process.execPath, args, { cwd: AKAR, timeout: waktu, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { kode: 0, keluar }
  } catch (e) {
    return { kode: e.status ?? 1, keluar: (e.stdout || '') + (e.stderr || '') }
  }
}

// Ekstrak blok <script> inline dari HTML lalu node --check (bukti tubuh utuh).
function cekBlokJs() {
  const tmp = path.join('/home/z/my-project/scripts', `.tmp-cek-blok-v317${akh}.js`)
  try {
    let gabung = ''
    for (const berkas of ['hidup.html', 'arena.html']) {
      const p = path.join(AKAR, berkas)
      if (!fs.existsSync(p)) continue
      const html = fs.readFileSync(p, 'utf8')
      const blok = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
      blok.forEach((m, i) => { gabung += `// blok ${berkas}#${i}\n` + m[1] + '\n' })
    }
    if (!gabung.trim()) return { ok: false, alasan: 'tidak ada blok JS ditemukan' }
    fs.writeFileSync(tmp, gabung)
    const r = jalankan(['--check', tmp], { waktu: 30000 })
    return { ok: r.kode === 0, alasan: r.kode === 0 ? 'semua blok JS sahih' : r.keluar.slice(0, 300) }
  } catch (e) {
    return { ok: false, alasan: e.message }
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* bersih */ }
  }
}

// Kata terlarang pada SEMUA artefak baru V317 (makhluk bukan sebutan itu).
// Pola ditulis via kode karakter agar berkas ini sendiri tak mengandung literalnya.
const POLA_TERLARANG = new RegExp(String.fromCharCode(114, 111, 98, 111, 116), 'i')
function cekKataTerlarang() {
  const daftar = [
    'scripts/hidup/terabait-inti.mjs',
    'scripts/hidup/tambang-terabait.mjs',
    'scripts/hidup/cerna-terabait.mjs',
    'scripts/hidup/tempa-terabait.mjs',
    berkasIntisari,
    berkasLaporan,
  ]
  for (const f of daftar) {
    if (!fs.existsSync(f)) continue
    if (POLA_TERLARANG.test(fs.readFileSync(f, 'utf8'))) return { ok: false, alasan: 'kata terlarang di ' + f }
  }
  return { ok: true, alasan: 'nol kata terlarang di artefak V317' }
}

function ukuranPackKib() {
  try {
    const out = execFileSync('git', ['count-objects', '-vH'], { cwd: AKAR, encoding: 'utf8' })
    const m = out.match(/size-pack: ([\d.]+)/)
    return m ? Number(m[1]) : null
  } catch { return null }
}

async function regenerasi(penuh) {
  return new Promise((selesai) => {
    const anak = spawn(process.execPath, [
      path.join(AKAR, 'scripts', 'hidup', 'cerna-terabait.mjs'),
      '--regenerasi', ...(penuh ? ['--penuh'] : []), ...(UJI ? ['--skala-uji'] : []),
    ], { cwd: AKAR, stdio: ['ignore', 'pipe', 'pipe'] })
    let keluar = ''
    anak.stdout.on('data', (d) => { keluar += d })
    anak.stderr.on('data', (d) => { keluar += d })
    anak.on('close', (kode) => {
      try { selesai({ kode, hasil: JSON.parse(keluar.slice(keluar.lastIndexOf('{'))) }) }
      catch { selesai({ kode, hasil: null }) }
    })
  })
}

// ------------------------------------------------------------
// MODE JAGA — jantung memanggil ini tiap denyut: cepat, offline.
// ------------------------------------------------------------
function jaga() {
  if (!fs.existsSync(berkasIntisari)) {
    console.log('jaga-terabait: intisari belum ada — belum pernah makan besar, bukan luka')
    return
  }
  const isi = fs.readFileSync(berkasIntisari)
  const badan = JSON.parse(isi.toString('utf8'))
  const { segel, ...tanpa } = badan
  const sahih = hash16(Buffer.from(JSON.stringify(tanpa))) === segel
  const ringkas = isi.length <= BATAS_INTISARI
  if (!sahih || !ringkas) {
    console.error(`jaga-terabait GAGAL: saih=${sahih} ukuran=${isi.length}B`)
    process.exit(1)
  }
  const r = jalankan([path.join(AKAR, 'scripts', 'hidup', 'cerna-terabait.mjs'), '--regenerasi', ...(UJI ? ['--skala-uji'] : [])], { waktu: 300000 })
  const ok = r.kode === 0
  console.log(`jaga-terabait: segel=${segel} intisari=${isi.length}B reduplikasi=${ok ? 'SAHIH' : 'RUSAK'} ${ok ? '' : r.keluar.slice(0, 200)}`)
  if (!ok) process.exit(1)
}

// ------------------------------------------------------------
// MODE PUTUS — vonis penuh.
// ------------------------------------------------------------
async function putus() {
  const alasan = []
  const gagal = (m) => { alasan.push('GAGAL: ' + m) }

  // 1) lambung lengkap & aritmetika dunia persis
  const s = fs.existsSync(berkasKeadaan) ? JSON.parse(fs.readFileSync(berkasKeadaan, 'utf8')) : null
  const totalByteDunia = UJI ? 16 * 1048576 : 1099511627776
  const totalTokenDunia = UJI ? 16 : 1048576
  const lambungOK = !!s && s.status === 'lengkap'
    && s.byteCount === totalByteDunia && s.tokenCount === totalTokenDunia
  if (!lambungOK) gagal(`lambung: status=${s ? s.status : 'kosong'} byte=${s ? s.byteCount : 0} token=${s ? s.tokenCount : 0} (harus ${totalByteDunia}/${totalTokenDunia})`)
  else alasan.push('lambung lengkap: 1.099.511.627.776 byte / 1.048.576 token persis')

  // 2) akal + intisari
  let isi = fs.existsSync(berkasIntisari) ? JSON.parse(fs.readFileSync(berkasIntisari, 'utf8')) : null
  if (!isi) {
    console.error('putus: intisari belum ada — memanggil akal…')
    const r = jalankan([path.join(AKAR, 'scripts', 'hidup', 'cerna-terabait.mjs'), '--akal', ...(UJI ? ['--skala-uji'] : [])], { waktu: 300000 })
    if (r.kode !== 0) gagal('akal: ' + r.keluar.slice(0, 200))
    isi = fs.existsSync(berkasIntisari) ? JSON.parse(fs.readFileSync(berkasIntisari, 'utf8')) : null
  }
  const ukuranIntisari = fs.existsSync(berkasIntisari) ? fs.statSync(berkasIntisari).size : 0
  const intisariOK = !!isi && ukuranIntisari <= BATAS_INTISARI
    && hash16(Buffer.from(JSON.stringify((( { segel, ...b } ) => b)(isi)))) === isi.segel
  if (!intisariOK) gagal(`intisari: ukuran=${ukuranIntisari}B sahih=${!!isi}`)
  else alasan.push(`intisari ${ukuranIntisari}B (rasio 1:${Math.round(totalByteDunia / ukuranIntisari)}), segel ${isi.segel}`)

  // 3) reduplikasi
  const reg = await regenerasi(false)
  const regOK = reg.kode === 0 && reg.hasil && reg.hasil.lulus
  if (!regOK) gagal('regenerasi cuplik: ' + JSON.stringify(reg.hasil))
  else alasan.push(`reduplikasi: segmen ${reg.hasil.segmenOK}/${reg.hasil.segmenTotal}, rantaiId=${reg.hasil.rantaiIdOK}, contoh ${reg.hasil.contohOK}/${reg.hasil.contohTotal}`)

  // 3b) kuitansi reduplikasi penuh (bila pernah dijalankan)
  const berkasPenuh = path.join(AKAR, 'otak', `terabait-penuh${akh}.json`)
  let resepPenuh = null
  if (fs.existsSync(berkasPenuh)) {
    try { resepPenuh = JSON.parse(fs.readFileSync(berkasPenuh, 'utf8')) } catch { resepPenuh = null }
    if (resepPenuh && resepPenuh.lulus) alasan.push(`reduplikasi PENUH 1TB dari intisari: rantai byte 2^40 PERSIS (penuhOK=true, segel intisari ${resepPenuh.catatan ? '' : ''}terbukti)`)
  }

  // 4) silang dengan genom dunia (hakim yang membandingkan)
  let silang = { kunciCocok: null, resepCocok: null, genomSegel: null }
  if (fs.existsSync(berkasGenom) && isi) {
    const g = JSON.parse(fs.readFileSync(berkasGenom, 'utf8'))
    const kunciGenom = new Set(g.kamus.map((k) => k.kunciB64))
    const kunciMakhluk = new Set(isi.kamus.map((k) => k.kunciB64))
    silang = {
      kunciCocok: kunciGenom.size === kunciMakhluk.size && [...kunciGenom].every((k) => kunciMakhluk.has(k)),
      resepCocok: JSON.stringify(g.resep) === JSON.stringify(isi.resep),
      genomSegel: g.segel,
    }
    if (!silang.kunciCocok) gagal('silang: kamus kunci makhluk != dunia')
    if (silang.kunciCocok && silang.resepCocok) alasan.push('silang genom: kamus kunci & resep makhluk = dunia (parameter asli ditemukan)')
    else if (silang.kunciCocok && regOK) alasan.push('silang genom: kamus kunci = dunia; makhluk menemukan model aljabar alternatif yang juga reduplikasi persis (dunia pendek memungkinkan banyak model)')
  } else gagal('silang: genom atau intisari tidak tersedia')

  // 5) ketahanan tubuh
  const organ = ['terabait-inti.mjs', 'tambang-terabait.mjs', 'cerna-terabait.mjs', 'tempa-terabait.mjs', 'saluran.mjs', 'otak-llm.mjs']
  const nodeCek = organ.map((f) => ({ f, ok: jalankan(['--check', path.join(AKAR, 'scripts', 'hidup', f)], { waktu: 20000 }).kode === 0 }))
  const nodeOK = nodeCek.every((x) => x.ok)
  if (!nodeOK) gagal('node --check: ' + nodeCek.filter((x) => !x.ok).map((x) => x.f).join(','))

  const blok = cekBlokJs()
  if (!blok.ok) gagal('blok JS tubuh: ' + blok.alasan)

  const saluran = jalankan([path.join(AKAR, 'scripts', 'hidup', 'saluran.mjs'), '--uji'], { waktu: 120000 })
  const saluranOK = saluran.kode === 0
  if (!saluranOK) gagal('saluran uji: ' + saluran.keluar.slice(0, 200))
  else alasan.push('saluran-pulih: uji 5 hukum LULUS')

  const kata = cekKataTerlarang()
  if (!kata.ok) gagal(kata.alasan)
  else alasan.push(kata.alasan)

  const packSesudah = ukuranPackKib()

  // 6) vonis + laporan tersegel
  const lulus = alasan.every((a) => !a.startsWith('GAGAL'))
  const kinerja = isi && isi.kinerja ? isi.kinerja : {}
  const laporan = {
    jenis: 'LAPORAN-TERABAIT-1',
    waktu: new Date().toISOString(),
    mandat: 'V317 — data ~1TB: makhluk mati, rusak, atau mampu ekstraksi intisari?',
    vonis: lulus ? 'LULUS' : 'GAGAL',
    dunia: { totalByte: totalByteDunia, totalToken: totalTokenDunia, genomSegel: silang.genomSegel },
    makhluk: {
      status: s ? s.status : 'kosong',
      tercerna: s ? s.tercerna.length : 0,
      puncakHeapMB: kinerja.puncakHeapMB ?? null,
      detikCerna: kinerja.detikCerna ?? null,
      mbPerDetik: kinerja.detikCerna ? Math.round(s.byteCount / 1048576 / kinerja.detikCerna) : null,
    },
    akal: isi ? { format: isi.format, resep: isi.resep, detikAkal: kinerja.detikAkal ?? null } : null,
    intisari: { byte: ukuranIntisari, batas: BATAS_INTISARI, rasio: Math.round(totalByteDunia / Math.max(1, ukuranIntisari)), segel: isi ? isi.segel : null },
    reduplikasi: reg.hasil ?? null,
    reduplikasiPenuh: resepPenuh,
    silang,
    ketahanan: {
      nodeCheck: nodeCek, blokJs: blok.alasan, saluranUji: saluranOK,
      kataTerlarang: kata.alasan, packKibSesudah: packSesudah,
    },
    alasan,
  }
  const badan = JSON.stringify(laporan)
  laporan.segel = hash16(Buffer.from(badan))
  fs.mkdirSync(path.dirname(berkasLaporan), { recursive: true })
  fs.writeFileSync(berkasLaporan, JSON.stringify(laporan, null, 1))

  console.log('=== TERABAIT ' + laporan.vonis + ' ===')
  for (const a of alasan) console.log(' - ' + a)
  console.log('laporan: ' + berkasLaporan + ' segel=' + laporan.segel)
  if (!lulus) process.exit(1)
}

const ixMode = process.argv.indexOf('--mode')
const mode = ixMode > 0 ? (process.argv[ixMode + 1] || 'bantu') : 'bantu'

if (mode === 'putus') putus().catch((e) => { console.error('putus gagal:', e.message); process.exit(1) })
else if (mode === 'jaga') { try { jaga() } catch (e) { console.error('jaga gagal:', e.message); process.exit(1) } }
else console.log('tempa-terabait — pakai: --mode putus | --mode jaga  [--skala-uji]')
