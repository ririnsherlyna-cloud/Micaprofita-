// ============================================================
// DOKTRIN-PERISIKO (V357) — modul murni, satu kebenaran dua organ
// ============================================================
// ULTIMATUM PEMILIK (2026-10-19): "kenapa menarik SL dan TP di ambang
// +1 persen! Kenapa sistem kita takut? Padahal pergerakan harga koin
// gak naik +1 turun -1! Lihat saja di semua data harian tiap koin 24
// jam secara real time! Kenaikan mereka berapa! Penurunan mereka berapa!"
//
// DIAGNOSIS AKAR (forensik 2026-10-19):
//  - penjaga V262 memakai gain/rugi MEDIAN kerucut-MC sebagai target/stop
//    harga (baris `_tgtPctImp = eksA.gainPct`) — padahal komentar sendiri
//    bilang "bukan sasaran harga". Median = setengah jalan = band ±1-2%
//    di DALAM debu harian koin → AVAX 10-06 terkunci target +1,59% /
//    stop −1,41% untuk koin yang bernapas ±4-6% per hari → 3/10 rencana
//    kedaluwarsa kena fee, kemenangan hanya +0,4R.
//  - BUKTI NYATA AVAX: 13 hari band coward itu kena fee terus.
//
// PENYEMBUHAN — doktrin pemilik sendiri (pustaka/doktrin.json, PUSTA-
// DOKTRIN-V001), kini EKSEKUTABEL:
//  D3/RD01  H24/L24 dari 24 lilin TERTUTUP, Rentang = H24 − L24
//  RD02     P = (H24+L24+C24)/3 · R1 = 2P−L24 · S1 = 2P−H24
//           R2 = P + Rentang · S2 = P − Rentang
//  D4       validitas = ruang tersisa (entry sudah lewat R2+ATR → tak layak)
//  D5       stop = level pembatal ∓ 0,5×ATR14 (BUY: pembatal = L24;
//           SELL: pembatal = H24) — lantai 1,2×ATR anti-debu
//  D6/D7    tangga target R1 → R2 → H24+0,618×R → H24+1,0×R, pilih anak
//           tangga pertama dengan R:R ≥ 2 SETELAH fee; bila tidak ada,
//           lantai napas: target minimal 0,618×Rentang dari entry —
//           TIDAK PERNAH lagi target di dalam debu harian.
//  NAPAS    tiap rencana membawa napas koin NYATA 7 hari (rentang harian
//           rata-rata, naik/turun harian rata-rata) — bukti sistem MELIHAT
//           pergerakan sesungguhnya, bukan mengarang band.
// Murni: tanpa fetch, tanpa kunci, tanpa Math.random. Deterministik.
// ============================================================

const ambilAngka = (x, ...kunci) => {
  for (const k of kunci) { const v = x ? x[k] : undefined; if (Number.isFinite(+v)) return +v }
  return null
}

/** Lilin 1h TERTUTUP: buang lilin terakhir yang masih berjalan. */
export function lilinTertutup(c, kini = Date.now()) {
  const out = (c || []).filter((x) => {
    const t = ambilAngka(x, 't', 'T')
    return t != null && t + 3600e3 <= kini
  })
  return out.length >= 26 ? out : null
}

/** ATR14 Wilder-ish dari lilin tertutup (rata TR 14 terakhir — deterministik). */
export function atr14(cc) {
  if (!cc || cc.length < 15) return null
  const tr = []
  for (let i = 1; i < cc.length; i++) {
    const h = ambilAngka(cc[i], 'h', 'H'), l = ambilAngka(cc[i], 'l', 'L'), pc = ambilAngka(cc[i - 1], 'c', 'C')
    if (h == null || l == null || pc == null) continue
    tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)))
  }
  const d = tr.slice(-14)
  return d.length ? d.reduce((a, b) => a + b, 0) / d.length : null
}

/** Kerangka D3/RD01+RD02: H24/L24/P/R1/S1/R2/S2 dari 24 lilin tertutup terakhir. */
export function kerangka24(cc) {
  if (!cc || cc.length < 25) return null
  const d24 = cc.slice(-24)
  const H24 = Math.max(...d24.map((x) => ambilAngka(x, 'h', 'H')))
  const L24 = Math.min(...d24.map((x) => ambilAngka(x, 'l', 'L')))
  const C24 = ambilAngka(d24[d24.length - 1], 'c', 'C')
  if (![H24, L24, C24].every(Number.isFinite)) return null
  const Rng = Math.max(H24 - L24, 1e-12)
  const P = (H24 + L24 + C24) / 3
  return {
    H24, L24, C24, Rng, P,
    R1: 2 * P - L24, S1: 2 * P - H24,
    R2: P + Rng, S2: P - Rng,
    atr: atr14(cc),
  }
}

/**
 * NAPAS KOIN — pergerakan harian NYATA (mandat pemilik: "lihat saja di
 * semua data harian tiap koin 24 jam! Kenaikan mereka berapa! Penurunan
 * mereka berapa!"). Dari lilin 1h tertutup, dikelompokkan 24-24 per hari
 * UTC: perubahan tutup-ke-tutup dan rentang (H−L)/C tiap hari.
 * ambil nHari terakhir (default 7).
 */
export function napasKoin(cc, nHari = 7) {
  if (!cc || cc.length < 48) return null
  const hari = new Map()
  for (const x of cc) {
    const t = ambilAngka(x, 't', 'T')
    if (t == null) continue
    const k = Math.floor(t / 86400e3)          // hari UTC
    if (!hari.has(k)) hari.set(k, [])
    hari.get(k).push(x)
  }
  const hariUrut = [...hari.keys()].sort((a, b) => a - b)
  // buang hari terakhir (belum penuh) dan hari pertama (mungkin separuh)
  const penuh = hariUrut.slice(1, -1).slice(-nHari)
  const naik = [], turun = [], rentang = []
  for (let i = 1; i < penuh.length + 1; i++) {
    const d = hari.get(penuh[i - 1]); if (!d || d.length < 20) continue
    const buka = ambilAngka(d[0], 'o', 'O'), tutup = ambilAngka(d[d.length - 1], 'c', 'C')
    const h = Math.max(...d.map((x) => ambilAngka(x, 'h', 'H'))), l = Math.min(...d.map((x) => ambilAngka(x, 'l', 'L')))
    if (![buka, tutup, h, l].every(Number.isFinite)) continue
    const chg = 100 * (tutup / buka - 1)
    if (chg >= 0) naik.push(chg); else turun.push(chg)
    rentang.push(100 * (h - l) / Math.max(tutup, 1e-12))
  }
  const rata = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null
  return {
    hariDihitung: rentang.length,
    rentangHarianPct: rata(rentang),                          // napas penuh: rata (H−L)/C per hari
    naikHarianPct: rata(naik),                                // rata hari-hari HIJAU (berapa naiknya)
    turunHarianPct: rata(turun),                              // rata hari-hari MERAH (berapa turunnya)
    hariNaik: naik.length, hariTurun: turun.length,
  }
}

/**
 * RENCANA DOKTRIN — stop/target sesuai D3-D7 (lihat kepala berkas).
 * Return null bila data tak cukup (pemanggil jatuh ke lantai lamanya
 * dan mencatat jujur). `feePct` = fee pulang-pergi dalam % (0.2 = 0,2%).
 */
export function doktrinRencana(c, arah, entry, feePct = 0.2, kini = Date.now()) {
  const cc = lilinTertutup(c, kini)
  if (!cc) return null
  const k = kerangka24(cc)
  if (!k || !k.atr) return null
  if (!Number.isFinite(+entry) || entry <= 0) return null
  const fee = (feePct / 100) * entry
  const NAMA = ['R1', 'R2', 'H24+0.618R', 'H24+1.0R']
  const NAMAS = ['S1', 'S2', 'L24−0.618R', 'L24−1.0R']
  const napas = napasKoin(cc)

  if (arah === 'BUY') {
    if (entry > k.R2 + k.atr) return { kerangka: k, napas, layak: false, alasan: 'entry di atas R2+ATR — ruang naik sudah habis (D4 validitas), doktrin menolak memberi target karangan' }
    const pembatal = k.L24                                   // kembali di bawah L24 = setup batal
    let stop = pembatal - 0.5 * k.atr
    let stopDist = entry - stop
    const lantai = 1.2 * k.atr
    if (stopDist < lantai) { stopDist = lantai; stop = entry - stopDist }   // anti-debu D5
    const tangga = [k.R1, k.R2, k.H24 + 0.618 * k.Rng, k.H24 + 1.0 * k.Rng]
    let idx = -1
    for (let i = 0; i < tangga.length; i++) {
      const t = tangga[i]
      if (t <= entry + 2 * fee) continue
      const untung = (t - entry) - fee
      const rugi = stopDist + fee
      if (rugi > 0 && untung / rugi >= 2) { idx = i; break }
    }
    if (idx >= 0) {
      const t = tangga[idx]
      return { kerangka: k, napas, layak: true, arah, entry, stop, target: t, stopDist, stopPct: 100 * stopDist / entry, targetPct: 100 * (t - entry) / entry, anak: NAMA[idx], sumber: 'doktrin-tangga', rrKotor: (t - entry) / Math.max(stopDist, 1e-12) }
    }
    // LANTAI NAPAS — tidak ada anak tangga yang membayar 2:1; target TETAP
    // diberi ruang minimal 0,618×Rentang (debunya saja 0,618 hari) — RR
    // jujur dicatat, buku medan yang menghakimi.
    const t = Math.max(entry + 0.618 * k.Rng, entry + 2 * fee)
    const stopPct = 100 * stopDist / entry, tgtPct = 100 * (t - entry) / entry
    return { kerangka: k, napas, layak: true, arah, entry, stop, target: t, stopDist, stopPct, targetPct: tgtPct, anak: 'lantai-napas-0.618R', sumber: 'doktrin-lantai', rrKotor: (t - entry) / Math.max(stopDist, 1e-12) }
  }

  if (arah === 'SELL') {
    if (entry < k.S2 - k.atr) return { kerangka: k, napas, layak: false, alasan: 'entry di bawah S2−ATR — ruang turun sudah habis (D4 validitas), doktrin menolak memberi target karangan' }
    const pembatal = k.H24                                   // kembali di atas H24 = setup batal
    let stop = pembatal + 0.5 * k.atr
    let stopDist = stop - entry
    const lantai = 1.2 * k.atr
    if (stopDist < lantai) { stopDist = lantai; stop = entry + stopDist }
    const tangga = [k.S1, k.S2, k.L24 - 0.618 * k.Rng, k.L24 - 1.0 * k.Rng]
    let idx = -1
    for (let i = 0; i < tangga.length; i++) {
      const t = tangga[i]
      if (t >= entry - 2 * fee) continue
      const untung = (entry - t) - fee
      const rugi = stopDist + fee
      if (rugi > 0 && untung / rugi >= 2) { idx = i; break }
    }
    if (idx >= 0) {
      const t = tangga[idx]
      return { kerangka: k, napas, layak: true, arah, entry, stop, target: t, stopDist, stopPct: 100 * stopDist / entry, targetPct: 100 * (entry - t) / entry, anak: NAMAS[idx], sumber: 'doktrin-tangga', rrKotor: (entry - t) / Math.max(stopDist, 1e-12) }
    }
    const t = Math.min(entry - 0.618 * k.Rng, entry - 2 * fee)
    const stopPct = 100 * stopDist / entry, tgtPct = 100 * (entry - t) / entry
    return { kerangka: k, napas, layak: true, arah, entry, stop, target: t, stopDist, stopPct, targetPct: tgtPct, anak: 'lantai-napas-0.618R', sumber: 'doktrin-lantai', rrKotor: (entry - t) / Math.max(stopDist, 1e-12) }
  }
  return null
}

/** R:R setelah-fee (D6) — untung bersih / rugi bersih, dalam % harga. */
export function rrBersih(targetPct, stopPct, feePct = 0.2) {
  const u = targetPct - feePct, r = stopPct + feePct
  return r > 0 ? u / r : null
}
