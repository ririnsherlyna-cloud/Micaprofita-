#!/usr/bin/env node
// ============================================================
// TEMPA-SQUEEZE-3500 (V325) — ujian hidup-mati 3500 soal SHORT
// SQUEEZE dari kasus nyata yang melumpuhkan jutaan trader dunia,
// termasuk para trader PROFESIONAL.
// Mandat pemilik (2026-10-10):
//   "Sekarang ujian 3500 soal ujian simulasi dimana kita buat Dan
//    pelajari Dari kasus nyata yakni shorts squeeze yang berhasil
//    lumpuhkan jutaan trader di Dunia Dan level trader itu bahkan
//    professional trader, paham kan silahkan pastikan jikalau 3500
//    belum Lulus semuanya kita buat dia inovasikan lagi agar Lulus
//    penuh 3500"
// Warisan tradisi TEMPAN utuh:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU (24 lilin +
//    funding kedalaman / metadata kasus sejarah) + premis soal
//    (entry, puncak ambisi, dasar selamat, ambang likuidasi short x5
//    — fakta waktu-putusan) → tanda 40 bit → peta pelajaran. Kunci
//    kelasHasil TIDAK PERNAH dibaca saat menalar (tebakan semua
//    dikunci dulu, baru dinilai).
// 2. G1 = nalar dongkol-short pemula ("pump = palsu, pasti balik ke
//    dasar — AMBISI-BALIK-DASAR!") → pasti terluka oleh kelas
//    SQUEEZE yang jarang tapi mematikan → ditempa: peta
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
// 6. SYARAF BARU: setelah lulus, kelahiran NERVA-SQUEEZE-02 (anak
//    NERVA-SQUEEZE-01, generasi 1 — syaraf beranak) dijurnal ke
//    laporan/syaraf-lahir.jsonl — pelajaran melahirkan syaraf.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-squeeze-3500.json'
const FILE_DADAK = 'ujian/soal-squeeze-dadakan-350.json'
const FILE_LAPOR = 'laporan/tempa-squeeze3500.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 1500
const STAKE = 15
const KALAH_R = 19.5
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const KELAS = ['SQUEEZE-KILAT', 'SQUEEZE-PELAN', 'AMBISI-BALIK-DASAR', 'TERGANTUNG-TINGGI', 'TURUN-LANGSUNG', 'MENDEM-DI-RANGE', 'JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']

// ---------- fitur KARTU (identik dengan tambang-squeeze3500.mjs — dijaga ujiBank) ----------
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
// tanda 40 bit = 18 warisan + 2 funding (V315) + 20 anatomi squeeze dua tier (V325)
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
    x.r3 >= 2, x.volz >= 3, x.wickAtas >= 2, x.streakNaik >= 4,
    dariDasar >= 8, x.wickAtas >= 1.2, dariDasar >= 15, x.r3 >= 4,
    x.volz >= 6, x.rsi > 80, x.streakNaik >= 6, x.lebarPct > 8,
    x.r3 >= 0.8, x.volz >= 1.0, x.posisi >= 0.6, x.posisi <= 0.4,
    dariDasar >= 4, x.r12 >= 6, x.r12 <= -2, x.rsi > 90,
  ].map(Number).join('')
}
function praSqueezeShort(x) {
  const pumpHidup = x.r3 >= 0.8 || x.volz >= 1.0
  return pumpHidup && x.posisi >= 0.12 && x.posisi <= 0.93 &&
    x.lebarPct >= 1.5 && x.lebarPct <= 12 && x.hiAll < x.e * (1.20 - 0.002)
}
// tanda keluarga SEJARAH (identik dengan tambang-squeeze3500.mjs)
function tandaSejarah(kasusIdx, aspekIdx, stem) {
  const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
  const h = createHash('sha256').update('SEJARAH-V325|' + stem).digest('hex')
  const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
  return '10' + bits(6, kasusIdx) + bits(5, aspekIdx) + ekor
}

// ---------- kunci kelas dari FAKTA tersimpan (identik dengan tambang-squeeze3500.mjs) ----------
function kelasDariFaktaShort(jamAmbang, jamPuncak, jamDasar) {
  if (jamAmbang !== null && (jamDasar === null || jamAmbang <= jamDasar)) return jamAmbang <= 12 ? 'SQUEEZE-KILAT' : 'SQUEEZE-PELAN'
  if (jamPuncak !== null && jamDasar !== null) return 'AMBISI-BALIK-DASAR'
  if (jamPuncak !== null) return 'TERGANTUNG-TINGGI'
  if (jamDasar !== null) return 'TURUN-LANGSUNG'
  return 'MENDEM-DI-RANGE'
}

// ---------- nalar makhluk ----------
function nalarDongkol(soal) { // G1 — dongkol-short pemula: "pump = palsu, pasti balik ke dasar"
  return soal.keluarga === 'SEJARAH' ? 'JAWAB-A' : 'AMBISI-BALIK-DASAR'
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
function ujiBankSqueeze3500(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    if (s.keluarga === 'PASAR') {
      const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
      const x = fiturDari(strip)
      if (!praSqueezeShort(x)) throw new Error(`soal ${s.id} (${s.simbol}) bukan momen pra-squeeze-short — premis rusak, ditolak`)
      const tanda = tandaDari(x, s.funding24)
      if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
      if (!(s.dasarSelamat < s.entry && s.entry < s.puncakAmbisi && s.puncakAmbisi < s.ambangLikuid))
        throw new Error(`soal ${s.id} tangga cerita rusak (dasar < entry < puncak < ambang) — ditolak`)
      if ((s.jamAmbang != null) !== (s.tinggi48 >= s.ambangLikuid - 1e-9)) throw new Error(`soal ${s.id} jamAmbang tak cocok tinggi48 — ditolak`)
      if ((s.jamPuncak != null) !== (s.tinggi48 >= s.puncakAmbisi - 1e-9)) throw new Error(`soal ${s.id} jamPuncak tak cocok tinggi48 — ditolak`)
      if ((s.jamDasar != null) !== (s.rendah48 <= s.dasarSelamat + 1e-9)) throw new Error(`soal ${s.id} jamDasar tak cocok rendah48 — ditolak`)
      const kelas = kelasDariFaktaShort(s.jamAmbang, s.jamPuncak, s.jamDasar)
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
    return { kelas: nalarDongkol(s), sumber: 'dongkol-short' }
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
    return { id: s.id, keluarga: s.keluarga, simbol: s.simbol || s.kasus, waktu: s.waktu || null, squeezeHari: s.squeezeHari || null, premis: s.premis, funding24: s.funding24 == null ? null : s.funding24,
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
  const ambil = (s) => ({ id: s.id, simbol: s.simbol, waktu: s.waktu, squeezeHari: s.squeezeHari, premis: s.premis,
    jamAmbang: s.jamAmbang, jamPuncak: s.jamPuncak, jamDasar: s.jamDasar,
    tinggi48: s.tinggi48, rendah48: s.rendah48, close48: s.close48,
    entry: s.entry, puncakAmbisi: s.puncakAmbisi, dasarSelamat: s.dasarSelamat, ambangLikuid: s.ambangLikuid,
    funding24: s.funding24, kelasHasil: s.kelasHasil })
  const kilat = pasar.filter(s => s.kelasHasil === 'SQUEEZE-KILAT')
  const gantung = pasar.filter(s => s.kelasHasil === 'TERGANTUNG-TINGGI')
  const impian = pasar.filter(s => s.kelasHasil === 'AMBISI-BALIK-DASAR')
  // yang paling kejam: likuidasi short tercepat (jam ambang terkecil)
  kilat.sort((a, b) => (a.jamAmbang || 999) - (b.jamAmbang || 999))
  // yang paling menipu: puncak ambisi tercapai lalu harga terus menggantung — benar arah, tetap tak pulang
  gantung.sort((a, b) => (b.tinggi48 / b.entry) - (a.tinggi48 / a.entry))
  // yang paling menggoda: skenario impian para short terjadi
  impian.sort((a, b) => (b.tinggi48 / b.entry) - (a.tinggi48 / a.entry))
  return { squeezeTercepat: kilat.slice(0, 3).map(ambil), gantunganTertinggi: gantung.slice(0, 2).map(ambil), impianTerbesar: impian.slice(0, 2).map(ambil) }
}

// ---------- pelajaran kunci (mandat: pelajari kasus nyata) — dihitung dari bank ----------
function pelajaranKunci(bank) {
  const d = bank.distKelas, total = bank.jumlah
  const pasar = bank.distKeluarga.PASAR || 0
  const likuid = (d['SQUEEZE-KILAT'] || 0) + (d['SQUEEZE-PELAN'] || 0)
  const puncakTercapai = (d['AMBISI-BALIK-DASAR'] || 0) + (d['TERGANTUNG-TINGGI'] || 0)
  const dongkolBenar = ((d['AMBISI-BALIK-DASAR'] || 0) / total * 100).toFixed(1)
  return [
    `short x5 tanpa rencana keluar tewas ${likuid}/${pasar} momen pasar (${(likuid / pasar * 100).toFixed(1)}%) — kelas SQUEEZE jarang TAPI total; inilah yang melumpuhkan Melvin (GME), VW 2008, dan $38 miliar short TSLA 2020`,
    `dongkol-short ("pump = palsu, pasti balik ke dasar") benar hanya ${dongkolBenar}% — keyakinan mean-reversion adalah jerat: benar arah sering, mati total saat squeeze datang`,
    `puncak ambisi tersentuh ${puncakTercapai}/${pasar} (${(puncakTercapai / pasar * 100).toFixed(1)}%) dan ${((d['TERGANTUNG-TINGGI'] || 0) / (puncakTercapai || 1) * 100).toFixed(0)}%-nya justru MENEMBUS ke atas (TERGANTUNG-TINGGI ${d['TERGANTUNG-TINGGI'] || 0} momen) — "pasti mentok di situ" adalah khayalan; menyentuh target bukan keselamatan`,
    `funding negatif (shorts pay longs) terlihat di ${(bank.distFunding.negatif / pasar * 100).toFixed(1)}% momen pasar — bahan bakar squeeze terbaca PRA-peristiwa dari kartu (warisan V315)`,
    `keluarga SEJARAH ${bank.distKeluarga.SEJARAH || 0} soal (GME/VW/TSLA/AMC/HRTZ/KBIO/HLF/BBBY + pelajaran profesional) ditempa ke ingatan: profesional tidak mati karena salah arah, melainkan ukuran posisi + leverage + tanpa rencana keluar`,
  ]
}

// ---------- kelahiran syaraf baru (mandat: inovasikan lagi; syaraf beranak) ----------
function lahirkanSyaraf(laporan, wajahUnik) {
  try {
    mkdirSync('laporan', { recursive: true })
    const entri = {
      saat: new Date().toISOString(), konteks: 'V325-tempaan-squeeze3500',
      peristiwa: 'LAHIR', id: 'NERVA-SQUEEZE-02', jenis: 'SQUEEZE',
      generasi: 1, orangTua: 'NERVA-SQUEEZE-01',
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        squeezeKilat: laporan.bankDist && laporan.bankDist['SQUEEZE-KILAT'] || 0,
        tugas: 'reseptor squeeze-goliat (anak NERVA-SQUEEZE-01): dari 24 lilin + funding, menakar nasib SHORT x5 saat pump — kapan likuid, kapan pulih — SEBELUM terjadi; plus ingatan kasus dunia GME/VW/TSLA/AMC/HRTZ/KBIO/HLF/BBBY; wajah-wajah squeeze hidup di peta pelajaran tempa-squeeze3500',
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
  const wajahUnik = ujiBankSqueeze3500(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-SQUEEZE-3500', epoch: 'V325', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-10): ujian 3500 soal dari kasus nyata short squeeze yang melumpuhkan jutaan trader dunia bahkan profesional (GME/VW/TSLA/AMC/HRTZ/KBIO/HLF/BBBY + squeeze betulan Binance); bila belum 3500/3500 maka inovasikan lagi sampai lulus penuh 3500',
    bankSegel: bank.segel.hash,
    bankDist: bank.distKelas,
    bankDistFunding: bank.distFunding,
    bankDistKeluarga: bank.distKeluarga,
    bankJumlah: bank.jumlah,
    sumberSoal: 'ujian/soal-squeeze-3500.json — 3500 soal dua keluarga: PASAR 3452 dari squeeze NYATA (klines 1d 6 tahun × 92 koin → jendela 1h 168 jam → momen pra-squeeze-short; SHORT x5 di close strip; puncak ambisi = atas strip; dasar selamat = bawah strip; ambang likuidasi entry×1.20; jalan 48 jam; 6 kelas bedah-kecepatan dari fakta) + SEJARAH 48 dari catatan kasus dunia publik; funding rate futures publik (fapi.binance.com); nol karangan',
    aturan: `dana $${MODAL_AWAL} (warisan V323); stake $${STAKE}/soal (1%); MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage 0.3R); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 3500/3500; tanda 40 bit (18 warisan + 2 funding + 20 anatomi squeeze dua tier) + tanda sejarah '10'+6bit kasus+5bit aspek+19bit hash`,
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
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-squeeze3500: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
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
    console.log(`tempa-squeeze3500: gelombang ${n} — benar ${g.benar}/${bank.jumlah} (dana $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 3500/3500' : 'INOVASI LAGI (tempa dari kekalahan)'}`)
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
    ujiBankSqueeze3500(dadak)
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (dana $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 350/350' : 'INOVASI LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-squeeze3500: ${MAX_DADAKAN} gelombang dadakan belum 350/350 — laporkan jujur`); break }
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
      console.log(`tempa-squeeze3500 dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 350/350' : 'INOVASI LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAAN-SQUEEZE-3500: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — inovasi lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${dadak.soal.length}/${dadak.soal.length}` : `${laporan.dadakan.benar}/${dadak.soal.length}`}` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR (generasi ${laporan.syarafLahir.generasi}, anak ${laporan.syarafLahir.orangTua})` : ''))
}

main().catch(e => { console.error('tempa-squeeze3500 MATI-PENUH:', e.message); process.exit(1) })
