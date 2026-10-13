// ============================================================
// ATURAN-DINAMIS (V349 PENERIMA-SISTEM) — modul bersama untuk
// aturan yang MAKHLUK TULIS SENDIRI dari buku besarnya.
//
// Hukum rumah yang dipegang modul ini:
//   • NOL Math.random — penambangan & penilaian 100% deterministik.
//   • NOL karangan — setiap angka bukti dihitung dari
//     laporan/prakira-server.jsonl (buku besar vonis nyata).
//   • DSL SEMPIT & WHITELIST — makhluk menulis ISI aturan (syarat &
//     efek), bukan kode; penafsir tetap milik tubuh yang tersegel.
//     Jalur tak dikenal = TOLAK (ala k3_cfg.h: config setengah-paham
//     melahirkan sistem yang jalan tapi salah arsitektur).
//   • IKAT SAAT KUNCI — aturan menutup/menyusutkan kandidat ARAH
//     sebelum odds-threshold; slot eksplorasi/peneliti DIKECUALIKAN
//     (hukum ANTI-DIAM V269: yang belajar tak pernah dihentikan).
//   • DINILAI MEDAN — tiap denyut aturan di-replay ke buku besar;
//     yang berbalik merugikan DIBATALKAN sendiri dengan angka.
// ============================================================
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

// ---- whitelist jalur DSL — nama SAMA di kartu kandidat & entri buku besar ----
export const JALUR_ANGKA = ['keyakinanMentah', 'odds', 'probPasar', 'fundingPct',
  'hurst', 'halfLife', 'drift24jPct', 'zSma', 'entropi', 'volParkPct']
export const JALUR_KATA = ['simbol', 'arah', 'jalur', 'rezim']
export const JALUR_BOOL = ['zonaEmas']
export const OPS_ANGKA = ['lt', 'lte', 'gt', 'gte']
export const OPS_KATA = ['eq', 'neq']
export const JENIS = ['BLOK', 'UKURAN']

export const FAKTOR_MIN = 0.4
export const FAKTOR_MAKS = 0.8
export const MAKSAKTIF = 8
export const MAKS_BLOK = 3
export const N_MIN = 8              // sekolah medan: kotak < n ini tak sah jadi aturan
export const DELTA_MIN = 0.005      // replay wajib menyelamatkan ≥ 0,5% kumulatif
export const JENDELA_TERBURUK = -0.004 // tak boleh menghancurkan satu jendela waktu
export const HIT_MAKS_BLOK = 0.40   // BLOK hanya utk kotak yang mayoritas SALAH
export const HIT_MAKS_UKURAN = 0.45 // UKURAN menyusutkan kotak kalah-dominan
export const KEDALUWARSA_DENYUT = 96 // BLOK usang setelah 24 jam — ditambang ulang bila masih buruk

// ---- pembaca kartu: buku besar ----
export function kartuDariEntri (e) {
  return {
    simbol: e.simbol, arah: e.arah, jalur: e.jalur || 'ARAH', rezim: e.rezim,
    keyakinanMentah: angka(e.keyakinanMentah), odds: angka(e.odds && e.odds.skor),
    probPasar: angka(e.probPasar), zonaEmas: e.zonaEmas === true,
    fundingPct: angka(e.derivatif && e.derivatif.fundingPct),
    hurst: angka(e.mate && e.mate.hurst), halfLife: angka(e.mate && e.mate.halfLife),
    drift24jPct: angka(e.mate && e.mate.drift24jPct), zSma: angka(e.mate && e.mate.zSma),
    entropi: angka(e.mate && e.mate.entropi), volParkPct: angka(e.mate && e.mate.volParkPct),
  }
}
// ---- pembaca kartu: kandidat hidup sebelum kunci (nama field identik) ----
export function kartuDariKandidat (k, zonaEmas) {
  const m = k.mateA || {}
  return {
    simbol: k.s, arah: k.v && k.v.arah, jalur: 'ARAH', rezim: k.b && k.b.rezim,
    keyakinanMentah: angka(k.v && k.v.keyakinan), odds: angka(k.odds && k.odds.skor),
    probPasar: angka(k.ppA), zonaEmas: zonaEmas === true,
    fundingPct: angka(Array.isArray(k.waw) ? (k.waw.find((p) => p.param === 'funding') || {}).nilai : undefined),
    hurst: angka(m.hurst), halfLife: angka(m.halfLife), drift24jPct: angka(m.drift24jPct),
    zSma: angka(m.zSma), entropi: angka(m.entropi), volParkPct: angka(m.volParkPct),
  }
}
const angka = (x) => (typeof x === 'number' && Number.isFinite(x)) ? x : undefined

// ---- penafsir DSL ----
export function nilaiPath (kartu, p) { return kartu[p] }
export function cocokAtom (atom, kartu) {
  if (!atom || !atom.p || !atom.op) return false
  const v = nilaiPath(kartu, atom.p)
  if (atom.op === 'eq' || atom.op === 'neq') {
    if (v === undefined) return false
    const sama = v === atom.v
    return atom.op === 'eq' ? sama : !sama
  }
  if (typeof v !== 'number') return false // data hilang → atom tak berbicara (jujur, bukan nol karangan)
  switch (atom.op) {
    case 'lt': return v < atom.v
    case 'lte': return v <= atom.v
    case 'gt': return v > atom.v
    case 'gte': return v >= atom.v
    default: return false
  }
}
export function cocokSyarat (aturan, kartu) {
  const s = aturan && Array.isArray(aturan.syarat) ? aturan.syarat : null
  if (!s || !s.length || s.length > 2) return false
  return s.every((a) => cocokAtom(a, kartu))
}

// ---- validator: skema ketat, kunci asing = TOLAK ----
export function validasiAturan (a) {
  const tolak = (alasan) => ({ ok: false, alasan })
  if (!a || typeof a !== 'object') return tolak('bukan objek')
  const kunciSah = ['id', 'jenis', 'syarat', 'efek', 'alasan', 'bukti', 'segel', 'pasangAt', 'pasangDenyut', 'status', 'penilaian', 'versi']
  for (const k of Object.keys(a)) if (!kunciSah.includes(k)) return tolak('kunci asing: ' + k)
  if (typeof a.id !== 'string' || !/^AD-\d{4,}$/.test(a.id)) return tolak('id tak sah')
  if (!JENIS.includes(a.jenis)) return tolak('jenis tak dikenal: ' + a.jenis)
  if (!Array.isArray(a.syarat) || a.syarat.length < 1 || a.syarat.length > 2) return tolak('syarat 1-2 atom')
  for (const atom of a.syarat) {
    if (!atom || typeof atom !== 'object') return tolak('atom rusak')
    if (JALUR_ANGKA.includes(atom.p)) {
      if (!OPS_ANGKA.includes(atom.op)) return tolak('op tak sah utk angka: ' + atom.op)
      if (typeof atom.v !== 'number' || !Number.isFinite(atom.v)) return tolak('nilai angka tak sah')
    } else if (JALUR_KATA.includes(atom.p)) {
      if (!OPS_KATA.includes(atom.op)) return tolak('op tak sah utk kata: ' + atom.op)
      if (typeof atom.v !== 'string' || !atom.v.length || atom.v.length > 24) return tolak('nilai kata tak sah')
    } else if (JALUR_BOOL.includes(atom.p)) {
      if (atom.op !== 'eq') return tolak('bool hanya eq')
      if (typeof atom.v !== 'boolean') return tolak('nilai bool tak sah')
    } else return tolak('jalur di luar whitelist: ' + atom.p)
  }
  if (a.jenis === 'UKURAN') {
    const f = a.efek && a.efek.faktor
    if (typeof f !== 'number' || f < FAKTOR_MIN || f > FAKTOR_MAKS) return tolak('faktor di luar batas')
  } else if (a.efek && Object.keys(a.efek).length) return tolak('BLOK tanpa efek')
  if (typeof a.alasan !== 'string' || a.alasan.length < 20 || a.alasan.length > 400) return tolak('alasan 20-400 huruf')
  if (!a.bukti || typeof a.bukti !== 'object') return tolak('bukti hilang')
  return { ok: true }
}

// ---- segel: sha256 kanonik (kunci terurut) — 16 hex pertama ----
export function kanonik (x) {
  if (x === null || typeof x !== 'object') return JSON.stringify(x)
  if (Array.isArray(x)) return '[' + x.map(kanonik).join(',') + ']'
  return '{' + Object.keys(x).sort().map((k) => JSON.stringify(k) + ':' + kanonik(x[k])).join(',') + '}'
}
export function segelDari (a) {
  const inti = { jenis: a.jenis, syarat: a.syarat, efek: a.efek || {}, alasan: a.alasan }
  return createHash('sha256').update(kanonik(inti)).digest('hex').slice(0, 16)
}

// ---- statistik kotak ----
export function statistikKotak (rows) {
  const n = rows.length
  const benar = rows.filter((r) => r.e.status === 'BENAR').length
  const netSum = rows.reduce((a, r) => a + (r.e.net || 0), 0)
  const pos = rows.filter((r) => (r.e.net || 0) > 0).reduce((a, r) => a + r.e.net, 0)
  const neg = rows.filter((r) => (r.e.net || 0) <= 0).reduce((a, r) => a + r.e.net, 0)
  return { n, hitPct: n ? +(benar / n * 100).toFixed(1) : 0, netSum: +netSum.toFixed(5), pf: neg < 0 ? +(pos / -neg).toFixed(3) : null }
}

// ---- REPLAY: satu aturan atas buku besar matang (kronologis) ----
// net = hasil nyata per posisi (fraksi). UKURAN f = eksposur × f → kontribusi net × f.
// BLOK = vonis itu tak pernah terkunci → keluar dari buku.
export function replayAturan (aturan, matang) {
  const rows = matang
    .filter((e) => e.waktuDinilai && (e.status === 'BENAR' || e.status === 'SALAH'))
    .map((e) => ({ e, k: kartuDariEntri(e) }))
    .sort((a, b) => String(a.e.waktuDinilai).localeCompare(String(b.e.waktuDinilai)))
  const st = statistikKotak(rows)
  const jendela = (arr) => {
    const q = Math.max(1, Math.ceil(arr.length / 4))
    return [0, 1, 2, 3].map((i) => statistikKotak(arr.slice(i * q, (i + 1) * q)))
  }
  const sebelum = { ...st, jendela: jendela(rows) }
  const kena = rows.filter((r) => cocokSyarat(aturan, r.k))
  let sisa
  if (aturan.jenis === 'BLOK') sisa = rows.filter((r) => !cocokSyarat(aturan, r.k))
  else {
    const f = aturan.efek && aturan.efek.faktor
    sisa = rows.map((r) => cocokSyarat(aturan, r.k) ? { e: { ...r.e, net: (r.e.net || 0) * f }, k: r.k } : r)
  }
  const sesudah = { ...statistikKotak(sisa), jendela: jendela(sisa) }
  const delta = +(sesudah.netSum - sebelum.netSum).toFixed(5)
  const jendelaDelta = sebelum.jendela.map((w, i) => +((sesudah.jendela[i] ? sesudah.jendela[i].netSum : 0) - w.netSum).toFixed(5))
  return {
    sebelum, sesudah, kena: kena.length, delta, jendelaDelta,
    lulus: kena.length >= N_MIN && delta >= DELTA_MIN &&
      (sesudah.pf === null ? true : (sebelum.pf === null ? true : sesudah.pf >= sebelum.pf)) &&
      Math.min(...jendelaDelta) >= JENDELA_TERBURUK &&
      kena.length / rows.length <= 0.25,
  }
}

// ---- baca aturan aktif dari tubuh ----
export function bacaAturanAktif () {
  const p = join(AKAR, 'otak/aturan-dinamis.json')
  try {
    if (!existsSync(p)) return []
    const d = JSON.parse(readFileSync(p, 'utf8'))
    if (!Array.isArray(d.aktif)) return []
    return d.aktif.filter((a) => validasiAturan(a).ok && a.status === 'AKTIF')
  } catch { return [] } // tubuh rusak → nol aturan (jujur, denyut tetap jalan)
}
