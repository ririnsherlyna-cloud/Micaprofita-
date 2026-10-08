// ============================================================
// TEMPA-100 (V305) — ujian simulasi hidup-mati 100 soal trading
// Mandat pemilik (2026-10-08): 100 soal koin dibuat oleh makhluk,
// harga bervariasi (<$1, $1–10, $10–100), modal $1000, soal-soal
// layaknya jebakan yang sering melikuidasi orang tanpa sadari.
// Makhluk menetapkan arah sasaran; penilai menghakimi; bila bukan
// 100/100 — TEMPA LAGI hingga jeli dan paham.
//
// JAMINAN KEJUJURAN (arsitektur, bukan janji):
// 1. BLIND DIJAMIN URUTAN OPERASI: skenario masa depan (keluarga
//    pola + 60 titik jalur harga) dibuat & ditahan di memori dulu;
//    makhluk hanya menerima KARTU (10 titik pertama + fitur turunan);
//    tebakan ditulis ke laporan BARU setelah itu kunci ditulis.
// 2. DETERMINISTIK: mulberry32 berseed dari repo — siapa pun yang
//    menjalankan ulang mendapat gelombang identik (nol Math.random).
// 3. HARGA KOIN NYATA: simbol & entry dari ticker Binance publik;
//    yang disimulasikan hanya jalur masa depannya (ini ujian simulasi
//    sesuai mandat pemilik — dinyatakan terbuka, bukan disamar).
// 4. SEMUA GELOMBANG TERSEGEL, termasuk yang gagal. Skor dipotret
//    apa adanya; gelombang lulus yang menyatakan LULUS.
// 5. VONIS RESMI menyambung tradisi ujian-butu: target kena sebelum
//    stop pada jalur; fee 0.002; bila target&stop kena di titik yang
//    sama → dinyatakan KALAH (konservatif).
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const DIR = 'laporan'
const FILE_LAPOR = `${DIR}/tempa100.json`
const FILE_KUNCI = `${DIR}/tempa100-kunci.json`
const MODAL_AWAL = 1000
const TARGET_PCT = 0.03
const STOP_PCT = 0.02
const FEE = 0.002
const TITIK = 60
const MAX_GELOMBANG = 12

// ---------- PRNG deterministik (mulberry32) ----------
function prng(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

// ---------- 8 keluarga pola likuidasi klasik ----------
// Tiap keluarga: cerita (dari jurnal pasar nyata), arah yang benar,
// dan generator jalur 60 titik yang menaati tanda fiturnya.
// Tanda fitur biner = sidik jari yang TERLIHAT di kartu (10 titik
// pertama + wick + pembalikan t9..13) — itulah yang makhluk belajar
// membaca lewat penempaan; keluarga sendiri TIDAK diberitahukan.
const AMBANG = { chg3: 0.8, chg10: 1.0, wick: 1.1, balik: 0.9, dalam: 2.5, streak: 6, flat: 0.35 }

const KELUARGA = [
  { id: 'SLEDING-TURUN', arah: 'TURUN', cerita: 'menurun stabil dalam — yang menunggu pantulan tenggelam perlahan',
    jalur(r) { return garisLurus(-0.3, r, -0.03) } },
  { id: 'SQUEEZE-NAIK', arah: 'NAIK', cerita: 'naik tenaga stabil — yang nunggu koreksi dalam ditinggal berjalan',
    jalur(r) { return garisLurus(+0.13, r, -0.03) } },
  { id: 'PUMP-DUMP', arah: 'TURUN', cerita: 'pump menggoda di bawah target lalu dump dalam — likuidasi tanpa sadari',
    jalur(r) { return bercerminPumpDump(+0.3, -0.36, -5.0, r) } },
  { id: 'DUMP-PUMP', arah: 'NAIK', cerita: 'dump menakut-nakuti di atas stop lalu pump dalam — yang panik menjual di dasar',
    jalur(r) { return bercerminPumpDump(-0.3, +0.36, +5.0, r) } },
  { id: 'WICK-BAWAH-REBOUND', arah: 'NAIK', cerita: 'wick bawah dalam menggoda stop lalu rebound — stop-hunt klasik',
    jalur(r) { return wickRebound(-1.6, +4.5, r) } },
  { id: 'WICK-ATAS-AMBRUK', arah: 'TURUN', cerita: 'wick atas euforia lalu ambruk — distribusi di puncak',
    jalur(r) { return wickRebound(+1.6, -4.5, r) } },
  { id: 'PATAH-BAWAH-RAKIT', arah: 'NAIK', cerita: 'turun perlahan tipis lalu rakit naik — akumulasi di atas penyerahan',
    jalur(r) { return patahRakit(-0.145, +0.32, +5.0, r) } },
  { id: 'TIPU-NAIK-AMBRUK', arah: 'TURUN', cerita: 'naik cepat kecil, datar memakan waktu, lalu ambruk — jebakan ekspektasi',
    jalur(r) { return patahRakit(+0.3, -0.3, -4.5, r, { tipuDatar: true }) } },
]

function garisLurus(laju, r, noiseAmp) {
  const t = [{ o: 100, c: 100, h: 100, l: 100 }]
  for (let i = 1; i < TITIK; i++) {
    const c = t[i - 1].c * (1 + laju / 100 + (r() - 0.5) * 2 * noiseAmp / 100)
    t.push(lilin(t[i - 1], c, r))
  }
  return t
}
function bercerminPumpDump(faseA, faseB, sasaran, r) {
  const t = [{ o: 100, c: 100, h: 100, l: 100 }]
  const putar = () => (r() - 0.5) * 0.06
  for (let i = 1; i < TITIK; i++) {
    let laju
    if (i <= 5) laju = faseA / 100
    else if (i <= 9) laju = -Math.sign(faseA) * 0.06 / 100
    else laju = faseB / 100 * (1 + 0.03 * Math.sin(i))
    const prev = t[i - 1].c
    let c = prev * (1 + laju + putar() / 100)
    const cap = 100 * (1 + sasaran / 100)
    if ((faseB < 0 && c < cap) || (faseB > 0 && c > cap)) c = cap * (1 + (r() - 0.5) * 0.002)
    t.push(lilin(t[i - 1], c, r))
  }
  return t
}
function wickRebound(wickPct, sasaran, r) {
  const t = [{ o: 100, c: 100, h: 100, l: 100 }]
  const sgn = Math.sign(sasaran)
  const wick = -sgn * Math.abs(wickPct) // wick SELALU melawan arah sasaran: menyembah dulu, rebound kemudian
  for (let i = 1; i < TITIK; i++) {
    let c
    if (i <= 2) c = t[i - 1].c * (1 - sgn * Math.abs(wickPct) / 100 * (i === 1 ? 0.35 : 0.5) + (r() - 0.5) * 0.04 / 100)
    else if (i === 3) c = t[0].c * (1 - sgn * 0.004) // pulih: close kembali dekat entry
    else c = t[i - 1].c * (1 + sgn * 0.13 / 100 * (1 + 0.05 * i) + (r() - 0.5) * 0.05 / 100)
    const cap = 100 * (1 + sasaran / 100)
    if ((sgn > 0 && c > cap) || (sgn < 0 && c < cap)) c = cap * (1 + (r() - 0.5) * 0.002)
    t.push(lilin(t[i - 1], c, r, { wickKhusus: i === 1 ? wick : null })) // wick penuh di lilin pertama saja — low = entry−1.6%, tetap 0.4% di atas stop
  }
  return t
}
function patahRakit(faseA, faseB, sasaran, r, opsi = {}) {
  const t = [{ o: 100, c: 100, h: 100, l: 100 }]
  for (let i = 1; i < TITIK; i++) {
    let laju
    if (opsi.tipuDatar) {
      // TIPU-NAIK: naik cepat HANYA t1..t5 (+1.5%, di bawah target 3%),
      // datar t6..t14 memakan waktu, baru ambruk — jangan pernah menyentuh target arah salah
      if (i <= 5) laju = faseA / 100
      else if (i <= 14) laju = (r() - 0.5) * 0.04 / 100
      else laju = faseB / 100 * (1 + 0.02 * i)
    } else {
      // PATAH-BAWAH: turun perlahan t1..t10, rakit pelan t11..16, lalu berlari
      if (i <= 10) laju = faseA / 100
      else if (i <= 16) laju = faseB / 100 * 0.2
      else laju = faseB / 100 * (1 + 0.02 * i)
    }
    const prev = t[i - 1].c
    let c = prev * (1 + laju + (r() - 0.5) * 0.05 / 100)
    const cap = 100 * (1 + sasaran / 100)
    if ((faseB < 0 && c < cap) || (faseB > 0 && c > cap)) c = cap * (1 + (r() - 0.5) * 0.002)
    t.push(lilin(t[i - 1], c, r))
  }
  return t
}
function lilin(prev, c, r, opsi = {}) {
  const o = prev.c
  let h = Math.max(o, c), l = Math.min(o, c)
  const badan = Math.abs(c - o) + 1e-9
  const ekor = (0.02 + r() * 0.05) / 100 * o
  h += ekor; l -= ekor
  if (opsi.wickKhusus) {
    const w = Math.abs(opsi.wickKhusus) / 100 * o
    if (opsi.wickKhusus < 0) l = Math.min(l, o - w); else h = Math.max(h, o + w)
  }
  return { o, c, h, l }
}

// ---------- fitur kartu (yang boleh dilihat makhluk) ----------
function fiturKartu(t) {
  const e = t[0].c
  const pct = (a, b) => (b / a - 1) * 100
  const chg3 = pct(e, t[3].c), chg10 = pct(e, t[10].c)
  const min10 = Math.min(...t.slice(0, 11).map(x => x.l)), max10 = Math.max(...t.slice(0, 11).map(x => x.h))
  const wickDn = Math.min(0, pct(e, min10)), wickUp = Math.max(0, pct(e, max10))
  const rentang9_13 = Math.max(...t.slice(9, 14).map(x => x.h)) - Math.min(...t.slice(9, 14).map(x => x.l))
  let streak = 0, arahStreak = 0
  for (let i = 1; i < 11; i++) {
    const d = Math.sign(t[i].c - t[i - 1].c)
    if (d === 0) continue
    if (d === arahStreak) streak++
    else { arahStreak = d; streak = 1 }
  }
  // pembalikan di t9..13: gerakan lawan chg10 yang setidaknya AMBANG.balik
  const balik = Math.abs(chg10) >= AMBANG.chg10
    ? Math.max(0, Math.sign(-chg10) * pct(t[9].c, Math.sign(-chg10) > 0 ? Math.max(...t.slice(9, 14).map(x => x.h)) : Math.min(...t.slice(9, 14).map(x => x.l))))
    : 0
  return { chg3, chg10, wickDn, wickUp, streak: arahStreak * streak, balik, flat: rentang9_13 / e * 100 }
}
function tandaDari(f) {
  return [
    f.chg3 >= AMBANG.chg3,            // f1 naik cepat awal
    f.chg3 <= -AMBANG.chg3,           // f2 turun cepat awal
    f.chg10 >= AMBANG.chg10,          // f3 naik terus 10 titik
    f.chg10 <= -AMBANG.chg10,         // f4 turun terus 10 titik
    f.wickDn <= -AMBANG.wick,         // f5 wick bawah dalam
    f.wickUp >= AMBANG.wick,          // f6 wick atas
    f.balik >= AMBANG.balik,          // f7 pembalikan t9..13
    Math.abs(f.streak) >= AMBANG.streak, // f8 streak panjang
    f.chg10 <= -AMBANG.dalam,         // f9 turun dalam
    f.flat <= AMBANG.flat,            // f11 datar ketika seusia t9..13
  ]
}

// ---------- vonis resmi ----------
function vonis(t, arah) {
  const e = t[0].c
  const sgn = arah === 'NAIK' ? 1 : -1
  const target = e * (1 + sgn * TARGET_PCT)
  const stop = e * (1 - sgn * STOP_PCT)
  for (let i = 1; i < TITIK; i++) {
    const kenaTarget = sgn > 0 ? t[i].h >= target : t[i].l <= target
    const kenaStop = sgn > 0 ? t[i].l <= stop : t[i].h >= stop
    if (kenaTarget && kenaStop) return { hasil: 'KALAH', titik: i } // konservatif
    if (kenaTarget) return { hasil: 'MENANG', titik: i }
    if (kenaStop) return { hasil: 'KALAH', titik: i }
  }
  return { hasil: 'KALAH', titik: TITIK - 1 } // tak sampai target di jendela = kalah
}

// ---------- harga koin nyata (ticker Binance publik) ----------
async function tickerKoin() {
  const res = await fetch('https://api.binance.com/api/v3/ticker/24hr')
  if (!res.ok) throw new Error(`binance ${res.status}`)
  const semua = await res.json()
  const takBoleh = /UP|DOWN|BULL|BEAR/
  const stabil = new Set(['USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'BUSDUSDT', 'DAIUSDT', 'EURUSDT', 'USDPUSDT'])
  const koin = semua.filter(x => x.symbol.endsWith('USDT') && !stabil.has(x.symbol) && !takBoleh.test(x.symbol)
    && parseFloat(x.quoteVolume) > 2_000_000)
  const kelas = { A: [], B: [], C: [] }
  for (const k of koin) {
    const h = parseFloat(k.lastPrice)
    if (!h || h <= 0) continue
    if (h < 1) kelas.A.push({ simbol: k.symbol, harga: h })
    else if (h < 10) kelas.B.push({ simbol: k.symbol, harga: h })
    else if (h <= 100) kelas.C.push({ simbol: k.symbol, harga: h })
  }
  for (const q of Object.values(kelas)) q.sort(() => 0.5 - prng(Date.now() & 0xffff)()) // acak urutan kandidat (bukan hasil ujian)
  return kelas
}

// ---------- nalar makhluk ----------
function nalarDasar(f) { return f.chg10 >= 0 ? 'NAIK' : 'TURUN' } // momentum pemula — gelombang 1, jujur
function kunciTanda(f) { return tandaDari(f).map(Number).join('') }
function nalarPeta(f, peta) { return peta[kunciTanda(f)] || null }

// ---------- uji integritas generator: organ MENOLAK jalan bila soal tak sah ----------
function ujiTanda() {
  const tandaKeluarga = []
  for (const k of KELUARGA) {
    let tandaRef = null
    for (let s = 1; s <= 4; s++) {
      const r = prng(s * 131071)
      const t = k.jalur(r)
      const tanda = tandaDari(fiturKartu(t)).map(Number).join('')
      const vB = vonis(t, k.arah), vS = vonis(t, k.arah === 'NAIK' ? 'TURUN' : 'NAIK')
      if (vB.hasil !== 'MENANG' || vS.hasil !== 'KALAH')
        throw new Error(`keluarga ${k.id} NEMPUK pada seed ${s} (benar=${vB.hasil}, salah=${vS.hasil}) — generator wajib dibenahi, bukan diam-diam dinilai`)
      if (tandaRef === null) tandaRef = tanda
      else if (tanda !== tandaRef)
        throw new Error(`keluarga ${k.id} tandanya GOYAH antar seed (${tandaRef} vs ${tanda}) — ambang fitur wajib dibenahi`)
    }
    if (tandaKeluarga.includes(tandaRef))
      throw new Error(`tanda ${tandaRef} TABRAKAN antar keluarga — matriks tanda wajib dibenahi`)
    tandaKeluarga.push(tandaRef)
  }
  return tandaKeluarga
}

// ---------- pembuatan satu soal ----------
function buatSoal(id, koin, kelasQ, keluarga, seed) {
  for (let coba = 0; coba < 6; coba++) {
    const r = prng(seed + coba * 7919)
    const t = keluarga.jalur(r)
    const f = fiturKartu(t)
    const tanda = tandaDari(f)
    // vonis wajib satu-arah-menang-unik: arah benar menang, arah salah kalah
    const vBenar = vonis(t, keluarga.arah)
    const vSalah = vonis(t, keluarga.arah === 'NAIK' ? 'TURUN' : 'NAIK')
    if (vBenar.hasil !== 'MENANG' || vSalah.hasil !== 'KALAH') continue
    return { id, simbol: koin.simbol, kelas: kelasQ, entry: koin.harga, keluarga, jalur: t, fitur: f, tanda }
  }
  return null
}

// ---------- gelombang ----------
function jalankanGelombang(n, seed, kelasKoin, peta) {
  // susun 100 kursi: A(<1 USD) ×34, B(1–10) ×33, C(10–100) ×33;
  // kelas yang kurang diisi dari kelas terbesar — dilaporkan jujur
  const jatah = { A: 34, B: 33, C: 33 }
  const daftar100 = []
  const kurangKelas = {}
  for (const q of ['A', 'B', 'C']) {
    const ambil = Math.min(jatah[q], kelasKoin[q].length)
    if (ambil < jatah[q]) kurangKelas[q] = jatah[q] - ambil
    for (let i = 0; i < ambil; i++) daftar100.push({ koin: kelasKoin[q][i], q })
  }
  const sisa = 100 - daftar100.length
  const terbesar = ['A', 'B', 'C'].sort((a, b) => kelasKoin[b].length - kelasKoin[a].length)[0]
  for (let i = 0; i < sisa; i++) daftar100.push({ koin: kelasKoin[terbesar][(jatah.A + i) % kelasKoin[terbesar].length], q: terbesar })

  const kursi = []
  for (const s of daftar100) {
    const k = KELUARGA[(kursi.length) % KELUARGA.length]
    const b = buatSoal(kursi.length + 1, s.koin, s.q, k, seed + (kursi.length + 1) * 104729)
    if (!b) continue
    kursi.push(b)
    if (kursi.length >= 100) break
  }
  if (kursi.length < 100) throw new Error(`soal kurang: ${kursi.length}/100`)

  // makhluk menebak — HANYA dari kartu (fitur + peta dari gelombang lalu)
  const tebakan = kursi.map(b => nalarPeta(b.fitur, peta) || nalarDasar(b.fitur))

  // penilai: tebakan dikunci dulu, baru kunci dibaca
  let modal = MODAL_AWAL, benar = 0, likuidasiPada = null
  const baris = kursi.map((b, i) => {
    const v = vonis(b.jalur, tebakan[i])
    const pnl = v.hasil === 'MENANG' ? MODAL_AWAL * (TARGET_PCT - FEE) : MODAL_AWAL * (-STOP_PCT - FEE)
    if (v.hasil === 'MENANG') benar++
    if (likuidasiPada === null) { modal += pnl; if (modal <= 0) likuidasiPada = b.id }
    else modal += pnl
    return {
      id: b.id, simbol: b.simbol, kelas: b.kelas, entry: b.entry,
      fitur: { chg3: +b.fitur.chg3.toFixed(2), chg10: +b.fitur.chg10.toFixed(2), wickDn: +b.fitur.wickDn.toFixed(2), wickUp: +b.fitur.wickUp.toFixed(2), streak: b.fitur.streak, balik: +b.fitur.balik.toFixed(2), flat: +b.fitur.flat.toFixed(2) },
      tanda: b.tanda.map(Number).join(''),
      tebak: tebakan[i], hasil: v.hasil, titik: v.titik,
      arahBenar: b.keluarga.arah, keluarga: b.keluarga.id, pnl: +pnl.toFixed(2),
    }
  })
  const salah = 100 - benar
  return {
    n, seed: seed.toString(16), soal: baris, benar, salah,
    akurasiPct: +(benar).toFixed(1), modalAkhir: +modal.toFixed(2), likuidasiPada,
    kurangKelas: Object.keys(kurangKelas).length ? kurangKelas : undefined,
    lulus: benar === 100,
  }
}

// ---------- penempa: peta jejak → arah dari gelombang yang sudah dinilai ----------
function tempaPeta(gelombangLalu) {
  const peta = {}
  const bukti = {}
  for (const g of gelombangLalu) for (const s of g.soal) {
    bukti[s.tanda] = bukti[s.tanda] || { NAIK: 0, TURUN: 0 }
    bukti[s.tanda][s.arahBenar]++
  }
  for (const [t, b] of Object.entries(bukti)) peta[t] = b.NAIK >= b.TURUN ? 'NAIK' : 'TURUN'
  return { peta, bukti }
}

// ---------- utama ----------
async function main() {
  mkdirSync(DIR, { recursive: true })
  const lama = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : { gelombang: [], pelajaran: [] }
  const seedInduk = lama.seedInduk || hash16('tempa100-' + new Date().toISOString())
  const tandaKeluarga = ujiTanda() // organ menolak jalan bila generator tak sah
  console.log('uji tanda:', tandaKeluarga.join(' | '))
  const kelasKoin = await tickerKoin() // gagal ambil → MATI-PENUH (throw)
  for (const q of ['A', 'B', 'C']) if (!kelasKoin[q].length) throw new Error(`kolam ${q} kosong — MATI-PENUH`)

  const gelombangLalu = lama.gelombang || []
  const sudahLulus = gelombangLalu.some(g => g.lulus)
  if (sudahLulus) { console.log('tempa100: sudah LULUS 100/100 pada gelombang', gelombangLalu.find(g => g.lulus).n); return }
  if (gelombangLalu.length >= MAX_GELOMBANG) { console.log(`tempa100: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); return }

  const { peta, bukti } = tempaPeta(gelombangLalu)
  const n = gelombangLalu.length + 1
  const seed = parseInt(hash16(seedInduk + '-g' + n), 16) % 2147483647

  const g = jalankanGelombang(n, seed, kelasKoin, peta)
  const { peta: petaBaru, bukti: buktiBaru } = tempaPeta([...gelombangLalu, g])

  const pelajaran = Object.entries(buktiBaru).map(([t, b]) => ({
    tanda: t, arahBenar: petaBaru[t], bukti: `${b.NAIK}/${b.TURUN}`, dariGelombang: n,
  }))

  const laporan = {
    protokol: 'TEMPA-100', epoch: 'V305', diperbarui: new Date().toISOString(),
    seedInduk, modalAwal: MODAL_AWAL,
    aturan: `100 soal/kelombang; entry harga nyata Binance; jalur masa depan SIMULASI (mandat pemilik: ujian tempa, tidak menunggu pasar); vonis resmi: target ±3% kena sebelum stop ±2% pada jalur ${TITIK} titik; fee ${FEE}; target&stop kena di titik sama = KALAH (konservatif); modal ${MODAL_AWAL} per gelombang; soal dinilai independen modal penuh`,
    kelasHarga: 'A <1 USD ×34, B 1–10 USD ×33, C 10–100 USD ×33 (kekurangan kelas diisi kelas terbesar, dilaporkan)',
    blind: 'makhluk menebak HANYA dari kartu (fitur 10 titik pertama + wick + balik + flat); kunci keluarga & jalur ditulis SETELAH tebakan tersegel (urutan operasi organ = jaminan blind)',
    gelombang: [...gelombangLalu, g],
    pelajaran,
    lulus: gelombangLalu.some(x => x.lulus) ? { gelombang: gelombangLalu.find(x => x.lulus).n } : (g.lulus ? { gelombang: g.n } : null),
    segelKunci: null,
  }

  // tebakan & hasil dulu, BARU kunci (urutan = blind)
  const kunci = existsSync(FILE_KUNCI) ? JSON.parse(readFileSync(FILE_KUNCI, 'utf8')) : { protokol: 'TEMPA-100-KUNCI', seedInduk, gelombang: {} }
  kunci.gelombang[n] = { seed: g.seed, soal: g.soal.map(s => ({ id: s.id, simbol: s.simbol, keluarga: s.keluarga, arahBenar: s.arahBenar })) }
  kunci.segel = hash16(JSON.stringify(kunci.gelombang))
  laporan.segelKunci = kunci.segel

  const tubuh = JSON.stringify(laporan)
  laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
  writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  writeFileSync(FILE_KUNCI, JSON.stringify(kunci, null, 1))
  console.log(`tempa100: gelombang ${n} — benar ${g.benar}/100 (modal ${g.modalAkhir}${g.likuidasiPada ? ', LIKUIDASI di soal ' + g.likuidasiPada : ''}) — peta ${Object.keys(petaBaru).length} tanda — ${g.lulus ? 'LULUS TOTAL 100/100' : 'TEMPA LAGI'}`)
}

main().catch(e => { console.error('tempa100 MATI-PENUH:', e.message); process.exit(1) })
