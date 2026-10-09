// ============================================================
// TAMBANG-900 (V311) — tempa 3× lipat mandat pemilik (2026-10-09):
//   "Bagus lakukan. Tempa 3 x lipat"
// Tempaan dongkol V310 (300 jebakan) dinaikkan TIGA KALI:
//   300 → 900 soal jebakan target tak tercapai; dadakan 30 → 90.
// Sumber tetap SEJARAH PASAR NYATA (nol karangan): klines 1h publik
// Binance spot, kini 30 koin × 7.000 jam = 210.000 lilin.
// Protokol identik V310 (warisan utuh, hanya skala & kolam yang naik):
// 1. Di tiap lilin, modul DONGKOL menembak bila momentum terlihat:
//    NAIK → kejar beli harga×1.006, target harga×1.05;
//    TURUN → tunggu jual harga×0.994, target harga×0.95. Jendela 48 jam.
// 2. Fakta 48 jam dicatat apa adanya: tinggi/rendah/close nyata.
// 3. Soal HANYA dari tembakan yang targetnya TAK PERNAH tersentuh.
//    6 kelas hasil nyata (satu tanda hanya untuk satu kelas — nol
//    tabrakan wajah; kelas langka dilempar jujur ke kelas lain).
// 4. Kartu = 24 lilin nyata sebelum momen; tanda 18 fitur; kunci
//    kelasHasil dihitung ulang dari fakta tersimpan (terbuka audit).
// Jendela utama diperluas 3.000 → 4.800 jam agar bank 900 tetap kaya
// wajah; dadakan 90 dari jendela LAMA (jam 2.200–7.000 lalu) yang tak
// tersentuh saat tempa utama — paham-vs-hafal tetap terukur.
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

// ---------- parameter dongkol (sikap pemilik: target serakah, entry pengikut) ----------
const TARGET_PCT = 5     // target = harga × (1 ± 5%) dalam 48 jam
const ENTRY_PCT = 0.6    // entry kejar/tunggu = harga × (1 ± 0.6%)
const JENDELA = 48       // jam
const JENDELA_UTAMA = 4800  // 3× lipat: kolam utama 3.000 → 4.800 jam
const HALAMAN = 7           // 7.000 jam per koin (210.000 lilin total)

// ---------- 6 kelas hasil nyata 48 jam (kunci dihitung dari fakta) ----------
const KELAS_HASIL = [
  { id: 'MENTOK-DI-ATAS', naive: 'NAIK',
    cerita: 'entry kejar terisi, harga naik tapi mentok di bawah target — contoh pemilik: target 0.2800, nyata tertinggi 0.264' },
  { id: 'ENTRY-TAK-TERISI-JATUH', naive: 'NAIK',
    cerita: 'klik kejar di atas tak pernah terisi, harga malah terus turun' },
  { id: 'ENTRY-TAK-TERISI-MENDEM', naive: 'NAIK',
    cerita: 'klik kejar di atas tak pernah terisi, harga mendem di bawahnya' },
  { id: 'MENTOK-DI-BAWAH', naive: 'TURUN',
    cerita: 'entry tunggu terisi, harga turun tapi mentok di atas target' },
  { id: 'ENTRY-TAK-TERISI-NAIK', naive: 'TURUN',
    cerita: 'klik tunggu di bawah tak pernah terisi, harga malah terus naik' },
  { id: 'ENTRY-TAK-TERISI-MENDEM-BAWAH', naive: 'TURUN',
    cerita: 'klik tunggu di bawah tak pernah terisi, harga mendem di atasnya' },
]

// ---------- gate dongkol (waktu-putusan, nol bocor masa depan) ----------
const gateDongkol = (x) =>
  (x.streakNaik >= 2 || (x.breakHigh && x.r1 > 0)) ? 'NAIK'
  : (x.streakTurun >= 2 || (x.breakLow && x.r1 < 0)) ? 'TURUN' : null

// ---------- fakta 48 jam → kelas hasil (fungsi murni; dipakai kurator & auditor) ----------
function putusan48(arah, harga, target, entry, tinggi, rendah, close48) {
  const naik = arah === 'NAIK'
  const entryTerisi = naik ? tinggi >= entry : rendah <= entry
  const targetKena = naik ? tinggi >= target : rendah <= target
  let kelas
  if (naik) kelas = entryTerisi ? 'MENTOK-DI-ATAS'
    : (close48 < harga ? 'ENTRY-TAK-TERISI-JATUH' : 'ENTRY-TAK-TERISI-MENDEM')
  else kelas = entryTerisi ? 'MENTOK-DI-BAWAH'
    : (close48 > harga ? 'ENTRY-TAK-TERISI-NAIK' : 'ENTRY-TAK-TERISI-MENDEM-BAWAH')
  const mendekatPct = naik
    ? (tinggi - harga) / (target - harga) * 100
    : (harga - rendah) / (harga - target) * 100
  return { entryTerisi, targetKena, kelas, mendekatPct }
}

// ---------- fitur KARTU (identik dengan tambang300.mjs — warisan organ) ----------
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
function tandaDari(x) {
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
  ].map(Number).join('')
}

// ---------- ambil klines 1h nyata (HALAMAN halaman = 7000 jam ≈ 292 hari) ----------
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
    await new Promise(r => setTimeout(r, 220)) // sopan ke API publik
  }
  // V315 KOREKSI-KRONOLOGIS: halaman terkumpul mundur-waktu (blok terbaru dulu);
  // diurutkan naik agar jendela depan benar-benar masa depan (bank lama tersegel tak diubah)
  semua.sort((a, b) => a[0] - b[0])
  return semua.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}

const kelasDari = (h) => h < 1 ? 'A' : h < 10 ? 'B' : 'C'
const jarakAman = (i, daftar, jarak) => daftar.every(j => Math.abs(i - j) >= jarak)
const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z')

// ---------- tambang satu jendela ----------
// pemilikTanda: Map tanda→kelasHasil lintas bank (cegah tabrakan wajah global)
async function tambang(koinData, sasaranKelas, capKoin, jarak, pemilikTanda) {
  const kandidat = KELAS_HASIL.map(() => ({}))
  const stat = {}
  for (const k of KELAS_HASIL) stat[k.id] = { tembakan: 0, targetKena: 0, jebakan: 0, mendekatJumlah: 0, mendekatMaks: -999 }
  const statArah = { NAIK: { tembakan: 0, targetKena: 0 }, TURUN: { tembakan: 0, targetKena: 0 } }
  const jendelaKoin = []
  for (const { simbol, lilin } of koinData) {
    if (lilin.length < 80) continue
    jendelaKoin.push({ simbol, dari: iso(lilin[0].t), sampai: iso(lilin[lilin.length - 1].t), lilin: lilin.length })
    for (let i = 24; i < lilin.length - JENDELA; i++) {
      const strip = lilin.slice(i - 24, i + 1)
      const x = fiturDari(strip)
      const arah = gateDongkol(x)
      if (!arah) continue
      const harga = lilin[i].c
      const target = R8(arah === 'NAIK' ? harga * (1 + TARGET_PCT / 100) : harga * (1 - TARGET_PCT / 100))
      const entry = R8(arah === 'NAIK' ? harga * (1 + ENTRY_PCT / 100) : harga * (1 - ENTRY_PCT / 100))
      // fakta 48 jam nyata
      let tinggi = -Infinity, rendah = Infinity
      for (let j = i + 1; j <= i + JENDELA; j++) {
        if (lilin[j].h > tinggi) tinggi = lilin[j].h
        if (lilin[j].l < rendah) rendah = lilin[j].l
      }
      const close48 = lilin[i + JENDELA].c
      const put = putusan48(arah, harga, target, entry, tinggi, rendah, close48)
      statArah[arah].tembakan++
      if (put.targetKena) statArah[arah].targetKena++
      const st = stat[put.kelas]
      st.tembakan++
      if (put.targetKena) { st.targetKena++; continue } // bukan jebakan — bank wajib target tak tercapai
      st.jebakan++
      st.mendekatJumlah += put.mendekatPct
      if (put.mendekatPct > st.mendekatMaks) st.mendekatMaks = put.mendekatPct
      const tanda = tandaDari(x)
      const ki = KELAS_HASIL.findIndex(k => k.id === put.kelas)
      if (pemilikTanda.has(tanda) && pemilikTanda.get(tanda) !== put.kelas) continue // tabrakan wajah — kurator skip
      ;(kandidat[ki][simbol] = kandidat[ki][simbol] || []).push({
        i, t: lilin[i].t, harga, target, entry, arah, tinggi, rendah, close48, strip,
        mendekatPct: put.mendekatPct, entryTerisi: put.entryTerisi,
        hargaR: R8(harga), targetR: R8(target), entryR: R8(entry),
        tinggiR: R8(tinggi), rendahR: R8(rendah), close48R: R8(close48),
        stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]),
        kelas: kelasDari(harga / 100), koin: simbol, tanda,
      })
    }
  }
  // pilih deterministik: round-robin antar koin, jarak antar momen dijaga;
  // sasaran awal per kelas — kelas langka yang kurang dilempar jujur ke kelas
  // lain (giliran tetap) sampai total terpenuhi (aturan kurator, dibuka di
  // bank.cara). Kurang total = jendela wajib diperluas, bukan diperdaya.
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
          if (pemilik && pemilik !== KELAS_HASIL[ki].id) continue // wajah sudah dimiliki kelas lain — wajib skip
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
  if (kurang > 0) throw new Error(`jebakan tak cukup: kurang ${kurang} dari ${totalAwal} — jendela wajib diperluas, bukan diperdaya`)
  pilihan.sort((a, b) => a.ki - b.ki || a.t - b.t)
  for (const k of KELAS_HASIL) { const s = stat[k.id]; s.rataMendekat = s.jebakan ? +(s.mendekatJumlah / s.jebakan).toFixed(1) : null; s.mendekatMaks = s.jebakan ? +s.mendekatMaks.toFixed(1) : null; delete s.mendekatJumlah }
  return { pilihan, stat, statArah, jendelaKoin }
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  console.log('mengambil klines 1h nyata 30 koin × 7 halaman (210.000 lilin)…')
  const koinData = []
  for (const simbol of KOIN) {
    const lilin = await ambilKlines(simbol, HALAMAN)
    if (lilin.length < 300) throw new Error(`${simbol} lilin terlalu sedikit: ${lilin.length}`)
    koinData.push({ simbol, lilin })
    console.log(`  ${simbol}: ${lilin.length} lilin (${iso(lilin[0].t)} → ${iso(lilin[lilin.length - 1].t)})`)
  }

  // --- bank utama: 900 jebakan dari jendela TERBARU (4800 jam) — skala 3× lipat ---
  const pemilikTanda = new Map()
  const jendelaUtama = koinData.map(({ simbol, lilin }) => ({ simbol, lilin: lilin.slice(-JENDELA_UTAMA) }))
  const utama = await tambang(jendelaUtama, [150, 150, 150, 150, 150, 150], 32, 48, pemilikTanda)
  const soal900 = utama.pilihan.map((c, idx) => {
    const k = KELAS_HASIL[c.ki]
    return {
      id: idx + 1, simbol: c.koin, kelas: c.kelas, waktu: iso(c.t), arah: c.arah,
      harga: c.hargaR, target: c.targetR, entry: c.entryR, strip24: c.stripR, tanda: c.tanda,
      kelasHasil: k.id, tinggi48: c.tinggiR, rendah48: c.rendahR, close48: c.close48R,
      mendekatPct: +c.mendekatPct.toFixed(1),
    }
  })
  const distKoin = {}, distKelas = {}
  for (const s of soal900) { distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1; distKelas[s.kelas] = (distKelas[s.kelas] || 0) + 1 }

  // --- bank dadakan: 90 jebakan (3× dari 30) dari jendela LAMA — tak tersentuh saat tempa utama ---
  const jendelaLama = koinData.map(({ simbol, lilin }) => ({ simbol, lilin: lilin.slice(0, Math.max(80, lilin.length - JENDELA_UTAMA)) }))
  const lama = await tambang(jendelaLama, [15, 15, 15, 15, 15, 15], 12, 48, pemilikTanda)
  const soal90 = lama.pilihan.map((c, idx) => {
    const k = KELAS_HASIL[c.ki]
    return {
      id: idx + 1, simbol: c.koin, kelas: c.kelas, waktu: iso(c.t), arah: c.arah,
      harga: c.hargaR, target: c.targetR, entry: c.entryR, strip24: c.stripR, tanda: c.tanda,
      kelasHasil: k.id, tinggi48: c.tinggiR, rendah48: c.rendahR, close48: c.close48R,
      mendekatPct: +c.mendekatPct.toFixed(1),
    }
  })
  const distKoin90 = {}, distKelas90 = {}
  for (const s of soal90) { distKoin90[s.simbol] = (distKoin90[s.simbol] || 0) + 1; distKelas90[s.kelas] = (distKelas90[s.kelas] || 0) + 1 }

  const tulis = (file, protokol, soal, stat, statArah, jendelaKoin, distKoin, distKelas) => {
    const bank = {
      protokol, epoch: 'V311', diperbikungAt: new Date().toISOString(),
      sumber: 'Binance spot klines 1h publik (api.binance.com) — lilin, waktu, harga ASLI, nol karangan',
      cara: `tempa 3× lipat mandat pemilik: bank dongkol 300 → 900 soal; modul dongkol menembak di tiap lilin bermomentum (gate streak≥2 / break+confirmed): NAIK → kejar beli harga×1.006 target ×1.05; TURUN → tunggu jual harga×0.994 target ×0.95; jendela ${JENDELA} jam; soal HANYA dari tembakan yang targetnya TAK PERNAH tersentuh dalam ${JENDELA} jam (jebakan, mandat pemilik); kartu = 24 lilin sebelum momen; kunci kelasHasil dihitung dari fakta tinggi/rendah/close 48 jam tersimpan (dapat diaudit ulang); satu tanda hanya untuk satu kelas (tanpa tabrakan wajah)`,
      aturanKelas: KELAS_HASIL.map(k => ({ id: k.id, naive: k.naive, cerita: k.cerita })),
      statistikDongkol: { perKelas: stat, perArah: statArah }, jendelaKoin, distKoin, distKelas,
      jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  tulis('ujian/soal-900.json', 'SOAL-TEMPAN-900', soal900, utama.stat, utama.statArah, utama.jendelaKoin, distKoin, distKelas)
  tulis('ujian/soal-dadakan-90.json', 'SOAL-TEMPAN-900-DADAKAN', soal90, lama.stat, lama.statArah, lama.jendelaKoin, distKoin90, distKelas90)

  console.log('\n--- bukti pasar aneh: seberapa sering target dongkol 5%-48jam benar-benar tersentuh ---')
  for (const arah of ['NAIK', 'TURUN']) {
    const s = utama.statArah[arah]
    const pct = s.tembakan ? +(s.targetKena / s.tembakan * 100).toFixed(1) : 0
    console.log(`arah ${arah}: ${s.tembakan} tembakan dongkol — target tersentuh hanya ${s.targetKena} (${pct}%) — sisanya jebakan`)
  }
  for (const k of KELAS_HASIL) {
    const s = utama.stat[k.id]
    console.log(`${k.id}: jebakan ${s.jebakan} · rata-rata mendekat ${s.rataMendekat}% dari jalan ke target · terdekat ${s.mendekatMaks}%`)
  }
}

main().catch(e => { console.error('tambang900 MATI-PENUH:', e.message); process.exit(1) })
