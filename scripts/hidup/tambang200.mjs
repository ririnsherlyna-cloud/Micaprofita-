// ============================================================
// TAMBANG-200 (V306) — menambang 200 soal dari SAMPEL LOSS
// histori pasar nyata, segala macam koin.
// Mandat pemilik (2026-10-08): "200 soal diambil dari sample
// histori pasar... jumlah kemenangan ternyata gak selaras dengan
// jumlah TRX... ada kelalaian, akhirnya loss" — jadi organ ini:
// 1. Mengambil klines 1 jam NYATA dari Binance spot (API publik).
// 2. Meniru 6 keluarga perilaku trader yang KALAH (detektor naive).
// 3. Mencatat SEMUA tembakan (TRX) naive: berapa menang, berapa
//    kalah — bukti ketidakselarasan TRX vs kemenangan, angka jujur.
// 4. Soal hanya diambil dari tembakan yang KALAH (sample loss):
//    kartu = 24 lilin nyata SEBELUM momen itu; kunci arahBenar =
//    arah yang SEBENARNYA terjadi 4 jam kemudian (fakta sejarah).
// Kejujuran: nol karangan — semua lilin, waktu, harga asli dari API
// publik; segel SHA-256; deterministik (nol Math.random).
// ============================================================
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))

// ---------- 24 koin segala macam (kelas A <$1, B $1–10, C ≥$10) ----------
const KOIN = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','TRXUSDT',
  'LINKUSDT','AVAXUSDT','DOTUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','ARBUSDT','OPUSDT',
  'INJUSDT','SUIUSDT','APTUSDT','FILUSDT','ETCUSDT','XLMUSDT','PEPEUSDT','SHIBUSDT',
]

// ---------- 6 keluarga perilaku trader yang kalah ----------
// Tiap keluarga: detektor naive (dari KARTU 24 lilin saja), arah yang
// dipilih naive, dan arahBenar bila naive kalah. Prioritas berantai =
// penugasan eksklusif (satu momen satu keluarga).
const FAMILIA = [
  { id: 'TIPU-PECAH-ATAS', naive: 'NAIK', arahBenar: 'TURUN',
    cerita: 'beli breakout 20-lilin — pemecah palsu, harga ambruk balik',
    det: (x) => x.breakHigh && x.streakNaik <= 2 && x.rsi <= 68 },
  { id: 'TIPU-PECAH-BAWAH', naive: 'TURUN', arahBenar: 'NAIK',
    cerita: 'jual breakdown 20-lilin — pemecah palsu, harga rebound',
    det: (x) => x.breakLow && x.streakTurun <= 2 && x.rsi >= 32 },
  { id: 'KEJAR-HIJAU', naive: 'NAIK', arahBenar: 'TURUN',
    cerita: 'FOMO beli setelah 3 naik beruntun + volume membara — lalu dibanting',
    det: (x) => x.streakNaik >= 3 && x.volz > 1.2 && x.rsi <= 70 },
  { id: 'KEJAR-MERAH', naive: 'TURUN', arahBenar: 'NAIK',
    cerita: 'panik jual setelah 3 turun beruntun + volume membara — lalu disedot',
    det: (x) => x.streakTurun >= 3 && x.volz > 1.2 && x.rsi >= 30 },
  { id: 'POTONG-PAJANG', naive: 'TURUN', arahBenar: 'NAIK',
    cerita: 'short RSI overbought — tren terus berlari, ter-short-squeeze',
    det: (x) => x.rsi > 73 },
  { id: 'TANGKAP-PAJANG', naive: 'NAIK', arahBenar: 'TURUN',
    cerita: 'tangkap pisau jatuh RSI oversold — pisau terus jatuh',
    det: (x) => x.rsi < 27 },
]
const AMBANG_LOSS_PCT = 0.15 // naive kalah bila 4 jam kemudian melawan naive ≥ 0.15%

// ---------- fitur KARTU (semuanya dari 24 lilin terlihat, nol bocor masa depan) ----------
function fiturDari(strip) {
  const n = strip.length, e = strip[n - 1].c
  const pct = (a, b) => (b / a - 1) * 100
  const r1 = pct(strip[n - 2].c, e), r3 = pct(strip[n - 4].c, e), r12 = pct(strip[n - 13].c, e)
  // RSI14 Wilder di dalam kartu (seed = rata-rata sederhana 14 perubahan pertama)
  let naik = 0, turun = 0
  for (let i = 1; i <= 14; i++) { const d = strip[i].c - strip[i - 1].c; if (d > 0) naik += d; else turun -= d }
  let avgN = naik / 14, avgT = turun / 14
  for (let i = 15; i < n; i++) {
    const d = strip[i].c - strip[i - 1].c
    avgN = (avgN * 13 + Math.max(d, 0)) / 14
    avgT = (avgT * 13 + Math.max(-d, 0)) / 14
  }
  const rsi = avgT === 0 ? 100 : 100 - 100 / (1 + avgN / avgT)
  // volume z-score 20 lilin di dalam kartu
  const vols = strip.slice(-20).map(x => x.v)
  const vMean = vols.reduce((a, b) => a + b, 0) / 20
  const vStd = Math.sqrt(vols.reduce((a, b) => a + (b - vMean) ** 2, 0) / 20) || 1e-12
  const volz = (strip[n - 1].v - vMean) / vStd
  // pecah 20-lilin, posisi rentang, streak, wick
  const hi20 = Math.max(...strip.slice(0, n - 1).map(x => x.h))
  const lo20 = Math.min(...strip.slice(0, n - 1).map(x => x.l))
  const breakHigh = e > hi20, breakLow = e < lo20
  const hiAll = Math.max(...strip.map(x => x.h)), loAll = Math.min(...strip.map(x => x.l))
  const posisi = hiAll === loAll ? 0.5 : (e - loAll) / (hiAll - loAll)
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  const wickAtas = (last.h - Math.max(last.o, last.c)) / badan
  const wickBawah = (Math.min(last.o, last.c) - last.l) / badan
  return { e, r1, r3, r12, rsi, volz, breakHigh, breakLow, posisi, streakNaik, streakTurun, wickAtas, wickBawah }
}

function tandaDari(x) {
  return [
    x.r3 > 1.2, x.r3 < -1.2,            // f1 f2  cepat 3 jam
    x.r12 > 3, x.r12 < -3,              // f3 f4  tren 12 jam
    x.rsi > 70, x.rsi < 30,             // f5 f6  pajang
    x.volz > 2, x.volz < -0.8,          // f7 f8  volume
    x.breakHigh, x.breakLow,            // f9 f10 pecah 20
    x.wickAtas > 1.5, x.wickBawah > 1.5,// f11 f12 ekor
    x.streakNaik >= 3, x.streakTurun >= 3, // f13 f14 beruntun
    x.posisi > 0.92, x.posisi < 0.08,   // f15 f16 mepet tepi
    x.r1 > 0, x.r1 < 0,                 // f17 f18 lilin terakhir
  ].map(Number).join('')
}

// ---------- ambil klines 1h nyata (5 halaman = 5000 jam ≈ 208 hari) ----------
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
async function tambang(koinData, target, capKoin, jarakKeluarga) {
  const kandidat = FAMILIA.map(() => ({})) // per keluarga: koin -> [momennya]
  const statNaive = {} // per keluarga: TRX, menang, kalah, netPct (semua tembakan di jendela)
  const jendelaKoin = []
  for (const { simbol, lilin } of koinData) {
    if (lilin.length < 60) continue
    jendelaKoin.push({ simbol, dari: iso(lilin[0].t), sampai: iso(lilin[lilin.length - 1].t), lilin: lilin.length })
    for (let i = 24; i < lilin.length - 4; i++) {
      const strip = lilin.slice(i - 24, i + 1)
      const x = fiturDari(strip)
      const fam = FAMILIA.findIndex(k => k.det(x))
      if (fam < 0) continue
      const entry = lilin[i].c, close4 = lilin[i + 4].c
      const pct4 = (close4 / entry - 1) * 100
      const st = statNaive[FAMILIA[fam].id] = statNaive[FAMILIA[fam].id] || { TRX: 0, menang: 0, kalah: 0, netPct: 0 }
      st.TRX++
      const naiveMenang = FAMILIA[fam].naive === 'NAIK' ? pct4 > 0 : pct4 < 0
      if (naiveMenang) { st.menang++; st.netPct += Math.abs(pct4) } else { st.kalah++; st.netPct -= Math.abs(pct4) }
      const kalahCukup = FAMILIA[fam].naive === 'NAIK' ? pct4 <= -AMBANG_LOSS_PCT : pct4 >= AMBANG_LOSS_PCT
      if (!kalahCukup) continue // sampel loss saja — mandat pemilik
      const hargaRata = entry / 100
      ;(kandidat[fam][simbol] = kandidat[fam][simbol] || []).push({
        i, t: lilin[i].t, entry, close4, pct4, strip,
        entryR: R8(entry), stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]),
        kelas: kelasDari(hargaRata), koin: simbol,
      })
    }
  }
  // pilih deterministik: round-robin antar koin, jarak antar momen dijaga
  const pilihan = [], perKoin = new Map()
  FAMILIA.forEach((k, fi) => {
    const sasaran = target[fi]
    let terambil = 0, maju = true
    while (terambil < sasaran && maju) {
      maju = false
      for (const { simbol } of koinData) {
        if (terambil >= sasaran) break
        const sudah = perKoin.get(simbol) || []
        if (sudah.length >= capKoin) continue
        for (const c of (kandidat[fi][simbol] || [])) {
          if (c.dipakai) continue
          if (!jarakAman(c.i, sudah, jarakKeluarga)) continue
          c.dipakai = true
          sudah.push(c.i); perKoin.set(simbol, sudah)
          pilihan.push({ fam: fi, ...c }); terambil++; maju = true
          break
        }
      }
    }
    if (terambil < sasaran) throw new Error(`keluarga ${k.id} kurang sampel loss: ${terambil}/${sasaran} — ambang detektor wajib ditinjau, bukan diperdaya`)
  })
  pilihan.sort((a, b) => a.fam - b.fam || a.t - b.t)
  const perKeluarga = Object.fromEntries(Object.entries(statNaive).map(([id, s]) => [id, {
    ...s, winRatePct: +(s.menang / s.TRX * 100).toFixed(1), netPct: +s.netPct.toFixed(1),
  }]))
  return { pilihan, statNaive: perKeluarga, jendelaKoin }
}

async function main() {
  mkdirSync('ujian', { recursive: true })
  console.log('mengambil klines 1h nyata 24 koin × 5 halaman…')
  const koinData = []
  for (const simbol of KOIN) {
    const lilin = await ambilKlines(simbol, 5)
    if (lilin.length < 200) throw new Error(`${simbol} lilin terlalu sedikit: ${lilin.length}`)
    koinData.push({ simbol, lilin })
    console.log(`  ${simbol}: ${lilin.length} lilin (${iso(lilin[0].t)} → ${iso(lilin[lilin.length - 1].t)})`)
  }

  // --- bank utama: 200 soal dari jendela TERBARU (halaman 1–3 = 3000 jam) ---
  const jendelaUtama = koinData.map(({ simbol, lilin }) => ({ simbol, lilin: lilin.slice(-3000) }))
  const utama = await tambang(jendelaUtama, [34, 33, 33, 34, 33, 33], 12, 48)
  const soal200 = utama.pilihan.map((c, idx) => {
    const k = FAMILIA[c.fam]
    return {
      id: idx + 1, simbol: c.koin, kelas: c.kelas, waktu: iso(c.t), entry: c.entryR,
      strip24: c.stripR, tanda: tandaDari(fiturDari(c.strip)), keluarga: k.id,
      naive: k.naive, arahBenar: k.arahBenar, close4: R8(c.close4), pct4: +c.pct4.toFixed(3),
    }
  })
  const distKoin = {}, distKelas = {}
  for (const s of soal200) { distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1; distKelas[s.kelas] = (distKelas[s.kelas] || 0) + 1 }

  // --- bank dadakan: 40 soal dari jendela LAMA (halaman 4–5 = jam 3000–5000 lalu) — tak terlihat saat tempa ---
  const jendelaLama = koinData.map(({ simbol, lilin }) => ({ simbol, lilin: lilin.slice(0, Math.max(0, lilin.length - 3000)) }))
  const lama = await tambang(jendelaLama, [7, 7, 7, 7, 6, 6], 8, 48)
  const soal40 = lama.pilihan.map((c, idx) => {
    const k = FAMILIA[c.fam]
    return {
      id: idx + 1, simbol: c.koin, kelas: c.kelas, waktu: iso(c.t), entry: c.entryR,
      strip24: c.stripR, tanda: tandaDari(fiturDari(c.strip)), keluarga: k.id,
      naive: k.naive, arahBenar: k.arahBenar, close4: R8(c.close4), pct4: +c.pct4.toFixed(3),
    }
  })
  const distKoin40 = {}, distKelas40 = {}
  for (const s of soal40) { distKoin40[s.simbol] = (distKoin40[s.simbol] || 0) + 1; distKelas40[s.kelas] = (distKelas40[s.kelas] || 0) + 1 }

  const tulis = (file, protokol, soal, statNaive, jendelaKoin, distKoin, distKelas) => {
    const bank = {
      protokol, epoch: 'V306', diperbikungAt: new Date().toISOString(),
      sumber: 'Binance spot klines 1h publik (api.binance.com) — lilin, waktu, harga ASLI, nol karangan',
      cara: 'detektor perilaku trader kalah menembak di tiap lilin; soal HANYA dari tembakan yang kalah ≥0.15% dalam 4 jam (sample loss); kartu = 24 lilin sebelum momen; arahBenar = arah nyata 4 jam setelahnya',
      aturanKeluarga: FAMILIA.map(k => ({ id: k.id, naive: k.naive, arahBenar: k.arahBenar, cerita: k.cerita })),
      sampelLossNaive: statNaive, jendelaKoin, distKoin, distKelas,
      jumlah: soal.length, soal, segel: null,
    }
    const tubuh = JSON.stringify(bank)
    bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
    writeFileSync(file, JSON.stringify(bank, null, 1))
    console.log(`${file}: ${soal.length} soal — segel ${bank.segel.hash}`)
  }
  tulis('ujian/soal-200.json', 'SOAL-TEMPAN-200', soal200, utama.statNaive, utama.jendelaKoin, distKoin, distKelas)
  tulis('ujian/soal-dadakan-40.json', 'SOAL-TEMPAN-200-DADAKAN', soal40, lama.statNaive, lama.jendelaKoin, distKoin40, distKelas40)

  console.log('\n--- bukti ketidakselarasan TRX vs kemenangan naive (jendela utama) ---')
  for (const [id, s] of Object.entries(utama.statNaive))
    console.log(`${id}: TRX ${s.TRX} · naive menang ${s.menang} (${s.winRatePct}%) · kalah ${s.kalah} · net naive ${s.netPct}%`)
}

main().catch(e => { console.error('tambang200 MATI-PENUH:', e.message); process.exit(1) })
