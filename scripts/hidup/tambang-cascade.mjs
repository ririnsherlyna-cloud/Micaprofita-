#!/usr/bin/env node
// ============================================================
// TAMBANG-CASCADE (V323) — mandat pemilik (2026-10-10):
//   "ujian simulasi brutal: setiap soal adalah liquidation cascade
//    yang secara historis diambil dari data nyata yang pernah membuat
//    banyak jutaan trader terliquidasi sehingga bisa dibedah lebih
//    dalam. 1000 soal harus terus ditempa agar 1000/1000 lulus total
//    benar semuanya. Dana yang diberikan 1500 dolar."
// ------------------------------------------------------------
// Sumber soal HANYA peristiwa nyata (nol karangan):
//   FASE A — klines 1d publik (5.5 tahun, 2000 lilin per koin):
//     hari-kaskade = drop harian ≤ -6% DAN (volume ≥ 2.2× rata 20 hari
//     SEBELUMnya ATAU wick bawah ≥ 5% dari open — flick likuidasi)
//     ATAU dua hari beruntun ≤ -10% dengan volume panas.
//     Hari beruntun (gap ≤ 3 hari) = SATU peristiwa; inti peristiwa =
//     hari dengan volume terbesar. Maks 16 peristiwa per koin, dipilih
//     merata menyebar sejarah (deterministik, nol acak).
//   FASE B — untuk tiap peristiwa: klines 1h jendela 168 jam
//     [T0-72h, T0+96h) — semua momen ujian hidup di dalam kaskade
//     betulan yang melikuidasi jutaan trader.
//   FASE C — momen ujian = lilin i dengan strip 24 lilin pra-momen
//     memenuhi PANIK-PRA-KASKADE (dariPuncak ≤ -5% DAN volz ≥ 2 ATAU
//     wick bawah ≥ 1.2× badan ATAU r1 ≤ -1.5%). Posisi long x1 masuk
//     di close strip (mewakili jutaan long yang terjebak); ambang
//     likuidasi = entry × 0.80 (long x5, rugi 20% = margin maintenance
//     habis). Jalan 48 jam memutuskan 5 kelas dari FAKTA — bedah
//     KECEPATAN (pelajaran run-1: dist arah timpang ekstrem — di jendela
//     kaskade, 48 jam nyaris selalu menyentuh entry ATAU ambang, jadi
//     anatomi sejati kaskade ada pada kapan, bukan hanya arah):
//     LIKUID-KILAT / LIKUID-PELAN / V-DALAM-KILAT / V-DALAM-LAMBAT /
//     V-TIPIS.
//   Konservatif dalam satu lilin: yang menyiksa long dihitung dulu
//   (l ≤ ambang dicek sebelum h ≥ entry).
// Pembagian waktu warisan TEMPAN: peristiwa dalam 900 hari terakhir
// → bank utama (1000); lebih tua → bank dadakan (100), tak tersentuh
// saat tempa utama — uji paham-vs-hafal.
// Warisan organ dijaga: kartu 24 lilin, fiturDari gaya tambang900,
// tanda 32 bit (18 warisan + 2 funding + 12 anatomi kaskade), anti-tabrakan
// wajah (satu tanda satu kelas LINTAS bank), round-robin deterministik,
// segel SHA-256 hash16, nol Math.random, strip disimpan hasil R8 dan
// kurasi dihitung dari strip R8 yang sama (ujiBank deterministik).
// ============================================================
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

// cache LUAR repo (tak tercommit) — iterasi tambang sopan ke API publik;
// data tetap mentah Binance, cache hanya menyimpan jawaban API verbatim
const CACHE = join(process.cwd(), '..', 'cache-cascade')
const cacheGet = (kunci) => {
  try { return JSON.parse(readFileSync(join(CACHE, kunci + '.json'), 'utf8')) } catch { return null }
}
const cacheSet = (kunci, data) => {
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(join(CACHE, kunci + '.json'), JSON.stringify(data))
}

const KOIN = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','TRXUSDT',
  'LINKUSDT','AVAXUSDT','DOTUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','ARBUSDT','OPUSDT',
  'INJUSDT','SUIUSDT','APTUSDT','FILUSDT','ETCUSDT','XLMUSDT','PEPEUSDT','SHIBUSDT',
  'WLDUSDT','TIAUSDT','SEIUSDT','ORDIUSDT','JUPUSDT','AAVEUSDT',
]

const STRIP = 24            // kartu 24 lilin (warisan)
const JENDELA = 48          // jalan nilai 48 jam (2 hari — kaskade cepat)
const LAMA_HARIAN = 2000    // sejarah 1d per koin (±5.5 tahun)
const UTAMA_HARI = 900      // peristiwa dalam 900 hari terakhir → bank utama
const MAKSI_PERISTIWA = 24  // per koin, merata menyebar sejarah
const AMBANG_R = 0.80       // likuidasi long x5: harga jatuh 20% dari entry
const capKoin = 60
const JARAK_MS = 24 * 3600e3 // KARTU 24 jam tak boleh tumpang (warisan TEMPAN: jarak ≥ strip; jalan boleh berbagi) — waktu ABSOLUT (momen lintas peristiwa tak boleh dibanding indeks jendela lokal)

const KELAS_HASIL = [
  { id: 'LIKUID-KILAT', naive: 'TURUN',
    cerita: 'kaskade brutal: ambang likuidasi long x5 (entry×0.80) tersentuh dalam ≤12 jam pertama — long tak sempat berpikir; legendaris: LUNA, 19-Mei-2021' },
  { id: 'LIKUID-PELAN', naive: 'TURUN',
    cerita: 'pengeringan lambat: ambang tersentuh setelah >12 jam — sempat keluar tapi tak keluar; takdir long yang mengaruk' },
  { id: 'V-DALAM-KILAT', naive: 'TURUN',
    cerita: 'capitulation kilat: digoreng dalam (low ≤ entry−7%) tapi pulih melewati entry dalam ≤24 jam — panik jual kehilangan paling pedih' },
  { id: 'V-DALAM-LAMBAT', naive: 'TURUN',
    cerita: 'penggorengan panjang: digoreng dalam, ambang utuh, pulih butuh >24 jam ATAU tak pulih dalam 48 jam — ujian mental paling kejam' },
  { id: 'V-TIPIS', naive: 'TURUN',
    cerita: 'panik gagal lahir kaskade: guncangan dangkal (low > entry−7%), ambang tak pernah tersentuh — long tak pernah diuji mati' },
]

// ---------- fitur KARTU (warisan tambang900 + kedalaman V315 + kaskade V323) ----------
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
// tanda 32 bit = 18 warisan + 2 funding (V315) + 12 anatomi kaskade (V323)
// (pelajaran run-3: momen panik menyalakan bit yang sama serentak — wajah
// homogen, anti-tabrakan jadi pintu sempit; tier ekstrem membuka variasi nyata)
function tandaDari(x, funding) {
  const dariPuncak = (x.e / x.hiAll - 1) * 100
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
    funding != null && funding < 0,        // shorts membayar longs
    funding != null && funding > 0.0005,   // longs padat panas
    x.r1 <= -1.8,                          // crashCepat: lilin terakhir merosot tajam
    x.volz >= 3,                           // volPanasLikuidasi: volume raksasa
    x.wickBawah >= 2,                      // capitulation: flick bawah dalam
    x.streakTurun >= 4,                    // kaskadeBeruntun
    dariPuncak <= -8,                      // jauhDariPuncak 24 jam
    x.wickBawah >= 1.2,                    // goresLikuidasi (lapis tipis capitulation)
    dariPuncak <= -12,                     // jebakan dalam: melebihi -12% dari puncak
    x.r3 <= -4,                            // kecepatan 3-jam ekstrem
    x.volz >= 6,                           // kerakalan likuidasi puncak
    x.rsi < 20,                            // panik ekstrem (RSI terjun bebas)
    x.streakTurun >= 6,                    // kaskade panjang beruntun
    x.lebarPct > 8,                        // rentang 24 jam meledak (>8%)
  ].map(Number).join('')
}
// premis PANIK-PRA-KASKADE dari kartu (fakta waktu-putusan — masa depan tak disentuh)
function panikPraKaskade(x) {
  const dariPuncak = (x.e / x.hiAll - 1) * 100
  return dariPuncak <= -3 && (x.volz >= 1.2 || x.wickBawah >= 0.8 || x.r1 <= -1.0)
}

// ---------- kunci kelas dari FAKTA 48 jam (fungsi murni; dipakai kurator & auditor) ----------
// konservatif: dalam satu lilin yang menyiksa long dihitung dulu (ambang > pulih)
// bedah KECEPATAN: kapan likuid (≤12 jam = kilat), kapan pulih (≤24 jam = kilat)
function putusan48(entry, ambang, jalan) {
  let jamAmbang = null, jamPulih = null
  let tinggi = -Infinity, rendah = Infinity
  for (let j = 0; j < jalan.length; j++) {
    const { h, l } = jalan[j]
    if (h > tinggi) tinggi = h
    if (l < rendah) rendah = l
    if (jamAmbang === null && l <= ambang) jamAmbang = j + 1
    if (jamPulih === null && h >= entry) jamPulih = j + 1
  }
  let kelas
  if (jamAmbang !== null) kelas = jamAmbang <= 12 ? 'LIKUID-KILAT' : 'LIKUID-PELAN'
  else if (rendah <= entry * 0.93) kelas = (jamPulih !== null && jamPulih <= 24) ? 'V-DALAM-KILAT' : 'V-DALAM-LAMBAT'
  else kelas = 'V-TIPIS'
  return { kelas, jamAmbang, jamPulih, tinggi, rendah }
}

// ---------- ambil klines nyata ----------
async function ambilKlines1d(simbol, halaman) {
  const kunci = `d-${simbol}-${halaman}`
  const hit = cacheGet(kunci)
  if (hit) return hit.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  const semua = []
  let endTime
  for (let p = 0; p < halaman; p++) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1d&limit=1000${endTime ? `&endTime=${endTime}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${simbol} 1d hal${p} binance ${res.status}`)
    const rows = await res.json()
    if (!rows.length) break
    semua.push(...rows)
    endTime = rows[0][0] - 1
    await new Promise(r => setTimeout(r, 200))
  }
  semua.sort((a, b) => a[0] - b[0]) // kronologis naik (pelajaran V315)
  cacheSet(kunci, semua)
  return semua.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}
async function ambilJendela1h(simbol, startT, endT) {
  const kunci = `h-${simbol}-${startT}`
  const hit = cacheGet(kunci)
  if (hit) return hit.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1h&startTime=${startT}&endTime=${endT}&limit=1000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${simbol} 1h jendela binance ${res.status}`)
  const rows = await res.json()
  const hasil = rows.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
  cacheSet(kunci, rows)
  return hasil
}
async function ambilFunding(simbol, dariT, sampaiT) {
  const kunci = `f-${simbol}`
  const hit = cacheGet(kunci)
  if (hit) return hit // null tersimpan = jujur tanpa data; array = titik funding
  try {
    const semua = []
    let startTime = dariT
    for (let p = 0; p < 8; p++) {
      const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${simbol}&startTime=${startTime}&endTime=${sampaiT}&limit=1000`
      const res = await fetch(url)
      if (!res.ok) { cacheSet(kunci, null); return null } // koin tanpa futures — jujur null
      const rows = await res.json()
      if (!Array.isArray(rows) || !rows.length) break
      semua.push(...rows.map(r => ({ t: r.fundingTime, r: +r.fundingRate })))
      if (rows.length < 1000) break
      startTime = rows[rows.length - 1].fundingTime + 1
      await new Promise(r => setTimeout(r, 200))
    }
    cacheSet(kunci, semua)
    return semua
  } catch { return null }
}
function fundingPada(dataF, t) {
  if (!dataF || !dataF.length) return null
  let hi = -1
  let a = 0, b = dataF.length - 1
  while (a <= b) { const mid = (a + b) >> 1; if (dataF[mid].t <= t) { hi = mid; a = mid + 1 } else b = mid - 1 }
  if (hi < 0) return null
  const tiga = dataF.slice(Math.max(0, hi - 2), hi + 1)
  return tiga.reduce((s, x) => s + x.r, 0) / tiga.length
}

const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z')
const isoHari = (t) => new Date(t).toISOString().slice(0, 10)

// ---------- FASE A: deteksi peristiwa kaskade nyata dari harian ----------
function deteksiPeristiwa(harian) {
  const hariKas = []
  for (let i = 20; i < harian.length; i++) {
    const d = harian[i]
    const vMean = harian.slice(i - 20, i).reduce((a, b) => a + b.v, 0) / 20
    if (vMean <= 0) continue
    const volz = d.v / vMean
    const wickB = (Math.min(d.o, d.c) - d.l) / d.o // positif saat wick bawah ada
    const drop = d.c / d.o - 1
    const drop2 = i >= 2 ? d.c / harian[i - 2].o - 1 : 0
    const satu = drop <= -0.06 && (volz >= 2.2 || wickB >= 0.05)
    const dua = drop2 <= -0.10 && volz >= 2.0
    if (satu || dua) hariKas.push({ i, volz, v: d.v })
  }
  // kelompokkan hari beruntun (gap ≤ 3 hari) jadi SATU peristiwa; inti = volume terbesar
  const peristiwa = []
  for (const h of hariKas) {
    const terakhir = peristiwa[peristiwa.length - 1]
    if (terakhir && h.i - terakhir.inti.i <= 3) {
      if (h.v > terakhir.inti.v) terakhir.inti = h
    } else peristiwa.push({ inti: h })
  }
  // maks 16 peristiwa per koin, dipilih merata menyebar sejarah (deterministik)
  if (peristiwa.length > MAKSI_PERISTIWA) {
    const langkah = peristiwa.length / MAKSI_PERISTIWA
    const dipilih = []
    for (let k = 0; k < MAKSI_PERISTIWA; k++) dipilih.push(peristiwa[Math.floor(k * langkah)])
    return dipilih
  }
  return peristiwa
}

const jarakAman = (i, daftar, jrk) => daftar.every(j => Math.abs(i - j) >= jrk)

// ---------- kurator: pilih deterministik round-robin anti-tabrakan (warisan) ----------
// pemilikTanda DIWARISKAN lintas bank (utama → dadakan) — wajah yang sudah
// milik kelas di bank utama TAK BOLEH jadi kelas lain di dadakan.
function pilihKandidat(kandidat, sasaranKelas, simbolList, pemilikTanda) {
  pemilikTanda = pemilikTanda || new Map()
  const pilihan = [], perKoin = new Map()
  const ambilDari = (ki, sasaran) => {
    let terambil = 0, maju = true
    while (terambil < sasaran && maju) {
      maju = false
      for (const simbol of simbolList) {
        if (terambil >= sasaran) break
        const sudah = perKoin.get(simbol) || []
        if (sudah.length >= capKoin) continue
        for (const c of (kandidat[ki][simbol] || [])) {
          if (c.dipakai) continue
          const pemilik = pemilikTanda.get(c.tanda)
          if (pemilik && pemilik !== KELAS_HASIL[ki].id) continue // wajah sudah milik kelas lain
          if (!jarakAman(c.t, sudah, JARAK_MS)) continue
          c.dipakai = true
          sudah.push(c.t); perKoin.set(simbol, sudah)
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
  const batasUtama = Date.now() - UTAMA_HARI * 86400e3
  console.log(`FASE A: klines 1d nyata ${KOIN.length} koin × ${LAMA_HARIAN} hari (±5.5 tahun) — memburu peristiwa kaskade betulan…`)
  const koinData = []
  for (const simbol of KOIN) {
    const harian = await ambilKlines1d(simbol, Math.ceil(LAMA_HARIAN / 1000))
    if (harian.length < 600) { console.log(`  ${simbol}: SKIP jujur (sejarah ${harian.length} hari terlalu pendek)`); continue }
    const peristiwa = deteksiPeristiwa(harian)
    const f = await ambilFunding(simbol, harian[0].t, harian[harian.length - 1].t)
    koinData.push({ simbol, harian, peristiwa, funding: f })
    console.log(`  ${simbol}: ${harian.length} hari, ${peristiwa.length} peristiwa kaskade (${isoHari(harian[0].t)} → ${isoHari(harian[harian.length - 1].t)}), funding ${f ? f.length + ' titik' : 'TAK ADA (jujur null)'}`)
  }
  if (koinData.length < 20) throw new Error(`koin sah ${koinData.length} < 20 — sumber nyata tak cukup, jujur berhenti`)

  console.log('\nFASE B: jendela 1h 168 jam per peristiwa…')
  let totJendela = 0
  for (const k of koinData) {
    k.jendela = []
    for (const ev of k.peristiwa) {
      const t0 = k.harian[ev.inti.i].t
      const startT = t0 - 72 * 3600e3, endT = t0 + 96 * 3600e3 - 1
      let lilin = []
      try { lilin = await ambilJendela1h(k.simbol, startT, endT) } catch (e) { console.log(`  ${k.simbol} ${isoHari(t0)}: jendela gagal (${e.message}) — lewati jujur`); continue }
      if (lilin.length < STRIP + JENDELA + 2) continue
      k.jendela.push({ t0, hari: isoHari(t0), lilin, ev })
      totJendela++
    }
    await new Promise(r => setTimeout(r, 200))
  }
  console.log(`  jendela kaskade terangkut: ${totJendela}`)

  // ---------- FASE C: kurasi momen panik pra-kaskade (kartu dari strip R8 — deterministik) ----------
  const kurasi = (jendelaList) => {
    const kandidat = KELAS_HASIL.map(() => ({}))
    const stat = {}
    for (const k of KELAS_HASIL) stat[k.id] = { momen: 0 }
    let peristiwaDipakai = 0
    for (const { t0, hari, lilin, simbol, funding } of jendelaList) {
      peristiwaDipakai++
      for (let i = STRIP; i < lilin.length - JENDELA; i++) {
        const stripR = lilin.slice(i - STRIP, i + 1).map(l => ({ o: R8(l.o), h: R8(l.h), l: R8(l.l), c: R8(l.c), v: R8(l.v) }))
        const x = fiturDari(stripR)
        if (!panikPraKaskade(x)) continue
        const entry = R8(x.e)
        const ambang = R8(entry * AMBANG_R)
        const jalan = lilin.slice(i + 1, i + 1 + JENDELA).map(l => ({ h: R8(l.h), l: R8(l.l), c: R8(l.c) }))
        const put = putusan48(entry, ambang, jalan)
        const ki = KELAS_HASIL.findIndex(k => k.id === put.kelas)
        stat[put.kelas].momen++
        const f24 = fundingPada(funding, lilin[i].t)
        const tanda = tandaDari(x, f24)
        ;(kandidat[ki][simbol] = kandidat[ki][simbol] || []).push({
          i, t: lilin[i].t, t0, simbol, tanda, dipakai: false,
          entryR: entry, ambangR: ambang,
          jamAmbang: put.jamAmbang, jamPulih: put.jamPulih,
          rendahR: R8(put.rendah), tinggiR: R8(put.tinggi), closeR: R8(put.close48),
          kaskadeHari: hari, fundingR: f24 == null ? null : R8(f24),
        })
      }
    }
    return { kandidat, stat, peristiwaDipakai }
  }
  const rekonstruksi = (c, jendela) => {
    const strip = jendela.lilin.slice(c.i - STRIP, c.i + 1)
    return { ...c, stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]) }
  }
  const bentukSoal = (sel, jendelaList, kelasAwal) => {
    const peta = new Map(jendelaList.map(j => [`${j.simbol}|${j.t0}`, j]))
    const lilinMap = new Map(jendelaList.map(j => [`${j.simbol}|${j.t0}`, j.lilin]))
    return sel.pilihan.map((c, idx) => {
      const kunci = `${c.simbol}|${c.t0}`
      const r = rekonstruksi(c, { lilin: lilinMap.get(kunci) })
      return {
        id: idx + 1, simbol: c.simbol, waktu: iso(c.t), kaskadeHari: c.kaskadeHari,
        premis: `long x1 di ${c.entryR} saat panik pra-kaskade; ambang likuidasi ${c.ambangR} (long x5, rugi 20%) — jendela ${JENDELA} jam — nasib jutaan long diputuskan di sini`,
        entry: c.entryR, ambangLikuid: c.ambangR,
        strip24: r.stripR, tanda: c.tanda, funding24: c.fundingR,
        kelasHasil: KELAS_HASIL[c.ki].id,
        jamAmbang: c.jamAmbang, jamPulih: c.jamPulih,
        rendah48: c.rendahR, tinggi48: c.tinggiR, close48: c.closeR,
        sasaranAwal: kelasAwal,
      }
    })
  }

  // --- bank utama: peristiwa 900 hari terakhir → 1000 soal ---
  const jendelaUtama = koinData.flatMap(k => k.jendela.filter(j => j.t0 >= batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  console.log(`\nFASE C: kolam utama ${jendelaUtama.length} jendela kaskade (900 hari terakhir)`)
  const utama = kurasi(jendelaUtama)
  console.log('--- bukti pasar kejam: nasib 48 jam setelah momen panik (kolam utama) ---')
  for (const k of KELAS_HASIL) console.log(`  ${k.id}: ${utama.stat[k.id].momen} momen panik`)
  // diagnostik wajah: anti-tabrakan satu-tanda-satu-kelas butuh wajah bebas tabrakan ≥ sasaran
  const wajahKelas = new Map()
  KELAS_HASIL.forEach((k, ki) => {
    for (const simbol of Object.keys(utama.kandidat[ki])) for (const c of utama.kandidat[ki][simbol]) {
      if (!wajahKelas.has(c.tanda)) wajahKelas.set(c.tanda, new Set())
      wajahKelas.get(c.tanda).add(k.id)
    }
  })
  const bebas = [...wajahKelas.values()].filter(s => s.size === 1).length
  console.log(`  wajah unik utama: ${wajahKelas.size} — bebas tabrakan lintas kelas: ${bebas} (butuh ≥ 1000 total)`)
  if (utama.peristiwaDipakai < 60) throw new Error(`jendela utama ${utama.peristiwaDipakai} < 60 — sejarah tak cukup panas, jujur berhenti`)
  const pemilikTandaGlobal = new Map()
  // sasaran disesuaikan KENYATAAN sejarah (run-2: V-DALAM-LAMBAT hanya 13 momen
  // dari 6952 — yang digoreng dalam nyaris selalu pulih kilat; pelajaran anatomi
  // kaskade: kelas langka diambil apa adanya, sisanya dilempar jujur)
  const sasaranUtama = [140, 200, 330, 12, 318] // total 1000
  const selUtama = pilihKandidat(utama.kandidat, sasaranUtama, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soal1000 = bentukSoal(selUtama, jendelaUtama, sasaranUtama)
  const distKoin = {}, distKelas = {}, distFunding = { negatif: 0, positifKecil: 0, panas: 0, tanpaData: 0 }
  for (const s of soal1000) {
    distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1
    distKelas[s.kelasHasil] = (distKelas[s.kelasHasil] || 0) + 1
    const g = s.funding24 == null ? 'tanpaData' : s.funding24 < 0 ? 'negatif' : s.funding24 > 0.0005 ? 'panas' : 'positifKecil'
    distFunding[g]++
  }

  // --- bank dadakan: peristiwa LAMA (> 900 hari) tak tersentuh tempa utama → 100 soal ---
  const jendelaLama = koinData.flatMap(k => k.jendela.filter(j => j.t0 < batasUtama).map(j => ({ ...j, simbol: k.simbol, funding: k.funding })))
  const lama = kurasi(jendelaLama)
  console.log(`\nkolam dadakan ${jendelaLama.length} jendela kaskade (> 900 hari)`)
  for (const k of KELAS_HASIL) console.log(`  ${k.id}: ${lama.stat[k.id].momen} momen`)
  const sasaranDadak = [14, 20, 34, 4, 28] // total 100 (run-2: mengikuti kelangkaan asli)
  const selLama = pilihKandidat(lama.kandidat, sasaranDadak, koinData.map(k => k.simbol), pemilikTandaGlobal)
  const soal100 = bentukSoal(selLama, jendelaLama, sasaranDadak)
  const distKoin100 = {}, distKelas100 = {}
  for (const s of soal100) { distKoin100[s.simbol] = (distKoin100[s.simbol] || 0) + 1; distKelas100[s.kelasHasil] = (distKelas100[s.kelasHasil] || 0) + 1 }

  const tulis = (file, protokol, soal, stat, distK, distKl, cara) => {
    const bank = {
      protokol, epoch: 'V323', diperbikungAt: new Date().toISOString(),
      sumber: 'Binance spot klines 1d publik (api.binance.com, deteksi peristiwa kaskade 5.5 tahun) + klines 1h jendela 168 jam per peristiwa + funding rate futures publik (fapi.binance.com) — lilin, waktu, harga, funding ASLI, nol karangan',
      cara,
      aturanKelas: KELAS_HASIL.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })),
      statistikMomen: stat, distKoin, distKelas, distFunding, jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  const caraUtama = `mandat pemilik V323: 1000 soal liquidation cascade dari data nyata yang pernah melikuidasi jutaan trader — FASE A deteksi hari-kaskade dari klines 1d (drop ≤-6% & volume ≥2.2× rata-20 sebelumnya ATAU wick bawah ≥5% dari open — flick likuidasi; atau dua hari ≤-10% & volume panas; hari beruntun gap ≤3 hari = satu peristiwa, inti = volume terbesar; maks 16 peristiwa/koin merata sejarah); FASE B jendela 1h 168 jam [T0-72h, T0+96h); FASE C momen panik pra-kaskade (dariPuncak24 ≤-3% DAN volz≥1.2 ATAU wickBawah≥0.8 ATAU r1≤-1.0); long x1 di close strip; ambang likuidasi entry×0.80 (long x5, rugi 20%); jalan 48 jam → 5 kelas dari fakta (bedah kecepatan: kapan likuid, kapan pulih); konservatif dalam satu lilin (yang menyiksa dihitung dulu); kartu 24 lilin + tanda 32 bit (18 warisan + 2 funding + 12 anatomi kaskade); satu tanda satu kelas (nol tabrakan wajah LINTAS bank); jarak antar momen dihitung waktu ABSOLUT (kartu 24 jam tak tumpang, jalan boleh berbagi — warisan TEMPAN); sasaran awal [140,200,330,12,318] mengikuti kelangkaan asli sejarah (run-2) — kelas kurang dilempar jujur ke kelas lain (giliran tetap), kurang total = jendela diperluas bukan diperdaya; kurasi & ujiBank sama-sama memakai strip R8 (deterministik); pelajaran evolusi tambang: run-1 dist arah timpang ekstrem → kelas diubah bedah kecepatan; run-2 cache string merusak volz → konversi number + kriteria wick harian dibalik; run-3 wajah homogen → 12 bit tier anatomi membuka variasi nyata; run-4 jarak lintas peristiwa → waktu absolut bukan indeks lokal`
  tulis('ujian/soal-cascade-1000.json', 'SOAL-CASCADE-1000', soal1000, utama.stat, distKoin, distKelas, caraUtama)
  tulis('ujian/soal-cascade-dadakan-100.json', 'SOAL-CASCADE-100-DADAKAN', soal100, lama.stat, distKoin100, distKelas100, caraUtama + '; dadakan dari peristiwa LAMA (>900 hari) tak tersentuh tempa utama')

  console.log('\ndist kelas utama:', JSON.stringify(distKelas))
  console.log('dist funding utama:', JSON.stringify(distFunding))
  console.log('dist kelas dadakan:', JSON.stringify(distKelas100))
}

main().catch(e => { console.error('tambang-cascade MATI-PENUH:', e.message); process.exit(1) })
