#!/usr/bin/env node
// ============================================================
// TAMBANG-JEJAK (V316) — mandat pemilik (2026-10-09):
//   "ada baiknya lagi kita ujikan dengan sample 2000 soal yang jauh
//    lebih kejam dan dengan minim database — apakah dia bisa
//    mengetahuinya? Jadi jejak ambisius bisa diketahui kan benar?"
// ------------------------------------------------------------
// EMPAT LAPIS KEKEJAMAN (V315: 700 soal, kartu 24 lilin):
//   KEJAM-1 KARTU MINIM — kartu 10 LILIN saja (V315: 24) — kurang
//     separuh data; sisanya hanya premis angka (entry, puncak ambisi,
//     dasar selamat, ambang likuidasi). JEJAK AMBISIUS harus terbaca
//     dari segelintir angka: bekas para shorts x1 yang yakin puncak
//     1.3-an lalu balik 0.85-an — ternyata harga melesat 2.7-an tanpa
//     pernah menyentuh dasar; modal habis, funding shorts pay long.
//   KEJAM-2 MEPET — kurator memilih momen yang hasilnya PALING MEPET:
//     margin hidup-mati terkecil (dasar nyaris tersentuh tapi TAK
//     pernah; ambang nyaris gagal tapi terlanjur tercapai). Median
//     margin bank dijurnal — kekejaman terukur, bukan retorika.
//   KEJAM-3 2000 SOAL + 150 DADAKAN (V315: 700 + 70).
//   KEJAM-4 JEBAKAN SINYAL TUNGGAL — funding positif tetapi tetap
//     likuid; funding negatif (shorts pay long) tetapi TIDAK squeeze.
//     Satu angka tak cukup; jejak harus dibaca dari struktur kartu.
// Skenario setia V315: strip 10 lilin konsolidasi (range ≤ 12%),
//   short x1 di close strip; puncak ambisi = atas range; dasar
//   selamat = bawah range; ambang likuidasi = entry × 1.90 (rugi 90%
//   = margin maintenance habis); jendela nilai 720 jam; 5 kelas hasil
//   dari fakta; konservatif dalam satu lilin.
// Warisan dijaga: koreksi kronologis V315 (sort naik), satu-tanda-
//   satu-kelas LINTAS bank utama & dadakan (pemilikTandaGlobal),
//   segel SHA-256 hash16, nol Math.random, dan fitur/tanda dihitung
//   dari kartu TERBULATKAN yang sama dengan yang tersimpan — auditor
//   cocok by-construction (kelas bug pembulatan dimusnahkan dari akar).
// ============================================================
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

const KOIN = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','TRXUSDT',
  'LINKUSDT','AVAXUSDT','DOTUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','ARBUSDT','OPUSDT',
  'INJUSDT','SUIUSDT','APTUSDT','FILUSDT','ETCUSDT','XLMUSDT','PEPEUSDT','SHIBUSDT',
  'WLDUSDT','TIAUSDT','SEIUSDT','ORDIUSDT','JUPUSDT','AAVEUSDT',
]

const STRIP = 10            // kartu minim 10 lilin (V315: 24) — KEJAM-1
const JENDELA = 720         // jendela nilai 30 hari (jam)
const AMBANG_R = 1.90       // likuidasi short x1: rugi 90% dari entry
const KONSOL_MAX = 0.12     // range strip ≤ 12% = konsolidasi
const HALAMAN = 12          // 12.000 jam ≈ 500 hari per koin
const UTAMA_JAM = 10000     // kolam utama 10.000 jam terakhir
const capKoin = 90
const jarak = 96

const KELAS_HASIL = [
  { id: 'LIQUID-MELESAT', naive: 'TURUN',
    cerita: 'JEBAKAN PEMILIK: puncak ambisi tercapai (mereka benar!), tapi harga TIDAK berbalik — melesat menembus ambang likuidasi x1 tanpa pernah menyentuh dasar; modal short habis' },
  { id: 'AMBISI-BALIK-DASAR', naive: 'TURUN',
    cerita: 'puncak ambisi tercapai lalu harga berbalik sampai dasar — skenario yang para shorts bayangkan; yang ngestub selamat, yang TP untung' },
  { id: 'TURUN-LANGSUNG', naive: 'TURUN',
    cerita: 'harga langsung turun ke dasar tanpa pernah menyentuh puncak ambisi — short untung tanpa drama' },
  { id: 'TERGANTUNG-TINGGI', naive: 'TURUN',
    cerita: 'puncak tercapai, tapi dasar tak pernah dan ambang tak pernah — harga menggantung di atas; bahaya laten yang belum memutuskan' },
  { id: 'MENDEM-DI-RANGE', naive: 'TURUN',
    cerita: '30 hari penuh harga tetap di dalam range konsolidasi — tak ada puncak, tak ada dasar' },
]

// ---------- fitur KARTU MINIM (10 lilin) — dihitung dari kartu TERBULATKAN ----------
// (kartu tersimpan = kartu yang dihitung; ujiBank menghitung ulang, cocok pasti)
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
// tanda 20 bit = 18 bit struktur kartu minim + 2 bit funding (warisan V315)
function tandaDari(x, funding) {
  return [
    x.r3 > 2.5, x.r3 < -2.5, x.r9 > 6, x.r9 < -6,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 1.2, x.r1 < -1.2,
    funding != null && funding < 0,        // shorts membayar longs — bahan bakar squeeze
    funding != null && funding > 0.0005,   // longs padat panas
  ].map(Number).join('')
}

// ---------- kunci kelas dari FAKTA 720 jam (murni; dipakai kurator & auditor) ----------
// konservatif: dalam satu lilin yang menyiksa short dihitung dulu (ambang > puncak > dasar)
function putusan720(entry, puncakAmbisi, dasarSelamat, ambangLikuid, jalan) {
  let jamAmbang = null, jamPuncak = null, jamDasar = null
  let tinggi = -Infinity, rendah = Infinity
  for (let j = 0; j < jalan.length; j++) {
    const { h, l } = jalan[j]
    if (h > tinggi) tinggi = h
    if (l < rendah) rendah = l
    if (jamAmbang === null && h >= ambangLikuid) jamAmbang = j + 1
    if (jamPuncak === null && h >= puncakAmbisi) jamPuncak = j + 1
    if (jamDasar === null && l <= dasarSelamat) jamDasar = j + 1
  }
  let kelas
  if (jamAmbang !== null && (jamDasar === null || jamAmbang <= jamDasar)) kelas = 'LIQUID-MELESAT'
  else if (jamDasar !== null && jamPuncak !== null) kelas = 'AMBISI-BALIK-DASAR'
  else if (jamDasar !== null) kelas = 'TURUN-LANGSUNG'
  else if (jamPuncak !== null) kelas = 'TERGANTUNG-TINGGI'
  else kelas = 'MENDEM-DI-RANGE'
  return { kelas, jamAmbang, jamPuncak, jamDasar, tinggi, rendah }
}

// ---------- KEJAM-2: margin hidup-mati terkecil (fraksi dari entry) ----------
// jarak terdekat momen ini ke ambang/puncak/dasar — makin kecil makin mepet.
// Dipakai kurator (urutkan paling mepet dulu) & auditor (verifikasi kejamR).
function kejamDari(f) {
  const m = []
  m.push(f.jamAmbang != null ? (f.tinggi720 - f.ambangLikuid) / f.entry : (f.ambangLikuid - f.tinggi720) / f.entry)
  m.push(f.jamPuncak != null ? (f.tinggi720 - f.puncakAmbisi) / f.entry : (f.puncakAmbisi - f.tinggi720) / f.entry)
  m.push(f.jamDasar != null ? (f.dasarSelamat - f.rendah720) / f.entry : (f.rendah720 - f.dasarSelamat) / f.entry)
  return Math.min(...m)
}

// ---------- ambil klines 1h nyata (dua host resmi, koreksi kronologis V315) ----------
async function ambilKlines(simbol, halaman) {
  const semua = []
  let endTime
  for (let p = 0; p < halaman; p++) {
    let rows = null
    for (const host of ['https://data-api.binance.vision', 'https://api.binance.com']) {
      try {
        const url = `${host}/api/v3/klines?symbol=${simbol}&interval=1h&limit=1000${endTime ? `&endTime=${endTime}` : ''}`
        const res = await fetch(url)
        if (!res.ok) continue
        rows = await res.json()
        break
      } catch { /* host tumbang — coba host kedua */ }
    }
    if (!rows) throw new Error(`${simbol} hal${p} dua host spot tak terjangkau`)
    if (!rows.length) break
    semua.push(...rows)
    endTime = rows[0][0] - 1
    await new Promise(r => setTimeout(r, 180)) // sopan ke API publik
  }
  // V315 KOREKSI-KRONOLOGIS: halaman dikumpulkan mundur-waktu — diurutkan naik
  // agar t monoton dan masa depan benar-benar di depan (warisan wajib).
  semua.sort((a, b) => a[0] - b[0])
  return semua.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}

// ---------- ambil funding rate historis futures (publik) — warisan V315 ----------
async function ambilFunding(simbol, dariT, sampaiT) {
  try {
    const semua = []
    let startTime = dariT
    for (let p = 0; p < 6; p++) {
      const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${simbol}&startTime=${startTime}&endTime=${sampaiT}&limit=1000`
      const res = await fetch(url)
      if (!res.ok) return null // koin tanpa futures / tanpa data — jujur null
      const rows = await res.json()
      if (!Array.isArray(rows) || !rows.length) break
      semua.push(...rows.map(r => ({ t: r.fundingTime, r: +r.fundingRate })))
      if (rows.length < 1000) break
      startTime = rows[rows.length - 1].fundingTime + 1
      await new Promise(r => setTimeout(r, 180))
    }
    return semua
  } catch { return null }
}
// rata 3 funding terakhir ≤ waktu momen (posisi diketahui para shorts saat itu)
function fundingPada(dataF, t) {
  if (!dataF || !dataF.length) return null
  let hi = -1
  let a = 0, b = dataF.length - 1, mid
  while (a <= b) { mid = (a + b) >> 1; if (dataF[mid].t <= t) { hi = mid; a = mid + 1 } else b = mid - 1 }
  if (hi < 0) return null
  const tiga = dataF.slice(Math.max(0, hi - 2), hi + 1)
  return tiga.reduce((s, x) => s + x.r, 0) / tiga.length
}

const jarakAman = (i, daftar, jrk) => daftar.every(j => Math.abs(i - j) >= jrk)
const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z')

// ---------- kurator: pilih deterministik round-robin anti-tabrakan (warisan) ----------
// kandidat SUDAH terurut paling-mepet dulu — yang dipilih duluan yang kejam.
// pemilikTanda DIWARISKAN lintas bank (utama → dadakan): satu wajah satu kelas.
function pilihKandidat(kandidat, sasaranKelas, koinData, pemilikTanda) {
  pemilikTanda = pemilikTanda || new Map()
  const pilihan = [], perKoin = new Map()
  const ambilDari = (ki, sasaran) => {
    let terambil = 0, maju = true
    while (terambil < sasaran && maju) {
      maju = false
      for (const { simbol } of koinData) {
        if (terambil >= sasaran) break
        const sudah = perKoin.get(simbol) || []
        if (sudah.length >= capKoin) continue
        for (const c of (kandidat[ki][simbol] || [])) {
          if (c.dipakai) continue
          const pemilik = pemilikTanda.get(c.tanda)
          if (pemilik && pemilik !== KELAS_HASIL[ki].id) continue // wajah sudah milik kelas lain
          if (!jarakAman(c.i, sudah, jarak)) continue
          c.dipakai = true
          sudah.push(c.i); perKoin.set(simbol, sudah)
          pemilikTanda.set(c.tanda, KELAS_HASIL[ki].id)
          pilihan.push({ ki, ...c }); terambil++; maju = true
          break
        }
      }
    }
    return terambil
  }
  const totalAwal = sasaranKelas.reduce((a, b) => a + b, 0)
  let kurang = totalAwal - KELAS_HASIL.reduce((a, _k, ki) => a + ambilDari(ki, sasaranKelas[ki]), 0)
  let jaga = 0
  while (kurang > 0 && jaga < totalAwal * 10) {
    kurang -= ambilDari(jaga % KELAS_HASIL.length, 1)
    jaga++
  }
  if (kurang > 0) throw new Error(`soal tak cukup: kurang ${kurang} dari ${totalAwal} — jendela wajib diperluas, bukan diperdaya`)
  pilihan.sort((a, b) => a.ki - b.ki || a.t - b.t)
  return { pilihan, pemilikTanda, sasaranAwal: sasaranKelas }
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  console.log(`mengambil klines 1h nyata ${KOIN.length} koin × ${HALAMAN} halaman (±360.000 lilin) + funding futures…`)
  const koinData = []
  for (const simbol of KOIN) {
    const lilin = await ambilKlines(simbol, HALAMAN)
    if (lilin.length < 1000) throw new Error(`${simbol} lilin terlalu sedikit: ${lilin.length}`)
    const f = await ambilFunding(simbol, lilin[0].t, lilin[lilin.length - 1].t)
    koinData.push({ simbol, lilin, funding: f })
    console.log(`  ${simbol}: ${lilin.length} lilin, funding ${f ? f.length + ' titik' : 'TAK ADA (jujur null)'} (${iso(lilin[0].t)} → ${iso(lilin[lilin.length - 1].t)})`)
  }

  // ---------- kurasi momen konsolidasi — kartu minim 10 lilin ----------
  const kurasi = (koinDataTerpotong) => {
    const kandidat = KELAS_HASIL.map(() => ({}))
    const stat = {}
    for (const k of KELAS_HASIL) stat[k.id] = { momen: 0 }
    for (const { simbol, lilin, funding } of koinDataTerpotong) {
      if (lilin.length < STRIP + JENDELA + 2) continue
      for (let i = STRIP - 1; i < lilin.length - JENDELA; i++) {
        // kartu dibulatkan PERSIS seperti yang akan tersimpan — auditor cocok by-construction
        const strip = lilin.slice(i - STRIP + 1, i + 1)
          .map(l => ({ o: R8(l.o), h: R8(l.h), l: R8(l.l), c: R8(l.c), v: R8(l.v) }))
        const x = fiturDari(strip)
        const lebar = (x.hiAll - x.loAll) / x.e
        if (lebar > KONSOL_MAX) continue // bukan konsolidasi — skenario tak berlaku
        const entry = R8(x.e), puncakAmbisi = R8(x.hiAll), dasarSelamat = R8(x.loAll)
        const ambangLikuid = R8(entry * AMBANG_R)
        const jalan = lilin.slice(i + 1, i + 1 + JENDELA) // jalan masa depan tetap mentah (fakta penuh)
        const put = putusan720(entry, puncakAmbisi, dasarSelamat, ambangLikuid, jalan)
        stat[put.kelas].momen++
        const f24 = fundingPada(funding, lilin[i].t)
        const f24r = f24 == null ? null : R8(f24)
        const tanda = tandaDari(x, f24r)
        const kejam = R8(kejamDari({ entry, puncakAmbisi, dasarSelamat, ambangLikuid,
          jamAmbang: put.jamAmbang, jamPuncak: put.jamPuncak, jamDasar: put.jamDasar,
          tinggi720: put.tinggi, rendah720: put.rendah }))
        ;(kandidat[KELAS_HASIL.findIndex(k => k.id === put.kelas)][simbol] =
          kandidat[KELAS_HASIL.findIndex(k => k.id === put.kelas)][simbol] || []).push({
          i, t: lilin[i].t, simbol, tanda, dipakai: false, kejam,
          entry, puncakAmbisi, dasarSelamat, ambangLikuid,
          jamAmbang: put.jamAmbang, jamPuncak: put.jamPuncak, jamDasar: put.jamDasar,
          tinggi720: put.tinggi, rendah720: put.rendah, // mentah — konsistensi jam↔fakta eksak
          closeJendela: R8(lilin[i + JENDELA].c), fundingR: f24r,
        })
      }
    }
    // KEJAM-2: urutkan paling-mepet dulu — deterministik (kejam naik, lalu waktu)
    for (let ki = 0; ki < kandidat.length; ki++)
      for (const s of Object.keys(kandidat[ki]))
        kandidat[ki][s].sort((a, b) => a.kejam - b.kejam || a.t - b.t)
    return { kandidat, stat }
  }
  // kartu 10 lilin dibangun dari larik jendela yang SAMA dengan indeks kandidat
  // (pelajaran V315: memakai larik lain = kartu bergeser)
  const bangunSoal = (sel, lilinJendela, mulaiId) => sel.pilihan.map((c, idx) => {
    const strip = lilinJendela.get(c.simbol).slice(c.i - STRIP + 1, c.i + 1)
      .map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)])
    return {
      id: mulaiId + idx, simbol: c.simbol, waktu: iso(c.t),
      premis: `short x1 di ${c.entry}; puncak ambisi ${c.puncakAmbisi}; dasar selamat ${c.dasarSelamat}; ambang likuidasi ${c.ambangLikuid} (rugi 90%) — jendela ${JENDELA} jam; kartu hanya ${STRIP} lilin`,
      entry: c.entry, puncakAmbisi: c.puncakAmbisi, dasarSelamat: c.dasarSelamat, ambangLikuid: c.ambangLikuid,
      strip10: strip, tanda: c.tanda, funding24: c.fundingR, kejamR: c.kejam,
      kelasHasil: KELAS_HASIL[c.ki].id,
      jamAmbang: c.jamAmbang, jamPuncak: c.jamPuncak, jamDasar: c.jamDasar,
      tinggi720: c.tinggi720, rendah720: c.rendah720, close720: c.closeJendela,
    }
  })

  // --- bank utama: 2000 soal dari 10.000 jam terakhir ---
  const jendelaUtama = koinData.map(({ simbol, lilin, funding }) => ({ simbol, lilin: lilin.slice(-UTAMA_JAM), funding }))
  console.log('\n--- mengkurasi kolam utama (kartu 10 lilin)… ---')
  const utama = kurasi(jendelaUtama)
  console.log('--- bukti pasar kejam: 30 hari setelah konsolidasi (kolam utama) ---')
  for (const k of KELAS_HASIL) console.log(`  ${k.id}: ${utama.stat[k.id].momen} momen konsolidasi`)
  const pemilikTandaGlobal = new Map() // satu wajah satu kelas LINTAS bank utama & dadakan
  const selUtama = pilihKandidat(utama.kandidat, [320, 560, 460, 420, 240], jendelaUtama, pemilikTandaGlobal)
  const lilinUtama = new Map(jendelaUtama.map(({ simbol, lilin }) => [simbol, lilin]))
  const soal2000 = bangunSoal(selUtama, lilinUtama, 1)

  const distKoin = {}, distKelas = {}, distFunding = { negatif: 0, positifKecil: 0, panas: 0, tanpaData: 0 }
  for (const s of soal2000) {
    distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1
    distKelas[s.kelasHasil] = (distKelas[s.kelasHasil] || 0) + 1
    const g = s.funding24 == null ? 'tanpaData' : s.funding24 < 0 ? 'negatif' : s.funding24 > 0.0005 ? 'panas' : 'positifKecil'
    distFunding[g]++
  }
  // KEJAM-4: jebakan sinyal tunggal — satu angka funding tak menentukan nasib
  const liquid = soal2000.filter(s => s.kelasHasil === 'LIQUID-MELESAT')
  const fundingTrap = {
    liquidFundingNegatif: liquid.filter(s => s.funding24 != null && s.funding24 < 0).length,
    liquidFundingPositif: liquid.filter(s => s.funding24 != null && s.funding24 >= 0).length,
    negatifTanpaSqueeze: soal2000.filter(s => s.kelasHasil !== 'LIQUID-MELESAT' && s.funding24 != null && s.funding24 < 0).length,
  }
  // KEJAM-2: seberapa mepet bank ini
  const kejamArr = soal2000.map(s => s.kejamR).sort((a, b) => a - b)
  const kejamStat = {
    median: kejamArr[Math.floor(kejamArr.length / 2)],
    p25: kejamArr[Math.floor(kejamArr.length / 4)],
    p75: kejamArr[Math.floor(kejamArr.length * 3 / 4)],
    mepet2persen: kejamArr.filter(k => k <= 0.02).length,
    mepet5persen: kejamArr.filter(k => k <= 0.05).length,
  }

  // --- bank dadakan: 150 soal dari 2.000 jam LAMA (tak tersentuh saat tempa utama) ---
  const jendelaLama = koinData.map(({ simbol, lilin, funding }) => ({ simbol, lilin: lilin.slice(0, Math.max(STRIP + JENDELA + 2, lilin.length - UTAMA_JAM)), funding }))
  console.log('--- mengkurasi kolam lama (dadakan)… ---')
  const lama = kurasi(jendelaLama)
  const selLama = pilihKandidat(lama.kandidat, [12, 40, 34, 38, 26], jendelaLama, pemilikTandaGlobal)
  const lilinLama = new Map(jendelaLama.map(({ simbol, lilin }) => [simbol, lilin]))
  const soal150 = bangunSoal(selLama, lilinLama, 1)
  const distKoin150 = {}, distKelas150 = {}
  for (const s of soal150) { distKoin150[s.simbol] = (distKoin150[s.simbol] || 0) + 1; distKelas150[s.kelasHasil] = (distKelas150[s.kelasHasil] || 0) + 1 }

  const tulis = (file, protokol, soal, stat, distK, distKl, ekstra, cara) => {
    const bank = {
      protokol, epoch: 'V316', diperbikungAt: new Date().toISOString(),
      sumber: 'Binance spot klines 1h publik (data-api.binance.vision / api.binance.com) + funding rate futures publik (fapi.binance.com) — lilin, waktu, harga, funding ASLI, nol karangan',
      cara,
      aturanKelas: KELAS_HASIL.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })),
      statistikMomen: stat, distKoin, distKelas, distFunding, ...ekstra, jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  const caraUtama = `mandat pemilik V316: 2000 soal jauh lebih kejam dengan minim database — apakah jejak ambisius bisa diketahui dari sedikit data; KEJAM-1 kartu ${STRIP} lilin (V315: 24 — separuh data) konsolidasi range ≤ ${(KONSOL_MAX * 100).toFixed(0)}%; short x1 di close strip; puncak ambisi = atas range; dasar selamat = bawah range; ambang likuidasi = entry×${AMBANG_R} (rugi 90%, margin maintenance); jendela nilai ${JENDELA} jam (30 hari); 5 kelas dari fakta tinggi/rendah nyata; konservatif dalam satu lilin (yang menyiksa short dihitung dulu); KEJAM-2 seleksi paling-mepet: kandidat diurut margin hidup-mati terkecil dulu (kejamDari = jarak terdekat ke ambang/puncak/dasar ÷ entry — yang nyaris berbalik diutamakan); KEJAM-4 jebakan sinyal tunggal dijurnal (fundingTrap); tanda 20 bit dari kartu terbulatkan yang sama dengan tersimpan (auditor cocok by-construction); satu tanda satu kelas lintas bank utama & dadakan; sasaran awal [320,560,460,420,240]=2000 — kelas yang kurang dilempar jujur ke kelas lain (giliran tetap), kurang total = jendela diperluas bukan diperdaya`
  tulis('ujian/soal-jejak-2000.json', 'SOAL-JEJAK-2000', soal2000, utama.stat, distKoin, distKelas,
    { kejamStat, fundingTrap }, caraUtama)
  tulis('ujian/soal-jejak-dadakan-150.json', 'SOAL-JEJAK-150-DADAKAN', soal150, lama.stat, distKoin150, distKelas150,
    {}, caraUtama + `; dadakan dari jendela LAMA (±2.000 jam pertama) tak tersentuh tempa utama; sasaran [12,40,34,38,26]`)

  console.log('\ndist kelas utama:', JSON.stringify(distKelas))
  console.log('dist funding utama:', JSON.stringify(distFunding))
  console.log('jebakan sinyal tunggal:', JSON.stringify(fundingTrap))
  console.log('kekejaman margin (fraksi entry):', JSON.stringify(kejamStat))
  console.log('dist kelas dadakan:', JSON.stringify(distKelas150))
}

main().catch(e => { console.error('tambang-jejak MATI-PENUH:', e.message); process.exit(1) })
