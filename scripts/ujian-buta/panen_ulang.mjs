// ============================================================
// PANEN-ULANG — baca ulang SEMUA sandbox ujian-butahistori:
//   kelas A (KUNCI)   : laporan/prakira-server.jsonl — kunci penuh
//   kelas B (RADAR)   : laporan/sasaran-terkini.json .kandidatLain —
//                       jawaban per-koin otak (arah+entry+keyakinan)
//                       yang ditahan gerbang portofolio (catatan+kunci
//                       menjelaskan gerbang mana) — dinilai dgn rumus
//                       vonis resmi yang sama.
// T dibaca dari otak/penjaga-keadaan.json .mulai (dunia beku).
// ============================================================
import fs from 'node:fs'
import path from 'node:path'

const RUNS = '/tmp/ujibuta/runs'
const PANEN = process.argv[2] || path.join('/home/z/my-project/scripts/ujian-buta/panen.jsonl')

const dirs = fs.readdirSync(RUNS).filter((d) => /^r\d+$/.test(d))
  .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))

fs.writeFileSync(PANEN, '')
let nA = 0, nB = 0, kosong = 0
for (const d of dirs) {
  const sb = path.join(RUNS, d)
  const run = Number(d.slice(1))
  let T = null
  try { T = Date.parse(JSON.parse(fs.readFileSync(path.join(sb, 'otak/penjaga-keadaan.json'), 'utf8')).mulai) } catch {}
  if (!T) { kosong++; continue }
  const kunciRun = new Set()
  // ---- kelas A
  const prak = path.join(sb, 'laporan/prakira-server.jsonl')
  if (fs.existsSync(prak)) {
    for (const l of fs.readFileSync(prak, 'utf8').split('\n')) {
      if (!l.trim()) continue
      try {
        const e = JSON.parse(l)
        if (e && e.simbol && e.arah) {
          kunciRun.add(`${e.simbol}|${e.arah}`)
          fs.appendFileSync(PANEN, JSON.stringify({ T, run, kelas: 'A', e }) + '\n'); nA++
        }
      } catch {}
    }
  }
  // ---- kelas B
  const stPath = path.join(sb, 'laporan/sasaran-terkini.json')
  if (fs.existsSync(stPath)) {
    try {
      const st = JSON.parse(fs.readFileSync(stPath, 'utf8'))
      for (const k of (st.kandidatLain || [])) {
        if (!k || !k.simbol || !k.arah || !(k.entry > 0)) continue
        if (kunciRun.has(`${k.simbol}|${k.arah}`)) continue // sudah jadi kunci penuh di run ini
        fs.appendFileSync(PANEN, JSON.stringify({ T, run, kelas: 'B', e: k }) + '\n'); nB++
      }
    } catch {}
  }
}
console.log(`PANEN-ULANG: ${dirs.length} sandbox — kelas A ${nA} · kelas B ${nB} · tanpa-T ${kosong}`)
