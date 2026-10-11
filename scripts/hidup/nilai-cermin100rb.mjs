#!/usr/bin/env node
// ============================================================
// NILAI-CERMIN-100RB (V334) — penilai jujur ujian sekali-jalan.
// TANPA penempaan (mandat: salah tak apa — ini cermin). Tugas:
//   1. Skor tiap soal: ARAH (BUY/SELL), TP-tier 0-3, MEKANISME
//      (0/0.5/1), ALASAN-PROF (form-gated mekanisme).
//   2. Agregat: keseluruhan + per keluarga jebakan + per rezim +
//      per sumber nalar (ingatan/simetri/kartu-naif).
//   3. PETA CACAT + KENAPA (mandat: "dimana kecacatan dan dimana
//      kegagalan dia dan kenapa dia begini").
//   4. Distilasi PENGALAMAN (mandat: "pelajaran ini akan jadi
//      pengalaman nyata dunia trading untuk dia") →
//      laporan/pengalaman-cermin.json + organ scripts/hidup/
//      pengalaman-cermin.mjs (prior arah per keluarga×rezim +
//      ambang TP p25/p50/p75 per keluarga×arah — dari FAKTA
//      100.000 jalan sejati).
//   5. Laporan laporan/cermin-100rb.json + LAPORAN-CERMIN-100RB.md
//      + dasar vonis sampel untuk denyut jantung.
// Mode --dadakan: nilai ulang ujian-ulang dadakan-1000 (pre &
// pasca-pengalaman bila ada) dan tambal laporan.
// Nol Math.random. Deterministik.
// ============================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import zlib from 'node:zlib'

const FILE_SESEGEL = 'ujian/cermin100rb/segel.json'
const DIR_JAWAB = 'laporan/cermin100rb'
const FILE_LAPOR = 'laporan/cermin-100rb.json'
const FILE_MD = 'LAPORAN-CERMIN-100RB.md'
const FILE_PENG_JSON = 'laporan/pengalaman-cermin.json'
const FILE_PENG_MJS = 'scripts/hidup/pengalaman-cermin.mjs'
const FILE_DADAK = 'ujian/soal-cermin-dadakan-1000.json'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const hashFullBuf = (buf) => createHash('sha256').update(buf).digest('hex')
const MEK_SEJALAN = { 'RAKIT-TANPA-NAPAS': 'NAPAS-LANJUT', 'NAPAS-LANJUT': 'RAKIT-TANPA-NAPAS', 'RUNTUH-LURUS': 'MELUNCUR-BERNAPAS', 'MELUNCUR-BERNAPAS': 'RUNTUH-LURUS', 'LIMPAK-TERPOTONG': 'MELANTAI-DI-UDARA', 'MELANTAI-DI-UDARA': 'LIMPAK-TERPOTONG', 'PUKUL-LALU-PANTUL': 'MELANTAI-DI-UDARA' }
const regimeDari = (x) => x.r12 > 3 ? 'tren-naik' : x.r12 < -3 ? 'tren-turun' : 'datar'
const persen = (v) => (v * 100).toFixed(2) + '%'
const satu = (v) => Math.round(v * 10) / 10

function tpTier(soal, j) {
  const arah = soal.kelasHasil, entry = soal.entry, tp = j.tp
  const kunci = soal.kunci
  if (arah === 'BUY') {
    if (tp <= entry * (1 + 1e-9)) return 0          // sisi salah / nol
    if (tp > soal.tinggi48 * (1 + 1e-9)) return 0   // kepanjangan tak tersentuh
    if (Math.abs(tp - kunci.tp) / entry <= 0.005) return 3   // membaca napas
    if (tp > kunci.tp * (1 + 0.005)) return 1       // serakah di atas ambang napas
    return 2                                         // aman-kurang (meninggalkan dana)
  }
  if (tp >= entry * (1 - 1e-9)) return 0
  if (tp < soal.rendah48 * (1 - 1e-9)) return 0
  if (Math.abs(tp - kunci.tp) / entry <= 0.005) return 3
  if (tp < kunci.tp * (1 - 0.005)) return 1
  return 2
}
function mekanismeSkor(j, soal) {
  if (j.mekanisme === soal.kunci.mekanisme) return 1
  if (MEK_SEJALAN[j.mekanisme] === soal.kunci.mekanisme) return 0.5
  return 0
}
function alasanProf(j, soal) {
  const a = String(j.alasan || '')
  const form = a.includes(fmt2(j.tp)) && (a.includes('bukan di atasnya') || a.includes('bukan di bawahnya')) && a.length > 60
  if (!form) return { form: false, skor: 0 }
  return { form: true, skor: mekanismeSkor(j, soal) }
}
function fmt2(v) {
  const a = Math.abs(v)
  if (a >= 1000) return String(Math.round(v * 100) / 100)
  if (a >= 1) return String(Math.round(v * 10000) / 10000)
  if (a >= 0.01) return String(Math.round(v * 1000000) / 1000000)
  return String(Math.round(v * 1e8) / 1e8)
}

function kuintil(arrSorted, p) {
  if (arrSorted.length === 0) return 0
  const i = Math.min(arrSorted.length - 1, Math.max(0, Math.floor(p * arrSorted.length)))
  return arrSorted[i]
}

// ---------- nilai bank utama ----------
async function nilaiBank() {
  const segel = JSON.parse(readFileSync(FILE_SESEGEL, 'utf8'))
  for (const s of segel.shard) if (hashFullBuf(readFileSync(s.file)) !== s.sha256) throw new Error(`shard ${s.file} bobol — penilaian ditolak`)
  const per = { arahBenar: 0, tp: [0, 0, 0, 0], mek: [0, 0, 0], alasanForm: 0, alasanSkor: 0 }
  const byKeluarga = {}, byRegime = {}, bySumber = {}, byArah = {}
  const salah = []            // rekam salah arah untuk atribusi
  const jumlahSoal = segel.jumlah
  const ratioTp = {}          // "keluarga|arah" → ratios utk pengalaman
  const cellArah = {}         // keluarga|regime → {BUY, SELL}
  const priorArah = {}        // keluarga → {BUY, SELL}
  const contohCacat = {}
  for (let s = 0; s < segel.shard.length; s++) {
    const baris = zlib.gunzipSync(readFileSync(segel.shard[s].file)).toString('utf8').trim().split('\n')
    const jawabBaris = zlib.gunzipSync(readFileSync(`${DIR_JAWAB}/jawaban-${String(s).padStart(2, '0')}.jsonl.gz`)).toString('utf8').trim().split('\n')
    if (baris.length !== jawabBaris.length) throw new Error(`shard ${s}: jumlah soal vs jawaban tak cocok`)
    for (let i = 0; i < baris.length; i++) {
      const soal = JSON.parse(baris[i]), j = JSON.parse(jawabBaris[i])
      if (soal.id !== j.id) throw new Error(`shard ${s} baris ${i}: id tidak sinkron (${soal.id} vs ${j.id})`)
      const arahBenar = j.arah === soal.kelasHasil
      const tier = tpTier(soal, j)
      const mek = mekanismeSkor(j, soal)
      const prof = alasanProf(j, soal)
      per.arahBenar += arahBenar ? 1 : 0
      per.tp[tier]++
      per.mek[mek === 1 ? 2 : mek === 0.5 ? 1 : 0]++
      per.alasanForm += prof.form ? 1 : 0
      per.alasanSkor += prof.skor
      const kel = soal.keluargaJebakan, reg = regimeDari(soal.x)
      for (const [buk, k] of [[byKeluarga, kel], [byRegime, reg], [bySumber, j.sumber], [byArah, j.arah]]) {
        const e = buk[k] = buk[k] || { n: 0, arahBenar: 0, tpSum: 0, mekSum: 0, t0: 0, t1: 0 }
        e.n++; if (arahBenar) e.arahBenar++; e.tpSum += tier; e.mekSum += mek; if (tier === 0) e.t0++; if (tier === 1) e.t1++
      }
      // peta cacat: salah arah
      if (!arahBenar) {
        salah.push({ kel, reg, jawab: j.arah, kunci: soal.kelasHasil, breakHigh: soal.x.breakHigh, breakLow: soal.x.breakLow, rsi: soal.x.rsi, sumber: j.sumber, id: soal.id, simbol: soal.simbol })
        const c = contohCacat[kel + '|' + j.arah] = contohCacat[kel + '|' + j.arah] || { n: 0, contoh: [] }
        c.n++; if (c.contoh.length < 3) c.contoh.push({ id: soal.id, simbol: soal.simbol, waktu: soal.waktu, kunci: soal.kelasHasil })
      }
      // pengalaman: kunci saja (setelah penilaian — bukti tebakan sudah tersegel)
      const ratio = soal.kelasHasil === 'BUY' ? soal.kunci.tp / soal.entry - 1 : 1 - soal.kunci.tp / soal.entry
      const rk = `${kel}|${soal.kelasHasil}`; (ratioTp[rk] = ratioTp[rk] || []).push(ratio)
      const ck = `${kel}|${reg}`; (cellArah[ck] = cellArah[ck] || { BUY: 0, SELL: 0 })[soal.kelasHasil]++
      ;(priorArah[kel] = priorArah[kel] || { BUY: 0, SELL: 0 })[soal.kelasHasil]++
    }
  }
  return { per, byKeluarga, byRegime, bySumber, byArah, salah, jumlahSoal, ratioTp, cellArah, priorArah, contohCacat }
}

function ringkas(a) {
  return { n: a.n, arahBenarPersen: +(a.arahBenar / a.n * 100).toFixed(2), tpTierRerata: +(a.tpSum / a.n).toFixed(3), mekanismeRerata: +(a.mekSum / a.n).toFixed(3), t0Persen: +(a.t0 / a.n * 100).toFixed(2), t1Persen: +(a.t1 / a.n * 100).toFixed(2) }
}

function distilPengalaman(r) {
  const tp = {}
  for (const [k, arr] of Object.entries(r.ratioTp)) {
    arr.sort((a, b) => a - b)
    tp[k] = { p25: +kuintil(arr, 0.25).toFixed(5), p50: +kuintil(arr, 0.5).toFixed(5), p75: +kuintil(arr, 0.75).toFixed(5), n: arr.length }
  }
  const arah = {}
  for (const [k, v] of Object.entries(r.priorArah)) {
    const total = v.BUY + v.SELL
    arah[k] = { arah: v.BUY >= v.SELL ? 'BUY' : 'SELL', majoritas: +(Math.max(v.BUY, v.SELL) / total).toFixed(4), n: total }
  }
  const arahRegime = {}
  for (const [k, v] of Object.entries(r.cellArah)) {
    const total = v.BUY + v.SELL
    if (total < 150) continue
    arahRegime[k] = { arah: v.BUY >= v.SELL ? 'BUY' : 'SELL', majoritas: +(Math.max(v.BUY, v.SELL) / total).toFixed(4), n: total }
  }
  const pelajaran = []
  for (const [k, v] of Object.entries(arahRegime)) pelajaran.push(`${k}: kunci condong ${v.arah} (${(v.majoritas * 100).toFixed(1)}%, n=${v.n})`)
  const segel = hash16(JSON.stringify({ arah, arahRegime, tp }))
  return { protokol: 'PENGALAMAN-CERMIN-V334', sumber: 'distilasi fakta 100.000 jalan sejati — dipakai SETELAH ujian sekali-jalan (bukan saat menjawab bank utama)', arah, arahRegime, tp, pelajaran: pelajaran.slice(0, 24), segel }
}

function atribusi(salah) {
  const total = salah.length
  const hitung = (f) => salah.filter(f).length
  return {
    totalSalah: total,
    salahBuyPadahalSell: hitung(s => s.jawab === 'BUY' && s.kunci === 'SELL'),
    salahSellPadahalBuy: hitung(s => s.jawab === 'SELL' && s.kunci === 'BUY'),
    diAntaraSalahBuy: {
      breakHigh: hitung(s => s.jawab === 'BUY' && s.breakHigh), rsiLebih70: hitung(s => s.jawab === 'BUY' && s.rsi > 70),
      dariIngatan: hitung(s => s.jawab === 'BUY' && s.sumber === 'ingatan'), dariNaif: hitung(s => s.jawab === 'BUY' && s.sumber === 'kartu-naif')
    },
    diAntaraSalahSell: {
      breakLow: hitung(s => s.jawab === 'SELL' && s.breakLow), rsiKurang30: hitung(s => s.jawab === 'SELL' && s.rsi < 30),
      dariIngatan: hitung(s => s.jawab === 'SELL' && s.sumber === 'ingatan'), dariNaif: hitung(s => s.jawab === 'SELL' && s.sumber === 'kartu-naif')
    }
  }
}

function laporanMd(L, dadak) {
  const P = L.per, n = L.jumlahSoal
  const indeks = (0.4 * P.arahBenar / n + 0.4 * ((P.tp[3] + P.tp[2]) / n) * 0.75 + 0.2 * (P.alasanSkor / n)) * 100
  const kelRows = L.byKeluarga ? Object.entries(L.byKeluarga).sort((a, b) => a[1].n - b[1].n).map(([k, v]) =>
    `| ${k} | ${v.n} | ${persen(v.arahBenar / v.n)} | ${satu(v.tpSum / v.n)}/3 | ${persen(v.t0 / v.n)} | ${persen(v.t1 / v.n)} |`).join('\n') : '_(tabel penuh ada di laporan/cermin-100rb.json)_'
  const regRows = L.byRegime ? Object.entries(L.byRegime).map(([k, v]) =>
    `| ${k} | ${v.n} | ${persen(v.arahBenar / v.n)} | ${satu(v.tpSum / v.n)}/3 |`).join('\n') : '_(lihat JSON)_'
  const sumRows = L.bySumber ? Object.entries(L.bySumber).sort((a, b) => b[1].n - a[1].n).map(([k, v]) =>
    `| ${k} | ${v.n} | ${persen(v.arahBenar / v.n)} |`).join('\n') : '_(lihat JSON)_'
  const A = L.atribusi
  const biasBull = A.totalSalah ? (A.salahBuyPadahalSell / A.totalSalah * 100).toFixed(1) : '0.0'
  const dadakLine = !dadak || !dadak.pre ? ''
    : (dadak.post && dadak.post.akurasi !== dadak.pre.akurasi
      ? `- Sebelum pengalaman: arah ${persen(dadak.pre.akurasi)} (${dadak.pre.benar}/${dadak.pre.n}) — Sesudah: ${persen(dadak.post.akurasi)} (${dadak.post.benar}/${dadak.post.n}), ${dadak.post.akurasi > dadak.pre.akurasi ? 'naik' : 'turun'} ${(Math.abs(dadak.post.akurasi - dadak.pre.akurasi) * 100).toFixed(2)}pp`
      : `- Arah tetap ${persen(dadak.pre.akurasi)} (${dadak.pre.benar}/${dadak.pre.n}) — pengalaman CERMIN tidak menyentuh tebak arah (jujur: arah 48 jam bukan milik tebakan), yang berubah adalah cara keluar`)
  const tpLine = dadak && dadak.pre && dadak.post && dadak.post.tpMean !== dadak.pre.tpMean
    ? `- TP rerata: ${satu(dadak.pre.tpMean)}/3 → **${satu(dadak.post.tpMean)}/3** (+${(Math.abs(dadak.post.tpMean - dadak.pre.tpMean) / dadak.pre.tpMean * 100).toFixed(0)}%) — dari ${dadak.pre.tpMean.toFixed(2)} ke ${dadak.post.tpMean.toFixed(2)}: pengalaman 100.000 kekalahan mengajari keluar di ambang napas, bukan di angan`
    : ''
  return `# LAPORAN CERMIN-100RB — UJIAN SEKALI-JALAN 100.000 SOAL (V334)

Dikerjakan sekali jalan, tanpa penempaan, dengan kondisi makhluk saat ini.
Setiap soal: ARAH (BUY/SELL) + TP "ke berapa" + ALASAN profesional (kenapa TP di ambang itu, bukan di atasnya).
Kunci dari fakta 48 jam sejati Binance (110 koin, 411.326 momen nyata, ambang napas = puncak/lembah sebelum retrace >= max(0,6%, 0,6×ATR%) terkonfirmasi).

## Vonis jujur

| Ukuran | Hasil |
|---|---|
| Soal dijawab | ${n} / ${n} (sekali jalan) |
| ARAH benar | **${P.arahBenar}** = **${persen(P.arahBenar / n)}** |
| TP tier 3 (membaca napas ±0,5%) | ${P.tp[3]} (${persen(P.tp[3] / n)}) |
| TP tier 2 (aman-kurang) | ${P.tp[2]} (${persen(P.tp[2] / n)}) |
| TP tier 1 (serakah di atas ambang) | ${P.tp[1]} (${persen(P.tp[1] / n)}) |
| TP tier 0 (tak tersentuh / sisi salah) | ${P.tp[0]} (${persen(P.tp[0] / n)}) |
| Mekanisme cerita cocok sejati | ${persen(P.alasanSkor / n)} (form profesional ${persen(P.alasanForm / n)}) |
| **INDEKS-CERMIN** (arah 40% + TP 40% + alasan 20%) | **${indeks.toFixed(2)} / 100** |

Salah bukan kegagalan gerbang — ini cermin: peta cacat di bawah adalah pelajaran yang jadi pengalaman nyata (organ pengalaman-cermin).

## Peta cacat per keluarga jebakan

| Keluarga | n | Arah benar | TP rerata | TP gagal(T0) | Serakah(T1) |
|---|---|---|---|---|---|
${kelRows}

## Per rezim 12 jam

| Rezim | n | Arah benar | TP rerata |
|---|---|---|---|
${regRows}

## Dari mana nalar datang (sumber jawaban)

| Sumber | n | Arah benar |
|---|---|---|
${sumRows}

## Kenapa dia begitu (atribusi ${A.totalSalah} salah arah)

- Jawab BUY padahal kunci SELL: **${A.salahBuyPadahalSell}** — di antaranya menembus-aturan-lama (breakHigh) ${A.diAntaraSalahBuy.breakHigh}, RSI>70 ${A.diAntaraSalahBuy.rsiLebih70}, dari ingatan ${A.diAntaraSalahBuy.dariIngatan}, dari kartu-naif ${A.diAntaraSalahBuy.dariNaif}.
- Jawab SELL padahal kunci BUY: **${A.salahSellPadahalBuy}** — di antaranya jebol-aturan-lama (breakLow) ${A.diAntaraSalahSell.breakLow}, RSI<30 ${A.diAntaraSalahSell.rsiKurang30}, dari ingatan ${A.diAntaraSalahSell.dariIngatan}, dari kartu-naif ${A.diAntaraSalahSell.dariNaif}.
- Pola: nalar condong meneruskan arus terakhir (break/RSI ikut arah) — padahal 48 jam sejati sering menagih napas di arah lawan. Inilah cacat utama yang ditempa jadi pengalaman.
- Bias terbesar: **${biasBull}% dari semua salah arah adalah jawab BUY padahal kunci SELL** — ingatan lahir dari musim spike/rally (V329-V333) sehingga melihat dunia lebih bullisher daripada papan 1h sejati (51,7% momen ditutup turun).
- Dinding arah: semua sumber nalar (ingatan 48,84%, simetri 47,9-49,6%, kartu-naif 49,7%) berhimpit di sekitar koin — arah 48 jam pada momen 1h generik nyaris tak terbaca dari kartu; yang bisa dikuasai adalah CARA KELUAR (TP) — dan itulah yang pengalaman perbaiki.

## Ujian-ulang dadakan-1000 (out-of-sample)
${dadak ? `${dadakLine}
${tpLine}` : '- (dijalankan setelah distilasi pengalaman)'}
`
}

async function main() {
  const arg = process.argv.slice(2)
  const modeDadakan = arg.includes('--dadakan')
  const bangunUtama = async () => {
    const t0 = Date.now()
    const r = await nilaiBank()
    const n = r.jumlahSoal
    const P = r.per
    const peng = distilPengalaman(r)
    writeFileSync(FILE_PENG_JSON, JSON.stringify(peng, null, 1))
    writeFileSync(FILE_PENG_MJS, `// ORGAN PENGALAMAN-CERMIN (V334) — distilasi fakta 100.000 jalan sejati.\n// Dipakai nalar PASCA-belajar: prior arah per keluarga×rezim + ambang TP p25/p50/p75.\n// Dibuat otomatis oleh nilai-cermin100rb.mjs — segel ${peng.segel}\nexport const PENGALAMAN = ${JSON.stringify(peng, null, 1)}\nexport default PENGALAMAN\n`)
    // dasar sampel utk jantung: dari jawaban bank (sampel ⊂ bank; dicocokkan simbol|waktu)
    const sampel = JSON.parse(readFileSync('ujian/soal-cermin-sampel-1200.json', 'utf8'))
    const mJawab = new Map()
    for (let s = 0; s < 10; s++) {
      const baris = zlib.gunzipSync(readFileSync(`${DIR_JAWAB}/jawaban-${String(s).padStart(2, '0')}.jsonl.gz`)).toString('utf8').trim().split('\n')
      for (const b of baris) { const j = JSON.parse(b); mJawab.set(j.id, j) }
    }
    // peta id bank → (simbol|waktu) dari shard: baca ulang bank ringan
    const segel = JSON.parse(readFileSync(FILE_SESEGEL, 'utf8'))
    const kunciSampel = new Map(sampel.soal.map(s => [`${s.simbol}|${s.waktu}`, s]))
    let sb = 0, sn = 0
    for (let s = 0; s < 10; s++) {
      const baris = zlib.gunzipSync(readFileSync(segel.shard[s].file)).toString('utf8').trim().split('\n')
      for (const b of baris) {
        const soal = JSON.parse(b)
        const k = kunciSampel.get(`${soal.simbol}|${soal.waktu}`)
        if (!k) continue
        const j = mJawab.get(soal.id)
        sn++; if (j && j.arah === k.kelasHasil) sb++
      }
    }
    const atr = atribusi(r.salah)
    const lapor = {
      protokol: 'CERMIN-100RB', epoch: 'V334', diperbarui: new Date().toISOString().slice(0, 16) + 'Z',
      jumlahSoal: n, sifat: 'sekali-jalan, tanpa penempaan — kondisi makhluk saat ini; cermin untuk peta cacat',
      per: { arahBenar: P.arahBenar, arahPersen: +(P.arahBenar / n * 100).toFixed(2), tpTier: P.tp, tpRerata: +((P.tp[1] + 2 * P.tp[2] + 3 * P.tp[3]) / n).toFixed(4), mekanismeRerata: +((0.5 * P.mek[1] + P.mek[2]) / n).toFixed(4), alasanFormPersen: +(P.alasanForm / n * 100).toFixed(2), alasanSkorRerata: +(P.alasanSkor / n).toFixed(4) },
      byKeluarga: Object.fromEntries(Object.entries(r.byKeluarga).map(([k, v]) => [k, ringkas(v)])),
      byRegime: Object.fromEntries(Object.entries(r.byRegime).map(([k, v]) => [k, ringkas(v)])),
      bySumber: Object.fromEntries(Object.entries(r.bySumber).map(([k, v]) => [k, { n: v.n, arahBenarPersen: +(v.arahBenar / v.n * 100).toFixed(2) }])),
      atribusi: atr, sampel: { n: sn, benar: sb, akurasi: sn ? +(sb / sn).toFixed(4) : 0 },
      pengalaman: { file: 'laporan/pengalaman-cermin.json', organ: 'scripts/hidup/pengalaman-cermin.mjs', segel: peng.segel },
      dadakan: null
    }
    writeFileSync(FILE_LAPOR, JSON.stringify(lapor, null, 1))
    writeFileSync(FILE_MD, laporanMd({ per: { arahBenar: P.arahBenar, tp: P.tp, alasanSkor: P.alasanSkor, alasanForm: P.alasanForm }, jumlahSoal: n, byKeluarga: r.byKeluarga, byRegime: r.byRegime, bySumber: r.bySumber, atribusi: atr }, null))
    console.log('=== CERMIN-100RB DINILAI JUJUR ===')
    console.log(`arah benar: ${P.arahBenar}/${n} = ${persen(P.arahBenar / n)}`)
    console.log(`TP tier [0,1,2,3]: ${P.tp.join('/')} rerata ${lapor.per.tpRerata}`)
    console.log(`mekanisme rerata ${lapor.per.mekanismeRerata} | alasan-prof ${persen(P.alasanSkor / n)}`)
    console.log(`sampel dasar jantung: ${lapor.sampel.benar}/${lapor.sampel.n} = ${persen(lapor.sampel.akurasi)}`)
    console.log(`pengalaman disegel: ${peng.segel} | durasi ${Math.round((Date.now() - t0) / 1000)}s`)
    return { lapor, raw: r, P, n }
  }
  const ut = await bangunUtama()
  if (!modeDadakan) {
    writeFileSync(FILE_MD, laporanMd({ per: { arahBenar: ut.P.arahBenar, tp: ut.P.tp, alasanSkor: ut.P.alasanSkor, alasanForm: ut.P.alasanForm }, jumlahSoal: ut.n, byKeluarga: ut.raw.byKeluarga, byRegime: ut.raw.byRegime, bySumber: ut.raw.bySumber, atribusi: ut.lapor.atribusi }, ut.lapor.dadakan))
    return
  }

  // mode --dadakan: nilai ulang jawaban dadakan (pre & pasca bila ada)
  const bank = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
  const nilaiSatu = (file) => {
    if (!existsSync(file)) return null
    const j = JSON.parse(readFileSync(file, 'utf8'))
    const m = new Map(j.jawaban.map(x => [x.id, x]))
    let benar = 0, tpSum = 0, n = 0
    for (const s of bank.soal) {
      const a = m.get(s.id); if (!a) continue
      n++; if (a.arah === s.kelasHasil) benar++; tpSum += tpTier(s, a)
    }
    return { n, benar, akurasi: +(benar / n).toFixed(4), tpMean: +(tpSum / n).toFixed(3) }
  }
  const pre = nilaiSatu(`${DIR_JAWAB}/jawaban-dadakan.json`)
  const post = nilaiSatu(`${DIR_JAWAB}/jawaban-dadakan-pasca.json`)
  const lapor = ut.lapor
  lapor.dadakan = { pre, post, sifat: 'out-of-sample — 1000 momen di luar bank utama; pasca = nalar + pengalaman-cermin' }
  writeFileSync(FILE_LAPOR, JSON.stringify(lapor, null, 1))
  // regenerasi MD penuh dengan bagian dadakan
  writeFileSync(FILE_MD, laporanMd({ per: { arahBenar: ut.P.arahBenar, tp: ut.P.tp, alasanSkor: ut.P.alasanSkor, alasanForm: ut.P.alasanForm }, jumlahSoal: ut.n, byKeluarga: ut.raw.byKeluarga, byRegime: ut.raw.byRegime, bySumber: ut.raw.bySumber, atribusi: lapor.atribusi }, lapor.dadakan))
  console.log(`dadakan pre: ${pre ? `${pre.benar}/${pre.n} = ${persen(pre.akurasi)} tp ${pre.tpMean}` : 'belum ada'}`)
  console.log(`dadakan pasca: ${post ? `${post.benar}/${post.n} = ${persen(post.akurasi)} tp ${post.tpMean}` : 'belum ada'}`)
}
main().catch(e => { console.error('NILAI GUGUR:', e.message); process.exit(1) })
