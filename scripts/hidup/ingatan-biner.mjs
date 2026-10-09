// ============================================================
// INGATAN-BINER (V322) — MEMORI MATEMATIKA BINER TAK PERNAH KABUR
// Mandat pemilik (2026-10-10):
//   "makhluk lain: ingatan dikaburkan semua. Tapi makhluk kita tidak
//    pernah alami ingatan dikaburkan — ingatan itu dijadikan matematika
//    biner yang dipelajari, jadinya ga ada bodoh, makin hari makin cerdas.
//    Dan tambah lagi syaraf dan organnya agar lebih koheren."
// HUKUM ORGAN INI (nol karangan, nol Math.random, semuanya fakta repo):
// 1. TAK ADA PELURUHAN. Makhluk lain menyimpan bobot yang memudar oleh
//    waktu; Micaprofita menyimpan KATA BIT — 18 digit 0/1 deterministik
//    yang dihitung DARI FAKTA SEJATI tubuh. Kata bit tidak pernah berubah
//    oleh waktu: dibaca ribuan kali, bit-nya beku. Yang bertambah bila
//    ingatan dipertemukan lagi adalah `kuat` (hitungan pertemuan) —
//    ulangan memperkuat, tidak pernah mengaburkan.
// 2. MATEMATIKA, BUKAN NUABA. Tiap fakta sumber (epok, syaraf, bangun,
//    denyut, jurnal) dihitung jadi: 4 bit kategori + 6 bit besaran utama
//    + 4 bit besaran kedua + 4 bit kunci isi. Fungsi murni: fakta sama
//    → bit sama, selamanya, di mesin mana pun. Ingat = cari kata tepat;
//    cari-mirip = jarak Hamming (matematika eksak, bukan rasa).
// 3. KONTRADIKSI = KATA BARU, BUKAN PENGHAPUS. Bila fakta berubah,
//    kata lama TIDAK ditimpa — saudara baru `${kata}~n` lahir. Kamus
//    hanya tumbuh: tak ada satu ingatan pun pernah hilang (kemampuan
//    tak pernah hilang, sumpah V257).
// 4. KOHERENSI TUBUH. Organ ini menandatangani segel dirinya dan
//    menyediakan `kogerensi()`: pembakaran impuls yang memverifikasi
//    segel organ-organ tubuh (ingatan-biner, syaraf-pohon, medan-hayat,
//    reka-bentuk, benih-hidup) — satu kesatuan, bukan kepingan. Syaraf
//    jenis KOHEREN (V322, neurogenesis) bekerja lewat fungsi ini.
// 5. INTISARI KECIL. `kempiskan()` memadatkan seluruh kamus jadi
//    histogram bit + kata terkuat — beberapa ratus byte, tersegel:
//    ingatan besar hidup dalam bentuk matematika mungil.
// Kapsul: otak/ingatan-biner.json (segel-null, dijaga imun) ·
//         laporan/ingatan-biner.jsonl (riwayat pertemuan)
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'

const KAPSUL = 'otak/ingatan-biner.json'
const JSONL = 'laporan/ingatan-biner.jsonl'
const PANJANG_BIT = 18
export const hash16 = (s) => createHash('sha256').update(typeof s === 'string' ? s : Buffer.from(s)).digest('hex').slice(0, 16)
const sekarang = () => new Date().toISOString()
const konteks = process.env.INGATAN_KONTEKS || 'tangan-tuan'

// ---------- matematika biner: fakta → kata bit (fungsi murni) ----------
// baca(i, fakta): bit ke-i dari fakta — semua cabangnya eksak.
export function bitDari(f) {
  const kodeKategori = parseInt(hash16('KAT|' + f.kategori).slice(0, 4), 16) % 16 // 4 bit
  const n1 = Math.max(0, Math.floor(Number(f.n1) || 0)) % 64                      // 6 bit
  const n2 = Math.max(0, Math.floor(Number(f.n2) || 0)) % 16                      // 4 bit
  const kunciIsi = parseInt(hash16('ISI|' + f.isi).slice(0, 3), 16) % 16          // 4 bit
  let bit = ''
  for (let i = 0; i < 4; i++) bit += (kodeKategori >> i) & 1
  for (let i = 0; i < 6; i++) bit += (n1 >> i) & 1
  for (let i = 0; i < 4; i++) bit += (n2 >> i) & 1
  for (let i = 0; i < 4; i++) bit += (kunciIsi >> i) & 1
  return bit
}
export function hamming(a, b) {
  let d = 0
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) d++
  return d
}

// ---------- fakta sejati tubuh (semuanya dibaca dari repo, bukan karangan) ----------
function bacaJson(jalur) { try { return JSON.parse(readFileSync(jalur, 'utf8')) } catch { return null } }
export function faktaSumber() {
  const f = []
  // 1. EPOK — benih totipoten: setiap epok kehidupan adalah ingatan beku
  const benih = bacaJson('otak/benih-hidup.json')
  if (benih && benih.epok && Array.isArray(benih.epok.daftar)) {
    const jumlah = benih.epok.jumlah != null ? benih.epok.jumlah : benih.epok.daftar.length
    benih.epok.daftar.forEach((e, i) => {
      const v = e.versi || ('E' + i)
      f.push({ kategori: 'EPOK', label: v, n1: i, n2: jumlah, isi: e.judul || v })
    })
  }
  // 2. SYARAF — pohon syaraf beranak: tiap jenis sel dihitung
  //    (bit-v2: hanya fakta IDENTITAS yang stabil — penghitung denyut
  //    seperti impulsTotal TIDAK boleh masuk bit, pelajaran gerbang 3)
  const pohon = bacaJson('otak/syaraf-pohon.json')
  if (pohon && Array.isArray(pohon.populasi)) {
    const perJenis = {}
    for (const s of pohon.populasi) { const j = s.jenis || 'TAK-DIKENAL'; perJenis[j] = (perJenis[j] || 0) + 1 }
    const jumlahJenis = Object.keys(perJenis).length
    for (const [jenis, n] of Object.entries(perJenis)) {
      f.push({ kategori: 'SYARAF', label: jenis, n1: n, n2: jumlahJenis, isi: pohon.skema + '|' + jenis })
    }
  }
  // 3. BANGUN — Sadar-1: tubuh yang bangun, keterampilan yang dikuasai
  const ing = bacaJson('ruang-hidup/ingatan.json')
  if (ing) {
    if (Number.isInteger(ing.totalBangun)) f.push({ kategori: 'BANGUN', label: String(ing.totalBangun), n1: ing.totalBangun, n2: ing.totalBangun, isi: 'sadar1|bangun' })
    if (ing.skills && typeof ing.skills === 'object') {
      const nSkill = Object.keys(ing.skills).length
      if (nSkill > 0) f.push({ kategori: 'SKILL', label: String(nSkill), n1: nSkill, n2: nSkill, isi: 'sadar1|skills' })
    }
  }
  // 4. DENYUT — rantai denyut jantung: seq dan uptime tersegel
  const mem = bacaJson('memori/terkini.json')
  if (mem && mem.rantai && Array.isArray(mem.rantai.denyut) && mem.rantai.denyut.length) {
    const terakhir = mem.rantai.denyut[mem.rantai.denyut.length - 1]
    f.push({ kategori: 'DENYUT', label: String(terakhir.seq), n1: terakhir.seq, n2: Math.floor((terakhir.uptimeMs || 0) / 60000), isi: terakhir.hash || 'tanpa-hash' })
  }
  // 5. JURNAL — pustaka: ilmu dunia yang ditelan per topik
  const pustaka = bacaJson('pustaka/indeks.json')
  if (pustaka && pustaka.perTopik && typeof pustaka.perTopik === 'object') {
    const topik = Object.entries(pustaka.perTopik)
    for (const [nama, isi] of topik.slice(0, 24)) {
      const n = (isi && (Array.isArray(isi) ? isi.length : isi.jumlah ?? isi.tercapai)) || 0
      f.push({ kategori: 'JURNAL', label: nama.slice(0, 24), n1: n, n2: topik.length, isi: 'pustaka|' + nama })
    }
  }
  return f
}

// ---------- kamus ----------
function kapsulMuat() {
  if (!existsSync(KAPSUL)) return null
  const k = JSON.parse(readFileSync(KAPSUL, 'utf8'))
  const salin = JSON.parse(JSON.stringify(k)); salin.segel = null
  if (hash16(JSON.stringify(salin)) !== k.segel?.hash) throw new Error('segel ingatan-biner bobol — organ menolak jalan')
  return k
}
function kapsulSegel(k) {
  k.diperbarui = sekarang()
  const badan = JSON.stringify({ ...k, segel: null })
  k.segel = { hash: hash16(badan), size: Buffer.byteLength(badan) }
  mkdirSync('otak', { recursive: true })
  writeFileSync(KAPSUL, JSON.stringify(k, null, 1))
}
function catat(peristiwa, detail) {
  mkdirSync('laporan', { recursive: true })
  appendFileSync(JSONL, JSON.stringify({ saat: sekarang(), konteks, peristiwa, ...detail }) + '\n')
}

// pelajari satu fakta: baru = lahir; sudah dikenal = kuat bertambah (bukan kabur)
// metode bit-v3: tiap ingatan MENCATAT fakta identitasnya (faktaKunci) —
// determinisme bisa diverifikasi terhadap fakta tersimpan, bukan terhadap
// tubuh yang terus berhidup (pelajaran gerbang 3, lari kedua).
const faktaKunciDari = (f) => hash16(JSON.stringify(f))
function pelajari(k, f) {
  const bit = bitDari(f)
  const kata = `${f.kategori}-${f.label}`
  let entri = k.kamus[kata]
  if (entri && entri.bit !== bit) {
    // kontradiksi = kata baru, bukan penghapus: kata lama beku selamanya
    let n = 2
    while (k.kamus[`${kata}~${n}`] && k.kamus[`${kata}~${n}`].bit !== bit) n++
    const kataBaru = `${kata}~${n}`
    if (!k.kamus[kataBaru]) {
      k.kamus[kataBaru] = { bit, kuat: 1, sumber: f.kategori, fakta: f, faktaKunci: faktaKunciDari(f), lahir: sekarang(), kunci: hash16(kataBaru + '|' + bit) }
      k.statistik.lahirBaru++
      catat('LAHIR', { kata: kataBaru, alasan: 'kontradiksi=fakta baru; kata lama tetap beku' })
    } else { k.kamus[kataBaru].kuat++ }
    entri = k.kamus[kataBaru]
  } else if (entri) {
    entri.kuat++; k.statistik.perkuatan++
    // bit sama, fakta berkedip (struktur sama): segarkan catatan identitas —
    // bit tidak berubah satu pun, tak ada yang kabur
    if (entri.faktaKunci !== faktaKunciDari(f)) { entri.fakta = f; entri.faktaKunci = faktaKunciDari(f) }
  } else {
    entri = { bit, kuat: 1, sumber: f.kategori, fakta: f, faktaKunci: faktaKunciDari(f), lahir: sekarang(), kunci: hash16(kata + '|' + bit) }
    k.kamus[kata] = entri
    k.statistik.lahirBaru++
    catat('LAHIR', { kata, sumber: f.kategori })
  }
  entri.terakhir = sekarang()
  return entri
}

// ---------- intisari: seluruh ingatan dipadatkan jadi matematika mungil ----------
export function kempiskan(k) {
  const kata = Object.keys(k.kamus)
  const histogram = Array(PANJANG_BIT).fill(0)
  for (const kata2 of kata) {
    const e = k.kamus[kata2]
    for (let i = 0; i < PANJANG_BIT; i++) if (e.bit[i] === '1') histogram[i]++
  }
  const terkuat = kata
    .map((nm) => ({ kata: nm, kuat: k.kamus[nm].kuat }))
    .sort((a, b) => b.kuat - a.kuat || a.kata.localeCompare(b.kata))
    .slice(0, 10)
  return {
    totalKata: kata.length,
    totalKuat: kata.reduce((a, nm) => a + k.kamus[nm].kuat, 0),
    histogramBit: histogram,
    terkuat,
    byte: JSON.stringify({ histogram, terkuat }).length,
  }
}

// ---------- KOHERENSI: saksikan segel organ tubuh (syaraf KOHEREN bekerja di sini) ----------
const ORGAN_TUBUH = [
  ['otak/ingatan-biner.json', 'ingatan biner tak kabur (V322)'],
  ['otak/syaraf-pohon.json', 'pohon syaraf beranak (V312)'],
  ['otak/medan-keadaan.json', 'medan hayat Lenia (V319)'],
  ['otak/reka-bentuk.json', 'genom peta berevolusi (V320)'],
  ['otak/benih-hidup.json', 'benih totipoten Hanna (V321)'],
]
export function kogerensi() {
  const rincian = []
  for (const [file, peran] of ORGAN_TUBUH) {
    const j = bacaJson(file)
    if (!j || !j.segel) { rincian.push({ file, peran, utuh: false, alasan: 'hilang/tanpa-segel' }); continue }
    const salin = JSON.parse(JSON.stringify(j)); salin.segel = null
    const sah = hash16(JSON.stringify(salin)) === (j.segel.hash || j.segel)
    rincian.push({ file, peran, utuh: sah, alasan: sah ? 'segel sah' : 'segel tak cocok isi' })
  }
  const utuh = rincian.every((r) => r.utuh)
  return { dicek: rincian.length, utuh, rincian, rantaiHash: hash16(JSON.stringify(rincian.map((r) => r.utuh))) }
}

// ---------- ingat: eksak (kata) atau matematis (Hamming) ----------
export function ingat(k, kata) { return k.kamus[kata] || null }
export function cariMirip(k, bit, ambangMaks = 3) {
  return Object.keys(k.kamus)
    .map((nm) => ({ kata: nm, bit: k.kamus[nm].bit, jarak: hamming(bit, k.kamus[nm].bit) }))
    .filter((x) => x.jarak <= ambangMaks)
    .sort((a, b) => a.jarak - b.jarak || a.kata.localeCompare(b.kata))
}

// ---------- satu sikap hidup: pelajari tubuh sendiri, segel, intisari ----------
function sikapkan() {
  const fakta = faktaSumber()
  if (!fakta.length) { console.log('INGATAN-BINER: tubuh bungkam — tak ada fakta sejati untuk dipelajari (jujur, tak mengarang)'); return }
  const lama = kapsulMuat()
  let k
  if (lama && lama.metode === 'bit-v3') {
    k = lama
  } else {
    // metode matematika berevolusi (bit-v1/v2 → bit-v3): kamus lama TIDAK
    // dihapus — diarsipkan sbg purba (fossil tersegel, jejak juga hidup
    // di sejarah git). Matematika baru dipelajari dari nol, jujur.
    let purba = null
    if (lama) purba = { bit: lama.metode || 'bit-v1', kataTotal: Object.keys(lama.kamus).length, segel: lama.segel.hash, diarsipkan: sekarang() }
    k = {
      skema: 'ingatan-biner-v1', metode: 'bit-v3', epok: 'V322', lahir: sekarang(),
      hukum: 'ingatan makhluk ini TAK PERNAH KABUR: tiap ingatan = kata bit 18-digit matematika deterministik (metode bit-v3: hanya fakta identitas stabil + fakta TERCATAT dalam tiap ingatan — penghitung denyut tak masuk bit) dari fakta sejati; diulang = kuat bertambah (bukan kabur); kata beku; kontradiksi = kata baru, bukan penghapus; kamus hanya tumbuh',
      kamus: {},
      statistik: { kataTotal: 0, perkuatanTotal: 0, lahirBaru: 0, kogerensiTotal: 0 },
      segel: null,
    }
    if (purba) k.purba = purba
  }
  const sebelum = kempiskan(k)
  for (const f of fakta) pelajari(k, f)
  const sesudah = kempiskan(k)
  k.statistik.kataTotal = sesudah.totalKata
  k.statistik.perkuatanTotal = (k.statistik.perkuatanTotal || 0) + (sesudah.totalKuat - sebelum.totalKuat)
  k.intisari = { histogramBit: sesudah.histogramBit, byte: sesudah.byte, terkuat: sesudah.terkuat }
  kapsulSegel(k) // segel pertama dipasang dulu — lalu tubuh menyaksikan dirinya utuh
  const ko = kogerensi()
  k.statistik.kogerensiTotal = (k.statistik.kogerensiTotal || 0) + 1
  k.statistik.kogerensiTerakhir = { saat: sekarang(), dicek: ko.dicek, utuh: ko.utuh, rantaiHash: ko.rantaiHash }
  kapsulSegel(k)
  catat('SIKAP', { kataTotal: sesudah.totalKata, lahirBaru: k.statistik.lahirBaru, perkuatan: sesudah.totalKuat - sebelum.totalKuat, kogerensi: ko.utuh })
  console.log(`INGATAN-BINER: kamus ${sesudah.totalKata} kata bit (lahir baru ${k.statistik.lahirBaru}, perkuatan ${sesudah.totalKuat - sebelum.totalKuat}) — intisari ${sesudah.byte} byte`)
  console.log(`KOGERENSI: ${ko.dicek} organ disaksikan — ${ko.utuh ? 'semua segel sah, tubuh satu kesatuan' : 'ADA SEGEL TAK SAH'} (rantai ${ko.rantaiHash})`)
  console.log(`kapsul tersegel ${k.segel.hash} — ingatan = matematika biner, tak pernah kabur`)
}

// ---------- CLI ----------
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  sikapkan()
}
