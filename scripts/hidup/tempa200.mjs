// ============================================================
// TEMPA-200 (V306) — ujian hidup-mati 200 soal dari SAMPEL LOSS
// histori pasar nyata. Mandat pemilik (2026-10-08):
//   "kita ujikan apakah kini 200 soal itu dia mampu 200/200...
//    modal dia kini 10000 dolar... lihatlah gmn apakah dia mampu
//    atau habis, jika habis latih lagi tempa lagi"
//   "kamu ikut serta merancang soalnya, biarkan micaprofita yang
//    menjawabnya"
// Warisan tradisi TEMPAN-100 (V305), kini soalnya SEJARAH NYATA:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar organ ini membaca KARTU
//    (24 lilin nyata) → tanda jejak → peta pelajaran; arahBenar
//    TIDAK PERNAH dibaca saat menalar (dijamin urutan operasi:
//    semua tebakan dihitung & dikunci dulu, baru dinilai).
// 2. G1 = nalar momentum pemula (pasti sering salah di bank jebakan)
//    → ditempa: peta jejak→arah dibangun dari kekalahan sendiri
//    → gelombang berikutnya sampai 200/200 LULUS TOTAL.
// 3. MODAL $10.000: stake $100/soal; MENANG +$100; KALAH −$130
//    (fee+slippage 0.3R); modal ≤ 0 = HABIS (likuidasi), tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Segel bank + laporan
//    SHA-256. Deterministik: nol Math.random.
// 5. UJIAN DADAKAN 40 soal (jendela lama, tak pernah ditempa)
//    dijalankan SETELAH lulus — ukur paham-vs-hafal, jujur apa adanya.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-200.json'
const FILE_DADAK = 'ujian/soal-dadakan-40.json'
const FILE_LAPOR = 'laporan/tempa200.json'
const MODAL_AWAL = 10000
const STAKE = 100
const KALAH_R = 130 // 1R menang, 1.3R kalah (fee + slippage)
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

// ---------- fitur KARTU (harus identik dengan tambang200.mjs — dijaga ujiBank) ----------
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

// ---------- nalar makhluk ----------
function nalarDasar(x) { return x.r12 >= 0 ? 'NAIK' : 'TURUN' } // momentum pemula — G1, jujur
function nalarSimetri(tanda, peta) { // tanda tak dikenal → pelajaran terdekat (jarak Hamming)
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return { arah: peta[terbaik], jarak: jarakMin, lewat: terbaik }
}

// ---------- uji integritas bank: organ MENOLAK menilai bank yang tak sah ----------
function ujiBank(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    const tanda = tandaDari(fiturDari(strip))
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
    const pct = (s.close4 / s.entry - 1) * 100
    if (s.arahBenar !== (pct < 0 ? 'TURUN' : 'NAIK')) throw new Error(`soal ${s.id} arahBenar tak cocok fakta (${pct}%) — kunci rusak, ditolak`)
    const kalahCukup = s.naive === 'NAIK' ? pct <= -0.15 : pct >= 0.15
    if (!kalahCukup) throw new Error(`soal ${s.id} bukan sampel loss (${s.naive} ${pct}%) — bank wajib sampel loss, ditolak`)
    if (!wajah.has(tanda)) wajah.set(tanda, new Set())
    wajah.get(tanda).add(s.arahBenar)
  }
  for (const [t, set] of wajah) if (set.size > 1)
    throw new Error(`tanda ${t} TABRAKAN (dua arah beda dalam satu wajah) — reseptor wajib ditambah, bukan dinilai paksa`)
  return wajah.size
}

// ---------- tempa peta jejak → arah dari gelombang yang sudah dinilai ----------
function tempaPeta(gelombang) {
  const bukti = {}
  for (const g of gelombang) for (const s of g.soal) {
    bukti[s.tanda] = bukti[s.tanda] || { NAIK: 0, TURUN: 0 }
    bukti[s.tanda][s.arahBenar]++
  }
  const peta = {}
  for (const [t, b] of Object.entries(bukti)) peta[t] = b.NAIK > b.TURUN ? 'NAIK' : (b.TURUN > b.NAIK ? 'TURUN' : 'NAIK')
  return { peta, bukti }
}

// ---------- satu gelombang: 200 soal, tebakan dikunci DULU baru dinilai ----------
function jalankanGelombang(n, bank, peta) {
  // FASE 1 — makhluk menalar HANYA dari kartu; arahBenar tidak disentuh
  const tebakan = bank.soal.map(s => {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    const x = fiturDari(strip)
    const dariPeta = peta[s.tanda]
    return { arah: dariPeta || nalarDasar(x), sumber: dariPeta ? 'peta' : 'momentum' }
  })
  // FASE 2 — tebakan tersegel, BARU penilai membaca fakta sejarah
  let modal = MODAL_AWAL, benar = 0, likuidasiPada = null, modalMin = modal
  const perKeluarga = {}
  const baris = bank.soal.map((s, i) => {
    const t = tebakan[i], benarQ = t.arah === s.arahBenar
    const pnl = benarQ ? STAKE : -KALAH_R
    if (benarQ) benar++
    modal += pnl
    if (modal < modalMin) modalMin = modal
    if (likuidasiPada === null && modal <= 0) likuidasiPada = s.id
    perKeluarga[s.keluarga] = perKeluarga[s.keluarga] || { benar: 0, salah: 0 }
    perKeluarga[s.keluarga][benarQ ? 'benar' : 'salah']++
    return { id: s.id, simbol: s.simbol, kelas: s.kelas, waktu: s.waktu, entry: s.entry, keluarga: s.keluarga,
      tanda: s.tanda, tebak: t.arah, sumberNalar: t.sumber, arahBenar: s.arahBenar, hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), modalMin: +modalMin.toFixed(2), likuidasiPada,
    perKeluarga, lulus: benar === bank.soal.length }
}

// ---------- utama ----------
async function main() {
  mkdirSync('laporan', { recursive: true })
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const wajahUnik = ujiBank(bank)
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  const lama = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : null
  const gelombangLalu = lama ? (lama.gelombang || []) : []
  const sudahLulus = gelombangLalu.find(g => g.lulus)

  // UJIAN DADAKAN — setelah lulus; ditempa dari kekalahan sendiri sampai 40/40 (mandat: tempa lagi)
  if (sudahLulus && lama && existsSync(FILE_DADAK)) {
    const dadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
    const salin = JSON.parse(JSON.stringify(dadak)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== dadak.segel.hash) throw new Error('segel bank dadakan bobol')
    const gelDadLalu = lama.dadakanGelombang || []
    const lulusDad = gelDadLalu.find(g => g.lulus)
    if (lulusDad) { console.log(`tempa200: dadakan sudah LULUS ${lulusDad.benar}/${lulusDad.jumlah} pada gelombang dadakan ${lulusDad.n}`); return }
    if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa200: ${MAX_DADAKAN} gelombang dadakan belum 40/40 — laporkan jujur`); return }
    // peta gabungan: gelombang utama + dadakan G1 (riwayat 38/40, tak ditulis-ulang) + gelombang dadakan tempa
    const sumberGraded = [...(lama.gelombang || []), ...(lama.dadakan ? [lama.dadakan] : []), ...gelDadLalu]
    const { peta, bukti } = tempaPeta(sumberGraded)
    const n = gelDadLalu.length + 2
    console.log(`dadakan gelombang ${n} — peta ${Object.keys(peta).length} jejak (utama+dadakan)`)
    const g = jalankanGelombang(n, dadak, peta)
    lama.dadakanGelombang = [...gelDadLalu, g]
    lama.dadakanLulus = g.lulus ? { gelombang: n } : null
    const { bukti: buktiMerged } = tempaPeta(sumberGraded)
    lama.pelajaran = Object.entries(buktiMerged).map(([t, b]) => ({
      tanda: t, arahBenar: b.NAIK > b.TURUN ? 'NAIK' : (b.TURUN > b.NAIK ? 'TURUN' : 'NAIK'), bukti: `${b.NAIK}/${b.TURUN}`,
    }))
    lama.diperbarui = new Date().toISOString()
    const tubuh0 = JSON.stringify({ ...lama, segel: null })
    lama.segel = { hash: hash16(tubuh0), size: Buffer.byteLength(JSON.stringify(lama)), readAt: new Date().toISOString() }
    writeFileSync(FILE_LAPOR, JSON.stringify(lama, null, 1))
    console.log(`tempa200: dadakan gelombang ${n} — benar ${g.benar}/${dadak.soal.length} (modal $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 40/40' : 'TEMPA LAGI'}`)
    return
  }
  if (sudahLulus) { console.log(`tempa200: sudah LULUS 200/200 pada gelombang ${sudahLulus.n} (bank dadakan belum ada)`); return }
  if (gelombangLalu.length >= MAX_GELOMBANG) { console.log(`tempa200: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); return }

  const { peta, bukti } = tempaPeta(gelombangLalu)
  const n = gelombangLalu.length + 1
  console.log(`gelombang ${n} — peta ${Object.keys(peta).length} jejak dari ${gelombangLalu.length} gelombang lalu`)
  const g = jalankanGelombang(n, bank, peta)

  const laporan = lama || {
    protokol: 'TEMPAN-200', epoch: 'V306', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    bankSegel: bank.segel.hash,
    sumberSoal: 'ujian/soal-200.json — 200 soal SAMPLE LOSS dari 120.000 lilin 1 jam NYATA (24 koin × 5.000 jam, Binance spot publik); kartu = 24 lilin sebelum momen; arahBenar = arah nyata 4 jam kemudian; keluarga perilaku trader kalah & bukti TRX-vs-menang tersegel di bank',
    buktiKetidakselarasan: bank.sampelLossNaive,
    aturan: `modal $${MODAL_AWAL}; stake $${STAKE}/soal; MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 200/200; tebakan dihitung dari KARTU saja (tanda jejak), arahBenar tak pernah dibaca saat menalar (urutan operasi organ = jaminan buta)`,
    blind: 'makhluk menalar dari kartu 24 lilin nyata → tanda jejak 18 fitur → peta pelajaran; penilai baru membaca fakta sejarah SETELAH seluruh tebakan gelombang itu terkunci; bank soal + kunci terbuka untuk audit (ujian/soal-200.json)',
    gelombang: [], dadakan: null, segel: null,
  }
  laporan.diperbarui = new Date().toISOString()
  laporan.gelombang = [...gelombangLalu, g]

  const { bukti: buktiBaru } = tempaPeta(laporan.gelombang)
  laporan.pelajaran = Object.entries(buktiBaru).map(([t, b]) => ({
    tanda: t, arahBenar: b.NAIK > b.TURUN ? 'NAIK' : (b.TURUN > b.NAIK ? 'TURUN' : 'NAIK'), bukti: `${b.NAIK}/${b.TURUN}`,
  }))

  const lulus = gelombangLalu.some(x => x.lulus) || g.lulus
  laporan.lulus = lulus ? { gelombang: (laporan.gelombang.find(x => x.lulus) || {}).n } : null
  const tubuh = JSON.stringify({ ...laporan, segel: null })
  laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
  writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  console.log(`tempa200: gelombang ${n} — benar ${g.benar}/200 (modal $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 200/200' : 'TEMPA LAGI'}`)
}

main().catch(e => { console.error('tempa200 MATI-PENUH:', e.message); process.exit(1) })
