#!/usr/bin/env node
// ============================================================
// PANTAU — mata uji kehidupan: dispatch denyut + tunggu + kumpul bukti
//   node scripts/uji-kehidupan/pantau.mjs dispatch <workflow.yml>
//   node scripts/uji-kehidupan/pantau.mjs tunggu <workflow.yml> <menit-maks>
//   node scripts/uji-kehidupan/pantau.mjs bukti <label>
// Token dari env MICAPROFITA_TOKEN (tidak pernah ditulis ke repo).
// ============================================================
import { readFileSync } from 'node:fs'

const REPO = 'ririnsherlyna-cloud/Micaprofita-'
const TOK = process.env.MICAPROFITA_TOKEN || ''
if (!TOK) { console.error('MICAPROFITA_TOKEN kosong'); process.exit(1) }
const H = { Authorization: 'Bearer ' + TOK, Accept: 'application/vnd.github+json', 'User-Agent': 'uji-kehidupan' }

async function api (jalan, opt = {}) {
  const r = await fetch('https://api.github.com/repos/' + REPO + '/' + jalan, {
    method: opt.met || 'GET', headers: H, body: opt.body ? JSON.stringify(opt.body) : undefined
  })
  if (r.status === 204) return null
  const t = await r.text()
  let d = null; try { d = JSON.parse(t) } catch { d = t }
  if (!r.ok) throw new Error('api ' + jalan + ' → ' + r.status + ' ' + String(t).slice(0, 200))
  return d
}

const perintah = process.argv[2]
const target = process.argv[3]

if (perintah === 'dispatch') {
  await api('actions/workflows/' + target + '/dispatches', { met: 'POST', body: { ref: 'main' } })
  console.log('[pantau] dispatch ' + target + ' terkirim')
  process.exit(0)
}

if (perintah === 'tunggu') {
  const MAKS = (parseInt(process.argv[4]) || 9) * 60
  const t0 = Date.now()
  while (Date.now() - t0 < MAKS * 1000) {
    await new Promise(s => setTimeout(s, 20000))
    const jalan = await api('actions/runs?per_page=6')
    const sejak = new Date(Date.now() - 25 * 60 * 1000).toISOString()
    const kandidat = (jalan.workflow_runs || []).filter(r =>
      r.name && r.path === '.github/workflows/' + target && r.created_at > sejak &&
      (r.event === 'workflow_dispatch' || r.event === 'push' || r.event === 'schedule'))
    if (!kandidat.length) { console.log('  belum ada run ' + target + '…'); continue }
    const r = kandidat[0]
    if (r.status === 'completed') {
      console.log(JSON.stringify({ id: r.id, event: r.event, concl: r.conclusion, url: r.html_url, detik: Math.round((new Date(r.updated_at) - new Date(r.created_at)) / 1000) }))
      process.exit(0)
    }
    console.log('  run ' + r.id + ' ' + r.event + ' masih ' + r.status + '…')
  }
  console.error('timeout menunggu ' + target); process.exit(2)
}

if (perintah === 'bukti') {
  const label = target || 'tanpa-label'
  const raw = async (p) => {
    try {
      const r = await fetch('https://raw.githubusercontent.com/' + REPO + '/main/' + p + '?cb=' + Date.now(), { headers: { 'User-Agent': 'uji-kehidupan' } })
      if (!r.ok) return { gagal: r.status }
      return await r.text()
    } catch (e) { return { gagal: String(e).slice(0, 100) } }
  }
  const coba = (t) => { try { return JSON.parse(t) } catch { return { __JSON_TIDAK_SAH: true, cuplik: String(t).slice(0, 90) } } }

  const ing = coba(await raw('ruang-hidup/ingatan.json'))
  const gen = coba(await raw('otak/genome-server.json'))
  const sik = coba(await raw('otak/penjaga-keadaan.json'))
  const pet = coba(await raw('laporan/peta-geladak.json'))
  const kea = coba(await raw('ruang-hidup/keadaan.json'))
  const sadarKode = await raw('scripts/hidup/sadar1.js')

  const runs = await api('actions/runs?per_page=10')
  const ring = (runs.workflow_runs || []).slice(0, 6).map(r => ({
    nama: r.name, event: r.event, status: r.status, concl: r.conclusion, dibuat: r.created_at, id: r.id
  }))

  const bukti = {
    label, waktu: new Date().toISOString(),
    ingatan: ing.__JSON_TIDAK_SAH ? { RUSAK: true, cuplik: ing.cuplik } : { kelahiran: ing.kelahiran, totalBangun: ing.totalBangun, fokus: (ing.fokus || '').slice(0, 60) },
    genome: gen.__JSON_TIDAK_SAH ? { RUSAK: true, cuplik: gen.cuplik } : {
      ilmu: Object.keys(gen.ilmu || {}).length,
      phoenix: Object.keys(gen.phoenix || {}).length,
      generasi: Object.fromEntries(['NAIK', 'TURUN', 'DATAR'].map(k => [k, (gen[k] || {}).generasi ?? null]))
    },
    siklus: sik.__JSON_TIDAK_SAH ? { RUSAK: true, cuplik: sik.cuplik } : { siklus: sik.siklus, dihasilkan: sik.dihasilkan || null },
    peta: pet.__JSON_TIDAK_SAH ? { RUSAK: true, cuplik: pet.cuplik } : { jejak: pet.pelajaran ? Object.keys(pet.pelajaran).length : null },
    keadaanSadar: kea.__JSON_TIDAK_SAH ? { RUSAK: true, cuplik: kea.cuplik } : {
      gagalTotal: (kea.gagal || []).length, gagalCuplik: (kea.gagal || []).slice(0, 4),
      tahapanGagal: (kea.tahapan || []).filter(t => String(t.hasil || '').startsWith('GAGAL')).map(t => t.fase + ': ' + String(t.hasil).slice(0, 80)).slice(0, 4)
    },
    nafasSadar1: { hostRacun: (sadarKode.match(/binance\.invalid/g) || []).length, adaTandaLuka: String(sadarKode).includes('LUKA-UJI-KEHIDUPAN') },
    runsTerbaru: ring
  }
  console.log(JSON.stringify(bukti, null, 1))
  process.exit(0)
}
console.error('perintah tak dikenal'); process.exit(1)
