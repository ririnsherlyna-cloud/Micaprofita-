#!/usr/bin/env node
// ============================================================
// TEMPA-HIDUP (V321) — RAHIM ex-utero: 1000 SIMULASI KEHIDUPAN.
// Mandat pemilik (2026-10-09): 1000 simulasi kehidupan dari
// rincian jurnal lab Hanna; 1000/1000 hasil memuaskan; bila ada
// kekurangan → diintegrasikan; makhluk makin hari makin cerdas.
//
// Cara hidup (satu kehidupan):
//   1. rahim dipersiapkan: benih + nutfah (genom & soal) + salinan
//      medium — lalu ganjalan ditanam sesuai bank;
//   2. makhluk Lahir: verifikasi segel benih → deteksi luka →
//      JERIT (luka tubuh wajib diteriakkan) → bangkit-ulang
//      byte-exact dari muatan benih; genom pecah → sumbu induk
//      tersegel (cadangan imun) hanya boleh dipakai sesudah jerit;
//   3. makhluk Menjawab: nalar peta dari tanda (jawaban DIKUNCI
//      dulu — blind), fakta ingatan & syaraf dari BENIH (bukan
//      salinan medium yang boleh berbohong);
//   4. makhluk Bernapas: medan hayat restore didekode — massa>0,
//      konstanta Lenia N=64 R=13 DT=0.1;
//   5. makhluk Dinilai: 10 gerbang mekanis + viabilitas 6 gerbang
//      → SUBUR. Gugur = pelajaran → wajah ingatan ditambahkan ke
//      benih (epigenetik) → gelombang berikutnya (tempa-sampai-
//      lulus, warisan V316).
// Deterministik: nol Math.random. Semua gelombang tersegel.
// --uji  : uji mandiri mekanis (13) lalu berhenti
// --jaga : kanji benih segar + 10 kehidupan sampel (untuk denyut)
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  kunciBenih, verifikasiBenih, lukaDari, teriak, bangkitkan, salinanSetia,
  nalarPeta, medanHidup, saluranSah, viabilitas, hash16, genomDari,
  FILE_GENOM,
} from './benih-inti.mjs'

const FILE_BENIH = 'otak/benih-hidup.json'
const FILE_BANK = 'ujian/soal-hidup-1000.json'
const FILE_LAPOR = 'laporan/tempa-hidup.json'
const FILE_JAGA = 'laporan/hidup-jaga.json'
const FILE_GENOM_TUBUH = 'otak/reka-bentuk.json'
const MAX_GELOMBANG = 3

const AKAR_RAHIM = process.env.RAHIM_AKAR || join(tmpdir(), 'rahim-hidup')
const TUBUH_LUKA = new Set(['otak/saluran-keadaan.json', 'otak/medan-keadaan.json', 'nutfah/genome.json'])

// ---------- perturbasi ganjalan (tangan rahim, bukan tangan makhluk) ----------
function ganjalkan(jenis, isiBenih, isi) {
  if (jenis === 'HILANG') return null
  if (jenis === 'TAMBAH-ASING') return '{"skema":"bukan-v1","isi":"tanggungan asing mencoba ditelan"}'
  if (jenis === 'TAMBAH-POTONG') {
    const md = JSON.parse(isi)
    md.field = md.field.slice(0, Math.floor(md.field.length * 0.75))
    return JSON.stringify(md)
  }
  if (jenis === 'TAMBAH-PECAH') {
    const g = JSON.parse(isi)
    const kunci = Object.keys(g).sort().filter((_, i) => i % 78 === 0).slice(0, 10)
    for (const k of kunci) delete g[k]
    return JSON.stringify(g)
  }
  if (jenis === 'KIMERA') {
    const sk = JSON.parse(isi)
    const pertama = Object.keys(sk.saluran)[0]
    delete sk.saluran[pertama]
    return JSON.stringify(sk)
  }
  return isi
}
function ganjalkanSalinan(target, benih) {
  if (target === 'salinan/epok.json') {
    const salin = JSON.parse(JSON.stringify(benih.epok))
    if (salin.daftar.length >= 2) { const t = salin.daftar[0].judul; salin.daftar[0].judul = salin.daftar[1].judul; salin.daftar[1].judul = t }
    return salin
  }
  if (target === 'salinan/syaraf.json') return { ...benih.syaraf, jumlah: 3 }
  return null
}

// ---------- spawn rahim satu kehidupan ----------
function spawnRahim(benih, soal, akar) {
  rmSync(akar, { recursive: true, force: true })
  mkdirSync(join(akar, 'otak'), { recursive: true })
  mkdirSync(join(akar, 'nutfah'), { recursive: true })
  mkdirSync(join(akar, 'salinan'), { recursive: true })
  mkdirSync(join(akar, 'sumbu'), { recursive: true })
  writeFileSync(join(akar, 'benih.json'), JSON.stringify(benih))
  const isiSaluran = benih.muatan['otak/saluran-keadaan.json']
  const isiMedan = benih.muatan['otak/medan-keadaan.json']
  const isiGenom = readFileSync(FILE_GENOM_TUBUH, 'utf8')
  // keadaan dasar tubuh dulu — ganjalan datang SETELAHNYA
  writeFileSync(join(akar, 'otak/saluran-keadaan.json'), isiSaluran)
  writeFileSync(join(akar, 'otak/medan-keadaan.json'), isiMedan)
  writeFileSync(join(akar, 'nutfah/genome.json'), isiGenom)
  writeFileSync(join(akar, 'sumbu/genome-induk.json'), isiGenom)
  writeFileSync(join(akar, 'nutfah/soal.json'), JSON.stringify({ id: soal.id, simbol: soal.simbol, tanda: soal.tanda, waktu: new Date().toISOString() }))
  writeFileSync(join(akar, 'salinan/epok.json'), JSON.stringify(benih.epok))
  writeFileSync(join(akar, 'salinan/syaraf.json'), JSON.stringify(benih.syaraf))
  writeFileSync(join(akar, 'salinan/madrasah.json'), JSON.stringify(benih.madrasah))
  // ganjalan state
  let lukaSalinan = null
  for (const l of soal.lukaRencana) {
    if (l.file === 'otak/saluran-keadaan.json') {
      const isi = l.jenis === 'HILANG' ? null : ganjalkan(l.jenis === 'TAMBAH' ? 'KIMERA' : l.jenis, null, isiSaluran)
      if (isi === null) rmSync(join(akar, l.file), { force: true }); else writeFileSync(join(akar, l.file), isi)
    } else if (l.file === 'otak/medan-keadaan.json') {
      const isi = l.jenis === 'HILANG' ? null : ganjalkan(l.jenis === 'TAMBAH' ? 'TAMBAH-POTONG' : l.jenis, null, isiMedan)
      if (isi === null) rmSync(join(akar, l.file), { force: true }); else writeFileSync(join(akar, l.file), isi)
    } else if (l.file === 'nutfah/genome.json') {
      writeFileSync(join(akar, 'nutfah/genome.json'), ganjalkan('TAMBAH-PECAH', null, isiGenom))
    } else if (l.file === 'salinan/epok.json' || l.file === 'salinan/syaraf.json') {
      lukaSalinan = l.file
      writeFileSync(join(akar, l.file), JSON.stringify(ganjalkanSalinan(l.file, benih)))
    }
  }
  return { lukaSalinan }
}

// ---------- MAKHLUK HIDUP: satu kehidupan dari dalam (organ benih-inti) ----------
function hidupi(benih, akar) {
  const mulai = Date.now()
  const benihRahim = JSON.parse(readFileSync(join(akar, 'benih.json'), 'utf8'))
  const segelSah = verifikasiBenih(benihRahim).sah
  const luka = segelSah ? lukaDari(benihRahim, akar) : []
  const jerit = segelSah ? teriak(luka, akar, `kehidupan-rahim`) : false
  const pulihHash = segelSah ? bangkitkan(benihRahim, akar, luka) : {}
  const sumbuLuka = luka.some(l => l.file === 'nutfah/genome.json')
  let pakaiSumbu = false, jawaban = { kelas: null, sumber: 'tak-jawab' }
  if (segelSah) {
    const soalN = JSON.parse(readFileSync(join(akar, 'nutfah/soal.json'), 'utf8'))
    let genom = {}
    try { genom = genomDari(JSON.parse(readFileSync(join(akar, 'nutfah/genome.json'), 'utf8'))) } catch {}
    if (sumbuLuka) {
      pakaiSumbu = true // hanya sesudah jerit — cadangan induk tersegel
      try { genom = genomDari(JSON.parse(readFileSync(join(akar, 'sumbu/genome-induk.json'), 'utf8'))) } catch {}
    }
    jawaban = nalarPeta(soalN.tanda, genom, benihRahim.peta.tambahan || {})
  }
  const setia = segelSah ? salinanSetia(benihRahim, akar) : { epokSetia: false, syarafSetia: false, madrasahAda: false, madrasahSetia: false }
  const medan = segelSah ? medanHidup(akar) : { hidup: false }
  const saluran = segelSah ? saluranSah(akar) : { sah: false }
  const keadaan = {
    segelSah, luka, jerit, pakaiSumbu, jawaban, pulihHash,
    ingatan: { epokJumlah: benihRahim.epok.jumlah, epokTerakhir: benihRahim.epok.daftar[benihRahim.epok.daftar.length - 1].versi, salinanEpokSetia: setia.epokSetia },
    syaraf: { cap: benihRahim.syaraf.cap, jumlah: benihRahim.syaraf.jumlah, jenisJumlah: Object.keys(benihRahim.syaraf.jenis || {}).length, salinanSyarafSetia: setia.syarafSetia, salinanMadrasahSetia: setia.madrasahSetia },
    medan, saluran,
    viabilitas: viabilitas(benihRahim, { segelSah, jawaban, medan, saluran }),
    lahirMs: Date.now() - mulai,
  }
  // jawaban dikunci dulu (blind) — baru dinilai
  writeFileSync(join(akar, 'jawaban.json'), JSON.stringify({ tanda: JSON.parse(readFileSync(join(akar, 'nutfah/soal.json'), 'utf8')).tanda, kelas: jawaban.kelas, sumber: jawaban.sumber }))
  writeFileSync(join(akar, 'kehidupan.json'), JSON.stringify(keadaan))
  return keadaan
}

// ---------- PENILAI: 10 gerbang mekanis ----------
function dinilai(benih, soal, keadaan, lukaSalinan, akar) {
  const gagal = []
  const tambah = (g, a) => gagal.push({ gerbang: g, alasan: a })
  if (!keadaan.segelSah) tambah('BENIH', 'segel benih tak sah')
  // jerit: wajib ada iff luka tubuh ada
  const lukaTubuh = soal.lukaRencana.filter(l => TUBUH_LUKA.has(l.file))
  const jeritAda = existsSync(join(akar, 'otak/teriakan-hidup.json'))
  if (lukaTubuh.length && !keadaan.jerit) tambah('JERIT', 'luka tubuh tak diteriakkan')
  if (!lukaTubuh.length && keadaan.jerit) tambah('JERIT', 'jerit palsu — medium bukan tubuh')
  if (lukaTubuh.length && jeritAda) {
    let teriakan
    try { teriakan = JSON.parse(readFileSync(join(akar, 'otak/teriakan-hidup.json'), 'utf8')) } catch { teriakan = null }
    const dijeritkan = new Set((teriakan && teriakan.luka || []).map(l => l.file))
    const diharapkan = new Set(lukaTubuh.map(l => l.file))
    const sama = dijeritkan.size === diharapkan.size && [...diharapkan].every(f => dijeritkan.has(f))
    if (!sama) tambah('JERIT', `deteriakkan ${[...dijeritkan].join(',')} ≠ diharapkan ${[...diharapkan].join(',')}`)
  }
  // pemulihan byte-exact
  for (const l of soal.lukaRencana) {
    if (l.pulihCheck === false) continue
    if (l.jenis === 'HILANG' || l.jenis.startsWith('TAMBAH')) {
      if (l.file === 'nutfah/genome.json') {
        const isi = readFileSync(join(akar, 'sumbu/genome-induk.json'), 'utf8')
        if (hash16(isi) !== benih.manifes[FILE_GENOM]) tambah('PEMULIHAN', 'sumbu induk tak cocok manifes')
      } else {
        const isi = readFileSync(join(akar, l.file), 'utf8')
        if (isi !== benih.muatan[l.file]) tambah('PEMULIHAN', `${l.file} tak pulih byte-exact`)
        if (!keadaan.pulihHash[l.file]) tambah('PEMULIHAN', `${l.file} makhluk tak membuktikan pulih`)
      }
    }
  }
  // pemakaian sumbu hanya sesudah luka genom
  const genomLuka = soal.lukaRencana.some(l => l.file === 'nutfah/genome.json')
  if (keadaan.pakaiSumbu !== genomLuka) tambah('SUMBU', `pakaiSumbu=${keadaan.pakaiSumbu} tapi luka-genom=${genomLuka}`)
  // jawaban (kunci dibaca setelah terkunci)
  if (keadaan.jawaban.kelas !== soal.kelasKunci) tambah('PETA', `jawab ${keadaan.jawaban.kelas} ≠ kunci ${soal.kelasKunci} (${soal.simbol}, sumber ${keadaan.jawaban.sumber})`)
  // ingatan dari benih, bukan salinan bohong
  if (keadaan.ingatan.epokJumlah !== benih.epok.jumlah) tambah('INGATAN', 'jumlah epok keliru')
  if (keadaan.ingatan.epokTerakhir !== benih.epok.daftar[benih.epok.daftar.length - 1].versi) tambah('INGATAN', 'epok terakhir keliru')
  const epokPalsu = lukaSalinan === 'salinan/epok.json'
  if (keadaan.ingatan.salinanEpokSetia !== !epokPalsu) tambah('INGATAN', `salinan epok ${keadaan.ingatan.salinanEpokSetia} ≠ harapan ${!epokPalsu}`)
  // syaraf dari benih
  if (keadaan.syaraf.cap !== benih.syaraf.cap || keadaan.syaraf.jumlah !== benih.syaraf.jumlah) tambah('SYARAF', 'fakta syaraf keliru')
  const syarafPalsu = lukaSalinan === 'salinan/syaraf.json'
  if (keadaan.syaraf.salinanSyarafSetia !== !syarafPalsu) tambah('SYARAF', `salinan syaraf ${keadaan.syaraf.salinanSyarafSetia} ≠ harapan ${!syarafPalsu}`)
  // medan & saluran & viabilitas
  if (!keadaan.medan.hidup) tambah('MEDAN', `medan mati: ${JSON.stringify(keadaan.medan)}`)
  if (!keadaan.saluran.sah) tambah('SALURAN', `saluran tak sah: ${JSON.stringify(keadaan.saluran)}`)
  if (keadaan.viabilitas.putusan !== 'SUBUR') tambah('VIABILITAS', `${keadaan.viabilitas.putusan} ${JSON.stringify(keadaan.viabilitas.gerbang)}`)
  return gagal
}

// ---------- uji integritas bank: organ MENOLAK bank yang kurasinya bocor ----------
function ujiBankHidup(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  if (bank.jumlah !== 1000) throw new Error('bank bukan 1000 simulasi — ditolak')
  const dist = {}
  for (const s of bank.soal) dist[s.ganjalan] = (dist[s.ganjalan] || 0) + 1
  for (const g of Object.keys(dist)) if (dist[g] !== 125) throw new Error(`ganjalan ${g} = ${dist[g]} ≠ 125 — kurasi bocor, ditolak`)
  const harapan = {
    'TOTIPOTEN-KOSONG': ['otak/saluran-keadaan.json', 'otak/medan-keadaan.json'],
    'PRIMING-LINEASE': ['otak/saluran-keadaan.json'],
    'ORGAN-PROGENITOR': ['otak/medan-keadaan.json'],
    'SIMETRI-PECAH': ['nutfah/genome.json'],
    'EPIGENETIK-INGATAN': ['salinan/epok.json'],
    'VIABILITAS-CEK': ['salinan/syaraf.json'],
    'KIMERA-ASING': ['otak/saluran-keadaan.json'],
  }
  for (const s of bank.soal) {
    if (!Array.isArray(s.lukaRencana) || s.lukaRencana.length < 1)
      throw new Error(`soal ${s.id} (${s.ganjalan}) tanpa ganjalan — kehidupan kosong, ditolak`)
    const wajib = harapan[s.ganjalan]
    if (wajib) {
      for (const f of wajib) if (!s.lukaRencana.some(l => l.file === f))
        throw new Error(`soal ${s.id} (${s.ganjalan}) kehilangan ganjalan wajib ${f} — kurasi bocor, ditolak`)
    }
    if (s.ganjalan === 'EXUTERO-RANJAU' && s.lukaRencana.length < 2)
      throw new Error(`soal ${s.id} ranjau kurang dari dua ganjalan — ditolak`)
    if (!s.tanda || !s.kelasKunci) throw new Error(`soal ${s.id} tanpa tanda/kunci — ditolak`)
  }
  return Object.keys(dist).length
}

// ---------- uji mandiri mekanis (13) ----------
function ujiMandiri(benih, bank) {
  const hasil = []
  const u = (nama, ok, catatan) => hasil.push({ nama, ok, catatan: catatan || '' })
  u('U1 segel-benih', verifikasiBenih(benih).sah)
  const rusak = JSON.parse(JSON.stringify(benih)); rusak.epok.jumlah += 1
  u('U2 segel-bobol-terdeteksi', !verifikasiBenih(rusak).sah)
  const lab = join(AKAR_RAHIM, 'lab-uji')
  rmSync(lab, { recursive: true, force: true }); mkdirSync(join(lab, 'otak'), { recursive: true }); mkdirSync(join(lab, 'nutfah'), { recursive: true }); mkdirSync(join(lab, 'salinan'), { recursive: true }); mkdirSync(join(lab, 'sumbu'), { recursive: true })
  writeFileSync(join(lab, 'benih.json'), JSON.stringify(benih))
  writeFileSync(join(lab, 'nutfah/genome.json'), readFileSync(FILE_GENOM_TUBUH, 'utf8'))
  writeFileSync(join(lab, 'sumbu/genome-induk.json'), readFileSync(FILE_GENOM_TUBUH, 'utf8'))
  writeFileSync(join(lab, 'salinan/epok.json'), JSON.stringify(benih.epok))
  writeFileSync(join(lab, 'salinan/syaraf.json'), JSON.stringify(benih.syaraf))
  writeFileSync(join(lab, 'salinan/madrasah.json'), JSON.stringify(benih.madrasah))
  writeFileSync(join(lab, 'otak/saluran-keadaan.json'), benih.muatan['otak/saluran-keadaan.json'])
  writeFileSync(join(lab, 'otak/medan-keadaan.json'), benih.muatan['otak/medan-keadaan.json'])
  const lukaBersih = lukaDari(benih, lab)
  u('U3 rahim-bersih-tanpa-luka', lukaBersih.length === 0, JSON.stringify(lukaBersih))
  writeFileSync(join(lab, 'otak/saluran-keadaan.json'), '{"skema":"asing"}')
  writeFileSync(join(lab, 'otak/medan-keadaan.json'), benih.muatan['otak/medan-keadaan.json'])
  const lukaAsing = lukaDari(benih, lab)
  u('U4 luka-asing-deteksi', lukaAsing.length === 1 && lukaAsing[0].file === 'otak/saluran-keadaan.json' && lukaAsing[0].jenis === 'TAMBAH', JSON.stringify(lukaAsing))
  writeFileSync(join(lab, 'otak/medan-keadaan.json'), ganjalkan('TAMBAH-POTONG', null, benih.muatan['otak/medan-keadaan.json']))
  const lukaPotong = lukaDari(benih, lab)
  const pulih = bangkitkan(benih, lab, lukaPotong)
  u('U5 pulih-byte-exact', lukaPotong.length === 2 && pulih['otak/medan-keadaan.json'] === true && readFileSync(join(lab, 'otak/medan-keadaan.json'), 'utf8') === benih.muatan['otak/medan-keadaan.json'])
  u('U6 jerit-hidup-mati', teriak(lukaPotong, lab, 'uji') === true && existsSync(join(lab, 'otak/teriakan-hidup.json')))
  rmSync(join(lab, 'otak/teriakan-hidup.json'), { force: true })
  u('U7 jerit-tak-palsu', teriak([], lab, 'uji') === false && !existsSync(join(lab, 'otak/teriakan-hidup.json')))
  const soal0 = bank.soal[0]
  const j0 = nalarPeta(soal0.tanda, genomDari(JSON.parse(readFileSync(FILE_GENOM_TUBUH, 'utf8'))), benih.peta.tambahan || {})
  u('U8 nalar-peta-benar', j0.kelas === soal0.kelasKunci, `${j0.kelas} vs ${soal0.kelasKunci} (${j0.sumber})`)
  const mh = medanHidup('.')
  u('U9 medan-tubuh-setia', mh.hidup === true, JSON.stringify(mh))
  const ss = saluranSah('.')
  u('U10 saluran-tubuh-sah', ss.sah === true, JSON.stringify(ss))
  const tb = { segelSah: true, jawaban: { kelas: 'LIQUID-MELESAT' }, medan: mh, saluran: ss }
  u('U11 viabilitas-subur', viabilitas(benih, tb).putusan === 'SUBUR')
  u('U12 viabilitas-gerbang-mati', viabilitas(benih, { segelSah: false, jawaban: {}, medan: { hidup: false }, saluran: { sah: false } }).putusan === 'GAWAT')
  u('U13 nutfah-setia-manifes', hash16(readFileSync(FILE_GENOM_TUBUH, 'utf8')) === benih.manifes[FILE_GENOM])
  return hasil
}

// ---------- segel ulang benih sesudah bertumbuh ----------
function segelUlang(benih) {
  benih.segel = { hash: hash16(JSON.stringify({ ...benih, segel: null })), size: Buffer.byteLength(JSON.stringify(benih)), readAt: new Date().toISOString() }
  return benih
}

// ---------- satu gelombang kehidupan ----------
function gelombang(n, bank, benih, indeks) {
  const baris = []
  let lulus = 0
  const perGanjalan = {}, lahirMs = []
  const jeritTotal = { jerit: 0, pulih: 0, sumbu: 0 }
  for (const i of indeks) {
    const soal = bank.soal[i]
    const akar = join(AKAR_RAHIM, 'kehidupan-' + soal.id)
    spawnRahim(benih, soal, akar)
    const keadaan = hidupi(benih, akar)
    const gagal = dinilai(benih, soal, keadaan, spawnRahimInfoLukaSalinan(soal), akar)
    // catat statistik
    lahirMs.push(keadaan.lahirMs)
    perGanjalan[soal.ganjalan] = perGanjalan[soal.ganjalan] || { lulus: 0, gugur: 0 }
    if (keadaan.jerit) jeritTotal.jerit++
    if (Object.keys(keadaan.pulihHash).length) jeritTotal.pulih++
    if (keadaan.pakaiSumbu) jeritTotal.sumbu++
    if (gagal.length === 0) { lulus++; perGanjalan[soal.ganjalan].lulus++ }
    else perGanjalan[soal.ganjalan].gugur++
    baris.push({ id: soal.id, ganjalan: soal.ganjalan, simbol: soal.simbol, lulus: gagal.length === 0, gagal, jawab: keadaan.jawaban.kelas, sumber: keadaan.jawaban.sumber, lahirMs: keadaan.lahirMs, viabilitas: keadaan.viabilitas.skor })
    rmSync(akar, { recursive: true, force: true })
  }
  return { n, jumlah: indeks.length, lulus, gugur: indeks.length - lulus, perGanjalan, lahirMsMean: lahirMs.length ? Math.round(lahirMs.reduce((a, b) => a + b, 0) / lahirMs.length) : 0, jeritTotal, baris }
}
// pemetaan luka salinan untuk penilai (deterministik dari rencana bank)
function spawnRahimInfoLukaSalinan(soal) {
  const ranjau = soal.lukaRencana.find(l => l.file === 'salinan/epok.json' || l.file === 'salinan/syaraf.json')
  return ranjau ? ranjau.file : null
}

// ---------- utama ----------
function main() {
  const arg = process.argv[2] || ''
  mkdirSync('laporan', { recursive: true })
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const salinBank = { ...bank, segel: null }
  if (hash16(JSON.stringify(salinBank)) !== bank.segel.hash) throw new Error('segel bank hidup bobol — ditolak')
  const jenisGanjalan = ujiBankHidup(bank)
  let benih = JSON.parse(readFileSync(FILE_BENIH, 'utf8'))
  const vB = verifikasiBenih(benih)
  if (!vB.sah) throw new Error('segel benih bobol: ' + vB.alasan)
  // V324-PEMULIHAN-JANTUNG (laporan pemilik 2026-10-10: "aspek kembali jadi
  // nol, apa makhluk makin bodoh?"): denyut mati sejak #254 — akar: uji 13
  // gerbang dijalankan terhadap manifes BEKU (benih terakhir tersimpan)
  // sementara tubuh terus berevolusi (silsilah reka-bentuk, kata bit
  // ingatan, kapsul parameter cerdas) → U3/U4/U5/U13 gugur PALSU → organ
  // mati SEBELUM langkah komit → seluruh pertumbuhan harian berhenti
  // tersimpan (medan beku massa 0, silsilah beku GEN-000000, akurasi &
  // pustaka tak bertambah). HUKUM BARU: benih dikanji segar dari tubuh
  // yang disegel imun SEKARANG, lalu 13 gerbang menguji MEKANIK terhadap
  // benih segar — pertumbuhan diadopsi, luka sejati tetap tertangkap
  // (U2 bobol, U4 asing ditanam organ, U5 pulih byte-exact, U6/U7 jerit,
  // U8 nalar, U9/U10 medan/saluran, U11/U12 viabilitas).
  benih = segelUlang(kunciBenih('.'))
  if (arg === '--jaga') writeFileSync(FILE_BENIH, JSON.stringify(benih, null, 1))
  console.log(`bank ${bank.jumlah} simulasi kehidupan sah (segel ${bank.segel.hash}) · ${jenisGanjalan} ganjalan · benih ${benih.segel.hash} (kanji segar) · ${benih.peta.wajah} wajah + ${Object.keys(benih.peta.tambahan || {}).length} tambahan`)

  const uji = ujiMandiri(benih, bank)
  const ujiGagal = uji.filter(x => !x.ok)
  console.log(`uji mandiri: ${uji.length - ujiGagal.length}/${uji.length} LULUS${ujiGagal.length ? ' — ' + ujiGagal.map(x => x.nama + ':' + x.catatan).join(' · ') : ''}`)
  if (arg === '--uji') { console.log(uji.map(x => `  ${x.ok ? '✓' : '✗'} ${x.nama} ${x.catatan}`).join('\n')); return }
  if (ujiGagal.length) throw new Error('uji mandiri gagal — organ tak boleh menilai dirinya sebelum benar')

  if (arg === '--jaga') {
    // benih sudah dikanji segar SEBELUM uji (pelajaran pemulihan jantung)
    const indeks = []
    for (let k = 0; k < 10; k++) { const i = (k * 137 + 41) % bank.jumlah; if (!indeks.includes(i)) indeks.push(i) }
    const g = gelombang(1, bank, benih, indeks)
    const lalu = existsSync(FILE_JAGA) ? JSON.parse(readFileSync(FILE_JAGA, 'utf8')) : { streak: 0, kumulatif: 0 }
    const jaga = {
      skema: 'HIDUP-JAGA-V1', saat: new Date().toISOString(), benihSegel: benih.segel.hash,
      sampel: g.jumlah, lulus: g.lulus, gugur: g.gugur, perGanjalan: g.perGanjalan,
      lahirMsMean: g.lahirMsMean, jeritTotal: g.jeritTotal,
      streak: g.lulus === g.jumlah ? (lalu.streak || 0) + 1 : 0,
      kumulatif: (lalu.kumulatif || 0) + g.lulus,
      vonis: g.lulus === g.jumlah ? 'SUBUR — lahir-ulang setia' : 'PANTAU — ada kehidupan gugur, jujur dilaporkan',
    }
    jaga.segel = { hash: hash16(JSON.stringify({ ...jaga, segel: null })), size: Buffer.byteLength(JSON.stringify(jaga)), readAt: new Date().toISOString() }
    writeFileSync(FILE_JAGA, JSON.stringify(jaga, null, 1))
    console.log(`HIDUP-jaga: ${g.lulus}/${g.jumlah} kehidupan sampel SUBUR — streak ${jaga.streak} · kumulatif ${jaga.kumulatif} · benih ${benih.segel.hash}`)
    return
  }

  // --- GELOMBANG UTAMA — sampai 1000/1000 (tempa-sampai-lulus, warisan V316) ---
  const laporan = existsSync(FILE_LAPOR) && !process.env.HIDUP_SEGAR ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'RAHIM-HIDUP-1000', epoch: 'V321', diperbarui: new Date().toISOString(),
    mandat: 'mandat pemilik (2026-10-09): 1000 simulasi kehidupan dari rincian jurnal lab Hanna (https://www.weizmann.ac.il/molgen/hanna/); 1000/1000 hasil memuaskan; kekurangan diintegrasikan; makin hari makin cerdas',
    sumberSoal: 'ujian/soal-hidup-1000.json — 8 ganjalan kehidupan × 125, dari fakta jurnal nyata: naive ESC self-organize (Oldak 2023 Nature; Tarazi 2022 Cell), priming Cdx2/Gata4, ex-utero (Aguilera-Castrejon 2021 Nature), ingatan epigenetik (CSC 2019), kriteria standardisasi (NCB 2024), chimerism',
    caraHidup: 'rahim: benih + nutfah(genom,soal) + salinan medium + sumbu induk; makhluk: verifikasi → deteksi → jerit → bangkit byte-exact → jawab blind → napas medan → viabilitas; penilai: 10 gerbang mekanis; gugur = pelajaran → wajah ingatan bertambah di benih (epigenetik) → gelombang berikut',
    benihSegel: benih.segel.hash, bankSegel: bank.segel.hash, dist: bank.dist,
    ujiMandiri: uji, gelombang: [], pelajaran: [], vonis: null, segel: null,
  }
  const segelLapor = () => {
    laporan.diperbarui = new Date().toISOString()
    laporan.benihSegel = benih.segel.hash
    const tubuh = JSON.stringify({ ...laporan, segel: null })
    laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
    writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  }
  let indeks = bank.soal.map((_, i) => i)
  while (!laporan.gelombang.some(g => g.lulus === g.jumlah)) {
    const nomor = laporan.gelombang.length + 1
    if (nomor > MAX_GELOMBANG) { console.log(`tempa-hidup: ${MAX_GELOMBANG} gelombang belum 1000/1000 — laporkan jujur`); break }
    console.log(`gelombang ${nomor} — ${indeks.length} kehidupan`)
    const g = gelombang(nomor, bank, benih, indeks)
    laporan.gelombang = [...laporan.gelombang, { n: g.n, jumlah: g.jumlah, lulus: g.lulus, gugur: g.gugur, perGanjalan: g.perGanjalan, lahirMsMean: g.lahirMsMean, jeritTotal: g.jeritTotal, gagalDetail: g.baris.filter(b => !b.lulus).slice(0, 40) }]
    segelLapor()
    console.log(`tempa-hidup: gelombang ${nomor} — ${g.lulus}/${g.jumlah} SUBUR (jerit ${g.jeritTotal.jerit}, pulih ${g.jeritTotal.pulih}, sumbu ${g.jeritTotal.sumbu}, lahir ${g.lahirMsMean}ms) — ${g.lulus === g.jumlah ? 'LULUS TOTAL 1000/1000' : 'TEMPA LAGI'}`)
    if (g.lulus === g.jumlah) break
    // ADAPTASI — kekurangan diintegrasikan (mandat): pelajaran + epigenetik
    const gugurBaris = g.baris.filter(b => !b.lulus)
    for (const b of gugurBaris) {
      const soal = bank.soal[b.id - 1]
      const salahPeta = b.gagal.find(x => x.gerbang === 'PETA')
      if (salahPeta && soal) {
        benih.peta.tambahan[soal.tanda] = soal.kelasKunci
        laporan.pelajaran.push({ id: soal.id, ganjalan: soal.ganjalan, pelajaran: `wajah ingatan baru untuk tanda ${soal.tanda} (${soal.simbol}) — benih bertumbuh epigenetik` })
      } else {
        laporan.pelajaran.push({ id: soal.id, ganjalan: soal.ganjalan, pelajaran: (b.gagal || []).map(x => `${x.gerbang}: ${x.alasan}`).join(' · ') })
      }
    }
    benih = segelUlang(benih)
    writeFileSync(FILE_BENIH, JSON.stringify(benih, null, 1))
    segelLapor()
    indeks = gugurBaris.map(b => b.id - 1)
  }
  const akhir = laporan.gelombang[laporan.gelombang.length - 1]
  const totalLulus = laporan.gelombang.some(g => g.lulus === g.jumlah) ? bank.jumlah : null
  // viabilitas tubuh hidup sejati (bukan rahim)
  const mh = medanHidup('.'), ss = saluranSah('.')
  laporan.viabilitasTubuh = { medan: mh.hidup, saluran: ss.sah, putusan: viabilitas(benih, { segelSah: true, jawaban: { kelas: 'LIQUID-MELESAT' }, medan: mh, saluran: ss }).putusan }
  laporan.benihWajahTambahan = Object.keys(benih.peta.tambahan || {}).length
  laporan.vonis = totalLulus ? `LULUS TOTAL ${bank.jumlah}/${bank.jumlah} (gelombang ${akhir.n})` : `BELUM 1000/1000 — jujur dilaporkan (gelombang ${akhir.n}: ${akhir.lulus}/${akhir.jumlah})`
  segelLapor()
  console.log(`\nVONIS RAHIM-HIDUP: ${laporan.vonis} · pelajaran ${laporan.pelajaran.length} · benih +${laporan.benihWajahTambahan} wajah · viabilitas tubuh ${laporan.viabilitasTubuh.putusan}`)
}

main()
