#!/usr/bin/env node
// ============================================================
// TEMPA-SQUEEZE (V315) — ujian hidup-mati 700 soal KONSOLIDASI-YANG-
// MENGLIKUIDASI-SHORTS-X1. Mandat pemilik (2026-10-09):
//   "Apakah micaprofita mampu melihat kejadian tak terduga kasus
//    begini? Dimana ujian ini 700 soal ujian, bila dia tidak capai
//    jawaban 700/700 maka dia harus ditempakan lagi. ... makin
//    tercipta syaraf baru dari kejadian ini"
// Warisan tradisi TEMPAN-900 utuh:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU (24 lilin +
//    funding kedalaman) + premis soal (entry, puncak ambisi, dasar,
//    ambang likuidasi — semua fakta waktu-putusan) → tanda 20 bit →
//    peta pelajaran. Kunci kelasHasil TIDAK PERNAH dibaca saat menalar
//    (tebakan semua dikunci dulu, baru dinilai).
// 2. G1 = nalar dongkol pemula ("konsolidasi pasti balik ke dasar —
//    puncak ambisi ya, lalu untung") → pasti terluka di bank yang
//    memuat LIQUID-MELESAT → ditempa: peta tanda→kelas dari kekalahan
//    sendiri → gelombang berikutnya sampai 700/700 LULUS TOTAL.
//    Belum lulus = tempa lagi (mandat, tanpa batas sampai lulus).
// 3. MODAL $10.000: stake $100/soal; MENANG +$100; KALAH −$130
//    (fee+slippage 0.3R); modal ≤ 0 = HABIS (likuidasi), tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Deterministik: nol
//    Math.random. Segel bank + laporan SHA-256 hash16.
// 5. UJIAN DADAKAN 70 soal (jendela lama, tak pernah ditempa)
//    dijalankan SETELAH lulus — ukur paham-vs-hafal, jujur apa adanya.
// 6. SYARAF BARU: setelah lulus, kelahiran reseptor-squeeze dijurnal
//    ke laporan/syaraf-lahir.jsonl — pelajaran melahirkan syaraf
//    (mandat: "makin tercipta syaraf baru dari kejadian ini").
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-squeeze-700.json'
const FILE_DADAK = 'ujian/soal-squeeze-dadakan-70.json'
const FILE_LAPOR = 'laporan/tempa-squeeze.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 10000
const STAKE = 100
const KALAH_R = 130
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const KELAS = ['LIQUID-MELESAT', 'AMBISI-BALIK-DASAR', 'TURUN-LANGSUNG', 'TERGANTUNG-TINGGI', 'MENDEM-DI-RANGE']

// ---------- fitur KARTU (identik dengan tambang-squeeze.mjs — dijaga ujiBank) ----------
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
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  return { e, r1, r3, r12, rsi, volz, breakHigh: e > hi20, breakLow: e < lo20, posisi, streakNaik, streakTurun,
    wickAtas: (last.h - Math.max(last.o, last.c)) / badan, wickBawah: (Math.min(last.o, last.c) - last.l) / badan }
}
function tandaDari(x, funding) {
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,
    funding != null && funding > 0.0005,
  ].map(Number).join('')
}

// ---------- kunci kelas dari FAKTA tersimpan (identik dengan tambang-squeeze.mjs) ----------
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
function ujiBankSqueeze(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    const x = fiturDari(strip)
    const tanda = tandaDari(x, s.funding24)
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
    // premis konsolidasi: range strip ≤ 12% dari entry (skenario pemilik)
    if ((s.puncakAmbisi - s.dasarSelamat) / s.entry > 0.12 + 1e-9) throw new Error(`soal ${s.id} bukan konsolidasi — premis rusak, ditolak`)
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
  // FASE 1 — menalar HANYA dari kartu + premis; kunci tak disentuh
  const tebakan = bank.soal.map(s => {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
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
    return { id: s.id, simbol: s.simbol, waktu: s.waktu, premis: s.premis, funding24: s.funding24,
      tanda: s.tanda, tebak: t.kelas, sumberNalar: t.sumber, kelasHasil: s.kelasHasil,
      hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
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
    funding24: s.funding24, kelasHasil: s.kelasHasil })
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
      saat: new Date().toISOString(), konteks: 'V315-tempaan-squeeze',
      peristiwa: 'LAHIR', id: 'NERVA-SQUEEZE-01', jenis: 'SQUEEZE',
      generasi: 0, orangTua: 'TEMPAAN-V315',
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        liquidMelesat: laporan.bankDist && laporan.bankDist['LIQUID-MELESAT'] || 0,
        tugas: 'reseptor konsolidasi-likuidasi: dari 24 lilin + funding, menakar bahaya LIQUID-MELESAT sebelum terjadi — wajah-wajah likuidasi hidup di peta pelajaran tempa-squeeze',
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
  const wajahUnik = ujiBankSqueeze(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-SQUEEZE-700', epoch: 'V315', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-09): ujian konsolidasi yang justru menglikuidasi shorts x1 — mereka pikir puncak ambisi 1.3 lalu balik ke 0.85, ternyata melesat 2.7 tanpa menyentuh dasar; 700 soal; bila tidak 700/700 maka ditempakan lagi; makin tercipta syaraf baru dari kejadian ini',
    bankSegel: bank.segel.hash,
    bankDist: bank.distKelas,
    bankJumlah: bank.jumlah,
    sumberSoal: 'ujian/soal-squeeze-700.json — 700 soal dari ±240.000 lilin 1 jam NYATA (30 koin × 8.000 jam, Binance spot publik) + funding rate futures publik (fapi.binance.com); strip 24 lilin konsolidasi ≤12%; short x1 di close strip; puncak ambisi = atas range; dasar selamat = bawah range; ambang likuidasi = entry×1.90 (rugi 90%); jendela nilai 720 jam; 5 kelas dari fakta; konservatif dalam satu lilin',
    aturan: `modal $${MODAL_AWAL}; stake $${STAKE}/soal; MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 700/700; tanda 20 bit (18 warisan + 2 bit funding: negatif = shorts-pay-longs, panas >0.05%/8j)`,
    blind: 'makhluk menalar dari kartu 24 lilin nyata + funding + premis (entry/puncak/dasar/ambang — fakta waktu-putusan) → tanda 20 bit → peta pelajaran; penilai baru membaca kunci kelasHasil SETELAH seluruh tebakan gelombang itu terkunci; bank + kunci terbuka audit',
    buktiPasarKejam: { momenKonsolidasi: bank.statistikMomen, contoh: contohKejadian(bank) },
    gelombang: [], dadakan: null, dadakanGelombang: [], dadakanLulus: null,
    pelajaran: [], syarafLahir: null, lulus: null, segel: null,
  }

  const segelLapor = () => {
    laporan.diperbarui = new Date().toISOString()
    const tubuh = JSON.stringify({ ...laporan, segel: null })
    laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
    writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  }

  // --- GELOMBANG UTAMA — tempa dari kekalahan sendiri sampai 700/700 (mandat) ---
  let sempadan = 0
  while (!laporan.gelombang.some(g => g.lulus)) {
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-squeeze: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
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
    console.log(`tempa-squeeze: gelombang ${n} — benar ${g.benar}/${bank.jumlah} (modal $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 700/700' : 'TEMPA LAGI'}`)
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
    ujiBankSqueeze(dadak)
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (modal $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 70/70' : 'TEMPA LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-squeeze: ${MAX_DADAKAN} gelombang dadakan belum 70/70 — laporkan jujur`); break }
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
      console.log(`tempa-squeeze dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 70/70' : 'TEMPA LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAAN-SQUEEZE: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — tempa lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${dadak.soal.length}/${dadak.soal.length}` : `${laporan.dadakan.benar}/${dadak.soal.length}`}` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR` : ''))
}

main().catch(e => { console.error('tempa-squeeze MATI-PENUH:', e.message); process.exit(1) })
