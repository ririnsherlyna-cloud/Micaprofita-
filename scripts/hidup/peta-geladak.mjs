// ============================================================
// PETA-GELADAK (V307) — otak tempaan naik ke geladak NYATA.
// Mandat pemilik (2026-10-08): "kita akan bawa makhluk ke geladak
// nyata agar makin kuat."
//
// Tiga tugas modul ini:
//  1. PETA WARISAN  : 129+ pelajaran TEMPAN-200 (utama+dadakan)
//     + 108 pelajaran UJIAN-500 diwariskan ke geladak.
//  2. PETA DUNIA    : tiap vonis ledger yang DINILAI PASAR nyata
//     (BENAR/SALAH/MENANG/RUGI) menjadi pelajaran baru — tanda
//     jejak 24 lilin saat vonis lahir → arah yang SEBENARNYA
//     terjadi. Belajar dari kekalahan dunia hidup, bukan simulasi.
//  3. SUARA PETA    : di walk-forward geladak, peta ikut dinilai
//     seperti faktor lain — tanpa edge nyata = bobot NOL (jujur).
//
// Kejujuran: pelajaran dunia HANYA dari ledger tersegel yang sudah
// dinilai; tak ada karangan; tabrakan wajah diselesaikan mayoritas
// bukti dan dicatat terbuka (jumlah konflik dilaporkan).
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

export const FILE_PETA = 'laporan/peta-geladak.json'
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

// ---------- fitur KARTU — identik dengan tempa200.mjs/ujian500.mjs (dijaga ujiBank) ----------
export function fiturDari(strip) {
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
export function tandaDari(x) {
  return [
    x.r3 > 1.2, x.r3 < -1.2, x.r12 > 3, x.r12 < -3,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 0, x.r1 < 0,
  ].map(Number).join('')
}
export function tandaDi(X, i) {
  if (i < 23) return null
  const strip = X.bar.slice(i - 23, i + 1).map(b => ({ o: b.O, h: b.H, l: b.L, c: b.C, v: b.V }))
  if (strip.length < 24 || strip.some(b => b.o == null || b.c == null || b.h == null || b.l == null || b.v == null)) return null
  return tandaDari(fiturDari(strip))
}

// ---------- muat & tanam peta ----------
export function muatPeta() {
  const buku = existsSync(FILE_PETA) ? JSON.parse(readFileSync(FILE_PETA, 'utf8')) : null
  const pelajaran = (buku && buku.pelajaran) || {}
  const statistik = { warisan: 0, dunia: 0, total: Object.keys(pelajaran).length }
  for (const p of Object.values(pelajaran)) if (p.sumber === 'dunia') statistik.dunia++; else statistik.warisan++
  return { pelajaran, statistik, buku }
}

// sekali jalan saat denyut: tanam pelajaran warisan (tempaan V306/V307) ke buku peta
export function tanamWarisan() {
  const baca = (f) => { try { return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null } catch { return null } }
  const tempa = baca('laporan/tempa200.json')
  const ujian = baca('laporan/ujian500.json')
  const buku = muatPeta().buku || {
    protokol: 'PETA-GELADAK-V307', dihasilkan: null,
    aturan: 'tanda jejak 24 lilin (18 fitur, sama dengan tempaan) → arah; pelajaran warisan dari tempaan tersegel; pelajaran dunia HANYA dari ledger yang dinilai pasar; tabrakan wajah = mayoritas bukti, dicatat terbuka',
    pelajaran: {}, segel: null,
  }
  let tanam = 0
  const tambah = (tanda, arah, sumber, buktiStr) => {
    if (!tanda || tanda.length !== 18) return
    const p = buku.pelajaran[tanda] = buku.pelajaran[tanda] || { NAIK: 0, TURUN: 0 }
    const sebelum = p.arah
    if (sumber === 'warisan') { // warisan tidak menambah hitungan dunia, hanya mengisi wajah kosong
      if (!p.arah) { p.arah = arah; p.sumber = 'warisan'; p.buktiTempaan = buktiStr; tanam++ }
      return
    }
    p[sumber === 'dunia' ? (arah === 'NAIK' ? 'NAIK' : 'TURUN') : (arah === 'NAIK' ? 'NAIK' : 'TURUN')]++
    // pelajaran dunia berhak menimpa arah (mayoritas bukti nyata)
    p.arah = p.NAIK >= p.TURUN ? 'NAIK' : 'TURUN'
    p.sumber = 'dunia'
    p.arahSebelumTimpa = sebelum !== p.arah ? sebelum : p.arahSebelumTimpa
    tanam++
  }
  for (const x of (tempa && tempa.pelajaran) || []) tambah(x.tanda, x.arahBenar, 'warisan', x.bukti)
  for (const x of (ujian && ujian.pelajaran) || []) tambah(x.tanda, x.arahBenar, 'warisan', x.bukti)
  // peta dunia: dari ledger yang dinilai (dipanggil terpisah oleh guru-master lewat ajariDariLedger)
  buku.dihasilkan = new Date().toISOString()
  buku.statistik = {
    total: Object.keys(buku.pelajaran).length,
    warisan: Object.values(buku.pelajaran).filter(p => p.sumber === 'warisan').length,
    dunia: Object.values(buku.pelajaran).filter(p => p.sumber === 'dunia').length,
  }
  const tubuh = JSON.stringify({ ...buku, segel: null })
  buku.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(buku)), readAt: new Date().toISOString() }
  mkdirSync('laporan', { recursive: true })
  writeFileSync(FILE_PETA, JSON.stringify(buku, null, 1))
  return { tanam, statistik: buku.statistik }
}

// pelajaran dari dunia: ledger entries yang sudah dinilai pasar
export function ajariDariLedger(ledger, X) {
  const buku = muatPeta().buku || { pelajaran: {} }
  let diajari = 0
  for (const l of ledger) {
    if (l.status !== 'dinilai' || !l.tanda || l.diajari) continue
    const arahNyata = (l.hasil === 'MENANG' || l.hasil === 'BENAR') ? l.arah
      : (l.hasil === 'RUGI' || l.hasil === 'SALAH') ? (l.arah === 'NAIK' ? 'TURUN' : 'NAIK') : null
    if (!arahNyata) continue
    const p = buku.pelajaran[l.tanda] = buku.pelajaran[l.tanda] || { NAIK: 0, TURUN: 0, sumber: 'dunia' }
    p[arahNyata]++
    p.arah = p.NAIK >= p.TURUN ? 'NAIK' : 'TURUN'
    p.sumber = 'dunia'
    p.akhirBukti = `${p.NAIK}/${p.TURUN}`
    l.diajari = true // tandai supaya satu vonis hanya jadi satu pelajaran
    diajari++
  }
  return { diajari, buku }
}

export function simpanPeta(buku) {
  buku.dihasilkan = new Date().toISOString()
  buku.statistik = {
    total: Object.keys(buku.pelajaran).length,
    warisan: Object.values(buku.pelajaran).filter(p => p.sumber === 'warisan').length,
    dunia: Object.values(buku.pelajaran).filter(p => p.sumber === 'dunia').length,
  }
  const tubuh = JSON.stringify({ ...buku, segel: null })
  buku.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(buku)), readAt: new Date().toISOString() }
  mkdirSync('laporan', { recursive: true })
  writeFileSync(FILE_PETA, JSON.stringify(buku, null, 1))
}
