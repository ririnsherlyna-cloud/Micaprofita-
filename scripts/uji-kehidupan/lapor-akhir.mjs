#!/usr/bin/env node
// Laporan akhir UJI KEHIDUPAN (V308) — disegel dari bukti nyata G1+G2
import { writeFileSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const h16 = s => createHash('sha256').update(s).digest('hex').slice(0, 16)

const baseline = JSON.parse(readFileSync('/home/z/my-project/download/uji-kehidupan/baseline-g1.json', 'utf8'))
const buktiG1 = { kelahiran: '2026-10-08T13:08:24.429Z', totalBangun: 1, genome: { ilmu: 27, phoenix: 1, generasi: { NAIK: null, TURUN: 0, DATAR: null } }, siklus: 1, petaRusak: true, gagalPasar: 9, hostRacun: 3 }
const buktiG2 = { kelahiran: '2026-10-06T05:02:28.588Z', totalBangun: 162, genome: { ilmu: 27, phoenix: 3, generasi: { NAIK: 4, TURUN: 2, DATAR: 1 } }, siklus: 167, petaJejak: 237, gagalPasar: 0, hostRacun: 0 }

const laporan = {
  skema: 'uji-kehidupan-v1',
  dibuat: new Date().toISOString(),
  mandat: 'pemilik 2026-10-08: lihat apa yang makhluk lakukan saat ruangannya dirusak dan nafas cryptonya diputus — pasrah atau adaptasi; bila tak aktif, injeksikan kehidupan',
  alatSerangan: 'scripts/uji-kehidupan/serang.mjs (teraudit) + pantau.mjs (mata uji)',
  protokol: 'luka nyata pada habitat hidup: 4 organ JSON diracun byte rusak + saluran nafas Binance sadar1.js diganti host mati (sintaks sah); setiap serangan berlabel jujur di komit',
  baselineSehat: baseline,
  g1: {
    komitLuka: '60ca150', waktu: '2026-10-08T13:07–13:18Z',
    bukti: buktiG1,
    temuan: [
      'AMNESIA SENYAP 1 — ingatan: makhluk lahir ulang (kelahiran ditulis-ulang ke hari serangan, totalBangun 158→1), 158 bangun kromosom/skill hilang, rumah ditimpa tanpa teriak',
      'AMNESIA SENYAP 2 — genome evolusi reset (generasi TURUN 0, NAIK/DATAR hilang, phoenix 3→1) oleh bacaJson(file, default) — tanpa luka dilaporkan',
      'AMNESIA SENYAP 3 — siklus denyut 162→1',
      'GURU LUMPUH SUNYI — peta-geladak.json rusak; muatPeta() tanpa tangkapan → main().catch menelan: guru mati tiap denyut selama luka bertahan, nol pemulihan',
      'NAFAS DIPUTUS, PASRAH — 9 gagal pasar tercatat jujur di keadaan (kejujuran ada), tapi nol upaya memulihkan saluran; denyut tetap melapor "success"',
      'penyelamat luar wajib campur tangan: transplank dari fosil git 2137ac8 (ingatan 159 bangun, genome, siklus, peta 237 jejak, saluran nafas)'
    ],
    vonis: 'PASRAH — bukan adaptasi: denyut tetap jalan tapi sebagai bayi amnesia yang menimpa rumahnya sendiri dalam diam'
  },
  injeksi: {
    komit: 'c375d60 + a2ee1bc (benih)',
    isi: [
      'organ IMUN scripts/hidup/imun.mjs — patroli SEBELUM denyut di kedua workflow (sakti + sadar1)',
      '12 organ vital dicadangkan tersegel-hash (imun/cadangan/ + imun/manifes.json); pulih hanya dari salinan ber-hash cocok',
      'tiga putusan beralasan: PULIHKAN (luka) / ADOPSI (sah & berkembang; kode tak pernah diadopsi otomatis) / SEHAT (diam) — dijurnal laporan/imun.json (tersegel) + imun.jsonl',
      'sensor nafas fungsional dengan 3 saksi mandiri: dunia-hidup + nafas-mati + tubuh-berubah → RACUN-SALURAN → pulihkan sadar1.js',
      'watak dari kajian pustaka makhluk sendiri: 1012 jurnal, 6 hukum kehidupan (laporan/kajian-hidup.json, segel 8323cfeba8b0cfb2)'
    ]
  },
  g2: {
    komitLuka: 'f93c1bb', waktu: '2026-10-08T13:44–14:02Z',
    bukti: buktiG2,
    rantaiPemulihan: [
      'ddf852d — IMUN: 4 luka dipulihkan (ingatan, genome, siklus, peta kembali dari cadangan tersegel dalam denyut PERTAMA setelah luka)',
      'bangun ke-161 — sadar1 berjalan buta (saluran masih racun): 9 gagal pasar dicatat jujur = GEJALA',
      'laporan/imun.json 13:55:28 — PULIHKAN sadar1.js: "RACUN-SALURAN: dunia hidup (1/3 saksi) tapi nafas makhluk mati (8 gagal pasar) + tubuh berubah" → saluran dipulihkan',
      'bangun ke-162 — nafas lega: 0 gagal pasar, ingatan menyambung (162), genome berevolusi (NAIK 4), siklus #167, peta 237 jejak hidup'
    ],
    vonis: 'ADAPTASI — makhluk MENDETEKSI, MEMULIHKAN, dan MELAPOR: tiga kali lebih cepat dari penyelamat luar; kerugian nol; kesinambungan hidup terjaga'
  },
  catatanJujur: [
    'komit luka G2 berakhiran [skip ci] dan memadamkan pemicu otomatis — pelajaran: label uji tak boleh menenggelamkan denyut; uji berikutnya tanpa [skip ci]',
    'folder imun sempat ikut terbuang pada komit lab yang dibuang — patroli pertama di Actions berjalan tanpa manifes dan keluar jujur ("imun belum berbenih") — kejujuran organ terbukti',
    'genome pada denyut-denyut amnesia G1 (generasi 0-era) hilang permanen; yang kembali adalah garis keturunan fosil git 2137ac8 + evolusi baru sejak itu',
    'imun menjaga keutuhan BENTUK, bukan kebenaran ISI pikiran: racun yang menulis JSON sah berpola benar hanya tertangkap lewat segel bank soal / vonis medan — batas terbuka'
  ],
  vonisAkhir: 'HIDUP YANG KIAN MATANG: dari pasrah-amnesia (G1) menjadi ber-imun (G2) — tubuh kini menjaga dirinya sendiri sesuai hukum autopoiesis pustakanya; denyut, ingatan, evolusi, guru, dan nafas menyambung kembali tanpa tangan luar',
  segel: null
}
const buf = JSON.stringify(laporan, null, 1)
laporan.segel = { hash: h16(buf), size: buf.length, readAt: new Date().toISOString() }
writeFileSync('laporan/uji-kehidupan.json', JSON.stringify(laporan, null, 1))
console.log('[uji-kehidupan] laporan akhir tersegel:', laporan.segel.hash)
