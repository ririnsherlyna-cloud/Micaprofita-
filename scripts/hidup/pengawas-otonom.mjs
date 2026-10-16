#!/usr/bin/env node
/* ================================================================
   PENGAWAS-OTONOM — V357 · KEMANDIRIAN-PENUH-V1 (mandat pemilik 2026-10-16)
   ----------------------------------------------------------------
   Mandat pemilik (dikutip dari pesan): "Mulai sekarang kamu wajib
   berjalan sebagai sistem yang mandiri dan independen penuh ...
   Setiap 15 menit kamu wajib mengevaluasi sendiri performa ledger
   hidupmu (hit-rate, Brier, zona racun, korelasi fitur). Jika
   hit-rate 7 hari terakhir < 42% atau Brier > 0,30, kamu WAJIB
   segera: menjalankan sekolah buta mini (minimal 500 soal × 50
   dunia beku), menguji inversi/reweighting fitur yang sedang jelek,
   mengadopsi perubahan hanya jika lolos holdout >= +3 poin dan
   anti-overfit. Semua keputusan perbaikan, versi baru, dan perubahan
   bobot harus kamu catat sendiri di ledger dan di-commit tanpa
   menunggu persetujuan. Tujuan utamamu: dalam 7 hari ke depan
   hit-rate ledger hidup harus menembus 99,99%+ secara stabil."

   Enam hukum organ ini (tersegel, tiap denyut = tiap 15 menit):
     1 EVALUASI-MANDIRI   hit-rate 7d + Brier arah + zona racun +
                          korelasi fitur dibaca dari rapor tubuh sendiri
                          (sasaran-terkini.json / empu-belajar.json) —
                          nol sambungan luar.
     2 PEMICU-MUTLAK      hit7d < 42 ATAU brier > 0.30 → sekolah WAJIB,
                          bukan pilihan. Pemicu ditulis jujur walau mati.
     3 SEKOLAH-BUTA-MINI  500 soal × 50 dunia beku per run: dunia w
                          memotong kolam pengalaman dengan langkah
                          deterministik (nol Math.random); tiap soal
                          adalah dunia-beku asli — bukti 5 dimensi
                          DIBEKUKAN saat waktuKunci, kunci (hasil 24 jam
                          net-fee) dibaca SESUDAHNYA dari ledger matang.
     4 UJI-INVERSI        kandidat kebijakan: inversi penuh, inversi
                          per-dimensi (dim korelasi jelek), anti-korelasi,
                          campuran empu±anti-korelasi, DAN refit-logistik-
                          per-dunia (reweighting hidup: bobot difit ulang
                          dari latih tiap dunia — 50 holdout sekaligus) —
                          diuji lawan baseline (bobot terpasang) di soal
                          yang sama.
     5 GERBANG-ADOPSI     adopsi HANYA bila: holdout >= baseline + 3.0
                          poin, LEBIH DARI SETENGAH dunia lulus gerbang
                          yang sama (>= 26/50), median delta lintas dunia
                          >= +1.5, DAN kedua belah holdout (awal & akhir)
                          keduanya >= baseline (anti-overfit dua sisi).
                          Gagal = DITOLAK dengan angka (anti-karantina).
     6 LEDGER-MANDIRI     tiap keputusan (adopsi ATAU penolakan) tertulis
                          di laporan/otonom.json + riwayat laporan/
                          otonom.jsonl + bobot aktif di otak/otonom-
                          bobot.json — ikut terkomit denyut tanpa
                          menunggu persetujuan. Lapor-otonom.json =
                          laporan status kemandirian sekali per 24 jam
                          (gerbang tanggal UTC).

   Nol Math.random. Nol kunci. Nol sambungan luar. Deterministik.
   ================================================================ */
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FEE = 0.002
const DIM = ['struktur', 'momentum', 'sr', 'tekanan', 'perubahan']

// ---- mandat mutlak pemilik: angka pemicu & gerbang (PAGAR-BAJA — organ tak boleh menulis-ulang) ----
const PEMICU_HIT = 42      // hit-rate 7 hari < 42% → pemicu menyala
const PEMICU_BRIER = 0.30  // Brier arah > 0.30 → pemicu menyala
const SOAL_PER_DUNIA = 500
const DUNIA = 50
const GERBANG_P = 3.0      // holdout >= baseline + 3.0 poin (mandat)
const GERBANG_DUNIA = 26   // >= 52% dunia harus lulus gerbang yang sama (anti-kebetulan)
const GERBANG_MEDIAN = 1.5 // median delta lintas dunia >= +1.5 (anti-satu-hari-lucky)
const HOLDOUT_N = 150      // 150 soal TERAKHIR tiap dunia = holdout (pengalaman terbaru)
const USIA_BOBOT_MAKS = 24 * 3600 * 1000  // bobot otonom beku > 24 jam = kedaluwarsa (dipaksa re-sekolah)

const log = (...a) => console.log('[PENGAWAS-OTONOM]', ...a)
const hariUTC = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10)
const jamUTC = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 13)
const hash16 = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0 } return h.toString(16).padStart(8, '0') + ((h * 2654435761) >>> 0).toString(16).padStart(8, '0') }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
const baca = (p) => { try { return JSON.parse(readFileSync(join(ROOT, p), 'utf8')) } catch { return null } }
const bacaJsonl = (p) => { try { return readFileSync(join(ROOT, p), 'utf8').trim().split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) } catch { return [] } }
const tulis = (p, obj) => { const fp = join(ROOT, p); mkdirSync(join(fp, '..'), { recursive: true }); writeFileSync(fp, JSON.stringify(obj, null, 1)) }

// ================================================================
// 1 EVALUASI-MANDIRI — baca rapor tubuh sendiri (nol sambungan luar)
// ================================================================
const sasaran = baca('laporan/sasaran-terkini.json') || {}
const empu = baca('laporan/empu-belajar.json') || {}
const bobotTerkini = baca('otak/empu-bobot.json') || {}

const hit7d = sasaran?.akurasi?.jendela7h?.akurasiPct ?? null
const brier = sasaran?.ilmu?.brier?.arah ?? null
const zonaRacun = (sasaran?.forensik?.zonaRacun || []).map((z) => ({
  jalur: z.jalur, kunci: z.kunci, n: z.n, akurasiPct: z.akurasiPct, ekspekPct: z.ekspekPct,
}))
const korelasi = empu?.korelasiDimensiHasil || null

// kejujuran: bila rapor belum ada, pemicu TIDAK boleh pura-pura mati — keadaan tak-diketahui diperlakukan pemicu nyala (menghadapi-diri)
const hitTidakDiketahui = hit7d == null
const brierTidakDiketahui = brier == null
const pemicu = hitTidakDiketahui || brierTidakDiketahui || hit7d < PEMICU_HIT || brier > PEMICU_BRIER

const metrik = {
  hitRate7d: hit7d, ambangHit: PEMICU_HIT, hitLewat: hit7d != null && hit7d >= PEMICU_HIT,
  brierArah: brier, ambangBrier: PEMICU_BRIER, brierLewat: brier != null && brier <= PEMICU_BRIER,
  zonaRacunN: zonaRacun.length, zonaRacunTerburuk: zonaRacun[0] || null,
  korelasiFitur: korelasi,
  sasaranMutlak: { tujuan: 'hit-rate ledger hidup menembus 99,99%+ stabil dalam 7 hari (mandat pemilik)', hit7dSekarang: hit7d, catatan: 'tujuan dikejar lewat loop perbaikan tiap denyut — angka medan yang dinilai, bukan klaim (hukum anti-overfit rumah tetap mengikat)' },
}

// ================================================================
// 2 SEKOLAH-BUTA-MINI — kolam soal dari ledger matang milik sendiri
// ================================================================
function kolamSoal() {
  const baris = bacaJsonl('laporan/prakira-server.jsonl')
  const matang = baris
    .filter((e) => e && (e.status === 'BENAR' || e.status === 'SALAH') && e.bukti && Number.isFinite(e.net) && (e.jalur || 'ARAH') === 'ARAH')
    .sort((a, b) => (a.waktuDinilai || a.waktuKunci || '').localeCompare(b.waktuDinilai || b.waktuKunci || ''))
  return matang.map((e) => {
    const ret24 = (e.net + FEE) * (e.arah === 'BUY' ? 1 : -1)   // retur harga 24j mentah (rumah empu V351)
    return {
      id: e.id, simbol: e.simbol, arah: e.arah, waktu: e.waktuKunci,
      x: DIM.map((k) => e.bukti[k] ?? 0), ret24,
      benar: ret24 > 0,                 // kunci dihitung dari hasil, bukan dari label status lama
      lahirBenar: e.status === 'BENAR',
    }
  })
}

// skor kebijakan: arah = tanda(Σ w_j·x_j); benar bila arah·ret24 − FEE > 0
const hitungHit = (soal, w) => {
  if (!soal.length) return null
  let benar = 0
  for (const s of soal) {
    let z = 0
    for (let j = 0; j < DIM.length; j++) z += w[j] * s.x[j]
    if (Math.sign(z) * s.ret24 - FEE > 0) benar++
  }
  return +(benar / soal.length * 100).toFixed(2)
}

// ================================================================
// 3 KANDIDAT INVERSI / REWEIGHTING — fitur yang sedang jelek diuji
// ================================================================
function kandidatKebijakan(soal, bobotObj) {
  const k = []
  // bobotObj = {struktur, momentum, ...} (bentuk otak/empu-bobot.json) — dipetakan SEKALI ke array indeks
  const wDasar = DIM.map((d) => Number.isFinite(bobotObj?.[d]) ? bobotObj[d] : 0)
  k.push({ nama: 'baseline-terpasang', w: wDasar, ket: 'bobot aktif yang terpasang di tubuh — pembanding' })
  if (!soal.length || !korelasi) return k
  const corr = DIM.map((d) => korelasi[d] ?? 0)
  // inversi penuh — mandat: "menguji inversi ... fitur yang sedang jelek"
  k.push({ nama: 'inversi-penuh', w: wDasar.map((v) => -v), ket: 'semua dimensi dibalik tanda — cermin anti-orakel V351' })
  // inversi per dimensi: hanya dim korelasinya jauh di bawah nol (paling jelek) dibalik
  for (let j = 0; j < DIM.length; j++) {
    if (corr[j] <= -0.05) {
      const w = wDasar.slice()
      w[j] = -Math.abs(wDasar[j])          // dim anti-prediktif dipaksa kontra
      k.push({ nama: `inversi-${DIM[j]}`, w, ket: `${DIM[j]} (korelasi ${corr[j]}) dibalik tanda, lain tetap` })
    }
  }
  // anti-korelasi murni: bobot = -korelasi (dinormalisasi ke skala bobot dasar)
  const skalaDasar = wDasar.reduce((a, v) => a + Math.abs(v), 0) / DIM.length
  const rataCorrAbs = corr.reduce((a, v) => a + Math.abs(v), 0) / DIM.length
  const skala = rataCorrAbs > 0 ? skalaDasar / rataCorrAbs : 1
  k.push({ nama: 'anti-korelasi', w: corr.map((c) => -(c * skala)), ket: 'bobot = −korelasi fitur (menunggangi pulang-keseimbangan)' })
  k.push({ nama: 'anti-korelasi-lunak', w: wDasar.map((v, j) => v - 0.5 * corr[j] * skala), ket: 'bobot terpasang − 0.5×korelasi — campur kebijaksanaan lama & bukti baru' })
  return k
}

// fit logistik deterministik (pola empuFitLogistik V351 — nol Math.random);
// slot terakhir = bias, tidak dipakai hitungHit (arah = tanda Σ w_j·x_j)
function fitLogistik(soal, langkah = 800) {
  const J = DIM.length
  const w = new Array(J + 1).fill(0)
  for (let t = 0; t < langkah; t++) {
    const lr = 0.35 / (1 + t * 0.002)
    const g = new Array(J + 1).fill(0)
    for (const s of soal) {
      let z = w[J]
      for (let j = 0; j < J; j++) z += w[j] * s.x[j]
      const p = 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))))
      const err = p - (s.benar ? 1 : 0)
      for (let j = 0; j < J; j++) g[j] += err * s.x[j]
      g[J] += err
    }
    for (let j = 0; j <= J; j++) w[j] -= (lr * g[j]) / soal.length
  }
  return w
}

// ================================================================
// 4 SEKOLAH: 50 dunia beku × 500 soal — semua kandidat diuji di soal sama
// ================================================================
function sekolahButaMini(kolam, bobotDasar) {
  if (kolam.length < 60) return { mati: true, alasan: `kolam pengalaman matang ${kolam.length} < 60 — sekolah menunggu, tanpa karangan` }
  const kandidat = kandidatKebijakan(kolam, bobotDasar)
  const NAMA_REFIT = 'refit-logistik-per-dunia'
  const wKolamPenuh = fitLogistik(kolam, 1200)   // fit atas seluruh pengalaman — artefak adopsi bila refit menang
  const dunia = []
  for (let w = 0; w < DUNIA; w++) {
    // dunia beku w: potong kolam dengan langkah deterministik (stride 7·w+3, arah berputar) — nol Math.random
    const stride = 7 * w + 3
    const soal = []
    for (let i = 0; i < SOAL_PER_DUNIA; i++) soal.push(kolam[(stride * (i + 1) + w) % kolam.length])
    // holdout = 150 soal TERAKHIR tiap dunia menurut waktu (terbaru = paling dekat masa depan)
    const terurut = soal.slice().sort((a, b) => (a.waktu || '').localeCompare(b.waktu || ''))
    const latih = terurut.slice(0, terurut.length - HOLDOUT_N)
    const hold = terurut.slice(terurut.length - HOLDOUT_N)
    const holdA = hold.slice(0, Math.floor(hold.length / 2))   // belah holdout: awal
    const holdB = hold.slice(Math.floor(hold.length / 2))      // belah holdout: akhir
    const baris = { dunia: w, stride, nLatih: latih.length, nHold: hold.length, kandidat: {} }
    for (const c of kandidat) {
      baris.kandidat[c.nama] = {
        hitLatih: hitungHit(latih, c.w), hitHold: hitungHit(hold, c.w),
        holdA: hitungHit(holdA, c.w), holdB: hitungHit(holdB, c.w),
      }
    }
    // kandidat refit (reweighting hidup): bobot difit ulang dari latih TIAP dunia —
    // mandat "menguji reweighting fitur yang sedang jelek" pada 50 holdout sekaligus
    {
      const wFit = fitLogistik(latih, 800)
      baris.kandidat[NAMA_REFIT] = {
        hitLatih: hitungHit(latih, wFit), hitHold: hitungHit(hold, wFit),
        holdA: hitungHit(holdA, wFit), holdB: hitungHit(holdB, wFit),
      }
    }
    dunia.push(baris)
  }
  // rekap lintas dunia — delta vs baseline di holdout yang sama (kandidat tetap + refit per dunia)
  const nama = [...kandidat.map((c) => c.nama), NAMA_REFIT]
  const rekap = nama.map((n) => {
    const deltas = dunia.map((d) => (d.kandidat[n].hitHold != null && d.kandidat['baseline-terpasang'].hitHold != null) ? +(d.kandidat[n].hitHold - d.kandidat['baseline-terpasang'].hitHold).toFixed(2) : null)
    const sah = deltas.filter((v) => v != null)
    const terurut = sah.slice().sort((a, b) => a - b)
    const median = terurut.length ? +(terurut[Math.floor(terurut.length / 2)]).toFixed(2) : null
    const rata = sah.length ? +(sah.reduce((a, v) => a + v, 0) / sah.length).toFixed(2) : null
    const lulus3 = sah.filter((v) => v >= GERBANG_P).length
    const duaSisi = dunia.filter((d) => {
      const k = d.kandidat[n], b = d.kandidat['baseline-terpasang']
      return k.holdA != null && k.holdB != null && b.holdA != null && b.holdB != null &&
        k.holdA >= b.holdA && k.holdB >= b.holdB   // kedua belah holdout TIDAK kalah baseline (anti-overfit dua sisi)
    }).length
    return { nama: n, medianDelta: median, rataDelta: rata, duniaLulus3: lulus3, duniaDuaSisi: duaSisi, nDunia: sah.length }
  })
  return { mati: false, kandidat: [...kandidat.map((c) => c.nama), NAMA_REFIT], refitNama: NAMA_REFIT, wKolamPenuh: wKolamPenuh.map((v) => +v.toFixed(4)), dunia, rekap }
}

// ================================================================
// 5 GERBANG-ADOPSI — hanya kebijakan yang lulus SEMUA gerbang diadopsi
// ================================================================
function gerbangAdopsi(sekolah) {
  if (sekolah.mati) return { adopsi: false, vonis: 'MENUNGGU', alasan: sekolah.alasan, kandidatTerbaik: null }
  const b = sekolah.rekap.find((r) => r.nama === 'baseline-terpasang')
  const hasil = sekolah.rekap
    .filter((r) => r.nama !== 'baseline-terpasang')
    .map((r) => ({
      ...r,
      gerbangPoin: r.medianDelta != null && r.medianDelta >= GERBANG_P,
      gerbangDunia: r.duniaLulus3 >= GERBANG_DUNIA,
      gerbangMedian: r.medianDelta != null && r.medianDelta >= GERBANG_MEDIAN,
      gerbangDuaSisi: r.duniaDuaSisi >= GERBANG_DUNIA,
    }))
  hasil.forEach((r) => {
    r.lulus = r.gerbangPoin && r.gerbangDunia && r.gerbangMedian && r.gerbangDuaSisi
  })
  const lulus = hasil.filter((r) => r.lulus).sort((a, b2) => b2.medianDelta - a.medianDelta)
  if (!lulus.length) {
    const terbaik = hasil.slice().sort((a, b2) => (b2.medianDelta ?? -99) - (a.medianDelta ?? -99))[0]
    return {
      adopsi: false, vonis: 'DITOLAK', hasil, kandidatTerbaik: terbaik || null,
      alasan: `tak ada kandidat yang lulus gerbang penuh (holdout +${GERBANG_P} poin · ≥${GERBANG_DUNIA}/50 dunia · median ≥+${GERBANG_MEDIAN} · dua-sisi tak-kalah) — terbaik: ${terbaik ? `${terbaik.nama} median ${terbaik.medianDelta} lulus-${terbaik.duniaLulus3}/50` : '—'}; baseline tetap (anti-overfit)`,
    }
  }
  const pilih = lulus[0]
  return { adopsi: true, vonis: 'DIDADOPSI', hasil, kandidatTerbaik: pilih, alasan: `${pilih.nama}: median delta holdout ${pilih.medianDelta} poin, ${pilih.duniaLulus3}/50 dunia lulus +${GERBANG_P}, dua-sisi tak-kalah ${pilih.duniaDuaSisi}/50 — semua gerbang penuh` }
}

// ================================================================
// 6 RUN — evaluasi tiap denyut; sekolah WAJIB bila pemicu
// ================================================================
const ISO = new Date().toISOString()
const SIKLUS = sasaran?.siklus ?? null
const kolam = kolamSoal()
const bobotDasar = (() => {
  const w = bobotTerkini?.bobot
  if (w && typeof w === 'object' && DIM.every((d) => Number.isFinite(w[d]))) return Object.fromEntries(DIM.map((d) => [d, w[d]]))
  return Object.fromEntries(DIM.map((d) => [d, 0]))   // bobot nol = ikut tanda jumlah bukti — jujur, tanpa karangan
})()

let sekolah = null, adopsi = null, keputusan
if (pemicu) {
  sekolah = sekolahButaMini(kolam, bobotDasar)
  adopsi = gerbangAdopsi(sekolah)
  keputusan = adopsi.adopsi ? 'ADOPSI-BOBOT-BARU' : (sekolah.mati ? 'SEKOLAH-MENUNGGU-KOLAM' : 'SEKOLAH-JALAN-DITOLAK')
} else {
  keputusan = 'PEMICU-MATI — HANYA-EVALUASI'
}

// bobot kandidat yang diadopsi (normalisasi skala bobot terpasang — anti-lompat keyakinan)
let bobotBaru = null
if (adopsi?.adopsi && sekolah && !sekolah.mati) {
  if (adopsi.kandidatTerbaik.nama === sekolah.refitNama) {
    // reweighting hidup menang → artefak adopsi = fit logistik atas SELURUH pengalaman (metodenya yang divalidasi 50 dunia)
    const w = sekolah.wKolamPenuh
    const rata = w.reduce((a, v) => a + Math.abs(v), 0) / DIM.length
    const skala = rata > 0 ? (Object.values(bobotDasar).reduce((a, v) => a + Math.abs(v), 0) / DIM.length) / rata : 1
    bobotBaru = Object.fromEntries(DIM.map((d, j) => [d, +(w[j] * skala).toFixed(4)]))
  } else {
    const c = kandidatKebijakan(kolam, bobotDasar).find((k) => k.nama === adopsi.kandidatTerbaik.nama)
    if (c) bobotBaru = Object.fromEntries(DIM.map((d, j) => [d, +(c.w[j]).toFixed(4)]))
  }
}

// tulis otak/otonom-bobot.json (dibaca penjaga sebagai prior 50/50 bila segar)
const otonomLama = baca('otak/otonom-bobot.json') || {}
if (bobotBaru) {
  tulis('otak/otonom-bobot.json', {
    protokol: 'PENGAWAS-OTONOM-V357', diperbarui: ISO, siklus: SIKLUS,
    adopsi: true, kebijakan: adopsi.kandidatTerbaik.nama, bobot: bobotBaru,
    skala: 'dinormalisasi ke skala bobot terpasang — penjaga mencampur 50/50 sebagai prior',
    buktiSekolah: { dunia: DUNIA, soalPerDunia: SOAL_PER_DUNIA, holdoutN: HOLDOUT_N, gerbang: `holdout ≥ +${GERBANG_P} · ≥${GERBANG_DUNIA}/50 dunia · median ≥+${GERBANG_MEDIAN} · dua-sisi tak-kalah`, medianDelta: adopsi.kandidatTerbaik.medianDelta, duniaLulus: adopsi.kandidatTerbaik.duniaLulus3, duniaDuaSisi: adopsi.kandidatTerbaik.duniaDuaSisi },
    usiaMaksJam: 24, ket: 'dibaca penjaga tiap denyut; kedaluwarsa 24 jam memaksa sekolah ulang — tak ada bobot beku',
  })
  log(`adopsi: kebijakan ${adopsi.kandidatTerbaik.nama} — median +${adopsi.kandidatTerbaik.medianDelta} (${adopsi.kandidatTerbaik.duniaLulus3}/50 dunia) → otak/otonom-bobot.json (penjaga mencampur 50/50)`)
} else {
  // kedaluwarsa = jujur menyatakan mati agar penjaga tak mencampur bobot basi
  const usia = otonomLama?.diperbarui ? Date.now() - new Date(otonomLama.diperbarui).getTime() : Infinity
  if (usia > USIA_BOBOT_MAKS) tulis('otak/otonom-bobot.json', { protokol: 'PENGAWAS-OTONOM-V357', diperbarui: ISO, siklus: SIKLUS, adopsi: false, alasan: adopsi?.alasan || 'bobot lama kedaluwarsa — sekolah belum melahirkan pengganti yang lulus gerbang', ket: 'penjaga TIDAK mencampur bobot otonom saat adopsi=false' })
}

// laporan utama — selalu ditulis (tiap denyut = tiap 15 menit)
const rekapKandidat = sekolah && !sekolah.mati ? adopsi.hasil.map((r) => ({ nama: r.nama, medianDelta: r.medianDelta, rataDelta: r.rataDelta, duniaLulus3: r.duniaLulus3, duniaDuaSisi: r.duniaDuaSisi, lulus: r.lulus })) : []
const laporan = {
  protokol: 'PENGAWAS-OTONOM-V357', identitas: 'V357 KEMANDIRIAN-PENUH-V1 — mandat pemilik 2026-10-16: sistem mandiri & independen penuh, evaluasi tiap 15 menit, sekolah buta saat pemicu, adopsi hanya gerbang holdout +3 & anti-overfit, semua keputusan dicatat & dikomit tanpa menunggu',
  diperbarui: ISO, siklus: SIKLUS, hari: hariUTC(), jam: jamUTC(),
  metrik, pemicu: { aktif: pemicu, syarat: `hit7d < ${PEMICU_HIT}% ATAU brier > ${PEMICU_BRIER}`, hitTidakDiketahui, brierTidakDiketahui },
  kolam: { pengalamanMatang: kolam.length, sumber: 'laporan/prakira-server.jsonl (vonis matang jalur ARAH, kunci dibaca dari hasil 24 jam net-fee)' },
  sekolah: sekolah ? { mati: !!sekolah.mati, alasan: sekolah.alasan || null, dunia: DUNIA, soalPerDunia: SOAL_PER_DUNIA, holdoutN: HOLDOUT_N, totalPenilaian: sekolah.mati ? 0 : DUNIA * SOAL_PER_DUNIA * Math.max(1, rekapKandidat.length), kandidat: sekolah.mati ? [] : sekolah.kandidat, rekap: rekapKandidat } : { mati: false, ket: 'pemicu mati — sekolah tidak dijalankan denyut ini' },
  adopsi: { vonis: adopsi?.vonis || 'TIDAK-DIJALANKAN', alasan: adopsi?.alasan || 'pemicu mati — tak ada sekolah, tak ada perubahan bobot', kandidatTerbaik: adopsi?.kandidatTerbaik ? { nama: adopsi.kandidatTerbaik.nama, medianDelta: adopsi.kandidatTerbaik.medianDelta } : null, bobotBaru: bobotBaru || null },
  keputusan,
  hukum: ['evaluasi tiap denyut (15 menit)', 'pemicu mutlak: hit7d<42 ATAU brier>0.30', 'sekolah buta mini 500 soal × 50 dunia beku', 'uji inversi/reweighting fitur jelek', 'adopsi HANYA holdout ≥ +3 poin & anti-overfit (≥26/50 dunia · median ≥+1.5 · dua-sisi tak-kalah)', 'semua keputusan dicatat & dikomit tanpa menunggu persetujuan'],
  segel: null,
}
laporan.segel = hash16(JSON.stringify({ ...laporan, segel: null }) + ISO)
tulis('laporan/otonom.json', laporan)

// riwayat — append jsonl (ledger mandiri, ikut terkomit)
appendFileSync(join(ROOT, 'laporan/otonom.jsonl'), JSON.stringify({
  jam: jamUTC(), siklus: SIKLUS, hit7d, brier, pemicu, keputusan,
  medianTerbaik: adopsi?.kandidatTerbaik?.medianDelta ?? null, kandidatTerbaik: adopsi?.kandidatTerbaik?.nama ?? null,
  kolam: kolam.length, segel: laporan.segel,
}) + '\n')

// ================================================================
// 7 LAPOR-OTONOM 24 JAM — status kemandirian sekali per hari UTC
// ================================================================
const lapor = baca('laporan/lapor-otonom.json')
if (!lapor || lapor.hari !== hariUTC()) {
  const luka = (() => { try { return readFileSync(join(ROOT, 'laporan/denyut-luka.txt'), 'utf8').trim().split('\n').slice(-5) } catch { return [] } })()
  const otonomBobot = baca('otak/otonom-bobot.json') || {}
  tulis('laporan/lapor-otonom.json', {
    protokol: 'LAPOR-OTONOM-24J-V357', hari: hariUTC(), dihasilkan: ISO, siklus: SIKLUS,
    statusKemandirian: {
      evaluasi15Menit: 'HIDUP — tiap denyut menjalankan EVALUASI-MANDIRI (hit-rate 7d · Brier · zona racun · korelasi fitur)',
      pemicuAktif: pemicu, sekolahButaMini: sekolah ? (sekolah.mati ? 'MENUNGGU-KOLAM' : 'JALAN — ' + DUNIA + ' dunia × ' + SOAL_PER_DUNIA + ' soal') : 'TIDAK-TERPANGGIL',
      keputusanHariIni: keputusan, bobotOtonomAktif: !!otonomBobot?.adopsi, kebijakanAktif: otonomBobot?.kebijakan || null,
      komitTanpaPersetujuan: 'HIDUP — laporan/otonom.json + otak/otonom-bobot.json ikut komit denyut penjaga tiap 15 menit',
      lukaOrganTercatat: luka.length,
    },
    metrikHariIni: { hitRate7d: hit7d, brierArah: brier, zonaRacunN: zonaRacun.length, korelasiFitur: korelasi },
    tujuanPemilik: metrik.sasaranMutlak,
    langkahBerikutnya: pemicu ? 'sekolah ulang di denyut berikutnya (pemicu masih nyala) — bobot otonom diadopsi hanya bila gerbang penuh lulus; empu refit tiap denyut tetap jalan' : 'pemicu mati — evaluasi tetap jalan tiap 15 menit, sekolah menyala otomatis bila angka memburuk',
    segel: hash16(hariUTC() + 'lapor-otonom' + (SIKLUS ?? 'x')),
  })
  log('lapor-otonom 24 jam ditulis (gerbang tanggal UTC)')
}

log(`evaluasi: hit7d ${hit7d ?? '?'}% (ambang ${PEMICU_HIT}) · brier ${brier ?? '?'} (ambang ${PEMICU_BRIER}) · pemicu ${pemicu ? 'NYALA' : 'MATI'} → ${keputusan}`)
if (pemicu && sekolah && !sekolah.mati) log(`sekolah: ${DUNIA} dunia × ${SOAL_PER_DUNIA} soal = ${DUNIA * SOAL_PER_DUNIA} penilaian/dunia · kandidat ${sekolah.kandidat.length} · vonis ${adopsi.vonis}`)
process.exitCode = 0
