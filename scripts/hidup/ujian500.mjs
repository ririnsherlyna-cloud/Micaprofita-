// ============================================================
// UJIAN-500 (V307) — 500 soal baru dari sejarah dalam, uji
// apakah pahaman makhluk SUDAH MENINGKAT setelah tempaan V306.
// Mandat pemilik (2026-10-08): "500 soal ujian baru untuk uji
// apakah sudah peningkat pahamannya."
//
// Otak yang dipakai = OTAK WARISAN: peta jejak dari tempaan
// TEMPAN-200 (gelombang utama + dadakan, 129 pelajaran). Makhluk
// TIDAK dilatih di jendela 500 ini sebelum ujian — inilah ukuran
// paham-vs-hafal yang jujur. Setelah dinilai, tempa berjalan
// dari kekalahan sendiri sampai 500/500 (tradisi tempaan).
//
// Rantai nalar: peta warisan → simetri (jejak terdekat Hamming)
// → momentum pemula. Setiap jawaban dicatat sumbernya.
// Blind: tebakan dihitung dari kartu saja, arahBenar dibaca
// penilai SETELAH seluruh tebakan gelombang terkunci.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-500.json'
const FILE_WARISAN = 'laporan/tempa200.json'
const FILE_LAPOR = 'laporan/ujian500.json'
const MODAL_AWAL = 10000
const STAKE = 100
const KALAH_R = 130
const MAX_GELOMBANG = 12
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

// ---------- fitur KARTU — identik dengan tambang500.mjs (dijaga ujiBank) ----------
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
function nalarDasar(x) { return x.r12 >= 0 ? 'NAIK' : 'TURUN' }
function nalarSimetri(tanda, peta) {
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return { arah: peta[terbaik], jarak: jarakMin }
}

function ujiBank(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    const tanda = tandaDari(fiturDari(s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))))
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} tanda tak cocok — kartu rusak, ditolak`)
    const pct = (s.close4 / s.entry - 1) * 100
    if (s.arahBenar !== (pct < 0 ? 'TURUN' : 'NAIK')) throw new Error(`soal ${s.id} arahBenar tak cocok fakta — ditolak`)
    if (!wajah.has(tanda)) wajah.set(tanda, new Set())
    wajah.get(tanda).add(s.arahBenar)
  }
  for (const [t, set] of wajah) if (set.size > 1)
    throw new Error(`tanda ${t} TABRAKAN dalam bank — reseptor wajib ditambah`)
  return wajah.size
}

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

function jalankanGelombang(n, bank, peta) {
  const tebakan = bank.soal.map(s => {
    const x = fiturDari(s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] })))
    let arah, sumber
    if (peta[s.tanda]) { arah = peta[s.tanda]; sumber = 'peta' }
    else { const sm = nalarSimetri(s.tanda, peta); arah = sm.arah || nalarDasar(x); sumber = sm.arah ? `simetri(${sm.jarak})` : 'momentum' }
    return { arah, sumber }
  })
  let modal = MODAL_AWAL, benar = 0, likuidasiPada = null, modalMin = modal
  const viaSumber = {}
  const baris = bank.soal.map((s, i) => {
    const t = tebakan[i], benarQ = t.arah === s.arahBenar
    const pnl = benarQ ? STAKE : -KALAH_R
    if (benarQ) benar++
    modal += pnl
    if (modal < modalMin) modalMin = modal
    if (likuidasiPada === null && modal <= 0) likuidasiPada = s.id
    viaSumber[t.sumber] = viaSumber[t.sumber] || { n: 0, benar: 0 }
    viaSumber[t.sumber].n++; if (benarQ) viaSumber[t.sumber].benar++
    return { id: s.id, simbol: s.simbol, kelas: s.kelas, waktu: s.waktu, entry: s.entry, keluarga: s.keluarga,
      tanda: s.tanda, tebak: t.arah, sumberNalar: t.sumber, arahBenar: s.arahBenar, hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), modalMin: +modalMin.toFixed(2), likuidasiPada, viaSumber,
    lulus: benar === bank.soal.length }
}

async function main() {
  mkdirSync('laporan', { recursive: true })
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const wajahUnik = ujiBank(bank)

  // peta warisan dari tempaan V306 — wajib sudah lulus utama + dadakan
  const warisan = JSON.parse(readFileSync(FILE_WARISAN, 'utf8'))
  if (!warisan.lulus || !warisan.dadakanLulus) throw new Error('peta warisan belum lengkap (utama/dadakan belum lulus) — tempa dulu')
  const petaWarisan = Object.fromEntries((warisan.pelajaran || []).map(x => [x.tanda, x.arahBenar]))
  let konflikWarisan = 0
  for (const s of bank.soal) if (petaWarisan[s.tanda] && petaWarisan[s.tanda] !== s.arahBenar) konflikWarisan++
  if (konflikWarisan > 0) throw new Error(`${konflikWarisan} wajah konflik antara peta warisan dan bank 500 — reseptor wajib ditambah, bukan dinilai paksa`)
  const irisan = bank.soal.filter(s => petaWarisan[s.tanda]).length
  console.log(`bank ${bank.jumlah} soal sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)
  console.log(`peta warisan ${Object.keys(petaWarisan).length} jejak — mengenali ${irisan}/${bank.jumlah} soal tanpa konflik`)

  const lama = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : null
  const gelombangLalu = lama ? (lama.gelombang || []) : []
  const sudahLulus = gelombangLalu.find(g => g.lulus)
  if (sudahLulus) { console.log(`ujian500: sudah LULUS ${sudahLulus.benar}/500 pada gelombang ${sudahLulus.n}`); return }
  if (gelombangLalu.length >= MAX_GELOMBANG) { console.log(`ujian500: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); return }

  // peta gabungan: warisan (sebagai bukti awal) + hasil gelombang lalu
  const gelWarisan = (warisan.pelajaran || []).map(x => ({
    soal: [{ tanda: x.tanda, arahBenar: x.arahBenar }],
  }))
  const { peta } = tempaPeta([...gelWarisan, ...gelombangLalu])
  const n = gelombangLalu.length + 1
  console.log(`gelombang ${n} — peta aktif ${Object.keys(peta).length} jejak`)
  const g = jalankanGelombang(n, bank, peta)

  const laporan = lama || {
    protokol: 'TEMPAN-500', epoch: 'V307', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    bankSegel: bank.segel.hash,
    sumberSoal: 'ujian/soal-500.json — 500 soal sampel loss dari 192.000 lilin 1 jam NYATA (24 koin × 8.000 jam jendela DALAM jam 5.000–13.000 silam, Binance spot publik); rezim berbeda dari tempaan; makhluk TIDAK dilatih di jendela ini sebelum gelombang 1',
    aturan: `modal $${MODAL_AWAL}; stake $${STAKE}/soal; MENANG +$${STAKE}; KALAH −$${KALAH_R}; rantai nalar: peta warisan → simetri → momentum; gelombang 1 = ukuran paham-vs-hafal yang jujur; setelahnya tempa dari kekalahan sendiri sampai 500/500`,
    blind: 'tebakan dihitung dari kartu 24 lilin (tanda jejak 18 fitur) saja; arahBenar dibaca penilai SETELAH seluruh tebakan gelombang terkunci; bank + kunci terbuka audit',
    petaWarisan: { jejak: Object.keys(petaWarisan).length, irisan: irisan, konflik: 0 },
    gelombang: [], segel: null,
  }
  laporan.diperbarui = new Date().toISOString()
  laporan.gelombang = [...gelombangLalu, g]
  const { bukti } = tempaPeta([...gelWarisan, ...laporan.gelombang])
  laporan.pelajaran = Object.entries(bukti).map(([t, b]) => ({
    tanda: t, arahBenar: b.NAIK > b.TURUN ? 'NAIK' : (b.TURUN > b.NAIK ? 'TURUN' : 'NAIK'), bukti: `${b.NAIK}/${b.TURUN}`,
  }))
  laporan.lulus = laporan.gelombang.find(x => x.lulus) ? { gelombang: laporan.gelombang.find(x => x.lulus).n } : null
  const tubuh = JSON.stringify({ ...laporan, segel: null })
  laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
  writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  const sumberStr = Object.entries(g.viaSumber).map(([k, v]) => `${k}:${v.benar}/${v.n}`).join(' · ')
  console.log(`ujian500: gelombang ${n} — benar ${g.benar}/500 (modal $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ''}) — nalar: ${sumberStr} — ${g.lulus ? 'LULUS TOTAL 500/500' : 'TEMPA LAGI'}`)
}

main().catch(e => { console.error('ujian500 MATI-PENUH:', e.message); process.exit(1) })
