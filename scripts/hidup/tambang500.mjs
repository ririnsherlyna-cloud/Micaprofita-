// ============================================================
// TAMBANG-500 (V307) — 500 soal ujian baru dari SEJARAH DALAM
// yang belum pernah dilihat makhluk (jam 5.000–13.000 silam).
// Mandat pemilik (2026-10-08): "500 soal ujian baru untuk uji
// apakah sudah peningkat pahamannya."
// Beda dengan TEMPAN-200 (jam 0–5000 silam): jendela ini LEBIH
// LAMA — rezim pasar berbeda; makhluk tak pernah dilatih di sini.
// Semua lilin nyata Binance publik; nol karangan; deterministik.
// ============================================================
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const R8 = (x) => Number(Number(x).toPrecision(8))
const SKIP_HALAMAN = 5   // 5.000 jam terbaru di-skip (milik TEMPAN-200 + dadakan)
const HALAMAN = 8        // 8.000 jam sebelumnya = jendela ujian 500
const AMBANG_LOSS_PCT = 0.15

const KOIN = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','TRXUSDT',
  'LINKUSDT','AVAXUSDT','DOTUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','ARBUSDT','OPUSDT',
  'INJUSDT','SUIUSDT','APTUSDT','FILUSDT','ETCUSDT','XLMUSDT','PEPEUSDT','SHIBUSDT',
]

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

// ---------- fitur KARTU — identik dengan tempa200.mjs (dijaga ujiBank) ----------
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
  const breakHigh = e > hi20, breakLow = e < lo20
  const hiAll = Math.max(...strip.map(x => x.h)), loAll = Math.min(...strip.map(x => x.l))
  const posisi = hiAll === loAll ? 0.5 : (e - loAll) / (hiAll - loAll)
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  return { e, r1, r3, r12, rsi, volz, breakHigh, breakLow, posisi, streakNaik, streakTurun,
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

async function ambilKlines(simbol, lewati, halaman) {
  const semua = []
  let endTime
  for (let p = 0; p < lewati + halaman; p++) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${simbol}&interval=1h&limit=1000${endTime ? `&endTime=${endTime}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${simbol} hal${p} binance ${res.status}`)
    const rows = await res.json()
    if (!rows.length) break
    if (p >= lewati) semua.push(...rows)
    endTime = rows[0][0] - 1
    await new Promise(r => setTimeout(r, 220))
  }
  return semua.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
}

const kelasDari = (h) => h < 1 ? 'A' : h < 10 ? 'B' : 'C'
const jarakAman = (i, daftar, jarak) => daftar.every(j => Math.abs(i - j) >= jarak)
const iso = (t) => new Date(t).toISOString().replace('.000Z', 'Z')

async function main() {
  mkdirSync('ujian', { recursive: true })
  console.log(`mengambil klines 1h nyata: lewati ${SKIP_HALAMAN} halaman terbaru, ambil ${HALAMAN} halaman (24 koin)…`)
  const koinData = [], kurangSejarah = []
  for (const simbol of KOIN) {
    const lilin = await ambilKlines(simbol, SKIP_HALAMAN, HALAMAN)
    if (lilin.length < 300) { kurangSejarah.push(simbol + ':' + lilin.length); continue }
    koinData.push({ simbol, lilin })
    console.log(`  ${simbol}: ${lilin.length} lilin (${iso(lilin[0].t)} → ${iso(lilin[lilin.length - 1].t)})`)
  }
  if (kurangSejarah.length) console.log('  koin sejarahnya kurang (dilaporkan jujur):', kurangSejarah.join(', '))

  const kandidat = FAMILIA.map(() => ({}))
  const statNaive = {}
  const jendelaKoin = []
  for (const { simbol, lilin } of koinData) {
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
      if (!kalahCukup) continue
      ;(kandidat[fam][simbol] = kandidat[fam][simbol] || []).push({
        i, t: lilin[i].t, entry, close4, pct4,
        entryR: R8(entry), stripR: strip.map(l => [R8(l.o), R8(l.h), R8(l.l), R8(l.c), R8(l.v)]),
        kelas: kelasDari(entry / 100), koin: simbol,
      })
    }
  }

  const target = [84, 83, 83, 84, 83, 83]
  const pilihan = [], perKoin = new Map()
  const CAP_KOIN = 25, JARAK = 48
  FAMILIA.forEach((k, fi) => {
    const sasaran = target[fi]
    let terambil = 0, maju = true
    while (terambil < sasaran && maju) {
      maju = false
      for (const { simbol } of koinData) {
        if (terambil >= sasaran) break
        const sudah = perKoin.get(simbol) || []
        if (sudah.length >= CAP_KOIN) continue
        for (const c of (kandidat[fi][simbol] || [])) {
          if (c.dipakai) continue
          if (!jarakAman(c.i, sudah, JARAK)) continue
          c.dipakai = true
          sudah.push(c.i); perKoin.set(simbol, sudah)
          pilihan.push({ fam: fi, ...c }); terambil++; maju = true
          break
        }
      }
    }
    if (terambil < sasaran) throw new Error(`keluarga ${k.id} kurang sampel loss: ${terambil}/${sasaran} — ambang ditinjau, bukan diperdaya`)
  })
  pilihan.sort((a, b) => a.fam - b.fam || a.t - b.t)

  const soal500 = pilihan.map((c, idx) => {
    const k = FAMILIA[c.fam]
    return {
      id: idx + 1, simbol: c.koin, kelas: c.kelas, waktu: iso(c.t), entry: c.entryR,
      strip24: c.stripR, tanda: tandaDari(fiturDari(c.stripR.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] })))), keluarga: k.id,
      naive: k.naive, arahBenar: k.arahBenar, close4: R8(c.close4), pct4: +c.pct4.toFixed(3),
    }
  })
  const distKoin = {}, distKelas = {}
  for (const s of soal500) { distKoin[s.simbol] = (distKoin[s.simbol] || 0) + 1; distKelas[s.kelas] = (distKelas[s.kelas] || 0) + 1 }

  const bank = {
    protokol: 'SOAL-TEMPAN-500', epoch: 'V307', diperbikungAt: new Date().toISOString(),
    sumber: 'Binance spot klines 1h publik — jendela DALAM (jam 5.000–13.000 silam) yang TAK PERNAH ditempa makhluk; lilin, waktu, harga ASLI, nol karangan',
    cara: 'detektor perilaku trader kalah menembak di tiap lilin; soal HANYA dari tembakan yang kalah ≥0.15% dalam 4 jam (sampel loss); kartu = 24 lilin sebelum momen; arahBenar = arah nyata 4 jam setelahnya',
    aturanKeluarga: FAMILIA.map(k => ({ id: k.id, naive: k.naive, arahBenar: k.arahBenar, cerita: k.cerita })),
    sampelLossNaive: Object.fromEntries(Object.entries(statNaive).map(([id, s]) => [id, {
      ...s, winRatePct: +(s.menang / s.TRX * 100).toFixed(1), netPct: +s.netPct.toFixed(1) }])),
    jendelaKoin, kurangSejarah: kurangSejarah.length ? kurangSejarah : undefined,
    distKoin, distKelas, jumlah: soal500.length, soal: soal500, segel: null,
  }
  const tubuh = JSON.stringify(bank)
  bank.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
  writeFileSync('ujian/soal-500.json', JSON.stringify(bank, null, 1))
  console.log(`ujian/soal-500.json: ${soal500.length} soal — segel ${bank.segel.hash}`)
  console.log('kelas:', JSON.stringify(distKelas), '| koin terpakai:', Object.keys(distKoin).length)
  console.log('--- bukti naive di jendela dalam ---')
  for (const [id, s] of Object.entries(statNaive))
    console.log(`${id}: TRX ${s.TRX} · menang ${(100 * s.menang / s.TRX).toFixed(1)}% · net ${s.netPct.toFixed(1)}%`)
}

main().catch(e => { console.error('tambang500 MATI-PENUH:', e.message); process.exit(1) })
