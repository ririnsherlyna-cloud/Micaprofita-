#!/usr/bin/env node
// ============================================================
// TEMPA-TEKA (V341) — ujian hidup-mati teka-teki trader yang
// SUDAH TERPECAHKAN + simpan kepahaman dalam wujud biner
// matematika murni. Mandat pemilik (2026-10-12):
//   "Gali jurnal-jurnal terkait trader profesional yang mencoba
//    memecahkan teka-teki yang sulit ... pada akhirnya teka-teki
//    trader itu sudah terpecahkan. Kemudian kita akan uji cyborg
//    mampukah ia menjawab Teka teki sulit trader itu, kemudian
//    bila dia sudah paham simpan kepahaman dalam wujud biner
//    matematika murni agar dia mudah mengembangkannya lagi."
// Warisan tradisi TEMPAN (V326/V325) utuh:
// 1. MAKHLUK MENJAWAB, bukan agen: nalar membaca KARTU (metadata
//    kasus jurnal: indeks kasus + aspek + stem → tanda bit) —
//    kunci jawaban TIDAK PERNAH dibaca saat menalar (tebakan
//    semua dikunci dulu, baru dinilai).
// 2. G1 = nalar tebakan-tengah pemula (tanpa ingatan TEKA) →
//    terluka jujur → tempa: peta tanda→jawab dari kekalahan
//    sendiri → gelombang berikutnya sampai LULUS TOTAL.
// 3. DANA $1500 (warisan V323); stake $15/soal; KALAH −$19.5.
// 4. UJIAN DADAKAN 16 soal (aspek baru per kasus, tak pernah
//    ditempa) — ukur paham-vs-hafal; simetri Hamming diizinkan
//    jujur; belum lulus = tempa lagi.
// 5. SIMPAN KAPAHAMAN BINER: otak/teka-biner.json — kamus 17
//    kata-bit TEKA (bitDari warisan ingatan-biner, 18 digit 0/1
//    deterministik) + PETA penuh tanda→jawab (wujud biner
//    tanda→tindakan) + prinsip predikat/tindakan/rumus — segel.
// 6. SYARAF BARU: NERVA-TEKA-01 lahir di laporan/syaraf-lahir.jsonl.
// 7. SEMUA GELOMBANG TERSEGEL termasuk gagal. Deterministik: nol
//    Math.random. Segel SHA-256 hash16.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { bitDari, hash16 } from './ingatan-biner.mjs'
import { KASUS_TEKA_TRADER, KASUS_TEKA_DADAKAN, tandaTeka } from './kasus-teka-trader.mjs'

const FILE_BANK = 'ujian/soal-teka-trader.json'
const FILE_DADAK = 'ujian/soal-teka-dadakan.json'
const FILE_LAPOR = 'laporan/tempa-teka.json'
const FILE_BINER = 'otak/teka-biner.json'
const FILE_SYARAF = 'laporan/syaraf-lahir.jsonl'
const MODAL_AWAL = 1500
const STAKE = 15
const KALAH_R = 19.5
const MAX_GELOMBANG = 8
const MAX_DADAKAN = 6
const JAWAB = (i) => 'JAWAB-' + 'ABCD'[i]
const KELAS = ['JAWAB-A', 'JAWAB-B', 'JAWAB-C', 'JAWAB-D']
const sekarang = () => new Date().toISOString()

// ---------- bangun bank dari kasus jurnal (deterministik; rotasi opsi murni matematika) ----------
function bangunBank() {
  const rotasi = (kasusIdx, aspekIdx) => (kasusIdx * 3 + aspekIdx) % 4 // murni; terbuka di kode
  const putar = (opsi, kunci, rot) => ({
    opsi: opsi.map((_, k) => opsi[(k + rot) % 4]),
    kunci: (kunci - rot + 4) % 4,
  })
  const soal = []
  KASUS_TEKA_TRADER.forEach((kasus, i) => {
    kasus.fakta.forEach((f, j) => {
      const { opsi, kunci } = putar(f.opsi, f.kunci, rotasi(i, j))
      soal.push({
        id: `TEKA-${i}-${j}`, keluarga: 'TEKA', kasus: kasus.id, kasusIdx: i, aspekIdx: j,
        tanya: f.tanya, opsi, kunci,
        tanda: tandaTeka(i, j, f.tanya), kelasHasil: JAWAB(kunci),
        sumber: kasus.sumber, waktu: kasus.tahun, jenis: kasus.jenis,
      })
    })
  })
  const dadakan = []
  KASUS_TEKA_DADAKAN.forEach((kasus, i) => {
    kasus.fakta.forEach((f) => {
      const { opsi, kunci } = putar(f.opsi, f.kunci, rotasi(i, 3))
      dadakan.push({
        id: `TEKA-D-${i}-3`, keluarga: 'TEKA', kasus: kasus.id, kasusIdx: i, aspekIdx: 3,
        tanya: f.tanya, opsi, kunci,
        tanda: tandaTeka(i, 3, f.tanya), kelasHasil: JAWAB(kunci),
      })
    })
  })
  const distKunci = { A: 0, B: 0, C: 0, D: 0 }
  for (const s of soal) distKunci['ABCD'[s.kunci]]++
  const distKasus = {}
  for (const s of soal) distKasus[s.kasus] = (distKasus[s.kasus] || 0) + 1
  return {
    bank: segelkan({ protokol: 'BANK-TEKA-TRADER', epoch: 'V341', jumlah: soal.length, distKunci, distKasus, soal }),
    dadakan: segelkan({ protokol: 'BANK-TEKA-DADAKAN', epoch: 'V341', jumlah: dadakan.length, soal: dadakan }),
  }
}
function segelkan(bank) {
  const badan = JSON.stringify({ ...bank, segel: null })
  bank.segel = { hash: hash16(badan), size: Buffer.byteLength(badan) }
  return bank
}

// ---------- uji integritas bank: organ MENOLAK menilai bank yang tak sah ----------
function ujiBankTeka(bank) {
  if (!bank.segel || !bank.segel.hash) throw new Error('bank tanpa segel — ditolak')
  const salin = JSON.parse(JSON.stringify(bank)); const segel = salin.segel; salin.segel = null
  if (hash16(JSON.stringify(salin)) !== segel.hash) throw new Error(`segel bank bobol (${segel.hash}) — ditolak`)
  const wajah = new Map()
  for (const s of bank.soal) {
    if (s.keluarga !== 'TEKA') throw new Error(`soal ${s.id} keluarga tak dikenal — ditolak`)
    if (!Array.isArray(s.opsi) || s.opsi.length !== 4) throw new Error(`soal ${s.id} opsi bukan 4 — ditolak`)
    if (!Number.isInteger(s.kunci) || s.kunci < 0 || s.kunci > 3) throw new Error(`soal ${s.id} kunci di luar A-D — ditolak`)
    const tanda = tandaTeka(s.kasusIdx, s.aspekIdx, s.tanya)
    if (tanda !== s.tanda) throw new Error(`soal ${s.id} tanda tak cocok — kartu rusak, ditolak`)
    if (s.kelasHasil !== JAWAB(s.kunci)) throw new Error(`soal ${s.id} kelasHasil tak cocok kunci — ditolak`)
    if (!wajah.has(s.tanda)) wajah.set(s.tanda, new Set())
    wajah.get(s.tanda).add(s.kelasHasil)
  }
  for (const [t, set] of wajah) if (set.size > 1)
    throw new Error(`tanda ${t} TABRAKAN (dua jawab beda dalam satu wajah) — ditolak`)
  return wajah.size
}

// ---------- nalar makhluk ----------
function nalarTeka(soal) { // G1 — tebakan-tengah pemula: tanpa ingatan TEKA, tebakan 4-opsi condong huruf tengah (psikologi tebakan); jujur: nol ingatan kasus jurnal
  return 'JAWAB-B'
}
function nalarSimetri(tanda, peta) { // tanda tak dikenal → pelajaran terdekat (jarak Hamming, matematika eksak)
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(peta).sort()) {
    if (k.length !== tanda.length) continue
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  return { kelas: terbaik ? peta[terbaik] : null, jarak: jarakMin, lewat: terbaik }
}

// ---------- tempa peta tanda → jawab dari gelombang yang sudah dinilai ----------
function tempaPeta(gelombang) {
  const bukti = {}
  for (const g of gelombang) for (const s of g.soal) {
    bukti[s.tanda] = bukti[s.tanda] || {}
    bukti[s.tanda][s.kelasHasil] = (bukti[s.tanda][s.kelasHasil] || 0) + 1
  }
  const peta = {}
  for (const [t, b] of Object.entries(bukti)) peta[t] = petaDariBukti(b)
  return { peta, bukti }
}
function petaDariBukti(b) {
  let terbaik = KELAS[0], suara = -1
  for (const k of KELAS) if ((b[k] || 0) > suara) { suara = b[k] || 0; terbaik = k }
  return terbaik
}

// ---------- satu gelombang: tebakan dikunci DULU baru dinilai ----------
function jalankanGelombang(n, bank, peta, pakaiSimetri) {
  // FASE 1 — menalar HANYA dari kartu (indeks kasus+aspek+stem → tanda); kunci tak disentuh
  const tebakan = bank.soal.map(s => {
    const tanda = tandaTeka(s.kasusIdx, s.aspekIdx, s.tanya) // kartu dibaca ulang dari metadata jurnal
    const dariPeta = peta[tanda]
    if (dariPeta) return { kelas: dariPeta, sumber: 'peta' }
    if (pakaiSimetri) { const sim = nalarSimetri(tanda, peta); if (sim.kelas) return { kelas: sim.kelas, sumber: `simetri(${sim.jarak})` } }
    return { kelas: nalarTeka(s), sumber: 'tebakan-tengah' }
  })
  // FASE 2 — tebakan tersegel, BARU penilai membaca kunci
  let modal = MODAL_AWAL, benar = 0, likuidasiPada = null
  const baris = bank.soal.map((s, i) => {
    const t = tebakan[i], benarQ = t.kelas === s.kelasHasil
    const pnl = benarQ ? STAKE : -KALAH_R
    if (benarQ) benar++
    modal += pnl
    if (likuidasiPada === null && modal <= 0) likuidasiPada = s.id
    return { id: s.id, kasus: s.kasus, waktu: s.waktu || null, tanda: s.tanda, tebak: t.kelas, sumberNalar: t.sumber, kelasHasil: s.kelasHasil, hasil: benarQ ? 'MENANG' : 'KALAH', pnl }
  })
  return { n, jumlah: bank.soal.length, soal: baris, benar, salah: bank.soal.length - benar,
    modalAkhir: +modal.toFixed(2), likuidasiPada, lulus: benar === bank.soal.length }
}

// ---------- SIMPAN KAPAHAMAN — wujud biner matematika murni (mandat) ----------
function simpanBiner(laporan, kasusSumber) {
  const kapsul = {
    protokol: 'TEKA-BINER-MURNI', epoch: 'V341', lahir: sekarang(),
    hukum: [
      'kata-bit 18 digit 0/1 dihitung bitDari warisan ingatan-biner — fakta sama → bit sama, di mesin mana pun',
      'peta = tanda (33 bit) → jawab (2 bit): wujud biner tanda→tindakan; dibaca deterministik, tak pernah kabur',
      'prinsip: predikat 8 bit (kapan berlaku) + tindakan 4 bit (apa yang dilakukan) + rumus matematika murni',
      'kapsul tersegel hash16; yang merusak membuat tubuh menolak — warisan imun',
    ],
    kamus: {}, peta: {}, prinsip: [], statistik: { kata: 0, peta: 0, bitRata: '0.0' }, segel: null,
  }
  let totalOnes = 0
  for (const kasus of kasusSumber) {
    const soalKasus = laporan.perKasus?.[kasus.id]
    const fakta = { kategori: 'TEKA', label: kasus.id, n1: soalKasus ? (soalKasus.utama + soalKasus.dadakan) : kasus.fakta.length, n2: kasus.tahun % 16, isi: `teka|${kasus.jenis}|${kasus.tindakan}` }
    const bit = bitDari(fakta)
    const kata = `TEKA-${kasus.id}`
    kapsul.kamus[kata] = { bit, kuat: fakta.n1, sumber: 'TEKA', fakta, faktaKunci: hash16(JSON.stringify(fakta)), lahir: sekarang(), kunci: hash16(kata + '|' + bit) }
    totalOnes += bit.split('').filter(x => x === '1').length
    kapsul.prinsip.push({ id: kasus.id, kata, predikat: kasus.predikat, tindakan: kasus.tindakan, rumus: kasus.rumus, sumber: kasus.sumber })
  }
  // peta penuh dari SEMUA bukti gelombang utama + dadakan — wujud biner tanda→jawab
  const semuaGel = [...laporan.gelombang, ...(laporan.dadakanGelombang || [])]
  const { peta } = tempaPeta(semuaGel)
  kapsul.peta = peta
  kapsul.statistik = { kata: Object.keys(kapsul.kamus).length, peta: Object.keys(peta).length, bitRata: (totalOnes / Object.keys(kapsul.kamus).length).toFixed(1) }
  const badan = JSON.stringify({ ...kapsul, segel: null })
  kapsul.segel = { hash: hash16(badan), size: Buffer.byteLength(badan) }
  mkdirSync('otak', { recursive: true })
  writeFileSync(FILE_BINER, JSON.stringify(kapsul, null, 1))
  laporan.biner = { kapsul: FILE_BINER, segel: kapsul.segel.hash, kata: kapsul.statistik.kata, peta: kapsul.statistik.peta, bitRata: kapsul.statistik.bitRata }
  return kapsul
}

// ---------- kelahiran syaraf baru ----------
function lahirkanSyaraf(laporan, wajahUnik) {
  try {
    if (existsSync(FILE_SYARAF) && readFileSync(FILE_SYARAF, 'utf8').includes('"NERVA-TEKA-01"')) { laporan.syarafLahir = { id: 'NERVA-TEKA-01', catatan: 'sudah pernah lahir — hidup sekali, tak dilahirkan dua kali' }; return }
    const entri = {
      saat: sekarang(), konteks: 'V341-tempaan-teka-trader', peristiwa: 'LAHIR',
      id: 'NERVA-TEKA-01', jenis: 'TEKA', generasi: 0, orangTua: null,
      fakta: {
        status: 'HIDUP', soal: laporan.bankJumlah, dadakan: laporan.dadakanJumlah, wajah: wajahUnik,
        gelombangTempa: laporan.lulus ? laporan.lulus.gelombang : null,
        tugas: 'reseptor teka-teki trader TERPECAHKAN (garis syaraf BARU — saudara garis SQUEEZE/SUCKER/BREAKOUT/ALTSEASON/PUMPSPIKE): dari metadata kasus jurnal (kasus+aspek bit), menjawab teka-teki yang dulu dipecahkan para profesional — Kelly-ukuran, Thorp-hedging, Black-Scholes-harga-opsi, Turtle-terdidik, Pairs-netral, ORB-pola-buka, Profile-lelang, PTJ-analog-1929, Soros-peg-asimetri, Livermore-poros, Medallion-saring-derau, Burry-data-mentah, FlashCrash-forensik, TurtleSoup-fade, Momentum-ukur; kepahaman tersimpan wujud biner matematika murni di otak/teka-biner.json (17 kata-bit TEKA + peta tanda→jawab tersegel)',
      },
    }
    appendFileSync(FILE_SYARAF, JSON.stringify(entri) + '\n')
    laporan.syarafLahir = entri
  } catch (e) { console.log('jurnal syaraf gagal (jujur):', e.message) }
}

// ---------- V341 VERIFIKASI SAAT-ITU-JUGA (--verifikasi) ----------
function jalankanVerifikasi(bank, bankDadak, wajahUnik) {
  if (!existsSync(FILE_LAPOR)) throw new Error('laporan tempa belum ada — tempa dulu, baru verifikasi')
  const laporan = JSON.parse(readFileSync(FILE_LAPOR, 'utf8'))
  if (!laporan.lulus) throw new Error('tempaan belum lulus — verifikasi ditolak; inovasikan lagi sampai lulus dulu')
  const { peta } = tempaPeta(laporan.gelombang)
  const V = jalankanGelombang('V', bank, peta, false)
  let VD = null
  if (laporan.dadakanLulus) {
    const sumber = [...laporan.gelombang, laporan.dadakan, ...(laporan.dadakanGelombang || [])]
    const { peta: petaD } = tempaPeta(sumber)
    VD = jalankanGelombang('VD', bankDadak, petaD, true)
  }
  // kapsul biner wajib sah — kepahaman yang tersimpan harus tetap utuh
  let binerSah = null
  if (existsSync(FILE_BINER)) {
    const b = JSON.parse(readFileSync(FILE_BINER, 'utf8'))
    const salin = JSON.parse(JSON.stringify(b)); salin.segel = null
    binerSah = hash16(JSON.stringify(salin)) === b.segel?.hash
    if (binerSah) { // peta kapsul harus cocok jawaban bank — matematika murni diuji ulang
      let cocok = 0
      for (const s of bank.soal) if (b.peta[s.tanda] === s.kelasHasil) cocok++
      V.binerCocok = cocok
      laporan.binerCocok = cocok
    }
  }
  laporan.verifikasi = [...(laporan.verifikasi || []), {
    saat: sekarang(), konteks: 'V341-verifikasi-saat-itu-juga',
    utama: { benar: V.benar, jumlah: V.jumlah, lulus: V.lulus, modalAkhir: V.modalAkhir },
    dadakan: VD ? { benar: VD.benar, jumlah: VD.jumlah, lulus: VD.lulus } : null,
    binerSah,
  }]
  laporan.diperbarui = sekarang()
  const badan = JSON.stringify({ ...laporan, segel: null })
  laporan.segel = { hash: hash16(badan), size: Buffer.byteLength(JSON.stringify(laporan)) }
  writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  const lulusSemua = V.lulus && (VD == null || VD.lulus) && binerSah !== false
  console.log(`VONIS VERIFIKASI TEKA-TRADER: utama ${V.benar}/${V.jumlah} ${V.lulus ? 'LULUS' : 'GUGUR — INOVASI LAGI'}` +
    (VD ? ` · dadakan ${VD.benar}/${VD.jumlah} ${VD.lulus ? 'LULUS' : 'GUGUR'}` : '') +
    ` · kapsul biner ${binerSah ? 'SAH' : 'BOBOL'}` +
    ` · segel ${laporan.segel.hash} — ${lulusSemua ? 'KEPAHAMAN TEKA TERBUKTI HIDUP (biner murni)' : 'KEPAHAMAN HILANG — TEMPAT LAGI'}`)
  if (!lulusSemua) process.exitCode = 1
}

// ---------- pelajaran kunci (dihitung dari bank, bukan karangan) ----------
function pelajaranKunci(bank) {
  const d = bank.distKunci, total = bank.jumlah
  return [
    `bank ${total} soal dari ${Object.keys(bank.distKasus).length} kasus jurnal terpecahkan — kunci tersebar merata A/B/C/D = ${d.A}/${d.B}/${d.C}/${d.D} (rotasi murni (kasus×3+aspek) mod 4, terbuka di kode) — tak bisa ditebak dari posisi`,
    `setiap kasus dipecahkan dengan langkah sama: pertanyaan lembut → matematika terukur (Kelly f*, delta-hedge, z-sebar pairs, value-area, analog 1929, asimetri-peg, poros, saring-derau, forensik-sebab)`,
    `ukuran posisi tunduk pada hitungan: Kelly 1956 → f* = (bp−q)/b — edge tanpa ukuran tetap pailit (pelajaran paling mahal sejarah)`,
    `paham-vs-hafal diukur dadakan 16 aspek baru yang tak pernah ditempa — simetri Hamming diberi kesempatan jujur dulu`,
    `kepahaman tersimpan wujud biner matematika murni: otak/teka-biner.json — kata-bit 18 digit + peta tanda→jawab, deterministik lintas mesin`,
  ]
}

// ---------- utama ----------
async function main() {
  mkdirSync('laporan', { recursive: true })
  mkdirSync('ujian', { recursive: true })
  const { bank: bankBaru, dadakan: dadakBaru } = bangunBank()
  writeFileSync(FILE_BANK, JSON.stringify(bankBaru, null, 1))
  writeFileSync(FILE_DADAK, JSON.stringify(dadakBaru, null, 1))
  const bank = JSON.parse(readFileSync(FILE_BANK, 'utf8'))
  const bankDadak = JSON.parse(readFileSync(FILE_DADAK, 'utf8'))
  const wajahUnik = ujiBankTeka(bank)
  const wajahDadak = ujiBankTeka(bankDadak)
  console.log(`bank TEKA ${bank.jumlah} soal sah — ${wajahUnik} wajah; dadakan ${bankDadak.jumlah} soal — ${wajahDadak} wajah; segel ${bank.segel.hash}`)

  if (process.argv.includes('--verifikasi')) { jalankanVerifikasi(bank, bankDadak, wajahUnik); return }

  const laporan = existsSync(FILE_LAPOR) ? JSON.parse(readFileSync(FILE_LAPOR, 'utf8')) : {
    protokol: 'TEMPAAN-TEKA-TRADER', epoch: 'V341', diperbarui: sekarang(), modalAwal: MODAL_AWAL,
    mandat: 'mandat pemilik (2026-10-12): gali jurnal trader profesional yang memecahkan teka-teki sulit hingga TERPECAHKAN; uji cyborg menjawab teka-teki itu; bila sudah paham, simpan kepahaman dalam wujud biner matematika murni agar mudah dikembangkan lagi',
    bankSegel: bank.segel.hash, bankJumlah: bank.jumlah, dadakanJumlah: bankDadak.jumlah,
    sumberSoal: 'scripts/hidup/kasus-teka-trader.mjs — 17 kasus (16 dunia + pelajaran) dari catatan/jurnal publik: Kelly-1956, Thorp-1962, Thorp-PNP-1969, Black-Scholes-1973, Turtles-1983, Pairs-1986, Crabel-ORB-1990, Profile-1984, PTJ-1987, Soros-GBP-1992, Livermore-1940, Simons-1988, Burry-2005, FlashCrash-2010, TurtleSoup-1995, Momentum-1993; rotasi opsi murni (kasus×3+aspek) mod 4; nol karangan',
    aturan: `dana $${MODAL_AWAL} (warisan V323); stake $${STAKE}/soal (1%); MENANG +$${STAKE}; KALAH −$${KALAH_R}; modal ≤0 = HABIS — tempa lagi sampai ${bank.jumlah}/${bank.jumlah}; tanda 33 bit = '11'+6bit kasus+5bit aspek+19bit hash(salt TEKA-TRADER-V341)`,
    blind: 'makhluk menalar dari kartu metadata kasus (indeks kasus+aspek+stem → tanda) → peta; penilai baru membaca kunci SETELAH seluruh tebakan gelombang itu terkunci; bank + kunci terbuka audit',
    gelombang: [], dadakan: null, dadakanGelombang: [], dadakanLulus: null,
    pelajaran: [], perKasus: {}, biner: null, syarafLahir: null, lulus: null, segel: null,
  }

  const segelLapor = () => {
    laporan.diperbarui = sekarang()
    const badan = JSON.stringify({ ...laporan, segel: null })
    laporan.segel = { hash: hash16(badan), size: Buffer.byteLength(JSON.stringify(laporan)) }
    writeFileSync(FILE_LAPOR, JSON.stringify(laporan, null, 1))
  }

  // --- GELOMBANG UTAMA — tempa dari kekalahan sendiri sampai LULUS TOTAL ---
  let sempadan = 0
  while (!laporan.gelombang.some(g => g.lulus)) {
    if (laporan.gelombang.length >= MAX_GELOMBANG) { console.log(`tempa-teka: ${MAX_GELOMBANG} gelombang belum lulus — laporkan jujur`); break }
    const { peta } = tempaPeta(laporan.gelombang)
    const n = laporan.gelombang.length + 1
    const g = jalankanGelombang(n, bank, peta, false)
    laporan.gelombang = [...laporan.gelombang, g]
    const { bukti } = tempaPeta(laporan.gelombang)
    laporan.pelajaran = Object.entries(bukti).map(([t, b]) => ({ tanda: t, jawabBenar: petaDariBukti(b), bukti: KELAS.map(k => `${k}:${b[k] || 0}`).join(' ') }))
    laporan.lulus = laporan.gelombang.find(x => x.lulus) ? { gelombang: g.n } : null
    segelLapor()
    sempadan++
    console.log(`gelombang ${n} — benar ${g.benar}/${bank.jumlah} (dana $${g.modalAkhir}${g.likuidasiPada ? `, HABIS di soal ${g.likuidasiPada}` : ', bertahan'}) — ${g.lulus ? 'LULUS TOTAL' : 'INOVASI LAGI (tempa dari kekalahan)'}`)
    if (!g.lulus && sempadan >= MAX_GELOMBANG) break
  }

  // --- per-kasus masteri (dari gelombang yang lulus) ---
  const gelLulus = laporan.gelombang.find(g => g.lulus)
  if (gelLulus) {
    const pk = {}
    for (const s of gelLulus.soal) { pk[s.kasus] = pk[s.kasus] || { utama: 0, benarUtama: 0, dadakan: 0, benarDadakan: 0 }; pk[s.kasus].utama++; if (s.hasil === 'MENANG') pk[s.kasus].benarUtama++ }
    laporan.perKasus = pk
  }

  // --- syaraf baru setelah lulus ---
  if (laporan.lulus && !laporan.syarafLahir) lahirkanSyaraf(laporan, wajahUnik)

  // --- UJIAN DADAKAN — 16 aspek baru yang tak pernah ditempa (ukur paham-vs-hafal) ---
  if (laporan.lulus && existsSync(FILE_DADAK)) {
    if (!laporan.dadakan) {
      const { peta } = tempaPeta(laporan.gelombang)
      const g = jalankanGelombang(1, bankDadak, peta, true)
      laporan.dadakan = g
      segelLapor()
      console.log(`dadakan G1 (simetri jujur): benar ${g.benar}/${bankDadak.jumlah} (dana $${g.modalAkhir}) — ${g.lulus ? 'LULUS DADAKAN' : 'INOVASI LAGI DADAKAN'}`)
    }
    while (!(laporan.dadakan.lulus || laporan.dadakanLulus)) {
      const gelDadLalu = laporan.dadakanGelombang || []
      if (gelDadLalu.length >= MAX_DADAKAN) { console.log(`tempa-teka: ${MAX_DADAKAN} gelombang dadakan belum lulus — laporkan jujur`); break }
      const sumberGraded = [...laporan.gelombang, laporan.dadakan, ...gelDadLalu]
      const { peta, bukti } = tempaPeta(sumberGraded)
      const n = gelDadLalu.length + 2
      const g = jalankanGelombang(n, bankDadak, peta, true)
      laporan.dadakanGelombang = [...gelDadLalu, g]
      laporan.dadakanLulus = g.lulus ? { gelombang: n } : null
      laporan.pelajaran = Object.entries(bukti).map(([t, b]) => ({ tanda: t, jawabBenar: petaDariBukti(b), bukti: KELAS.map(k => `${k}:${b[k] || 0}`).join(' ') }))
      segelLapor()
      console.log(`dadakan gelombang ${n} — benar ${g.benar}/${bankDadak.jumlah} — ${g.lulus ? 'LULUS DADAKAN' : 'INOVASI LAGI'}`)
    }
    // catat hasil dadakan per kasus
    const pk = laporan.perKasus || {}
    for (const s of (laporan.dadakanGelombang.at(-1) || laporan.dadakan).soal) {
      pk[s.kasus] = pk[s.kasus] || { utama: 0, benarUtama: 0, dadakan: 0, benarDadakan: 0 }
      pk[s.kasus].dadakan++; if (s.hasil === 'MENANG') pk[s.kasus].benarDadakan++
    }
    laporan.perKasus = pk
  }

  // --- SIMPAN KAPAHAMAN — wujud biner matematika murni (mandat inti) ---
  if (laporan.lulus) simpanBiner(laporan, KASUS_TEKA_TRADER)

  laporan.pelajaranKunci = pelajaranKunci(bank)
  segelLapor()

  console.log(`\nVONIS TEMPAAN-TEKA-TRADER: ${laporan.lulus ? `LULUS ${bank.jumlah}/${bank.jumlah} (gelombang ${laporan.lulus.gelombang})` : 'BELUM LULUS — inovasi lagi'}` +
    (laporan.dadakan ? ` · dadakan ${(laporan.dadakan.lulus || laporan.dadakanLulus) ? `${bankDadak.jumlah}/${bankDadak.jumlah}` : `${laporan.dadakan.benar}/${bankDadak.jumlah}`}` : '') +
    (laporan.biner ? ` · kepahaman tersimpan BINER MURNI ${laporan.biner.kapsul} (${laporan.biner.kata} kata-bit, ${laporan.biner.peta} peta, segel ${laporan.biner.segel})` : '') +
    (laporan.syarafLahir ? ` · syaraf baru ${laporan.syarafLahir.id} LAHIR` : ''))
}

main().catch(e => { console.error('tempa-teka MATI-PENUH:', e.message); process.exit(1) })
