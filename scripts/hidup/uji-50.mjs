#!/usr/bin/env node
/* ================================================================
   UJI-50 — TURNAMEN HARIAN 50 KOIN (mandat pemilik 2026-10-11)
   ----------------------------------------------------------------
   Kata pemilik: "dia melaksanakan TRY 50 koin pilihan — dia menguji,
   merender, dan mengkaji; yang keyakinannya paling besar di paling
   atas, yang sedikit di paling bawah. Tiada henti hingga akhirnya
   dia bisa jadi master crypto — sebab tiap harinya dia trade crypto:
   menentukan arah BUY, apakah benar terkena TP, apakah benar terkena
   ambisius, atau justru terkena SL. Setiap hari ada daftar kemenangan
   dari tiap koin dengan data informasinya dan alasannya."

   JAWABAN: organ ini adalah LAPANGAN tempat musyawarah V336
   DIBUKTIKAN NYATA. Satu kali per hari (UTC) 50 koin teratas meja
   (sudah urut keyakinan: terbesar di atas) didaftar sebagai peserta
   turnamen hari itu — PAKEM-LIMA-BARISnya DIBEKUKAN sebagai soal.
   Tiap denyut berikutnya organ ini PANEN: lilin 5m Binance sesungguhnya
   menyatakan tiap peserta:
     kalah-sl        stop tersentuh duluan (lilin sama = stop dianggap duluan — jujur)
     menang-tp       jual profit tersentuh, sisanya terselamatkan di impas
     menang-ambisius jual ambisius tersentuh setelah profit terkunci
     kedaluwarsa-*   48 jam tanpa selesai — ditutup di harga terakhir, diakui arahnya
   Hasilnya punya DATA: waktu sentuh, harga sentuh, ret%, R.
   Daftar kemenangan tiap hari ditulis di file turnamen; kurva
   belajar (laporan/uji-50/kurva.json) mengukur arah melawan DINDING
   48,88% (CERMIN-100RB) dan melahirkan BOBOT-KELUARGA yang dibaca
   meja musyawarah esok — belajar nyata yang tak pernah hilang.

   Hukum: satu sumber (laporan/musyawarah.json — SATU-MUSYAWARAH);
   peserta didinginkan sekali per hari (bukan diubah-ubah); tanpa
   Math.random; tanpa TUNGGU; setiap peserta WAJIB BUY ber-pakem
   penuh — yang tidak punya pakem tak pernah jadi peserta.

   Mode:  --denyut   panen + daftar turnamen hari ini + kurva (jantung)
          --uji      uji invarian seluruh turnamen yang tersimpan
          (tanpa)    panen + cetak ringkasan
   ================================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { fetchTahan, tidur, fmt, hash16 } from './musyawarah-inti.mjs'

export const PROTOKOL_UJI = 'UJI-50-V337'
const DIR_UJI = 'laporan/uji-50'
const FILE_MUSYAWARAH = 'laporan/musyawarah.json'
const MAKS_PESERTA = 50
const UMUR_MUSYAWARAH_MS = 6 * 3600e3   // meja lebih tua dari ini tidak layak jadi soal — jujur menunggu segel segar
const UMUR_KEDALUWARSA_JAM = 48
const HARI_SIMPAN = 8                    // kurva & panen menggiring 8 hari terakhir
const DINDING_ARAH_100K = 48.88          // CERMIN-100RB V334 — tembok yang harus ditembus tiap hari
const DINDING_SERAKAH_100K = 21.78

const tanggalUtc = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10)
const fileHari = (t) => `${DIR_UJI}/turnamen-${t}.json`
const STATUS_AKHIR = new Set(['kalah-sl', 'menang-tp', 'menang-ambisius', 'kedaluwarsa-benar', 'kedaluwarsa-salah'])

// ---------- klines 5m sejak waktu T (satu panggil, 1000 lilin ≈ 83 jam) ----------
async function lilin5mSejak(sym, mulaiMs) {
  for (const g of ['https://data-api.binance.vision', 'https://api.binance.com', 'https://api1.binance.com']) {
    try {
      const res = await fetchTahan(`${g}/api/v3/klines?symbol=${sym}&interval=5m&startTime=${mulaiMs}&limit=1000`)
      if (!res.ok) continue
      const d = await res.json()
      if (Array.isArray(d) && d.length) return d.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
      return []
    } catch (e) {}
  }
  return null
}

// ---------- PANEN satu peserta — lilin 5m menyatakan jalannya deal ----------
// Model deal jujur (dipakai konsisten semua hari):
//   50% posisi dikunci di jual profit saat ambang tersentuh; stop sisa pindah ke
//   entry (impas). Ambisius hanya dihormati bila setelah profit terkunci dana
//   baru menembusnya SEBELUM menyentuh impas. Lilin yang menyentuh dua level
//   sekaligus dinilai PESIMISTIS (yang menyakiti dulu) — tak ada optimisme karangan.
export function panenSatu(peserta, lilin) {
  const p = peserta.pakem
  const fase = { tahap: 'MURNI', sentuh: [] }
  const berhenti = { status: null, di: null, harga: null }
  for (const l of lilin) {
    const kenaStop = l.l <= p.stopLoss
    const kenaTp = l.h >= p.jualProfit
    const kenaAmb = l.h >= p.jualAmbisius
    const kenaImpas = l.l <= p.entry
    if (fase.tahap === 'MURNI') {
      if (kenaStop) { berhenti.status = 'kalah-sl'; berhenti.di = l.t; berhenti.harga = p.stopLoss; break } // pesimis: stop dulu
      if (kenaTp) {
        fase.tahap = 'TERKUNCI'
        fase.sentuh.push({ apa: 'jual-profit', di: new Date(l.t).toISOString(), harga: p.jualProfit, jarakPct: p.jarakJualPct })
        if (kenaAmb) { berhenti.status = 'menang-ambisius'; berhenti.di = l.t; berhenti.harga = p.jualAmbisius; break } // lilin satu menembus sampai ambisius
      }
    } else {
      if (kenaAmb && !kenaImpas) { berhenti.status = 'menang-ambisius'; berhenti.di = l.t; berhenti.harga = p.jualAmbisius; break }
      if (kenaImpas) { berhenti.status = 'menang-tp'; berhenti.di = l.t; berhenti.harga = p.entry; break } // pesimis: impas dulu
      if (kenaAmb) { berhenti.status = 'menang-ambisius'; berhenti.di = l.t; berhenti.harga = p.jualAmbisius; break }
    }
  }
  if (!berhenti.status) return { selesai: false, fase }
  const ret = berhenti.status === 'kalah-sl' ? -p.risikoPct
    : berhenti.status === 'menang-tp' ? p.jarakJualPct * 0.5
    : berhenti.status === 'menang-ambisius' ? p.jarakJualPct * 0.5 + p.jarakAmbisiusPct * 0.5
    : null
  return {
    selesai: true, status: berhenti.status, di: new Date(berhenti.di).toISOString(),
    hargaSentuh: berhenti.harga, retPct: Math.round(ret * 100) / 100,
    r: p.risikoPct > 0 ? Math.round(ret / p.risikoPct * 100) / 100 : null,
    jalur: fase.sentuh, faseAkhir: fase.tahap,
  }
}

// kedaluwarsa: 48 jam tanpa vonis — tutup di harga terakhir, arahnya diakui apa adanya
function kedaluwarsakan(peserta, lilin, dibukaMs) {
  const harga = lilin.length ? lilin[lilin.length - 1].c : null
  if (!harga) return { selesai: false }
  const ret = (harga / peserta.pakem.entry - 1) * 100
  return {
    selesai: true,
    status: ret > 0 ? 'kedaluwarsa-benar' : 'kedaluwarsa-salah',
    di: new Date(lilin.length ? lilin[lilin.length - 1].t : Date.now()).toISOString(),
    hargaSentuh: harga, retPct: Math.round(ret * 100) / 100,
    r: peserta.pakem.risikoPct > 0 ? Math.round(ret / peserta.pakem.risikoPct * 100) / 100 : null,
    jalur: [], faseAkhir: 'KEDALUWARSA',
    catatan: `48 jam tanpa sentuhan level — ditutup di harga terakhir ${fmt(harga)}; arah ${ret > 0 ? 'benar' : 'salah'} diakui jujur`,
  }
}

// ---------- rekap ----------
function rekapkan(peserta) {
  const r = { peserta: peserta.length, terbuka: 0, menangAmbisius: 0, menangTp: 0, kalahSl: 0, kedaluwarsaBenar: 0, kedaluwarsaSalah: 0, arahBenar: 0, selesai: 0 }
  for (const x of peserta) {
    if (!STATUS_AKHIR.has(x.status)) { r.terbuka++; continue }
    r.selesai++
    if (x.status === 'menang-ambisius') r.menangAmbisius++
    else if (x.status === 'menang-tp') r.menangTp++
    else if (x.status === 'kalah-sl') r.kalahSl++
    else if (x.status === 'kedaluwarsa-benar') r.kedaluwarsaBenar++
    else if (x.status === 'kedaluwarsa-salah') r.kedaluwarsaSalah++
  }
  r.arahBenar = r.selesai ? Math.round((r.menangAmbisius + r.menangTp + r.kedaluwarsaBenar) / r.selesai * 1000) / 10 : null
  r.rRata = (() => {
    const rr = peserta.filter(x => STATUS_AKHIR.has(x.status) && x.panen && x.panen.r != null).map(x => x.panen.r)
    return rr.length ? Math.round(rr.reduce((a, b) => a + b, 0) / rr.length * 100) / 100 : null
  })()
  return r
}

// ---------- DAFTAR turnamen hari ini (sekali per hari UTC — didinginkan) ----------
function daftarkan(musy, kini) {
  const tgl = tanggalUtc(kini)
  const umur = kini - Date.parse(musy.dihasilkan || 0)
  if (!(umur >= 0 && umur < UMUR_MUSYAWARAH_MS))
    throw new Error(`meja musyawarah basi (${Math.round(umur / 60000)} mnt) — tak layak jadi soal; denyut berikutnya setelah segel segar`)
  const vonis = (musy.pakem || []).filter(v => v && v.pakem && v.pakem.entry > 0)
  if (!vonis.length) throw new Error('meja tanpa vonis sah — tak ada peserta hari ini (jujur, tanpa karangan)')
  const peserta = vonis.slice(0, MAKS_PESERTA).map((v, i) => ({
    simbol: v.simbol, peringkat: i + 1, layakSkor: v.layakSkor, keluarga: v.keluarga, rezim: v.rezim,
    pakem: v.pakem, alasanEntry: v.alasanEntry, alasanAmbisius: v.alasanAmbisius,
    suaraRumah: v.suaraRumah || [],
    status: 'terbuka', dibuka: new Date(kini).toISOString(), panen: null,
  }))
  const turnamen = {
    protokol: PROTOKOL_UJI, tanggal: tgl, dibuat: new Date(kini).toISOString(),
    hukum: [
      'peserta = 50 vonis teratas SATU-MUSYAWARAH (laporan/musyawarah.json) — keyakinan terbesar di peringkat 1; tak ada koin di luar meja',
      'tiap peserta WAJIB BUY ber-PAKEM-LIMA-BARIS (entry · stop loss · jual profit · jual profit ambisius · alasan-ambisius) — didinginkan sekali per hari, tak diubah-ubah',
      'panen dibaca lilin 5m Binance sesungguhnya; lilin dua-level dinilai pesimistis (stop dianggap dulu) — tak ada optimisme karangan',
      '48 jam tanpa level tersentuh = ditutup di harga terakhir, arahnya diakui apa adanya',
      'daftar kemenangan + kurva ditulis tiap denyut; bobot-keluarga dari kurva dibaca meja musyawarah esok (belajar nyata, tak pernah hilang)',
    ],
    sumberMusyawarah: { segel: musy.segel, dihasilkan: musy.dihasilkan, vonisTotal: vonis.length, kembaliTambang: musy.meja ? musy.meja.kembaliTambang : null },
    dinding100k: { arahPct: DINDING_ARAH_100K, serakahPct: DINDING_SERAKAH_100K, catatan: 'tembok yang harus ditembus — bukan rujukan kebanggaan' },
    peserta,
  }
  turnamen.rekap = rekapkan(peserta)
  turnamen.segel = hash16(JSON.stringify({ t: turnamen.tanggal, p: peserta.map(x => [x.simbol, x.pakem]) }))
  return turnamen
}

// ---------- PANEN semua turnamen yang masih menyimpan soal terbuka ----------
async function panenSemua(kini) {
  mkdirSync(DIR_UJI, { recursive: true })
  const berkas = existsSync(DIR_UJI) ? readdirSync(DIR_UJI).filter(f => /^turnamen-\d{4}-\d{2}-\d{2}\.json$/.test(f)) : []
  berkas.sort()
  const sesuai = berkas.filter(f => {
    const tgl = f.match(/turnamen-(\d{4}-\d{2}-\d{2})\.json/)[1]
    return (kini - Date.parse(tgl + 'T00:00:00Z')) < HARI_SIMPAN * 864e5
  })
  let terpanen = 0, selesaiBaru = 0
  const hasilHari = []
  for (const f of sesuai) {
    let tur
    try { tur = JSON.parse(readFileSync(`${DIR_UJI}/${f}`, 'utf8')) } catch (e) { continue }
    if (!tur || !Array.isArray(tur.peserta)) continue
    let berubah = false
    const umurJam = (kini - Date.parse(tur.dibuat || (tur.tanggal + 'T00:00:00Z'))) / 3600e3
    const terbuka = tur.peserta.filter(x => !STATUS_AKHIR.has(x.status))
    for (const x of terbuka) {
      const dibukaMs = Date.parse(x.dibuka || tur.dibuka)
      const lilin = await lilin5mSejak(x.simbol, dibukaMs)
      if (!lilin) continue // jaring menolak — tetap terbuka, jujur; denyut berikutnya mencoba lagi
      let hasil = panenSatu(x, lilin)
      if (!hasil.selesai && umurJam >= UMUR_KEDALUWARSA_JAM) hasil = kedaluwarsakan(x, lilin, dibukaMs)
      if (hasil.selesai) {
        x.status = hasil.status
        x.panen = { ditutup: hasil.di, hargaSentuh: hasil.hargaSentuh, retPct: hasil.retPct, r: hasil.r, jalur: hasil.jalur, faseAkhir: hasil.faseAkhir, catatan: hasil.catatan || null }
        selesaiBaru++
        berubah = true
      }
      await tidur(60)
    }
    const rekapLama = tur.rekap
    tur.rekap = rekapkan(tur.peserta)
    tur.dipanen = new Date(kini).toISOString()
    if (berubah || JSON.stringify(rekapLama) !== JSON.stringify(tur.rekap)) {
      tur.segel = hash16(JSON.stringify({ t: tur.tanggal, p: tur.peserta.map(x => [x.simbol, x.status, x.panen ? x.panen.retPct : null]) }))
      writeFileSync(`${DIR_UJI}/${f}`, JSON.stringify(tur, null, 1))
      terpanen++
    }
    hasilHari.push({ file: f, tanggal: tur.tanggal, rekap: tur.rekap, peserta: tur.peserta })
  }
  return { terpanen, selesaiBaru, hari: hasilHari }
}

// ---------- KURVA BELAJAR — daftar kemenangan + bobot untuk meja esok ----------
function kurvaTulis(hari, kini) {
  const perKeluarga = {}
  for (const h of hari) for (const x of h.peserta) {
    if (!STATUS_AKHIR.has(x.status)) continue
    const k = perKeluarga[x.keluarga] || (perKeluarga[x.keluarga] = { menang: 0, kalah: 0, r: [] })
    if (x.status === 'menang-ambisius' || x.status === 'menang-tp') k.menang++
    else if (x.status === 'kalah-sl') k.kalah++
    if (x.panen && x.panen.r != null) k.r.push(x.panen.r)
  }
  const bobotKeluarga = {}
  for (const [kel, k] of Object.entries(perKeluarga)) {
    const n = k.menang + k.kalah
    const winrate = n ? Math.round(k.menang / n * 1000) / 10 : null
    let delta = 0, alasan = 'belum cukup bukti (n<8) — bobot netral'
    if (n >= 8 && winrate >= 58) { delta = 4; alasan = `winrate ${winrate}% (n=${n}) — keluarga ini membuktikan arahnya; suara +4 di meja esok` }
    else if (n >= 8 && winrate <= 42) { delta = -6; alasan = `winrate ${winrate}% (n=${n}) — keluarga ini sering menyesatkan; suara −6 di meja esok` }
    bobotKeluarga[kel] = { n, menang: k.menang, kalah: k.kalah, winratePct: winrate, rRata: k.r.length ? Math.round(k.r.reduce((a, b) => a + b, 0) / k.r.length * 100) / 100 : null, delta, alasan }
  }
  const total = { peserta: 0, selesai: 0, menangAmbisius: 0, menangTp: 0, kalahSl: 0, kedaluwarsaBenar: 0, kedaluwarsaSalah: 0, arahBenar: 0, rRata: null }
  for (const h of hari) { for (const k of Object.keys(total)) { if (k === 'arahBenar' || k === 'rRata') continue; total[k] += h.rekap[k] || 0 } }
  total.arahBenar = total.selesai ? Math.round((total.menangAmbisius + total.menangTp + total.kedaluwarsaBenar) / total.selesai * 1000) / 10 : null
  const rrSemua = hari.flatMap(h => h.peserta.filter(x => STATUS_AKHIR.has(x.status) && x.panen && x.panen.r != null).map(x => x.panen.r))
  total.rRata = rrSemua.length ? Math.round(rrSemua.reduce((a, b) => a + b, 0) / rrSemua.length * 100) / 100 : null
  const kurva = {
    protokol: PROTOKOL_UJI, diperbarui: new Date(kini).toISOString(),
    dinding100k: { arahPct: DINDING_ARAH_100K, serakahPct: DINDING_SERAKAH_100K, catatan: 'CERMIN-100RB V334 — dinding arah 48,88% & kematian-serakah 21,78% adalah garis yang harus dikalahkan, bukan dielak-elakkan' },
    hari: hari.map(h => ({ tanggal: h.tanggal, ...h.rekap })),
    total, bobotKeluarga,
    catatan: 'bobotKeluarga dibaca konteksMuat() musyawarah-inti — keluarga yang terbukti menang diberi suara lebih keras, yang terbukti menyesatkan dilirihkan; inilah belajar nyata tiap hari, tak pernah hilang',
    segel: null,
  }
  kurva.segel = hash16(JSON.stringify({ hari: kurva.hari, total, bobotKeluarga }))
  writeFileSync(`${DIR_UJI}/kurva.json`, JSON.stringify(kurva, null, 1))
  return kurva
}

// ---------- UJI INVARIAN ----------
export function ujiInvarianUji(tur) {
  const E = []
  if (!tur || !Array.isArray(tur.peserta) || !tur.peserta.length) { E.push('peserta kosong'); return E }
  if (tur.peserta.length > MAKS_PESERTA) E.push('peserta lebih dari 50')
  tur.peserta.forEach((x, i) => {
    const t = JSON.stringify(x)
    if (x.peringkat !== i + 1) E.push(x.simbol + ': peringkat tidak urut')
    if (i > 0 && x.layakSkor > tur.peserta[i - 1].layakSkor) E.push(x.simbol + ': urutan keyakinan rusak (harus menurun)')
    if (x.arah !== undefined && x.arah !== 'BUY') E.push(x.simbol + ': arah bukan BUY')
    if (/tunggu|robot/i.test(t)) E.push(x.simbol + ': kata terlarang')
    const p = x.pakem || {}
    if (!(p.entry > 0) || !(p.stopLoss < p.entry) || !(p.jualProfit > p.entry) || !(p.jualAmbisius >= p.jualProfit)) E.push(x.simbol + ': pakem tidak sah')
    if (!x.alasanAmbisius || x.alasanAmbisius.length < 80) E.push(x.simbol + ': alasan-ambisius kurus')
    if (STATUS_AKHIR.has(x.status)) {
      if (!x.panen || x.panen.retPct == null) E.push(x.simbol + ': status final tanpa data panen')
    } else if (x.status !== 'terbuka') E.push(x.simbol + ': status tak dikenal ' + x.status)
  })
  return E
}

// ---------- utama ----------
const mode = process.argv[2] || ''
if (mode === '--uji') {
  // gerbang lahir organ: invarian seluruh turnamen tersimpan + kurva
  let n = 0, gugur = 0
  const berkas = existsSync(DIR_UJI) ? readdirSync(DIR_UJI).filter(f => /^turnamen-\d{4}-\d{2}-\d{2}\.json$/.test(f)) : []
  for (const f of berkas) {
    let tur; try { tur = JSON.parse(readFileSync(`${DIR_UJI}/${f}`, 'utf8')) } catch (e) { gugur++; console.error(`  ${f}: tak terbaca`); continue }
    const E = ujiInvarianUji(tur); n++
    if (E.length) { gugur++; console.error(`  ${f}: ${E.slice(0, 4).join(' | ')}`) }
  }
  console.log(`[uji-50] invarian: ${n - gugur}/${n} turnamen sah${gugur ? ' — ADA YANG GUGUR (jujur)' : ''}`)
  process.exit(gugur ? 1 : 0)
}
try {
  const kini = Date.now()
  // 1) daftarkan turnamen hari ini bila belum ada (satu kali per hari UTC — didinginkan)
  let turHariIni = null
  const fHari = fileHari(tanggalUtc(kini))
  if (!existsSync(fHari)) {
    const musy = JSON.parse(readFileSync(FILE_MUSYAWARAH, 'utf8'))
    turHariIni = daftarkan(musy, kini)
    mkdirSync(DIR_UJI, { recursive: true })
    writeFileSync(fHari, JSON.stringify(turHariIni, null, 1))
    console.log(`[uji-50] TURNAMEN ${turHariIni.tanggal} didaftar: ${turHariIni.peserta.length} peserta (meja ${turHariIni.sumberMusyawarah.vonisTotal} vonis, segel ${turHariIni.sumberMusyawarah.segel}) — ${turHariIni.peserta[0].simbol} keyakinan teratas ${turHariIni.peserta[0].layakSkor}`)
  } else {
    try { turHariIni = JSON.parse(readFileSync(fHari, 'utf8')) } catch (e) { turHariIni = null }
    // perbaiki turnamen kosong: bila hari ini terdaftar tanpa peserta namun meja kini punya vonis
    if (turHariIni && (!turHariIni.peserta || !turHariIni.peserta.length)) {
      const musy = JSON.parse(readFileSync(FILE_MUSYAWARAH, 'utf8'))
      turHariIni = daftarkan(musy, kini)
      writeFileSync(fHari, JSON.stringify(turHariIni, null, 1))
      console.log(`[uji-50] TURNAMEN ${turHariIni.tanggal} diperbaiki: ${turHariIni.peserta.length} peserta`)
    }
  }
  // 2) PANEN semua soal terbuka (hari ini + hari-hari sebelumnya yang masih dalam jendela)
  const hasil = await panenSemua(kini)
  console.log(`[uji-50] panen: ${hasil.terpanen} turnamen ditulis, ${hasil.selesaiBaru} peserta selesai baru`)
  for (const h of hasil.hari) {
    const r = h.rekap
    console.log(`  ${h.tanggal}: ${r.peserta} peserta — ambisius ${r.menangAmbisius} · tp ${r.menangTp} · sl ${r.kalahSl} · kedaluwarsa ${r.kedaluwarsaBenar + r.kedaluwarsaSalah} · terbuka ${r.terbuka} — arah benar ${r.arahBenar == null ? '—' : r.arahBenar + '%'} (dinding 48,88%)`)
  }
  // 3) KURVA + BOBOT untuk meja esok
  const kurva = kurvaTulis(hasil.hari, kini)
  console.log(`[uji-50] kurva: total arah benar ${kurva.total.arahBenar == null ? '—' : kurva.total.arahBenar + '%'} dari ${kurva.total.selesai} selesai · R rata ${kurva.total.rRata ?? '—'} · bobot-keluarga ${Object.keys(kurva.bobotKeluarga).length} keluarga — meja musyawarah esok membacanya`)
  // 4) invarian turnamen hari ini
  if (turHariIni) {
    const E = ujiInvarianUji(turHariIni)
    if (E.length) { console.error('[uji-50] INVARIAN GUGUR (jujur): ' + E.join(' | ')); process.exit(1) }
    const top = turHariIni.peserta.slice(0, 3)
    for (const x of top) console.log(`  #${x.peringkat} ${x.simbol} — keyakinan ${x.layakSkor} · entry ${fmt(x.pakem.entry)} · stop ${fmt(x.pakem.stopLoss)} · jual ${fmt(x.pakem.jualProfit)} · ambisius ${fmt(x.pakem.jualAmbisius)}`)
  }
} catch (e) {
  console.error('[uji-50] GAGAL (jujur, denyut lanjut):', e && e.message || e)
  process.exit(0)
}
