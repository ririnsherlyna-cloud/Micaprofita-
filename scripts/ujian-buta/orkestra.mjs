// ============================================================
// ORKESTRA UJIAN-BUTA-100 — jalankan penjaga.mjs ASLI (dari repo
// kanonik, v6.1 V264) pada banyak titik waktu historis T, dunia
// dibekukan oleh beku.cjs, panen ledger kunci per run.
// Pakai: node orkestra.mjs [jumlahRun] [mulaiOffset]
// ============================================================
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const HOME = '/home/z/my-project'
const BEKU = path.join(HOME, 'scripts/ujian-buta/beku.cjs')
const PENJAGA = path.join(HOME, 'micaprofita/scripts/penjaga.mjs')
const GENOME = path.join(HOME, 'micaprofita/otak/genome-server.json')
const CACHE = '/tmp/ujibuta/cache'
const RUNS = '/tmp/ujibuta/runs'
const PANEN = process.argv[5] ? path.join(process.argv[5]) : path.join(HOME, 'scripts/ujian-buta/panen.jsonl')

const N_RUN = Number(process.argv[2] || 36)
const OFFSET = Number(process.argv[3] || 0)
const STEP_JAM = Number(process.argv[4] || 6)

// titik T: 2026-09-03T06:00Z + STEP_JAM × i (jangkauan data derivatif 30 hari)
const MULAI = Date.parse('2026-06-08T06:00:00.000Z')
const LANGKAH = STEP_JAM * 3600 * 1000
const daftarT = []
for (let i = OFFSET; i < OFFSET + N_RUN; i++) {
  const t = MULAI + i * LANGKAH
  if (t <= Date.parse('2026-10-02T18:00:00.000Z')) daftarT.push({ i, t })
}

fs.mkdirSync(RUNS, { recursive: true })
if (!fs.existsSync(PANEN)) fs.writeFileSync(PANEN, '')

// kunci yang sudah dipanen (resume aman)
const sudah = new Set()
for (const l of fs.readFileSync(PANEN, 'utf8').split('\n')) {
  if (!l.trim()) continue
  try { sudah.add(String(JSON.parse(l).T)) } catch {}
}

async function satu({ i, t }) {
  if (sudah.has(String(t))) { console.log(`run ${i}: SKIP (sudah)`); return }
  const sb = path.join(RUNS, `r${i}`)
  fs.rmSync(sb, { recursive: true, force: true })
  fs.mkdirSync(path.join(sb, 'scripts'), { recursive: true })
  fs.mkdirSync(path.join(sb, 'otak'), { recursive: true })
  fs.mkdirSync(path.join(sb, 'laporan'), { recursive: true })
  fs.copyFileSync(PENJAGA, path.join(sb, 'scripts/penjaga.mjs'))
  if (fs.existsSync(GENOME)) fs.copyFileSync(GENOME, path.join(sb, 'otak/genome-server.json'))
  fs.writeFileSync(path.join(sb, 'otak/penjaga-keadaan.json'), JSON.stringify({ mulai: new Date(t).toISOString(), siklus: 1 }))

  const r = spawnSync('node', ['--require', BEKU, 'scripts/penjaga.mjs'], {
    cwd: sb,
    env: { ...process.env, UJIAN_FROZEN_MS: String(t), UJIAN_CACHE: CACHE, UJIAN_AUDIT: path.join(sb, 'audit.jsonl') },
    timeout: 240000,
    encoding: 'utf8',
  })
  fs.writeFileSync(path.join(sb, 'stdout.log'), (r.stdout || '') + '\n---STDERR---\n' + (r.stderr || ''))
  const status = r.status === 0 ? 'OK' : `EXIT-${r.status}`
  let kunci = 0
  const prakiraPath = path.join(sb, 'laporan/prakira-server.jsonl')
  if (fs.existsSync(prakiraPath)) {
    for (const l of fs.readFileSync(prakiraPath, 'utf8').split('\n')) {
      if (!l.trim()) continue
      try {
        const e = JSON.parse(l)
        if (e && Array.isArray(e)) { // ledger tertulis sebagai satu baris array
          for (const x of e) if (x && x.simbol && x.arah) { fs.appendFileSync(PANEN, JSON.stringify({ T: t, run: i, jalur: x.jalur || 'ARAH', e: x }) + '\n'); kunci++ }
          continue
        }
        if (e && e.simbol && e.arah) { fs.appendFileSync(PANEN, JSON.stringify({ T: t, run: i, jalur: e.jalur || 'ARAH', e }) + '\n'); kunci++ }
      } catch {}
    }
  }
  console.log(`run ${i} T=${new Date(t).toISOString()} → ${status} kunci=${kunci} ${kunci === 0 && r.status !== 0 ? (r.stderr || '').slice(-300) : ''}`)
}

// worker pool sederhana (3 paralel — hormati CPU & disk)
const antrian = [...daftarT]
async function pekerja() {
  while (antrian.length) {
    const t = antrian.shift()
    if (!t) break
    try { await satu(t) } catch (e) { console.log(`run ${t.i} ERROR: ${e.message}`) }
  }
}
await Promise.all([pekerja(), pekerja(), pekerja()])
console.log('PANEN SELESAI →', PANEN)
