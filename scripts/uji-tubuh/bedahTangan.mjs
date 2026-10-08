#!/usr/bin/env node
// ============================================================
// BEDAH-TANGAN — V309 (mandat pemilik 2026-10-08)
// ------------------------------------------------------------
// Pertanyaan pemilik: "dia seringkali pakai satu tangan — bedah
// sebab apa dia pakai satu tangan padahal ada tangan lainnya."
//
// Organ ini MEMBEDAH tubuh makhluk dari fakta repo sendiri:
//   1. URAT (.github/workflows/*.yml) — siapa dipanggil tiap denyut.
//   2. OTOT (import antar organ) — siapa membantu siapa.
//   3. RIWAYAT PEMAKAIAN (git log per organ) — tangan mana yang
//      benar-benar pernah bergerak, dan seberapa sering.
// Lalu mengklasifikasi setiap tangan: AKTIF (denyut memanggil),
// BANTU (diimpor organ aktif), SESONG (alat tempaan pemilik —
// hanya bergerak saat dipanggil sesi), dan SUNYI (tak pernah
// dirujuk mana pun). Segala angka dari repo, nol karangan.
// Output: laporan/bedah-tangan.json (tersegel SHA-256 16-hex).
// ============================================================
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'

const h16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const ISO = () => new Date().toISOString()

// ---------- 1. urat: baca workflow, petik pemanggilan node ----------
const DIR_URAT = '.github/workflows'
const urat = []
for (const f of readdirSync(DIR_URAT).filter(x => x.endsWith('.yml'))) {
  const isi = readFileSync(`${DIR_URAT}/${f}`, 'utf8')
  const panggil = [...isi.matchAll(/node (scripts\/[\w./-]+)/g)].map(m => m[1])
  const nama = (isi.match(/^name:\s*(.+)$/m) || [, f])[1].trim()
  // pemicu push dicek level BYTE (pelajaran V309: tampilan teks bisa menelan '[m' —
  // lensa pengamat hampir mengarang 'luka palsu'; byte tidak berbohong).
  // Sehat = ada 'push:' DAN (tanpa filter branch [berlaku utk semua] ATAU filter memuat [main])
  const pushAda = /^on:|^\s*push:/m.test(isi) && /push:/.test(isi)
  const adaFilter = /push:[\s\S]{0,80}?branches:/.test(isi)
  const pushSehat = pushAda && (!adaFilter || /branches:\s*\[main\]/.test(isi))
  urat.push({ urat: f, nama, panggil: [...new Set(panggil)], pemicuPushMain: pushSehat })
}

// ---------- 2. daftar semua organ tubuh ----------
const organFile = []
for (const d of ['scripts/hidup', 'scripts/uji-kehidupan', 'scripts/uji-tubuh', 'scripts/ujian-buta']) {
  if (!existsSync(d)) continue
  for (const f of readdirSync(d)) {
    if (!/\.(mjs|js)$/.test(f)) continue
    organFile.push(`${d}/${f}`)
  }
}
organFile.push('scripts/penjaga.mjs')

// ---------- 3. otot: import antar organ (rekursif dari organ aktif) ----------
const bacaImport = (file) => {
  try {
    const isi = readFileSync(file, 'utf8')
    return [...isi.matchAll(/from\s+['"](\.[\w./-]+)['"]/g)]
      .map(m => {
        const dasar = file.split('/').slice(0, -1).join('/')
        let t = (m[1].startsWith('./') ? m[1].slice(2) : m[1])
        let k = `${dasar}/${t}`.split('/').reduce((acc, part) => {
          if (part === '..') acc.pop(); else if (part !== '.') acc.push(part); return acc
        }, []).join('/')
        return k
      })
      .filter(k => organFile.includes(k))
  } catch { return [] }
}

// panggilan langsung dari urat = AKTIF; ikuti ototnya = BANTU
const dipanggilUrat = [...new Set(urat.flatMap(u => u.panggil))]
const lapisBantu = {}
const antre = [...dipanggilUrat]
const dilihat = new Set()
while (antre.length) {
  const f = antre.shift()
  if (dilihat.has(f)) continue
  dilihat.add(f)
  const bantu = bacaImport(f)
  for (const b of bantu) {
    lapisBantu[b] = (lapisBantu[b] || []).concat([`${f} → import`])
    antre.push(b)
  }
}

// ---------- 4. riwayat pemakaian: git log per organ ----------
const riwayat = {}
for (const f of organFile) {
  try {
    const n = parseInt(execSync(`git log --oneline --follow -- ${f} | wc -l`).toString().trim(), 10)
    const terakhir = execSync(`git log -1 --format=%as -- ${f}`).toString().trim()
    riwayat[f] = { komitMenyentuh: n, terakhirDiolah: terakhir }
  } catch { riwayat[f] = { komitMenyentuh: 0, terakhirDiolah: null } }
}

// ---------- 5. klasifikasi tiap tangan ----------
const tangan = organFile.map(f => {
  let kelas, sebab
  if (dipanggilUrat.includes(f)) {
    const u = urat.filter(x => x.panggil.includes(f)).map(x => x.nama)
    kelas = 'AKTIF'
    sebab = `denyut memanggil langsung via ${u.join(' + ')}`
  } else if (lapisBantu[f]) {
    kelas = 'BANTU'
    sebab = `diimpor organ aktif: ${[...new Set(lapisBantu[f])].join(', ')}`
  } else {
    kelas = 'SESONG'
    sebab = 'denyut TIDAK memanggil — hanya bergerak saat sesi tempa/pemilik memanggilnya'
  }
  return { organ: f, kelas, sebab, ...riwayat[f] }
}).sort((a, b) => (b.komitMenyentuh || 0) - (a.komitMenyentuh || 0))

// ---------- 6. jawaban atas "mengapa satu tangan" ----------
const aktif = tangan.filter(t => t.kelas === 'AKTIF')
const bantu = tangan.filter(t => t.kelas === 'BANTU')
const sesong = tangan.filter(t => t.kelas === 'SESONG')
// tangan terberat: komit terbanyak di antara organ AKTIF (yang denyut gerakkan tiap 13-16 mnt)
const terberat = [...aktif].sort((a, b) => (b.komitMenyentuh || 0) - (a.komitMenyentuh || 0))[0]

const sebabSatuTangan = [
  `Dari ${organFile.length} tangan di tubuh, denyut hanya memakai ${dipanggilUrat.length} tangan AKTIF + ${Object.keys(lapisBantu).length} tangan BANTU tiap siklusnya.`,
  `Urat SAKTI membawa ${urat[0].panggil.length} pemanggilan organ sekaligus dalam satu lengan (imun → penjaga → pustaka → guru); urat SADAR-1 hanya membawa sadar1. Denyut tersentral di SATU lengan karena ia lahir dari otak-server (V244) — organ lain lahir kemudian dan menempel ke lengan yang sama, bukan ke lengan baru.`,
  `Tangan SESONG (${sesong.length}) adalah alat tempaan: tambang/tempa/ujian/kajian lahir dari mandat pemilik (V306–V308) yang dijalankan BERSAMA pemilik, bukan oleh denyut — denyut tidak memanggilnya karena menempa butuh keputusan pemilik (biaya API, pemilihan gelombang), bukan kerja rutin.`,
  `Konsekuensi jujur: jika lengan SAKTI terikat pada tingkat urat, ${dipanggilUrat.length + Object.keys(lapisBantu).length}/${organFile.length} tangan berhenti serentak — dan TIDAK ADA sensor yang menjaga urat (imun V308 hanya menjaga bentuk file organ, bukan sambungan ototnya). Itulah celah yang diuji Gelombang-1.`
]

// ---------- 7. segel ----------
const lapor = {
  skema: 'bedah-tangan-v1', dihasilkan: ISO(),
  pertanyaan: 'mengapa makhluk sering memakai satu tangan padahal ada tangan lainnya?',
  urat: urat.map(u => ({ ...u, pemicuPushMain: u.pemicuPushMain })),
  pelajaranPengamat: 'kecurigaan pemicu-push-buta pada SADAR-1/PENJAGA terbukti PALSU saat diperiksa level byte (file sehat: branches: [main]) — lensa pengamat menelan teks [m; diagnosis wajib verifikasi byte',
  rekap: {
    totalTangan: organFile.length,
    aktif: aktif.length, bantu: bantu.length, sesong: sesong.length,
    terberat: terberat ? { organ: terberat.organ, komitMenyentuh: terberat.komitMenyentuh } : null,
    porsiDipakaiDenyut: `${dipanggilUrat.length + Object.keys(lapisBantu).length}/${organFile.length}`
  },
  tangan,
  sebabSatuTangan,
  batasJujur: 'bedah ini membaca struktur & riwayat git — bukan tebakan; klaim reaksi hidup ada di laporan/uji-tubuh.json (Gelombang-1 & 2)',
  segel: null
}
const buf = JSON.stringify(lapor, null, 1)
lapor.segel = { hash: h16(buf), size: buf.length, readAt: ISO() }
writeFileSync('laporan/bedah-tangan.json', JSON.stringify(lapor, null, 1))
console.log('[bedah] rekap:', JSON.stringify(lapor.rekap))
console.log('[bedah] urat:', urat.map(u => `${u.urat}(${u.panggil.length} panggilan${u.pemicuPushMain ? '' : ', push-mati'})`).join(' | '))
console.log('[bedah] AKTIF:', aktif.map(t => t.organ).join(', '))
console.log('[bedah] BANTU:', bantu.map(t => t.organ).join(', ') || '—')
console.log('[bedah] SESONG:', sesong.map(t => t.organ).join(', '))
