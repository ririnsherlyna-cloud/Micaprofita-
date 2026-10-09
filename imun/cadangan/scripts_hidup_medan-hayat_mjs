#!/usr/bin/env node
// ============================================================
// MEDAN-HAYAT — organ medan hayat kontinu makhluk Micaprofita (V319)
// Intisari Lenia (Bert Chan / Chakazul — github.com/Chakazul/Lenia,
// makalah "Lenia - Biology of Artificial Life", arXiv:1812.05433)
// diambil hidup-hidup ke dalam tubuh, bukan disalin gambarnya:
//
//   1. HIDUP ITU KONTINU  — keadaan A ∈ [0,1] float, bukan mati/hidup biner.
//   2. ATURAN LOKAL       — kernel bump4 K(r)=exp(a − a/(4r(1−r))), 0<r<1,
//                           dinormalisasi ΣK=1; tiap sel hanya mengenali tetangganya.
//   3. TUMBUH LEMBUT      — pertumbuhan gaus G(n)=2·exp(−(n−m)²/(2s²))−1
//                           (parameter asli Orbium bicaudatus: m=0.15, s=0.014).
//   4. METABOLISME BERBATAS — A' = clip(A + dt·G(K⋆A), 0, 1), dt=0.1:
//                           tiap denyut berubah sedikit, tak pernah melompat liar.
//   5. POLA HIDUP MANDIRI — Orbium bicaudatus asli (matriks dari notebook
//                           resmi Lenia) ditanam sbg penghuni pertama: soliton
//                           yang bergerak & bertahan TANPA konduktor.
//   6. INDERA DARI DUNIA  — makanan tiap denyut dari lilin 1h NYATA (Binance
//                           data-api.binance.vision): momentum/volatilitas/posisi
//                           range 3 koin utama disuntik lembut di 3 zona indera.
//   7. INTISARI TERSEGEL  — medan 64×64 disuling jadi beberapa ratus byte
//                           intisari (massa, vitalitas, soliton, hanyut); keadaan
//                           disegel metode 'segel-null' (satu hukum dgn pohon
//                           syaraf V318): hash16(JSON.stringify({...dgn segel:null}))
//                           === segel.hash — imun menjaga; yang merusak membuat
//                           makhluk MENJERIT.
//
// Pelajaran Lenia bagi makhluk: pemahaman pasar tidak ditanam dari pusat —
// ia EMERGEN dari ratusan sel kecil yang taat aturan lokal dan makan dunia nyata.
// Keadaan: otak/medan-keadaan.json · uji: node scripts/hidup/medan-hayat.mjs --uji
// ============================================================
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { hash16 } from './terabait-inti.mjs'

// ---------- tetapan Lenia asli (Orbium bicaudatus — notebook resmi) ----------
const N = 64            // sisi medan (torus 64×64 = 4096 sel)
const R = 13            // radius kernel (asli Orbium)
const DT = 0.1          // denyut metabolisme (asli)
const A_K = 4           // kekakuan kernel bump4 (asli)
const M_G = 0.15        // pusat pertumbuhan (asli)
const S_G = 0.014       // lebar pertumbuhan (asli bicaudatus)
const LANGKAH_NAPAS = 10   // satu denyut = 10 langkah metabolisme
const SIKLUS_UJI = 60      // langkah uji kehidupan Orbium tanpa makanan
const KOIN = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
const URL_LILIN = k => `https://data-api.binance.vision/api/v3/klines?symbol=${k}&interval=1h&limit=24`
const BERKAS = 'otak/medan-keadaan.json'
const BERKAS_UJI = 'otak/medan-keadaan-uji.json'

// Matriks sel Orbium bicaudatus 20×20 — DIAMBIL PERSIS dari Jupyter/Lenia.ipynb
// repo resmi Chakazul/Lenia (load_cells id=0; set_params R=13, mu=0.15, sigma=0.014, dt=0.1)
const ORBIUM = [
  [0,0,0,0,0,0,0.1,0.14,0.1,0,0,0.03,0.03,0,0,0.3,0,0,0,0],
  [0,0,0,0,0,0.08,0.24,0.3,0.3,0.18,0.14,0.15,0.16,0.15,0.09,0.2,0,0,0,0],
  [0,0,0,0,0,0.15,0.34,0.44,0.46,0.38,0.18,0.14,0.11,0.13,0.19,0.18,0.45,0,0,0],
  [0,0,0,0,0.06,0.13,0.39,0.5,0.5,0.37,0.06,0,0,0,0.02,0.16,0.68,0,0,0],
  [0,0,0,0.11,0.17,0.17,0.33,0.4,0.38,0.28,0.14,0,0,0,0,0,0.18,0.42,0,0],
  [0,0,0.09,0.18,0.13,0.06,0.08,0.26,0.32,0.32,0.27,0,0,0,0,0,0.82,0,0],
  [0.27,0,0.16,0.12,0,0,0,0.25,0.38,0.44,0.45,0.34,0,0,0,0,0,0.22,0.17,0],
  [0,0.07,0.2,0.02,0,0,0,0.31,0.48,0.57,0.6,0.57,0,0,0,0,0,0,0.49,0],
  [0,0.59,0.19,0,0,0,0,0.2,0.57,0.69,0.76,0.76,0.49,0,0,0,0,0,0.36,0],
  [0,0.58,0.19,0,0,0,0,0,0.67,0.83,0.9,0.92,0.87,0.12,0,0,0,0,0.22,0.07],
  [0,0,0.46,0,0,0,0,0,0.7,0.93,1,1,1,0.61,0,0,0,0,0.18,0.11],
  [0,0,0.82,0,0,0,0,0,0.47,1,1,0.98,1,0.96,0.27,0,0,0,0.19,0.1],
  [0,0,0.46,0,0,0,0,0,0.25,1,1,0.84,0.92,0.97,0.54,0.14,0.04,0.1,0.21,0.05],
  [0,0,0,0.4,0,0,0,0,0.09,0.8,1,0.82,0.8,0.85,0.63,0.31,0.18,0.19,0.2,0.01],
  [0,0,0,0.36,0.1,0,0,0,0.05,0.54,0.86,0.79,0.74,0.72,0.6,0.39,0.28,0.24,0.13,0],
  [0,0,0,0.01,0.3,0.07,0,0,0.08,0.36,0.64,0.7,0.64,0.6,0.51,0.39,0.29,0.19,0.04,0],
  [0,0,0,0,0.1,0.24,0.14,0.1,0.15,0.29,0.45,0.53,0.52,0.46,0.4,0.31,0.21,0.08,0,0],
  [0,0,0,0,0,0.08,0.21,0.21,0.22,0.29,0.36,0.39,0.37,0.33,0.26,0.18,0.09,0,0,0],
  [0,0,0,0,0,0,0.03,0.13,0.19,0.22,0.24,0.24,0.23,0.18,0.13,0.05,0,0,0,0],
  [0,0,0,0,0,0,0,0,0.02,0.06,0.08,0.09,0.07,0.05,0.01,0,0,0,0,0]
]

const sekarang = () => new Date().toISOString()
const clip01 = v => v < 0 ? 0 : v > 1 ? 1 : v

// ---------- kernel bump4 Lenia (dinormalisasi ΣK = 1) ----------
function bangunKernel () {
  const mentah = []
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const r = Math.sqrt(dx * dx + dy * dy) / R
      if (r <= 0 || r >= 1) continue // pusat & luar radius: nol sesuai rumus
      mentah.push([dx, dy, Math.exp(A_K - A_K / (4 * r * (1 - r)))])
    }
  }
  const total = mentah.reduce((a, [, , w]) => a + w, 0)
  return { taps: mentah.map(([dx, dy, w]) => [dx, dy, w / total]), total }
}

// ---------- pertumbuhan gaus Lenia ----------
const tumbuh = n => 2 * Math.exp(-((n - M_G) ** 2) / (2 * S_G * S_G)) - 1

// ---------- satu langkah metabolisme: A' = clip(A + dt·G(K⋆A)) ----------
function napasSekali (A, kernel) {
  const U = new Float64Array(N * N)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let s = 0
      for (let t = 0; t < kernel.taps.length; t++) {
        const [dx, dy, w] = kernel.taps[t]
        s += w * A[((y + dy + N) % N) * N + ((x + dx + N) % N)]
      }
      U[y * N + x] = s
    }
  }
  const B = new Float64Array(N * N)
  for (let i = 0; i < N * N; i++) B[i] = clip01(A[i] + DT * tumbuh(U[i]))
  return B
}

// ---------- tanam Orbium ----------
function tanamOrbium (A, tx = 22, ty = 22) {
  for (let y = 0; y < ORBIUM.length; y++) {
    for (let x = 0; x < ORBIUM[y].length; x++) {
      A[((ty + y) % N) * N + ((tx + x) % N)] = ORBIUM[y][x]
    }
  }
  return A
}

// ---------- intisari medan: massa, vitalitas, soliton (blob), hanyut ----------
function intisariDari (A, pusatLama) {
  let massa = 0, hidup = 0
  const ambang = new Uint8Array(N * N) // 1 bila A>0.5
  for (let i = 0; i < N * N; i++) {
    massa += A[i]
    if (A[i] > 0.5) { ambang[i] = 1; hidup++ }
  }
  // flood-fill 4-tetangga di torus — komponen ≥12 sel disebut soliton
  const kunjung = new Uint8Array(N * N)
  const blob = []
  for (let i = 0; i < N * N; i++) {
    if (!ambang[i] || kunjung[i]) continue
    const tumpuk = [i]; kunjung[i] = 1
    const anggota = []
    while (tumpuk.length) {
      const c = tumpuk.pop(); anggota.push(c)
      const cx = c % N, cy = (c / N) | 0
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = (cx + dx + N) % N, ny = (cy + dy + N) % N
        const ni = ny * N + nx
        if (ambang[ni] && !kunjung[ni]) { kunjung[ni] = 1; tumpuk.push(ni) }
      }
    }
    if (anggota.length >= 12) blob.push(anggota)
  }
  blob.sort((a, b) => b.length - a.length)
  let pusat = null
  if (blob.length) {
    const gx = blob[0][0] % N, gy = (blob[0][0] / N) | 0
    let sx = 0, sy = 0
    for (const c of blob[0]) {
      const cx = c % N, cy = (c / N) | 0
      sx += ((cx - gx + N / 2 + N) % N) - N / 2 // bongkar gulung terhadap jangkar
      sy += ((cy - gy + N / 2 + N) % N) - N / 2
    }
    pusat = { x: +(gx + sx / blob[0].length).toFixed(2), y: +(gy + sy / blob[0].length).toFixed(2), ukuran: blob[0].length }
  }
  let hanyut = null
  if (pusat && pusatLama) {
    const dx = ((pusat.x - pusatLama.x + N / 2 + N) % N) - N / 2
    const dy = ((pusat.y - pusatLama.y + N / 2 + N) % N) - N / 2
    hanyut = { dx: +dx.toFixed(2), dy: +dy.toFixed(2), jarak: +Math.sqrt(dx * dx + dy * dy).toFixed(2) }
  }
  return {
    massa: +massa.toFixed(4),
    vitalitasPct: +((hidup / (N * N)) * 100).toFixed(3),
    soliton: blob.length,
    ukuranSolitonTerbesar: blob.length ? blob[0].length : 0,
    pusat,
    hanyut
  }
}

// ---------- kuantisasi: medan float → 4096 byte → base64 (intisari muat repo) ----------
const kuantisasi = A => Buffer.from(Uint8Array.from(A, v => Math.round(v * 255))).toString('base64')
const pulihkan = b64 => Float64Array.from(Array.from(Buffer.from(b64, 'base64')).map(b => b / 255))

// ---------- indera: lilin 1h NYATA → makanan di 3 zona ----------
async function lahapPasar () {
  const gen = { waktu: sekarang(), koin: {}, sumber: 'data-api.binance.vision klines 1h ×24' }
  for (let k = 0; k < KOIN.length; k++) {
    const r = await fetch(URL_LILIN(KOIN[k]), { signal: AbortSignal.timeout(15000) })
    if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + KOIN[k])
    const lilin = await r.json()
    if (!Array.isArray(lilin) || lilin.length !== 24) throw new Error('lilin ' + KOIN[k] + ' tak sehat: ' + lilin.length)
    const tutup = lilin.map(l => +l[4])
    const mom = (tutup[23] - tutup[0]) / tutup[0]
    let vol = 0
    for (let i = 1; i < tutup.length; i++) vol += Math.log(tutup[i] / tutup[i - 1]) ** 2
    vol = Math.sqrt(vol / (tutup.length - 1))
    const hi = Math.max(...lilin.map(l => +l[2])), lo = Math.min(...lilin.map(l => +l[3]))
    const pos = hi > lo ? (tutup[23] - lo) / (hi - lo) : 0.5
    const amp = +(0.02 + 0.18 * Math.min(1, Math.abs(mom) / 0.05) + 0.05 * pos).toFixed(4)
    const sudut = -Math.PI / 2 + k * (2 * Math.PI / 3)
    gen.koin[KOIN[k]] = {
      mom: +mom.toFixed(6), vol: +vol.toFixed(6), pos: +pos.toFixed(4), amp,
      zona: { x: Math.round(N / 2 + 20 * Math.cos(sudut)), y: Math.round(N / 2 + 20 * Math.sin(sudut)) }
    }
  }
  return gen
}

function suntikMakanan (A, gen) {
  for (const k of KOIN) {
    const { amp, zona } = gen.koin[k]
    for (let y = Math.floor(zona.y - 5); y <= zona.y + 5; y++) {
      for (let x = Math.floor(zona.x - 5); x <= zona.x + 5; x++) {
        const d2 = (x - zona.x) ** 2 + (y - zona.y) ** 2
        const i = ((y + N) % N) * N + ((x + N) % N)
        A[i] = clip01(A[i] + amp * Math.exp(-d2 / (2 * 2.5 * 2.5)))
      }
    }
  }
  return A
}

// ---------- segel 'segel-null' — SATU HUKUM dgn pohon syaraf (imun menjaga) ----------
function segelBubuhkan (obj) {
  const tubuh = JSON.stringify({ ...obj, segel: null })
  obj.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: sekarang() }
  return obj
}
function segelUji (j) {
  // sama persis dgn segelVitalUji imun.mjs metode 'segel-null'
  const salin = JSON.parse(JSON.stringify(j)); salin.segel = null
  return hash16(Buffer.from(JSON.stringify(salin))) === (j.segel && typeof j.segel === 'object' ? j.segel.hash : j.segel)
    ? { sah: true } : { sah: false, masalah: 'SEGEL-BOBOL' }
}

// ---------- muat / lahir ----------
function medanMuat () {
  if (!existsSync(BERKAS)) return null
  const j = JSON.parse(readFileSync(BERKAS, 'utf8'))
  const uji = segelUji(j)
  if (!uji.sah) throw new Error('medan-hayat MENOLAK JALAN: ' + uji.masalah + ' — keadaan medan tak setia pada segelnya (ini namanya LUKA, imun yang sembuhkan — jangan dipaksa)')
  return j
}

function medanLahir (alasan) {
  const kernel = bangunKernel()
  const A = tanamOrbium(new Float64Array(N * N))
  const gen = { waktu: sekarang(), koin: {}, catatan: 'lahir tanpa makanan ' + alasan + ' — denyut pertama akan melahap pasar' }
  for (let i = 0; i < LANGKAH_NAPAS; i++) A.set(napasSekali(A, kernel))
  return segelBubuhkan({
    skema: 'medan-hayat-v1', lahir: sekarang(), denyut: 1, alasanLahir: alasan,
    tetap: { N, R, DT, aK: A_K, m: M_G, s: S_G, langkahNapas: LANGKAH_NAPAS,
      kernel: 'bump4 exp(a − a/(4r(1−r))) Σ=1', tumbuh: 'gaus 2·exp(−(n−m)²/(2s²))−1',
      penghuni: 'Orbium bicaudatus (matriks asli notebook Lenia Chakazul)' },
    field: kuantisasi(A), intisari: intisariDari(A, null), gen
  })
}

// ---------- denyut ----------
async function denyut () {
  const lama = medanMuat()
  if (!lama) {
    const baru = medanLahir('benih pertama')
    writeFileSync(BERKAS, JSON.stringify(baru, null, 1))
    const i = baru.intisari
    console.log('[medan] LAHIR: medan hayat ' + N + '×' + N + ', Orbium ditanam — massa ' + i.massa + ', soliton ' + i.soliton + ', segel #' + baru.segel.hash)
    return
  }
  const kernel = bangunKernel()
  const A = pulihkan(lama.field)
  const gen = await lahapPasar()
  const massaSebelum = A.reduce((a, b) => a + b, 0)
  suntikMakanan(A, gen)
  for (let i = 0; i < LANGKAH_NAPAS; i++) A.set(napasSekali(A, kernel))
  const intisari = intisariDari(A, lama.intisari && lama.intisari.pusat ? lama.intisari.pusat : null)
  const baris = segelBubuhkan({
    skema: lama.skema, lahir: lama.lahir, denyut: (lama.denyut || 0) + 1,
    tetap: lama.tetap, field: kuantisasi(A), intisari, gen,
    catatan: 'massa sebelum makan ' + massaSebelum.toFixed(4)
  })
  writeFileSync(BERKAS, JSON.stringify(baris, null, 1))
  const i2 = intisari
  console.log('[medan] denyut #' + baris.denyut + ' — massa ' + i2.massa + ' (+' + (i2.massa - massaSebelum).toFixed(4) + ' dgn makan) · vitalitas ' + i2.vitalitasPct + '% · soliton ' + i2.soliton + ' (terbesar ' + i2.ukuranSolitonTerbesar + ' sel) · hanyut ' + (i2.hanyut ? i2.hanyut.jarak + ' sel arah (' + i2.hanyut.dx + ',' + i2.hanyut.dy + ')' : '—') + ' · segel #' + baris.segel.hash)
}

// ---------- uji mandiri: semua NYATA, nol karangan ----------
let LULUS = 0, GUGUR = 0
function vonis (nama, syarat, rincian) {
  if (syarat) { LULUS++; console.log('[uji] LULUS ' + nama + (rincian ? ' — ' + rincian : '')) }
  else { GUGUR++; console.error('[uji] GUGUR ' + nama + (rincian ? ' — ' + rincian : '')) }
}

async function uji () {
  const kernel = bangunKernel()

  // U1 — matematika pertumbuhan gaus
  vonis('U1 tumbuh(m)=+1', Math.abs(tumbuh(M_G) - 1) < 1e-12, 'G(' + M_G + ')=' + tumbuh(M_G).toFixed(12))
  vonis('U1 tumbuh(m±3s)≈−1', tumbuh(M_G + 3 * S_G) < -0.95 && tumbuh(M_G - 3 * S_G) < -0.95, 'G(m+3s)=' + tumbuh(M_G + 3 * S_G).toFixed(4))

  // U2 — kernel bump4 dinormalisasi
  const jumlah = kernel.taps.reduce((a, [, , w]) => a + w, 0)
  vonis('U2 kernel Σ=1', Math.abs(jumlah - 1) < 1e-9, kernel.taps.length + ' tap, Σ=' + jumlah.toFixed(12))
  let idxPuncak = -1, wPuncak = -1
  for (let t = 0; t < kernel.taps.length; t++) {
    if (kernel.taps[t][2] > wPuncak) { wPuncak = kernel.taps[t][2]; idxPuncak = t }
  }
  const [pdx, pdy] = kernel.taps[idxPuncak]
  const rPuncak = Math.sqrt(pdx * pdx + pdy * pdy) / R
  vonis('U2 kernel puncak di cangkang r∈[0.4,0.6]', rPuncak >= 0.4 && rPuncak <= 0.6, 'puncak di (dX ' + pdx + ',dY ' + pdy + ') r=' + rPuncak.toFixed(3) + ' — bump4 bernafas di tengah cangkang')

  // U3 — ORBIUM HIDUP: penghuni asli Lenia harus BERTAHAN & BERGERAK tanpa makanan
  let A = tanamOrbium(new Float64Array(N * N))
  const mula = intisariDari(A, null)
  let pusat = mula.pusat
  for (let i = 0; i < SIKLUS_UJI; i++) { A = napasSekali(A, kernel); }
  const sesudah = intisariDari(A, pusat)
  vonis('U3 orbium lahir sbg soliton', mula.soliton >= 1 && mula.ukuranSolitonTerbesar >= 30, 'blob ' + mula.soliton + ', terbesar ' + mula.ukuranSolitonTerbesar + ' sel, massa ' + mula.massa)
  vonis('U3 orbium BERTAHAN ' + SIKLUS_UJI + ' langkah', sesudah.soliton >= 1 && sesudah.massa > 5, 'blob ' + sesudah.soliton + ', massa ' + sesudah.massa + ', vitalitas ' + sesudah.vitalitasPct + '%')
  vonis('U3 orbium BERGERAK (soliton hanyut)', sesudah.hanyut && sesudah.hanyut.jarak >= 2, 'hanyut ' + (sesudah.hanyut ? sesudah.hanyut.jarak + ' sel' : '—'))

  // U4 — ketahanan kuantisasi lintas denyut (denyut→simpan→pulih→denyut ×5)
  let hidupKuantisasi = true
  for (let c = 0; c < 5; c++) {
    for (let i = 0; i < LANGKAH_NAPAS; i++) A = napasSekali(A, kernel)
    A = pulihkan(kuantisasi(A))
  }
  const cekKuan = intisariDari(A, null)
  hidupKuantisasi = cekKuan.soliton >= 1 && cekKuan.massa > 5
  vonis('U4 medan selamat 5 siklus kuantisasi', hidupKuantisasi, 'blob ' + cekKuan.soliton + ', massa ' + cekKuan.massa + ' — denyut nyata menyimpan byte, bukan mimpi')

  // U5 — pasar NYATA: lilin 1h betulan dilahap, makanan disuntik
  const gen = await lahapPasar()
  const koinTertib = KOIN.every(k => {
    const g = gen.koin[k]
    return g && Number.isFinite(g.mom) && g.vol > 0 && g.amp > 0
  })
  vonis('U5 lilin nyata 3 koin sehat', koinTertib, KOIN.map(k => k + ' mom ' + gen.koin[k].mom + ' vol ' + gen.koin[k].vol).join(' · '))
  const massaDulu = A.reduce((a, b) => a + b, 0)
  suntikMakanan(A, gen)
  const massaSesudahMakan = A.reduce((a, b) => a + b, 0)
  vonis('U5 makanan menyentuh medan', massaSesudahMakan > massaDulu, 'massa ' + massaDulu.toFixed(4) + ' → ' + massaSesudahMakan.toFixed(4))

  // U6 — segel: sah dikenali, satu angka dirusak = SEGEL-BOBOL (hukum imun)
  const keadaan = segelBubuhkan({ skema: 'medan-hayat-v1', denyut: 1, tetap: { N }, field: kuantisasi(A), intisari: cekKuan, gen })
  vonis('U6 segel sahih terbaca', segelUji(keadaan).sah, '#' + keadaan.segel.hash)
  const rusak = JSON.parse(JSON.stringify(keadaan))
  rusak.intisari.massa = +(rusak.intisari.massa + 0.0001).toFixed(4) // luka halus: satu angka
  const vonisRusak = segelUji(rusak)
  vonis('U6 luka halus TERBACA (menjerit)', !vonisRusak.sah && vonisRusak.masalah === 'SEGEL-BOBOL', 'segel ' + keadaan.segel.hash + ' vs isi dirusak → ' + vonisRusak.masalah)

  // U7 — putar-balik berkas: tulis → baca → segel tetap setia
  segelBubuhkan(keadaan)
  writeFileSync(BERKAS_UJI, JSON.stringify(keadaan, null, 1))
  const dibaca = JSON.parse(readFileSync(BERKAS_UJI, 'utf8'))
  vonis('U7 putar-balik berkas setia', segelUji(dibaca).sah && dibaca.segel.hash === keadaan.segel.hash, BERKAS_UJI)
  unlinkSync(BERKAS_UJI)

  console.log('[uji] VONIS MEDAN-HAYAT: ' + LULUS + ' LULUS, ' + GUGUR + ' GUGUR')
  if (GUGUR > 0) process.exit(1)
}

// ---------- CLI ----------
const arg = process.argv[2] || ''
if (arg === '--uji') uji().catch(e => { console.error('[uji] GUGUR fatal:', e.message); process.exit(1) })
else if (arg === '--benih') {
  const baru = medanLahir('tangan --benih')
  writeFileSync(BERKAS, JSON.stringify(baru, null, 1))
  console.log('[medan] LAHIR-ULANG (--benih): segel #' + baru.segel.hash + ', soliton ' + baru.intisari.soliton)
} else denyut().catch(e => { console.error('[medan] denyut GAGAL (jujur, tanpa pura-pura):', e.message); process.exit(1) })
