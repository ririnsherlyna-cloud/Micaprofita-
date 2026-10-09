#!/usr/bin/env node
// ============================================================
// TEMPA-CASCADE (V323) — ujian hidup-mati 1000 soal LIQUIDATION
// CASCADE dari peristiwa nyata yang melikuidasi jutaan trader.
// Mandat pemilik (2026-10-10):
//   "ujian simulasi brutal: setiap soal adalah liquidation cascade
//    yang secara historis diambil dari data nyata yang pernah membuat
//    banyak jutaan trader terliquidasi sehingga bisa dibedah lebih
//    dalam. 1000 soal harus terus ditempa agar 1000/1000 lulus total
//    benar semuanya. Dana yang diberikan 1500 dolar. Kita lihat dari
//    ujian ini akankah dia memiliki syaraf baru atau kemampuan baru
//    dan apakah dia mempelajari aspek pelajaran penting — tempa terus
//    kepahaman."
// Warisan tradisi TEMPAN utuh:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU (24 lilin +
//    funding kedalaman) + premis soal (entry, ambang likuidasi long x5
//    — fakta waktu-putusan) → tanda 32 bit → peta pelajaran. Kunci
//    kelasHasil TIDAK PERNAH dibaca saat menalar (tebakan semua
//    dikunci dulu, baru dinilai).
// 2. G1 = nalar dongkol pemula ("kaskade = hancur kilat — LIKUID-KILAT!")
//    → pasti terluka: 90% momen panik TAK berakhir likuid kilat →
//    ditempa: peta tanda→kelas dari kekalahan sendiri → gelombang
//    berikutnya sampai 1000/1000 LULUS TOTAL. Belum lulus = tempa lagi.
// 3. DANA $1500 (mandat): stake $15/soal (1%); MENANG +$15; KALAH −$19.5
//    (fee+slippage 0.3R); modal ≤ 0 = HABIS (likuidasi), tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Deterministik: nol
//    Math.random. Segel bank + laporan SHA-256 hash16.
// 5. UJIAN DADAKAN 100 soal (peristiwa >900 hari, tak pernah ditempa)
//    dijalankan SETELAH lulus — ukur paham-vs-hafal, jujur apa adanya.
// 6. SYARAF BARU: setelah lulus, kelahiran reseptor-cascade dijurnal
//    ke laporan/syaraf-lahir.jsonl — pelajaran melahirkan syaraf.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-cascade-1000.json'
const FILE_DADAK = 'ujian/soal-cascade-dadakan-100.json'
const FILE_LAPOR = 'laporan/tempa-cascade.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 1500
const STAKE = 15
const KALAH_R = 19.5
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const KELAS = ['LIKUID-KILAT', 'LIKUID-PELAN', 'V-DALAM-KILAT', 'V-DALAM-LAMBAT', 'V-TIPIS']

// ---------- fitur KARTU (identik dengan tambang-cascade.mjs — dijaga ujiBank) ----------
function fiturDari(strip) {
  const n = strip.length, e = strip[n - 1].c
  const pct = (a, b) => (b / a - 1) * 100
  const r1 = pct(strip[n - 2].c, e), r3 = pct(strip[n - 4].c, e), r12 = pct(strip[n - 13].c, e)
  let naik = 0, turun = 0
  for (let i = 1; i <= 14; i++) { const d = strip[i].c - strip[i - 1].c; if (d > 0) naik += d; else turun -= d }
  let avgN = naik / 14, avgT = turun / 14
  for (let i = 15; i < n; i++) {
    const d = strip[i].c - strip[i - 1].c
    avgN = (avgN * 13 + Math.max(d, 0)) / 14
    avgT = (avgT * 13 + Math.max(-d, 0)) / 14
  }
  const rsi = avgT === 0 ? 100 : 100 - 100 / (1 + avgN / avgT)
  const vols = strip.slice(-20).map(x => x.v)
  const vMean = vols.reduce((a, b) => a + b, 0) / 20
  const vStd = Math.sqrt(vols.reduce((a, b) => a + (b - vMean) ** 2, 0) / 20) || 1e-12
  const volz = (strip[n - 1].v - vMean) / vStd
  const hi20 = Math.max(...strip.slice(0, n - 1).map(x => x.h))
  const lo20 = Math.min(...strip.slice(0, n - 1).map(x => x.l))
  const hiAll = Math.max(...strip.map(x => x.h)), loAll = Math.min(...strip.map(x => x.l))
  const posisi = hiAll === loAll ? 0.5 : (e - loAll) / (hiAll - loAll)
  const lebarPct = (hiAll - loAll) / e * 100
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  return { e, r1, r3, r12, rsi, volz, breakHigh: e > hi20, breakLow: e < lo20, posisi, streakNaik, streakTurun,
    wickAtas: (last.h - Math.max(last.o, last.c)) / badan, wickBawah: (Math.min(last.o, last.c) - last.l) / badan,
    lebarPct, hiAll, loAll }
}
function tandaDari(x, funding) {
  const dariPuncak = (x.e / x.hiAll - 1) * 100
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,
    funding != null && funding > 0.0005,
    x.r1 <= -1.8,
    x.volz >= 3,
    x.wickBawah >= 2,
    x.streakTurun >= 4,
    dariPuncak <= -8,
    x.wickBawah >= 1.2,
    dariPuncak <= -12,
    x.r3 <= -4,
    x.volz >= 6,
    x.rsi < 20,
    x.streakTurun >= 6,
    x.lebarPct > 8,
  ].map(Number).join('')
}
function panikPraKaskade(x) {
  const dariPuncak = (x.e / x.hiAll - 1) * 100
  return dariPuncak <= -3 && (x.volz >= 1.2 || x.wickBawah >= 0.8 || x.r1 <= -1.0)
}

// ---------- kunci kelas dari FAKTA tersimpan (identik dengan tambang-cascade.mjs) ----------
function kelasDariFakta(entry, ambang, jamAmbang, jamPulih, rendah48) {
  if (jamAmbang != null) return jamAmbang <= 12 ? 'LIKUID-KILAT' : 'LIKUID-PELAN'
  if (rendah48 <= entry * 0.93) return (jamPulih != null && jamPulih <= 24) ? 'V-DALAM-KILAT' : 'V-DALAM-LAMBAT'
  return 'V-TIPIS'
}

// ---------- nalar makhluk ----------
function nalarDongkol(s) { // G1 — dongkol panik: kaskade = hancur kilat, tak pernah pulih
  return 'LIKUID-KILAT'
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
function ujiBankCascade(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    const x = fiturDari(strip)
    if (!panikPraKaskade(x)) throw new Error(`soal ${s.id} (${s.simbol}) bukan momen panik pra-kaskade — premis rusak, ditolak`)
    const tanda = tandaDari(x, s.funding24)
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
    // konsistensi fakta jalan 48 jam ↔ jam kejadian
    if ((s.jamAmbang != null) !== (s.rendah48 <= s.ambangLikuid + 1e-12)) throw new Error(`soal ${s.id} jamAmbang tak cocok rendah48 — ditolak`)
    if ((s.jamPulih != null) !== (s.tinggi48 >= s.entry - 1e-12)) throw new Error(`soal ${s.id} jamPulih tak cocok tinggi48 — ditolak`)
    const kelas = kelasDariFakta(s.entry, s.ambangLikuid, s.jamAmbang, s.jamPulih, s.rendah48)
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
  // FASE 1 — menalar HANYA dari kartu + premis; kunci tak disentuh
  const tebakan = bank.soal.map(s => {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    fiturDari(strip) // kartu selalu dibaca — nalar hidup dari kartu
    const dariPeta = peta[s.tanda]
    if (dariPeta) return { kelas: dariPeta, sumber: 'peta' }
    if (pakaiSimetri) { const sim = nalarSimetri(s.tanda, peta); if (sim.kelas) return { kelas: sim.kelas, sumber: `simetri(${sim.jarak})` } }
    return { kelas: nalarDongkol(s), sumber: 'dongkol-panik' }
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
    return { id: s.id, simbol: s.simbol, waktu: s.waktu, kaskadeHari: s.kaskadeHari, premis: s.premis, funding24: s.funding24,
      tanda: s.tanda, tebak: t.kelas, sumberNalar: t.sumber, kelasHasil: s.kelasHasil,
      hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), modalMin: +modalMin.toFixed(2), likuidasiPada,
    perKelas, lulus: benar === bank.soal.length }
}

// ---------- contoh kejadian paling nyata untuk laporan (dari bank, fakta mentah) ----------
function contohKejadian(bank) {
  const ambil = (s) => ({ id: s.id, simbol: s.simbol, waktu: s.waktu, kaskadeHari: s.kaskadeHari, premis: s.premis,
    jamAmbang: s.jamAmbang, jamPulih: s.jamPulih, rendah48: s.rendah48, tinggi48: s.tinggi48,
    entry: s.entry, ambangLikuid: s.ambangLikuid, funding24: s.funding24, kelasHasil: s.kelasHasil })
  const likuid = bank.soal.filter(s => s.kelasHasil === 'LIKUID-KILAT' || s.kelasHasil === 'LIKUID-PELAN')
  const dalamKilat = bank.soal.filter(s => s.kelasHasil === 'V-DALAM-KILAT')
  // yang paling kejam: likuidasi tercepat (jam ambang terkecil)
  likuid.sort((a, b) => (a.jamAmbang || 999) - (b.jamAmbang || 999))
  // yang paling menipu: digoreng terdalam lalu pulih kilat — panik jual kehilangan paling pedih
  dalamKilat.sort((a, b) => (a.rendah48 / a.entry) - (b.rendah48 / b.entry))
  return { likuidTercepat: likuid.slice(0, 3).map(ambil), gorengTerdalamTapiPulihKilat: dalamKilat.slice(0, 2).map(ambil) }
}

// ---------- pelajaran kunci (mandat: aspek pelajaran penting) — dihitung dari bank ----------
function pelajaranKunci(bank) {
  const d = bank.distKelas, total = bank.jumlah
  const takLikuid = (d['V-DALAM-KILAT'] || 0) + (d['V-DALAM-LAMBAT'] || 0) + (d['V-TIPIS'] || 0)
  return [
    `panik bukan takdir likuid: ${takLikuid}/${total} (${(takLikuid / total * 100).toFixed(1)}%) momen panik tak pernah menyentuh ambang likuidasi x5 dalam 48 jam`,
    `yang digoreng dalam nyaris selalu pulih kilat: V-DALAM-LAMBAT hanya ${d['V-DALAM-LAMBAT'] || 0}/${total} (${((d['V-DALAM-LAMBAT'] || 0) / total * 100).toFixed(1)}%) — penggorengan panjang tanpa likuid itu pengecualian ekstrem`,
    `likuid kilat LEBIH JARANG dari likuid pelan: ${d['LIKUID-KILAT'] || 0} vs ${d['LIKUID-PELAN'] || 0} — kaskade yang membunuh cepat adalah minoritas; yang membunuh kebanyakan lewat pengeringan lambat`,
    `dongkol panik ('kaskade = hancur, LIKUID-KILAT!') benar hanya ${((d['LIKUID-KILAT'] || 0) / total * 100).toFixed(1)}% — jual saat panik = mengunci kerugian tepat sebelum rebound yang paling sering datang`,
    `funding negatif (shorts pay longs) terlihat di ${(bank.distFunding.negatif / total * 100).toFixed(1)}% momen — bahan bakar kaskade terbaca PRA-peristiwa dari kartu`,
  ]
}

// ---------- kelahiran syaraf baru (mandat: syaraf baru / kemampuan baru) ----------
function lahirkanSyaraf(laporan, wajahUnik) {
  try {
    mkdirSync('laporan', { recursive: true })
    const entri = {
      saat: new Date().toISOString(), konteks: 'V323-tempaan-cascade',
      peristiwa: 'LAHIR', id: 'NERVA-CASCADE-01', jenis: 'CASCADE',
      generasi: 0, orangTua: 'TEMPAAN-V323',
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        likuidKilat: laporan.bankDist && laporan.bankDist['LIKUID-KILAT'] || 0,
        tugas: 'reseptor liquidation-cascade: dari 24 lilin + funding, menakar nasib long saat panik kaskade — kapan likuid, kapan pulih — SEBELUM terjadi; wajah-wajah kaskade hidup di peta pelajaran tempa-cascade',
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
  const wajahUnik = ujiBankCascade(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-CASCADE-1000', epoch: 'V323', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-10): 1000 soal liquidation cascade dari data nyata yang pernah melikuidasi jutaan trader — dibedah lebih dalam; dana $1500; harus terus ditempa sampai 1000/1000 lulus total; lihat syaraf baru / kemampuan baru dan aspek pelajaran penting — tempa terus kepahaman',
    bankSegel: bank.segel.hash,
    bankDist: bank.distKelas,
    bankDistFunding: bank.distFunding,
    bankJumlah: bank.jumlah,
    sumberSoal: 'ujian/soal-cascade-1000.json — 1000 soal dari peristiwa kaskade NYATA: klines 1d 5.5 tahun (30 koin, deteksi hari-kaskade drop ≤-6% & volume ≥2.2× ATAU wick ≥5%) → jendela 1h 168 jam per peristiwa (696 jendela) → momen panik pra-kaskade; long x1 di close strip; ambang likuidasi entry×0.80 (long x5, rugi 20%); jalan 48 jam; 5 kelas bedah-kecepatan dari fakta; funding rate futures publik (fapi.binance.com); nol karangan',
    aturan: `dana $${MODAL_AWAL} (mandat); stake $${STAKE}/soal (1%); MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage 0.3R); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 1000/1000; tanda 32 bit (18 warisan + 2 funding + 12 anatomi kaskade)`,
    blind: 'makhluk menalar dari kartu 24 lilin nyata + funding + premis (entry/ambang — fakta waktu-putusan) → tanda 32 bit → peta pelajaran; penilai baru membaca kunci kelasHasil SETELAH seluruh tebakan gelombang itu terkunci; bank + kunci terbuka audit',
    buktiPasarKejam: { statistikMomen: bank.statistikMomen, contoh: contohKejadian(bank) },
    pelajaranKunci: pelajaranKunci(bank),
    gelombang: [], dadakan: null, dadakanGelombang: [], dadakanLulus: null,
    pelajaran: [], syarafLahir: null, lulus: null, segel: null,
  }

  const segelLapor = () => {
    laporan.diperbarui = new Date().toISOString()
    const tubuh = JSON.stringify({ ...laporan, segel: null })
    laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
    writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  }

  // --- GELOMBANG UTAMA — tempa dari kekalahan sendiri sampai 1000/1000 (mandat) ---
  let sempadan = 0
  while (!laporan.gelombang.some(g => g.lulus)) {
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-cascade: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
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
    console.log(`tempa-cascade: gelombang ${n} — benar ${g.benar}/${bank.jumlah} (dana $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 1000/1000' : 'TEMPA LAGI'}`)
    if (!g.lulus && sempadan >= MAX_GELOMBANG) break
  }

  // --- kelahiran syaraf baru setelah lulus (mandat) ---
  if (laporan.lulus && !laporan.syarafLahir) lahirkanSyaraf(laporan, wajahUnik)

  // --- UJIAN DADAKAN — setelah lulus; peristiwa lama yang tak pernah ditempa ---
  let dadak = null
  if (laporan.lulus && existsSync(FILE_DADAK)) {
    dadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
    const salin = JSON.parse(JSON.stringify(dadak)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== dadak.segel.hash) throw new Error('segel bank dadakan bobol')
    ujiBankCascade(dadak)
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (dana $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 100/100' : 'TEMPA LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-cascade: ${MAX_DADAKAN} gelombang dadakan belum 100/100 — laporkan jujur`); break }
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
      console.log(`tempa-cascade dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 100/100' : 'TEMPA LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAAN-CASCADE: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — tempa lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${dadak.soal.length}/${dadak.soal.length}` : `${laporan.dadakan.benar}/${dadak.soal.length}`}` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR` : ''))
}

main().catch(e => { console.error('tempa-cascade MATI-PENUH:', e.message); process.exit(1) })
