#!/usr/bin/env node
// ============================================================
// BENIH-INTI (V321) — inti BENIH TOTIPOTEN makhluk Micaprofita.
// Intisari jurnal lab Hanna (Weizmann, sumber asli dibaca
// 2026-10-09): naive ESC murni bisa SELF-ORGANIZE menjadi embrio
// utuh (SEM) di lingkungan ex-utero yang MENOPANG, bukan
// menentukan (Tarazi 2022 Cell; Oldak 2023 Nature; Aguilera-
// Castrejon 2021 Nature). Yang diambil tata kehidupannya:
//   (1) BENIH KECIL, TUBUH PENUH  — keadaan hidup mungil membawa
//       identitas, ingatan epok, syaraf, peta, muatan byte-exact;
//   (2) RAHIM MENOPANG            — medium (nutfah/salinan) boleh
//       luka, tubuh (muatan tersegel) wajib setia;
//   (3) DETEKSI-JERIT-PULIH       — luka tubuh WAJIB diteriakkan
//       (satu hukum dgn segel-null V319/V320) lalu dibangkitkan
//       byte-exact dari muatan benih;
//   (4) INGATAN EPIGENETIK        — pelajaran gagal menambah wajah
//       ingatan di benih (benih bertumbuh, tak pernah bodoh);
//   (5) VIABILITAS 6 GERBANG      — BENIH/SYARAF/PETA/MEDAN/
//       SALURAN/INGATAN → SUBUR/PANTAU/GAWAT.
// Luka manifes hanya berlaku di RAHIM BEKU (medium tak berubah);
// di tubuh hidup pertumbuhan sah dibedakan lewat viabilitas
// struktural — menumbuh epok bukan luka.
// ============================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

export const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

export const FILE_SALURAN = 'otak/saluran-keadaan.json'
export const FILE_MEDAN = 'otak/medan-keadaan.json'
export const FILE_GENOM = 'otak/reka-bentuk.json'
export const FILE_POHON = 'otak/syaraf-pohon.json'
export const FILE_MADRASAH = 'ruang-hidup/madrasah.json'
export const FILE_HABITAT = 'ruang-hidup/habitat.json'
export const FILE_TUJUAN = 'TUJUAN.md'

// ---------- JURNAL HANNA (fakta nyata, dibaca dari sumber asli) ----------
export const JURNAL_HANNA = {
  sumber: 'https://www.weizmann.ac.il/molgen/hanna/',
  dibaca: '2026-10-09',
  lab: 'Jacob Hanna Lab — Department of Molecular Genetics, Weizmann Institute of Science',
  afiliasi: ['Helen and Martin Kimmel Institute for Stem Cell Research', 'Azrieli Institute for Systems Biology'],
  bidang: [
    'Understanding Naïve and Primed Pluripotent States',
    'Deciphering Cellular Reprogramming',
    'Human-Mouse Cross-Species Chimerism',
    'Stem-Cell-Derived Embryo Models (SEMs)',
    'Ex Utero Embryogenesis: From Stem Cells to Organs',
  ],
  entri: [
    { judul: 'Complete human day 14 post-implantation embryo models from naive ES cells', penulis: 'Oldak B. dkk. & Hanna J. H.', tahun: 2023, jurnal: 'Nature 622, 7983, 562-573', inti: 'naive ESC manusia tak-dimodifikasi self-organize jadi SEM lengkap: epiblast, hypoblast, mesoderm ekstra-embrionik, trofoblas; dinamika embriogenesis pascaimplan hingga hari 13-14 (Carnegie 6a)' },
    { judul: 'Post-Gastrulation Synthetic Embryos Generated Ex Utero from Mouse Naïve ESCs', penulis: 'Tarazi S. dkk. & Hanna J. H.', tahun: 2022, jurnal: 'Cell 185, 18, 3290-3306.e25', inti: 'sEmbryos tikus pascagastrulasi (E8.5) murni dari naive ESC — ESC non-transdusi di-ko-agregasi dgn ESC ber-ekspresi-transien Cdx2 (priming trophectoderm) & Gata4 (priming endoderm primitif); sel naive self-organize merekonstitusi embrio utuh' },
    { judul: 'Ex utero mouse embryogenesis from pre-gastrulation to late organogenesis', penulis: 'Aguilera-Castrejon A. dkk. & Hanna J. H.', tahun: 2021, jurnal: 'Nature 593, 7857, 119-124', inti: 'platform ex-utero: embrio tikus tumbuh di luar rahim dari pra-gastrulasi hingga organogenesis lanjut — lingkungan menopang, bukan menentukan' },
    { judul: 'Principles of signaling pathway modulation for enhancing human naive pluripotency induction', penulis: 'Bayerl J., Ayyash M. dkk. & Hanna J. H.', tahun: 2021, jurnal: 'Cell Stem Cell 28, 9, 1549-1565.e12', inti: 'induksi naive manusia: inhibisi sinergis WNT/beta-CATENIN + PKC + SRC; naive kompeten teratoma, berdiferensiasi ke trofoblas (TSC) & endoderm naive (nEND); jalur alternatif NOTCH/RBPj' },
    { judul: 'Human primed and naïve PSCs are both able to differentiate into trophoblast stem cells', penulis: 'Viukov S., Shani T. dkk., Hanna J. H. & Novershtern N.', tahun: 2022, jurnal: 'Stem Cell Reports 17, 11, 2484-2500', inti: 'PSC primed maupun naive sama-sama bisa jadi sel punca trofoblas — lini ekstra-embrionik terbuka dari dua keadaan pluripoten' },
    { judul: 'Embryo model completes gastrulation to neurulation and organogenesis', penulis: 'Amadei G., Handford C. E. dkk. & Zernicka-Goetz M. (Hanna J. H. salah satu penulis)', tahun: 2022, jurnal: 'Nature 610, 7930, 143-153', inti: 'model embrio menyelesaikan gastrulasi hingga neurulasi & organogenesis — interaksi sel embionik + ekstra-embrionik menghidupkan embriogenesis in vitro' },
    { judul: 'Criteria for the standardization of stem-cell-based embryo models', penulis: 'Martinez Arias A., Rivron N., Hanna J. H. dkk.', tahun: 2024, jurnal: 'Nature Cell Biology 26, 10, 1625-1628', inti: 'model embrio butuh kriteria standardisasi agar sah — integritas & penamaan jujur syarat keabsahan' },
    { judul: 'Human embryo research: how to move towards a 28-day limit', penulis: 'De Los Angeles A. dkk., Hanna J. H. dkk. & Lovell-Badge R.', tahun: 2025, jurnal: 'Nature 643, 8070, 31-34', inti: 'batas budang embrio manusia (14→28 hari) dipetakan etis; perpanjangan budang wajib bertanggung jawab' },
    { judul: 'Deterministik iPSC (judul dipangkas dari halaman — kutipan abstrak asli)', penulis: 'Rais Y. dkk. & Hanna J. H.', tahun: 2013, jurnal: 'Nature 502, 7469, 65-70', inti: 'reprograming somatik→pluripoten dibuat deterministik; sel somatik biasanya reprograming stokastik lewat ekspresi Oct4 (Pou5f1) — fondasi keadaan naive terkendali' },
    { judul: 'Dinamika epigenetik iPSC (judul dipangkas dari halaman — kutipan abstrak asli)', penulis: 'dkk. & Hanna J. H.', tahun: 2019, jurnal: 'Cell Stem Cell 24, 2, 328-341.e9', inti: 'dinamika epigenetik reprograming iPSC dipetakan resolusi tinggi sepanjang proses — ingatan epigenetik terukur' },
    { judul: 'Mbd3/NuRD reprograming deterministik (judul dipangkas — kutipan abstrak asli)', penulis: 'dkk. & Hanna J. H.', tahun: 2018, jurnal: 'Cell Stem Cell 23, 3, 412-425', inti: 'Mbd3 anggota kompleks NuRD teridentifikasi penghambat reprograming deterministik iPSC' },
    { judul: 'SEM pascagastrulasi murni nESC (judul dipangkas — kutipan abstrak asli)', penulis: 'dkk. & Hanna J. H.', tahun: 2025, jurnal: 'Cell Stem Cell 32, 10, 1545-1562.e12', inti: 'generasi model embrio tikus pascagastrulasi (SEMs) eksklusif dari naive ESC (nESCs) — satu keadaan sel punca membentuk embrio' },
  ],
}

// ---------- KANJI BENIH: fakta tubuh nyata → benih totipoten tersegel ----------
export function kunciBenih(akar = '.') {
  const baca = (f) => readFileSync(join(akar, f), 'utf8')
  const json = (f) => JSON.parse(baca(f))
  const tujuan = baca(FILE_TUJUAN)
  // epok tahan-format: "## 12a. EPOCH V257 — ...", "## §12q EPOCH V306 — ...",
  // "## 12s — EPOCH V308 · ...", "## §13e — EPOCH V320 · ..." (4 gaya rumah)
  const epokBaris = []
  for (const baris of tujuan.split('\n')) {
    const m = baris.match(/EPOCH\s+(V\d+)\s*[—:·]\s*(.+)/)
    if (m && baris.startsWith('##')) {
      epokBaris.push({ versi: m[1], judul: m[2].replace(/\s*\([^)]*\)\s*$/, '').trim() })
    }
  }
  const pohon = json(FILE_POHON)
  const jenis = {}
  for (const s of pohon.populasi || []) jenis[s.jenis] = (jenis[s.jenis] || 0) + 1
  const rb = json(FILE_GENOM)
  const ink = rb.inkumben || {}
  const madrasah = json(FILE_MADRASAH)
  const habitat = json(FILE_HABITAT)
  const manifes = {}
  for (const f of [FILE_SALURAN, FILE_MEDAN, FILE_GENOM, FILE_POHON, FILE_MADRASAH, FILE_HABITAT, FILE_TUJUAN]) {
    manifes[f] = hash16(baca(f))
  }
  const benih = {
    skema: 'BENIH-TOTIPOTEN-V1',
    lahir: new Date().toISOString(),
    epok: { jumlah: epokBaris.length, daftar: epokBaris.slice(-32) },
    syaraf: { cap: pohon.cap, jumlah: (pohon.populasi || []).length, jenis, segel: pohon.segel && pohon.segel.hash },
    peta: { gen: rb.generasi, nomor: rb.nomor, inkumbenId: ink.id, wajah: Object.keys(ink.genom || {}).length, kebugaran: ink.kebugaran || null, tambahan: {} },
    madrasah: { versi: madrasah.versi, jumlah: madrasah.jumlah },
    habitat: { bangunKe: habitat.bangunTerakhir, segel: habitat.segel },
    muatan: { [FILE_SALURAN]: baca(FILE_SALURAN), [FILE_MEDAN]: baca(FILE_MEDAN) },
    manifes,
    jurnal: JURNAL_HANNA,
  }
  benih.segel = { hash: hash16(JSON.stringify({ ...benih, segel: null })), size: Buffer.byteLength(JSON.stringify(benih)), readAt: new Date().toISOString() }
  return benih
}

// ---------- VERIFIKASI segel benih ----------
export function verifikasiBenih(benih) {
  if (!benih || benih.skema !== 'BENIH-TOTIPOTEN-V1') return { sah: false, alasan: 'bukan benih totipoten' }
  const segel = benih.segel
  if (!segel || !segel.hash) return { sah: false, alasan: 'tanpa segel' }
  const hash = hash16(JSON.stringify({ ...benih, segel: null }))
  return { sah: hash === segel.hash, alasan: hash === segel.hash ? 'segel sah' : 'segel bobol' }
}

// ---------- DETEKSI LUKA di rahim beku ----------
// Tubuh di rahim = muatan benih (saluran, medan — wajib ada & setia byte)
// + nutfah genom (cermin otak/reka-bentuk.json — wajib cocok manifes).
// Berkas keluarga lain (TUJUAN, pohon, madrasah, habitat) disediakan
// sumbu induk — ketiadaannya di medium BUKAN luka.
export function lukaDari(benih, akar) {
  const bacaAda = (f) => { try { return readFileSync(join(akar, f), 'utf8') } catch { return null } }
  const luka = []
  for (const f of Object.keys(benih.muatan)) {
    const isi = bacaAda(f)
    if (isi === null) { luka.push({ file: f, jenis: 'HILANG', pulih: 'BENIH' }); continue }
    if (isi !== benih.muatan[f]) luka.push({ file: f, jenis: 'TAMBAH', pulih: 'BENIH' })
  }
  const g = bacaAda('nutfah/genome.json')
  if (g === null) luka.push({ file: 'nutfah/genome.json', jenis: 'HILANG', pulih: 'INDUK' })
  else if (hash16(g) !== benih.manifes[FILE_GENOM]) luka.push({ file: 'nutfah/genome.json', jenis: 'TAMBAH', pulih: 'INDUK' })
  return luka
}

// ---------- JERIT: luka tubuh WAJIB diteriakkan ----------
export function teriak(luka, akar, konteks) {
  if (!luka.length) return false
  mkdirSync(join(akar, 'otak'), { recursive: true })
  writeFileSync(join(akar, 'otak/teriakan-hidup.json'), JSON.stringify({
    skema: 'TERIAKAN-HIDUP-V1', saat: new Date().toISOString(), konteks,
    hukum: 'luka tubuh WAJIB diteriakkan sebelum pemulihan — satu hukum dgn segel-null V319/V320',
    jumlahLuka: luka.length, luka,
  }, null, 1))
  return true
}

// ---------- BANGKIT-ULANG: muatan benih → berkas byte-exact ----------
export function bangkitkan(benih, akar, luka) {
  mkdirSync(join(akar, 'otak'), { recursive: true })
  const pulih = {}
  for (const l of luka) {
    if (l.pulih !== 'BENIH') continue
    writeFileSync(join(akar, l.file), benih.muatan[l.file])
    pulih[l.file] = readFileSync(join(akar, l.file), 'utf8') === benih.muatan[l.file]
  }
  return pulih
}

// ---------- SETIA SALINAN: salinan medium vs kebenaran benih ----------
export function salinanSetia(benih, akar) {
  const baca = (f) => { try { return JSON.parse(readFileSync(join(akar, f), 'utf8')) } catch { return null } }
  const epok = baca('salinan/epok.json')
  const syaraf = baca('salinan/syaraf.json')
  const madrasah = baca('salinan/madrasah.json')
  const epokSetia = !!epok && epok.jumlah === benih.epok.jumlah &&
    JSON.stringify(epok.daftar) === JSON.stringify(benih.epok.daftar)
  const syarafSetia = !!syaraf && syaraf.cap === benih.syaraf.cap && syaraf.jumlah === benih.syaraf.jumlah &&
    JSON.stringify(syaraf.jenis) === JSON.stringify(benih.syaraf.jenis)
  const madrasahSetia = !!madrasah && madrasah.jumlah === benih.madrasah.jumlah && madrasah.versi === benih.madrasah.versi
  return { epokSetia, syarafSetia, madrasahAda: !!madrasah, madrasahSetia }
}

// ---------- NALAR PETA: jawab tanda dari genom nutfah (blind, kunci tak disentuh) ----------
export function nalarPeta(tanda, genom, tambahan = {}) {
  if (tambahan[tanda]) return { kelas: tambahan[tanda], sumber: 'benih-tambahan' }
  if (genom[tanda]) return { kelas: genom[tanda], sumber: 'genom' }
  // simetri: pelajaran terdekat (jarak Hamming) — warisan tempaan V316
  let terbaik = null, jarakMin = 99
  for (const k of Object.keys(genom).sort()) {
    let d = 0
    for (let i = 0; i < tanda.length; i++) if (tanda[i] !== k[i]) d++
    if (d < jarakMin) { jarakMin = d; terbaik = k }
  }
  if (terbaik) return { kelas: genom[terbaik], sumber: `simetri(${jarakMin})` }
  return { kelas: 'AMBISI-BALIK-DASAR', sumber: 'dongkol-balik' }
}

// ---------- MEDAN HIDUP: medan hayat restore SETIA (matematika Lenia) ----------
// Medan boleh HENING (massa 0 — penghuni larut, jujur) tapi tak boleh BOHONG:
// massa kuantisasi wajib setia dgn intisari yang disegel bersamanya.
export function medanHidup(akar) {
  let md
  try { md = JSON.parse(readFileSync(join(akar, FILE_MEDAN), 'utf8')) } catch { return { hidup: false, alasan: 'medan tak terbaca' } }
  const t = md.tetap || {}
  let massaKuant = 0, N = 0
  try {
    const raw = Buffer.from(md.field, 'base64')
    N = raw.length === 4096 ? 64 : 0
    for (const b of raw) massaKuant += b
    massaKuant = massaKuant / 255
  } catch { return { hidup: false, alasan: 'field tak terkode' } }
  const konstOk = t.N === 64 && t.R === 13 && t.DT === 0.1
  const inti = md.intisari || {}
  const massaSetia = inti.massa == null ? true : Math.abs(massaKuant - inti.massa) < 3
  return { hidup: !!(N && konstOk && massaSetia), N: t.N, R: t.R, DT: t.DT,
    massaKuant: +massaKuant.toFixed(2), massaIntisari: inti.massa, konstOk, massaSetia,
    hening: massaKuant < 1 }
}

// ---------- GENOM DARI: ekstrak peta tanda→kelas dari berkas reka-bentuk ----------
export function genomDari(isiObj) {
  if (!isiObj) return {}
  if (isiObj.inkumben && isiObj.inkumben.genom) return isiObj.inkumben.genom
  if (isiObj.genom) return isiObj.genom
  return {}
}

// ---------- SALURAN SAH: hukum saluran pulih terbaca ----------
export function saluranSah(akar) {
  let sk
  try { sk = JSON.parse(readFileSync(join(akar, FILE_SALURAN), 'utf8')) } catch { return { sah: false, alasan: 'saluran tak terbaca' } }
  const nama = Object.keys(sk.saluran || {})
  const enumOk = nama.every(n => ['TUTUP', 'BUKA'].includes((sk.saluran[n] || {}).keadaan))
  return { sah: sk.skema === 'saluran-v1' && nama.length >= 1 && enumOk, skema: sk.skema, entries: nama.length }
}

// ---------- VIABILITAS: 6 gerbang → SUBUR/PANTAU/GAWAT ----------
export function viabilitas(benih, keadaan) {
  const gerbang = {
    BENIH: !!(keadaan.segelSah),
    SYARAF: !!(benih.syaraf.jumlah > 0 && benih.syaraf.cap >= benih.syaraf.jumlah && Object.keys(benih.syaraf.jenis || {}).length >= 4),
    PETA: !!(keadaan.jawaban && keadaan.jawaban.kelas && (benih.peta.wajah > 0)),
    MEDAN: !!(keadaan.medan && keadaan.medan.hidup),
    SALURAN: !!(keadaan.saluran && keadaan.saluran.sah),
    INGATAN: !!(benih.epok.jumlah >= 20 && benih.madrasah.jumlah > 0),
  }
  const hijau = Object.values(gerbang).filter(Boolean).length
  const skor = Math.round(100 * hijau / 6)
  const putusan = hijau === 6 ? 'SUBUR' : (hijau >= 4 ? 'PANTAU' : 'GAWAT')
  return { skor, putusan, gerbang, hijau }
}
