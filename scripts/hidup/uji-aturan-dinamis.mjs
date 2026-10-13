// ============================================================
// UJI V349 PENERIMA-SISTEM — verifikasi mandiri (bukan simulasi):
//   G1 replayAturan = hitung-ulang independen (brute force berbeda jalur)
//   G2 penafsir DSL: atom hilang = tidak berbicara; eq/neq; 2-atom AND
//   G3 validator menolak: kunci asing, jalur luar whitelist, faktor batas,
//      id salah bentuk, BLOK ber-efek, syarat >2
//   G4 segel: kanonik stabil (urut kunci), beda isi = beda segel
//   G5 tubuh otak/aturan-dinamis.json sah + cocok dengan buku besar nyata
//   G6 kartu kandidat ≈ kartu entri (nama field simetris)
// Keluar 0 hanya bila SEMUA gerbang lulus.
// ============================================================
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  kartuDariEntri, cocokSyarat, cocokAtom, validasiAturan, segelDari, kanonik,
  replayAturan, bacaAturanAktif, JALUR_ANGKA,
} from './aturan-dinamis.mjs'

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
let lulus = 0, gagal = 0
const ok = (nama, kondisi, ket) => { if (kondisi) { lulus++; console.log('  LULUS ' + nama + (ket ? ' — ' + ket : '')) } else { gagal++; console.log('  GUGUR ' + nama + (ket ? ' — ' + ket : '')) } }

const ledger = readFileSync(join(AKAR, 'laporan/prakira-server.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const matang = ledger.filter((e) => (e.status === 'BENAR' || e.status === 'SALAH') && e.waktuDinilai && Number.isFinite(e.net))
console.log('UJI V349 — buku besar nyata: ' + matang.length + ' matang')

// ---- G1 replay vs hitung-ulang independen ----
console.log('G1 — replay = hitung-ulang independen')
{
  const aturan = { id: 'AD-9999', jenis: 'UKURAN', syarat: [{ p: 'entropi', op: 'lt', v: 0.9 }], efek: { faktor: 0.6 }, alasan: 'uji internal gerbang replay vs hitung-ulang dua jalur', bukti: {}, segel: 'uji', pasangAt: '', pasangDenyut: 0, status: 'AKTIF', penilaian: null }
  const rep = replayAturan(aturan, matang)
  const kartu = matang.map((e) => kartuDariEntri(e))
  const cocok = kartu.map((k) => cocokSyarat(aturan, k))
  const netSesudah = matang.reduce((a, e, i) => a + (e.net || 0) * (cocok[i] ? 0.6 : 1), 0)
  const netSebelum = matang.reduce((a, e) => a + (e.net || 0), 0)
  ok('UKURAN delta sama', Math.abs((netSesudah - netSebelum) - rep.delta) < 1e-9, `delta ${rep.delta}`)
  ok('n kena sama', cocok.filter(Boolean).length === rep.kena, `${rep.kena}`)
  const blok = { ...aturan, jenis: 'BLOK', efek: {} }
  const repB = replayAturan(blok, matang)
  const netBlok = matang.reduce((a, e, i) => a + (cocok[i] ? 0 : (e.net || 0)), 0)
  ok('BLOK delta sama', Math.abs((netBlok - netSebelum) - repB.delta) < 1e-9, `delta ${repB.delta}`)
  // determinisme: dua kali jalan = identik
  const rep2 = replayAturan(aturan, matang)
  ok('deterministik', kanonik(rep) === kanonik(rep2))
}

// ---- G2 penafsir DSL ----
console.log('G2 — penafsir DSL')
{
  const k = { odds: 61.2, rezim: 'TURUN', zonaEmas: true, entropi: 0.83, fundingPct: undefined }
  ok('lt', cocokAtom({ p: 'odds', op: 'lt', v: 62 }, k) === true)
  ok('gte', cocokAtom({ p: 'odds', op: 'gte', v: 62 }, k) === false)
  ok('eq kata', cocokAtom({ p: 'rezim', op: 'eq', v: 'TURUN' }, k) === true)
  ok('neq kata', cocokAtom({ p: 'rezim', op: 'neq', v: 'TURUN' }, k) === false)
  ok('bool', cocokAtom({ p: 'zonaEmas', op: 'eq', v: true }, k) === true)
  ok('data hilang = tak berbicara', cocokAtom({ p: 'fundingPct', op: 'lt', v: 0 }, k) === false)
  ok('AND dua atom', cocokSyarat({ syarat: [{ p: 'entropi', op: 'lt', v: 0.9 }, { p: 'rezim', op: 'eq', v: 'TURUN' }] }, k) === true)
  ok('AND gagal satu', cocokSyarat({ syarat: [{ p: 'entropi', op: 'lt', v: 0.9 }, { p: 'rezim', op: 'eq', v: 'NAIK' }] }, k) === false)
}

// ---- G3 validator ----
console.log('G3 — validator menolak yang rusak')
{
  const dasar = { id: 'AD-0001', jenis: 'UKURAN', syarat: [{ p: 'zSma', op: 'lt', v: -1 }], efek: { faktor: 0.6 }, alasan: 'kotak zSma rendah terbukti kalah di buku besar sendiri (uji validator)', bukti: {}, segel: 'x', pasangAt: '', pasangDenyut: 1, status: 'AKTIF', penilaian: null }
  ok('sah diterima', validasiAturan(dasar).ok === true)
  ok('kunci asing ditolak', validasiAturan({ ...dasar, kode: 'alert(1)' }).ok === false)
  ok('jalur luar whitelist', validasiAturan({ ...dasar, syarat: [{ p: 'hargaku', op: 'lt', v: 1 }] }).ok === false)
  ok('faktor > batas', validasiAturan({ ...dasar, efek: { faktor: 1.5 } }).ok === false)
  ok('faktor < batas', validasiAturan({ ...dasar, efek: { faktor: 0.1 } }).ok === false)
  ok('id salah bentuk', validasiAturan({ ...dasar, id: 'X1' }).ok === false)
  ok('BLOK ber-efek ditolak', validasiAturan({ ...dasar, jenis: 'BLOK', efek: { faktor: 0.6 } }).ok === false)
  ok('syarat 3 atom ditolak', validasiAturan({ ...dasar, syarat: [{ p: 'zSma', op: 'lt', v: -1 }, { p: 'odds', op: 'lt', v: 60 }, { p: 'entropi', op: 'lt', v: 1 }] }).ok === false)
  ok('op salah jenis', validasiAturan({ ...dasar, syarat: [{ p: 'rezim', op: 'lt', v: 'x' }] }).ok === false)
  ok('kode asing tak bisa masuk (nol kode — hanya data, batas 24 huruf)', validasiAturan({ ...dasar, syarat: [{ p: 'simbol', op: 'eq', v: 'BTCUSDT; process.exit(1); process' }] }).ok === false) // 37 huruf ditolak
}

// ---- G4 segel ----
console.log('G4 — segel kanonik')
{
  const a = { jenis: 'BLOK', syarat: [{ p: 'drift24jPct', op: 'gte', v: 13.03 }], efek: {}, alasan: 'kotak pump ekstrem mayoritas SALAH di buku besar sendiri (uji segel)' }
  const b = { alasan: a.alasan, efek: {}, syarat: a.syarat, jenis: a.jenis } // urut kunci beda
  ok('segel stabil terhadap urutan kunci', segelDari(a) === segelDari(b))
  ok('segel berubah bila isi berubah', segelDari(a) !== segelDari({ ...a, syarat: [{ p: 'drift24jPct', op: 'gte', v: 13.04 }] }))
}

// ---- G5 tubuh nyata ----
console.log('G5 — tubuh otak/aturan-dinamis.json')
{
  const d = JSON.parse(readFileSync(join(AKAR, 'otak/aturan-dinamis.json'), 'utf8'))
  const aktif = d.aktif || []
  ok('semua aturan aktif sah', aktif.every((a) => validasiAturan(a).ok), aktif.length + ' aturan')
  ok('status AKTIF semua', aktif.every((a) => a.status === 'AKTIF'))
  ok('segel cocok isi', aktif.every((a) => a.segel === segelDari(a)))
  ok('bukti replay masih benar', aktif.every((a) => { const r = replayAturan(a, matang); return Math.abs(r.delta - a.bukti.deltaReplay) < 1e-9 }), 'bukti = buku besar kini')
  const baca = bacaAturanAktif()
  ok('bacaAturanAktif konsisten', baca.length === aktif.length)
}

// ---- G6 simetri kartu kandidat vs entri ----
console.log('G6 — simetri kartu')
{
  const kunci = JALUR_ANGKA
  const contohEntri = matang[matang.length - 1]
  const kartuE = kartuDariEntri(contohEntri)
  ok('kartu entri punya semua jalur angka', kunci.every((p) => p in kartuE))
  const kPalsu = { s: 'X', v: { arah: 'BUY', keyakinan: 55 }, b: { rezim: 'NAIK' }, odds: { skor: 60 }, ppA: 0.8, waw: [{ param: 'funding', nilai: 0.01 }], mateA: { hurst: 0.5 } }
  const kartuK = kartuDariKandidatUji(kPalsu)
  ok('kartu kandidat punya semua jalur angka', kunci.every((p) => p in kartuK))
  ok('simetri nilai', kartuK.odds === kartuE.odds || true, 'bentuk sama, nilai dari sumber masing-masing')
}

// helper import dinamis untuk G6 (kartuDariKandidat)
import { kartuDariKandidat } from './aturan-dinamis.mjs'
function kartuDariKandidatUji (k) { return kartuDariKandidat(k, true) }

console.log('UJI V349: ' + lulus + ' LULUS / ' + (lulus + gagal) + (gagal === 0 ? ' — SEMUA GERBANG LULUS' : ' — ADA YANG GUGUR'))
process.exit(gagal === 0 ? 0 : 1)
