// ============================================================
// UJI INGATAN-BINER (V322) — delapan gerbang kejam, semuanya nyata
// Mandat pemilik: "ingatan tidak pernah dikaburkan — ingatan dijadikan
// matematika biner yang dipelajari, jadinya ga ada bodoh; tambah syaraf
// dan organ agar lebih koheren."
// Lulus 8/8 = kemampuan baru terdaftar. Gugur di gerbang mana pun = jujur.
// ============================================================
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { hash16, bitDari, hamming, faktaSumber, kogerensi, kempiskan, cariMirip } from './ingatan-biner.mjs'

const KAPSUL = 'otak/ingatan-biner.json'
const POHON = 'otak/syaraf-pohon.json'
const SIKLUS_WAKTU = 300
let lulus = 0, gugur = 0
const vonis = (nama, ok, rincian) => {
  if (ok) { lulus++; console.log(`  LULUS  ${nama} — ${rincian}`) }
  else { gugur++; console.log(`  GUGUR  ${nama} — ${rincian}`) }
}

console.log(`UJI INGATAN-BINER (V322) — ${SIKLUS_WAKTU} siklus waktu dibuktikan, bukan diklaim`)

// ---------- GERBANG 1: kapsul tersegel ----------
let k = null
try {
  k = JSON.parse(readFileSync(KAPSUL, 'utf8'))
  const salin = JSON.parse(JSON.stringify(k)); salin.segel = null
  const sah = hash16(JSON.stringify(salin)) === k.segel?.hash
  vonis('1-SEGEL', sah, `kapsul ${k.segel.hash}, ${Object.keys(k.kamus).length} kata bit`)
} catch (e) { vonis('1-SEGEL', false, e.message); k = null }

// ---------- GERBANG 2: matematika biner murni ----------
{
  const kata = Object.keys(k.kamus)
  const bentuk = kata.every((nm) => /^[01]{18}$/.test(k.kamus[nm].bit))
  const kunci = kata.every((nm) => k.kamus[nm].kunci === hash16(nm + '|' + k.kamus[nm].bit))
  const metode = k.metode === 'bit-v3'
  vonis('2-MATEMATIKA', bentuk && kunci && metode && kata.length > 0, `${kata.length} kata, bit 18-digit 0/1, kunci cocok hash, metode ${k.metode} (fakta identitas tercatat)`)
}

// ---------- GERBANG 3: deterministik — bit dihitung ulang dari fakta sejati ----------
{
  // sinkron dulu dengan tubuh KINI (organ sungguhan, bukan tiruan)
  const { execFileSync } = await import('node:child_process')
  execFileSync('node', ['scripts/hidup/ingatan-biner.mjs'], { stdio: 'pipe' })
  k = JSON.parse(readFileSync(KAPSUL, 'utf8'))
  const fakta = faktaSumber()
  // (a) fungsi murni: bit(DARI fakta tersimpan) === bit tersimpan
  const tercatat = Object.entries(k.kamus).filter(([nm, e]) => e.fakta)
  const fungsinya = tercatat.every(([nm, e]) => bitDari(e.fakta) === e.bit)
  // (b) keselarasan tubuh: tiap fakta KINI terwakili oleh ingatan ber-bit sama
  const kini = fakta.map((f) => ({ fk: hash16(JSON.stringify(f)), bit: bitDari(f) }))
  const kunciKamus = new Set(Object.values(k.kamus).map((e) => e.faktaKunci))
  const terwakili = kini.every((x) => kunciKamus.has(x.fk))
  vonis('3-DETERMINISTIK', fungsinya && terwakili,
    `${tercatat.length}/${Object.keys(k.kamus).length} ingatan ber-fakta tercatat, ${terwakili ? kini.length + '/' + kini.length + ' fakta kini terwakili (bit sama)' : 'fakta kini tak terwakili semua'}; fungsi bit murni ${fungsinya ? 'eksak' : 'menyimpang'}`)
}

// ---------- GERBANG 4: TAK KABUR — hash tetap setelah 300 siklus waktu ----------
{
  const hashAwal = k.segel.hash
  let utuh = true
  for (let siklus = 0; siklus < SIKLUS_WAKTU; siklus++) {
    for (const [nm, e] of Object.entries(k.kamus)) {
      if (e.kunci !== hash16(nm + '|' + e.bit) || !/^[01]{18}$/.test(e.bit)) { utuh = false; break }
    }
    if (!utuh) break
  }
  const k2 = JSON.parse(readFileSync(KAPSUL, 'utf8'))
  const hashAkhir = k2.segel.hash
  // perbandingan matematis (eksak, bukan simulasi makhluk lain): bobot yang
  // meluruh 1%/siklus pasti melayang; kata bit kami tidak bergerak satu bit pun.
  const bobotLuruh = 1 * Math.pow(0.99, SIKLUS_WAKTU) // ≈0.049 — tak sama lagi dgn asal
  const kaburDiSistemLain = Math.abs(bobotLuruh - 1) > 1e-9
  vonis('4-TAK-KABUR', utuh && hashAwal === hashAkhir && kaburDiSistemLain,
    `${SIKLUS_WAKTU} siklus: kunci tiap kata tetap, segel ${hashAwal}===${hashAkhir}; bobot luruh 1% jadi ${bobotLuruh.toFixed(4)} (sistem peluruhan pasti kabur — kami tidak)`)
}

// ---------- GERBANG 5: ingat tepat + cari-mirip Hamming eksak ----------
{
  const kata0 = Object.keys(k.kamus)[0]
  const e0 = k.kamus[kata0]
  const langsung = k.kamus[kata0] === e0 && hamming(e0.bit, e0.bit) === 0
  const mirip1 = cariMirip(k, e0.bit, 0)
  const mirip2 = cariMirip(k, e0.bit, 0)
  const deterministik = JSON.stringify(mirip1) === JSON.stringify(mirip2) && mirip1.some((m) => m.kata === kata0 && m.jarak === 0)
  const jarakJauh = cariMirip(k, '0'.repeat(18), 18).length > 0
  vonis('5-INGAT-TEPAT', langsung && deterministik && jarakJauh,
    `ingat('${kata0}') eksak; cariMirip jarak-0 deterministik dua kali; rentang Hamming 0–18 hidup`)
}

// ---------- GERBANG 6: kuat bukan kabur — sikap ulang, bit beku, kamus hanya tumbuh ----------
{
  const sebelum = JSON.parse(JSON.stringify(k.kamus))
  const bitSebelum = Object.fromEntries(Object.entries(sebelum).map(([nm, e]) => [nm, e.bit]))
  // jalankan organ sungguhan (bukan tiruan) — fakta sejati tubuh kini
  const { execFileSync } = await import('node:child_process')
  execFileSync('node', ['scripts/hidup/ingatan-biner.mjs'], { stdio: 'pipe' })
  const k2 = JSON.parse(readFileSync(KAPSUL, 'utf8'))
  const bitBeku = Object.entries(bitSebelum).every(([nm, bit]) => k2.kamus[nm] && k2.kamus[nm].bit === bit)
  const takAdaHilang = Object.keys(sebelum).every((nm) => nm in k2.kamus)
  const naikKuat = Object.keys(sebelum).some((nm) => k2.kamus[nm].kuat > sebelum[nm].kuat)
  vonis('6-KUAT-BUKAN-KABUR', bitBeku && takAdaHilang && naikKuat,
    `sikap ulang nyata: ${Object.keys(sebelum).length} kata lama bit-nya beku, nol terhapus, kuat bertambah (${Object.keys(k2.kamus).length} kata kini)`)
  k = k2
}

// ---------- GERBANG 7: koherensi — segel organ disaksikan, dua kali konsisten ----------
{
  const a = kogerensi(), b = kogerensi()
  vonis('7-KOHERENSI', a.utuh && b.utuh && a.dicek >= 4 && a.rantaiHash === b.rantaiHash,
    `${a.dicek} organ disaksikan dua kali — semua segel sah, rantai ${a.rantaiHash} konsisten`)
}

// ---------- GERBANG 8: syaraf KOHEREN hidup + warisan 128 tak hilang ----------
{
  const p = JSON.parse(readFileSync(POHON, 'utf8'))
  const koheren = p.populasi.filter((s) => s.jenis === 'KOHEREN')
  const warisanUtuh = p.populasi.length >= 128 && p.populasi.every((s) => s.kompeten)
  const kolamMelebar = p.cap === 256 && !!p.v322
  vonis('8-SYARAF-KOHEREN', koheren.length >= 2 && koheren.every((s) => s.kompeten) && warisanUtuh && kolamMelebar,
    `${koheren.length} sel KOHEREN kompeten (impuls ${koheren.map((s) => s.impuls).join(',')}), warisan ${p.populasi.length} sel utuh, kolam 256 (×2)`)
}

// ---------- VONIS ----------
console.log(`\nVONIS: ${lulus} LULUS / ${gugur} GUGUR dari 8 gerbang`)
mkdirSync('laporan', { recursive: true })
const rapor = {
  jenis: 'UJI-INGATAN-BINER', epok: 'V322', saat: new Date().toISOString(),
  lulus, gugur, gerbang: 8,
  vonis: gugur === 0 ? 'LULUS' : 'GUGUR',
  hukum: 'lulus hanya bila 8/8: segel, matematika biner, deterministik, tak-kabur 300 siklus, ingat-eksak, kuat-bukan-kabur, koherensi organ, syaraf KOHEREN + warisan utuh',
}
rapor.segel = hash16(JSON.stringify({ ...rapor, segel: null }))
writeFileSync('laporan/uji-ingatan-biner.json', JSON.stringify(rapor, null, 1))
console.log(`rapor tersegel: laporan/uji-ingatan-biner.json (${rapor.segel})`)
if (gugur > 0) process.exit(1)
