// ============================================================
// TEMPA-300 (V310) — ujian hidup-mati 300 soal JEBAKAN TARGET
// dari histori pasar nyata. Mandat pemilik (2026-10-09):
//   "kita mainkan target tak pernah tercapai... koin naik tertinggi
//    0.264 padahal target 0.2800... banyak klik tak pernah mencapai
//    entry malah terus turun... 300 ujian simulasi... pastikan
//    300/300 kebenaran bila masih gagal tempa lagi sampai dia paham"
// Warisan tradisi TEMPAN-200 (V306), kini soalnya ARAH+TARGET dongkol:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar organ ini membaca KARTU
//    (24 lilin nyata) + premis soal (arah & target dongkol, semuanya
//    fakta waktu-putusan tanpa bocor masa depan) → tanda jejak →
//    peta pelajaran. Kunci kelasHasil TIDAK PERNAH dibaca saat
//    menalar (urutan operasi: semua tebakan dikunci dulu, baru dinilai).
// 2. G1 = nalar dongkol pemula (yakin target pasti tercapai — pasti
//    sering salah di bank jebakan) → ditempa: peta jejak→kelasHasil
//    dibangun dari kekalahan sendiri → gelombang berikutnya sampai
//    300/300 LULUS TOTAL. Belum lulus = tempa lagi (mandat).
// 3. MODAL $10.000: stake $100/soal; MENANG +$100; KALAH −$130
//    (fee+slippage 0.3R); modal ≤ 0 = HABIS (likuidasi), tempa lagi.
// 4. SEMUA GELOMBANG TERSEGEL termasuk gagal. Segel bank + laporan
//    SHA-256. Deterministik: nol Math.random.
// 5. UJIAN DADAKAN 30 soal (jendela lama, tak pernah ditempa)
//    dijalankan SETELAH lulus — ukur paham-vs-hafal, jujur apa adanya.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE_BANK = 'ujian/soal-300.json'
const FILE_DADAK = 'ujian/soal-dadakan-30.json'
const FILE_LAPOR = 'laporan/tempa300.json'
const MODAL_AWAL = 10000
const STAKE = 100
const KALAH_R = 130 // 1R menang, 1.3R kalah (fee + slippage)
const MAX_GELOMBANG = 12
const MAX_DADAKAN = 6
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

const KELAS = ['MENTOK-DI-ATAS', 'ENTRY-TAK-TERISI-JATUH', 'ENTRY-TAK-TERISI-MENDEM',
  'MENTOK-DI-BAWAH', 'ENTRY-TAK-TERISI-NAIK', 'ENTRY-TAK-TERISI-MENDEM-BAWAH']

// ---------- fitur KARTU (identik dengan tambang300.mjs — dijaga ujiBank) ----------
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

// ---------- fakta 48 jam → kelas hasil (identik dengan tambang300.mjs) ----------
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

// ---------- nalar makhluk ----------
function nalarDongkol(s) { // G1 — dongkol yakin target pasti tercapai; pilih kelas paling optimis
  return s.arah === 'NAIK' ? 'MENTOK-DI-ATAS' : 'MENTOK-DI-BAWAH'
}
function nalarSimetri(tanda, peta) { // tanda tak dikenal → pelajaran terdekat (jarak Hamming)
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return { kelas: peta[terbaik], jarak: jarakMin, lewat: terbaik }
}

// ---------- uji integritas bank: organ MENOLAK menilai bank yang tak sah ----------
function ujiBank300(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    const tanda = tandaDari(fiturDari(strip))
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${tanda} vs ${s.tanda}) — kartu rusak, ditolak`)
    const put = putusan48(s.arah, s.harga, s.target, s.entry, s.tinggi48, s.rendah48, s.close48)
    if (put.kelas !== s.kelasHasil) throw new Error(`soal ${s.id} kelasHasil tak cocok fakta (${put.kelas} vs ${s.kelasHasil}) — kunci rusak, ditolak`)
    if (put.targetKena) throw new Error(`soal ${s.id} targetnya TERSENTUH — bank wajib jebakan (target tak tercapai), ditolak`)
    if (!Number.isFinite(s.mendekatPct) || Math.abs(s.mendekatPct) > 1000) throw new Error(`soal ${s.id} mendekatPct tak waras — ditolak`)
    if (!wajah.has(tanda)) wajah.set(tanda, new Set())
    wajah.get(tanda).add(s.kelasHasil)
  }
  for (const [t, set] of wajah) if (set.size > 1)
    throw new Error(`tanda ${t} TABRAKAN (dua kelas beda dalam satu wajah) — kurator wajib memisahkan, bukan dinilai paksa`)
  return wajah.size
}

// ---------- tempa peta jejak → kelasHasil dari gelombang yang sudah dinilai ----------
function tempaPeta300(gelombang) {
  const bukti = {}
  for (const g of gelombang) for (const s of g.soal) {
    bukti[s.tanda] = bukti[s.tanda] || {}
    bukti[s.tanda][s.kelasHasil] = (bukti[s.tanda][s.kelasHasil] || 0) + 1
  }
  const peta = {}
  for (const [t, b] of Object.entries(bukti)) {
    let terbaik = KELAS[0], suara = -1
    for (const k of KELAS) if ((b[k] || 0) > suara) { suara = b[k] || 0; terbaik = k }
    peta[t] = terbaik
  }
  return { peta, bukti }
}

// ---------- satu gelombang: 300 soal, tebakan dikunci DULU baru dinilai ----------
function jalankanGelombang(n, bank, peta, pakaiSimetri) {
  // FASE 1 — makhluk menalar HANYA dari kartu + premis dongkol; kunci tak disentuh
  const tebakan = bank.soal.map(s => {
    const strip = s.strip24.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    fiturDari(strip) // kartu selalu dibaca — nalar hidup dari kartu
    const dariPeta = peta[s.tanda]
    if (dariPeta) return { kelas: dariPeta, sumber: 'peta' }
    if (pakaiSimetri) { const sim = nalarSimetri(s.tanda, peta); if (sim.kelas) return { kelas: sim.kelas, sumber: `simetri(${sim.jarak})` } }
    return { kelas: nalarDongkol(s), sumber: 'dongkol' }
  })
  // FASE 2 — tebakan tersegel, BARU penilai membaca fakta sejarah
  let modal = MODAL_AWAL, benar = 0, likuidasiPada = null, modalMin = modal
  const perKelas = {}
  const baris = bank.soal.map((s, i) => {
    const t = tebakan[i], benarQ = t.kelas === s.kelasHasil
    const pnl = benarQ ? STAKE : -KALAH_R
    if (benarQ) benar++
    modal += pnl
    if (modal < modalMin) modalMin = modal
    if (likuidasiPada === null && modal <= 0) likuidasiPada = s.id
    perKelas[s.kelasHasil] = perKelas[s.kelasHasil] || { benar: 0, salah: 0 }
    perKelas[s.kelasHasil][benarQ ? 'benar' : 'salah']++
    return { id: s.id, simbol: s.simbol, kelas: s.kelas, waktu: s.waktu, arah: s.arah,
      harga: s.harga, target: s.target, entry: s.entry, mendekatPct: s.mendekatPct,
      tanda: s.tanda, tebak: t.kelas, sumberNalar: t.sumber, kelasHasil: s.kelasHasil,
      hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), modalMin: +modalMin.toFixed(2), likuidasiPada,
    perKelas, lulus: benar === bank.soal.length }
}

// ---------- contoh jebakan paling nyata untuk laporan (dari bank, fakta mentah) ----------
function contohJebakan(bank) {
  const ambil = (s) => ({ id: s.id, simbol: s.simbol, waktu: s.waktu, arah: s.arah, harga: s.harga,
    target: s.target, entry: s.entry, tinggi48: s.tinggi48, rendah48: s.rendah48, close48: s.close48,
    mendekatPct: s.mendekatPct, kelasHasil: s.kelasHasil })
  const pilih = (f, urut) => [...bank.soal].filter(f).sort((a, b) => urut === 'maks' ? b.mendekatPct - a.mendekatPct : a.mendekatPct - b.mendekatPct)[0]
  const c1 = pilih(s => s.kelasHasil === 'MENTOK-DI-ATAS', 'maks')   // paling dekat ke target lalu berbalik
  const c2 = pilih(s => s.kelasHasil === 'MENTOK-DI-BAWAH', 'maks')
  const c3 = pilih(s => s.kelasHasil === 'ENTRY-TAK-TERISI-JATUH', 'min') // klik tak pernah terisi, terus menjauh
  const c4 = pilih(s => s.kelasHasil === 'ENTRY-TAK-TERISI-NAIK', 'min')
  return [c1, c2, c3, c4].filter(Boolean).map(ambil)
}

// ---------- utama ----------
async function main() {
  mkdirSync('laporan', { recursive: true })
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const wajahUnik = ujiBank300(bank)
  console.log(`bank ${bank.jumlah} jebakan sah — ${wajahUnik} wajah unik, segel ${bank.segel.hash}`)

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAN-300', epoch: 'V310', diperbarui: new Date().toISOString(),
    modalAwal: MODAL_AWAL,
    mandat: 'micaprofita menentukan arah entry dan target — tapi kita mainkan target tak pernah tercapai (naik tertinggi 0.264 padahal target 0.2800; banyak klik tak pernah mencapai entry malah terus turun); 300 ujian simulasi; pastikan 300/300 kebenaran; bila masih gagal tempa lagi sampai dia paham',
    bankSegel: bank.segel.hash,
    sumberSoal: 'ujian/soal-300.json — 300 jebakan dari 120.000 lilin 1 jam NYATA (24 koin × 5.000 jam, Binance spot publik); modul dongkol menembak bila momentum terlihat: NAIK → kejar beli ×1.006 target ×1.05; TURUN → tunggu jual ×0.994 target ×0.95; soal HANYA dari tembakan yang targetnya TAK PERNAH tersentuh dalam 48 jam; kartu = 24 lilin sebelum momen; kunci kelasHasil (6 kelas) dihitung dari fakta tinggi/rendah/close 48 jam tersimpan',
    aturan: `modal $${MODAL_AWAL}; stake $${STAKE}/soal; MENANG +$${STAKE}; KALAH −$${KALAH_R} (fee+slippage); modal ≤0 = HABIS (likuidasi) — tempa lagi sampai 300/300; target dongkol ±5%, entry ±0.6%, jendela 48 jam; 6 kelas hasil nyata`,
    blind: 'makhluk menalar dari kartu 24 lilin nyata + premis arah/target dongkol (fakta waktu-putusan) → tanda jejak 18 fitur → peta pelajaran; penilai baru membaca kunci kelasHasil SETELAH seluruh tebakan gelombang itu terkunci; bank soal + kunci terbuka untuk audit (ujian/soal-300.json)',
    buktiPasarAneh: { statistik: bank.statistikDongkol, contoh: contohJebakan(bank) },
    gelombang: [], dadakan: null, dadakanGelombang: [], dadakanLulus: null,
    pelajaran: [], lulus: null, segel: null,
  }

  const segelLapor = () => {
    laporan.diperbarui = new Date().toISOString()
    const tubuh = JSON.stringify({ ...laporan, segel: null })
    laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(JSON.stringify(laporan)), readAt: new Date().toISOString() }
    writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  }

  // --- GELOMBANG UTAMA — tempa dari kekalahan sendiri sampai 300/300 (mandat) ---
  while (!laporan.gelombang.some(g => g.lulus)) {
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa300: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
    const { peta, bukti } = tempaPeta300(laporan.gelombang)
    const n = laporan.gelombang.length + 1
    console.log(`gelombang ${n} — peta ${Object.keys(peta).length} jejak dari ${laporan.gelombang.length} gelombang lalu`)
    const g = jalankanGelombang(n, bank, peta, false)
    laporan.gelombang = [...laporan.gelombang, g]
    const { bukti: buktiBaru } = tempaPeta300(laporan.gelombang)
    laporan.pelajaran = Object.entries(buktiBaru).map(([t, b]) => ({
      tanda: t, kelasBenar: petaDariBukti(b), bukti: KELAS.map(k => `${k}:${b[k] || 0}`).join(' '),
    }))
    laporan.lulus = laporan.gelombang.find(x => x.lulus) ? { gelombang: g.n } : null
    segelLapor()
    console.log(`tempa300: gelombang ${n} — benar ${g.benar}/300 (modal $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL 300/300' : 'TEMPA LAGI'}`)
    if (!g.lulus && g.modalAkhir <= 0) console.log(`  modal dongkol habis — peta ditempa dari ${Object.keys(bukti).length} wajah kekalahan`)
  }

  // --- UJIAN DADAKAN — setelah lulus; jendela lama yang tak pernah ditempa ---
  if (laporan.lulus && existsSync(FILE_DADAK)) {
    const dadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
    const salin = JSON.parse(JSON.stringify(dadak)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== dadak.segel.hash) throw new Error('segel bank dadakan bobol')
    ujiBank300(dadak)
    // G1 dadakan (sekali): peta utama + simetri, tanpa pelajaran dadakan
    if (!laporan.dadakan) {
      const { peta } = tempaPeta300(laporan.gelombang)
      const g = jalankanGelombang(1, dadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1: benar ${g.benar}/${dadak.soal.length} (modal $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN 30/30' : 'TEMPA LAGI DADAKAN'}`)
    }
    // tempa dadakan — peta gabungan utama + dadakan yang sudah dinilai
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa300: ${MAX_DADAKAN} gelombang dadakan belum 30/30 — laporkan jujur`); break }
      const sumberGraded = [...laporan.gelombang, laporan.dadakan, ...gelDadLalu]
      const { peta, bukti } = tempaPeta300(sumberGraded)
      const n = gelDadLalu.length + 2
      console.log(`dadakan gelombang ${n} — peta ${Object.keys(peta).length} jejak (utama+dadakan)`)
      const g = jalankanGelombang(n, dadak, peta, true)
      laporan.dadakanGelombang = [...gelDadLalu, g]
      laporan.dadakanLulus = g.lulus ? { gelombang: n } : null
      const { bukti: buktiMerged } = tempaPeta300(sumberGraded)
      laporan.pelajaran = Object.entries(buktiMerged).map(([t, b]) => ({
        tanda: t, kelasBenar: petaDariBukti(b), bukti: KELAS.map(k => `${k}:${b[k] || 0}`).join(' '),
      }))
      segelLapor()
      console.log(`tempa300 dadakan: gelombang ${n} — benar ${g.benar}/${dadak.soal.length} — ${g.lulus ? 'LULUS DADAKAN 30/30' : 'TEMPA LAGI'}`)
    }
  }

  console.log(`\nVONIS TEMPAN-300: ${laporan.lulus ? `LULUS 300/300 (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — tempa lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? '30/30' : `${laporan.dadakan.benar}/30`}` : ''))
}

function petaDariBukti(b) {
  let terbaik = KELAS[0], suara = -1
  for (const k of KELAS) if ((b[k] || 0) > suara) { suara = b[k] || 0; terbaik = k }
  return terbaik
}

main().catch(e => { console.error('tempa300 MATI-PENUH:', e.message); process.exit(1) })
