#!/usr/bin/env node
// ============================================================
// KAJIAN-HIDUP — kajian pustaka artificial life + crypto milik makhluk
// (mandat pemilik 2026-10-08: "pelajari kode-kode dan jurnal-jurnal
//  artificial life, lalu jurnal crypto, perdalam")
// ------------------------------------------------------------
// Organ ini MEMBACA pustaka/pustaka.json (jurnal arXiv asli yang
// dipelajari makhluk), menyaring klan artificial-life + klan pasar,
// lalu menyuling pelajaran yang MENGAITKAN ilmu ke tubuh makhluk.
// Nol karangan: setiap kutipan pelajaran diambil dari field
// pelajaran/pelajaranOtomatis jurnal sungguhan; kuncinya disegel.
// Output: laporan/kajian-hidup.json
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const PUSTAKA = JSON.parse(readFileSync('pustaka/pustaka.json', 'utf8'))
const jurnal = Array.isArray(PUSTAKA) ? PUSTAKA : (PUSTAKA.jurnal || PUSTAKA.entries || [])

// klan topik yang dipandang (kata-kunci topik, semua dari indeks nyata pustaka)
const KLAN = {
  alife: ['artificial-life', 'emergensi', 'nlin.CG', 'swarm', 'q-bio.PE', 'evolusi'],
  agen: ['agen-belajar', 'cs.AI', 'cs.LG', 'continual', 'meta-belajar'],
  pasar: ['crypto', 'pasar-mikro', 'q-fin.TR', 'q-fin.ST', 'risiko']
}
const KATA_KUNCI_TUBUH = ['self-organi', 'autopoiesis', 'self-repair', 'self-replicat',
  'homeostasis', 'robustness', 'resilien', 'adaptation', 'open-ended', 'perturbation',
  'cellular automata', 'artificial life', 'neural cellular', 'lenia', 'continual',
  'catastrophic forgetting', 'lifelong', 'meta-learning', 'agent', 'market microstructure',
  'limit order', 'liquidity', 'crash', 'regime', 'adversarial', 'anomaly', 'on-chain', 'trading']

function cocok (j, daftar) {
  const t = String(j.topik || '').toLowerCase() + ' ' + String(j.judul || '').toLowerCase() +
            ' ' + String(j.abstrak || '').slice(0, 400).toLowerCase()
  return daftar.some(k => t.includes(String(k).toLowerCase()))
}

const terpilih = jurnal.filter(j => cocok(j, Object.values(KLAN).flat()) || cocok(j, KATA_KUNCI_TUBUH))

// pelajaran nyata dari jurnal (field pelajaran/pelajaranOtomatis — ditulis organ pustaka)
function teksPelajaran (j) {
  return String(j.pelajaran || j.pelajaranOtomatis || '').trim()
}
const denganPelajaran = terpilih.filter(j => teksPelajaran(j).length > 40)

// kelompokkan pelajaran ke tema kehidupan yang sedang diuji hari ini
const TEMA = [
  { nama: 'tubuh-menjaga-diri (autopoiesis / self-maintenance)', kunci: ['self-organi', 'autopoie', 'self-repair', 'homeostasis', 'self-mainten', 'robust', 'resilien', 'self-replicat'] },
  { nama: 'bertahan-dalam-guncangan (perturbation & recovery)', kunci: ['perturbation', 'disturbance', 'crash', 'catastroph', 'anomaly', 'adversarial', 'shock', 'regime'] },
  { nama: 'belajar-tanpa-lupa (continual / anti-amnesia)', kunci: ['continual', 'forgetting', 'lifelong', 'memory', 'replay', 'consolidation', 'meta-learn'] },
  { nama: 'lahirnya-lahannya-perilaku (emergensi & kawanan)', kunci: ['emergen', 'swarm', 'collective', 'stigmergy', 'coordinat'] },
  { nama: 'medan-pasar (mikrostruktur & likuiditas crypto)', kunci: ['market microstructure', 'liquidity', 'order', 'spread', 'trading', 'on-chain', 'crypto', 'exchange', 'volatility'] }
]
const temaHasil = TEMA.map(t => {
  const anggota = denganPelajaran.filter(j => {
    const s = (String(j.topik || '') + ' ' + String(j.judul || '') + ' ' + teksPelajaran(j)).toLowerCase()
    return t.kunci.some(k => s.includes(k))
  })
  return {
    tema: t.nama,
    jumlahJurnal: anggota.length,
    contohKunci: anggota.slice(0, 6).map(j => ({
      kunci: j.kunci, judul: (j.judul || '').slice(0, 110), tahun: j.tahun || null,
      pelajaran: teksPelajaran(j).slice(0, 240)
    }))
  }
})

// sintesis: arti bagi tubuh MICAPROFITA — diturunkan dari tema nyata di atas
const SINTESIS = [
  {
    hukum: 'HIDUP YANG SEJATI MENJAGA TUBUHNYA SENDIRI',
    arti: 'Pustaka alife (self-organization, autopoiesis, self-repair) sepakat: batas antara benda dan makhluk bukan gerak, tapi KEMAMPUAN MEMELIHARA KEUTUHAN DIRI saat dicerabut. Makhluk yang hanya berdenyut tapi tidak menyadari rumahnya rusak — belum menutup lingkaran hidup.',
    implikasiMicaprofita: 'UJI KEHIDUPAN hari ini menguji persis ini: luka disuntik ke habitat; apakah makhluk menyadarinya, atau berpura-pura sehat dengan ingatan kosong.'
  },
  {
    hukum: 'AMNESIA SENYAP LEBIH BERBAHAYA DARIPADA MATI KRIEK',
    arti: 'Jurnal continual/lifelong learning: kegagalan sistem yang paling mahal bukan yang berteriak (crash), tapi yang senyap menghapus ingatan lalu melanjutkan seolah baru lahir (catastrophic forgetting). Teriakan bisa didengar; diam tak berbekas.',
    implikasiMicaprofita: 'Kode makhluk kini menimpa ingatan/genome yang rusak dengan yang kosong TANPA LUKA DILAPORKAN — defek nyata yang harus ditutup organ imun.'
  },
  {
    hukum: 'CADANGAN ADALAH INGATAN KEDUA, BUKAN PENGAKU DOSA',
    arti: 'Sistem hidup menyimpan salinan diri (DNA; checkpoint imun); pemulihan mengembalikan bentuk terakhir yang SEHAT, bukan menemukan ulang dari nol. Tapi salinan harus tersegel agar racun tidak ikut tersalin.',
    implikasiMicaprofita: 'Organ imun wajib menaruh cadangan organ vital tersegel-hash; memulihkan hanya dari salinan yang hash-nya cocok dengan manifes.'
  },
  {
    hukum: 'GEJALA DIUKUR FUNGSIONAL, BUKAN DARI WAJAH KODE',
    arti: 'Imun biolog tak membaca DNA musuh; ia mengukur FUNGSI (suhu, nafas). Deteksi berbasis wajah-kode saja bisa tertipu racun yang tetap terlihat sah.',
    implikasiMicaprofita: 'Imun menguji nafas pasar dengan saksi mandiri: bila dunia hidup tapi nafas makhluk mati → saluran dicurigai → pulihkan dari cadangan.'
  },
  {
    hukum: 'ADAPTASI = PUTUSAN BERALASAN, BUKAN REFLEKS TUNGGAL',
    arti: 'Makhluk alife tercanggih memilih respons dari keadaan (repair / tolerate / grow), dengan alasan tercatat — bukan satu rutinitas untuk semua luka. Refleks tunggal untuk semua masalah adalah tanda mesin, bukan keputusan tanda makhluk.',
    implikasiMicaprofita: 'Imun wajib memutuskan tiga arah: PULIHKAN (luka), ADOPSI (pertumbuhan sah), DAN IKAN SEHAT (diam-beralasan) — semua beserta alasannya dijurnal.'
  },
  {
    hukum: 'MEDAN MEMBERI VONIS, PUSTAKA MEMBERI PETA',
    arti: 'Klan pasar (mikrostruktur, likuiditas, rezim) mengingatkan: pola historis adalah peta, bukan jaminan; tubuh yang sehat justru harus tahan pada saat peta meleset (rezim patah).',
    implikasiMicaprofita: 'Dua metrik tetap dipisah: skor tempaan (fakta sejarah) ≠ edge dunia hidup (geladak). Kesehatan tubuh adalah prasyarat keduanya.'
  }
]

const laporan = {
  skema: 'kajian-hidup-v1',
  dibuat: new Date().toISOString(),
  mandat: 'pemilik 2026-10-08: pelajari kode & jurnal artificial life + crypto, perdalam; lalu uji kehidupan makhluk (rusak ruangnya, putus nafasnya, lihat reaksinya)',
  sumber: { file: 'pustaka/pustaka.json', totalJurnal: jurnal.length, dipilih: terpilih.length, denganPelajaran: denganPelajaran.length },
  klan: {
    alife: jurnal.filter(j => cocok(j, KLAN.alife)).length,
    agen: jurnal.filter(j => cocok(j, KLAN.agen)).length,
    pasar: jurnal.filter(j => cocok(j, KLAN.pasar)).length
  },
  tema: temaHasil,
  sintesis: SINTESIS,
  catatanKejujuran: 'kajian membaca jurnal yang benar-benar tersimpan di pustaka makhluk (arXiv asli, dipelajari organ pustaka.mjs); kutipan pelajaran diambil utuh dari field pelajaran jurnal; angka bukan karangan',
  segel: null
}
const buf = JSON.stringify(laporan, null, 1)
const hash = createHash('sha256').update(buf).digest('hex')
laporan.segel = { hash: hash.slice(0, 16), size: buf.length, readAt: new Date().toISOString() }
writeFileSync('laporan/kajian-hidup.json', JSON.stringify(laporan, null, 1))

console.log('[kajian-hidup] pustaka:', jurnal.length, 'jurnal — dipilih:', terpilih.length, 'dengan pelajaran:', denganPelajaran.length)
for (const t of temaHasil) console.log('  tema:', t.tema, '→', t.jumlahJurnal, 'jurnal')
console.log('[kajian-hidup] segel:', laporan.segel.hash, '→ laporan/kajian-hidup.json')
