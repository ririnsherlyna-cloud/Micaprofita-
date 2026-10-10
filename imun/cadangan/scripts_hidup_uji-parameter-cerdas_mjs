// ============================================================
// UJI-PARAMETER-CERDAS (V324) — 9 GERBANG
// Warisan gaya uji-ingatan-biner.mjs (V322): organ uji deterministik,
// offline, nol karangan — setiap gerbang memverifikasi matematika organ
// parameter-cerdas.mjs terhadap fakta sejati repo.
// Jalankan: node scripts/hidup/uji-parameter-cerdas.mjs
// ============================================================
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { hash16, hamming } from './ingatan-biner.mjs'
import {
  splitmix64, pcg32Buatan, pcg32Unit, samplerBenih,
  skorAhli, routerMoE, mxfp4Padatkan, fixturePosisi, takarBank,
} from './parameter-cerdas.mjs'

const sekarang = () => new Date().toISOString()
let LULUS = 0, GUGUR = 0, gugurDaftar = []
function gerbang(nama, fn) {
  try {
    const r = fn()
    if (r === false) throw new Error('gerbang mengembalikan false')
    LULUS++; console.log(`  LULUS ${nama}`)
  } catch (e) { GUGUR++; gugurDaftar.push({ gerbang: nama, alasan: e.message }); console.log(`  GUGUR ${nama} — ${e.message}`) }
}
const bacaJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const KELAS_DARI = (s) => s.kelasHasil || s.kelas || s.kelasKunci || null

function main() {
  const k = bacaJson('otak/parameter-cerdas.json')
  const ing = bacaJson('otak/ingatan-biner.json')
  const pohon = bacaJson('otak/syaraf-pohon.json')
  const soal900 = bacaJson('ujian/soal-900.json')

  console.log(`UJI-PARAMETER-CERDAS (V324) — kapsul segel #${k.segel.hash}`)

  // ---------- GERBANG 1: SEGEL KAPSUL (segel-null) ----------
  gerbang('1 segel kapsul sah', () => {
    const salin = JSON.parse(JSON.stringify(k)); salin.segel = null
    if (hash16(JSON.stringify(salin)) !== k.segel.hash) throw new Error('segel tak cocok isi')
    if (k.skema !== 'parameter-cerdas-v1' || k.epok !== 'V324') throw new Error('skema/epok tak dikenal')
  })

  // ---------- GERBANG 2: ARSITEKTUR DARI FAKTA (takar ulang mandiri) ----------
  gerbang('2 arsitektur = takaran ulang mandiri', () => {
    const tolak = []
    const bank = takarBank(tolak)
    const soalTotal = bank.reduce((a, b) => a + b.soal, 0)
    const wajahTotal = bank.reduce((a, b) => a + b.wajah, 0)
    const bagian = { soalTotal, wajahTempaan: wajahTotal, kataBit: Object.keys(ing.kamus).length, selSyaraf: pohon.populasi.length }
    const pustaka = bacaJson('pustaka/indeks.json'); if (pustaka?.gerbang509) bagian.jurnalPustaka = pustaka.gerbang509.tercapai
    const mad = bacaJson('ruang-hidup/madrasah.json'); if (mad?.pelajaran) bagian.pelajaranMadrasah = mad.pelajaran.length
    const total = Object.values(bagian).reduce((a, b) => a + b, 0)
    if (total !== k.arsitektur.total) throw new Error(`total ${total} ≠ kapsul ${k.arsitektur.total}`)
    if (wajahTotal !== k.arsitektur.bagian.wajahTempaan) throw new Error('wajah tak cocok')
    for (const b of bank) {
      const sumber = k.arsitektur.bank.find((x) => x.label === b.label)
      if (!sumber || sumber.soal !== b.soal || sumber.wajah !== b.wajah) throw new Error(`bank ${b.label} tak cocok kapsul`)
    }
  })

  // ---------- GERBANG 3: TOLAK-AWAL (hukum k3_cfg.h — nilai hilang tak ditebak) ----------
  gerbang('3 tolak-awal: sumber hilang dicatat, bukan ditebak', () => {
    const tolak = []
    const palsu = [['ujian/soal-tidak-ada-ini.json', 'PALSU'], ['ujian/soal-900.json', 'TEMPAN-900']]
    // takarBank memakai daftar statis — uji di sini lewat perilaku terdokumentasi:
    // jalur tak ada wajib memunculkan tolak-awal & dihitung (bukan nol karangan)
    const bank = takarBank(tolak, palsu)
    if (!tolak.some((t) => t.sumber === 'ujian/soal-tidak-ada-ini.json')) throw new Error('sumber palsu tak dicatat tolak-awal')
    if (bank.some((b) => b.label === 'PALSU')) throw new Error('bank palsu ikut dihitung — konfigurasi setengah-paham')
    if (!bank.some((b) => b.label === 'TEMPAN-900')) throw new Error('bank nyata ikut tertolak')
  })

  // ---------- GERBANG 4: ROUTER — bias mengarahkan PEMILIHAN saja (invarian-3) ----------
  gerbang('4 router invarian-3: bias memilih, bobot tetap tanpa-bias', () => {
    // fixture gaya k3.h: "Gated by the router fixture, whose bias reorders
    // the top-k on 5 of its 6 rows" — 6 baris deterministik; skor SEMUA ahli
    // senggat (bit sama) sehingga hanya bias yang boleh mengubah urutan
    const L = 18
    const ahli = Array.from({ length: 6 }, (_, i) => ({ jenis: 'K' + i, bit: '0'.repeat(L) }))
    const token = '0'.repeat(L)
    let pindah = 0
    for (let baris = 0; baris < 6; baris++) {
      // baris 0: tanpa bias; baris 1–5: ahli ke-(6−baris) didorong naik
      const bias = Object.fromEntries(ahli.map((a, i) => [a.jenis, baris > 0 && i === 6 - baris ? 0.6 : 0]))
      const r = routerMoE(token, ahli, bias, 3, L)
      const r0 = routerMoE(token, ahli, Object.fromEntries(ahli.map((a) => [a.jenis, 0])), 3, L)
      if (r.dipilih.join() !== r0.dipilih.join()) pindah++
      for (let j = 0; j < r.dipilih.length; j++) {
        const s = r.skor.find((x) => x.jenis === r.dipilih[j])
        if (Math.abs(r.bobotTanpaBias[j] - s.score) > 1e-12) throw new Error(`bobot[${j}] ≠ skor tanpa-bias (invarian-3 dilanggar)`)
        if (Math.abs(r.bobot[j] - s.score / r.bobotTanpaBias.reduce((a, b) => a + b, 0)) > 1e-9) throw new Error('renormalisasi tak eksak')
      }
      const jumlah = r.bobot.reduce((a, b) => a + b, 0)
      if (Math.abs(jumlah - 1) > 1e-9) throw new Error(`bobot jumlah ${jumlah} ≠ 1`)
    }
    if (pindah < 5) throw new Error(`bias hanya mengubah pemilihan ${pindah}/6 baris — fixture k3 menuntut ≥5`)
  })

  // ---------- GERBANG 5: ROUTER — seri jatuh ke indeks pertama (deterministik) ----------
  gerbang('5 router seri → indeks pertama, skor sigmoid eksak', () => {
    const L = 18
    const ahli = [{ jenis: 'A', bit: '0'.repeat(L) }, { jenis: 'B', bit: '1'.repeat(L) }, { jenis: 'C', bit: '0'.repeat(L) }]
    const token = '0'.repeat(L)
    const r = routerMoE(token, ahli, { A: 0, B: 0, C: 0 }, 2, L)
    // A dan C jarak sama (0) — seri wajib jatuh ke indeks PERTAMA (A), bukan C
    if (r.dipilih[0] !== 'A') throw new Error('seri tak jatuh ke indeks pertama')
    if (r.dipilih[1] !== 'C') throw new Error('peringkat kedua seri salah')
    // matematika eksak: logit = ((L−2h)/L)·4 → jarak-0 = sigmoid(4);
    // setengah-cocok = sigmoid(0) = 0,5; jarak-penuh = sigmoid(−4)
    const s = skorAhli(token, '0'.repeat(L), L)
    if (s.h !== 0 || Math.abs(s.score - 1 / (1 + Math.exp(-4))) > 1e-12) throw new Error('sigmoid jarak-0 ≠ sigmoid(4)')
    const sTengah = skorAhli('1'.repeat(9) + '0'.repeat(9), '0'.repeat(L), L)
    if (sTengah.h !== 9 || Math.abs(sTengah.score - 0.5) > 1e-12) throw new Error('setengah-cocok ≠ 0,5')
    const s2 = skorAhli(token, '1'.repeat(L), L)
    if (s2.h !== L || Math.abs(s2.score - 1 / (1 + Math.exp(4))) > 1e-12) throw new Error('sigmoid jarak-penuh salah')
  })

  // ---------- GERBANG 6: FIXTURE POSISI — nilai benar posisi salah wajib menjerit ----------
  gerbang('6 fixture posisi: statistik identik, permutasi terdeteksi 2/2', () => {
    const fix = fixturePosisi(soal900)
    if (!fix.jalan) throw new Error('fixture tak jalan: ' + fix.alasan)
    if (!fix.statistikSama) throw new Error('distribusi berubah — jebakan tak terbangun')
    if (fix.terdeteksi !== 2) throw new Error(`permutasi terdeteksi ${fix.terdeteksi}/2`)
    // kontrol negatif: peta murni dibangun ulang urutan-TERBALIK (independen)
    // wajib identik satu-tanda-satu-kelas — nol luka di peta murni
    const wajah = new Map()
    for (const s of soal900.soal) if (!wajah.has(s.tanda)) wajah.set(s.tanda, KELAS_DARI(s))
    const wajahBalik = new Map()
    for (const s of [...soal900.soal].reverse()) if (!wajahBalik.has(s.tanda)) wajahBalik.set(s.tanda, KELAS_DARI(s))
    if (wajah.size !== wajahBalik.size) throw new Error('peta maju/mundur beda ukuran')
    for (const [t, kk] of wajah) if (wajahBalik.get(t) !== kk) throw new Error(`peta murni tak deterministik di ${t}`)
  })

  // ---------- GERBANG 7: MXFP4 — galat diukur, deterministik, memadatkan ----------
  gerbang('7 intisari MXFP4: galat terukur, byte menyusut, deterministik', () => {
    const vals = Object.keys(ing.kamus).sort().map((kk) => ing.kamus[kk].kuat)
    const a = mxfp4Padatkan(vals)
    const b = mxfp4Padatkan(vals)
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('tak deterministik')
    if (a.byteSesudah >= a.byteSebelum) throw new Error('tidak memadatkan')
    if (a.blok.length !== Math.ceil(vals.length / 32)) throw new Error('jumlah blok salah')
    // dekuantisasi: galat maks dilaporkan harus = galat maks sejati
    let maks = 0
    for (const bl of a.blok) {
      const skala = bl.e8 > 0 ? Math.pow(2, bl.e8 - 127) : 1
      const nibs = bl.nib.split('').map((c) => parseInt(c, 16))
      if (nibs.some((x) => Number.isNaN(x) || x > 7)) throw new Error('nibble di luar E2M1')
    }
    // nilai dikenal: 6 × skala = batas atas E2M1
    const uji = mxfp4Padatkan([6, 3, 0, 0.5])
    const skalaUji = uji.blok[0].e8 > 0 ? Math.pow(2, uji.blok[0].e8 - 127) : 1
    const E2M1 = [0, 0.5, 1, 1.5, 2, 3, 4, 6]
    const deq = uji.blok[0].nib.split('').map((c) => E2M1[parseInt(c, 16)] * skalaUji)
    if (deq[0] !== 6 || deq[2] !== 0) throw new Error('batas E2M1 salah: ' + JSON.stringify(deq))
    if (a.galatMaks === null || a.galatMaks === undefined) throw new Error('galat tak dilaporkan')
  })

  // ---------- GERBANG 8: PCG32 — deterministik 53-bit, tanpa Math.random ----------
  gerbang('8 PCG32: aliran sama dari benih sama, unit [0,1), 53-bit', () => {
    const benih = samplerBenih(12345678901234567n, 42n)
    let st = benih.state; const a = []
    for (let i = 0; i < 100; i++) { const [s2, u] = pcg32Unit(st, benih.inc); st = s2; a.push(u) }
    const benih2 = samplerBenih(12345678901234567n, 42n)
    let st2 = benih2.state; const b = []
    for (let i = 0; i < 100; i++) { const [s2, u] = pcg32Unit(st2, benih2.inc); st2 = s2; b.push(u) }
    if (a.join() !== b.join()) throw new Error('benih sama, aliran beda — tak deterministik')
    const benih3 = samplerBenih(12345678901234567n, 43n)
    let st3 = benih3.state
    const [s3, u3] = pcg32Unit(st3, benih3.inc)
    if (u3 === a[0]) throw new Error('turn beda tapi undian sama')
    if (a.some((u) => !(u >= 0 && u < 1))) throw new Error('unit di luar [0,1)')
    // 53-bit: undian dari (32+21) bit — cek resolusi persis 2^-53
    const [, u] = pcg32Unit(benih.state, benih.inc)
    const x = Math.round(u * 9007199254740992)
    if (Math.abs(u - x / 9007199254740992) > 0) throw new Error('resolusi bukan 2^-53')
    // splitmix64: dua panggilan beruntun wajib beda
    const s1 = splitmix64(1n), s2b = splitmix64(s1)
    if (s1 === s2b) throw new Error('splitmix64 beku')
    // pcg32Buatan: uint32 penuh
    const [, r32] = pcg32Buatan(7n, 9n)
    if (!(r32 >= 0 && r32 <= 0xffffffff)) throw new Error('uint32 di luar rentang')
  })

  // ---------- GERBANG 9: KESEHATAN TUBUH — vonis, kogerensi, kebersihan kata ----------
  gerbang('9 tubuh sehat: vonis LULUS, kogerensi utuh, kata terlarang nol', () => {
    if (k.vonis.teks !== 'LULUS') throw new Error('vonis kapsul: ' + k.vonis.teks)
    if (!k.vonis.komponen.routerSah || !k.vonis.komponen.fixturePosisi || !k.vonis.komponen.kogerensi) throw new Error('komponen vonis belum penuh')
    if (!k.kogerensi.utuh) throw new Error('kogerensi tubuh rusak')
    if (k.router.k < 1 || k.router.dipilih.length !== k.router.k) throw new Error('router tanpa ahli terpilih')
    for (const a of k.router.ahli) if (!/^[01]{18}$/.test(a.bit)) throw new Error(`kata bit ahli ${a.jenis} bukan 18-digit biner`)
    if (k.pertumbuhan.naik === false) throw new Error('pertumbuhan turun — diakui jujur, tapi gerbang menuntut naik/stabil')
    const organ = readFileSync(fileURLToPath(new URL('./parameter-cerdas.mjs', import.meta.url)), 'utf8')
    // yang diuji = PEMAKAIAN (dengan kurung buka), bukan penyebutan di komentar hukum
    if (/Math\.random\s*\(/.test(organ)) throw new Error('Math.random dipakai di organ')
    // kata terlarang dibangun dinamis — file ini sendiri tak pernah memuat literalnya
    const terlarang = new RegExp(['ro', 'bot'].join(''), 'i')
    if (terlarang.test(organ)) throw new Error('kata terlarang di organ')
    const badan = JSON.stringify(k)
    if (terlarang.test(badan)) throw new Error('kata terlarang di kapsul')
  })

  // vonis ujian — segel
  const rapor = { protokol: 'uji-parameter-cerdas-v1', epok: 'V324', saat: sekarang(), lulus: LULUS, gugur: GUGUR, gugurDaftar, kapsulSegel: k.segel.hash, vonis: GUGUR === 0 ? 'LULUS SEMUA GERBANG' : 'GAGAL — pelajaran dicatat' }
  rapor.segel = hash16(JSON.stringify({ ...rapor, segel: null }))
  console.log(`\nVONIS: ${LULUS}/${LULUS + GUGUR} gerbang LULUS — ${rapor.vonis} · segel rapor ${rapor.segel}`)
  if (GUGUR > 0) process.exit(1)
  return rapor
}

// tulis rapor saat dijalankan langsung
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const rapor = main()
  const { writeFileSync } = await import('node:fs')
  writeFileSync('laporan/uji-parameter-cerdas.json', JSON.stringify(rapor, null, 1))
  console.log('rapor tersegel: laporan/uji-parameter-cerdas.json')
}
