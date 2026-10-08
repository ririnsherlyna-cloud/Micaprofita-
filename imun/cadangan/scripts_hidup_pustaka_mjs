// ============================================================
// PUSTAKA-SEJATI (V299) — organ belajar jurnal nyata MICAPROFITA
// ============================================================
// Mandat pemilik (2026-10-08): "pelajari kode & jurnal artificial life,
// lalu jurnal crypto; bila sudah 509 jurnal, makhluk dinyatakan layak."
// Sumpah yang mengikat: TANPA KARANGAN. Setiap entri adalah metadata
// jurnal NYATA dari arXiv (judul, penulis, tahun, abstrak asli) yang
// diunduh lewat API publik — bukan ringkasan ciptaan.
// • Tiap denyut SARANG-PENJAGA: 1 query (rotasi round-robin), maks 15
//   hasil, disaring dedup — pustaka TUMBUH terukur, hitungan jujur.
// • Gerbang 509: indeks.gerbang509.tercapai — makhluk sendiri yang
//   melaporkan kejayaannya; belum 509 = belum layak, apa pun klaimnya.
// • Segel SHA-256 di indeks.segel — selaras budaya sadar1.
// • Pelajaran tiap jurnal = ekstraksi OTOMATIS dari abstrak asli
//   (kalimat tesis "we propose/show/find"), ditandai pelajaranOtomatis:
//   true — bukan tulisan LLM yang mengarang isi jurnal.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const DIR = 'pustaka'
const FILE_PUSTAKA = `${DIR}/pustaka.json`
const FILE_INDEKS = `${DIR}/indeks.json`
const TARGET = 509
const MAKS_BARU_PER_DENYUT = 10

// rotasi topik — artificial life dulu (jantung eksperimen), lalu crypto
const KURSI = [
  { topik: 'artificial-life',      q: 'all:"artificial life"' },
  { topik: 'digital-organism',     q: 'all:"digital organism"' },
  { topik: 'evolusi-komputasi',    q: 'all:"evolutionary computation"' },
  { topik: 'swarm',                q: 'all:"swarm intelligence"' },
  { topik: 'sistem-adaptif',       q: 'all:"complex adaptive systems"' },
  { topik: 'agent-pasar',          q: 'all:"agent-based model" AND all:"financial market"' },
  { topik: 'crypto-ml',            q: 'all:"cryptocurrency" AND all:"deep learning"' },
  { topik: 'trading-algoritmik',   q: 'cat:q-fin.TR' },
  { topik: 'trading-otomatis',     q: 'all:"algorithmic trading"' },
  { topik: 'ramal-bitcoin',        q: 'all:"Bitcoin" AND all:"price prediction"' },
  { topik: 'buku-order',           q: 'all:"limit order book"' },
  { topik: 'rl-trading',           q: 'all:"reinforcement learning" AND all:"trading"' },
  { topik: 'analisis-teknikal',    q: 'all:"technical analysis" AND cat:q-fin.*' },
  { topik: 'on-chain',             q: 'all:"blockchain" AND all:"on-chain"' },
  { topik: 'defi',                 q: 'all:"decentralized finance"' },
  { topik: 'sentimen-pasar',       q: 'all:"market sentiment" AND all:"cryptocurrency"' },
  { topik: 'risiko-pasar',         q: 'all:"cryptocurrency" AND all:"volatility"' },
  { topik: 'mikrostruktur',        q: 'all:"market microstructure"' },
  // — kursi kaji baru (V304): ALife klasik yang belum diajarkan + sisi crypto yang masih nol —
  { topik: 'evolusi-terbuka',      q: 'all:"open-ended evolution"' },
  { topik: 'otomata',              q: 'all:"cellular automata"' },
  { topik: 'replikasi-diri',       q: 'all:"self-replication"' },
  { topik: 'kimia-artifisial',     q: 'all:"artificial chemistry"' },
  { topik: 'algoritma-genetik',    q: 'all:"genetic algorithm"' },
  { topik: 'dinamika-evolusi',     q: 'all:"evolutionary dynamics"' },
  { topik: 'perilaku-adaptif',     q: 'cat:nlin.AO' },
  { topik: 'avida-tierra',         q: 'all:"Avida" OR all:"Tierra"' },
  { topik: 'cryptocurrency',       q: 'all:"cryptocurrency"' },
  { topik: 'bitcoin',              q: 'all:"Bitcoin"' },
  { topik: 'keuangan-komputasi',   q: 'cat:q-fin.CP' },
  { topik: 'portofolio',           q: 'all:"portfolio optimization"' },
  { topik: 'hft',                  q: 'all:"high-frequency trading"' },
  { topik: 'ramal-volatilitas',    q: 'all:"volatility forecasting"' },
  { topik: 'rl-keuangan',          q: 'all:"deep reinforcement learning" AND cat:q-fin.*' },
  { topik: 'market-making',        q: 'all:"market making"' },
  { topik: 'momentum-qfin',        q: 'all:"momentum" AND cat:q-fin.*' },
  { topik: 'strategi-trading',     q: 'all:"trading strategy"' },
  { topik: 'sentimen-berita',      q: 'all:"sentiment analysis" AND cat:q-fin.*' },
]

const bacaJson = (f, c) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : c)

function bersih(s) { return String(s || '').replace(/\s+/g, ' ').trim() }

// parser Atom minimal — tanpa dependency
function parseAtom(xml) {
  const keluar = []
  const entris = xml.split(/<entry>/).slice(1)
  for (const pot of entris) {
    const e = pot.split('</entry>')[0]
    const ambil = (tag) => {
      const m = e.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
      return m ? bersih(m[1].replace(/<!\[CDATA\[|\]\]>/g, '')) : ''
    }
    const id = ambil('id')
    const judul = bersih(ambil('title').replace(/\n/g, ' '))
    const abstrak = bersih(ambil('summary'))
    const terbit = ambil('published')
    const doi = (e.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/) || [])[1] || ''
    const penulis = [...e.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g)]
      .map(m => bersih(m[1]))
    const kelas = [...e.matchAll(/<category[^>]*term="([^"]+)"/g)].map(m => m[1])
    keluar.push({ id, judul, abstrak, terbit, doi: bersih(doi), penulis, kelas })
  }
  return keluar
}

// pelajaran jujur-otomatis: kalimat tesis dari abstrak asli, tanpa mengarang
function pelajaranDari(abstrak) {
  if (!abstrak) return ''
  const kalimat = abstrak.split(/(?<=[.!?])\s+/).filter(s => s.length > 30)
  const tesis = kalimat.find(s => /\bwe (propose|present|show|introduce|find|demonstrate|study|analyze)\b/i.test(s))
    || kalimat.find(s => /\b(this (paper|work|study)|our (model|approach|method))\b/i.test(s))
    || kalimat[0] || abstrak
  return tesis.slice(0, 340)
}

function topikDari(kelas, judul) {
  const j = judul.toLowerCase()
  if (/artificial life|digital organism|alife/.test(j)) return 'artificial-life'
  if (/evolution|genetic|mutation/.test(j)) return 'evolusi'
  if (/swarm|ant colony|flocking/.test(j)) return 'swarm'
  if (/emergen|self-organiz/.test(j)) return 'emergensi'
  if (/bitcoin|crypto|ethereum|token|defi|nft/.test(j)) return 'crypto'
  if (/trading|order book|exchange|market maker|liquidity/.test(j)) return 'pasar-mikro'
  if (/neural|deep learning|transformer|llm/.test(j)) return 'jaringan-saraf'
  if (/reinforcement|reward|agent/.test(j)) return 'agen-belajar'
  if (/volatil|risk|drawdown|crash|bubble/.test(j)) return 'risiko'
  if (/sentiment|social|reddit|twitter/.test(j)) return 'sentimen'
  return (kelas && kelas[0]) || 'umum'
}

async function unduh(query, start) {
  const url = 'http://export.arxiv.org/api/query?search_query=' + encodeURIComponent(query)
    + `&start=${start}&max_results=15&sortBy=submittedDate&sortOrder=descending`
  const res = await fetch(url, { headers: { 'User-Agent': 'Micaprofita-Pustaka/1.0 (pembelajaran jurnal; kontak: pemilik repo)' } })
  if (!res.ok) throw new Error(`arxiv ${res.status}`)
  return parseAtom(await res.text())
}

async function main() {
  mkdirSync(DIR, { recursive: true })
  const pustaka = bacaJson(FILE_PUSTAKA, [])
  const indeks = bacaJson(FILE_INDEKS, { gerbang509: { target: TARGET, tercapai: 0 } })
  const kunciLama = new Set(pustaka.map(j => j.kunci))
  // V304-KURIKULUM-MERATA: kursor per-kursi — setiap kursi kaji punya posisi
  // sendiri, dan kursi berputar TIAP denyut agar seluruh kurikulum (ALife
  // klasik + crypto/q-fin) mengajar merata, bukan satu kursi menelan semua.
  const mulaiKursi = (indeks.mulaiKursi && typeof indeks.mulaiKursi === 'object') ? indeks.mulaiKursi : {}
  if (indeks.mulai !== undefined && mulaiKursi['evolusi-komputasi'] === undefined) {
    mulaiKursi['evolusi-komputasi'] = Number(indeks.mulai || 0) // migrasi posisi kaji lama
  }
  const kursi = (indeks.kursi === undefined) ? 0 : Number(indeks.kursi) % KURSI.length
  const k = KURSI[kursi]
  const mulai = Number(mulaiKursi[k.topik] || 0)
  let hasil = []
  let gagal = null
  try { hasil = await unduh(k.q, mulai) } catch (e) { gagal = String(e.message || e) }

  const baru = []
  for (const e of hasil) {
    if (baru.length >= MAKS_BARU_PER_DENYUT) break
    if (!e.judul || !e.id) continue
    const kunci = e.doi || e.id.replace(/^https?:\/\/(arxiv\.org\/abs\/|export\.arxiv\.org\/abs\/)/, '')
    if (kunciLama.has(kunci)) continue
    kunciLama.add(kunci)
    const tahun = e.terbit ? e.terbit.slice(0, 4) : ''
    baru.push({
      kunci,
      sumber: 'arxiv',
      arxivUrl: e.id,
      doi: e.doi || null,
      judul: e.judul,
      penulis: e.penulis.slice(0, 6),
      tahun,
      topik: topikDari(e.kelas, e.judul),
      kelasArxiv: e.kelas.slice(0, 4),
      abstrak: e.abstrak.slice(0, 1400),
      pelajaran: pelajaranDari(e.abstrak),
      pelajaranOtomatis: true,
      dipelajariAt: new Date().toISOString(),
    })
  }

  pustaka.push(...baru)

  // maju kursor kursi ini; kursi berputar merata TIAP denyut; kursi kering
  // direset ke 0 (dedup kunci melindungi dari dobel bila dipanen ulang)
  const kursiBaru = (kursi + 1) % KURSI.length
  mulaiKursi[k.topik] = (baru.length === 0 || hasil.length === 0) ? 0 : mulai + 15

  const tubuh = JSON.stringify(pustaka, null, 1)
  const hash = createHash('sha256').update(tubuh).digest('hex')
  const perTopik = {}
  for (const j of pustaka) perTopik[j.topik] = (perTopik[j.topik] || 0) + 1
  const indeksBaru = {
    protokol: 'PUSTAKA-SEJATI',
    diperbarui: new Date().toISOString(),
    gerbang509: { target: TARGET, tercapai: pustaka.length, sisa: Math.max(0, TARGET - pustaka.length) },
    perTopik,
    kursi: kursiBaru,
    mulaiKursi,
    denyutIni: { topik: k.topik, ditemukan: baru.length, gagalAmbil: gagal },
    terbaru: baru.slice(0, 10).map(j => ({ judul: j.judul, tahun: j.tahun, topik: j.topik, pelajaran: j.pelajaran, url: j.arxivUrl })),
    segel: { hash: hash.slice(0, 16), size: Buffer.byteLength(tubuh), readAt: new Date().toISOString() },
  }
  writeFileSync(FILE_PUSTAKA, tubuh)
  writeFileSync(FILE_INDEKS, JSON.stringify(indeksBaru, null, 1))
  console.log(`pustaka: +${baru.length} jurnal (${k.topik}, start ${mulai}) — total jujur ${pustaka.length}/${TARGET}` + (gagal ? ` — gagal ambil: ${gagal}` : ''))
}

main().catch(e => { console.error('pustaka gagal:', e.message); process.exit(1) })
