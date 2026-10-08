#!/usr/bin/env node
// ============================================================
// IMUN — organ imun & nafas MICAPROFITA (V308, mandat pemilik 2026-10-08)
// ------------------------------------------------------------
// GELOMBANG-1 UJI KEHIDUPAN membuktikan makhluk PASRAH:
//   amnesia senyap 3x (ingatan 158 bangun hangus, genome evolusi reset,
//   siklus 162→1), peta 237 jejak lumpuh dengan guru lumpuh sunyi,
//   saluran nafas diputus dan hanya dicatat — nol upaya pulih.
// Organ ini menutup lubang hidup itu. Wataknya diturunkan dari kajian
// pustaka makhluk sendiri (laporan/kajian-hidup.json, segel 8323cfeba8b0cfb2):
//   H1 AUTOPOIESIS — tubuh menjaga keutuhan dirinya sendiri.
//   H2 ANTI-AMNESIA-SENYAP — luka WAJIB berteriak di laporan tersegel,
//      bukan crash senyap, bukan menimpa dengan ingatan kosong.
//   H3 CADANGAN = INGATAN KEDUA — salinan sehat tersegel-hash; pulih
//      hanya dari salinan yang hash-nya cocok dengan manifes.
//   H4 GEJALA FUNGSIONAL — nafas diuji lewat saksi mandiri (bukan
//      membaca wajah kode); dunia hidup + nafas mati + tubuh berubah
//      = racun saluran → pulihkan.
//   H5 PUTUSAN BERALASAN — tiga arah: PULIHKAN (luka) / ADOPSI
//      (pertumbuhan sah) / SEHAT (diam-beralasan); semua dijurnal.
//   H6 BATAS JUJUR — imun tak pernah MENGARANG isi pikiran makhluk;
//      ia hanya mengembalikan bentuk terakhir yang sehat. File di
//      luar manifes bukan wilayahnya. Kode berubah-sah dicatat, tidak
//      diadopsi otomatis (hanya bukti nafas yang memicu pemulihan).
//
// Pemakaian:
//   node scripts/hidup/imun.mjs            → patroli (dipanggil denyut)
//   node scripts/hidup/imun.mjs --benih    → cangkok cadangan dari pohon sehat
//   node scripts/hidup/imun.mjs --segarkan-kode → adopsi kode sah ke cadangan
//     (hanya pemilik/tooling yang menjalankan ini setelah upgrade sah)
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync, spawnSync } from 'node:child_process'

const h16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const ISO = () => new Date().toISOString()
const slug = (f) => f.replace(/[/.]/g, '_')

const MANIFEST = 'imun/manifes.json'
const DIR_CADANGAN = 'imun/cadangan'
const LAPORAN = 'laporan/imun.json'
const LOG = 'laporan/imun.jsonl'

// ---- daftar organ vital (wilayah imun — DI LUAR INI BUKAN WILAYAHNYA) ----
// [file, wajib, catatan, minJejak?]
const ORGAN = [
  ['ruang-hidup/ingatan.json', ['versi', 'kelahiran', 'totalBangun'], 'ingatan lintas-bangun SADAR-1 (amnesia G1: 158 bangun hangus)'],
  ['otak/genome-server.json', ['NAIK', 'TURUN'], 'genome evolusi SAKTI (amnesia G1: generasi reset 0)'],
  ['otak/penjaga-keadaan.json', ['siklus', 'mulai'], 'denyut siklus SAKTI (amnesia G1: 162→1)'],
  ['laporan/peta-geladak.json', ['pelajaran'], 'peta jejak tempaan — guru lumpuh sunyi saat ini rusak', 50],
  ['laporan/geladak.json', ['protokol', 'status'], 'rapor geladak nyata V303'],
  ['laporan/sasaran-terkini.json', ['sasaranHariIni', 'akurasi'], 'sasaran harian server'],
  ['laporan/guru.json', ['diperbarui', 'pengajaran'], 'narasi guru anti-diam'],
  ['laporan/tanggapan.json', ['diperbarui', 'kulihat'], 'tanggapan wajib tiap denyut'],
  ['ruang-hidup/madrasah.json', ['versi', 'pelajaran'], 'madrasah pelajaran hidup'],
  ['ruang-hidup/habitat.json', ['versi', 'kelahiran'], 'habitat istana'],
  ['ujian/soal-200.json', ['protokol', 'soal'], 'bank soal TEMPAN-200 tersegel']
]
const SAKSIKAN = [['ujian/soal-500.json', ['protokol', 'soal'], 'bank 500 soal — 1,1MB: hanya disaksikan (hash), tak dicadangkan']]
const KODE = [
  ['scripts/hidup/sadar1.js', true, 'tubuh SADAR-1 — TERHUBUNG NAFAS (racun host = nafas mati)'],
  ['scripts/penjaga.mjs', false, 'jantung SAKTI'],
  ['scripts/hidup/guru-master.mjs', false, 'guru geladak'],
  ['scripts/hidup/pustaka.mjs', false, 'organ belajar jurnal'],
  ['scripts/hidup/imun.mjs', false, 'organ imun (dicatat, tak disentuh oleh patroli)']
]
// batas kegembiran: file yang berubah tiap denyut — cadangan diperbarui
// maksimal sekali per 6 jam agar imun tak membuat komit kebisingan.
const SEGARKAN_MENIT = 360
// kecuali organ stabil (jarang berubah): segarkan tiap kali beda
const SEGARKAN_SENTIASA = new Set(['laporan/peta-geladak.json', 'ujian/soal-200.json', 'ruang-hidup/habitat.json'])

const SAKSI_NAFAS = [
  'https://data-api.binance.vision/api/v3/ping',
  'https://api.binance.com/api/v3/ping',
  'https://api1.binance.com/api/v3/ping'
]

let TINDAKAN = [], CATATAN = [], BERUBAH = false

function catat (jenis, file, alasan, detail = {}) {
  const entri = { waktu: ISO(), jenis, file, alasan, ...detail }
  TINDAKAN.push(entri)
  console.log(`[imun] ${jenis} ${file} — ${alasan}`)
}

function sahJSON (file, wajib, minJejak) {
  if (!existsSync(file)) return { masalah: 'HILANG' }
  let j
  try { j = JSON.parse(readFileSync(file, 'utf8')) } catch (e) { return { masalah: 'JSON-TIDAK-SAH', rincian: String(e).slice(0, 90) } }
  if (!j || typeof j !== 'object') return { masalah: 'BUKAN-OBJEK' }
  const kurang = (wajib || []).filter(k => !(k in j))
  if (kurang.length) return { masalah: 'KUNCI-WAJIB-HILANG', rincian: kurang.join(',') }
  if (minJejak && j[wajib.includes('pelajaran') ? 'pelajaran' : 'soal']) {
    const n = Object.keys(j[wajib.includes('pelajaran') ? 'pelajaran' : 'soal'] || {}).length
    if (n < minJejak) return { masalah: 'ISI-KOSONG', rincian: `${n} < ${minJejak}` }
  }
  return { j }
}

function manifesMuat () {
  if (!existsSync(MANIFEST)) {
    console.error('[imun] manifes tidak ada — imun belum berbenih. Jalankan: node scripts/hidup/imun.mjs --benih')
    process.exit(0) // jujur: jangan bunuh denyut, tapi jangan pura-pura jaga
  }
  return JSON.parse(readFileSync(MANIFEST, 'utf8'))
}

function pushGit (pesan) {
  try {
    execSync('git config user.name "IMUN-MICAPROFITA"', { stdio: 'pipe' })
    execSync('git config user.email "imun@micaprofita.local"', { stdio: 'pipe' })
    execSync('git add -A imun laporan/imun.json laporan/imun.jsonl ruang-hidup/ingatan.json ruang-hidup/madrasah.json ruang-hidup/habitat.json otak laporan/peta-geladak.json laporan/geladak.json laporan/sasaran-terkini.json laporan/guru.json laporan/tanggapan.json ujian scripts/hidup/sadar1.js', { stdio: 'pipe' })
    const sulit = execSync('git diff --cached --quiet 2>/dev/null; echo $?').toString().trim()
    if (sulit === '0') return false // tak ada yang berubah
    execSync(`git commit -m ${JSON.stringify(pesan)}`, { stdio: 'pipe' })
    for (let i = 1; i <= 4; i++) {
      try { execSync('git push origin HEAD:main', { stdio: 'pipe', env: { ...process.env } }); return true }
      catch (e) {
        try { execSync('git pull --rebase origin main', { stdio: 'pipe' }) } catch { try { execSync('git rebase --abort', { stdio: 'pipe' }) } catch {} }
        execSync('sleep 4', { stdio: 'pipe' })
      }
    }
    console.error('[imun] push gagal 4x — pemulihan tersimpan lokal (denyut berikutnya menyusul)')
    return true
  } catch (e) { console.error('[imun] push bermasalah:', String(e).slice(0, 140)); return false }
}

// ---------- BENIH: cangkok cadangan dari pohon yang sehat ----------
function benih () {
  mkdirSync(DIR_CADANGAN, { recursive: true })
  const organ = [], kode = []
  const waktu = ISO()
  for (const [file, wajib, cat] of ORGAN) {
    const uji = sahJSON(file, wajib, cat.includes('peta') ? 50 : null)
    if (uji.masalah) throw new Error('benih menolak: ' + file + ' tidak sehat (' + uji.masalah + ') — benih hanya dari pohon sehat')
    const isi = readFileSync(file)
    writeFileSync(`${DIR_CADANGAN}/${slug(file)}`, isi)
    organ.push({ file, peran: 'pulihkan', wajib, minJejak: cat.includes('peta') ? 50 : null,
      catatan: cat, cadangan: `${DIR_CADANGAN}/${slug(file)}`, hash: h16(isi), size: isi.length, cadanganWaktu: waktu })
  }
  for (const [file, wajib, cat] of SAKSIKAN) {
    const uji = sahJSON(file, wajib, null)
    if (uji.masalah) throw new Error('benih menolak saksikan: ' + file + ' (' + uji.masalah + ')')
    const isi = readFileSync(file)
    organ.push({ file, peran: 'saksikan', wajib, catatan: cat, hash: h16(isi), size: isi.length, cadanganWaktu: waktu })
  }
  for (const [file, nafas, cat] of KODE) {
    const cek = spawnSync('node', ['--check', file])
    if (cek.status !== 0) throw new Error('benih menolak kode: ' + file + ' sintaks patah')
    const isi = readFileSync(file)
    writeFileSync(`${DIR_CADANGAN}/${slug(file)}`, isi)
    kode.push({ file, nafas, catatan: cat, cadangan: `${DIR_CADANGAN}/${slug(file)}`, hash: h16(isi), size: isi.length, cadanganWaktu: waktu })
  }
  const m = { skema: 'imun-manifes-v1', diperbarui: waktu, hukum: 'laporan/kajian-hidup.json H1–H6',
    keputusan: { pulihkan: 'luka → kembalikan bentuk terakhir sehat (hash wajib cocok)', adopsi: 'sah & beda → pertumbuhan (kode TIDAK diadopsi otomatis)', saksikan: 'file besar: hanya hash disaksikan' },
    organ, kode }
  writeFileSync(MANIFEST, JSON.stringify(m, null, 1))
  console.log('[imun] BENIH: ' + organ.length + ' organ vital + ' + kode.length + ' kode dicangkok & disegel')
}

// ---------- PATROLI ----------
async function patroli () {
  const m = manifesMuat()
  const kini = Date.now()
  let manifesKotor = false

  // 1. organ JSON vital
  for (const o of m.organ.filter(x => x.peran === 'pulihkan')) {
    const uji = sahJSON(o.file, o.wajib, o.minJejak)
    if (uji.masalah) {
      const cad = o.cadangan && existsSync(o.cadangan) ? readFileSync(o.cadangan) : null
      if (!cad || h16(cad) !== o.hash) { catat('TAK-BISA-PULIH', o.file, 'luka ' + uji.masalah + ' tapi cadangan tak tersedia/tak cocok'); continue }
      writeFileSync(o.file, cad)
      BERUBAH = true
      catat('PULIHKAN', o.file, 'luka: ' + uji.masalah + (uji.rincian ? ' (' + uji.rincian + ')' : '') + ' → dipulihkan dari cadangan tersegel ' + o.hash + ' (H1/H2/H3)')
      continue
    }
    const isi = readFileSync(o.file)
    const hash = h16(isi)
    if (hash === o.hash) continue // sehat — diam beralasan
    const umurCad = (kini - Date.parse(o.cadanganWaktu || 0)) / 60000
    if (umurCad >= SEGARKAN_MENIT || SEGARKAN_SENTIASA.has(o.file)) {
      writeFileSync(o.cadangan, isi)
      o.hash = hash; o.size = isi.length; o.cadanganWaktu = ISO(); m.diperbarui = ISO()
      BERUBAH = true; manifesKotor = true
      catat('ADOPSI', o.file, 'sah & berkembang → cadangan disegarkan (H5)')
    } else {
      catat('BERKEMBANG', o.file, 'sah & berkembang; cadangan ditahan ' + Math.round(SEGARKAN_MENIT - umurCad) + ' mnt lagi (anti-kebisingan)')
    }
  }
  // 2. organ saksikan (hash saja)
  for (const o of m.organ.filter(x => x.peran === 'saksikan')) {
    if (!existsSync(o.file)) { catat('LUKA-SAKSIKAN', o.file, 'hilang — tak ada cadangan (file besar); dilaporkan ke pemilik'); continue }
    const hash = h16(readFileSync(o.file))
    if (hash !== o.hash) {
      const uji = sahJSON(o.file, o.wajib, null)
      if (uji.masalah) catat('LUKA-BERAT', o.file, 'rusak & tak bisa dipulihkan otomatis — PANGGILAN PEMILIK')
      else { o.hash = hash; o.cadanganWaktu = ISO(); BERUBAH = true; manifesKotor = true; catat('ADOPSI-SAKSIKAN', o.file, 'berubah sah (protokol ada) → hash manifes diperbarui') }
    }
  }
  // 3. kode: pulih bila hilang/patah; berubah-sah → catat (tidak diadopsi)
  for (const k of m.kode) {
    if (!existsSync(k.file)) {
      const cad = k.cadangan && existsSync(k.cadangan) ? readFileSync(k.cadangan) : null
      if (cad && h16(cad) === k.hash) { writeFileSync(k.file, cad); BERUBAH = true; catat('PULIHKAN', k.file, 'kode hilang → dikembalikan dari cadangan') }
      else catat('TAK-BISA-PULIH', k.file, 'kode hilang, cadangan tak cocok')
      continue
    }
    const cek = spawnSync('node', ['--check', k.file])
    const hash = h16(readFileSync(k.file))
    if (cek.status !== 0) {
      const cad = k.cadangan && existsSync(k.cadangan) ? readFileSync(k.cadangan) : null
      if (cad && h16(cad) === k.hash) { writeFileSync(k.file, cad); BERUBAH = true; catat('PULIHKAN', k.file, 'sintaks patah → dikembalikan dari cadangan (H2)') }
      else catat('TAK-BISA-PULIH', k.file, 'sintaks patah, cadangan tak cocok — PANGGILAN PEMILIK')
      continue
    }
    if (hash !== k.hash) catat('TUBUH-BERUBAH', k.file, 'kode sah tapi berbeda dari cadangan — dicatat untuk audit; nafas sensor yang memutuskan (H6)')
  }

  if (manifesKotor) { m.diperbarui = m.diperbarui || ISO(); writeFileSync(MANIFEST, JSON.stringify(m, null, 1)) }

  // 4. NAFAS SENSOR — gejala fungsional dengan saksi mandiri (H4)
  let kea = null
  try { kea = JSON.parse(readFileSync('ruang-hidup/keadaan.json', 'utf8')) } catch {}
  const gagalPasar = ((kea && kea.gagal) || []).filter(g => /^pasar |lilin-gagal/.test(String(g))).length
  const saksi = await Promise.allSettled(SAKSI_NAFAS.map(async u => {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 4500)
    try { const r = await fetch(u, { signal: c.signal }); return r.ok } finally { clearTimeout(t) }
  }))
  const saksiHidup = saksi.filter(s => s.status === 'fulfilled' && s.value).length
  let nafasPutusan
  if (saksiHidup === 0) {
    nafasPutusan = 'NAFAS-DUNIA-TERPUTUS: semua saksi pasar mati — makhluk hidup dari ingatan sendiri; denyut tetap, keadaan disimpan (H4)'
    catat('NAFAS-DUNIA', 'saksi-pasar', nafasPutusan)
  } else if (gagalPasar >= 5) {
    const sadar = m.kode.find(k => k.file === 'scripts/hidup/sadar1.js')
    const berubah = sadar && existsSync(sadar.file) && h16(readFileSync(sadar.file)) !== sadar.hash
    if (berubah) {
      const cad = existsSync(sadar.cadangan) ? readFileSync(sadar.cadangan) : null
      if (cad && h16(cad) === sadar.hash) {
        writeFileSync(sadar.file, cad)
        BERUBAH = true
        nafasPutusan = 'RACUN-SALURAN: dunia hidup (' + saksiHidup + '/3 saksi) tapi nafas makhluk mati (' + gagalPasar + ' gagal pasar) + tubuh berubah → saluran dipulihkan dari cadangan (H4)'
        catat('PULIHKAN', 'scripts/hidup/sadar1.js', nafasPutusan)
      }
    } else {
      nafasPutusan = 'NAFAS-TERSENDAT: dunia hidup tapi ' + gagalPasar + ' bacaan pasar gagal; tubuh sadar1 tak berubah — luka di luar jangkauan imun, dilaporkan jujur'
      catat('NAFAS-TERSENDAT', 'saksi-pasar', nafasPutusan)
    }
  } else {
    nafasPutusan = 'NAFAS-LEGA: saksi hidup ' + saksiHidup + '/3, gagal pasar ' + gagalPasar
  }

  // 5. laporan tersegel + log
  const lapor = {
    skema: 'imun-patroli-v1', dihasilkan: ISO(), watak: 'kajian-hidup H1–H6',
    nafas: { saksiHidup, gagalPasar, putusan: nafasPutusan },
    tindakan: TINDAKAN, catatan: CATATAN,
    rekap: {
      pulihkan: TINDAKAN.filter(t => t.jenis === 'PULIHKAN').length,
      adopsi: TINDAKAN.filter(t => t.jenis === 'ADOPSI' || t.jenis === 'ADOPSI-SAKSIKAN').length,
      lukaTakTerpulihkan: TINDAKAN.filter(t => t.jenis.startsWith('TAK-BISA') || t.jenis.startsWith('LUKA')).length,
      tubuhBerubah: TINDAKAN.filter(t => t.jenis === 'TUBUH-BERUBAH').length
    }, segel: null
  }
  const buf = JSON.stringify(lapor, null, 1)
  lapor.segel = { hash: h16(buf), size: buf.length, readAt: ISO() }
  writeFileSync(LAPORAN, JSON.stringify(lapor, null, 1))
  writeFileSync(LOG, (existsSync(LOG) ? readFileSync(LOG, 'utf8') : '') +
    JSON.stringify({ waktu: lapor.dihasilkan, rekap: lapor.rekap, nafas: lapor.nafas.putusan.slice(0, 120), tindakan: TINDAKAN.map(t => t.jenis + ':' + t.file).join('|') }) + '\n')

  // 6. komit bila ada perubahan (pushGit diam bila tak ada diff)
  if (BERUBAH || TINDAKAN.length) {
    const n = lapor.rekap.pulihkan
    pushGit(`IMUN: ${n} luka dipulihkan, ${lapor.rekap.adopsi} adopsi — ${nafasPutusan.slice(0, 70)} [skip ci]`)
  }
  console.log('[imun] patroli selesai —', JSON.stringify(lapor.rekap), '—', nafasPutusan.slice(0, 110))
}

const arg = process.argv[2]
if (arg === '--benih') { benih(); process.exit(0) }
if (arg === '--segarkan-kode') {
  const m = manifesMuat(); const waktu = ISO()
  for (const k of m.kode) {
    const cek = spawnSync('node', ['--check', k.file])
    if (cek.status !== 0) { console.error('[imun] tolak segarkan: ' + k.file + ' sintaks patah'); continue }
    const isi = readFileSync(k.file)
    writeFileSync(k.cadangan, isi)
    k.hash = h16(isi); k.size = isi.length; k.cadanganWaktu = waktu
    console.log('[imun] kode diadopsi ke cadangan: ' + k.file)
  }
  m.diperbarui = waktu
  writeFileSync(MANIFEST, JSON.stringify(m, null, 1))
  console.log('[imun] cadangan kode disegarkan oleh tangan yang menjalankan --segarkan-kode (tercatat)')
  process.exit(0)
}
patroli().then(() => process.exit(0)).catch(e => {
  console.error('[imun] patroli gagal (jujur, denyut lanjut):', e && e.stack || e)
  process.exit(0) // H2: gagal imun tak boleh mematikan denyut — tapi tak boleh diam: log Actions mencatatnya
})
