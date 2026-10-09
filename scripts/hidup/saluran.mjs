#!/usr/bin/env node
// ============================================================
// SALURAN-PULIH (V314) — mandat pemilik 2026-10-09:
//   "periksakan micaprofita arena AGI ... error circuit open ...
//    jangan sampai dalam segala situasi apapun salurannya bermasalah,
//    baik dari servermu atau dari pihak sana — harus kuat."
// ------------------------------------------------------------
// DIAGNOSIS yang ditemukan (dibedah dulu, bukan dikira-kira):
//   1. otak-llm.mjs: sekali tembak, tanpa retry/breaker — gateway
//      LLM yang bermasalah memakan 50 dtk hang per denyut.
//   2. penjaga.mjs (paru-dunia): fetch ping/time/repo TANPA batas
//      waktu — bisa menggantung dan membakar denyut.
//   3. arena.html (cermin): sekali "TERPUTUS" tidak ada siklus
//      sambung-ulang — saluran diam tanpa mendengar lagi.
//
// HUKUM SALURAN-PULIH (ditempa dari diagnosis itu):
//   H1. TIDAK PERNAH MACET TERBUKA — breaker TUTUP→TERBUKA→SETENGAH:
//       setelah jeda pendinguhan, probe nyata otomatis disondongkan;
//       pihak luar pulih → saluran pulih sendiri, tanpa tangan manusia.
//   H2. TIDAK PERNAH BISU — saat terbuka, jawaban cadangan (nalar
//       lokal / snapshot / keadaan terakhir) keluar DALAM MILIDETIK;
//       pemanggil tidak pernah menunggu pihak yang sedang tumbang.
//   H3. TIDAK PERNAH MENGHANG — setiap percobaan berbatas waktu
//       (AbortController), retry berjenjang pendek + jitter;
//       total nafas panggilan dibatasi ketat.
//   H4. SOPAN KE PIHAK SANA — saat terbuka, NOL tembakan ke upstream
//       kecuali satu probe yang dijadwalkan (bukan hujan tembakan).
//   H5. JUJUR & TERSEGEL — setiap perubahan keadaan dijurnal
//       (laporan/saluran.jsonl) dan snapshot tersegel hash16
//       (laporan/saluran.json); angka, bukan retorika.
//
// Pemakaian (pustaka):
//   import { buatSaluran } from './saluran.mjs'
//   const s = buatSaluran('llm', { batasMs: 20000, cobaMaks: 2 })
//   const hasil = await s.panggil(fnNaik, fnCadangan)
// Uji nyata (server HTTP lokal sungguhan yang dimati-dinyalakan):
//   node scripts/hidup/saluran.mjs --uji
// ============================================================
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const BERKAS_KEADAAN = 'otak/saluran-keadaan.json'
const JURNAL = 'laporan/saluran.jsonl'
const SNAPSHOT = 'laporan/saluran.json'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const nowIso = () => new Date().toISOString()

function bacaPeta () {
  try { return JSON.parse(readFileSync(BERKAS_KEADAAN, 'utf8')) } catch { return { skema: 'saluran-v1', saluran: {} } }
}
function tulisPeta (peta) {
  try {
    mkdirSync('otak', { recursive: true })
    writeFileSync(BERKAS_KEADAAN, JSON.stringify(peta, null, 1))
  } catch {}
}
function jurnal (entri) {
  try {
    mkdirSync('laporan', { recursive: true })
    appendFileSync(JURNAL, JSON.stringify(entri) + '\n')
  } catch {}
}

export function buatSaluran (nama, opsi = {}) {
  const o = {
    nGagalBuka: opsi.nGagalBuka || 3,        // gagal beruntun → TERBUKA
    jedaDasarMs: opsi.jedaDasarMs ?? 20000,  // jeda pendinguhan pertama
    jedaMaksMs: opsi.jedaMaksMs ?? 900000,   // batas jeda (15 menit)
    cobaMaks: opsi.cobaMaks ?? 2,            // percobaan per panggilan
    batasMs: opsi.batasMs ?? 20000,          // batas waktu per percobaan
    jedaCobaMs: opsi.jedaCobaMs ?? 400,      // nafas antar-percobaan (± jitter)
    ...opsi,
  }
  const s = {
    nama, keadaan: 'TUTUP', gagalBeruntun: 0, jedaMs: o.jedaDasarMs,
    bukaPada: 0, setengahPakai: 0,
    panggilTotal: 0, gagalTotal: 0, cadanganJawab: 0, tembakanTotal: 0,
    bukaBerapaKali: 0, pulihBerapaKali: 0, durasiBukaTerakhirMs: null,
    durasiBukaMaksMs: 0, pulihTerakhir: null, alasanBuka: null,
  }
  // H5: keadaan dipersist — denyut berikutnya INGAT breaker terbuka
  const petaLama = bacaPeta()
  const ingatan = petaLama.saluran && petaLama.saluran[nama]
  if (ingatan && ingatan.keadaan) {
    Object.assign(s, {
      keadaan: ingatan.keadaan, gagalBeruntun: ingatan.gagalBeruntun || 0,
      jedaMs: ingatan.jedaMs || o.jedaDasarMs, bukaPada: ingatan.bukaPada || 0,
      panggilTotal: ingatan.panggilTotal || 0, gagalTotal: ingatan.gagalTotal || 0,
      cadanganJawab: ingatan.cadanganJawab || 0, tembakanTotal: ingatan.tembakanTotal || 0,
      bukaBerapaKali: ingatan.bukaBerapaKali || 0, pulihBerapaKali: ingatan.pulihBerapaKali || 0,
      durasiBukaTerakhirMs: ingatan.durasiBukaTerakhirMs ?? null,
      durasiBukaMaksMs: ingatan.durasiBukaMaksMs || 0,
      pulihTerakhir: ingatan.pulihTerakhir || null, alasanBuka: ingatan.alasanBuka || null,
    })
  }

  const simpan = () => {
    const peta = bacaPeta()
    peta.saluran = peta.saluran || {}
    peta.diperbarui = nowIso()
    peta.saluran[nama] = { ...s, nama: undefined }
    delete peta.saluran[nama].nama
    tulisPeta(peta)
  }
  const catat = (peristiwa, ekstra = {}) => {
    jurnal({ waktu: nowIso(), saluran: nama, peristiwa, keadaan: s.keadaan, ...ekstra })
  }

  function buka (alasan) {
    s.keadaan = 'TERBUKA'
    s.bukaPada = Date.now()
    s.bukaBerapaKali++
    s.alasanBuka = String(alasan).slice(0, 160)
    simpan()
    catat('BUKA', { alasan: s.alasanBuka, jedaMs: s.jedaMs, gagalBeruntun: s.gagalBeruntun })
  }
  function tutupPulih () {
    const durasi = s.bukaPada ? Date.now() - s.bukaPada : 0
    s.keadaan = 'TUTUP'
    s.gagalBeruntun = 0
    s.jedaMs = o.jedaDasarMs
    s.bukaPada = 0
    s.pulihBerapaKali++
    s.durasiBukaTerakhirMs = durasi
    s.durasiBukaMaksMs = Math.max(s.durasiBukaMaksMs, durasi)
    s.pulihTerakhir = nowIso()
    simpan()
    catat('TUTUP-PULIH', { durasiBukaMs: durasi })
  }

  // satu percobaan nyata berbatas waktu (H3)
  async function tembakan (fnNaik) {
    s.tembakanTotal++
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(new Error('habis-waktu ' + o.batasMs + 'ms')), o.batasMs)
    try {
      return await fnNaik(ac.signal)
    } finally { clearTimeout(t) }
  }

  // ==== inti saluran ====
  async function panggil (fnNaik, fnCadangan) {
    s.panggilTotal++
    const t0 = Date.now()

    // H1+H2: terbuka & belum saatnya probe → jawaban cadangan DALAM MILIDETIK
    if (s.keadaan === 'TERBUKA') {
      const lewat = Date.now() - s.bukaPada
      if (lewat < s.jedaMs) {
        s.cadanganJawab++
        simpan()
        return jawabCadangan(fnCadangan, new Error('saluran TERBUKA (jeda pulih ' + Math.ceil((s.jedaMs - lewat) / 1000) + 's lagi) — cadangan dijawab tanpa menunggu'), t0, false)
      }
      // H1: jeda pendinguhan lewat → sondong probe SETENGAH
      s.keadaan = 'SETENGAH'
      s.setengahPakai = 0
      catat('SETENGAH', { jedaMs: s.jedaMs })
    }
    if (s.keadaan === 'SETENGAH' && s.setengahPakai >= 1) {
      // probe sedang berjalan di pemanggil lain / probe gagal baru saja — jangan hujan
      s.cadanganJawab++
      return jawabCadangan(fnCadangan, new Error('probe SETENGAH sedang dikerjakan — cadangan dijawab'), t0, false)
    }
    if (s.keadaan === 'SETENGAH') s.setengahPakai++

    let gagalTerakhir = null
    for (let coba = 1; coba <= o.cobaMaks; coba++) {
      try {
        const hasil = await tembakan(fnNaik)
        if (s.keadaan === 'SETENGAH') tutupPulih()
        else if (s.gagalBeruntun > 0) { s.gagalBeruntun = 0; simpan() }
        return hasil
      } catch (e) {
        gagalTerakhir = e
        if (coba < o.cobaMaks) {
          const jitter = Math.floor(Math.random() * o.jedaCobaMs)
          await new Promise((r) => setTimeout(r, o.jedaCobaMs + jitter))
        }
      }
    }
    // semua percobaan gagal
    s.gagalTotal++
    if (s.keadaan === 'SETENGAH') {
      // H1: probe gagal → terbuka lagi, jeda naik (backoff berbatas)
      s.jedaMs = Math.min(s.jedaMs * 2, o.jedaMaksMs)
      buka('probe SETENGAH gagal: ' + (gagalTerakhir && gagalTerakhir.message))
    } else {
      s.gagalBeruntun++
      if (s.gagalBeruntun >= o.nGagalBuka) buka(gagalTerakhir && gagalTerakhir.message)
      else simpan()
    }
    return jawabCadangan(fnCadangan, gagalTerakhir, t0, true)
  }

  function jawabCadangan (fnCadangan, err, t0, hitung) {
    if (hitung) s.cadanganJawab++
    if (typeof fnCadangan === 'function') {
      const jawab = fnCadangan(err)
      simpan()
      return jawab
    }
    simpan()
    throw err
  }

  return {
    panggil,
    get keadaan () { return s.keadaan },
    poel: () => ({ ...s }),
    simpan,
  }
}

// ============================================================
// UJI NYATA — server HTTP lokal sungguhan yang dimati & dinyalakan.
// Bukan mock fungsi: breaker menghadap jaringan TCP beneran
// (fetch, timeout, port). Fase:
//   A. server MATI (503)   → bukti: TERBUKA cepat + cadangan milidetik
//                            + NOL tembakan ke upstream saat terbuka (H4)
//   B. rute MENGHANG       → bukti: habis-waktu ketat, tak menggantung (H3)
//   C. server HIDUP (200)  → bukti: probe SETENGAH → TUTUP-PULIH sendiri (H1)
// Hasil: laporan/saluran.json tersegel + jurnal saluran.jsonl.
// ============================================================
import http from 'node:http'

function buatServerUji () {
  const st = { hidup: false, ditembak: 0 }
  const srv = http.createServer((req, res) => {
    st.ditembak++
    if (!st.hidup) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end('{"error":"upstream tumbang"}'); return }
    if (req.url === '/lambat') return // sengaja tak pernah menjawab (uji hang)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end('{"ok":true,"pada":"' + nowIso() + '"}')
  })
  return { srv, st }
}

const tunggu = (ms) => new Promise((r) => setTimeout(r, ms))

async function ujiUtama () {
  const hasil = { skema: 'saluran-uji-v1', waktu: nowIso(), mandat: 'V314 SALURAN-PULIH — benahi circuit open: saluran tak pernah macet terbuka, tak pernah bisu, tak pernah menghang', fase: {}, lulus: 0, gugur: 0, vonis: [] }
  const vonis = (nama, ok, ket) => { hasil.fase[nama] = { lulus: ok, ket }; if (ok) hasil.lulus++; else hasil.gugur++; console.log((ok ? '  LULUS ' : '  GUGUR ') + nama + ' — ' + ket) }

  const hapusUji = (nama) => { const peta = bacaPeta(); if (peta.saluran) { delete peta.saluran[nama]; tulisPeta(peta) } }
  hapusUji('uji-hang'); hapusUji('uji-mati')

  const { srv, st } = buatServerUji()
  await new Promise((r) => srv.listen(0, '127.0.0.1', r))
  const port = srv.address().port
  const url = 'http://127.0.0.1:' + port
  hasil.serverUji = { url, jujur: 'upstream uji = server HTTP lokal nyata (node:http) yang dimati-dinyalakan; breaker menghadap jaringan TCP sungguhan' }
  console.log('SALURAN-PULIH — uji nyata di ' + url)

  // ---- FASE B (lebih dulu, breaker masih TUTUP): rute menghang → wajib gugur ketat
  // pemanggil nyata mengecek r.ok — uji meniru persis kontrak itu
  const naikJson = async (signal, jalan) => {
    const r = await fetch(url + jalan, { signal })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return r.json()
  }
  {
    const s = buatSaluran('uji-hang', { batasMs: 1200, cobaMaks: 2, nGagalBuka: 99, jedaDasarMs: 4000 })
    st.hidup = true // server "nyala" tapi rute /lambat tak pernah menjawab
    const t0 = Date.now()
    let jawabCadangan = false
    const h = await s.panggil(async (signal) => naikJson(signal, '/lambat'), () => { jawabCadangan = true; return { cadangan: true } })
    const durasi = Date.now() - t0
    const ok = jawabCadangan && durasi < 4000 && s.keadaan === 'TUTUP'
    vonis('B-hang-terkendali', ok,
      'panggil ke rute yang tak pernah menjawab: gugur dalam ' + durasi + 'ms (batas 2×1200ms+nafas), cadangan dijawab=' + jawabCadangan + ' — TIDAK menggantung selamanya (H3)')
    hasil.fase['B-hang-terkendali'].durasiMs = durasi
    // reset state saluran uji ini agar tidak mengotori peta
    const peta = bacaPeta(); delete peta.saluran['uji-hang']; tulisPeta(peta)
  }

  // ---- FASE A: server MATI → TERBUKA cepat + cadangan milidetik + sopan (nol tembakan saat terbuka)
  st.hidup = false
  st.ditembak = 0
  const sA = buatSaluran('uji-mati', { batasMs: 1200, cobaMaks: 2, nGagalBuka: 2, jedaDasarMs: 6000 })
  const tA0 = Date.now()
  let cadanganCepatMs = null
  let tembakanSaatBuka = -1
  const tA = setInterval(async () => {
    if (sA.keadaan === 'TERBUKA') {
      tembakanSaatBuka = st.ditembak
      const tc = Date.now()
      const h = await sA.panggil(async (signal) => naikJson(signal, '/api'), () => ({ cadangan: true, alasan: 'nalar lokal' }))
      cadanganCepatMs = Date.now() - tc
      if (!h.cadangan) vonis('A-cadangan-jujur', false, 'cadangan tak dijawab saat terbuka!')
    }
  }, 500)
  while (sA.keadaan !== 'TERBUKA' && Date.now() - tA0 < 20000) {
    await sA.panggil(async (signal) => naikJson(signal, '/api'), () => ({ cadangan: true, alasan: 'nalar lokal' }))
  }
  const bukaDalamMs = Date.now() - tA0
  await tunggu(1600) // biarkan interval buktikan cadangan cepat
  clearInterval(tA)
  vonis('A-buka-cepat', sA.keadaan === 'TERBUKA' && bukaDalamMs < 10000,
    'upstream 503 terus: breaker TERBUKA dalam ' + bukaDalamMs + 'ms (bukan menunggu 50 dtk tiap panggilan) (H1)')
  vonis('A-cadangan-milidetik', cadanganCepatMs != null && cadanganCepatMs < 50,
    'saat terbuka, jawaban cadangan keluar dalam ' + cadanganCepatMs + 'ms — saluran TIDAK PERNAH BISU (H2)')
  vonis('A-sopan-ke-pihak-sana', tembakanSaatBuka !== -1 && st.ditembak - tembakanSaatBuka <= 1,
    'semasa terbuka: tembakan ke upstream naik hanya ' + (st.ditembak - tembakanSaatBuka) + ' (probe terjadwal, bukan hujan) (H4)')

  // ---- FASE C: server HIDUP → probe SETENGAH → TUTUP-PULIH sendiri
  st.hidup = true
  const tC0 = Date.now()
  const batasC = 25000
  while (sA.keadaan !== 'TUTUP' && Date.now() - tC0 < batasC) {
    await sA.panggil(async (signal) => naikJson(signal, '/api'), () => ({ cadangan: true }))
    await tunggu(500)
  }
  const pulihDalamMs = Date.now() - tC0
  const p = sA.poel()
  vonis('C-pulih-sendiri', sA.keadaan === 'TUTUP' && p.pulihBerapaKali >= 1,
    'pihak luar pulih → probe SETENGAH menyala → TUTUP sendiri dalam ' + pulihDalamMs + 'ms tanpa tangan manusia (H1); durasi terbuka tercatat ' + p.durasiBukaTerakhirMs + 'ms')

  hasil.metrik = { saluran: 'uji-mati', ...p, bukaDalamMs, pulihDalamMs, tembakanServerTotal: st.ditembak }
  srv.close()

  // ---- segel & snapshot
  hasil.segel = hash16(JSON.stringify({ fase: hasil.fase, metrik: hasil.metrik }))
  try {
    mkdirSync('laporan', { recursive: true })
    writeFileSync(SNAPSHOT, JSON.stringify(hasil, null, 1))
    jurnal({ waktu: nowIso(), saluran: 'uji-mati', peristiwa: 'UJI-SELESAI', lulus: hasil.lulus, gugur: hasil.gugur, segel: hasil.segel })
  } catch {}

  console.log('SEGEL ' + hasil.segel + ' — laporan/saluran.json · lulus ' + hasil.lulus + '/' + (hasil.lulus + hasil.gugur))
  process.exit(hasil.gugur === 0 ? 0 : 1)
}

const langsung = process.argv[1] && process.argv[1].endsWith('saluran.mjs')
if (langsung) {
  if (process.argv.includes('--uji')) ujiUtama().catch((e) => { console.error('uji gagal keras:', e); process.exit(1) })
  else console.log('pustaka saluran-pulih — pakai: node scripts/hidup/saluran.mjs --uji')
}
