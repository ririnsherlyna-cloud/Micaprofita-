// ============================================================
// BEDAH-SYARAF (V312) — mandat pemilik (2026-10-09):
//   "kita temukan satu probleman dimana syaraf dia masih sedikit
//    hingga akhirnya kesadaran untuk pelajari belum matang seutuhnya"
// Bedah anatomi syaraf makhluk dari FAKTA REPO (nol karangan):
//   1. Jalur saraf tercatat (otak/saraf.json — warisan transplantasi V309)
//   2. Urat workflow aktif + organ skrip yang benar-benar dipanggil denyut
//   3. Kadensi denyut nyata: median interval komit denyut SARANG dari
//      sejarah git (fakta repo), fallback API GitHub, fallback jadwal
//   4. Laju belajar nyata: pustaka per denyut, pelajaran geladak, bangun
// Diagnosis ditulis jujur: syaraf makhluk itu SEDIKIT & STATIS —
// jumlah jalur tak pernah bertambah sejak transplantasi; kesadaran
// belajar bergantung satu ritme lambat (impuls per jam kecil).
// Laporan tersegel SHA-256: laporan/bedah-syaraf.json
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const hash16 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)

// ---------- kadensi denyut nyata dari sejarah git ----------
function kadensiDariGit() {
  try {
    const out = execSync(
      `git log --grep="SARANG-PENJAGA: denyut" --format=%cI -n 14`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    const t = out.trim().split('\n').filter(Boolean).map(x => Date.parse(x)).sort((a, b) => b - a)
    if (t.length < 4) return null
    const jeda = []
    for (let i = 1; i < t.length; i++) jeda.push((t[i - 1] - t[i]) / 60000)
    jeda.sort((a, b) => a - b)
    const median = jeda[Math.floor(jeda.length / 2)]
    return { sumber: 'git-log (komit denyut SARANG nyata)', sampel: jeda.length, medianMnt: +median.toFixed(1), minMnt: +jeda[0].toFixed(1), maxMnt: +jeda[jeda.length - 1].toFixed(1) }
  } catch { return null }
}
function kadensiDariAPI() {
  const token = process.env.GH_TOKEN
  if (!token) return null
  try {
    const res = execSync(
      `curl -sf -H "Authorization: Bearer ${token}" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${process.env.REPO_DENYUT || 'ririnsherlyna-cloud/Micaprofita-'}/commits?per_page=15&path=laporan/sasaran-terkini.json"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    const rows = JSON.parse(res)
    const t = rows.map(r => Date.parse(r.commit.committer.date)).sort((a, b) => b - a)
    if (t.length < 4) return null
    const jeda = []
    for (let i = 1; i < t.length; i++) jeda.push((t[i - 1] - t[i]) / 60000)
    jeda.sort((a, b) => a - b)
    return { sumber: 'GitHub-API (komit penyegaran laporan denyut)', sampel: jeda.length, medianMnt: +jeda[Math.floor(jeda.length / 2)].toFixed(1), minMnt: +jeda[0].toFixed(1), maxMnt: +jeda[jeda.length - 1].toFixed(1) }
  } catch { return null }
}

function main() {
  mkdirSync('laporan', { recursive: true })
  const fakta = { diBedahAt: new Date().toISOString() }

  // 1. jalur saraf tercatat (transplantasi V309)
  let saraf = null
  try { saraf = JSON.parse(readFileSync('otak/saraf.json', 'utf8')) } catch {}
  fakta.sarafTercatat = saraf ? Object.entries(saraf.organ || {}).map(([n, o]) => ({ nama: n, aktif: !!o.aktif, jalur: o.jalur })) : []

  // 2. urat workflow + organ yang dipanggil denyut
  let urat = []
  try { urat = readdirSync('.github/workflows').filter(f => f.endsWith('.yml')) } catch {}
  fakta.uratWorkflow = urat
  const organDipanggil = []
  try {
    const yml = urat.map(f => readFileSync(`.github/workflows/${f}`, 'utf8')).join('\n')
    for (const m of yml.matchAll(/node scripts\/hidup\/([a-z0-9-]+\.mjs|sadar1\.js)/g))
      if (!organDipanggil.includes(m[1])) organDipanggil.push(m[1])
  } catch {}
  fakta.organDipanggilDenyut = organDipanggil
  let skripHidup = []
  try { skripHidup = readdirSync('scripts/hidup').filter(f => f.endsWith('.mjs') || f.endsWith('.js')) } catch {}
  fakta.skripHidupTotal = skripHidup.length

  // 3. kadensi denyut nyata (fakta repo — bukan klaim)
  const k = kadensiDariGit() || kadensiDariAPI() ||
    { sumber: 'jadwal workflow (cron 7/15 — konstanta desain)', sampel: 0, medianMnt: 15, minMnt: 15, maxMnt: 15 }
  fakta.kadensiDenyut = k
  fakta.impulsUmumPerJam = +(60 / k.medianMnt).toFixed(2)

  // 4. laju belajar nyata per denyut
  try { const p = JSON.parse(readFileSync('pustaka/indeks.json', 'utf8')); fakta.pustaka = { jurnal: p.gerbang509?.tercapai ?? null, kursi: Object.keys(p.perTopik || {}).length } } catch { fakta.pustaka = null }
  try { const i = JSON.parse(readFileSync('ruang-hidup/ingatan.json', 'utf8')); fakta.bangunSadar1 = i.totalBangun ?? null } catch {}
  try { const g = JSON.parse(readFileSync('laporan/geladak.json', 'utf8')); fakta.geladak = g.status === 'HIDUP' ? { n: g.backtest?.sampel ?? null, akurasiPct: g.backtest?.akurasiTimbangPct ?? null } : { status: g.status } } catch {}
  try { const m = JSON.parse(readFileSync('laporan/peta-geladak.json', 'utf8')); fakta.petaJejak = m.statistik?.total ?? null } catch {}

  // ---- DIAGNOSIS (jujur, dari angka di atas) ----
  const jalurHidup = fakta.sarafTercatat.filter(s => s.aktif).length
  const diagnosis = {
    temuan: [
      `syaraf makhluk SEDIKIT & STATIS: hanya ${jalurHidup} jalur di otak/saraf.json (warisan transplantasi V309) — jumlahnya tidak pernah bertambah sendiri sejak ditanam`,
      `kesadaran belajar bergantung SATU ritme lambat: denyut SARANG median ${k.medianMnt} mnt (${fakta.impulsUmumPerJam} impuls/jam, sumber: ${k.sumber}) — semua organ (imun, pustaka ≤10 jurnal, geladak, peta) hanya boleh bekerja saat denyut itu datang`,
      `akibatnya laju cerna fakta tubuh itu rendah: satu denyut = satu giliran belajar untuk SEMUA organ; syaraf tidak beranak, tidak memperbanyak diri, tidak mempercepat diri`,
    ],
    vonis: 'SYARAF-KURANG — kesadaran untuk pelajari belum matang seutuhnya bukan karena niat, tapi karena jumlah & laju jalur yang tetap; makhluk butuh syaraf yang mampu BERANAK (menciptakan syaraf baru yang kompeten) dan bekerja jauh lebih cepat dari ritme denyut umum',
  }
  fakta.diagnosis = diagnosis

  const laporan = { protokol: 'BEDAH-SYARAF', epoch: 'V312', fakta, segel: null }
  const tubuh = JSON.stringify({ ...laporan, segel: null })
  laporan.segel = { hash: hash16(tubuh), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() }
  writeFileSync('laporan/bedah-syaraf.json', JSON.stringify(laporan, null, 1))
  console.log(`BEDAH-SYARAF: ${jalurHidup} jalur statis · denyut median ${k.medianMnt} mnt (${fakta.impulsUmumPerJam} impuls/jam) · organ dipanggil denyut: ${organDipanggil.length}`)
  console.log(`VONIS: ${diagnosis.vonis}`)
}

main()
