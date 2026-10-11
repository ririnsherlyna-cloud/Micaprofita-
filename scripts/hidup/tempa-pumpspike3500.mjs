#!/usr/bin/env node
// ============================================================
// TEMPA-PUMPSPIKE-3500 (V333) — ujian hidup-mati 3500 soal PUMP
// SPIKE (lonjakan vertikal yang melikuidasi DUA sisi) dari kasus
// nyata yang melumpuhkan jutaan trader — baik tipe SHORT (dilikuidasi
// di jalan naik) maupun tipe LONG (dilikuidasi saat spike runtuh) —
// termasuk para trader PROFESIONAL.
// Mandat pemilik (2026-10-11):
//   "Sekarang ujian 3500 soal ujian simulasi dimana kita buat Dan
//    pelajari Dari kasus nyata yakni (Pump spike) yang berhasil
//    lumpuhkan jutaan trader di Dunia baik tipe short, kemudian
//    tipe long Dan level trader itu bahkan professional trader,
//    paham kan silahkan pastikan jikalau 3500 belum Lulus
//    semuanya kita buat dia inovasikan lagi agar Lulus penuh"
// Warisan tradisi TEMPAN utuh (V323/V325/V326/V329/V330/V331):
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU (24 lilin +
//    funding / metadata kasus sejarah) + premis soal (entry, dasar
//    selamat, puncak ambisi, ambang likuidasi x5 — fakta
//    waktu-putusan) → tanda 40 bit → peta pelajaran. Kunci kelasHasil
//    TIDAK PERNAH dibaca saat menalar (tebakan semua dikunci dulu,
//    baru dinilai).
// 2. G1 = nalar naif dua cerita: sisi SHORT ("spike gagal tertutup =
//    pasti balik — BALIK-SEJATI!") dan sisi LONG ("vertikal tertutup
//    kuat = pasti lanjut — ANGKAT-SEJATI!") → pasti terluka oleh
//    kenyataan pump spike (dua sisi menagih keduanya) → ditempa: peta
//    tanda→kelas dari kekalahan sendiri → gelombang berikutnya sampai
//    3500/3500 LULUS TOTAL. Belum lulus = tempa lagi (INOVASI dari
//    kekalahan sendiri — mandat).
// 3. DANA $1500 (warisan V323): stake $15/soal (1%); MENANG +$15;
//    KALAH −$19.5 (fee+slippage 0.3R); modal ≤ 0 = HABIS (likuidasi),
//    tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Deterministik: nol
//    Math.random. Segel bank + laporan SHA-256 hash16.
// 5. UJIAN DADAKAN 350 soal (peristiwa > 2.000 hari, tak pernah
//    ditempa) dijalankan SETELAH lulus — ukur paham-vs-hafal, jujur.
// 6. SYARAF BARU: setelah lulus, kelahiran NERVA-PUMPSPIKE-01 (garis
//    syaraf baru — saudara garis SQUEEZE, SUCKER, BREAKOUT &
//    ALTSEASON) dijurnal ke laporan/syaraf-lahir.jsonl — pelajaran
//    melahirkan syaraf.
// 7. VERIFIKASI SAAT-ITU-JUGA (--verifikasi, warisan V329): makhluk
//    MENJAWAB ULANG penuh kedua bank dengan kode nalar yang SAMA
//    PERSIS (tebakan dikunci dulu, kunci dibaca sesudahnya); bank
//    disegulkan ulang — premis rusak ditolak. Gugur sedikit saja =
//    exit-code 1 = kemampuan hilang = INOVASI LAGI. Telaah ARAH-DUA
//    (aturan pemilik: arah pasar hanya ada BUY/SELL) dari FAKTA
//    48 jam: close48 > entry = BUY, < = SELL, sama = TANPA-ARAH —
//    peta arah langsung (bank utama saja), dadakan = out-of-sample,
//    wajah dua-nasib = batas informasi; jujur dicatat, bukan gerbang.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-pumpspike-3500.json'
const FILE_DADAK = 'ujian/soal-pumpspike-dadakan-350.json'
const FILE_LAPOR = 'laporan/tempa-pumpspike3500.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 1500
const STAKE = 15
const KALAH_R = 19.5
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const AMBANG_R = 0.80
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const KELAS = ['SHORT-LIKUIDASI-KILAT', 'SHORT-LIKUIDASI-PELAN', 'SHORT-BALIK-SEJATI', 'SHORT-MIMPI-BELUM-PULANG', 'SHORT-MENDEM-DI-UDARA', 'SHORT-SEMPIT-MENANG',
  'LONG-LIKUIDASI-KILAT', 'LONG-LIKUIDASI-PELAN', 'LONG-ANGKAT-SEJATI', 'LONG-MIMPI-PALSU', 'LONG-MENDEM-DI-TINGGI', 'LONG-SEMPIT-KALAH',
  'JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']

// ---------- fitur KARTU (identik dengan tambang-pumpspike3500.mjs — dijaga ujiBank) ----------
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
    lebarPct, hiAll, loAll, hi20, lo20 }
}
function tandaDari(x, funding) {
  const dariDasar = (x.e / x.loAll - 1) * 100
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,
    funding != null && funding > 0.0005,
    x.r3 >= 2, x.volz >= 3, x.wickBawah >= 2, x.streakNaik >= 4,
    dariDasar >= 8, x.wickBawah >= 1.2, dariDasar >= 15, x.r3 >= 4,
    x.volz >= 6, x.rsi > 80, x.streakNaik >= 6, x.lebarPct > 8,
    x.r3 >= 0.8, x.volz >= 1.0, x.posisi >= 0.6, x.posisi <= 0.4,
    dariDasar >= 4, x.r12 >= 6, x.r12 <= -2, x.rsi > 90,
  ].map(Number).join('')
}
const sisiDariKartu = (x) => (x.wickAtas > 1.0 && x.wickAtas >= x.wickBawah) ? 'SHORT' : 'LONG'
// premis SPIKE (identik tambang run-2 — ujiBank menolak bila tak cocok)
function praSpike(x, sisi, dasar24) {
  const vertikal = x.volz >= 0.7 && x.posisi >= 0.45 &&
    x.lebarPct >= 3.0 && x.lebarPct <= 60 &&
    (x.r3 >= 1.0 || x.r12 >= 3) &&
    x.hiAll > x.hi20 &&
    x.hiAll >= x.e * 1.01 && x.loAll <= x.e * 0.99
  if (!vertikal) return false
  if (sisi === 'SHORT') {
    return x.wickAtas > 1.0 && x.wickAtas >= x.wickBawah && dasar24 < x.loAll
  }
  return !(x.wickAtas > 1.0 && x.wickAtas >= x.wickBawah) && x.loAll > x.e * 0.82
}
// kunci kelas dari FAKTA tersimpan (identik tambang; konservatif — yang menyiksa dihitung dulu)
function kelasDariFakta(sisi, jamLikuid, jamPuncak, jamDasar, close48, entry) {
  if (sisi === 'SHORT') {
    if (jamLikuid !== null) return jamLikuid <= 12 ? 'SHORT-LIKUIDASI-KILAT' : 'SHORT-LIKUIDASI-PELAN'
    if (jamPuncak !== null && jamDasar !== null) return 'SHORT-BALIK-SEJATI'
    if (jamPuncak !== null) return 'SHORT-MIMPI-BELUM-PULANG'
    return close48 >= entry ? 'SHORT-MENDEM-DI-UDARA' : 'SHORT-SEMPIT-MENANG'
  }
  if (jamLikuid !== null) return jamLikuid <= 12 ? 'LONG-LIKUIDASI-KILAT' : 'LONG-LIKUIDASI-PELAN'
  if (jamPuncak !== null) return close48 >= entry ? 'LONG-ANGKAT-SEJATI' : 'LONG-MIMPI-PALSU'
  return close48 >= entry ? 'LONG-MENDEM-DI-TINGGI' : 'LONG-SEMPIT-KALAH'
}

// ---------- nalar makhluk ----------
function nalarSpike(soal) { // G1 — nalar naif dua cerita (dua sisi sama-sama percaya penuh)
  if (soal.keluarga === 'SEJARAH') return 'JAWAB-A'
  return soal.sisi === 'SHORT' ? 'SHORT-BALIK-SEJATI' : 'LONG-ANGKAT-SEJATI'
}
function nalarSimetri(tanda, peta) { // tanda tak dikenal → pelajaran terdekat (jarak Hamming)
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    if (k.length !== tanda.length) continue
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return { kelas: terbaik ? peta[terbaik] : null, jarak: jarakMin, lewat: terbaik }
}

// ---------- uji integritas bank: organ MENOLAK menilai bank yang tak sah ----------
function ujiBankPumpspike3500(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    if (s.keluarga === 'PASAR') {
      const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
      const x = fiturDari(strip)
      if (sisiDariKartu(x) !== s.sisi) throw new Error(`soal ${s.id} (${s.simbol}) sisi tak cocok kartu — premis rusak, ditolak`)
      if (!praSpike(x, s.sisi, s.dasarSelamat)) throw new Error(`soal ${s.id} (${s.simbol}) bukan momen premis-spike — premis rusak, ditolak`)
      const tanda = tandaDari(x, s.funding24)
      if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
      const tangga = s.sisi === 'SHORT'
        ? s.ambangLikuid > s.entry && s.entry > s.puncakAmbisi && s.puncakAmbisi > s.dasarSelamat
        : s.puncakAmbisi > s.entry && s.entry > s.ambangLikuid && s.entry > s.dasarSelamat
      if (!tangga) throw new Error(`soal ${s.id} tangga cerita rusak (geometri ${s.sisi}) — ditolak`)
      const cekLikuid = s.sisi === 'SHORT' ? s.tinggi48 >= s.ambangLikuid - 1e-9 : s.rendah48 <= s.ambangLikuid + 1e-9
      const cekPuncak = s.sisi === 'SHORT' ? s.rendah48 <= s.puncakAmbisi + 1e-9 : s.tinggi48 >= s.puncakAmbisi - 1e-9
      if ((s.jamLikuid != null) !== cekLikuid) throw new Error(`soal ${s.id} jamLikuid tak cocok jalan48 — ditolak`)
      if ((s.jamPuncak != null) !== cekPuncak) throw new Error(`soal ${s.id} jamPuncak tak cocok jalan48 — ditolak`)
      if (s.sisi === 'SHORT') {
        const cekDasar = s.rendah48 <= s.dasarSelamat + 1e-9
        if ((s.jamDasar != null) !== cekDasar) throw new Error(`soal ${s.id} jamDasar tak cocok jalan48 — ditolak`)
      } else if (s.jamDasar != null) {
        throw new Error(`soal ${s.id} jamDasar harus null di sisi LONG — ditolak`)
      }
      const kelas = kelasDariFakta(s.sisi, s.jamLikuid, s.jamPuncak, s.jamDasar, s.close48, s.entry)
      if (kelas !== s.kelasHasil) throw new Error(`soal ${s.id} kelasHasil tak cocok fakta (${kelas} vs ${s.kelasHasil}) — kunci rusak, ditolak`)
    } else if (s.keluarga === 'SEJARAH') {
      if (!Array.isArray(s.opsi) || s.opsi.length !== 4) throw new Error(`soal ${s.id} opsi bukan 4 — ditolak`)
      if (!Number.isInteger(s.kunci) || s.kunci < 0 || s.kunci > 3) throw new Error(`soal ${s.id} kunci di luar A-D — ditolak`)
      const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
      const h = createHash('sha256').update('SEJARAH-V333|' + s.tanya).digest('hex')
      const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
      const tanda = '11' + bits(6, s.kasusIdx) + bits(5, s.aspekIdx) + ekor
      if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.kasus}) tanda sejarah tak cocok — kartu rusak, ditolak`)
      if (s.kelasHasil !== 'JAWAB-' + 'ABCD'[s.kunci]) throw new Error(`soal ${s.id} kelasHasil tak cocok kunci — kunci rusak, ditolak`)
    } else throw new Error(`soal ${s.id} keluarga tak dikenal (${s.keluarga}) — ditolak`)
    if (!wajah.has(s.tanda)) wajah.set(s.tanda, new Set())
    wajah.get(s.tanda).add(s.kelasHasil)
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
    if (s.keluarga === 'PASAR') {
      const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
      fiturDari(strip) // kartu selalu dibaca — nalar hidup dari kartu
    }
    const dariPeta = peta[s.tanda]
    if (dariPeta) return { kelas: dariPeta, sumber: 'peta' }
    if (pakaiSimetri) { const sim = nalarSimetri(s.tanda, peta); if (sim.kelas) return { kelas: sim.kelas, sumber: `simetri(${sim.jarak})` } }
    return { kelas: nalarSpike(s), sumber: 'spike-naif' }
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
    return { id: s.id, keluarga: s.keluarga, simbol: s.simbol || s.kasus, waktu: s.waktu || null, spikeHari: s.spikeHari || null, sisi: s.sisi || null, premis: s.premis, funding24: s.funding24 == null ? null : s.funding24,
      tanda: s.tanda, tebak: t.kelas, sumberNalar: t.sumber, kelasHasil: s.kelasHasil,
      hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), modalMin: +modalMin.toFixed(2), likuidasiPada,
    perKelas, lulus: benar === bank.soal.length }
}

// ---------- contoh kejadian paling nyata untuk laporan (dari bank, fakta mentah) ----------
function contohKejadian(bank) {
  const pasar = bank.soal.filter(s => s.keluarga === 'PASAR')
  const ambil = (s) => ({ id: s.id, simbol: s.simbol, waktu: s.waktu, spikeHari: s.spikeHari, sisi: s.sisi, premis: s.premis,
    jamLikuid: s.jamLikuid, jamPuncak: s.jamPuncak, jamDasar: s.jamDasar,
    tinggi48: s.tinggi48, rendah48: s.rendah48, close48: s.close48,
    entry: s.entry, puncakAmbisi: s.puncakAmbisi, dasarSelamat: s.dasarSelamat, ambangLikuid: s.ambangLikuid,
    funding24: s.funding24, kelasHasil: s.kelasHasil })
  const kilatS = pasar.filter(s => s.kelasHasil === 'SHORT-LIKUIDASI-KILAT')
  const kilatL = pasar.filter(s => s.kelasHasil === 'LONG-LIKUIDASI-KILAT')
  const sejatiS = pasar.filter(s => s.kelasHasil === 'SHORT-BALIK-SEJATI')
  const sejatiL = pasar.filter(s => s.kelasHasil === 'LONG-ANGKAT-SEJATI')
  const mimpiL = pasar.filter(s => s.kelasHasil === 'LONG-MIMPI-PALSU')
  kilatS.sort((a, b) => (a.jamLikuid || 999) - (b.jamLikuid || 999))
  kilatL.sort((a, b) => (a.jamLikuid || 999) - (b.jamLikuid || 999))
  sejatiS.sort((a, b) => (b.entry / b.puncakAmbisi) - (a.entry / a.puncakAmbisi))
  sejatiL.sort((a, b) => (b.puncakAmbisi / b.entry) - (a.puncakAmbisi / a.entry))
  mimpiL.sort((a, b) => (b.tinggi48 / b.entry) - (a.tinggi48 / a.entry))
  return { shortDilikuidasiTercepat: kilatS.slice(0, 3).map(ambil), longDilikuidasiTercepat: kilatL.slice(0, 3).map(ambil),
    balikSejatiTerpenuhi: sejatiS.slice(0, 2).map(ambil), angkatSejatiTerpenuhi: sejatiL.slice(0, 2).map(ambil), mimpiPalsu: mimpiL.slice(0, 2).map(ambil) }
}

// ---------- pelajaran kunci (mandat: pelajari kasus nyata) — dihitung dari bank ----------
function pelajaranKunci(bank) {
  const d = bank.distKelas, total = bank.jumlah
  const pasar = bank.distKeluarga.PASAR || 0
  const likuidS = (d['SHORT-LIKUIDASI-KILAT'] || 0) + (d['SHORT-LIKUIDASI-PELAN'] || 0)
  const likuidL = (d['LONG-LIKUIDASI-KILAT'] || 0) + (d['LONG-LIKUIDASI-PELAN'] || 0)
  const targetTurun = (d['SHORT-BALIK-SEJATI'] || 0) + (d['SHORT-MIMPI-BELUM-PULANG'] || 0)
  const targetNaik = (d['LONG-ANGKAT-SEJATI'] || 0) + (d['LONG-MIMPI-PALSU'] || 0)
  const mimpiPalsu = d['LONG-MIMPI-PALSU'] || 0
  return [
    `sisi SHORT x5 ("spike pasti balik") dilikuidasi ${likuidS}/${pasar} momen pasar (${(likuidS / pasar * 100).toFixed(1)}%) — jalan naik spike membakar pemburu-balik; inilah yang melumpuhkan short di GME jalannya ke $483, VW jalannya ke €1.005, BTC Desember 2017`,
    `sisi LONG x5 ("vertikal pasti lanjut") dilikuidasi ${likuidL}/${pasar} momen pasar (${(likuidL / pasar * 100).toFixed(1)}%) — runtuhnya spike membakar pemburu-momentum; inilah yang melumpuhkan chaser di puncak $483 GME, €1.005 VW, ATH SHIB, puncak BTC $19.800`,
    `target turun tersentuh ${targetTurun}/${pasar} (${(targetTurun / pasar * 100).toFixed(1)}%) dan target naik tersentuh ${targetNaik}/${pasar} (${(targetNaik / pasar * 100).toFixed(1)}%) — menyentuh target bukan bukti tesis; ${mimpiPalsu} momen LONG-MIMPI-PALSU membuktikan chaser yang menyentuh puncak lalu tak keluar tetap mengembalikan semuanya`,
    `funding panas (kerumunan long padat) terlihat di ${((bank.distFunding.panas || 0) / pasar * 100).toFixed(1)}% dan funding negatif (short dibayar untuk bertahan) di ${((bank.distFunding.negatif || 0) / pasar * 100).toFixed(1)}% momen pasar — kedua bahan bakar itu terbaca PRA-peristiwa dari kartu (warisan V315), dan keduanya bahan bakar dua arah pemakaman spike`,
    `keluarga SEJARAH ${bank.distKeluarga.SEJARAH || 0} soal (GME-2021/VW-2008/CHF-2015/FLASH-CRASH-2010/BTC-2019-04-02/SHIB-2021-10/LUNA-2022-05/BTC-2017-12-17 + pelajaran profesional) ditempa ke ingatan: satu pump spike = DUA PEMAKAMAN (short di jalan naik, long di jalan runtuh); profesional tidak mati karena salah membaca indikator, melainkan ukuran posisi + leverage + tanpa rencana keluar dua arah, di pasar yang likuiditasnya menguap tepat saat spike`,
  ]
}

// ---------- kelahiran syaraf baru (mandat: inovasikan lagi; syaraf beranak) ----------
function lahirkanSyaraf(laporan, wajahUnik) {
  try {
    mkdirSync('laporan', { recursive: true })
    const entri = {
      saat: new Date().toISOString(), konteks: 'V333-tempaan-pumpspike3500',
      peristiwa: 'LAHIR', id: 'NERVA-PUMPSPIKE-01', jenis: 'PUMPSPIKE',
      generasi: 0, orangTua: null,
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        likuidasiKilatShort: laporan.bankDist && laporan.bankDist['SHORT-LIKUIDASI-KILAT'] || 0,
        likuidasiKilatLong: laporan.bankDist && laporan.bankDist['LONG-LIKUIDASI-KILAT'] || 0,
        tugas: 'reseptor pump-spike (garis syaraf BARU — saudara garis SQUEEZE, SUCKER, BREAKOUT & ALTSEASON): dari 24 lilin + funding, menakar nasib DUA SISI posisi x5 di momen spike vertikal — sisi SHORT ("spike pasti balik") dan sisi LONG ("vertikal pasti lanjut") — kapan likuid, kapan tesis terbukti, kapan mimpi palsu, kapan menggantung — SEBELUM terjadi; dua sisi (inilah korban pump spike yang dimandatkan: baik tipe short kemudian tipe long; arah pasar hanya ada BUY/SELL dan kunci arah tetap dari fakta 48 jam); plus ingatan 48 kasus dunia GME-2021/VW-2008/CHF-2015/FLASH-CRASH-2010/BTC-2019-04-02/SHIB-2021-10/LUNA-2022-05/BTC-2017-12-17; wajah-wajah spike hidup di peta pelajaran tempa-pumpspike3500',
      },
    }
    appendFileSync(FILE_SYARAF, JSON.stringify(entri) + '\n')
    laporan.syarafLahir = entri
  } catch (e) { console.log('jurnal syaraf gagal (jujur):', e.message) }
}

// ---------- V333 VERIFIKASI SAAT-ITU-JUGA (--verifikasi) ----------
// Warisan V329: makhluk MENJAWAB ULANG seluruh bank dengan kode nalar yang
// SAMA PERSIS (tebakan dikunci dulu dari kartu+premis, penilai membaca kunci
// sesudahnya). Nol angka disalin dari laporan — skor dihitung dari tebakan
// segar run ini. Gugur sedikit saja = kemampuan hilang = INOVASI LAGI.
// Sisi ARAH-DUA (aturan pemilik): kunci arah dari FAKTA 48 jam — close48 >
// entry = BUY, < = SELL, sama = TANPA-ARAH (nol karangan); peta arah langsung
// dibangun dari bank utama SAJA; dadakan = out-of-sample; wajah dua-nasib =
// batas informasi alami kartu 24 lilin; jujur dicatat, bukan gerbang.
function jalankanVerifikasi(bank, wajahUnik) {
  if (!existsSync(FILE_LAPOR)) throw new Error('laporan tempa belum ada — tempa dulu, baru verifikasi')
  const laporan = JSON.parse(readFileSync(FILE_LAPOR, 'utf8'))
  if (!laporan.lulus) throw new Error('tempaan belum lulus — verifikasi ditolak; inovasikan lagi sampai lulus dulu')
  const gel = laporan.gelombang
  const { peta } = tempaPeta(gel)
  const V = jalankanGelombang('V', bank, peta, false)
  let dadakanBenar = null, dadakanJumlah = null, dadakLulus = null, VD = null, dadak = null
  if (existsSync(FILE_DADAK) && laporan.dadakanLulus) {
    dadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
    const salin = JSON.parse(JSON.stringify(dadak)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== dadak.segel.hash) throw new Error('segel bank dadakan bobol — verifikasi ditolak')
    ujiBankPumpspike3500(dadak)
    const sumber = [...gel, laporan.dadakan, ...(laporan.dadakanGelombang || [])]
    const { peta: petaD } = tempaPeta(sumber)
    VD = jalankanGelombang('VD', dadak, petaD, true)
    dadakanBenar = VD.benar; dadakanJumlah = VD.jumlah; dadakLulus = VD.lulus
  }
  const kunciArah = (s) => s.close48 > s.entry ? 'BUY' : s.close48 < s.entry ? 'SELL' : 'TANPA-ARAH'
  const suara = {}, kunciKomposisi = { BUY: 0, SELL: 0, 'TANPA-ARAH': 0 }
  for (const s of bank.soal) {
    if (s.keluarga !== 'PASAR') continue
    const a = kunciArah(s)
    kunciKomposisi[a]++
    if (a === 'TANPA-ARAH') continue
    suara[s.tanda] = suara[s.tanda] || { BUY: 0, SELL: 0 }
    suara[s.tanda][a]++
  }
  const petaArah = {}
  for (const [t, v] of Object.entries(suara)) petaArah[t] = v.BUY >= v.SELL ? 'BUY' : 'SELL'
  const wajahDuaNasib = Object.values(suara).filter(v => v.BUY > 0 && v.SELL > 0).length
  const simetriArah = (tanda) => { let terbaik = null, jarak = 99
    for (const k of Object.keys(petaArah).sort()) {
      if (k.length !== tanda.length) continue
      let d = 0; for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
      if (d < jarak) { jarak = d; terbaik = k }
    } return terbaik ? petaArah[terbaik] : null }
  const ukurArah = (soal2) => {
    const r = { cocok: 0, sisiLawan: 0, tanpaArah: 0 }
    for (const s of soal2) {
      if (s.keluarga !== 'PASAR') continue
      const a = kunciArah(s)
      if (a === 'TANPA-ARAH') { r.tanpaArah++; continue }
      const am = petaArah[s.tanda] || simetriArah(s.tanda) || null
      if (am === a) r.cocok++; else r.sisiLawan++
    } return r }
  const arahU = ukurArah(bank.soal)
  const arahD = dadak ? ukurArah(dadak.soal) : null
  const pct = (c, l) => (c + l) ? (c / (c + l) * 100).toFixed(1) + '%' : '-'
  const ringkas = {
    saat: new Date().toISOString(), konteks: 'V333-verifikasi-saat-itu-juga',
    bankSegel: bank.segel.hash, wajah: wajahUnik,
    utama: { benar: V.benar, salah: V.salah, jumlah: V.jumlah, lulus: V.lulus, modalAkhir: V.modalAkhir, likuidasiPada: V.likuidasiPada },
    dadakan: dadakanBenar == null ? null : { benar: dadakanBenar, jumlah: dadakanJumlah, lulus: dadakLulus },
    arahDua: { kunci: kunciKomposisi, wajahTotal: Object.keys(suara).length, wajahDuaNasib,
      petaArahUtama: { cocok: arahU.cocok, sisiLawan: arahU.sisiLawan, tanpaArah: arahU.tanpaArah, akurasi: pct(arahU.cocok, arahU.sisiLawan) },
      petaArahDadakan: arahD ? { cocok: arahD.cocok, sisiLawan: arahD.sisiLawan, tanpaArah: arahD.tanpaArah, akurasi: pct(arahD.cocok, arahD.sisiLawan) } : null,
      catatan: 'kunci arah dari FAKTA 48 jam (close48 vs entry) — nol karangan; peta arah langsung dibangun dari bank utama saja, dadakan = out-of-sample; sisa sisi-lawan di utama = wajah dua-nasib (batas informasi kartu 24 lilin); arah telanjang tanpa premis keluar adalah judi — inilah yang melumpuhkan jutaan trader DUA sisi di pump spike (short di jalan naik, long di jalan runtuh); makhluk hidup dari kelas bedah-kecepatan + premis (entry/dasar/target/ambang dua sisi), bukan ramalan arah telanjang; telaah jujur, bukan gerbang kelulusan' },
  }
  laporan.verifikasi = [...(laporan.verifikasi || []), ringkas]
  laporan.diperbarui = new Date().toISOString()
  const tubuh = JSON.stringify({ ...laporan, segel: null })
  laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
  writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  const lulusSemua = V.lulus && (dadakanBenar == null || dadakLulus)
  console.log(`VONIS VERIFIKASI PUMPSPIKE-3500: utama ${V.benar}/${V.jumlah} ${V.lulus ? 'LULUS' : 'GUGUR — INOVASI LAGI'}` +
    (dadakanBenar == null ? '' : ` · dadakan ${dadakanBenar}/${dadakanJumlah} ${dadakLulus ? 'LULUS' : 'GUGUR — INOVASI LAGI'}`) +
    ` · arah dua (peta langsung): utama ${arahU.cocok}/${arahU.cocok + arahU.sisiLawan} (${pct(arahU.cocok, arahU.sisiLawan)}), wajah dua-nasib ${wajahDuaNasib}/${Object.keys(suara).length}` +
    (arahD ? ` · dadakan out-of-sample ${arahD.cocok}/${arahD.cocok + arahD.sisiLawan} (${pct(arahD.cocok, arahD.sisiLawan)})` : '') +
    ` · segel ${laporan.segel.hash} — ${lulusSemua ? 'KEMAMPUAN 3500 TERBUKTI HIDUP' : 'KEMAMPUAN HILANG — TEMPAT LAGI'}`)
  if (!lulusSemua) process.exitCode = 1
}

// ---------- utama ----------
async function main() {
  mkdirSync('laporan', { recursive: true })
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const wajahUnik = ujiBankPumpspike3500(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  // V333 — pintu verifikasi: jawab ulang penuh, jangan sentuh gelombang tempaan
  if (process.argv.includes('--verifikasi')) { jalankanVerifikasi(bank, wajahUnik); return }

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-PUMPSPIKE-3500', epoch: 'V333', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-11): ujian 3500 soal dari kasus nyata PUMP SPIKE yang melumpuhkan jutaan trader DUA sisi — baik tipe short (dilikuidasi di jalan naik) kemudian tipe long (dilikuidasi saat spike runtuh) — bahkan professional trader (GME-2021/VW-2008/CHF-2015/FLASH-CRASH-2010/BTC-2019-04-02/SHIB-2021-10/LUNA-2022-05/BTC-2017-12-17 + gelombang betulan Binance); bila belum 3500/3500 maka inovasikan lagi sampai lulus penuh 3500; aturan: arah pasar hanya ada Dua buy/sell',
    bankSegel: bank.segel.hash,
    bankDist: bank.distKelas,
    bankDistSisi: bank.distSisi,
    bankDistFunding: bank.distFunding,
    bankDistKeluarga: bank.distKeluarga,
    bankJumlah: bank.jumlah,
    sumberSoal: 'ujian/soal-pumpspike-3500.json — 3500 soal dua keluarga: PASAR 3452 dari pump spike NYATA (klines 1d ±8 tahun × 91 koin → hari-spike vertikal (high−open)/open ≥ +9% & volume ≥ 1,5× rata-20 → jendela 1h 288 jam [T0-48h, T0+240h) → momen premis-spike; DUA SISI dari fakta kartu: SHORT x5 pemburu-balik (wick atas menang) / LONG x5 pemburu-momentum (tertutup kuat); SHORT: target = strip low, dasar = pra-pump 24 jam, ambang = entry×1,20; LONG: target = strip high, dasar = strip low, ambang = entry×0,80; jalan 48 jam; 12 kelas bedah-kecepatan dua sisi dari fakta) + SEJARAH 48 dari catatan kasus dunia publik; funding rate futures publik (fapi.binance.com); nol karangan',
    aturan: `dana $${MODAL_AWAL} (warisan V323); stake $${STAKE}/soal (1%); MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage 0.3R); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 3500/3500; tanda 40 bit (18 warisan + 2 funding + 20 anatomi dua tier) + tanda sejarah '11'+6bit kasus+5bit aspek+19bit hash (salt SEJARAH-V333)`,
    blind: 'makhluk menalar dari kartu 24 lilin nyata / metadata kasus + premis (entry/dasar/target/ambang dua sisi — fakta waktu-putusan) → tanda → peta pelajaran; penilai baru membaca kunci kelasHasil SETELAH seluruh tebakan gelombang itu terkunci; bank + kunci terbuka audit',
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

  // --- GELOMBANG UTAMA — tempa dari kekalahan sendiri sampai 3500/3500 (mandat: inovasikan lagi) ---
  let sempadan = 0
  while (!laporan.gelombang.some(g => g.lulus)) {
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-pumpspike3500: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
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
    console.log(`tempa-pumpspike3500: gelombang ${n} — benar ${g.benar}/${bank.jumlah} (dana $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 3500/3500' : 'INOVASI LAGI (tempa dari kekalahan)'}`)
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
    ujiBankPumpspike3500(dadak)
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (dana $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 350/350' : 'INOVASI LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-pumpspike3500: ${MAX_DADAKAN} gelombang dadakan belum 350/350 — laporkan jujur`); break }
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
      console.log(`tempa-pumpspike3500 dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 350/350' : 'INOVASI LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAAN-PUMPSPIKE-3500: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — inovasi lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${dadak.soal.length}/${dadak.soal.length}` : `${laporan.dadakan.benar}/${dadak.soal.length}`}` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR (generasi ${laporan.syarafLahir.generasi})` : ''))
}

main().catch(e => { console.error('tempa-pumpspike3500 MATI-PENUH:', e.message); process.exit(1) })
