// ============================================================
// BUKU-CUAN-ABADI (V357) — riwayat TIDAK PERNAH MATI lagi
// ============================================================
// ULTIMATUM PEMILIK (2026-10-19):
//  (1) "Riwayat ini kenapa tak pernah bertingkat — kesannya sudah lama mati"
//      → forensik: bukuCuan beku sejak 2026-10-05 karena TIDAK ADA penulisnya
//        di denyut (V276 menulis sekali, organ penilainya tidak pernah ada
//        di workflow). Denyut hidup, buku mati — diakui terbuka di sini.
//  (2) "Jangan ada kasus kematian lagi informasi! Data jejak setiap waktu
//      kemarin harus selalu ada dan jadi bahan pembelajaran"
//      → laporan/buku-cuan.jsonl APPEND-ONLY tiap denyut (jejak tak bisa bisu);
//        backfill 14 hari (10-05→19) DIPULIHKAN dari sejarah git sasaran-
//        terkini.json + dinilai lilin nyata — angka dari pasar, nol karangan.
//  (3) "Kenapa SL/TP di ambang ±1 persen? Lihat data harian tiap koin 24
//      jam real time — kenaikan mereka berapa, penurunan mereka berapa!"
//      → tiap rencana kini membawa NAPAS KOIN nyata 7 hari (rentang harian,
//        rata naik, rata turun) + band dari tangga doktrin (D3-D7) — bukan
//        median kerucut-MC yang tidur di dalam debu.
// Prinsip: angka tidak dikarang; data tak ada = TAK-TERNILAI, jujur dicatat.
// Organ ini TIDAK PERNAH boleh mematikan denyut (denyut = nyawa).
// ============================================================
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { doktrinRencana, napasKoin, lilinTertutup, rrBersih } from './doktrin-perisiko.mjs'

const FILE_TRAIL = 'laporan/buku-cuan.jsonl'
const FILE_AK = 'arena-keadaan.json'
const FILE_SASARAN = 'laporan/sasaran-terkini.json'
const FILE_PELAJARAN = 'laporan/buku-cuan-pelajaran.json'
const SEJAK = Date.parse('2026-10-04T00:00:00Z')       // buku V276 mati 10-05 — pulihkan dari sini
const HORIZON_JAM = 24
const FEE_DEFAULT_PCT = 0.2                             // spot taker pulang-pergi (fee sasaran sendiri)
const ENTRI_TAMPIL = 60
// pegged/stable tak boleh jadi rencana (pelajaran RLUSD V299b): band-nya nol, napasnya nol
const PEGGED = /(USD|EUR|DAI|USDE|USDS|USD1|PYUSD|USDP|USDD|PAXG|XAUT|USTC|EURI|AEUR|BSCUSD|USDC|TUSD|FDUSD|BUSD)$/
const layakKoin = (s) => s && s !== 'USDT' && !PEGGED.test(s)

const HOSTS = [
  { nama: 'binance-vision', url: (s) => `https://data-api.binance.vision/api/v3/klines?symbol=${s}&interval=1h&limit=1000` },
  { nama: 'binance', url: (s) => `https://api.binance.com/api/v3/klines?symbol=${s}&interval=1h&limit=1000` },
  { nama: 'binance-api1', url: (s) => `https://api1.binance.com/api/v3/klines?symbol=${s}&interval=1h&limit=1000` },
  { nama: 'okx-darurat', url: (s) => `https://www.okx.com/api/v5/market/candles?instId=${s.replace(/USDT$/, '')}-USDT&bar=1H&limit=300` },  // tangga darurat — jujur dicatat per denyut
]
const tidur = (ms) => new Promise((r) => setTimeout(r, ms))
const segel = (o) => createHash('sha256').update(JSON.stringify(o)).digest('hex')
const norm = (s) => { s = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); return /USDT$/.test(s) ? s : s + 'USDT' }
const bacaJson = (f, c) => { try { return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : c } catch { return c } }
const tulis = (f, o) => { mkdirSync('laporan', { recursive: true }); writeFileSync(f, JSON.stringify(o, null, 1)) }
const pesan = (s) => console.log('[buku-cuan] ' + s)
const parseFeePct = (fee) => { const m = String(fee || '').match(/([\d.]+)\s*%/); return m ? +m[1] : FEE_DEFAULT_PCT }

// ---------- jaring tahan-banting: 3 usaha + hormat 418/429 ----------
async function jaring(url, namaHost) {
  for (let i = 0; i < 3; i++) {
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 12000)
      const r = await fetch(url, { cache: 'no-store', signal: c.signal })
      clearTimeout(t)
      if (r.status === 418 || r.status === 429) { pesan(`${namaHost} hormat ${r.status} — tidur 45 dtk`); await tidur(45000); continue }
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return await r.json()
    } catch (e) { if (i === 2) throw e; await tidur(1200 * (i + 1)) }
  }
}

// ---------- lilin 1h dari tangga sumber (binance → okx darurat) ----------
const cacheLilin = new Map()
async function lilin1h(sym) {
  const s = norm(sym)
  if (cacheLilin.has(s)) return cacheLilin.get(s)
  let out = null, hostPakai = null, galat = null
  for (const h of HOSTS) {
    try {
      const d = await jaring(h.url(s), h.nama)
      if (!Array.isArray(d) || d.length < 30) throw new Error('data kurang (' + (d && d.length) + ' bar)')
      const bar = d.map((k) => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] })).sort((a, b) => a.t - b.t)
      if (!bar.some((x) => Number.isFinite(x.c) && x.c > 0)) throw new Error('harga tak sah')
      out = bar; hostPakai = h.nama
      break
    } catch (e) { galat = h.nama + ': ' + (e.message || e) }
  }
  if (!out) { pesan(`lilin GAGAL ${s} — ${galat} → jejak TAK-TERNILAI (angka tak dikarang)`); cacheLilin.set(s, { null: true }); return null }
  const hasil = { bar: out, host: hostPakai }
  cacheLilin.set(s, hasil)
  return hasil
}

// ---------- penilaian satu rencana atas lilin nyata ----------
// Jendela (bornAt, bornAt+24j]: stop kena dulu = KALAH (konservatif);
// sasaran kena = MENANG; keduanya satu lilin → stop dulu; selainnya
// kedaluwarsa di tutup lilin penutup jendela — fee tetap ditagih.
function nilaiRencana(p, bar, kini = Date.now()) {
  const t0 = +p.bornAt, akhir = t0 + p.horizonJam * 3600e3
  const feePct = p.feePct
  if (kini < akhir) return { terbuka: true }
  const jendela = bar.filter((x) => x.t > t0 && x.t <= akhir)
  if (!jendela.length) return { status: 'TAK-TERNILAI', via: null, netPct: null, r: null, catatan: 'lilin jendela tak tersedia di semua sumber — nol angka karangan' }
  const tgt = p.target, stp = p.stop, sgn = p.arah === 'BUY' ? 1 : -1
  for (const b of jendela) {
    const kenaStop = stp != null && (p.arah === 'BUY' ? b.l <= stp : b.h >= stp)
    if (kenaStop) {
      const net = sgn * (stp / p.entry - 1) * 100 - feePct
      return { status: 'KALAH', via: 'stop', netPct: +net.toFixed(2), r: stp != null ? +(net / Math.abs(100 * (stp / p.entry - 1))).toFixed(2) : null, exit: stp, exitAt: b.t + 3600e3 }
    }
    const kenaTgt = tgt != null && (p.arah === 'BUY' ? b.h >= tgt : b.l <= tgt)
    if (kenaTgt) {
      const net = sgn * (tgt / p.entry - 1) * 100 - feePct
      return { status: 'MENANG', via: 'sasaran', netPct: +net.toFixed(2), r: stp != null ? +(net / Math.abs(100 * (stp / p.entry - 1))).toFixed(2) : null, exit: tgt, exitAt: b.t + 3600e3 }
    }
  }
  // kedaluwarsa: tutup lilin penutup jendela (jujur bila gap — pakai lilin terakhir sebelum akhir)
  const tutup = jendela[jendela.length - 1]
  const gapJam = +(((akhir - (tutup.t + 3600e3)) / 3600e3).toFixed(1))
  const net = sgn * (tutup.c / p.entry - 1) * 100 - feePct
  return {
    status: 'KEDALUWARSA', via: 'tutup', netPct: +net.toFixed(2),
    r: stp != null ? +(net / Math.abs(100 * (stp / p.entry - 1))).toFixed(2) : null,
    exit: tutup.c, exitAt: tutup.t + 3600e3,
    ...(gapJam > 1 ? { catatan: `gap data ${gapJam} jam sebelum penutup — keluar di lilin terakhir yang ada (jujur)` } : {}),
  }
}

// ---------- tambang sejarah git: rencana yang pernah lahir sejak SEJAK ----------
// Satu rencana per (simbol, arah, hari-UTC-lahir) — denyut me-re-kunci 15 menitan,
// itu rencana yang SAMA, bukan ratusan dagang berbeda. Simbol pegged/USDT ditolak.
function tambangRencanaGit() {
  const kumpul = new Map()
  let shas = []
  try {
    shas = execFileSync('git', ['log', '--format=%H', '--since=' + new Date(SEJAK).toISOString(), '--', FILE_SASARAN], { encoding: 'utf8', maxBuffer: 10e6 })
      .trim().split('\n').filter(Boolean)
  } catch (e) { pesan('git log tak tersedia (checkout dangkal?) — backfill dilewati jujur: ' + (e.message || e).slice(0, 80)); return { rencana: [], sumber: 'git-tak-ada' } }
  pesan('git: ' + shas.length + ' versi sasaran-terkini sejak ' + new Date(SEJAK).toISOString().slice(0, 10))
  // cat-file --batch: satu proses untuk SEMUA blob (700 git show per proses = 6 menit, ini 4 detik)
  const isi = execFileSync('git', ['cat-file', '--batch'], { input: shas.map((s) => s + ':' + FILE_SASARAN).join('\n') + '\n', encoding: 'utf8', maxBuffer: 512e6 })
  let nVersi = 0
  const blok = isi.split('\n')
  for (let i = 0; i < blok.length; i++) {
    const baris = blok[i]
    const m = baris.match(/^([0-9a-f]{40})\s+blob\s+(\d+)$/)
    if (!m) continue
    const ukur = +m[2]
    let mulai = i + 1
    // isi blob bisa memuat banyak baris — gabungkan sampai byte habis
    let buf = '', sisa = ukur
    let j = i + 1
    for (; j < blok.length && sisa > 0; j++) { buf += (buf ? '\n' : '') + blok[j]; sisa -= Buffer.byteLength(blok[j] + '\n') }
    i = j - 1
    nVersi++
    try {
      const d = JSON.parse(buf)
      const sh = d.sasaranHariIni || []
      for (const e of sh) {
        if (!e || !e.dikunci || e.arah !== 'BUY' && e.arah !== 'SELL') continue
        const bornAt = Date.parse(e.dikunci)
        if (!Number.isFinite(bornAt) || bornAt < SEJAK) continue
        if (e.entry == null || !(+e.entry > 0)) continue                      // tanpa harga entry — tak bisa dinilai tanpa karangan
        const sym = norm(e.simbol)
        if (!layakKoin(sym)) continue
        const hari = new Date(bornAt).toISOString().slice(0, 10)
        const kunci = `${sym}|${e.arah}|${hari}`
        const lama = kumpul.get(kunci)
        if (lama && lama.bornAt <= bornAt) continue            // re-kunci lebih muda = rencana sama, simpan kelahiran TERTUA
        kumpul.set(kunci, {
          id: `${sym}|${e.arah}|${bornAt}`, symbol: sym, arah: e.arah,
          entry: e.entry != null ? +e.entry : null, target: e.target != null ? +e.target : null,
          stop: e.stop != null ? +e.stop : null,
          sumberStop: e.sumberStop || (e.target != null ? 'MC-kone-2k' : null),
          bornAt, keyakinan: e.keyakinan != null ? +e.keyakinan : null,
          regime: e.rezim || null, feePct: parseFeePct(e.fee),
          horizonJam: HORIZON_JAM,
          lahirDari: 'git-' + m[1].slice(0, 7),
        })
      }
    } catch { /* versi rusak — lewati, jujur tak dihitung */ }
  }
  pesan(`git: ${nVersi} versi terbaca → ${kumpul.size} rencana unik (1 per simbol+arah+hari)`)
  return { rencana: [...kumpul.values()], sumber: 'git-' + nVersi + '-versi' }
}

// ---------- metrik dari buku ----------
function hitungMetrik(entri, kini = Date.now()) {
  const asli = entri.filter((e) => e.sumber !== 'doktrin-restorasi' && e.status !== 'TAK-TERNILAI')
  const urut = [...asli].sort((a, b) => (a.exitAt || Date.parse(a.day)) - (b.exitAt || Date.parse(b.day)))
  const n = urut.length
  const menang = urut.filter((e) => e.status === 'MENANG').length
  const kalah = urut.filter((e) => e.status === 'KALAH').length
  const kedaluwarsa = urut.filter((e) => e.status === 'KEDALUWARSA').length
  const eksPct = n ? +(urut.reduce((a, e) => a + e.netPct, 0) / n).toFixed(2) : null
  const rs = urut.filter((e) => e.r != null)
  const eksR = rs.length ? +(rs.reduce((a, e) => a + e.r, 0) / rs.length).toFixed(3) : null
  let ekuitas = 1, puncak = 1, mdd = 0
  const kurva = []
  for (const e of urut) { ekuitas *= 1 + e.netPct / 100; kurva.push(ekuitas); if (ekuitas > puncak) puncak = ekuitas; mdd = Math.max(mdd, (puncak - ekuitas) / puncak * 100) }
  const netKum = n ? +((ekuitas - 1) * 100).toFixed(2) : null
  // runtunan: MENANG/KALAH beruntun di ekor (kedaluwarsa memutus)
  let streak = '—'
  for (let i = urut.length - 1; i >= 0; i--) {
    const s = urut[i].status
    if (s === 'KEDALUWARSA') break
    let ct = 0
    for (let j = i; j >= 0 && urut[j].status === s; j--) ct++
    streak = (s === 'MENANG' ? 'M' : 'K') + ct
    break
  }
  const terurutNet = [...urut].filter((e) => e.netPct != null)
  const terbaik = terurutNet.length ? terurutNet.reduce((a, e) => (e.netPct > a.netPct ? e : a)) : null
  const terburuk = terurutNet.length ? terurutNet.reduce((a, e) => (e.netPct < a.netPct ? e : a)) : null
  const rezim = {}
  for (const e of urut) {
    const k = e.regime || 'TAK-DIKETAHUI'
    if (!rezim[k]) rezim[k] = { regime: k, n: 0, kalah: 0, jumlah: 0 }
    rezim[k].n++; if (e.status === 'KALAH') rezim[k].kalah++; rezim[k].jumlah += e.netPct
  }
  const perRegime = Object.values(rezim).map((r) => ({ regime: r.regime, n: r.n, kalah: r.kalah, eksPct: +(r.jumlah / r.n).toFixed(2) })).sort((a, b) => b.n - a.n)
  // DISIPLIN CUAN: ekspektansiR negatif pada ≥8 entri terakhir → pangkas keyakinan 3 hari; ber-KADALUARSA jujur
  const ekor = urut.slice(-8)
  const disR = ekor.length >= 8 && ekor.filter((e) => e.r != null).length >= 6
    ? +(ekor.filter((e) => e.r != null).reduce((a, e) => a + e.r, 0) / ekor.filter((e) => e.r != null).length).toFixed(3)
    : null
  const disiplinNegatif = disR != null && disR < 0
  const disiplinSampai = disiplinNegatif ? new Date(kini + 3 * 86400e3).toISOString().slice(0, 10) : null
  const disiplinAktif = disiplinNegatif
  return {
    totalPlan: n, menang, kalah, kedaluwarsa,
    winRate: n ? +(menang / n).toFixed(3) : null,
    ekspektansiPct: eksPct, ekspektansiR: eksR,
    netKumulatifPct: netKum, maxDrawdownPct: +mdd.toFixed(2),
    streak, terbaik: terbaik && { symbol: terbaik.symbol, day: terbaik.day, netPct: terbaik.netPct },
    terburuk: terburuk && { symbol: terburuk.symbol, day: terburuk.day, netPct: terburuk.netPct },
    perRegime,
    disiplinAktif, disiplinSampai,
    disiplinKet: disiplinNegatif ? `ekspektansi ${disR}R pada ${ekor.length} rencana terakhir — keyakinan dipangkas 5 poin hingga ${disiplinSampai} (ber-kadaluarsa, bukan beku)` : 'tidak aktif — ekspektansi ekor belum membuktikan perlunya rem',
  }
}

// ---------- pelajaran dari buku (bahan belajar hari ini & ke depan) ----------
function bangunPelajaran(entri, napasTabel, metrikDoktrin, kini = Date.now()) {
  const asli = entri.filter((e) => e.sumber !== 'doktrin-restorasi' && e.status !== 'TAK-TERNILAI')
  const kedalu = asli.filter((e) => e.status === 'KEDALUWARSA')
  const napasMedian = napasTabel.length ? [...napasTabel.map((x) => x.rentangHarianPct)].sort((a, b) => a - b)[Math.floor(napasTabel.length / 2)] : null
  const p = []
  if (kedalu.length && napasMedian != null) {
    const sim = [...new Set(kedalu.map((e) => e.symbol))].slice(0, 4).join(', ')
    p.push(`KEDALUWARSA ${kedalu.length}/${asli.length} rencana (${sim}…) — band lama ±1-2% tidur di dalam debu: rentang harian nyata koin-koin ini median ${napasMedian.toFixed(1)}%. Target di dalam napas koin = bayar fee untuk tidak berdagang.`)
  }
  if (metrikDoktrin && metrikDoktrin.totalPlan > 0) {
    p.push(`BAYANGAN DOKTRIN (restorasi tangga H24/L24→R1→R2→0,618R pada rencana yang sama): MENANG ${metrikDoktrin.menang} · KALAH ${metrikDoktrin.kalah} · KEDALUWARSA ${metrikDoktrin.kedaluwarsa} · ekspektansi ${metrikDoktrin.ekspektansiPct}%/rencana vs band-lama ${metrikDoktrin.pembanding.ekspektansiPct}% — ${metrikDoktrin.ekspektansiPct > metrikDoktrin.pembanding.ekspektansiPct ? 'napas koin menang atas kepengecutan band' : 'jujur: band lama masih lebih untung di sampel ini — dipantau, bukan disembunyikan'}.`)
  }
  const kal = asli.filter((e) => e.status === 'KALAH')
  if (kal.length) {
    const viaStop = kal.length
    const rata = (kal.reduce((a, e) => a + (e.netPct || 0), 0) / kal.length).toFixed(2)
    p.push(`KENA STOP ${viaStop} kali, rata ${rata}% — rata-rata diselamatkan stop doktrin (pembatal ∓0,5×ATR); tanpa stop, tiap kalah ini bisa jadi −20..−35% seperti MOVR 10-02. Stop bukan pengecut — stop adalah hidup.`)
  }
  if (napasTabel.length) {
    const paling = [...napasTabel].sort((a, b) => b.rentangHarianPct - a.rentangHarianPct)[0]
    p.push(`NAPAS PASAR NYATA 7 hari: ${napasTabel.length} koin diukur — terbesar ${paling.symbol.replace('USDT', '')} rentang harian ${paling.rentangHarianPct.toFixed(1)}% (naik rata +${(paling.naikHarianPct ?? 0).toFixed(1)}%, turun rata ${(paling.turunHarianPct ?? 0).toFixed(1)}%). Sistem kini MENGUKUR napas tiap koin sebelum menarik band — tidak ada lagi ambang karangan.`)
  }
  return p.slice(0, 4)
}

// ============================================================
async function main() {
  const kini = Date.now()
  const TGL = new Date(kini).toISOString().slice(0, 10)
  mkdirSync('laporan', { recursive: true })

  // ---- 1. muat jejak (append-only) ----
  let trail = []
  try { trail = readFileSync(FILE_TRAIL, 'utf8').trim().split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) } catch { trail = [] }
  const trailMula = trail.length
  const vonisAda = new Set(trail.filter((t) => t.jenis === 'vonis').map((t) => t.id))
  const rencanaAda = new Map(trail.filter((t) => t.jenis === 'rencana').map((t) => [t.id, t]))
  pesan(`jejak dimuat: ${trail.length} baris (${vonisAda.size} vonis, ${rencanaAda.size} rencana)`)

  // ---- 2. benih: buku lama V276 (10 entri) masuk jejak — sejarah tidak dihapus ----
  const ak = bacaJson(FILE_AK, {})
  const bukuLama = ak.bukuCuan
  if (bukuLama && Array.isArray(bukuLama.entri) && !trail.some((t) => t.sumber === 'buku-lama-V276')) {
    for (const e of bukuLama.entri) {
      const id = 'lama|' + e.day + '|' + e.symbol + '|' + e.status + '|' + e.netPct
      if (vonisAda.has(id)) continue
      trail.push({ jenis: 'vonis', id, day: e.day, symbol: norm(e.symbol), arah: e.arah, via: e.via, status: e.status, entry: e.entry ?? null, target: e.target ?? null, stop: e.stop ?? null, netPct: e.netPct, r: e.r ?? null, keyakinan: e.keyakinan ?? null, regime: e.regime ?? null, feePct: 0.4, exitAt: Date.parse(e.day + 'T00:00:00Z'), sumber: 'buku-lama-V276' })
      vonisAda.add(id)
    }
    pesan('benih: entri buku-lama-V276 dimasukkan jejak (' + bukuLama.entri.length + ') — sejarah tetap hidup')
  }

  // ---- 3. BACKFILL: rencana 10-05→hari ini dari git, dinilai lilin nyata ----
  let backfillCt = 0, dokRestorasiCt = 0
  const perluBackfill = !trail.some((t) => t.jenis === 'denyut' && t.backfillSelesai)
  if (perluBackfill) {
    const { rencana, sumber } = tambangRencanaGit()
    pesan(`backfill: ${rencana.length} rencana unik dari ${sumber}`)
    for (const p of rencana) {
      if (!rencanaAda.has(p.id)) { trail.push({ jenis: 'rencana', ...p }); rencanaAda.set(p.id, p) }
      const L = await lilin1h(p.symbol)
      const barAll = L ? L.bar : null
      const host = L ? L.host : null
      // (a) band asli rencana (bila ada) — buku SEBENARNYA
      if (p.target != null && p.stop != null && !vonisAda.has(p.id)) {
        const h = barAll ? nilaiRencana(p, barAll, kini) : { status: 'TAK-TERNILAI', catatan: 'lilin tak tersedia' }
        if (h.terbuka) { /* biarkan terbuka */ }
        else {
          trail.push({ jenis: 'vonis', id: p.id, day: new Date(p.bornAt + p.horizonJam * 3600e3).toISOString().slice(0, 10), symbol: p.symbol, arah: p.arah, via: h.via, status: h.status, entry: p.entry, target: p.target, stop: p.stop, netPct: h.netPct, r: h.r, keyakinan: p.keyakinan, regime: p.regime, feePct: p.feePct, bornAt: p.bornAt, exit: h.exit ?? null, exitAt: h.exitAt ?? null, sumber: 'sasaran-resmi', backfill: true, host, catatan: h.catatan || `dipulihkan dari ${p.lahirDari} — dinilai terlambat, angka dari lilin nyata` })
          vonisAda.add(p.id); backfillCt++
        }
      } else if ((p.target == null || p.stop == null) && !vonisAda.has(p.id + '|telanjang')) {
        trail.push({ jenis: 'vonis', id: p.id + '|telanjang', day: new Date(p.bornAt + p.horizonJam * 3600e3).toISOString().slice(0, 10), symbol: p.symbol, arah: p.arah, via: null, status: 'TAK-TERNILAI', entry: p.entry, target: null, stop: null, netPct: null, r: null, keyakinan: p.keyakinan, regime: p.regime, feePct: p.feePct, bornAt: p.bornAt, sumber: 'sasaran-resmi', backfill: true, host, catatan: 'rencana lahir TANPA stop/target (kelahiran telanjang V262 belum menutup kasusnya) — tak bisa dinilai tanpa mengarang' })
        vonisAda.add(p.id + '|telanjang'); backfillCt++
      }
      // (b) BAYANGAN DOKTRIN — tangga D3-D7 dihitung DI SAAT KELAHIRAN (restorasi jujur)
      const idD = p.id + '|doktrin'
      if (!vonisAda.has(idD) && barAll) {
        const masaLalu = barAll.filter((x) => x.t < p.bornAt).slice(-400)
        const dok = doktrinRencana(masaLalu, p.arah, p.entry, p.feePct, p.bornAt)
        if (dok && dok.layak) {
          const pd = { ...p, target: dok.target, stop: dok.stop, feePct: p.feePct }
          const h = nilaiRencana(pd, barAll.filter((x) => x.t > p.bornAt), kini)
          if (!h.terbuka) {
            trail.push({ jenis: 'vonis', id: idD, day: new Date(p.bornAt + p.horizonJam * 3600e3).toISOString().slice(0, 10), symbol: p.symbol, arah: p.arah, via: h.via, status: h.status, entry: p.entry, target: dok.target, stop: dok.stop, netPct: h.netPct, r: h.r, keyakinan: p.keyakinan, regime: p.regime, feePct: p.feePct, bornAt: p.bornAt, exit: h.exit ?? null, exitAt: h.exitAt ?? null, sumber: 'doktrin-restorasi', backfill: true, host, anak: dok.anak, catatan: h.catatan || `bayangan doktrin (${dok.sumber}${dok.anak ? ' · ' + dok.anak : ''}): target ${dok.targetPct.toFixed(1)}% / stop ${dok.stopPct.toFixed(1)}% — dinilai pada rencana yang sama` })
            vonisAda.add(idD); dokRestorasiCt++
          }
        } else if (dok && !dok.layak) {
          trail.push({ jenis: 'vonis', id: idD, day: new Date(p.bornAt + p.horizonJam * 3600e3).toISOString().slice(0, 10), symbol: p.symbol, arah: p.arah, via: null, status: 'TAK-LAYAK-DOKTRIN', entry: p.entry, target: null, stop: null, netPct: null, r: null, keyakinan: p.keyakinan, regime: p.regime, feePct: p.feePct, bornAt: p.bornAt, sumber: 'doktrin-restorasi', backfill: true, host, catatan: 'doktrin menolak di saat kelahiran: ' + dok.alasan })
          vonisAda.add(idD)
        }
      }
      await tidur(120)   // sopan ke API publik
    }
    trail.push({ jenis: 'denyut', waktu: new Date(kini).toISOString(), backfillSelesai: true, backfill: backfillCt, doktrinRestorasi: dokRestorasiCt, catatan: 'backfill 10-05→' + TGL + ' selesai — jejak kemarian dipulihkan dari sejarah git, dinilai lilin nyata, nol karangan' })
    pesan(`backfill selesai: ${backfillCt} vonis asli + ${dokRestorasiCt} bayangan doktrin`)
  }

  // ---- 4. rencana resmi hari ini (sasaran-terkini) → rencana terbuka + berlangsung ----
  const sas = bacaJson(FILE_SASARAN, {})
  const sh = sas.sasaranHariIni || []
  const berlangsung = []
  const napasTabel = []
  let hostNapas = null
  for (const e of sh) {
    if (!e || !e.arah || e.entry == null || !(+e.entry > 0)) continue
    const sym = norm(e.simbol)
    if (!layakKoin(sym)) continue                                              // stable/pegged tak bernapas — ditolak jujur
    const bornAt = e.dikunci ? Date.parse(e.dikunci) : (sas.dihasilkan ? Date.parse(sas.dihasilkan) : kini)
    const id = `${sym}|${e.arah}|${bornAt}`
    const feePct = parseFeePct(e.fee)
    if (!rencanaAda.has(id)) { trail.push({ jenis: 'rencana', id, symbol: sym, arah: e.arah, entry: +e.entry, target: e.target != null ? +e.target : null, stop: e.stop != null ? +e.stop : null, sumberStop: e.sumberStop || (e.target != null ? 'MC-kone-2k' : null), bornAt, keyakinan: e.keyakinan ?? null, regime: e.rezim || null, feePct, horizonJam: HORIZON_JAM, lahirDari: 'sasaran-resmi' }); rencanaAda.set(id, { id, symbol: sym, arah: e.arah, entry: +e.entry, target: e.target != null ? +e.target : null, stop: e.stop != null ? +e.stop : null, bornAt, feePct, horizonJam: HORIZON_JAM }) }
    const L = await lilin1h(sym)
    if (L) {
      hostNapas = hostNapas || L.host
      const cc = lilinTertutup(L.bar, kini)
      const np = napasKoin(cc, 7)
      const tutup24 = cc && cc.length > 26 ? cc[cc.length - 1].c / cc[cc.length - 25].c - 1 : null
      if (np) napasTabel.push({ symbol: sym, ...np, chg24hPct: tutup24 != null ? +(tutup24 * 100).toFixed(2) : null })
      let targetPct = e.target != null ? +((100 * (+e.target / +e.entry - 1)) * (e.arah === 'BUY' ? 1 : -1)).toFixed(2) : null
      let stopPct = e.stop != null ? +((100 * (1 - +e.stop / +e.entry)) * (e.arah === 'BUY' ? 1 : -1)).toFixed(2) : null
      let sumberStop = e.sumberStop || (e.target != null ? 'MC-kone-2k' : null)
      let dok = null
      if (targetPct == null && cc) {
        dok = doktrinRencana(cc, e.arah, +e.entry, feePct, kini)
        if (dok && dok.layak) {
          targetPct = +dok.targetPct.toFixed(2); stopPct = +dok.stopPct.toFixed(2)
          sumberStop = dok.sumber + (dok.anak ? ' · ' + dok.anak : '')
          rencanaAda.get(id).target = dok.target; rencanaAda.get(id).stop = dok.stop
          rencanaAda.get(id).sumberStop = sumberStop
        }
      }
      const sejak = L.bar.filter((b) => b.t > bornAt)
      const tinggiSejak = sejak.length ? +Math.max(...sejak.map((b) => b.h)).toFixed(8) : null
      const rendahSejak = sejak.length ? +Math.min(...sejak.map((b) => b.l)).toFixed(8) : null
      berlangsung.push({
        symbol: sym, arah: e.arah, entry: +e.entry,
        targetPct, stopPct,
        targetHarga: e.target != null ? +e.target : (dok && dok.layak ? +dok.target.toFixed(8) : null),
        stopHarga: e.stop != null ? +e.stop : (dok && dok.layak ? +dok.stop.toFixed(8) : null),
        sumberStop: sumberStop || null,
        bornAt: new Date(bornAt).toISOString(),
        keyakinan: e.keyakinan ?? null, regime: e.rezim || null, feePct,
        napas: np ? { rentangHarianPct: +np.rentangHarianPct.toFixed(2), naikHarianPct: np.naikHarianPct != null ? +np.naikHarianPct.toFixed(2) : null, turunHarianPct: np.turunHarianPct != null ? +np.turunHarianPct.toFixed(2) : null } : null,
        chg24hPct: tutup24 != null ? +(tutup24 * 100).toFixed(2) : null,
        sejakKunci: { tertinggi: tinggiSejak, terendah: rendahSejak },
        doktrin: dok ? { layak: dok.layak, anak: dok.anak || null, alasan: dok.alasan || null, rrKotor: dok.rrKotor != null ? +dok.rrKotor.toFixed(2) : null } : null,
      })
    } else {
      berlangsung.push({ symbol: sym, arah: e.arah, entry: +e.entry, targetPct: null, stopPct: null, sumberStop: e.sumberStop || null, bornAt: new Date(bornAt).toISOString(), keyakinan: e.keyakinan ?? null, regime: e.rezim || null, feePct, napas: null, catatan: 'lilin tak terjangkau semua sumber — napas & band tak dikarang' })
    }
    await tidur(120)
  }

  // ---- 5. nilai rencana terbuka yang sudah matang (termasuk bukan hari ini) ----
  let dinilaiBaru = 0, menangBaru = 0, kalahBaru = 0, kedalBaru = 0
  const semuaRencana = [...rencanaAda.values()]
  for (const p of semuaRencana) {
    if (p.sumberStop === 'PENGAWAS') continue
    const matang = p.bornAt + p.horizonJam * 3600e3 <= kini
    if (!matang) continue
    const adaVonis = vonisAda.has(p.id) || vonisAda.has(p.id + '|telanjang')
    if (adaVonis) continue
    const L = await lilin1h(p.symbol)
    if (!L) {
      trail.push({ jenis: 'vonis', id: p.id + (p.target == null ? '|telanjang' : ''), day: new Date(p.bornAt + p.horizonJam * 3600e3).toISOString().slice(0, 10), symbol: p.symbol, arah: p.arah, via: null, status: 'TAK-TERNILAI', entry: p.entry, target: p.target ?? null, stop: p.stop ?? null, netPct: null, r: null, keyakinan: p.keyakinan ?? null, regime: p.regime ?? null, feePct: p.feePct, bornAt: p.bornAt, sumber: 'sasaran-resmi', catatan: 'lilin tak tersedia saat penilaian — dinilai ulang denyut berikutnya (jujur)' })
      vonisAda.add(p.id); continue
    }
    const h = nilaiRencana(p, L.bar, kini)
    if (h.terbuka) continue
    trail.push({ jenis: 'vonis', id: p.target != null ? p.id : p.id + '|telanjang', day: new Date(p.bornAt + p.horizonJam * 3600e3).toISOString().slice(0, 10), symbol: p.symbol, arah: p.arah, via: p.target != null ? h.via : null, status: p.target != null ? h.status : 'TAK-TERNILAI', entry: p.entry, target: p.target ?? null, stop: p.stop ?? null, netPct: p.target != null ? h.netPct : null, r: p.target != null ? h.r : null, keyakinan: p.keyakinan ?? null, regime: p.regime ?? null, feePct: p.feePct, bornAt: p.bornAt, exit: h.exit ?? null, exitAt: h.exitAt ?? null, sumber: 'sasaran-resmi', host: L.host, catatan: p.target == null ? 'rencana lahir tanpa stop/target — status jujur TAK-TERNILAI' : (h.catatan || null) })
    vonisAda.add(p.target != null ? p.id : p.id + '|telanjang')
    dinilaiBaru++
    if (h.status === 'MENANG') menangBaru++; else if (h.status === 'KALAH') kalahBaru++; else if (h.status === 'KEDALUWARSA') kedalBaru++
    await tidur(120)
  }

  // ---- 6. susun buku & metrik ----
  const entri = trail.filter((t) => t.jenis === 'vonis').map(({ jenis, ...e }) => e).sort((a, b) => (a.exitAt || a.bornAt || Date.parse(a.day)) - (b.exitAt || b.bornAt || Date.parse(b.day)))
  const m = hitungMetrik(entri, kini)
  const dokEntri = entri.filter((e) => e.sumber === 'doktrin-restorasi')
  const pembanding = hitungMetrik(entri.filter((e) => e.sumber !== 'doktrin-restorasi'), kini)
  const asliCount = pembanding.totalPlan
  const mDok = {
    totalPlan: dokEntri.filter((e) => e.status !== 'TAK-LAYAK-DOKTRIN').length,
    menang: dokEntri.filter((e) => e.status === 'MENANG').length,
    kalah: dokEntri.filter((e) => e.status === 'KALAH').length,
    kedaluwarsa: dokEntri.filter((e) => e.status === 'KEDALUWARSA').length,
    ditolakDoktrin: dokEntri.filter((e) => e.status === 'TAK-LAYAK-DOKTRIN').length,
    ekspektansiPct: dokEntri.filter((e) => e.netPct != null).length ? +(dokEntri.filter((e) => e.netPct != null).reduce((a, e) => a + e.netPct, 0) / dokEntri.filter((e) => e.netPct != null).length).toFixed(2) : null,
    pembanding: { ekspektansiPct: pembanding.ekspektansiPct, totalPlan: pembanding.totalPlan },
  }
  const napasUrut = [...napasTabel].map((x) => x.rentangHarianPct).sort((a, b) => a - b)
  const napasMedian = napasUrut.length ? +napasUrut[Math.floor(napasUrut.length / 2)].toFixed(2) : null
  const pelajaran = bangunPelajaran(entri, napasTabel, mDok.totalPlan ? mDok : null, kini)

  // ---- 7. jejak denyut — APPEND-ONLY, tak pernah bisu lagi ----
  const jejakDenyut = { jenis: 'denyut', waktu: new Date(kini).toISOString(), dinilai: dinilaiBaru, menang: menangBaru, kalah: kalahBaru, kedaluwarsa: kedalBaru, terbuka: berlangsung.length, buku: { totalPlan: m.totalPlan, menang: m.menang, kalah: m.kalah, kedaluwarsa: m.kedaluwarsa, netKumulatifPct: m.netKumulatifPct }, napasMedianPct: napasMedian, sumberData: hostNapas || (cacheLilin.size ? [...cacheLilin.values()][0]?.host : null) || 'tak-dihubungi', segelJejak: null }
  jejakDenyut.segelJejak = segel({ dinilai: jejakDenyut.dinilai, buku: jejakDenyut.buku, waktu: jejakDenyut.waktu })
  trail.push(jejakDenyut)
  // APPEND-ONLY: semua baris baru denyut ini (benih + backfill + vonis + jejak) masuk jejak abadi
  const barisBaru = trail.slice(trailMula)
  if (barisBaru.length) appendFileSync(FILE_TRAIL, barisBaru.map((t) => JSON.stringify(t)).join('\n') + '\n')
  pesan(`jejak: +${barisBaru.length} baris (total ${trail.length})`)

  // ---- 8. tulis buku ke arena-keadaan.json (hanya kunci bukuCuan — sisanya milik denyut) ----
  const segelBuku = segel({ totalPlan: m.totalPlan, menang: m.menang, kalah: m.kalah, kedaluwarsa: m.kedaluwarsa, netKumulatifPct: m.netKumulatifPct, at: jejakDenyut.waktu })
  ak.bukuCuan = {
    hari: TGL, at: jejakDenyut.waktu,
    entri: entri.slice(-ENTRI_TAMPIL).map((e) => ({ day: e.day, symbol: e.symbol, arah: e.arah, status: e.status, via: e.via, entry: e.entry ?? null, target: e.target ?? null, stop: e.stop ?? null, netPct: e.netPct, r: e.r, keyakinan: e.keyakinan, regime: e.regime, sumber: e.sumber || 'sasaran-resmi', backfill: !!e.backfill, catatan: e.catatan || null })),
    metrik: m,
    metrikDoktrin: mDok,
    berlangsung,
    napasPasar: { koinDihitung: napasTabel.length, medianRentangHarianPct: napasMedian != null ? +napasMedian.toFixed(2) : null, koinTerbesar: napasTabel.length ? [...napasTabel].sort((a, b) => b.rentangHarianPct - a.rentangHarianPct)[0] : null, sumberData: hostNapas, ket: 'napas = rentang harian NYATA 7 hari dari lilin 1h — ukuran band mengikuti napas koin, bukan ambang karangan' },
    napasKoin: napasTabel,
    pelajaran,
    backfill: { selesai: perluBackfill, vonisPulih: backfillCt, doktrinRestorasi: dokRestorasiCt, sumber: 'sejarah git laporan/sasaran-terkini.json + lilin nyata' },
    jejak: { berkas: 'laporan/buku-cuan.jsonl', sifat: 'append-only — satu baris per peristiwa, tak pernah bisu lagi', segel: segelBuku },
    kejujuran: 'Riwayat pernah beku 10-05→10-19 (tanpa penulis — diakui terbuka); kini dinilai SETIAP denyut dari lilin nyata, backfill dipulihkan dari sejarah git, angka tidak dikarang, data kosong = TAK-TERNILAI.',
  }
  tulis(FILE_AK, ak)

  // ---- 9. pelajaran → fosil belajar ----
  tulis(FILE_PELAJARAN, { protokol: 'BUKU-CUAN-PELAJARAN-V357', dihasilkan: jejakDenyut.waktu, pelajaran, metrik: { totalPlan: m.totalPlan, menang: m.menang, kalah: m.kalah, kedaluwarsa: m.kedaluwarsa, ekspektansiPct: m.ekspektansiPct, ekspektansiR: m.ekspektansiR, netKumulatifPct: m.netKumulatifPct }, metrikDoktrin: mDok, napasMedianPct: napasMedian, segel: segelBuku })
  pesan(`buku: ${m.totalPlan} rencana — MENANG ${m.menang} · KALAH ${m.kalah} · KEDALUWARSA ${m.kedaluwarsa} · net ${m.netKumulatifPct}% · runtunan ${m.streak} · napas median ${napasMedian != null ? napasMedian + '%' : '—'}`)
  pesan(`berlangsung ${berlangsung.length} · dinilai baru ${dinilaiBaru} · pelajaran ${pelajaran.length} → ${FILE_PELAJARAN}`)
}

main().catch((e) => { console.error('[buku-cuan] GAGAL (jujur, denyut tetap hidup):', (e && e.stack) || e); process.exit(1) })
