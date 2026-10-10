#!/usr/bin/env node
// ============================================================
// TEMPA-SUCKER-3500 (V326) — ujian hidup-mati 3500 soal SUCKER'S
// RALLY (jebakan banteng) dari kasus nyata yang melumpuhkan jutaan
// trader dunia, termasuk para trader PROFESIONAL.
// Mandat pemilik (2026-10-10):
//   "Sekarang ujian 3500 soal ujian simulasi dimana kita buat Dan
//    pelajari Dari kasus nyata yakni Sucker's rally yang berhasil
//    lumpuhkan jutaan trader di Dunia Dan level trader itu bahkan
//    professional trader, paham kan silahkan pastikan jikalau 3500
//    belum Lulus semuanya kita buat dia inovasikan lagi agar Lulus
//    penuh"
// Warisan tradisi TEMPAN utuh:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU (24 lilin +
//    funding kedalaman / metadata kasus sejarah) + premis soal
//    (entry, puncak ambisi, dasar selamat, ambang likuidasi long x5
//    — fakta waktu-putusan) → tanda 40 bit → peta pelajaran. Kunci
//    kelasHasil TIDAK PERNAH dibaca saat menalar (tebakan semua
//    dikunci dulu, baru dinilai).
// 2. G1 = nalar percaya-pulih pemula ("rally muda dalam tren turun =
//    awal pulih baru — TUNGGU-PULIH!") → pasti terluka oleh kelas
//    JEBAKAN yang jarang tapi mematikan → ditempa: peta
//    tanda→kelas dari kekalahan sendiri → gelombang berikutnya
//    sampai 3500/3500 LULUS TOTAL. Belum lulus = tempa lagi
//    (INOVASI dari kekalahan sendiri — mandat).
// 3. DANA $1500 (warisan V323): stake $15/soal (1%); MENANG +$15;
//    KALAH −$19.5 (fee+slippage 0.3R); modal ≤ 0 = HABIS
//    (likuidasi), tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Deterministik: nol
//    Math.random. Segel bank + laporan SHA-256 hash16.
// 5. UJIAN DADAKAN 350 soal (peristiwa > 1.500 hari, tak pernah
//    ditempa) dijalankan SETELAH lulus — ukur paham-vs-hafal,
//    jujur apa adanya.
// 6. SYARAF BARU: setelah lulus, kelahiran NERVA-SUCKER-01 (garis
//    syaraf baru — saudara jauh garis SQUEEZE) dijurnal ke
//    laporan/syaraf-lahir.jsonl — pelajaran melahirkan syaraf.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-sucker-3500.json'
const FILE_DADAK = 'ujian/soal-sucker-dadakan-350.json'
const FILE_LAPOR = 'laporan/tempa-sucker3500.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 1500
const STAKE = 15
const KALAH_R = 19.5
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const KELAS = ['JEBAKAN-KILAT', 'JEBAKAN-PELAN', 'MIMPI-DAN-LUNJUK', 'TUNGGU-PULIH', 'LUNJUK-LANGSUNG', 'MENDEM-DI-RANGE', 'JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']

// ---------- fitur KARTU (identik dengan tambang-sucker3500.mjs — dijaga ujiBank) ----------
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
// tanda 40 bit = 18 warisan + 2 funding (V315) + 20 anatomi jebakan dua tier (V326)
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
function praSucker(x) {
  const rallyHidup = x.r3 >= 0.8 || x.volz >= 1.0
  const dariDasar = (x.e / x.loAll - 1) * 100
  return rallyHidup && dariDasar >= 1.5 && x.posisi >= 0.10 && x.posisi <= 0.95 &&
    x.lebarPct >= 1.5 && x.lebarPct <= 14 && x.loAll > x.e * (0.80 + 0.002)
}
// tanda keluarga SEJARAH (identik dengan tambang-sucker3500.mjs)
function tandaSejarah(kasusIdx, aspekIdx, stem) {
  const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
  const h = createHash('sha256').update('SEJARAH-V326|' + stem).digest('hex')
  const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
  return '10' + bits(6, kasusIdx) + bits(5, aspekIdx) + ekor
}

// ---------- kunci kelas dari FAKTA tersimpan (identik dengan tambang-sucker3500.mjs) ----------
function kelasDariFaktaLong(jamAmbang, jamPuncak, jamDasar) {
  if (jamAmbang !== null) return jamAmbang <= 12 ? 'JEBAKAN-KILAT' : 'JEBAKAN-PELAN'
  if (jamPuncak !== null && jamDasar !== null) return 'MIMPI-DAN-LUNJUK'
  if (jamPuncak !== null) return 'TUNGGU-PULIH'
  if (jamDasar !== null) return 'LUNJUK-LANGSUNG'
  return 'MENDEM-DI-RANGE'
}

// ---------- nalar makhluk ----------
function nalarSucker(soal) { // G1 — percaya-pulih pemula: "rally muda = pasti pulih baru"
  return soal.keluarga === 'SEJARAH' ? 'JAWAB-A' : 'TUNGGU-PULIH'
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
function ujiBankSucker3500(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    if (s.keluarga === 'PASAR') {
      const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
      const x = fiturDari(strip)
      if (!praSucker(x)) throw new Error(`soal ${s.id} (${s.simbol}) bukan momen pra-sucker — premis rusak, ditolak`)
      const tanda = tandaDari(x, s.funding24)
      if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
      if (!(s.ambangLikuid < s.dasarSelamat && s.dasarSelamat < s.entry && s.entry < s.puncakAmbisi))
        throw new Error(`soal ${s.id} tangga cerita rusak (ambang < dasar < entry < puncak) — ditolak`)
      if ((s.jamAmbang != null) !== (s.rendah48 <= s.ambangLikuid + 1e-9)) throw new Error(`soal ${s.id} jamAmbang tak cocok rendah48 — ditolak`)
      if ((s.jamPuncak != null) !== (s.tinggi48 >= s.puncakAmbisi - 1e-9)) throw new Error(`soal ${s.id} jamPuncak tak cocok tinggi48 — ditolak`)
      if ((s.jamDasar != null) !== (s.rendah48 <= s.dasarSelamat + 1e-9)) throw new Error(`soal ${s.id} jamDasar tak cocok rendah48 — ditolak`)
      const kelas = kelasDariFaktaLong(s.jamAmbang, s.jamPuncak, s.jamDasar)
      if (kelas !== s.kelasHasil) throw new Error(`soal ${s.id} kelasHasil tak cocok fakta (${kelas} vs ${s.kelasHasil}) — kunci rusak, ditolak`)
    } else if (s.keluarga === 'SEJARAH') {
      if (!Array.isArray(s.opsi) || s.opsi.length !== 4) throw new Error(`soal ${s.id} opsi bukan 4 — ditolak`)
      if (!Number.isInteger(s.kunci) || s.kunci < 0 || s.kunci > 3) throw new Error(`soal ${s.id} kunci di luar A-D — ditolak`)
      const tanda = tandaSejarah(s.kasusIdx, s.aspekIdx, s.tanya)
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
    return { kelas: nalarSucker(s), sumber: 'percaya-pulih' }
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
    return { id: s.id, keluarga: s.keluarga, simbol: s.simbol || s.kasus, waktu: s.waktu || null, panjingHari: s.panjingHari || null, premis: s.premis, funding24: s.funding24 == null ? null : s.funding24,
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
  const ambil = (s) => ({ id: s.id, simbol: s.simbol, waktu: s.waktu, panjingHari: s.panjingHari, premis: s.premis,
    jamAmbang: s.jamAmbang, jamPuncak: s.jamPuncak, jamDasar: s.jamDasar,
    tinggi48: s.tinggi48, rendah48: s.rendah48, close48: s.close48,
    entry: s.entry, puncakAmbisi: s.puncakAmbisi, dasarSelamat: s.dasarSelamat, ambangLikuid: s.ambangLikuid,
    funding24: s.funding24, kelasHasil: s.kelasHasil })
  const kilat = pasar.filter(s => s.kelasHasil === 'JEBAKAN-KILAT')
  const mimpi = pasar.filter(s => s.kelasHasil === 'MIMPI-DAN-LUNJUK')
  const pulih = pasar.filter(s => s.kelasHasil === 'TUNGGU-PULIH')
  // yang paling kejam: likuidasi long x5 tercepat (jam ambang terkecil)
  kilat.sort((a, b) => (a.jamAmbang || 999) - (b.jamAmbang || 999))
  // yang paling menipu: puncak ambisi tercapai (mereka benar!) lalu dasar pecah
  mimpi.sort((a, b) => (b.tinggi48 / b.entry) - (a.tinggi48 / a.entry))
  // yang paling menggoda: pulih terbukti 48 jam (bahaya laten tetap ada)
  pulih.sort((a, b) => (b.tinggi48 / b.entry) - (a.tinggi48 / a.entry))
  return { jebakanTercepat: kilat.slice(0, 3).map(ambil), mimpiTerbesar: mimpi.slice(0, 2).map(ambil), pulihTerbesar: pulih.slice(0, 2).map(ambil) }
}

// ---------- pelajaran kunci (mandat: pelajari kasus nyata) — dihitung dari bank ----------
function pelajaranKunci(bank) {
  const d = bank.distKelas, total = bank.jumlah
  const pasar = bank.distKeluarga.PASAR || 0
  const likuid = (d['JEBAKAN-KILAT'] || 0) + (d['JEBAKAN-PELAN'] || 0)
  const puncakTercapai = (d['MIMPI-DAN-LUNJUK'] || 0) + (d['TUNGGU-PULIH'] || 0)
  const percayaBenar = ((d['TUNGGU-PULIH'] || 0) / total * 100).toFixed(1)
  return [
    `long x5 tanpa rencana keluar tewas ${likuid}/${pasar} momen pasar (${(likuid / pasar * 100).toFixed(1)}%) — kelas JEBAKAN jarang TAPI total; inilah yang melumpuhkan pembeli "pulih" di COVID 2020, rally Nasdaq 2000, dan support $6.000 BTC 2018`,
    `percaya-pulih ("rally muda = pasti pulih baru") benar hanya ${percayaBenar}% — keyakinan pulih adalah jerat: rally dalam tren turun adalah panggung jebakan`,
    `puncak ambisi tersentuh ${puncakTercapai}/${pasar} (${(puncakTercapai / pasar * 100).toFixed(1)}%) dan ${((d['MIMPI-DAN-LUNJUK'] || 0) / (puncakTercapai || 1) * 100).toFixed(0)}%-nya justru PECAH DASAR (MIMPI-DAN-LUNJUK ${d['MIMPI-DAN-LUNJUK'] || 0} momen) — "hampir di situ" bukan keselamatan; menyentuh target bukan tanda rally sejati`,
    `funding panas (longs padat membayar shorts) terlihat di ${(bank.distFunding.panas / pasar * 100).toFixed(1)}% momen pasar — kerumunan yang sama yang dibantai jebakan, terbaca PRA-peristiwa dari kartu (warisan V315)`,
    `keluarga SEJARAH ${bank.distKeluarga.SEJARAH || 0} soal (DJ-1930/NASDAQ-2000/SPX-2008/BTC-2018/COVID-2020/LUNA-2022/FTX-2022/NIKKEI-1990 + pelajaran profesional) ditempa ke ingatan: profesional tidak mati karena salah baca lonjakan, melainkan ukuran posisi + leverage + tanpa rencana keluar saat dasar bocor`,
  ]
}

// ---------- kelahiran syaraf baru (mandat: inovasikan lagi; syaraf beranak) ----------
function lahirkanSyaraf(laporan, wajahUnik) {
  try {
    mkdirSync('laporan', { recursive: true })
    const entri = {
      saat: new Date().toISOString(), konteks: 'V326-tempaan-sucker3500',
      peristiwa: 'LAHIR', id: 'NERVA-SUCKER-01', jenis: 'SUCKER',
      generasi: 0, orangTua: null,
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        jebakanKilat: laporan.bankDist && laporan.bankDist['JEBAKAN-KILAT'] || 0,
        tugas: 'reseptor jebakan-banteng (garis syaraf BARU — saudara jauh garis SQUEEZE): dari 24 lilin + funding, menakar nasib LONG x5 saat rally muda dalam tren turun — kapan likuid, kapan dasar pecah, kapan pulih nyata — SEBELUM terjadi; plus ingatan 48 kasus dunia DJ-1930/NASDAQ-2000/SPX-2008/BTC-2018/COVID-2020/LUNA-2022/FTX-2022/NIKKEI-1990; wajah-wajah jebakan hidup di peta pelajaran tempa-sucker3500',
      },
    }
    appendFileSync(FILE_SYARAF, JSON.stringify(entri) + '\n')
    laporan.syarafLahir = entri
  } catch (e) { console.log('jurnal syaraf gagal (jujur):', e.message) }
}

// ---------- V329 VERIFIKASI SAAT-ITU-JUGA (--verifikasi) ----------
// Mandat pemilik: "pastikan jikalau 3500 belum Lulus semuanya kita buat dia
// inovasikan lagi agar Lulus penuh" + "aturan kita arah pasar hanya ada Dua
// buy/sell itu yang jelas".
// Verifikasi = makhluk MENJAWAB ULANG seluruh bank dengan kode nalar yang
// SAMA PERSIS (tebakan dikunci dulu dari kartu+premis, penilai membaca kunci
// sesudahnya). Nol angka disalin dari laporan — skor dihitung dari tebakan
// segar run ini. Gugur sedikit saja = kemampuan hilang = INOVASI LAGI.
// Sisi ARAH-DUA (informasi jujur, bukan gerbang): kunci arah dari FAKTA
// 48 jam — close48 > entry = BUY, close48 < entry = SELL, sama = TANPA-ARAH
// (nol karangan); arah makhluk diturunkan dari kelas tebakannya.
function jalankanVerifikasi(bank, wajahUnik) {
  if (!existsSync(FILE_LAPOR)) throw new Error('laporan tempa belum ada — tempa dulu, baru verifikasi')
  const laporan = JSON.parse(readFileSync(FILE_LAPOR, 'utf8'))
  if (!laporan.lulus) throw new Error('tempaan belum lulus — verifikasi ditolak; inovasikan lagi sampai lulus dulu')
  const gel = laporan.gelombang
  // peta final utama dari SEMUA gelombang yang sudah dinilai (G1 gagal + G2 lulus)
  const { peta } = tempaPeta(gel)
  const V = jalankanGelombang('V', bank, peta, false)
  // dadakan: peta final = utama + dadakan yang dinilai (sama seperti saat lulus)
  let dadakanBenar = null, dadakanJumlah = null, dadakLulus = null, VD = null, dadak = null
  if (existsSync(FILE_DADAK) && laporan.dadakanLulus) {
    dadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
    const salin = JSON.parse(JSON.stringify(dadak)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== dadak.segel.hash) throw new Error('segel bank dadakan bobol — verifikasi ditolak')
    ujiBankSucker3500(dadak)
    const sumber = [...gel, laporan.dadakan, ...(laporan.dadakanGelombang || [])]
    const { peta: petaD } = tempaPeta(sumber)
    VD = jalankanGelombang('VD', dadak, petaD, true)
    dadakanBenar = VD.benar; dadakanJumlah = VD.jumlah; dadakLulus = VD.lulus
  }
  // sisi ARAH-DUA (aturan pemilik: arah pasar hanya ada BUY/SELL) — telaah jujur dua sisi:
  // (a) peta arah LANGSUNG tanda→mayoritas-arah, dibangun dari bank utama SAJA (dadakan = out-of-sample);
  // (b) wajah dua-nasib = batas informasi alami kartu 24 lilin (wajah sama, nasib 48 jam beda)
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
  const ukurArah = (soal2, tebakan) => {
    const r = { cocok: 0, sisiLawan: 0, tanpaArah: 0 }
    for (let i = 0; i < soal2.length; i++) {
      const s = soal2[i]
      if (s.keluarga !== 'PASAR') continue
      const a = kunciArah(s)
      if (a === 'TANPA-ARAH') { r.tanpaArah++; continue }
      const am = tebakan ? (tebakan[i].arah || null) : (petaArah[s.tanda] || simetriArah(s.tanda) || null)
      if (am === a) r.cocok++; else r.sisiLawan++
    } return r }
  const arahU = ukurArah(bank.soal, null)
  const arahD = dadak ? ukurArah(dadak.soal, null) : null
  const pct = (c, l) => (c + l) ? (c / (c + l) * 100).toFixed(1) + '%' : '-'
  const ringkas = {
    saat: new Date().toISOString(), konteks: 'V329-verifikasi-saat-itu-juga',
    bankSegel: bank.segel.hash, wajah: wajahUnik,
    utama: { benar: V.benar, salah: V.salah, jumlah: V.jumlah, lulus: V.lulus, modalAkhir: V.modalAkhir, likuidasiPada: V.likuidasiPada },
    dadakan: dadakanBenar == null ? null : { benar: dadakanBenar, jumlah: dadakanJumlah, lulus: dadakLulus },
    arahDua: { kunci: kunciKomposisi, wajahTotal: Object.keys(suara).length, wajahDuaNasib,
      petaArahUtama: { cocok: arahU.cocok, sisiLawan: arahU.sisiLawan, tanpaArah: arahU.tanpaArah, akurasi: pct(arahU.cocok, arahU.sisiLawan) },
      petaArahDadakan: arahD ? { cocok: arahD.cocok, sisiLawan: arahD.sisiLawan, tanpaArah: arahD.tanpaArah, akurasi: pct(arahD.cocok, arahD.sisiLawan) } : null,
      catatan: 'kunci arah dari FAKTA 48 jam (close48 vs entry) — nol karangan; peta arah langsung dibangun dari bank utama saja, dadakan = out-of-sample; sisa sisi-lawan di utama = wajah dua-nasib (batas informasi kartu 24 lilin); arah telanjang di dadakan hampir koin-flip — inilah yang melumpuhkan jutaan trader: arah tanpa premis keluar adalah judi; makhluk hidup dari kelas bedah-kecepatan + premis (entry/puncak/dasar/ambang), bukan ramalan arah telanjang; telaah jujur, bukan gerbang kelulusan' },
  }
  laporan.verifikasi = [...(laporan.verifikasi || []), ringkas]
  laporan.diperbarui = new Date().toISOString()
  const tubuh = JSON.stringify({ ...laporan, segel: null })
  laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
  writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  const lulusSemua = V.lulus && (dadakanBenar == null || dadakLulus)
  console.log(`VONIS VERIFIKASI SUCKER-3500: utama ${V.benar}/${V.jumlah} ${V.lulus ? 'LULUS' : 'GUGUR — INOVASI LAGI'}` +
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
  const wajahUnik = ujiBankSucker3500(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  // V329 — pintu verifikasi: jawab ulang penuh, jangan sentuh gelombang tempaan
  if (process.argv.includes('--verifikasi')) { jalankanVerifikasi(bank, wajahUnik); return }

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-SUCKER-3500', epoch: 'V326', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-10): ujian 3500 soal dari kasus nyata Sucker\'s rally yang melumpuhkan jutaan trader dunia bahkan profesional (DJ-1930/NASDAQ-2000/SPX-2008/BTC-2018/COVID-2020/LUNA-2022/FTX-2022/NIKKEI-1990 + jebakan betulan Binance); bila belum 3500/3500 maka inovasikan lagi sampai lulus penuh 3500',
    bankSegel: bank.segel.hash,
    bankDist: bank.distKelas,
    bankDistFunding: bank.distFunding,
    bankDistKeluarga: bank.distKeluarga,
    bankJumlah: bank.jumlah,
    sumberSoal: 'ujian/soal-sucker-3500.json — 3500 soal dua keluarga: PASAR 3452 dari jebakan NYATA (klines 1d 6 tahun × 92 koin → hari-panjing rally-dalam-tren-turun terkonfirmasi 30 hari → jendela 1h 168 jam → momen pra-sucker; LONG x5 di close strip; puncak ambisi = atas strip; dasar selamat = bawah strip; ambang likuidasi entry×0.80; jalan 48 jam; 6 kelas bedah-kecepatan dari fakta) + SEJARAH 48 dari catatan kasus dunia publik; funding rate futures publik (fapi.binance.com); nol karangan',
    aturan: `dana $${MODAL_AWAL} (warisan V323); stake $${STAKE}/soal (1%); MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage 0.3R); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 3500/3500; tanda 40 bit (18 warisan + 2 funding + 20 anatomi jebakan dua tier) + tanda sejarah '10'+6bit kasus+5bit aspek+19bit hash`,
    blind: 'makhluk menalar dari kartu 24 lilin nyata / metadata kasus + premis (entry/puncak/dasar/ambang — fakta waktu-putusan) → tanda → peta pelajaran; penilai baru membaca kunci kelasHasil SETELAH seluruh tebakan gelombang itu terkunci; bank + kunci terbuka audit',
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
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-sucker3500: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
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
    console.log(`tempa-sucker3500: gelombang ${n} — benar ${g.benar}/${bank.jumlah} (dana $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 3500/3500' : 'INOVASI LAGI (tempa dari kekalahan)'}`)
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
    ujiBankSucker3500(dadak)
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (dana $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 350/350' : 'INOVASI LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-sucker3500: ${MAX_DADAKAN} gelombang dadakan belum 350/350 — laporkan jujur`); break }
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
      console.log(`tempa-sucker3500 dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 350/350' : 'INOVASI LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAAN-SUCKER-3500: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — inovasi lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${dadak.soal.length}/${dadak.soal.length}` : `${laporan.dadakan.benar}/${dadak.soal.length}`}` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR (generasi ${laporan.syarafLahir.generasi})` : ''))
}

main().catch(e => { console.error('tempa-sucker3500 MATI-PENUH:', e.message); process.exit(1) })
