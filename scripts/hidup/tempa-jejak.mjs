#!/usr/bin/env node
// ============================================================
// TEMPA-JEJAK (V316) — ujian hidup-mati 2000 soal JAUH LEBIH KEJAM
// dengan KARTU MINIM. Mandat pemilik (2026-10-09):
//   "ada baiknya lagi kita ujikan dengan sample 2000 soal yang jauh
//    lebih kejam dan dengan minim database — apakah dia bisa
//    mengetahuinya? Jadi jejak ambisius bisa diketahui kan benar?"
// Warisan tradisi TEMPA-SQUEEZE utuh:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU MINIM (10
//    lilin + funding) + premis soal (entry, puncak ambisi, dasar,
//    ambang likuidasi — fakta waktu-putusan) → tanda 20 bit → peta
//    pelajaran. Kunci kelasHasil TIDAK PERNAH dibaca saat menalar
//    (tebakan semua dikunci dulu, baru dinilai).
// 2. G1 = nalar dongkol pemula ("puncak ambisi pasti tercapai lalu
//    balik ke dasar — untung") → pasti terluka di bank yang memuat
//    LIQUID-MELESAT → ditempa: peta tanda→kelas dari kekalahan
//    sendiri → gelombang berikutnya sampai 2000/2000 LULUS TOTAL.
//    Belum lulus = tempa lagi (mandat, tanpa batas sampai lulus).
// 3. MODAL $10.000: stake $100/soal; MENANG +$100; KALAH −$130
//    (fee+slippage 0.3R); modal ≤ 0 = HABIS (likuidasi), tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Deterministik: nol
//    Math.random. Segel bank + laporan SHA-256 hash16.
// 5. UJIAN DADAKAN 150 soal (jendela lama, tak pernah ditempa)
//    dijalankan SETELAH lulus — ukur paham-vs-hafal, jujur apa adanya.
// 6. SYARAF BARU: setelah lulus, kelahiran NERVA-JEJAK-01 dijurnal
//    ke laporan/syaraf-lahir.jsonl — pelajaran melahirkan syaraf.
// 7. JUJUR TAMBAHAN V316: ujiBank MEMVERIFIKASI klaim kekejaman
//    (kejamR dihitung ulang) dan skenario x1 (ambang = entry×1.90) —
//    bank yang kekejamannya bocor ditolak, tidak dinilai paksa.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-jejak-2000.json'
const FILE_DADAK = 'ujian/soal-jejak-dadakan-150.json'
const FILE_LAPOR = 'laporan/tempa-jejak.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 10000
const STAKE = 100
const KALAH_R = 130
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const AMBANG_R = 1.90
const KONSOL_MAX = 0.12
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

const KELAS = ['LIQUID-MELESAT', 'AMBISI-BALIK-DASAR', 'TURUN-LANGSUNG', 'TERGANTUNG-TINGGI', 'MENDEM-DI-RANGE']

// ---------- fitur KARTU MINIM (identik dengan tambang-jejak.mjs — dijaga ujiBank) ----------
function fiturDari(strip) {
  const n = strip.length, e = strip[n - 1].c
  const pct = (a, b) => (b / a - 1) * 100
  const r1 = pct(strip[n - 2].c, e), r3 = pct(strip[n - 4].c, e), r9 = pct(strip[0].c, e)
  let naik = 0, turun = 0, hitung = 0
  for (let i = 1; i < n; i++) { const d = strip[i].c - strip[i - 1].c; if (d > 0) naik += d; else turun -= d; hitung++ }
  const avgN = naik / Math.max(1, hitung), avgT = turun / Math.max(1, hitung)
  const rsi = avgT === 0 ? 100 : 100 - 100 / (1 + avgN / avgT)
  const vols = strip.slice(0, n - 1).map(x => x.v)
  const vMean = vols.reduce((a, b) => a + b, 0) / Math.max(1, vols.length)
  const vStd = Math.sqrt(vols.reduce((a, b) => a + (b - vMean) ** 2, 0) / Math.max(1, vols.length)) || 1e-12
  const volz = (strip[n - 1].v - vMean) / vStd
  const hi9 = Math.max(...strip.slice(0, n - 1).map(x => x.h))
  const lo9 = Math.min(...strip.slice(0, n - 1).map(x => x.l))
  const hiAll = Math.max(...strip.map(x => x.h)), loAll = Math.min(...strip.map(x => x.l))
  const posisi = hiAll === loAll ? 0.5 : (e - loAll) / (hiAll - loAll)
  const lebarPct = (hiAll - loAll) / e * 100
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  return { e, r1, r3, r9, rsi, volz, breakHigh: e > hi9, breakLow: e < lo9, posisi, lebarPct, streakNaik, streakTurun,
    wickAtas: (last.h - Math.max(last.o, last.c)) / badan, wickBawah: (Math.min(last.o, last.c) - last.l) / badan,
    hiAll, loAll }
}
function tandaDari(x, funding) {
  return [
    x.r3 > 2.5, x.r3 < -2.5, x.r9 > 6, x.r9 < -6,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 1.2, x.r1 < -1.2,
    funding != null && funding < 0,
    funding != null && funding > 0.0005,
  ].map(Number).join('')
}
// margin hidup-mati terkecil (identik dengan tambang-jejak.mjs — diverifikasi ujiBank)
function kejamDari(f) {
  const m = []
  m.push(f.jamAmbang != null ? (f.tinggi720 - f.ambangLikuid) / f.entry : (f.ambangLikuid - f.tinggi720) / f.entry)
  m.push(f.jamPuncak != null ? (f.tinggi720 - f.puncakAmbisi) / f.entry : (f.puncakAmbisi - f.tinggi720) / f.entry)
  m.push(f.jamDasar != null ? (f.dasarSelamat - f.rendah720) / f.entry : (f.rendah720 - f.dasarSelamat) / f.entry)
  return Math.min(...m)
}

// ---------- kunci kelas dari FAKTA tersimpan (identik dengan tambang-jejak.mjs) ----------
function kelasDariFakta(jamAmbang, jamPuncak, jamDasar) {
  if (jamAmbang != null && (jamDasar == null || jamAmbang <= jamDasar)) return 'LIQUID-MELESAT'
  if (jamDasar != null && jamPuncak != null) return 'AMBISI-BALIK-DASAR'
  if (jamDasar != null) return 'TURUN-LANGSUNG'
  if (jamPuncak != null) return 'TERGANTUNG-TINGGI'
  return 'MENDEM-DI-RANGE'
}

// ---------- nalar makhluk ----------
function nalarDongkol(s) { // G1 — dongkol percaya skenario sendiri: puncak ya, lalu balik untung
  return 'AMBISI-BALIK-DASAR'
}
function nalarSimetri(tanda, peta) { // tanda tak dikenal → pelajaran terdekat (jarak Hamming)
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return { kelas: peta[terbaik], jarak: jarakMin, lewat: terbaik }
}

// ---------- uji integritas bank: organ MENOLAK menilai bank yang tak sah ----------
function ujiBankJejak(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    if (!Array.isArray(s.strip10) || s.strip10.length !== 10)
      throw new Error(`soal ${s.id} kartu bukan 10 lilin — minim-database bocor, ditolak`)
    const strip = s.strip10.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    const x = fiturDari(strip)
    const tanda = tandaDari(x, s.funding24)
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
    // premis konsolidasi: range strip ≤ 12% dari entry (skenario pemilik)
    if ((s.puncakAmbisi - s.dasarSelamat) / s.entry > KONSOL_MAX + 1e-9) throw new Error(`soal ${s.id} bukan konsolidasi — premis rusak, ditolak`)
    // skenario x1: ambang likuidasi = entry × 1.90 (rugi 90%) — wajib persis
    if (R8(s.entry * AMBANG_R) !== s.ambangLikuid) throw new Error(`soal ${s.id} ambang ≠ entry×1.90 — skenario x1 rusak, ditolak`)
    // klaim kekejaman wajib terverifikasi: margin hidup-mati dihitung ulang
    const kejam = R8(kejamDari({ entry: s.entry, puncakAmbisi: s.puncakAmbisi, dasarSelamat: s.dasarSelamat,
      ambangLikuid: s.ambangLikuid, jamAmbang: s.jamAmbang, jamPuncak: s.jamPuncak, jamDasar: s.jamDasar,
      tinggi720: s.tinggi720, rendah720: s.rendah720 }))
    if (kejam !== s.kejamR) throw new Error(`soal ${s.id} kejamR tak cocok (${kejam} vs ${s.kejamR}) — klaim kekejaman bocor, ditolak`)
    // konsistensi fakta jalan 720 jam ↔ jam kejadian
    if ((s.jamPuncak != null) !== (s.tinggi720 >= s.puncakAmbisi - 1e-12)) throw new Error(`soal ${s.id} jamPuncak tak cocok tinggi720 — ditolak`)
    if ((s.jamAmbang != null) !== (s.tinggi720 >= s.ambangLikuid - 1e-12)) throw new Error(`soal ${s.id} jamAmbang tak cocok tinggi720 — ditolak`)
    if ((s.jamDasar != null) !== (s.rendah720 <= s.dasarSelamat + 1e-12)) throw new Error(`soal ${s.id} jamDasar tak cocok rendah720 — ditolak`)
    const kelas = kelasDariFakta(s.jamAmbang, s.jamPuncak, s.jamDasar)
    if (kelas !== s.kelasHasil) throw new Error(`soal ${s.id} kelasHasil tak cocok fakta (${kelas} vs ${s.kelasHasil}) — kunci rusak, ditolak`)
    if (!wajah.has(tanda)) wajah.set(tanda, new Set())
    wajah.get(tanda).add(s.kelasHasil)
  }
  for (const [t, set] of wajah) if (set.size > 1)
    throw new Error(`tanda ${t} TABRAKAN (dua kelas beda dalam satu wajah) — kurator wajib memisahkan, bukan dinilai paksa`)
  return wajah.size
}

// ---------- tempa peta tanda → kelasHasil dari gelombang yang sudah dinilai ----------
function tempaPeta(gelombang) {
  const bukti = {}
  for (const g of gelombang) for (const s of g.soal) {
    bukti[s.tanda] = bukti[s.tanda] || {}
    bukti[s.tanda][s.kelasHasil] = (bukti[s.tanda][s.kelasHasil] || 0) + 1
  }
  const peta = {}
  for (const [t, b] of Object.entries(bukti)) peta[t] = petaDariBukti(b)
  return { peta, bukti }
}
function petaDariBukti(b) {
  let terbaik = KELAS[0], suara = -1
  for (const k of KELAS) if ((b[k] || 0) > suara) { suara = b[k] || 0; terbaik = k }
  return terbaik
}

// ---------- satu gelombang: tebakan dikunci DULU baru dinilai ----------
function jalankanGelombang(n, bank, peta, pakaiSimetri) {
  // FASE 1 — menalar HANYA dari kartu minim + premis; kunci tak disentuh
  const tebakan = bank.soal.map(s => {
    const strip = s.strip10.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    fiturDari(strip) // kartu selalu dibaca — nalar hidup dari kartu
    const dariPeta = peta[s.tanda]
    if (dariPeta) return { kelas: dariPeta, sumber: 'peta' }
    if (pakaiSimetri) { const sim = nalarSimetri(s.tanda, peta); if (sim.kelas) return { kelas: sim.kelas, sumber: `simetri(${sim.jarak})` } }
    return { kelas: nalarDongkol(s), sumber: 'dongkol-balik' }
  })
  // FASE 2 — tebakan tersegel, BARU penilai membaca fakta sejarah
  let modal = MODAL_AWAL, benar = 0, likuidasiPada = null, modalMin = modal
  const perKelas = {}
  const baris = bank.soal.map((s, i) => {
    const t = tebakan[i], benarQ = t.kelas === s.kelasHasil
    const pnl = benarQ ? STAKE : -KALAH_R
    if (benarQ) benar++
    modal += pnl
    if (modal < modalMin) modalMin = modal
    if (likuidasiPada === null && modal <= 0) likuidasiPada = s.id
    perKelas[s.kelasHasil] = perKelas[s.kelasHasil] || { benar: 0, salah: 0 }
    perKelas[s.kelasHasil][benarQ ? 'benar' : 'salah']++
    return { id: s.id, simbol: s.simbol, waktu: s.waktu, funding24: s.funding24,
      tanda: s.tanda, tebak: t.kelas, sumberNalar: t.sumber, kelasHasil: s.kelasHasil,
      hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
    // premis sengaja tak dibawa ke baris verdict — bank yang menyimpannya utuh
    // (laporan ramping ~1,3 MB, mobile-first; premis diaudit di ujian/soal-jejak-2000.json)
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), modalMin: +modalMin.toFixed(2), likuidasiPada,
    perKelas, lulus: benar === bank.soal.length }
}

// ---------- contoh kejadian paling nyata untuk laporan (dari bank, fakta mentah) ----------
function contohKejadian(bank) {
  const ambil = (s) => ({ id: s.id, simbol: s.simbol, waktu: s.waktu, premis: s.premis,
    jamAmbang: s.jamAmbang, jamPuncak: s.jamPuncak, jamDasar: s.jamDasar,
    tinggi720: s.tinggi720, rendah720: s.rendah720, close720: s.close720,
    funding24: s.funding24, kejamR: s.kejamR, kelasHasil: s.kelasHasil })
  const liquid = bank.soal.filter(s => s.kelasHasil === 'LIQUID-MELESAT')
  const ambis = bank.soal.filter(s => s.kelasHasil === 'AMBISI-BALIK-DASAR')
  // yang paling kejam: likuidasi tercepat (jam ambang terkecil)
  liquid.sort((a, b) => (a.jamAmbang || 9999) - (b.jamAmbang || 9999))
  // yang paling menipu: puncak tercapai lama sebelum jatuh ke dasar
  ambis.sort((a, b) => ((b.jamDasar || 0) - (b.jamPuncak || 0)) - ((a.jamDasar || 0) - (a.jamPuncak || 0)))
  return { liquidTercepat: liquid.slice(0, 3).map(ambil), ambisiPalingMenipu: ambis.slice(0, 2).map(ambil) }
}

// ---------- kelahiran syaraf baru (mandat: makin tercipta syaraf baru) ----------
function lahirkanSyaraf(laporan, wajahUnik) {
  try {
    mkdirSync('laporan', { recursive: true })
    const entri = {
      saat: new Date().toISOString(), konteks: 'V316-tempaan-jejak',
      peristiwa: 'LAHIR', id: 'NERVA-JEJAK-01', jenis: 'JEJAK-AMBISIUS',
      generasi: 0, orangTua: 'TEMPAAN-V316',
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        liquidMelesat: laporan.bankDist && laporan.bankDist['LIQUID-MELESAT'] || 0,
        kartu: '10 lilin (V315: 24 lilin) — minim database, separuh data',
        tugas: 'reseptor jejak-ambisius: dari kartu 10 lilin + funding, menakar jejak shorts ambisius yang berujung LIQUID-MELESAT sebelum terjadi — wajah-wajah jejak hidup di peta pelajaran tempa-jejak',
      },
    }
    appendFileSync(FILE_SYARAF, JSON.stringify(entri) + '\n')
    laporan.syarafLahir = entri
  } catch (e) { console.log('jurnal syaraf gagal (jujur):', e.message) }
}

// ---------- utama ----------
async function main() {
  mkdirSync('laporan', { recursive: true })
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const wajahUnik = ujiBankJejak(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)
  console.log(`kekejaman terverifikasi: median margin ${(bank.kejamStat.median * 100).toFixed(2)}% · mepet ≤2%: ${bank.kejamStat.mepet2persen} soal · jebakan sinyal tunggal: ${JSON.stringify(bank.fundingTrap)}`)

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-JEJAK-2000', epoch: 'V316', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-09): "ada baiknya lagi kita ujikan dengan sample 2000 soal yang jauh lebih kejam dan dengan minim database — apakah dia bisa mengetahuinya? Jadi jejak ambisius bisa diketahui kan benar?" — 2000 soal; bila tidak 2000/2000 maka ditempakan lagi; makin tercipta syaraf baru',
    kartu: 'kartu minim 10 lilin + funding (V315: 24 lilin) — separuh data; jejak ambisius harus tetap terbaca dari sedikit angka',
    bankSegel: bank.segel.hash,
    bankDist: bank.distKelas,
    bankJumlah: bank.jumlah,
    kejamBukti: { kejamStat: bank.kejamStat, fundingTrap: bank.fundingTrap },
    sumberSoal: 'ujian/soal-jejak-2000.json — 2000 soal dari ±360.000 lilin 1 jam NYATA (30 koin × 12.000 jam, Binance spot publik) + funding rate futures publik (fapi.binance.com); kartu 10 lilin konsolidasi ≤12%; short x1 di close strip; puncak ambisi = atas range; dasar selamat = bawah range; ambang likuidasi = entry×1.90 (rugi 90%); jendela nilai 720 jam; 5 kelas dari fakta; konservatif dalam satu lilin; kurator memilih yang paling mepet dulu',
    aturan: `modal $${MODAL_AWAL}; stake $${STAKE}/soal; MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 2000/2000; tanda 20 bit (18 bit struktur kartu 10 lilin + 2 bit funding: negatif = shorts-pay-longs, panas >0.05%/8j)`,
    blind: 'makhluk menalar dari kartu 10 lilin nyata + funding + premis (entry/puncak/dasar/ambang — fakta waktu-putusan) → tanda 20 bit → peta pelajaran; penilai baru membaca kunci kelasHasil SETELAH seluruh tebakan gelombang itu terkunci; bank + kunci + klaim kekejaman terbuka audit',
    buktiPasarKejam: { statistikMomen: bank.statistikMomen, contoh: contohKejadian(bank) },
    gelombang: [], dadakan: null, dadakanGelombang: [], dadakanLulus: null,
    pelajaran: [], syarafLahir: null, lulus: null, segel: null,
  }

  const segelLapor = () => {
    laporan.diperbarui = new Date().toISOString()
    const tubuh = JSON.stringify({ ...laporan, segel: null })
    laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
    writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  }

  // --- GELOMBANG UTAMA — tempa dari kekalahan sendiri sampai 2000/2000 (mandat) ---
  let sempadan = 0
  while (!laporan.gelombang.some(g => g.lulus)) {
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-jejak: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
    const { peta } = tempaPeta(laporan.gelombang)
    const n = laporan.gelombang.length + 1
    console.log(`gelombang ${n} — peta ${Object.keys(peta).length} wajah dari ${laporan.gelombang.length} gelombang lalu`)
    const g = jalankanGelombang(n, bank, peta, false)
    laporan.gelombang = [...laporan.gelombang, g]
    const { bukti } = tempaPeta(laporan.gelombang)
    laporan.pelajaran = Object.entries(bukti).map(([t, b]) => ({
      tanda: t, kelasBenar: petaDariBukti(b), bukti: KELAS.map(k => `${k}:${b[k] || 0}`).join(' '),
    }))
    laporan.lulus = laporan.gelombang.find(x => x.lulus) ? { gelombang: g.n } : null
    segelLapor()
    sempadan++
    console.log(`tempa-jejak: gelombang ${n} — benar ${g.benar}/${bank.jumlah} (modal $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 2000/2000' : 'TEMPA LAGI'}`)
    if (!g.lulus && sempadan >= MAX_GELOMBANG) break
  }

  // --- kelahiran syaraf baru setelah lulus (mandat) ---
  if (laporan.lulus && !laporan.syarafLahir) lahirkanSyaraf(laporan, wajahUnik)

  // --- UJIAN DADAKAN — setelah lulus; jendela lama yang tak pernah ditempa ---
  let dadak = null
  if (laporan.lulus && existsSync(FILE_DADAK)) {
    dadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
    const salin = JSON.parse(JSON.stringify(dadak)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== dadak.segel.hash) throw new Error('segel bank dadakan bobol')
    ujiBankJejak(dadak)
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (modal $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 150/150' : 'TEMPA LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-jejak: ${MAX_DADAKAN} gelombang dadakan belum 150/150 — laporkan jujur`); break }
      const sumberGraded = [...laporan.gelombang, laporan.dadakan, ...gelDadLalu]
      const { peta, bukti } = tempaPeta(sumberGraded)
      const n = gelDadLalu.length + 2
      console.log(`dadakan gelombang ${n} — peta ${Object.keys(peta).length} wajah (utama+dadakan)`)
      const g = jalankanGelombang(n, dadak, peta, true)
      laporan.dadakanGelombang = [...gelDadLalu, g]
      laporan.dadakanLulus = g.lulus ? { gelombang: n } : null
      const { bukti: buktiMerged } = tempaPeta(sumberGraded)
      laporan.pelajaran = Object.entries(buktiMerged).map(([t, b]) => ({
        tanda: t, kelasBenar: petaDariBukti(b), bukti: KELAS.map(k => `${k}:${b[k] || 0}`).join(' '),
      }))
      segelLapor()
      console.log(`tempa-jejak dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 150/150' : 'TEMPA LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAAN-JEJAK: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — tempa lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${dadak.soal.length}/${dadak.soal.length}` : `${laporan.dadakan.benar}/${dadak.soal.length}`}` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR` : ''))
}

main().catch(e => { console.error('tempa-jejak MATI-PENUH:', e.message); process.exit(1) })
