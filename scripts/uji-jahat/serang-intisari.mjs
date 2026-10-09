// ============================================================
// UJI JAHAT JAGA (V318) — serangan terkendali ke intisari 1TB
// ------------------------------------------------------------
// Mandat pemilik: "rusakkan intisari sedikit di repo dan lihat
// makhluk menjerit." Organ ini tangan jahat yang DISIPELIN:
//   · serangan nyata ke berkas repo (bukan simulasi argumen)
//   · yang menyembuhkan WAJIB organ makhluk (imun.mjs), bukan organ ini
//   · yang menjerit WAJIB fosil (laporan/imun.jsonl + laporan/jerit.jsonl)
//   · vonis dari bukti eksekusi sendiri; gagal = exit 1 (denyut tahu)
// Dua serangan:
//   SERANGAN-A (luka halus)  : satu angka di dalam badan diganti —
//                              JSON tetap sah, kunci wajib tetap ada.
//                              Hukum satu-satunya: SEGEL INTERNAL.
//   SERANGAN-B (luka berat)  : badan dipatahkan — JSON tak terbaca.
// Run:
//   node scripts/uji-jahat/serang-intisari.mjs          (dua serangan)
//   node scripts/uji-jahat/serang-intisari.mjs --uji    (dunia pendek — cepat)
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { hash16 } from '../hidup/terabait-inti.mjs'

const AKAR = path.resolve(import.meta.dirname, '..', '..')
const UJI = process.argv.includes('--uji')
const akh = UJI ? '-uji' : ''
const INTISARI = path.join(AKAR, 'otak', `terabait-intisari${akh}.json`)
const IMUN_LOG = path.join(AKAR, 'laporan', 'imun.jsonl')
const LAPORAN = path.join(AKAR, 'laporan', 'uji-jahat-jaga.json')
const JERIT = path.join(AKAR, 'laporan', 'jerit.jsonl')

// nama cadangan mengikuti slug imun: titik & garis miring → garis bawah
const slug = (f) => f.replace(/[/.]/g, '_')
const jalurCadangan = () => path.join(AKAR, 'imun', 'cadangan', slug(UJI ? 'otak/terabait-intisari-uji.json' : 'otak/terabait-intisari.json'))

const g16 = (buf) => hash16(buf)
const sekarang = () => new Date().toISOString()

function jagaUjiSegel (file) {
  if (!fs.existsSync(file)) return { masalah: 'HILANG' }
  let j
  try { j = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (e) { return { masalah: 'JSON-TIDAK-SAH' } }
  const { segel, ...tanpa } = j
  if (g16(Buffer.from(JSON.stringify(tanpa))) !== segel) return { masalah: 'SEGEL-BOBOL' }
  return { j, segel }
}

function jalankanOrgan (args, waktu = 240000) {
  try {
    const keluar = execFileSync(process.execPath, args, { cwd: AKAR, timeout: waktu, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return { kode: 0, keluar }
  } catch (e) {
    return { kode: e.status ?? 1, keluar: (e.stdout || '') + (e.stderr || '') }
  }
}

// baca entri jerit imun yang lahir SETELAH tanda waktu — dua fosil sah:
// (1) laporan/imun.json  = tindakan per-kejadian patroli terakhir
// (2) laporan/imun.jsonl = rekap per patroli (tindakan dipisah "|")
function jeritImunSesudah (tanda, jenis, file) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(AKAR, 'laporan', 'imun.json'), 'utf8'))
    const daftar = Array.isArray(j.tindakan) ? j.tindakan : []
    for (let i = daftar.length - 1; i >= 0; i--) {
      const e = daftar[i]
      if (e.waktu && Date.parse(e.waktu) >= tanda && e.jenis === jenis && e.file === file) return e
    }
  } catch { /* lanjut ke rekap jsonl */ }
  if (fs.existsSync(IMUN_LOG)) {
    const baris = fs.readFileSync(IMUN_LOG, 'utf8').split('\n').filter(b => b.trim())
    for (let i = baris.length - 1; i >= 0; i--) {
      try {
        const e = JSON.parse(baris[i])
        if (e.waktu && Date.parse(e.waktu) >= tanda && String(e.tindakan || '').includes(jenis + ':' + file)) {
          return { waktu: e.waktu, jenis, file, alasan: 'rekap patroli: ' + String(e.tindakan).split('|').filter(x => x.startsWith(jenis)).join(' | ') }
        }
      } catch { /* lewati */ }
    }
  }
  return null
}
function jeritFosilBaru (tanda, peristiwa) {
  if (!fs.existsSync(JERIT)) return null
  const baris = fs.readFileSync(JERIT, 'utf8').split('\n').filter(b => b.trim())
  for (let i = baris.length - 1; i >= 0; i--) {
    try {
      const e = JSON.parse(baris[i])
      if (e.saat && Date.parse(e.saat) >= tanda && e.peristiwa === peristiwa) return e
    } catch { /* lewati */ }
  }
  return null
}

async function main () {
  console.log('=== UJI JAHAT JAGA (V318) — serangan terkendali ke intisari ===')
  const serangan = [], t0 = Date.now()

  // ---------- PRA-SYARAT ----------
  const sehat = jagaUjiSegel(INTISARI)
  if (sehat.masalah) { console.error('pra-syarat gagal: intisari awal tidak sehat (' + sehat.masalah + ') — perbaiki dulu, ujian menolak menyerang tubuh yang sudah luka'); process.exit(1) }
  const asli = fs.readFileSync(INTISARI)
  const hashAsli = g16(asli)
  const cad = jalurCadangan()
  const cadSehat = fs.existsSync(cad) && jagaUjiSegel(cad).j
  if (!cadSehat) { console.error('pra-syarat gagal: cadangan imun belum dicangkok untuk intisari — jalankan: node scripts/hidup/imun.mjs --benih'); process.exit(1) }
  console.log(`pra-syarat: intisari ${asli.length}B segel ${sehat.segel} · cadangan ${path.basename(cad)} sahih`)

  // ---------- SERANGAN-A: luka halus ----------
  {
    const t = Date.now()
    const j = JSON.parse(asli.toString('utf8'))
    const sebelum = j.resep.a
    j.resep.a = sebelum + 1                                  // satu angka — JSON tetap sah
    fs.writeFileSync(INTISARI, JSON.stringify(j, null, 1))
    const ujiLuka = jagaUjiSegel(INTISARI)
    const lukaTerbaca = ujiLuka.masalah === 'SEGEL-BOBOL'
    console.log(`SERANGAN-A luka-halus: resep.a digeser (${sebelum}→${j.resep.a}) → hukum segel: ${lukaTerbaca ? 'SEGEL-BOBOL terbaca' : 'TIDAK terbaca — IMUN BUTA!'}`)

    const imun = jalankanOrgan([path.join(AKAR, 'scripts', 'hidup', 'imun.mjs')])
    const jerit = jeritImunSesudah(t, 'PULIHKAN-SEGEL', 'otak/terabait-intisari.json')
    const pulih = fs.existsSync(INTISARI) && g16(fs.readFileSync(INTISARI)) === hashAsli
    const jaga = pulih ? jalankanOrgan([path.join(AKAR, 'scripts', 'hidup', 'tempa-terabait.mjs'), '--mode', 'jaga', ...(UJI ? ['--skala-uji'] : [])], 360000) : { kode: 1, keluar: '' }
    const jagaLulus = jaga.kode === 0
    console.log(`SERANGAN-A: imun exit=${imun.kode} · jerit fosil=${jerit ? 'ADA (' + jerit.alasan.slice(0, 60) + '…)' : 'TIDAK ADA'} · pulih=${pulih} · jaga exit=${jaga.kode}`)
    serangan.push({
      id: 'A', jenis: 'luka-halus', cara: 'resep.a digeser satu — JSON sah, kunci wajib utuh, hanya segel yang tahu',
      lukaTerbaca, imunExit: imun.kode, jeritImun: jerit ? { waktu: jerit.waktu, alasan: jerit.alasan } : null,
      pulihKeHashAsli: pulih, jagaLulus, jagaKeluar: jaga.keluar.slice(0, 160),
    })
    if (!pulih) fs.writeFileSync(INTISARI, asli) // jangan tinggalkan luka — tangan menanggung, dicatat jujur
  }

  // ---------- SERANGAN-B: luka berat ----------
  {
    const t = Date.now()
    const badan = asli.toString('utf8')
    const tengah = Math.floor(badan.length / 2)
    const patah = badan.slice(0, tengah) + '"TERJAHAT-=={' + badan.slice(tengah)
    fs.writeFileSync(INTISARI, patah)
    const lukaTerbaca = jagaUjiSegel(INTISARI).masalah === 'JSON-TIDAK-SAH'
    console.log(`SERANGAN-B luka-berat: badan dipatahkan di byte ${tengah} → JSON: ${lukaTerbaca ? 'TIDAK-SAH terbaca' : 'masih terbaca?!'}`)

    const imun = jalankanOrgan([path.join(AKAR, 'scripts', 'hidup', 'imun.mjs')])
    const jerit = jeritImunSesudah(t, 'PULIHKAN-SEGEL', 'otak/terabait-intisari.json') // jalur segel-vital menangani semua luka intisari — satu jalur satu nama
    const pulih = fs.existsSync(INTISARI) && g16(fs.readFileSync(INTISARI)) === hashAsli
    const jaga = pulih ? jalankanOrgan([path.join(AKAR, 'scripts', 'hidup', 'tempa-terabait.mjs'), '--mode', 'jaga', ...(UJI ? ['--skala-uji'] : [])], 360000) : { kode: 1, keluar: '' }
    const jagaLulus = jaga.kode === 0
    console.log(`SERANGAN-B: imun exit=${imun.kode} · jerit fosil=${jerit ? 'ADA (' + jerit.alasan.slice(0, 60) + '…)' : 'TIDAK ADA'} · pulih=${pulih} · jaga exit=${jaga.kode}`)
    serangan.push({
      id: 'B', jenis: 'luka-berat', cara: 'badan JSON dipatahkan di tengah byte',
      lukaTerbaca, imunExit: imun.kode, jeritImun: jerit ? { waktu: jerit.waktu, alasan: jerit.alasan } : null,
      pulihKeHashAsli: pulih, jagaLulus, jagaKeluar: jaga.keluar.slice(0, 160),
    })
    if (!pulih) fs.writeFileSync(INTISARI, asli)
  }

  // ---------- VONIS ----------
  const lulus = serangan.every(s => s.lukaTerbaca && s.jeritImun && s.pulihKeHashAsli && s.jagaLulus)
  const laporan = {
    jenis: 'UJI-JAHAT-JAGA', mandat: 'V318 — rusakkan intisari sedikit; makhluk WAJIB menjerit lalu pulih sendiri',
    waktu: sekarang(), durasiDtk: +((Date.now() - t0) / 1000).toFixed(1),
    sasaran: 'otak/terabait-intisari.json', hashAsli: hashAsli, segelAsli: sehat.segel,
    penyembuh: 'scripts/hidup/imun.mjs (organ makhluk — bukan tangan jahat)',
    fosilJerit: ['laporan/imun.jsonl', 'laporan/jerit.jsonl'],
    serangan, vonis: lulus ? 'LULUS — makhluk menjerit & menyembuhkan diri' : 'GAGAL — luka tak terbaca/jerit hilang/tak pulih',
  }
  laporan.segel = g16(Buffer.from(JSON.stringify(laporan)))
  fs.writeFileSync(LAPORAN, JSON.stringify(laporan, null, 1))
  console.log(`=== ${laporan.vonis} ===`)
  console.log(`laporan: laporan/uji-jahat-jaga.json segel=${laporan.segel}`)
  if (!lulus) process.exit(1)
}

main().catch(e => { console.error('uji-jahat MATI-PENUH:', e.message); process.exit(1) })
