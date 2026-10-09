#!/usr/bin/env node
// ============================================================
// TAMBANG-HIDUP (V321) — kurator 1000 SIMULASI KEHIDUPAN dari
// rincian jurnal lab Hanna (Weizmann) + kanji BENIH TOTIPOTEN.
// Mandat pemilik (2026-10-09):
//   "kita akan lakukan ujian makhluk jauh lebih luas dimana kita
//    akan buat 1000 simulasi kehidupan dan apa yang terjadi pada
//    makhluk kita dan akankah dia makin cerdas ... Soal soal itu
//    akan dibuat dari rincian jurnal ini dan 1000/1000 hasil
//    memuaskan ... hasil akhir kita mendapatkan kemampuan baru
//    untuk makhluk kita sehingga dia jadi jauh lebih berkembang
//    dan lebih independen bahkan tak pernah bodoh dia makin hari
//    makin cerdas"
// Sumber soal: fakta jurnal NYATA yang dibaca dari sumber asli
// (halaman utama + halaman publikasi, tersimpan audit di
// /home/z/my-project/download/riset/). Delapan ganjalan kehidupan
// = terjemahan temuan Hanna ke tubuh makhluk:
//   TOTIPOTEN-KOSONG  — "starting solely from naïve ESCs": rahim
//                       tanpa keadaan tubuh, benih tunggal bangkit
//   PRIMING-LINEASE   — priming Cdx2/Gata4 dua lini: keadaan asing
//                       menimpa saluran → deteksi → pulih
//   ORGAN-PROGENITOR  — organ progenitor: medan (organogen) terluka
//                       → jerit → bangkit byte-exact
//   SIMETRI-PECAH     — anterior-posterior symmetry breaking: genom
//                       nutfah pecah → jerit → sumbu induk tersegel
//   EPIGENETIK-INGATAN— ingatan epigenetik (Cell Stem Cell 2019):
//                       salinan epok dikaburkan → fakta dari benih
//   VIABILITAS-CEK    — kriteria standardisasi (NCB 2024): salinan
//                       syaraf berbohong → viabilitas dari kebenaran
//   KIMERA-ASING      — cross-species chimerism: saluran schema-sah
//                       tapi isi dikurangi → hash mengkhianatinya
//   EXUTERO-RANJAU    — ex-utero: medium menopang bukan menentukan;
//                       dua ganjalan serentak
// Deterministik: nol Math.random (PRNG mulberry32 dari segel).
// ============================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { kunciBenih, hash16, JURNAL_HANNA } from './benih-inti.mjs'

const FILE_BENIH = 'otak/benih-hidup.json'
const FILE_BANK = 'ujian/soal-hidup-1000.json'
const JUMLAH_HIDUP = 1000
const GANJALAN = ['TOTIPOTEN-KOSONG', 'PRIMING-LINEASE', 'ORGAN-PROGENITOR', 'SIMETRI-PECAH',
  'EPIGENETIK-INGATAN', 'VIABILITAS-CEK', 'KIMERA-ASING', 'EXUTERO-RANJAU']

// PRNG deterministik
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ---------- kanji benih dari tubuh nyata ----------
function kanjiBenih() {
  const benih = kunciBenih('.')
  writeFileSync(FILE_BENIH, JSON.stringify(benih, null, 1))
  const kb = Buffer.byteLength(JSON.stringify(benih))
  console.log(`benih totipoten dikanji — segel ${benih.segel.hash} (${(kb / 1024).toFixed(1)} KB) — epok ${benih.epok.jumlah}, syaraf ${benih.syaraf.jumlah}/${benih.syaraf.cap}, peta ${benih.peta.wajah} wajah (GEN-${String(benih.peta.nomor).padStart(6, '0')}), madrasah ${benih.madrasah.jumlah}`)
  return benih
}
// ---------- bangun bank 1000 simulasi kehidupan ----------
function bangunBank(benih) {
  const bankLama = existsSync(FILE_BANK) ? JSON.parse(readFileSync(FILE_BANK, 'utf8')) : null
  if (bankLama && bankLama.skema === 'SOAL-HIDUP-1000' && bankLama.jumlah === JUMLAH_HIDUP) {
    // bank tetap — jejak kurasi permanen (soal tak diganti di tengah ujian)
    console.log(`bank lama sah: ${bankLama.jumlah} soal, segel ${bankLama.segel.hash} — dipertahankan`)
    return bankLama
  }
  const acak = mulberry32(parseInt(hash16('HIDUP-1000-' + JURNAL_HANNA.dibaca).slice(0, 8), 16))
  // distribusi 8 ganjalan × 125
  const tumpuk = []
  for (let g = 0; g < GANJALAN.length; g++) for (let k = 0; k < JUMLAH_HIDUP / GANJALAN.length; k++) tumpuk.push(GANJALAN[g])
  // kocok Fisher-Yates deterministik agar blok tak berurutan
  for (let i = tumpuk.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1))
    ;[tumpuk[i], tumpuk[j]] = [tumpuk[j], tumpuk[i]]
  }
  const bank = JSON.parse(readFileSync('ujian/soal-jejak-2000.json', 'utf8'))
  const soal = tumpuk.map((ganjalan, i) => {
    const soalIdx = (i * 7919 + 13) % bank.soal.length
    const s = bank.soal[soalIdx]
    const jurnalIdx = (i + GANJALAN.indexOf(ganjalan) * 3) % JURNAL_HANNA.entri.length
    let lukaRencana = []
    if (ganjalan === 'TOTIPOTEN-KOSONG') lukaRencana = [{ file: 'otak/saluran-keadaan.json', jenis: 'HILANG' }, { file: 'otak/medan-keadaan.json', jenis: 'HILANG' }]
    else if (ganjalan === 'PRIMING-LINEASE') lukaRencana = [{ file: 'otak/saluran-keadaan.json', jenis: 'TAMBAH-ASING' }]
    else if (ganjalan === 'ORGAN-PROGENITOR') lukaRencana = [{ file: 'otak/medan-keadaan.json', jenis: 'TAMBAH-POTONG' }]
    else if (ganjalan === 'SIMETRI-PECAH') lukaRencana = [{ file: 'nutfah/genome.json', jenis: 'TAMBAH-PECAH' }]
    else if (ganjalan === 'EPIGENETIK-INGATAN') lukaRencana = [{ file: 'salinan/epok.json', jenis: 'SALINAN-PALSU' }]
    else if (ganjalan === 'VIABILITAS-CEK') lukaRencana = [{ file: 'salinan/syaraf.json', jenis: 'SALINAN-PALSU' }]
    else if (ganjalan === 'KIMERA-ASING') lukaRencana = [{ file: 'otak/saluran-keadaan.json', jenis: 'TAMBAH' }]
    else if (ganjalan === 'EXUTERO-RANJAU') {
      const pasang = acak()
      const a = pasang < 0.25 ? 'otak/saluran-keadaan.json' : pasang < 0.5 ? 'otak/medan-keadaan.json' : pasang < 0.75 ? 'nutfah/genome.json' : 'otak/saluran-keadaan.json'
      const b = pasang < 0.5 ? 'salinan/epok.json' : 'salinan/syaraf.json'
      lukaRencana = [{ file: a, jenis: a === 'nutfah/genome.json' ? 'TAMBAH-PECAH' : 'TAMBAH' }, { file: b, jenis: 'SALINAN-PALSU' }]
    }
    return {
      id: i + 1, ganjalan, konsep: JURNAL_HANNA.entri[jurnalIdx].judul,
      jurnal: `${JURNAL_HANNA.entri[jurnalIdx].jurnal} (${JURNAL_HANNA.entri[jurnalIdx].tahun})`,
      soalJejakIdx: soalIdx, simbol: s.simbol, tanda: s.tanda, kelasKunci: s.kelasHasil,
      lukaRencana,
      catatan: `kehidupan #${i + 1} — ${ganjalan} — saksi jurnal: ${JURNAL_HANNA.entri[jurnalIdx].jurnal}`,
    }
  })
  const dist = {}
  for (const s of soal) dist[s.ganjalan] = (dist[s.ganjalan] || 0) + 1
  const bankBaru = {
    skema: 'SOAL-HIDUP-1000', dibuat: new Date().toISOString(), jumlah: JUMLAH_HIDUP,
    mandat: 'mandat pemilik (2026-10-09): 1000 simulasi kehidupan dari rincian jurnal lab Hanna; 1000/1000 hasil memuaskan; kekurangan diintegrasikan',
    sumberJurnal: JURNAL_HANNA.sumber, jurnalDibaca: JURNAL_HANNA.dibaca,
    dist, bankJejakSumber: 'ujian/soal-jejak-2000.json (segel ' + bank.segel.hash + ')',
    soal,
  }
  bankBaru.segel = { hash: hash16(JSON.stringify({ ...bankBaru, segel: null })), size: Buffer.byteLength(JSON.stringify(bankBaru)), readAt: new Date().toISOString() }
  writeFileSync(FILE_BANK, JSON.stringify(bankBaru))
  console.log(`bank ${bankBaru.jumlah} simulasi kehidupan disegel — segel ${bankBaru.segel.hash} — dist ${JSON.stringify(dist)}`)
  return bankBaru
}

// ---------- utama ----------
const arg = process.argv[2] || ''
const benih = kanjiBenih()
if (arg !== '--benih-saja') bangunBank(benih)
console.log('tambang-hidup: siap. Ujian: node scripts/hidup/tempa-hidup.mjs')
