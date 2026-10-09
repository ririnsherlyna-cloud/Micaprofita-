#!/usr/bin/env node
// ============================================================
// REKA-BENTUK — organ evolusi genom peta makhluk Micaprofita (V320)
// Intisari skriegman/reconfigurable_organisms (Kriegman, Blackiston,
// Levin, Bongard — PNAS 2020, "A scalable pipeline for designing
// reconfigurable organisms") diambil hidup-hidup ke dalam tubuh —
// bukan kodenya disalin (Python2/Voxelyze tak hidup di habitat Node
// ini), melainkan TATA EVOLUSINYA:
//
//   1. GENOME KECIL, TUBUH PENUH — pada paper, genome kecil (CPPN +
//      peta materi voxel) berekspresi jadi makhluk utuh. Di sini:
//      PETA tanda20→kelasHasil adalah genom makhluk; ekspresinya
//      adalah jawaban atas dunia yang diujikan padanya.
//   2. MUTASI NON-NETRAL — paper menolak mutasi yang tak mengubah
//      fenotip (maks 1500 percobaan/anak). Di sini tiap anak wajib
//      beda dari induknya (maks 24 percobaan).
//   3. SIFAT BEKU — paper membekukan jaringan dari evolusi (freeze).
//      Di sini wajah yang dibuktikan bank utama 2000 soal BEKU:
//      penguasaan 2000/2000 tak boleh digadakan demi mutasi.
//   4. ANAK BERSAING DENGAN INDUKNYA SAJA — parallel hill climber
//      paper: anak diadopsi HANYA bila mengungguli induknya langsung;
//      kemampuan lama tak pernah dibuang (sumpah makhluk).
//   5. GERBANG TANGGUH — pelajaran termahal paper: juara simulasi yang
//      rapuh GAGAL pindah ke dunia nyata (champion dievaluasi ulang
//      20× bernoise, median yang dinilai, sebelum difabrikasi). Di
//      sini TANGGUH = kesetiaan jawaban saat SATU pelajaran dilupakan
//      (evaluasi terdegradasi): keyakinan yang hidup hanya di satu
//      wajah = rapuh; lingkungan yang menggema keyakinan sama = tangguh.
//   6. SAKSI TAK PERNAH JADI HAKIM — tiap generasi, jendela lilin 1h
//      NYATA segar (Binance publik, dicekak dadu kripto) dibangun
//      jadi soal out-of-sample dan dinilai sebagai SAKSI — tidak
//      pernah dipakai seleksi (nol tekanan, nol kebocoran). Inilah
//      peran vivo_data.csv pada paper: saksi, bukan hakim.
//   7. SILSILAH TERSEGEL — tiap generasi dicatat siapa lahir dari siapa,
//      variasi apa, kenapa diadopsi/ditolak (lineages pada paper).
//
// Deterministik total: nol Math.random — dadu = rantai SHA-256.
// Keadaan: otak/reka-bentuk.json (segel 'segel-null' — SATU HUKUM dgn
// pohon syaraf V318 & medan hayat V319) · laporan/reka-bentuk.json
// Uji mandiri: node scripts/hidup/reka-bentuk.mjs --uji
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { hash16 } from './terabait-inti.mjs'

const KELAS = ['LIQUID-MELESAT', 'AMBISI-BALIK-DASAR', 'TURUN-LANGSUNG', 'TERGANTUNG-TINGGI', 'MENDEM-DI-RANGE']
const FILE_A = 'ujian/soal-jejak-2000.json'
const FILE_B = 'ujian/soal-jejak-dadakan-150.json'
const FILE_TEMPAAN = 'laporan/tempa-jejak.json'
const FILE_KEADAAN = 'otak/reka-bentuk.json'
const FILE_LAPOR = 'laporan/reka-bentuk.json'
const ANAK_PER_GENERASI = 5      // anak bermutasi + 1 imigran (paper: NUM_RANDOM_INDS)
const IMIGRAN_MUTASI = 8         // imigran = mutasi dalam (peweksplorasi ruang)
const MAX_USAHA_MUTASI = 24      // paper: max_mutation_attempts=1500 — non-neutral wajib
const SILSILAH_MAKS = 150        // silsilah tersegel di otak; terpangkas dihitung jujur
const KOIN_SAKSI = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT',
  'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'TRXUSDT', 'DOTUSDT', 'LTCUSDT']
const URL_LILIN = (k, mulaiMs) => `https://data-api.binance.vision/api/v3/klines?symbol=${k}&interval=1h&startTime=${mulaiMs}&limit=1000`
const R8 = (x) => Number(Number(x).toPrecision(8))

// ---------- dadu kripto: deterministik, nol Math.random ----------
const dadu = (seed, i) => parseInt(hash16(seed + '|' + i).slice(0, 8), 16)

// ---------- segel 'segel-null' — SATU HUKUM dgn neurogenesis/medan/imun ----------
const segelTubuh = (j) => hash16(JSON.stringify({ ...j, segel: null }))
function sahKeadaan(j) {
  if (!j || !j.segel || !j.segel.hash) return 'TANPA-SEGEL'
  if (segelTubuh(j) !== j.segel.hash) return 'SEGEL-BOBOL'
  return null
}

// ---------- kartu & tanda — IDENTIK dgn tempa-jejak.mjs (dijaga uji silang U11) ----------
function fiturDari(strip) {
  const n = strip.length, e = strip[n - 1].c
  const pct = (a, b) => (b / a - 1) * 100
  const r1 = pct(strip[n - 2].c, e), r3 = pct(strip[n - 4].c, e), r9 = pct(strip[0].c, e)
  let naik = 0, turun = 0, hitung = 0
  for (let i = 1; i < n; i++) { const d = strip[i].c - strip[i - 1].c; if (d > 0) naik += d; else turun -= d; hitung++ }
  const avgN = naik / Math.max(1, hitung), avgT = turun / Math.max(1, hitung)
  const rsi = avgT === 0 ? 100 : 100 - 100 / (1 + avgN / avgT)
  const vols = strip.slice(0, n - 1).map(x => x.v)
  const vMean = vols.reduce((a, b) => a + b, 0) / Math.max(1, vols.length)
  const vStd = Math.sqrt(vols.reduce((a, b) => a + (b - vMean) ** 2, 0) / Math.max(1, vols.length)) || 1e-12
  const volz = (strip[n - 1].v - vMean) / vStd
  const hi9 = Math.max(...strip.slice(0, n - 1).map(x => x.h))
  const lo9 = Math.min(...strip.slice(0, n - 1).map(x => x.l))
  const hiAll = Math.max(...strip.map(x => x.h)), loAll = Math.min(...strip.map(x => x.l))
  const posisi = hiAll === loAll ? 0.5 : (e - loAll) / (hiAll - loAll)
  let streakNaik = 0, streakTurun = 0
  for (let i = n - 1; i > 0; i--) {
    const d = strip[i].c - strip[i - 1].c
    if (d > 0) { if (streakTurun) break; streakNaik++ } else if (d < 0) { if (streakNaik) break; streakTurun++ } else break
  }
  const last = strip[n - 1], badan = Math.abs(last.c - last.o) || 1e-12
  return { e, r1, r3, r9, rsi, volz, breakHigh: e > hi9, breakLow: e < lo9, posisi, streakNaik, streakTurun,
    wickAtas: (last.h - Math.max(last.o, last.c)) / badan, wickBawah: (Math.min(last.o, last.c) - last.l) / badan }
}
function tandaDari(x, funding) {
  return [
    x.r3 > 2.5, x.r3 < -2.5, x.r9 > 6, x.r9 < -6,
    x.rsi > 70, x.rsi < 30, x.volz > 2, x.volz < -0.8,
    x.breakHigh, x.breakLow, x.wickAtas > 1.5, x.wickBawah > 1.5,
    x.streakNaik >= 3, x.streakTurun >= 3, x.posisi > 0.92, x.posisi < 0.08,
    x.r1 > 1.2, x.r1 < -1.2,
    funding != null && funding < 0,
    funding != null && funding > 0.0005,
  ].map(Number).join('')
}
function kelasDariFakta(jamAmbang, jamPuncak, jamDasar) {
  if (jamAmbang != null && (jamDasar == null || jamAmbang <= jamDasar)) return 'LIQUID-MELESAT'
  if (jamDasar != null && jamPuncak != null) return 'AMBISI-BALIK-DASAR'
  if (jamDasar != null) return 'TURUN-LANGSUNG'
  if (jamPuncak != null) return 'TERGANTUNG-TINGGI'
  return 'MENDEM-DI-RANGE'
}
function nalarDongkol() { return 'AMBISI-BALIK-DASAR' } // G1 — keyakinan lahir makhluk
// tanda tak dikenal → pelajaran terdekat (jarak Hamming); singkir = wajah yang dilupakan
function nalarSimetri(tanda, peta, singkir) {
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    if (singkir && singkir.has(k)) continue
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return terbaik ? { kelas: peta[terbaik], jarak: jarakMin, lewat: terbaik } : null
}

// ---------- nalar makhluk: tebakan DIKUNCI dulu, baru dinilai (blind, warisan V316) ----------
function faseTebakan(soalList, genom, pakaiSimetri, singkir) {
  return soalList.map(s => {
    const strip = s.strip10.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    fiturDari(strip) // kartu selalu dibaca — nalar hidup dari kartu, bukan dari kunci
    const wajah = singkir && singkir.has(s.tanda) ? null : genom[s.tanda]
    if (wajah) return { kelas: wajah, sumber: 'peta' }
    if (pakaiSimetri) { const sim = nalarSimetri(s.tanda, genom, singkir); if (sim) return { kelas: sim.kelas, sumber: `simetri(${sim.jarak})` } }
    return { kelas: nalarDongkol(), sumber: 'dongkol-balik' }
  })
}
function nilaiBank(soalList, genom, pakaiSimetri, singkir) {
  const tebakan = faseTebakan(soalList, genom, pakaiSimetri, singkir) // FASE 1 — kunci semua tebakan
  let benar = 0
  for (let i = 0; i < soalList.length; i++) if (tebakan[i].kelas === soalList[i].kelasHasil) benar++ // FASE 2 — baru nilai
  return { benar, total: soalList.length, tebakan }
}

// ---------- TANGGUH — pelajaran NOISE_SCALE paper, versi luka-persepsi ----------
// Jawaban tiap soal dadakan dihitung NORMAL vs saat wajahnya sendiri DILUPAKAN.
// Setia pada dua jalur = pengetahuan bertahtak di lingkungan, bukan menumpang
// satu wajah. Juara rapuh paper gagal pindah ke dunia nyata — gerbang ini
// menolaknya sebelum diadopsi.
function tangguhBank(soalB, genom) {
  const memo = new Map()
  let setuju = 0
  for (const s of soalB) {
    if (memo.has(s.tanda)) { setuju += memo.get(s.tanda); continue }
    const normal = faseTebakan([s], genom, false, null)[0].kelas
    const lupa = faseTebakan([s], genom, true, new Set([s.tanda]))[0].kelas
    const ok = normal === lupa ? 1 : 0
    memo.set(s.tanda, ok)
    setuju += ok
  }
  return setuju / Math.max(1, soalB.length)
}

// ---------- mutasi non-neutral (paper: mutation.py + networks.py) ----------
function wajahSunting(genom, beku) {
  return Object.keys(genom).filter(t => !beku.has(t))
}
function kandidatTambah(soalB, genom, beku) {
  const set = new Set()
  for (const s of soalB) {
    const t = s.tanda
    for (let i = 0; i < t.length; i++) set.add(t.slice(0, i) + (t[i] === '0' ? '1' : '0') + t.slice(i + 1))
  }
  return [...set].filter(t => !genom[t] && !beku.has(t)).sort()
}
function mutasiSatu(genom, beku, kandidat, seed, urut) {
  const hasil = { ...genom }
  const sunting = wajahSunting(hasil, beku)
  const g = dadu(seed, urut)
  let variasi = null
  if (kandidat.length && (g % 100 < 60 || !sunting.length)) {
    const t = kandidat[g % kandidat.length]
    const sim = nalarSimetri(t, hasil, null) // warisan keyakinan induk — kelasHasil bank TIDAK disentuh
    const kelas = sim ? sim.kelas : KELAS[(g >> 3) % KELAS.length]
    hasil[t] = kelas
    variasi = `tambahWajah(${t.slice(0, 6)}…→${kelas})`
  } else if (sunting.length && g % 100 < 85) {
    const t = sunting[g % sunting.length]
    const lain = KELAS.filter(k => k !== hasil[t])
    const kelas = lain[(g >> 3) % lain.length]
    hasil[t] = kelas
    variasi = `ubahKelas(${t.slice(0, 6)}…→${kelas})`
  } else if (sunting.length) {
    const t = sunting[g % sunting.length]
    variasi = `hapusWajah(${t.slice(0, 6)}…)`
    delete hasil[t]
  } else {
    return null // ruang mutasi kosong — jujur tak ada anak
  }
  return { genom: hasil, variasi }
}
function lahirAnak(genomInduk, beku, kandidat, seed, urut, jumlahMutasi) {
  let genom = genomInduk, variasi = []
  for (let m = 0; m < jumlahMutasi; m++) {
    let sah = null
    for (let coba = 0; coba < MAX_USAHA_MUTASI && !sah; coba++) {
      const m1 = mutasiSatu(genom, beku, kandidat, seed, urut * 1000 + m * 100 + coba)
      if (m1 && hash16(JSON.stringify(m1.genom)) !== hash16(JSON.stringify(genomInduk))) sah = m1 // non-neutral (paper)
    }
    if (!sah) break
    genom = sah.genom; variasi.push(sah.variasi)
  }
  return variasi.length ? { genom, variasi: variasi.join(' + ') } : null
}

// ---------- evaluasi penuh satu genom ----------
function evaluasi(bankA, bankB, genom) {
  const utama = nilaiBank(bankA.soal, genom, false, null)      // penguasaan: tanpa simetri (warisan gelombang utama V316)
  const dadakan = nilaiBank(bankB.soal, genom, true, null)     // dadakan: simetri diizinkan (warisan dadakan V316)
  const tangguh = tangguhBank(bankB.soal, genom)
  return { utamaBenar: utama.benar, utamaTotal: utama.total, dadakanBenar: dadakan.benar, dadakanTotal: dadakan.total, tangguh }
}
// pasangan kebugaran leksikografis: penguasaan dadakan dulu, baru tangguh
const pasanganKebugaran = (e) => [e.dadakanBenar, Math.round(e.tangguh * 10000)]
function unggul(a, b) { // true bila pasangan a > pasangan b (anak wajib MENUNGGULI, bukan menyamai)
  const pa = pasanganKebugaran(a), pb = pasanganKebugaran(b)
  return pa[0] > pb[0] || (pa[0] === pb[0] && pa[1] > pb[1])
}

// ---------- SAKSI DUNIA — jendela lilin nyata segar, dadu kripto mengekcek ----------
// murni & deterministik — dipakai binaSaksiDunia (dunia) dan U12 (uji offline)
function soalDariBars(bars, simbol) {
  const soal = []
  for (let i = 23; i + 720 < bars.length && soal.length < 40; i += 24) {
    const strip = bars.slice(i - 23, i + 1).map(b => ({ o: b.o, h: b.h, l: b.l, c: b.c, v: b.v }))
    const entry = strip[9].c
    const puncakAmbisi = Math.max(...strip.map(x => x.h)), dasarSelamat = Math.min(...strip.map(x => x.l))
    if ((puncakAmbisi - dasarSelamat) / entry > 0.12) continue // konsolidasi ≤12% — premis warisan tambang-jejak
    let tinggi720 = -Infinity, rendah720 = Infinity, jamPuncak = null, jamAmbang = null, jamDasar = null
    const ambangLikuid = R8(entry * 1.90)
    for (let j = 1; j <= 720; j++) {
      const b = bars[i + j]
      if (b.h > tinggi720) tinggi720 = b.h
      if (b.l < rendah720) rendah720 = b.l
      if (jamPuncak == null && b.h >= puncakAmbisi - 1e-12) jamPuncak = j
      if (jamAmbang == null && b.h >= ambangLikuid - 1e-12) jamAmbang = j
      if (jamDasar == null && b.l <= dasarSelamat + 1e-12) jamDasar = j
    }
    soal.push({ id: `saksi-${i}`, simbol, waktu: new Date(bars[i].t).toISOString(),
      entry, puncakAmbisi, dasarSelamat, ambangLikuid, strip10: strip.map(x => [x.o, x.h, x.l, x.c, x.v]),
      tanda: tandaDari(fiturDari(strip), null), kelasHasil: kelasDariFakta(jamAmbang, jamPuncak, jamDasar),
      tinggi720, rendah720 })
  }
  return soal
}
function binaSaksiDunia(seed) {
  return fetch(URL_LILIN(KOIN_SAKSI[seed % KOIN_SAKSI.length], mulaiSaksi(seed)))
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
    .then(k => {
      const bars = k.map(b => ({ t: b[0], o: +b[1], h: +b[2], l: +b[3], c: +b[4], v: +b[5] }))
      if (bars.length < 800) throw new Error('lilin kurang dari 800')
      return { simbol: KOIN_SAKSI[seed % KOIN_SAKSI.length], jendela: { dari: new Date(bars[0].t).toISOString(), ke: new Date(bars[bars.length - 1].t).toISOString() }, soal: soalDariBars(bars, KOIN_SAKSI[seed % KOIN_SAKSI.length]) }
    })
}
function mulaiSaksi(seed) {
  const hariLalu = 46 + (seed >>> 2) % 1200 // 46 hari (aman 720j depan) s/d ~3,3 tahun ke belakang; >>> — seed bisa > 2^31
  let t = Date.now() - hariLalu * 86400000
  const bawah = Date.UTC(2021, 0, 1)
  if (t < bawah) t = bawah + (seed >>> 3) % 500 * 86400000
  return Math.floor(t / 3600000) * 3600000
}
function nilaiSaksi(soalSaksi, genom) {
  if (!soalSaksi || !soalSaksi.length) return { benar: null, total: null }
  const n = nilaiBank(soalSaksi, genom, true, null)
  return { benar: n.benar, total: n.total }
}

// ---------- putusan adopsi — murni, dipakai main & uji ----------
// Aturan tunggal (paper: parallel hill climber + robustness gate):
// anak diadopsi HANYA bila pasangan kebugarannya (dadakan, tangguh)
// MENUNGGULI induknya. Saksi tidak ikut memutuskan (saksi ≠ hakim).
function putuskan(eInduk, anakTerbaik) {
  if (!anakTerbaik) return { putusan: 'TAK-LAHIR', alasan: 'seluruh anak gugur/bersangkutan tak sah' }
  if (unggul(anakTerbaik.e, eInduk)) return { putusan: 'ADOPSI', alasan: `anak menungguli induk (dadakan ${anakTerbaik.e.dadakanBenar}/${anakTerbaik.e.dadakanTotal} vs ${eInduk.dadakanBenar}/${eInduk.dadakanTotal}, tangguh ${(anakTerbaik.e.tangguh * 100).toFixed(1)}% vs ${(eInduk.tangguh * 100).toFixed(1)}%)` }
  const pa = pasanganKebugaran(anakTerbaik.e), pi = pasanganKebugaran(eInduk)
  return { putusan: 'TAHAN', alasan: pa[0] === pi[0] ? `juara rapuh ditolak — tangguh ${(anakTerbaik.e.tangguh * 100).toFixed(1)}% ≤ induk ${(eInduk.tangguh * 100).toFixed(1)}% (gerbang tangguh, pelajaran sim2real paper)` : `tak unggul — dadakan ${pa[0]} < induk ${pi[0]}` }
}

// ---------- main — satu denyut = satu generasi evolusi ----------
async function main() {
  mkdirSync('otak', { recursive: true }); mkdirSync('laporan', { recursive: true })
  const bacaJson = (f) => JSON.parse(readFileSync(f, 'utf8'))
  const sahBank = (bank, nama) => {
    if (!bank.segel || !bank.segel.hash) throw new Error(`bank ${nama} tanpa segel — ditolak`)
    if (segelTubuh(bank) !== bank.segel.hash) throw new Error(`segel bank ${nama} bobol (${bank.segel.hash}) — ditolak`)
    for (const s of bank.soal) {
      const strip = s.strip10.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
      const t = tandaDari(fiturDari(strip), s.funding24)
      if (t !== s.tanda) throw new Error(`soal ${s.id} (${s.simbol}) tanda tak cocok (${t} vs ${s.tanda}) — kartu rusak, ditolak`)
    }
  }
  const bankA = bacaJson(FILE_A), bankB = bacaJson(FILE_B)
  sahBank(bankA, 'utama-2000'); sahBank(bankB, 'dadakan-150')
  const beku = new Set(bankA.soal.map(s => s.tanda))
  console.log(`reka-bentuk: bank utama ${bankA.jumlah} + dadakan ${bankB.jumlah} sah — wajah beku ${beku.size}`)

  // --- inkumben: dari keadaan tersegel, atau kelahiran bare dari tempaan V316 ---
  let keadaan = existsSync(FILE_KEADAAN) ? bacaJson(FILE_KEADAAN) : null
  if (keadaan) { const luka = sahKeadaan(keadaan); if (luka) throw new Error(`keadaan reka-bentuk ${luka} — organ menolak bekerja atas tubuh tak setia`) }
  if (!keadaan) {
    const tempaan = bacaJson(FILE_TEMPAAN)
    if (!tempaan.segel || segelTubuh(tempaan) !== tempaan.segel.hash) throw new Error('segel tempaan bobol — warisan ditolak')
    const genom = {}
    for (const p of tempaan.pelajaran || []) if (p.tanda && p.tanda.length === 20) genom[p.tanda] = p.kelasBenar
    if (!Object.keys(genom).length) throw new Error('tempaan tanpa pelajaran — tidak ada genome untuk diwarisi')
    keadaan = { skema: 'REKA-BENTUK-V320', lahir: new Date().toISOString(), diperbarui: null,
      protokol: 'evolusi genom peta — intisari reconfigurable_organisms (Kriegman dkk, PNAS 2020): mutasi non-netral, sifat beku, anak-vs-induk, gerbang tangguh, saksi dunia, silsilah tersegel',
      generasi: 0, nomor: 0, dipangkas: 0,
      inkumben: { id: 'GEN-000000', orangTua: 'TEMPAAN-V316', kedalaman: 0, lahirSaat: new Date().toISOString(),
        variasi: 'kelahiran — warisan 782 pelajaran tempaan V316', genom },
      silsilah: [], segel: null }
    console.log(`reka-bentuk: BARE — inkumben GEN-000000 lahir dari tempaan (${Object.keys(genom).length} wajah)`)
  }
  const inkumben = keadaan.inkumben
  const kandidat = kandidatTambah(bankB.soal, inkumben.genom, beku)
  const eInduk = evaluasi(bankA, bankB, inkumben.genom)
  console.log(`reka-bentuk: inkumben ${inkumben.id} — utama ${eInduk.utamaBenar}/${eInduk.utamaTotal}, dadakan ${eInduk.dadakanBenar}/${eInduk.dadakanTotal}, tangguh ${(eInduk.tangguh * 100).toFixed(1)}%`)

  // --- melahirkan anak: 5 bermutasi halus + 1 imigran dalam (paper: NUM_RANDOM_INDS) ---
  const seed = hash16(`REKA-BENTUK|${inkumben.id}|${keadaan.generasi}`)
  const anakRencana = []
  for (let i = 0; i < ANAK_PER_GENERASI; i++) anakRencana.push({ urut: i, mutasi: 1 + (dadu(seed, 20 + i) % 3) })
  anakRencana.push({ urut: ANAK_PER_GENERASI, mutasi: IMIGRAN_MUTASI, imigran: true })
  const dilihat = new Set([hash16(JSON.stringify(inkumben.genom))])
  const anakSah = [], anakGugur = [], variasiTakSah = []
  for (const r of anakRencana) {
    const lahir = lahirAnak(inkumben.genom, beku, kandidat, seed, r.urut, r.mutasi)
    if (!lahir) { anakGugur.push('stail'); continue }
    const hash = hash16(JSON.stringify(lahir.genom))
    if (dilihat.has(hash)) { anakGugur.push('dedup'); continue } // evaluation.py: duplikat lintas anak dibuang
    dilihat.add(hash)
    const e = evaluasi(bankA, bankB, lahir.genom)
    const sah = e.utamaBenar === e.utamaTotal // is_valid paper: penguasaan penuh tak boleh bocor
    ;(sah ? anakSah : (variasiTakSah.push(lahir.variasi), anakGugur)).push({ ...lahir, e, hash })
  }
  console.log(`reka-bentuk: generasi ${keadaan.generasi} — ${anakSah.length} anak sah, ${anakGugur.length} gugur/tak-sah (beku dijaga)`)
  anakSah.sort((a, b) => { const pa = pasanganKebugaran(a.e), pb = pasanganKebugaran(b.e); return (pb[0] - pa[0]) || (pb[1] - pa[1]) })
  const juara = anakSah[0] || null

  // --- SAKSI DUNIA: jendela nyata segar, dinilai, TAK dipakai seleksi ---
  let saksi = null
  try {
    const dunia = await binaSaksiDunia(dadu(seed, 7))
    saksi = { ...dunia, induk: nilaiSaksi(dunia.soal, inkumben.genom), anak: juara ? nilaiSaksi(dunia.soal, juara.genom) : null }
    console.log(`reka-bentuk: saksi dunia ${saksi.simbol} ${dunia.soal.length} soal (${dunia.jendela.dari.slice(0, 10)}…) — induk ${saksi.induk.benar}/${saksi.induk.total}${juara ? `, anak ${saksi.anak.benar}/${saksi.anak.total}` : ''}`)
  } catch (e) { saksi = { gagal: String(e.message).slice(0, 90) }; console.log('reka-bentuk: saksi dunia gagal (jujur, tak memutus):', saksi.gagal) }

  // --- putusan & silsilah ---
  const vonis = putuskan(eInduk, juara)
  const entri = { generasi: keadaan.generasi, putusan: vonis.putusan, alasan: vonis.alasan,
    induk: { id: inkumben.id, dadakanBenar: eInduk.dadakanBenar, tangguh: +eInduk.tangguh.toFixed(4) },
    anak: juara ? { id: null, variasi: juara.variasi, dadakanBenar: juara.e.dadakanBenar, tangguh: +juara.e.tangguh.toFixed(4), sah: true } : null,
    gugur: anakGugur.length, takSah: variasiTakSah.length,
    saksi: saksi && !saksi.gagal ? { simbol: saksi.simbol, soal: saksi.soal.length, induk: saksi.induk.benar, anak: saksi.anak ? saksi.anak.benar : null } : { gagal: saksi ? saksi.gagal : 'null' },
    waktu: new Date().toISOString() }
  if (vonis.putusan === 'ADOPSI') {
    keadaan.nomor++
    entri.anak.id = 'GEN-' + String(keadaan.nomor).padStart(6, '0')
    keadaan.inkumben = { id: entri.anak.id, orangTua: inkumben.id, kedalaman: (inkumben.kedalaman || 0) + 1,
      lahirSaat: entri.waktu, variasi: juara.variasi, genom: juara.genom }
    keadaan.generasi++
    console.log(`reka-bentuk: ADOPSI — ${entri.anak.id} lahir dari ${inkumben.id} (kedalaman ${keadaan.inkumben.kedalaman})`)
  } else {
    keadaan.generasi++
    console.log(`reka-bentuk: ${vonis.putusan} — inkumben ${inkumben.id} bertahan`)
  }
  keadaan.silsilah.push(entri)
  if (keadaan.silsilah.length > SILSILAH_MAKS) { keadaan.silsilah.splice(0, keadaan.silsilah.length - SILSILAH_MAKS); keadaan.dipangkas = (keadaan.dipangkas || 0) + 1 }

  // --- tulis keadaan tersegel + laporan ramping ---
  const eBaru = evaluasi(bankA, bankB, keadaan.inkumben.genom)
  keadaan.inkumben.kebugaran = { utamaBenar: eBaru.utamaBenar, utamaTotal: eBaru.utamaTotal,
    dadakanBenar: eBaru.dadakanBenar, dadakanTotal: eBaru.dadakanTotal, tangguh: +eBaru.tangguh.toFixed(4),
    saksi: entri.saksi.gagal ? null : { simbol: entri.saksi.simbol, benar: entri.saksi.anak != null ? entri.saksi.anak : entri.saksi.induk, total: entri.saksi.soal } }
  keadaan.diperbarui = new Date().toISOString()
  keadaan.segel = null
  keadaan.segel = { hash: segelTubuh(keadaan), size: Buffer.byteLength(JSON.stringify(keadaan)), readAt: keadaan.diperbarui }
  writeFileSync(FILE_KEADAAN, JSON.stringify(keadaan))
  const lapor = { protokol: 'REKA-BENTUK-V320', epoch: 'V320', diperbarui: keadaan.diperbarui,
    generasi: keadaan.generasi, inkumben: { id: keadaan.inkumben.id, orangTua: keadaan.inkumben.orangTua,
      kedalaman: keadaan.inkumben.kedalaman, wajah: Object.keys(keadaan.inkumben.genom).length, kebugaran: keadaan.inkumben.kebugaran },
    silsilahTerakhir: keadaan.silsilah.slice(-5), dipangkas: keadaan.dipangkas || 0, segel: null }
  lapor.segel = { hash: segelTubuh(lapor), size: Buffer.byteLength(JSON.stringify(lapor)), readAt: keadaan.diperbarui }
  writeFileSync(FILE_LAPOR, JSON.stringify(lapor, null, 1))
  console.log(`VONIS REKA-BENTUK: generasi ${keadaan.generasi} — ${vonis.putusan} — inkumben ${keadaan.inkumben.id} (dadakan ${eBaru.dadakanBenar}/${eBaru.dadakanTotal}, tangguh ${(eBaru.tangguh * 100).toFixed(1)}%, utama ${eBaru.utamaBenar}/${eBaru.utamaTotal}) · silsilah #${keadaan.silsilah.length} · segel ${keadaan.segel.hash}`)
}

// ================= UJI MANDIRI — 13 uji, nol jaringan, semua nyata =================
async function uji() {
  const lulus = [], gugur = []
  const vonis = (id, nama, ok, rincian) => { (ok ? lulus : gugur).push(id); console.log(`U${id} ${ok ? 'LULUS' : 'GUGUR'} — ${nama}${rincian ? ' — ' + rincian : ''}`) }
  const lilin = (o, h, l, c, v) => [o, h, l, c, v]
  const stripKosong = Array.from({ length: 10 }, () => lilin(100, 100.1, 99.9, 100, 1000))
  const soalPalsu = (tanda, kelas) => ({ id: 'uji-' + tanda, simbol: 'UJI', strip10: stripKosong, funding24: null, tanda, kelasHasil: kelas })

  // U1 — dadu deterministik
  const d1 = Array.from({ length: 8 }, (_, i) => dadu('benih-uji', i))
  const d2 = Array.from({ length: 8 }, (_, i) => dadu('benih-uji', i))
  vonis(1, 'dadu kripto deterministik (nol Math.random)', JSON.stringify(d1) === JSON.stringify(d2) && d1.every(x => Number.isInteger(x) && x >= 0))

  // U2 — mutasi wajib non-netral + variasi tercatat (paper: non-neutral mutation)
  const genomU = { '00000000000000000000': 'TURUN-LANGSUNG' }
  const kand = kandidatTambah([soalPalsu('00000000000000000000', 'TURUN-LANGSUNG')], genomU, new Set())
  let beda = 0, adaVariasi = 0
  for (let i = 0; i < 20; i++) { const a = lahirAnak(genomU, new Set(), kand, 'benih-u2', i, 1); if (a && hash16(JSON.stringify(a.genom)) !== hash16(JSON.stringify(genomU))) { beda++; if (a.variasi) adaVariasi++ } }
  vonis(2, 'mutasi non-netral: 20 anak semuanya BEDA dari induk + variasi tercatat', beda === 20 && adaVariasi === 20, `${beda}/20 beda`)

  // U3 — wajah beku tak tersentuh (paper: freeze)
  const bekuU = new Set(['11110000000000000000'])
  const genomB = { '11110000000000000000': 'LIQUID-MELESAT', '00001111000000000000': 'MENDEM-DI-RANGE' }
  const kandB = kandidatTambah([soalPalsu('00001111000000000000', 'MENDEM-DI-RANGE')], genomB, bekuU)
  let bocor = 0
  for (let i = 0; i < 200; i++) { const a = lahirAnak(genomB, bekuU, kandB, 'benih-u3', i, 2); if (a && a.genom['11110000000000000000'] !== 'LIQUID-MELESAT') bocor++ }
  vonis(3, 'sifat beku: 200 mutasi nol menyentuh wajah terbekukan', bocor === 0)

  // U4 — keabsahan: mengubah wajah bank utama = penguasaan bocor = tak sah
  const bankA = JSON.parse(readFileSync(FILE_A, 'utf8')), bankB = JSON.parse(readFileSync(FILE_B, 'utf8'))
  const beku = new Set(bankA.soal.map(s => s.tanda))
  const tempaan = JSON.parse(readFileSync(FILE_TEMPAAN, 'utf8'))
  const genom0 = {}; for (const p of tempaan.pelajaran) genom0[p.tanda] = p.kelasBenar
  const palsu = { ...genom0, [bankA.soal[0].tanda]: kelasDariFakta(null, null, null) === genom0[bankA.soal[0].tanda] ? 'TURUN-LANGSUNG' : 'MENDEM-DI-RANGE' }
  const eAsli = evaluasi(bankA, bankB, genom0), ePalsu = evaluasi(bankA, bankB, palsu)
  vonis(4, 'keabsahan: wajah bank utama diubah → penguasaan 2000 bocor → ditolak', eAsli.utamaBenar === eAsli.utamaTotal && ePalsu.utamaBenar < ePalsu.utamaTotal, `${eAsli.utamaBenar} vs bocor ${ePalsu.utamaBenar}`)

  // U5 — blind: tebakan dikunci sebelum penilaian (kunci dirusak → tebakan tak berubah)
  const tb1 = faseTebakan(bankB.soal, genom0, true, null)
  const korup = bankB.soal.map(s => ({ ...s, kelasHasil: 'MENDEM-DI-RANGE' }))
  const tb2 = faseTebakan(korup, genom0, true, null)
  vonis(5, 'blind: merusak kunci tak mengubah satu pun tebakan (tebakan dikunci dulu)', JSON.stringify(tb1) === JSON.stringify(tb2))

  // U6 — tangguh membedakan rapuh vs kokoh
  const T = '01010101010101010101'
  const tetangga = t => t.slice(0, 3) + (t[3] === '0' ? '1' : '0') + t.slice(4)
  const soalT = [soalPalsu(T, 'TURUN-LANGSUNG')]
  const kokoh = { [T]: 'TURUN-LANGSUNG', [tetangga(T)]: 'TURUN-LANGSUNG' }
  const rapuh = { [T]: 'TURUN-LANGSUNG', [tetangga(T)]: 'MENDEM-DI-RANGE' }
  const tgKokoh = tangguhBank(soalT, kokoh), tgRapuh = tangguhBank(soalT, rapuh)
  vonis(6, 'tangguh: lingkungan menggema = 1.0; keyakinan menumpang satu wajah = 0.0', tgKokoh === 1 && tgRapuh === 0, `kokoh ${tgKokoh} · rapuh ${tgRapuh}`)

  // U7-U9 — putusan: hill climber anak-vs-induk + gerbang tangguh
  const e150 = { dadakanBenar: 150, dadakanTotal: 150, tangguh: 0.9, utamaBenar: 2000, utamaTotal: 2000 }
  const eRendah = { ...e150, dadakanBenar: 149 }
  const eRapuh = { ...e150, tangguh: 0.5 }
  const eKokoh = { ...e150, tangguh: 0.95 }
  vonis(7, 'anak lemah ditolak (dadakan turun)', putuskan(e150, { e: eRendah }).putusan === 'TAHAN')
  vonis(8, 'juara rapuh ditolak meski dadakan sama (gerbang tangguh, pelajaran sim2real)', putuskan(e150, { e: eRapuh }).putusan === 'TAHAN', putuskan(e150, { e: eRapuh }).alasan)
  vonis(9, 'anak tangguh-lebih diadopsi (menungguli induk)', putuskan(e150, { e: eKokoh }).putusan === 'ADOPSI')

  // U10 — dedup anak kembar (paper: duplicate results discarded)
  const k1 = lahirAnak(genomU, new Set(), kand, 'benih-u10', 3, 1), k2 = lahirAnak(genomU, new Set(), kand, 'benih-u10', 3, 1)
  vonis(10, 'dedup: benih sama → genom sama → satu dibuang', k1 && k2 && hash16(JSON.stringify(k1.genom)) === hash16(JSON.stringify(k2.genom)))

  // U11 — identitas kartu silang dgn bank tersegel (tanda & kelas dihitung ulang)
  let cocok = 0
  for (const s of bankA.soal.slice(0, 50)) {
    const strip = s.strip10.map(l => ({ o: l[0], h: l[1], l: l[2], c: l[3], v: l[4] }))
    if (tandaDari(fiturDari(strip), s.funding24) === s.tanda && kelasDariFakta(s.jamAmbang, s.jamPuncak, s.jamDasar) === s.kelasHasil) cocok++
  }
  vonis(11, 'identitas kartu: 50 soal bank utama tanda+kelas dihitung ulang PERSIS', cocok === 50, `${cocok}/50`)

  // U12 — matematika saksi dunia (offline): 4 skenario, SATU lilin sapu per dunia (indeks 23 = lilin entry
  // satu-satunya jendela), peristiwa di ekor 800+; jendela nilai tak pernah menyentuh puncak/dasar sapu
  const barDunia = (peristiwa) => Array.from({ length: 900 }, (_, i) => {
    if (i === 23) return { t: Date.UTC(2024, 0, 1) + i * 3600000, o: 100, h: 100.5, l: 99.5, c: 100, v: 2000 } // sapu: puncak/dasar global
    if (i < 730) return { t: Date.UTC(2024, 0, 1) + i * 3600000, o: 100, h: 100.0, l: 99.9, c: 100, v: 1000 } // flat di dalam range sapu
    if (peristiwa === 'menurun') return { t: Date.UTC(2024, 0, 1) + i * 3600000, o: 100, h: 99.95, l: 60, c: 62, v: 5000 }
    if (peristiwa === 'melesat') return { t: Date.UTC(2024, 0, 1) + i * 3600000, o: 100, h: 200, l: 120, c: 195, v: 5000 }
    if (peristiwa === 'tergantung') return { t: Date.UTC(2024, 0, 1) + i * 3600000, o: 100, h: 100.6, l: 99.9, c: 100.4, v: 3000 }
    return { t: Date.UTC(2024, 0, 1) + i * 3600000, o: 100, h: 100.0, l: 99.9, c: 100, v: 1000 }
  })
  const kelasJendelaPertama = (p) => { const s = soalDariBars(barDunia(p), 'UJI'); return s.length ? s[0].kelasHasil : 'TANPA-SOAL' }
  const kM = kelasJendelaPertama('menurun'), kL = kelasJendelaPertama('melesat'), kT = kelasJendelaPertama('tergantung'), kD = kelasJendelaPertama('mendem')
  vonis(12, 'matematika saksi: menurun→TURUN-LANGSUNG, melesat→LIQUID-MELESAT, tergantung→TERGANTUNG-TINGGI, datar→MENDEM',
    kM === 'TURUN-LANGSUNG' && kL === 'LIQUID-MELESAT' && kT === 'TERGANTUNG-TINGGI' && kD === 'MENDEM-DI-RANGE',
    `${kM} · ${kL} · ${kT} · ${kD}`)

  // U13 — segel 'segel-null': luka satu karakter terbaca
  const keadaanUji = { skema: 'UJI', isi: { a: 1, b: 'dua' }, segel: null }
  keadaanUji.segel = { hash: segelTubuh(keadaanUji), size: 1, readAt: 'uji' }
  const sahSebelum = sahKeadaan(keadaanUji) === null
  const salinan = JSON.parse(JSON.stringify(keadaanUji)); salinan.isi.b = 'duaX'
  vonis(13, 'segel-null: sah sebelum luka, SEGEL-BOBOL setelah satu karakter dirusak', sahSebelum && sahKeadaan(salinan) === 'SEGEL-BOBOL')

  console.log(`\nVONIS UJI REKA-BENTUK: ${lulus.length} LULUS, ${gugur.length} GUGUR${gugur.length ? ' — ' + gugur.join(',') : ''}`)
  if (gugur.length) process.exit(1)
}

const argUji = process.argv.includes('--uji')
;(argUji ? uji() : main()).catch(e => { console.error('reka-bentuk MATI-PENUH:', e.message); process.exit(1) })
