#!/usr/bin/env node
// ============================================================
// TAMBANG-SQUEEZE (V315) — mandat pemilik (2026-10-09):
//   "kita ujian simulasi lagi dengan tipe konsolidasi yang ternyata
//    justru menglikuidasi para shorts yang x1. ... mereka pikir harga
//    saat ini di 1.1, target tertinggi ambisius di 1.3, jual di 0.85 —
//    ternyata 1.3 tercapai tapi harga melesat ke 2.7, tak pernah
//    menyentuh 0.85 — modal mereka terliquidasi, laporan fund shorts
//    pay long. Apakah micaprofita mampu melihat kejadian tak terduga
//    ini? 700 soal; bila tidak 700/700 maka ditempakan lagi."
// ------------------------------------------------------------
// Skenario soal (setia cerita pemilik, dari lilin NYATA nol karangan):
//   strip 24 lilin = KONSOLIDASI (range ≤ 12% dari harga).
//   para shorts x1 masuk di close strip (1.1-an) dengan keyakinan:
//     puncak ambisi = atas range (1.3-an) — "pasti mentok di situ";
//     dasar selamat = bawah range (0.85-an) — "pasti balik ke sini";
//     ambang likuidasi = entry × 1.90 (leverage 1x, rugi 90% = margin
//     maintenance habis) — hal yang TIDAK PERNAH mereka pikirkan.
//   Jendela nilai 720 jam (30 hari). 5 kelas hasil dari fakta:
//     LIQUID-MELESAT      — ambang likuidasi tercapai SEBELUM dasar
//                           (kasus pemilik: 1.3 tercapai → 2.7, tanpa 0.85)
//     AMBISI-BALIK-DASAR  — puncak ambisi tercapai, LALU dasar tercapai
//                           (skenario yang mereka bayangkan — selamat)
//     TURUN-LANGSUNG      — dasar tercapai tanpa pernah sentuh puncak
//     TERGANTUNG-TINGGI   — puncak tercapai, dasar TAK pernah, ambang TAK
//                           pernah (menggantung di atas — bahaya laten)
//     MENDEM-DI-RANGE     — tak ada yang tercapai dalam 30 hari
//   Konservatif dalam satu lilin: yang menyiksa short dihitung dulu
//   (ambang > puncak-ambisi > dasar).
// MEMPERDALAM DATA (pelajaran pemilik: "mereka lupa ... gak memperdalam
// data"): fitur FUNDING RATE futures Binance publik (fapi.binance.com)
// masuk kartu — funding negatif = shorts membayar longs = bahan bakar
// squeeze, persis "laporan fund shorts pay long". Tanda jadi 20 bit.
// Warisan organ tempaan dijaga: kartu 24 lilin, fiturDari/tandaDari
// gaya tambang900, anti-tabrakan wajah, round-robin deterministik,
// segel SHA-256 hash16, nol Math.random.
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

const STRIP = 24            // kartu 24 lilin (warisan)
const JENDELA = 720         // jendela nilai 30 hari (jam)
const AMBANG_R = 1.90       // likuidasi short x1: rugi 90% dari entry
const KONSOL_MAX = 0.12     // range strip ≤ 12% = konsolidasi
const HALAMAN = 8           // 8.000 jam ≈ 333 hari per koin
const UTAMA_JAM = 6000      // kolam utama 6.000 jam terakhir
const capKoin = 32
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

// ---------- fitur KARTU (warisan tambang900 + kedalaman funding) ----------
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
// tanda 20 bit = 18 bit warisan + 2 bit kedalaman funding (V315)
function tandaDari(x, funding) {
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,        // shorts membayar longs — bahan bakar squeeze
    funding != null && funding > 0.0005,   // longs padat panas
  ].map(Number).join('')
}

// ---------- kunci kelas dari FAKTA 720 jam (fungsi murni; dipakai kurator & auditor) ----------
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

// ---------- ambil klines 1h nyata ----------
async function ambilKlines(simbol, halaman) {
  const semua = []
  let endTime
  for (let p = 0; p < halaman; p++) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1h&limit=1000${endTime ? `&endTime=${endTime}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${simbol} hal${p} binance ${res.status}`)
    const rows = await res.json()
    if (!rows.length) break
    semua.push(...rows)
    endTime = rows[0][0] - 1
    await new Promise(r => setTimeout(r, 180)) // sopan ke API publik
  }
  // V315 KOREKSI-KRONOLOGIS: halaman dikumpulkan mundur-waktu (blok terbaru
  // dulu) — tanpa urutan ini, jendela 720 jam bisa menyilang blok dan
  // rentang funding terbalik (pelajaran dari run pertama: funding 0 titik
  // karena startTime > endTime). Diurutkan naik: t monoton, masa depan
  // benar-benar di depan. (Warisan tambang900/500/300/200 ditambal juga —
  // bank lama tersegel TIDAK diubah; kejujuran dibuka di TUJUAN §12z.)
  semua.sort((a, b) => a[0] - b[0])
  return semua.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}

// ---------- ambil funding rate historis futures (publik) — kedalaman data V315 ----------
async function ambilFunding(simbol, dariT, sampaiT) {
  try {
    const semua = []
    let startTime = dariT
    for (let p = 0; p < 4; p++) {
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
  let hi = -1, lo = 0, mid
  let a = 0, b = dataF.length - 1
  while (a <= b) { mid = (a + b) >> 1; if (dataF[mid].t <= t) { hi = mid; a = mid + 1 } else b = mid - 1 }
  if (hi < 0) return null
  const tiga = dataF.slice(Math.max(0, hi - 2), hi + 1)
  return tiga.reduce((s, x) => s + x.r, 0) / tiga.length
}

const jarakAman = (i, daftar, jrk) => daftar.every(j => Math.abs(i - j) >= jrk)
const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z')

// ---------- kurator: pilih deterministik round-robin anti-tabrakan ----------
// pemilikTanda DIWARISKAN lintas bank (utama → dadakan) — pelajaran TEMPAN:
// wajah yang sudah milik kelas di bank utama TAK BOLEH jadi kelas lain di dadakan,
// kalau tidak soal dadakan jadi tak-bisa-dipelajari (peta beku)
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
  // lemparan jujur kelas langka dicatat (dibuka di bank.cara lewat dist)
  pilihan.sort((a, b) => a.ki - b.ki || a.t - b.t)
  return { pilihan, pemilikTanda, sasaranAwal: sasaranKelas }
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  console.log('mengambil klines 1h nyata 30 koin × 8 halaman (±240.000 lilin) + funding futures…')
  const koinData = []
  for (const simbol of KOIN) {
    const lilin = await ambilKlines(simbol, HALAMAN)
    if (lilin.length < 1000) throw new Error(`${simbol} lilin terlalu sedikit: ${lilin.length}`)
    const f = await ambilFunding(simbol, lilin[0].t, lilin[lilin.length - 1].t)
    koinData.push({ simbol, lilin, funding: f })
    console.log(`  ${simbol}: ${lilin.length} lilin, funding ${f ? f.length + ' titik' : 'TAK ADA (jujur null)'} (${iso(lilin[0].t)} → ${iso(lilin[lilin.length - 1].t)})`)
  }

  // ---------- kurasi momen konsolidasi (skenario pemilik) ----------
  // semua momen: strip 24 lilin konsolidasi (≤12%); short x1 di close strip.
  const kurasi = (koinDataTerpotong) => {
    const kandidat = KELAS_HASIL.map(() => ({}))
    const stat = {}
    for (const k of KELAS_HASIL) stat[k.id] = { momen: 0 }
    for (const { simbol, lilin, funding } of koinDataTerpotong) {
      if (lilin.length < STRIP + JENDELA + 2) continue
      for (let i = STRIP; i < lilin.length - JENDELA; i++) {
        const strip = lilin.slice(i - STRIP, i + 1)
        const x = fiturDari(strip)
        const lebar = (x.hiAll - x.loAll) / x.e
        if (lebar > KONSOL_MAX) continue // bukan konsolidasi — skenario tak berlaku
        const entry = x.e
        const puncakAmbisi = x.hiAll, dasarSelamat = x.loAll
        const ambangLikuid = R8(entry * AMBANG_R)
        const jalan = lilin.slice(i + 1, i + 1 + JENDELA)
        const put = putusan720(entry, puncakAmbisi, dasarSelamat, ambangLikuid, jalan)
        const ki = KELAS_HASIL.findIndex(k => k.id === put.kelas)
        stat[put.kelas].momen++
        const f24 = fundingPada(funding, lilin[i].t)
        const tanda = tandaDari(x, f24)
        ;(kandidat[ki][simbol] = kandidat[ki][simbol] || []).push({
          i, t: lilin[i].t, simbol, tanda, dipakai: false,
          entryR: R8(entry), puncakR: R8(puncakAmbisi), dasarR: R8(dasarSelamat), ambangR: ambangLikuid,
          jamAmbang: put.jamAmbang, jamPuncak: put.jamPuncak, jamDasar: put.jamDasar,
          tinggiR: R8(put.tinggi), rendahR: R8(put.rendah),
          closeJendelaR: R8(lilin[i + JENDELA].c), fundingR: f24 == null ? null : R8(f24),
        })
      }
    }
    return { kandidat, stat }
  }
  const rekonstruksi = (c, lilin) => {
    const strip = lilin.slice(c.i - STRIP, c.i + 1)
    return { ...c, stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]) }
  }

  // --- bank utama: 700 soal dari 6.000 jam terakhir ---
  const jendelaUtama = koinData.map(({ simbol, lilin, funding }) => ({ simbol, lilin: lilin.slice(-UTAMA_JAM), funding }))
  const utama = kurasi(jendelaUtama)
  console.log('\n--- bukti pasar kejam: 30 hari setelah konsolidasi (kolam utama) ---')
  for (const k of KELAS_HASIL) console.log(`  ${k.id}: ${utama.stat[k.id].momen} momen konsolidasi`)
  const pemilikTandaGlobal = new Map() // satu wajah satu kelas LINTAS bank utama & dadakan
  const selUtama = pilihKandidat(utama.kandidat, [40, 190, 160, 230, 80], jendelaUtama, pemilikTandaGlobal)
  // rekonstruksi strip WAJIB dari larik jendela yang sama dengan indeks kandidat
  // (pelajaran run-1: memakai larik penuh menggeser kartu 2.000 jam — kartu rusak)
  const lilinUtama = new Map(jendelaUtama.map(({ simbol, lilin }) => [simbol, lilin]))
  const soal700 = selUtama.pilihan.map((c, idx) => {
    const r = rekonstruksi(c, lilinUtama.get(c.simbol))
    return {
      id: idx + 1, simbol: c.simbol, waktu: iso(c.t),
      premis: `short x1 di ${c.entryR}; puncak ambisi ${c.puncakR}; dasar selamat ${c.dasarR}; ambang likuidasi ${c.ambangR} (rugi 90%) — jendela ${JENDELA} jam`,
      entry: c.entryR, puncakAmbisi: c.puncakR, dasarSelamat: c.dasarR, ambangLikuid: c.ambangR,
      strip24: r.stripR, tanda: c.tanda, funding24: c.fundingR,
      kelasHasil: KELAS_HASIL[c.ki].id,
      jamAmbang: c.jamAmbang, jamPuncak: c.jamPuncak, jamDasar: c.jamDasar,
      tinggi720: c.tinggiR, rendah720: c.rendahR, close720: c.closeJendelaR,
    }
  })
  const distKoin = {}, distKelas = {}, distFunding = { negatif: 0, positifKecil: 0, panas: 0, tanpaData: 0 }
  for (const s of soal700) {
    distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1
    distKelas[s.kelasHasil] = (distKelas[s.kelasHasil] || 0) + 1
    const g = s.funding24 == null ? 'tanpaData' : s.funding24 < 0 ? 'negatif' : s.funding24 > 0.0005 ? 'panas' : 'positifKecil'
    distFunding[g]++
  }

  // --- bank dadakan: 70 soal dari 2.000 jam LAMA (tak tersentuh saat tempa utama) ---
  const jendelaLama = koinData.map(({ simbol, lilin, funding }) => ({ simbol, lilin: lilin.slice(0, Math.max(STRIP + JENDELA + 2, lilin.length - UTAMA_JAM)), funding }))
  const lama = kurasi(jendelaLama)
  const selLama = pilihKandidat(lama.kandidat, [4, 19, 16, 21, 10], jendelaLama, pemilikTandaGlobal)
  const lilinLama = new Map(jendelaLama.map(({ simbol, lilin }) => [simbol, lilin]))
  const soal70 = selLama.pilihan.map((c, idx) => {
    const r = rekonstruksi(c, lilinLama.get(c.simbol))
    return {
      id: idx + 1, simbol: c.simbol, waktu: iso(c.t),
      premis: `short x1 di ${c.entryR}; puncak ambisi ${c.puncakR}; dasar selamat ${c.dasarR}; ambang likuidasi ${c.ambangR} (rugi 90%) — jendela ${JENDELA} jam`,
      entry: c.entryR, puncakAmbisi: c.puncakR, dasarSelamat: c.dasarR, ambangLikuid: c.ambangR,
      strip24: r.stripR, tanda: c.tanda, funding24: c.fundingR,
      kelasHasil: KELAS_HASIL[c.ki].id,
      jamAmbang: c.jamAmbang, jamPuncak: c.jamPuncak, jamDasar: c.jamDasar,
      tinggi720: c.tinggiR, rendah720: c.rendahR, close720: c.closeJendelaR,
    }
  })
  const distKoin70 = {}, distKelas70 = {}
  for (const s of soal70) { distKoin70[s.simbol] = (distKoin70[s.simbol] || 0) + 1; distKelas70[s.kelasHasil] = (distKelas70[s.kelasHasil] || 0) + 1 }

  const tulis = (file, protokol, soal, stat, distK, distKl, cara) => {
    const bank = {
      protokol, epoch: 'V315', diperbikungAt: new Date().toISOString(),
      sumber: 'Binance spot klines 1h publik (api.binance.com) + funding rate futures publik (fapi.binance.com) — lilin, waktu, harga, funding ASLI, nol karangan',
      cara,
      aturanKelas: KELAS_HASIL.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })),
      statistikMomen: stat, distKoin, distKelas, distFunding, jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  const caraUtama = `mandat pemilik V315: ujian konsolidasi yang menglikuidasi shorts x1 — strip 24 lilin konsolidasi (range ≤ ${(KONSOL_MAX * 100).toFixed(0)}%), short x1 di close strip; puncak ambisi = atas range; dasar selamat = bawah range; ambang likuidasi = entry×${AMBANG_R} (rugi 90%, margin maintenance); jendela nilai ${JENDELA} jam (30 hari); 5 kelas dari fakta tinggi/rendah nyata; konservatif dalam satu lilin (yang menyiksa short dihitung dulu); kartu 24 lilin + tanda 20 bit (18 warisan + 2 bit funding futures); satu tanda satu kelas (nol tabrakan wajah); sasaran awal [40,190,160,230,80] — kelas yang kurang dilempar jujur ke kelas lain (giliran tetap), kurang total = jendela diperluas bukan diperdaya`
  tulis('ujian/soal-squeeze-700.json', 'SOAL-SQUEEZE-700', soal700, utama.stat, distKoin, distKelas, caraUtama)
  tulis('ujian/soal-squeeze-dadakan-70.json', 'SOAL-SQUEEZE-70-DADAKAN', soal70, lama.stat, distKoin70, distKelas70, caraUtama + '; dadakan dari jendela LAMA tak tersentuh tempa utama')

  console.log('\ndist kelas utama:', JSON.stringify(distKelas))
  console.log('dist funding utama:', JSON.stringify(distFunding))
  console.log('dist kelas dadakan:', JSON.stringify(distKelas70))
}

main().catch(e => { console.error('tambang-squeeze MATI-PENUH:', e.message); process.exit(1) })
