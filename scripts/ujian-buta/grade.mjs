// ============================================================
// GRADE UJIAN-BUTA — nilai semua kunci terhadap FAKTA harga.
// Vonis resmi dicermati persis dari penjaga.mjs v6.1:
//   exit = close candle 1j terakhir saat umur >= 24 jam
//   net  = arah × (exit/entry − 1) − FEE(0.002)
//   status = net > 0 ? BENAR : SALAH
// Bonus diagnosa: barier stop/target intrabar + MFE/MAE.
// Pakai: node grade.mjs → laporan JSON + ringkasan konsol
// ============================================================
import fs from 'node:fs'
import path from 'node:path'

const CACHE = '/tmp/ujibuta/cache'
const PANEN = process.argv[2] || path.join('/home/z/my-project/scripts/ujian-buta/panen.jsonl')
const OUT = process.argv[3] || '/home/z/my-project/download/ujian-buta-100-hasil.json'
const FEE = 0.002

const k1h = (base) => { try { return JSON.parse(fs.readFileSync(path.join(CACHE, '1h', base + '.json'), 'utf8')) } catch { return [] } }

const rows = fs.readFileSync(PANEN, 'utf8').split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)

// dedupe: id unik per run — (run, id)
const perRunId = new Set()
const soal = []
for (const r of rows) {
  const e = r.e
  const key = `${r.run}|${e.id || `${e.simbol}-${e.arah}`}`
  if (perRunId.has(key)) continue
  perRunId.add(key)
  soal.push(r)
}

function nilaiSatu(r) {
  const e = r.e
  const T = r.T
  const base = String(e.simbol).replace(/USDT$/, '')
  const candles = k1h(base)
  if (!candles.length) return null
  const entry = +e.entry
  const arah = e.arah === 'SELL' ? -1 : 1
  // vonis resmi: candle terakhir yang closeTime <= T+24h
  const batas = T + 24 * 3600 * 1000
  let exitC = null
  for (const c of candles) { if (c[6] <= batas) exitC = c; else break }
  if (!exitC || !Number.isFinite(entry) || entry <= 0) return null
  const exit = +exitC[4]
  const net = arah * (exit / entry - 1) - FEE
  // barier intrabar (diagnosa): hanya kelas A yang punya stop/target pra-registrasi
  const candleKunci = candles.find((c) => c[0] <= T && c[6] > T)
  const mulaiIdx = candleKunci ? candles.indexOf(candleKunci) + 1 : candles.findIndex((c) => c[0] > T)
  let barier = r.kelas === 'A' ? 'HORIZON' : 'TANPA_RENCANA'
  let mfe = 0, mae = 0
  const stopPct = +(e.impas?.rencana?.stopPct ?? e.stopPct ?? NaN)
  const tgtPct = +(e.impas?.rencana?.targetPct ?? e.targetPct ?? NaN)
  if (Number.isFinite(stopPct) && Number.isFinite(tgtPct) && mulaiIdx > 0) {
    const lvlStop = arah === 1 ? entry * (1 - stopPct / 100) : entry * (1 + stopPct / 100)
    const lvlTgt = arah === 1 ? entry * (1 + tgtPct / 100) : entry * (1 - tgtPct / 100)
    for (let i = mulaiIdx; i < candles.length; i++) {
      const c = candles[i]
      if (c[0] >= batas) break
      const hi = +c[2], lo = +c[3]
      const keUntung = arah === 1 ? (hi - entry) / entry : (entry - lo) / entry
      const keRugi = arah === 1 ? (entry - lo) / entry : (hi - entry) / entry
      mfe = Math.max(mfe, keUntung); mae = Math.max(mae, keRugi)
      const kenaStop = arah === 1 ? lo <= lvlStop : hi >= lvlStop
      const kenaTgt = arah === 1 ? hi >= lvlTgt : lo <= lvlTgt
      if (kenaStop) { barier = 'STOP'; break }
      if (kenaTgt) { barier = 'TARGET'; break }
    }
  } else {
    // kelas B: tetap ukur MFE/MAE untuk tahu apa yang (tidak) dilewatkan
    if (mulaiIdx > 0) {
      for (let i = mulaiIdx; i < candles.length; i++) {
        const c = candles[i]
        if (c[0] >= batas) break
        const hi = +c[2], lo = +c[3]
        mfe = Math.max(mfe, arah === 1 ? (hi - entry) / entry : (entry - lo) / entry)
        mae = Math.max(mae, arah === 1 ? (entry - lo) / entry : (hi - entry) / entry)
      }
    }
  }
  return {
    id: e.id || null, run: r.run, kelas: r.kelas || 'A', T: new Date(T).toISOString(), simbol: base,
    jalur: r.jalur || (r.kelas === 'A' ? 'ARAH' : 'RADAR'), arah: e.arah,
    entry, exit, net: +net.toFixed(5), status: net > 0 ? 'BENAR' : 'SALAH',
    keyakinan: e.keyakinan ?? null, keyTerkalib: e.impas?.keyakinanTerkalibrasi ?? null,
    rezim: e.rezim ?? e.b?.rezim ?? null, zona: e.impas?.zona ?? null,
    stopPct: Number.isFinite(stopPct) ? stopPct : null, tgtPct: Number.isFinite(tgtPct) ? tgtPct : null,
    barier, mfe: +(mfe * 100).toFixed(2), mae: +(mae * 100).toFixed(2),
    skala: e.ekspresi?.skalaEfektif ?? null, modeAsah: !!e.mate?.modeAsah,
    odds: e.odds?.skor ?? null,
    gerbang: Array.isArray(e.kunci) ? e.kunci : [],
    catatan: (e.catatan || '').slice(0, 220),
  }
}

const hasil = soal.map(nilaiSatu).filter(Boolean)
const N = hasil.length
const benar = hasil.filter((h) => h.status === 'BENAR')
const salah = hasil.filter((h) => h.status === 'SALAH')
const netSum = hasil.reduce((s, h) => s + h.net, 0)
const grossWin = benar.reduce((s, h) => s + h.net, 0)
const grossLoss = -salah.reduce((s, h) => s + h.net, 0)
const pf = grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? Infinity : 0)

const grup = (kunciFn, label) => {
  const m = new Map()
  for (const h of hasil) {
    const k = kunciFn(h) ?? '?'
    if (!m.has(k)) m.set(k, { n: 0, benar: 0, net: 0 })
    const g = m.get(k); g.n++; if (h.status === 'BENAR') g.benar++; g.net += h.net
  }
  return [...m.entries()].map(([k, g]) => ({
    [label]: k, n: g.n, akurasiPct: +((g.benar / g.n) * 100).toFixed(1), netPct: +(g.net * 100).toFixed(2),
  })).sort((a, b) => b.netPct - a.netPct)
}

const ringkasan = {
  diperbarui: new Date().toISOString(),
  metode: 'penjaga.mjs v6.1 ASLI dijalankan pada dunia beku (T historis, blind dijamin lapisan data); vonis resmi = close T+24j − FEE 0.002',
  soal: N, benar: benar.length, salah: salah.length,
  akurasiPct: N ? +((benar.length / N) * 100).toFixed(1) : 0,
  netKumulatifPct: +(netSum * 100).toFixed(2),
  profitFactor: Number.isFinite(pf) ? +pf.toFixed(3) : String(pf),
  avgWinPct: benar.length ? +(grossWin / benar.length * 100).toFixed(3) : 0,
  avgLossPct: salah.length ? +(grossLoss / salah.length * 100).toFixed(3) : 0,
  perKelas: grup((h) => h.kelas, 'kelas'),
  perJalur: grup((h) => h.jalur, 'jalur'),
  perArah: grup((h) => h.arah, 'arah'),
  perRezim: grup((h) => h.rezim, 'rezim'),
  perZonaImpas: grup((h) => h.zona, 'zona'),
  perKeyakinan: grup((h) => h.keyakinan == null ? '?' : h.keyakinan < 40 ? '<40' : h.keyakinan < 55 ? '40-54' : h.keyakinan < 70 ? '55-69' : '>=70', 'keyakinan'),
  perBarier: grup((h) => h.barier, 'barier'),
  perKoinTerburuk: grup((h) => h.simbol, 'koin').sort((a, b) => a.netPct - b.netPct).slice(0, 10),
  perKoinTerbaik: grup((h) => h.simbol, 'koin').slice(0, 10),
  modeAsah: grup((h) => (h.modeAsah ? 'asah' : 'normal'), 'mode'),
  stopTerpasangPct: hasil.filter((h) => h.stopPct != null).length,
  catatanBarier: {
    info: 'barier = walk intrabar dgn stopPct/targetPct pra-registrasi (same-candle both-hit → STOP, konservatif); kelas B (jawaban radar per-koin) tak membawa stop/target → TANPA_RENCANA, dinilai rumus vonis resmi yang sama',
  },
  analisisGerbang: (() => {
    // kelas B: gerbang mana yang menahan jawaban otak — dan jawaban itu benar/salah?
    const m = new Map()
    for (const h of hasil) {
      if (h.kelas !== 'B') continue
      for (const g of (h.gerbang.length ? h.gerbang : ['tanpa-kunci'])) {
        if (!m.has(g)) m.set(g, { gerbang: g, n: 0, jawabanBenar: 0, jawabanSalah: 0, netJikaLanjutPct: 0 })
        const x = m.get(g); x.n++
        if (h.status === 'BENAR') x.jawabanBenar++; else x.jawabanSalah++
        x.netJikaLanjutPct += h.net * 100
      }
    }
    return [...m.values()].map((x) => ({ ...x, netJikaLanjutPct: +x.netJikaLanjutPct.toFixed(2) }))
      .sort((a, b) => b.n - a.n)
  })(),
  soalTerburuk: [...hasil].sort((a, b) => a.net - b.net).slice(0, 6).map((h) => ({ simbol: h.simbol, arah: h.arah, kelas: h.kelas, T: h.T, net: h.net, keyakinan: h.keyakinan, catatan: h.catatan.slice(0, 120) })),
  soalTerbaik: [...hasil].sort((a, b) => b.net - a.net).slice(0, 6).map((h) => ({ simbol: h.simbol, arah: h.arah, kelas: h.kelas, T: h.T, net: h.net, keyakinan: h.keyakinan })),
}
const laporan = { ringkasan, detail: hasil }
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(laporan, null, 1))
console.log(JSON.stringify(ringkasan, null, 1))
console.log(`\nTERBACA ${N} soal → ${OUT}`)
