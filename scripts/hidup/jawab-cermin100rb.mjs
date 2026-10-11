#!/usr/bin/env node
// ============================================================
// JAWAB-CERMIN-100RB (V334) — OTAK MAKHLUK KONDISI-SAAT-INI.
// Makhluk MENJAWAB, bukan agen. Tebakan dikunci dulu, kunci dibaca
// sesudahnya (warisan V329-V333). Tiga jawaban per soal:
//   ARAH (BUY/SELL), TP "ke berapa" (harga pasti), ALASAN
//   profesional (kenapa arah itu; kenapa TP di ambang itu, bukan
//   di atasnya).
// Lapisan nalar (kondisi 2026-10-11, jujur berlapis):
//   1. INGATAN — buku pengalaman 5 garis syaraf (SQUEEZE/SUCKER/
//      BREAKOUT/ALTSEASON/PUMPSPIKE): 17.260 momen berfakta
//      (entry vs close48) dipetakan tanda→arah (mayoritas).
//   2. SIMETRI — wajah tak dikenal → wajah terdekat Hamming ≤ 3.
//   3. KARTU-NAIF — bacaan momentum + anatomi wick (nalar bawaan).
//   TP: struktur kartu — aturan lama (hi20/lo20) atau 1×ATR bila
//   aturan lama sudah ditembus; itulah "ambang dana untuk napas"
//   versi kondisi-saat-ini (sebelum pengalaman V334).
//   ALASAN: suara sendiri — sebut mekanisme + ambang + kenapa
//   bukan di atasnya (napas/lelah/ambil dana).
// Mode:
//   --bank       jawab 100rb (baca shard gz, tulis jawaban gz per shard)
//   --dadakan    jawab dadakan-1000
//   --sampel     jawab sampel-1200
//   --pengalaman <file.json>  pakai pengalaman CERMIN (pasca-belajar)
//   --verifikasi denyut jantung: jawab ulang sampel-1200 (tebakan
//                dikunci dulu), nilai vs kunci, banding vonis dasar;
//                gugur sedikit saja → exit 1
// Nol Math.random. Deterministik penuh.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import zlib from 'node:zlib'

const DIR_JAWAB = 'laporan/cermin100rb'
const FILE_DADAK = 'ujian/soal-cermin-dadakan-1000.json'
const FILE_SAMPEL = 'ujian/soal-cermin-sampel-1200.json'
const FILE_SESEGEL = 'ujian/cermin100rb/segel.json'
const FILE_DASAR = 'laporan/cermin-100rb.json'
const BANK_GARIS = ['soal-squeeze-3500.json', 'soal-sucker-3500.json', 'soal-breakout-3500.json', 'soal-altseason-3500.json', 'soal-pumpspike-3500.json']

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const fmt = (v) => {
  if (!isFinite(v)) return String(v)
  const a = Math.abs(v)
  if (a >= 1000) return String(Math.round(v * 100) / 100)
  if (a >= 1) return String(Math.round(v * 10000) / 10000)
  if (a >= 0.01) return String(Math.round(v * 1000000) / 1000000)
  return String(Math.round(v * 1e8) / 1e8)
}

// ---------- ingatan: tanda → {BUY, SELL} dari 17.260 momen berfakta ----------
function bangunIngatan() {
  const ingat = new Map() // tanda -> {BUY:n, SELL:n}
  let momen = 0
  for (const f of BANK_GARIS) {
    const p = `ujian/${f}`
    if (!existsSync(p)) continue
    const j = JSON.parse(readFileSync(p, 'utf8'))
    for (const s of j.soal) {
      if (s.keluarga !== 'PASAR' || !s.tanda || !s.entry || !s.close48) continue
      const arah = s.close48 > s.entry ? 'BUY' : s.close48 < s.entry ? 'SELL' : null
      if (!arah) continue
      momen++
      const e = ingat.get(s.tanda) || { BUY: 0, SELL: 0 }
      e[arah]++
      ingat.set(s.tanda, e)
    }
  }
  return { ingat, momen }
}
function arahDariIngatan(tanda, ingat) {
  const e = ingat.get(tanda)
  if (!e) return null
  const total = e.BUY + e.SELL
  if (total === 0) return null
  return { arah: e.BUY > e.SELL ? 'BUY' : e.SELL > e.BUY ? 'SELL' : null, BUY: e.BUY, SELL: e.SELL, total, rasio: Math.max(e.BUY, e.SELL) / total }
}
function simetriTerdekat(tanda, ingat, maksJarak = 3) {
  let terbaik = null, jarakMin = maksJarak + 1
  for (const k of ingat.keys()) {
    if (k.length !== tanda.length) continue
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) { d++; if (d > jarakMin) break }
    if (d < jarakMin) {
      const a = arahDariIngatan(k, ingat)
      if (a && a.arah) { jarakMin = d; terbaik = a }
    }
  }
  return terbaik ? { ...terbaik, jarak: jarakMin } : null
}

// ---------- nalar kartu-naif (bawaan makhluk, tanpa ingatan) ----------
function arahNaif(x) {
  const spring = x.wickBawah > 2 && x.posisi < 0.2                 // disapu lalu ditutup kuat
  const limpakBalik = x.wickAtas > 2.5 && x.posisi > 0.8 && x.r1 < 0 // disapu ke atas lalu ditutup turun
  const arusNaik = x.r3 > 0.5 && x.posisi > 0.5 && x.wickAtas < 2.5
  const arusTurun = x.r3 < -0.5 && x.posisi < 0.5 && x.wickBawah < 2.5
  const tembus = x.breakHigh && x.r1 > 0
  const jebol = x.breakLow && x.r1 < 0
  if (limpakBalik) return 'SELL'
  if (spring) return 'BUY'
  if (tembus) return 'BUY'
  if (jebol) return 'SELL'
  if (arusNaik) return 'BUY'
  if (arusTurun) return 'SELL'
  return x.r1 > 0 ? 'BUY' : 'SELL'
}
function mekanismeNaif(keluarga, arah, x) {
  if (arah === 'BUY') {
    if (keluarga === 'PUKUL-TANAH') return 'PUKUL-LALU-PANTUL'
    if (keluarga === 'LIMPAK') return 'NAPAS-LANJUT'
    if (x.streakNaik >= 3 || x.r12 > 3) return 'RAKIT-TANPA-NAPAS'
    return 'NAPAS-LANJUT'
  }
  if (keluarga === 'LIMPAK') return 'LIMPAK-TERPOTONG'
  if (keluarga === 'NAPAS-LELAH') return 'RUNTUH-LURUS'
  if (x.streakTurun >= 3 || x.r12 < -3) return 'MELUNCUR-BERNAPAS'
  return 'RUNTUH-LURUS'
}
function tpKartu(x, atrPct, arah) {
  const atr = Math.max(atrPct || 0.5, 0.8)
  if (arah === 'BUY') {
    let tp = x.breakHigh ? x.e * (1 + atr / 100) : Math.max(x.hi20, x.e * 1.004)
    tp = Math.min(Math.max(tp, x.e * 1.002), x.e * 1.15)
    return tp
  }
  let tp = x.breakLow ? x.e * (1 - atr / 100) : Math.min(x.lo20, x.e * 0.996)
  tp = Math.max(Math.min(tp, x.e * 0.998), x.e * 0.85)
  return tp
}
function alasanMakhluk(arah, entry, tp, mekanisme, keluarga, x, sumber) {
  const pct = (arah === 'BUY' ? tp / entry - 1 : 1 - tp / entry) * 100
  const ambang = arah === 'BUY' ? `aturan lama ${fmt(x.hi20)}` : `aturan lama ${fmt(x.lo20)}`
  const kenapaArah = arah === 'BUY'
    ? (mekanisme === 'PUKUL-LALU-PANTUL'
      ? `sikuan ${keluarga}: harga disapu ke bawah lalu ditutup kuat — dana diambil dulu, sisa napas naik`
      : `momen ${keluarga} searah: ${sumber === 'ingatan' ? 'wajah ini sudah pernah aku jalani' : 'kartu ini'} menunjukkan pembeli masih memegang — harga menyentuh wilayah ini lalu dana diambil untuk napas naik`)
    : (mekanisme === 'LIMPAK-TERPOTONG'
      ? `sikuan ${keluarga}: lonjakan menyapu dana di atas aturan lama lalu ditutup melemah — yang beli di ujung wick akan dilepas`
      : `momen ${keluarga} searah: ${sumber === 'ingatan' ? 'wajah ini sudah pernah aku jalani' : 'kartu ini'} menunjukkan napas naik sudah lelah — dana turun mencari dasar`)
  const kenapaTp = arah === 'BUY'
    ? `TP di ${fmt(tp)} (+${pct.toFixed(2)}%), bukan di atasnya: di ambang itu ${ambang} menahan — dana mulai diambil untuk napas; di atasnya harga lelah dan biasanya diturunkan dulu`
    : `TP di ${fmt(tp)} (−${pct.toFixed(2)}%), bukan di bawahnya: di ambang itu ${ambang} menopang — dana kembali diambil untuk napas turun berikutnya; di bawahnya harga sudah terlalu murah untuk dijual`
  return `${arah} dari ${fmt(entry)} — ${kenapaArah}; ${kenapaTp}.`
}

// ---------- pengalaman CERMIN (pasca-belajar, opsional) ----------
function muatPengalaman(file) {
  if (!file || !existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}
function arahDenganPengalaman(keluarga, ingatHasil, naif, peng) {
  if (peng && peng.arah && peng.arah[keluarga]) {
    const p = peng.arah[keluarga]
    const lemah = !ingatHasil || ingatHasil.rasio < 1.15
    if (lemah && p.majoritas >= 0.55) return { arah: p.arah, sumber: 'pengalaman-cermin' }
  }
  return null
}
function tpDenganPengalaman(keluarga, arah, entry, peng) {
  if (peng && peng.tp && peng.tp[`${keluarga}|${arah}`]) {
    const p = peng.tp[`${keluarga}|${arah}`]
    if (p.p50 > 0.0005 && p.p50 < 0.2) {
      const tp = arah === 'BUY' ? entry * (1 + p.p50) : entry * (1 - p.p50)
      const aman = arah === 'BUY' ? Math.min(Math.max(tp, entry * 1.002), entry * 1.15) : Math.max(Math.min(tp, entry * 0.998), entry * 0.85)
      return aman
    }
  }
  return null
}

// ---------- jawab satu soal (KARTU SAJA — kunci tak disentuh) ----------
function jawabSoal(soal, ingat, peng) {
  const x = soal.x
  const ing = arahDariIngatan(soal.tanda, ingat)
  let arah, sumber
  if (ing && ing.arah) { arah = ing.arah; sumber = 'ingatan' }
  else {
    const sim = simetriTerdekat(soal.tanda, ingat)
    const dariPeng = arahDenganPengalaman(soal.keluargaJebakan, ing, null, peng)
    if (dariPeng) { arah = dariPeng.arah; sumber = dariPeng.sumber }
    else if (sim) { arah = sim.arah; sumber = `simetri(${sim.jarak})` }
    else { arah = arahNaif(x); sumber = 'kartu-naif' }
  }
  let tp = tpDenganPengalaman(soal.keluargaJebakan, arah, x.e, peng)
  if (tp === null) tp = tpKartu(x, soal.atrPct, arah)
  const mekanisme = mekanismeNaif(soal.keluargaJebakan, arah, x)
  const alasan = alasanMakhluk(arah, x.e, tp, mekanisme, soal.keluargaJebakan, x, sumber)
  return { id: soal.id, arah, tp: +fmt(tp), pct: +((arah === 'BUY' ? tp / x.e - 1 : 1 - tp / x.e) * 100).toFixed(3), mekanisme, alasan, sumber }
}

// ---------- penilaian sampel (untuk --verifikasi) ----------
function nilaiSampel(soalList, jawabList) {
  const m = new Map(jawabList.map(j => [j.id, j]))
  let benar = 0, n = 0
  for (const s of soalList) {
    const j = m.get(s.id); if (!j) continue
    n++; if (j.arah === s.kelasHasil) benar++
  }
  return { n, benar, akurasi: n ? benar / n : 0 }
}
function segulJson(j) { return hash16(JSON.stringify({ ...j, segel: null })) }

async function main() {
  const arg = process.argv.slice(2)
  const mode = arg.includes('--dadakan') ? 'dadakan' : arg.includes('--sampel') ? 'sampel' : arg.includes('--verifikasi') ? 'verifikasi' : 'bank'
  const idxPeng = arg.indexOf('--pengalaman')
  const peng = idxPeng >= 0 ? muatPengalaman(arg[idxPeng + 1]) : null
  mkdirSync(DIR_JAWAB, { recursive: true })

  const t0 = Date.now()
  const { ingat, momen } = bangunIngatan()
  console.log(`ingatan dimuat: ${ingat.size} wajah dari ${momen} momen berfakta (5 garis syaraf)${peng ? ' + pengalaman CERMIN' : ''}`)

  const bacaShard = (file) => zlib.gunzipSync(readFileSync(file)).toString('utf8')

  if (mode === 'bank') {
    // verifikasi segel dulu (jujur: bank tamu ditolak)
    const segel = JSON.parse(readFileSync(FILE_SESEGEL, 'utf8'))
    for (const s of segel.shard) {
      const gz = readFileSync(s.file)
      if (hashFullBuf(gz) !== s.sha256) throw new Error(`shard ${s.file} bobol — jawaban ditolak`)
    }
    console.log(`segel ${segel.shard.length} shard cocok (${segel.hashTotal.slice(0, 16)})`)
    for (let s = 0; s < segel.shard.length; s++) {
      const file = segel.shard[s].file
      const baris = bacaShard(file).trim().split('\n')
      let out = ''
      for (const b of baris) {
        const soal = JSON.parse(b)
        const j = jawabSoal(soal, ingat, peng)
        out += JSON.stringify(j) + '\n'
      }
      const gzOut = zlib.gzipSync(Buffer.from(out, 'utf8'), { level: 6 })
      const nama = `${DIR_JAWAB}/jawaban-${String(s).padStart(2, '0')}.jsonl.gz`
      writeFileSync(nama, gzOut)
      if (s % 2 === 0 || s === segel.shard.length - 1) console.log(`  shard ${s}: ${baris.length} soal dijawab (${(gzOut.length / 1048576).toFixed(2)} MB gz)`)
    }
    console.log(`=== JAWAB BANK SELESAI ${Math.round((Date.now() - t0) / 1000)}s ===`)
    return
  }

  const file = mode === 'dadakan' ? FILE_DADAK : FILE_SAMPEL
  const bank = JSON.parse(readFileSync(file, 'utf8'))
  if (bank.segel && segulJson(bank) !== bank.segel.hash) throw new Error(`segel ${file} bobol — ditolak`)
  const FASE1 = bank.soal.map(s => jawabSoal(s, ingat, peng)) // tebakan dikunci dulu
  const namaOut = `${DIR_JAWAB}/jawaban-${mode}${peng ? '-pasca' : ''}.json`
  writeFileSync(namaOut, JSON.stringify({ protokol: 'CERMIN-100RB-JAWABAN', mode, pengalaman: peng ? peng.segel : null, jumlah: FASE1.length, jawaban: FASE1 }))

  if (mode === 'verifikasi') {
    // FASE 2 — kunci dibaca sesudah tebakan tersegel
    const nilai = nilaiSampel(bank.soal, FASE1)
    const dasar = existsSync(FILE_DASAR) ? JSON.parse(readFileSync(FILE_DASAR, 'utf8')) : null
    const dasarSampel = dasar && dasar.sampel ? dasar.sampel.akurasi : null
    console.log(`VONIS CERMIN (sampel ${nilai.n}): arah benar ${nilai.benar}/${nilai.n} = ${(nilai.akurasi * 100).toFixed(2)}%${dasarSampel != null ? ` (dasar ${(dasarSampel * 100).toFixed(2)}%, geser ${((nilai.akurasi - dasarSampel) * 100).toFixed(2)}pp)` : ''}`)
    const driftOk = dasarSampel == null || Math.abs(nilai.akurasi - dasarSampel) <= 0.015
    if (!driftOk) { console.error('GUGUR: nalar jantung menggeser > 1.5pp dari vonis dasar — kemampuan berubah tanpa catatan'); process.exit(1) }
    if (nilai.akurasi < 0.2) { console.error('GUGUR: akurasi sampel di bawah 20% — nalar rusak'); process.exit(1) }
    console.log('LULUS: nalar sampel konsisten dengan vonis dasar.')
    return
  }
  console.log(`=== JAWAB ${mode.toUpperCase()} SELESAI ${Math.round((Date.now() - t0) / 1000)}s → ${namaOut} ===`)
}

function hashFullBuf(buf) { return createHash('sha256').update(buf).digest('hex') }
main().catch(e => { console.error('JAWAB GUGUR:', e.message); process.exit(1) })
