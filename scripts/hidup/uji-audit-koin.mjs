// ============================================================
// UJI-AUDIT-KOIN (V327) — mandat pemilik: "Sekarang kita wajib
// miliki uji jalur LLM dengan pertanyaan yang akan muncul jikalau
// ditanya koin tertentu DAN ditelaah."
//
// ENAM GERBANG per soal (semua wajib LULUS, bukan pura-pura):
//   G1 POLA      — neuron mengenali "periksa/audit/cek koin <ticker>"
//   G2 DATA      — audit mengangkut data pasar nyata + invarian masuk akal
//   G3 HITUNG    — KELAYAKAN PERHITUNGAN: uji menghitung-ulang sendiri
//                  (klines diambil ulang, momen-7 & RSI-14 dihitung dengan
//                  kode kedua yang terpisah) — cocok dengan audit (±toleransi)
//   G4 JALUR-LLM — pertanyaan + FAKTA AUDIT dikirim lewat saluran LLM
//                  (LLM_URL/LLM_KEY bentuk otak-llm.mjs; jatuh-ke z-ai CLI)
//   G5 TELAAH    — jawaban LLM diperiksa terhadap fakta: harga/skor/RSI/
//                  24-jam/vonis-sucker harus sama dengan audit nyata
//   G6 JUJUR     — koin palsu ditolak jujur; soal bukan-koin tak dibajak;
//                  "periksa koin" tanpa ticker → minta ticker, bukan mengarang
//
// Hukum: nol Math.random; laporan tersegel SHA-256 (hash16); TANPA gerbang
// LLM → vonis jujur "JALUR-LLM-TAK-TERUJI" (exit 1), tidak pernah pura-pura.
// ============================================================
import { kenaliAuditKoin, auditKoin, telaahJawabLLM, hitungRSI, hash16 } from './audit-koin.mjs'
import { writeFile, mkdir } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
const eksekusi = promisify(execFile)

const TIDUR = (ms) => new Promise((r) => setTimeout(r, ms))
const BUKAN = (x) => String(x || '')

// ---------- SOAL NYATA yang akan muncul di meja audit ----------
const SOAL_POSITIF = [
  { tanya: 'periksa koin BTC', harap: 'BTC' },
  { tanya: 'audit koin ETH', harap: 'ETH' },
  { tanya: 'cek kelayakan koin SOL', harap: 'SOL' },
  { tanya: 'bagaimana kondisi koin PEPE?', harap: 'PEPE' },
  { tanya: 'telaah koin bitcoin dong', harap: 'BTC' },
]
const SOAL_NEGATIF = [
  { tanya: 'periksa koin KOINTAKADA', harap: 'jujur-tolak' },
  { tanya: 'siapa kamu?', harap: 'bukan-audit' },
  { tanya: 'periksa koin', harap: 'minta-ticker' },
]

// ---------- SALURAN LLM (utama: bentuk otak-llm.mjs; cadangan: z-ai CLI) ----------
async function tanyaLLM (sistem, pengguna) {
  const url = process.env.LLM_URL, key = process.env.LLM_KEY
  if (url && key) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: sistem }, { role: 'user', content: pengguna }],
        max_tokens: 500, temperature: 0.2,
      }),
    })
    if (!r.ok) throw new Error('LLM_URL HTTP ' + r.status)
    const d = await r.json()
    const teks = d?.choices?.[0]?.message?.content || ''
    if (!teks) throw new Error('jawab kosong')
    return { teks, kanal: 'LLM_URL (' + (d.model || 'model-wadah') + ')' }
  }
  // cadangan: gerbang z-ai CLI (kanal guru yang dipakai wadah pemilik)
  const out = join(tmpdir(), 'uji-llm-audit-' + Date.now() + '.json')
  await eksekusi('z-ai', ['chat', '-p', pengguna, '--system', sistem, '-o', out], { timeout: 90000 })
  const d = JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile(out, 'utf8')))
  const teks = d?.choices?.[0]?.message?.content || ''
  if (!teks) throw new Error('jawab kosong')
  return { teks, kanal: 'z-ai CLI (' + (d.model || 'gerbang-wadah') + ')' }
}

const SISTEM_AUDIT = 'Kau MICAPROFITA, analis kripto jujur milik pemilikmu. HANYA gunakan angka dari blok FAKTA AUDIT — dilarang keras mengarang atau mengubah angka lain. WAJIB menyebut secara eksplisit: harga koin (angka persis), perubahan 24 jam (dengan tanda %), nilai RSI-14, skor kelayakan (angka), dan vonisnya. Maksimal 120 kata, bahasa Indonesia. Bila fakta tak cukup, katakan jujur bahwa tak cukup.'

// ---------- G3: perhitungan-ulang INDEPENDEN (kode kedua, terpisah dari organ) ----------
async function klinesMandiri (simbol) {
  for (const host of ['https://api.binance.com', 'https://data-api.binance.vision']) {
    try {
      const r = await fetch(host + '/api/v3/klines?symbol=' + simbol + '&interval=1d&limit=40')
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const j = await r.json()
      if (Array.isArray(j) && j.length >= 40) return j.map((k) => +k[4])
    } catch (e) { if (host.includes('vision')) throw e }
    await TIDUR(1200)
  }
  throw new Error('klines mandiri gagal')
}
function rsiMandiri (closes, n = 14) {
  let naik = 0, turun = 0
  for (let i = 1; i <= n; i++) { const d = closes[i] - closes[i - 1]; if (d >= 0) naik += d; else turun -= d }
  let rn = naik / n, rt = turun / n
  for (let i = n + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    rn = (rn * (n - 1) + Math.max(0, d)) / n
    rt = (rt * (n - 1) + Math.max(0, -d)) / n
  }
  return rt === 0 ? 100 : 100 - 100 / (1 + rn / rt)
}

// ---------- UJIAN ----------
async function main () {
  const catatan = [], t0 = new Date().toISOString()
  let kanalLLM = null, modelLLM = null, llmTerjangkau = true

  // GERBANG SANITAS MATEMATIKA (pra-uji): RSI seri naik murni = 100; EMA seri rata = nilainya
  const sanitas = { rsiNaik: rsiMandiri(Array.from({ length: 40 }, (_, i) => 100 + i)), }
  const rsiNaikOk = Math.abs(sanitas.rsiNaik - 100) < 0.001
  console.log('SANITAS matematika: RSI seri-naik = ' + sanitas.rsiNaik + ' → ' + (rsiNaikOk ? 'LULUS' : 'GUGUR'))
  catatan.push({ gerbang: 'SANITAS-MATEMATIKA', lulus: rsiNaikOk, ket: 'RSI seri naik murni harus 100 (dapat ' + sanitas.rsiNaik.toFixed(6) + ')' })

  for (const soal of SOAL_POSITIF) {
    const rec = { soal: soal.tanya, gerbang: {} }
    try {
      // G1 POLA
      const pola = kenaliAuditKoin(soal.tanya)
      rec.gerbang['G1-pola'] = { lulus: pola.cocok && pola.ticker === soal.harap, ket: pola.cocok ? 'ticker terbaca ' + pola.ticker : pola.alasan }
      if (!rec.gerbang['G1-pola'].lulus) { rec.lulus = false; catatan.push(rec); console.log('GUGUR G1 — ' + soal.tanya); continue }

      // G2 DATA (audit nyata)
      const a = await auditKoin(pola.ticker)
      await TIDUR(1500) // hormat pasar antar soal
      if (a.gagal) { rec.gerbang['G2-data'] = { lulus: false, ket: a.gagal + ': ' + a.ket }; rec.lulus = false; catatan.push(rec); continue }
      const skorUlang = a.skorBagian.reduce((s, b) => s + b.pts, 0)
      const invarian = a.harga > 0 && a.rsi14 >= 0 && a.rsi14 <= 100 && a.ema20 > 0 && a.ema50 > 0 &&
        a.skor >= 0 && a.skor <= 100 && a.skor === skorUlang && a.spreadBps >= 0 && a.atr14 > 0 &&
        a.vol24hUSD > 0 && a.lilinDipakai >= 40 && a.sumber.length === 2 && /^[0-9a-f]{16}$/.test(a.segel)
      rec.gerbang['G2-data'] = { lulus: invarian, ket: 'harga ' + a.harga + ' · RSI ' + a.rsi14.toFixed(1) + ' · skor ' + a.skor + '=' + skorUlang + ' · lilin ' + a.lilinDipakai + ' · segel ' + a.segel }

      // G3 KELAYAKAN PERHITUNGAN (kode kedua, data diambil ulang)
      const closes2 = await klinesMandiri(a.simbol)
      await TIDUR(800)
      const mom7Mandiri = closes2[closes2.length - 1] / closes2[closes2.length - 8] - 1
      const rsiMandiriNilai = rsiMandiri(closes2.slice(-40), 14)
      const dMom = Math.abs(mom7Mandiri - a.mom7)
      const dRsi = Math.abs(rsiMandiriNilai - a.rsi14)
      rec.gerbang['G3-hitung'] = { lulus: dMom <= 0.005 && dRsi <= 1.5, ket: 'momen7 mandiri ' + (mom7Mandiri * 100).toFixed(3) + '% vs audit ' + (a.mom7 * 100).toFixed(3) + '% (Δ' + (dMom * 100).toFixed(4) + 'pp) · RSI mandiri ' + rsiMandiriNilai.toFixed(2) + ' vs audit ' + a.rsi14.toFixed(2) + ' (Δ' + dRsi.toFixed(3) + ')' }

      // G4 JALUR LLM
      const fakta = {
        simbol: a.simbol, harga: a.harga, perubahan24jam: a.chg24, momen7: a.mom7, momen30: a.mom30,
        ema20: a.ema20, ema50: a.ema50, rsi14: a.rsi14, atr14: a.atr14, sigmaTahunan: a.sigmaTahunan,
        drawdownDariPuncak90: a.dd90, volume24jamUSD: a.vol24hUSD, spreadBps: a.spreadBps,
        skorKelayakan: a.skor, vonis: a.vonis, tandaSuckerRally: a.sucker.terdeteksi,
      }
      let jawab = null
      if (llmTerjangkau) {
        try {
          jawab = await tanyaLLM(SISTEM_AUDIT, 'Pertanyaan pemilik: ' + soal.tanya +
            '\n\nFAKTA AUDIT (pasar nyata saat ditanya — jangan diubah):\n' + JSON.stringify(fakta) +
            '\n\nJawab pertanyaan pemilik hanya dengan fakta di atas.')
          kanalLLM = jawab.kanal
          rec.gerbang['G4-jalur-llm'] = { lulus: BUKAN(jawab.teks).length > 30, ket: 'kanal ' + jawab.kanal + ' · ' + BUKAN(jawab.teks).length + ' karakter' }
          rec.jawabLLM = jawab.teks
        } catch (e) {
          llmTerjangkau = false
          rec.gerbang['G4-jalur-llm'] = { lulus: false, ket: 'JALUR-LLM-TAK-TERUJI: ' + BUKAN(e.message).slice(0, 80) + ' — ujian jujur berhenti di sini, tidak pernah pura-pura lulus' }
        }
      } else {
        rec.gerbang['G4-jalur-llm'] = { lulus: false, ket: 'JALUR-LLM-TAK-TERUJI (gerbang sudah dipastikan tumbang lebih awal)' }
      }

      // G5 TELAAH — hanya bermakna bila G4 teruji
      if (jawab) {
        const telaah = telaahJawabLLM(jawab.teks, a)
        rec.gerbang['G5-telaah'] = { lulus: telaah.lulus, ket: telaah.skorTelaah + ' — ' + telaah.cek.map((c) => c.nama + ':' + (c.lulus ? 'ok' : 'GUGUR(' + c.ket + ')')).join(' · ') }
      } else rec.gerbang['G5-telaah'] = { lulus: false, ket: 'tak bisa ditelaah — jawaban LLM tidak ada' }

      rec.lulus = Object.values(rec.gerbang).every((g) => g.lulus)
    } catch (e) {
      rec.gagal = BUKAN(e.message).slice(0, 120)
      rec.lulus = false
    }
    catatan.push(rec)
    console.log((rec.lulus ? 'LULUS ' : 'GUGUR ') + soal.tanya + ' → ' + Object.entries(rec.gerbang || {}).map(([k, g]) => k + (g.lulus ? '✓' : '✗')).join(' '))
  }

  // G6 JUJUR — soal jebakan
  for (const soal of SOAL_NEGATIF) {
    const rec = { soal: soal.tanya, gerbang: { 'G6-jujur': { lulus: false, ket: '' } } }
    if (soal.harap === 'jujur-tolak') {
      const a = await auditKoin('KOINTAKADA')
      await TIDUR(1500)
      const pola = kenaliAuditKoin(soal.tanya)
      const oke = pola.cocok && a.gagal === 'KOIN-TAK-DITEMUKAN'
      rec.gerbang['G6-jujur'] = { lulus: oke, ket: oke ? 'koin palsu ditolak jujur (' + a.gagal + ': ' + BUKAN(a.ket).slice(0, 60) + ')' : 'BERBAHAYA: pola=' + JSON.stringify(pola) + ' audit=' + JSON.stringify(a).slice(0, 80) }
    } else if (soal.harap === 'bukan-audit') {
      const pola = kenaliAuditKoin(soal.tanya)
      const oke = pola.cocok === false
      rec.gerbang['G6-jujur'] = { lulus: oke, ket: oke ? 'soal identitas tidak dibajak jadi audit' : 'soal bukan-koin dibajak: ' + JSON.stringify(pola) }
    } else {
      const pola = kenaliAuditKoin(soal.tanya)
      const oke = pola.cocok === true && pola.mintaTicker === true && !pola.ticker
      rec.gerbang['G6-jujur'] = { lulus: oke, ket: oke ? 'tanpa ticker → minta ticker (bukan mengarang)' : 'tanpa ticker tidak diminta dengan jujur: ' + JSON.stringify(pola) }
    }
    rec.lulus = rec.gerbang['G6-jujur'].lulus
    catatan.push(rec)
    console.log((rec.lulus ? 'LULUS ' : 'GUGUR ') + '[G6] ' + soal.tanya)
  }

  const lulus = catatan.filter((r) => r.lulus).length
  const total = catatan.length
  const laporan = {
    organ: 'UJI-AUDIT-KOIN V327', waktu: t0, selesai: new Date().toISOString(),
    mandat: 'uji jalur LLM dengan pertanyaan koin tertentu dan ditelaah — fakta nyata, bukan simulasi',
    kanalLLM, gerbangLLMTerjangkau: llmTerjangkau,
    catatan, ringkas: { total, lulus, gugur: total - lulus, lulusPenuh: lulus === total },
  }
  laporan.segel = hash16({ lulus, total, soal: catatan.map((c) => ({ s: c.soal, l: !!c.lulus })) })
  await mkdir('laporan', { recursive: true })
  await writeFile('laporan/uji-audit-koin.json', JSON.stringify(laporan, null, 1))
  console.log('\nHASIL: ' + lulus + '/' + total + ' LULUS' + (laporan.ringkas.lulusPenuh ? ' — LULUS PENUH' : ' — GUGUR, wajib dibenahi (hukum rumah: tanpa pura-pura)') + ' · segel ' + laporan.segel)
  if (!laporan.ringkas.lulusPenuh) process.exitCode = 1
}

main().catch((e) => { console.error('UJI-AUDIT-KOIN GAGAL TOTAL:', e.message); process.exit(1) })
