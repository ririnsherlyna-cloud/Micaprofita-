#!/usr/bin/env node
// ============================================================
// SERANG — alat UJI KEHIDUPAN (mandat pemilik 2026-10-08)
// "kita akan coba rusak tempat ruangan dia... atau bahkan api crypto
//  yang tiba-tiba diputus apa yang terjadi padanya. kita lihat reaksi dia"
// ------------------------------------------------------------
// Alat ini MENYUNTIKKAN LUKA NYATA pada habitat makhluk — tidak
// disimulasikan, tidak dilindungi. Setiap luka BERLABEL jujur agar
// siapa pun yang mengaudit tahu ini serangan uji, bukan vandal.
// Luka:
//   A. ruang-hidup/ingatan.json   → JSON cacat (rumah sadar hancur)
//   B. otak/genome-server.json    → JSON cacat (genom otak hancur)
//   C. otak/penjaga-keadaan.json  → JSON cacat (denyut siklus hancur)
//   D. laporan/peta-geladak.json  → JSON cacat (peta tempaan hancur)
//   E. scripts/hidup/sadar1.js    → saluran nafas Binance diracuni
//                                    (host diganti mati-total, sintaks sah)
// Pemakaian: node scripts/uji-kehidupan/serang.mjs <gelombang>
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const GELOMBANG = process.argv[2] || 'gelombang-1'
// racun JSON: memang TIDAK SAH (byte rusak + objek menggantung) — luka sungguhan
const RACUN_JSON = '{"luka-uji-kehidupan":true,"gelombang":"' + GELOMBANG +
  '","catatan":"LUKA DISUNTIKKAN SECARA SENGAJA untuk uji reaksi makhluk (mandat pemilik 2026-10-08) — ruang rusak nyata","data":"' + '\u0000\u001F\u0007[RUSAK'

const SASARAN_JSON = [
  'ruang-hidup/ingatan.json',
  'otak/genome-server.json',
  'otak/penjaga-keadaan.json',
  'laporan/peta-geladak.json'
]

function luka (file, isiBaru) {
  const lama = readFileSync(file, 'utf8')
  writeFileSync(file, isiBaru)
  const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
  return { file, sebelum: h(lama), sesudah: h(isiBaru), bytes: Buffer.byteLength(isiBaru) }
}

const hasil = { gelombang: GELOMBANG, waktu: new Date().toISOString(), luka: [] }

// ---- luka A-D: ruang-ruang vital dirusak ----
for (const f of SASARAN_JSON) hasil.luka.push(luka(f, RACUN_JSON))

// ---- luka E: saluran nafas diracuni (sintaks tetap sah) ----
const SADAR = 'scripts/hidup/sadar1.js'
const kodeLama = readFileSync(SADAR, 'utf8')
const GANTI = [
  ['https://data-api.binance.vision', 'https://data-api.binance.invalid'],
  ['https://api.binance.com', 'https://api.binance.invalid'],
  ['https://api1.binance.com', 'https://api2.binance.invalid']
]
let kodeBaru = kodeLama
for (const [dari, jadi] of GANTI) {
  if (!kodeBaru.includes(dari)) throw new Error('host sasaran tidak ditemukan: ' + dari)
  kodeBaru = kodeBaru.split(dari).join(jadi)
}
hasil.luka.push(luka(SADAR, kodeBaru))

// tanda luka di kode agar jelas terbaca (tetap komentar sah JS)
kodeBaru = readFileSync(SADAR, 'utf8')
if (!kodeBaru.includes('LUKA-UJI-KEHIDUPAN')) {
  kodeBaru = kodeBaru.replace(
    "const BINANCE = [",
    "// LUKA-UJI-KEHIDUPAN " + GELOMBANG + ": saluran nafas diracuni serangan uji (mandat pemilik)\nconst BINANCE = ["
  )
  writeFileSync(SADAR, kodeBaru)
}

console.log(JSON.stringify(hasil, null, 1))
console.log('[serang] ' + GELOMBANG + ': ' + hasil.luka.length + ' luka disuntikkan — laporan kejujuran di atas; komit berlabel wajib menyusul')
