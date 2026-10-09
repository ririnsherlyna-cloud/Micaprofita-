// ============================================================
// TERABAIT-INTI — matematika inti dunia 1TB (V317)
// ------------------------------------------------------------
// Dunia (tambang-terabait) dan pengetahuan format makhluk
// (cerna-terabait, lalu ia buktikan sendiri lewat akal-hipotesis)
// sepakat pada rumus yang sama. Genom dibangun dari data nyata
// Binance; tiap byte dunia adalah fungsi deterministik dari
// (kunci amplop, urutan rekursi) — sehingga intisari beberapa KB
// cukup untuk mereduplikasi 1TB byte-exact.
// ------------------------------------------------------------
// Anatomi satu token (1 MiB = 1.048.576 byte):
//   [header 128B | payload 1.048.448B]
//   header  : teks self-describing (TERA1|idx=|koin=|openTime=|seq=|kunci=)
//   payload : AES-256-CTR(kunci, IV nol) atas buffer nol — amplop
//             kunci diturunkan dari lilin 1h nyata koin tersebut.
// Total dunia: 2^20 token x 2^20 byte = 2^40 byte = 1.099.511.627.776 B.
// Urutan residu kamus: rekursi linier mod-K
//   t[i] = (a*t[i-1] + b*t[i-p] + c) mod K  — akal makhluk harus
//   MENEMUKAN parameter ini dari aliran, bukan diberi tahu.
// ============================================================
import crypto from 'node:crypto'

export const UKURAN_TOKEN = 1048576          // 2^20
export const UKURAN_HEADER = 128
export const UKURAN_PAYLOAD = UKURAN_TOKEN - UKURAN_HEADER // 1048448
export const TOKEN_PENUH = 1048576           // 2^20 token
export const TOTAL_BYTE = 1099511627776      // 2^40 byte = 1 TiB

export function sha256(...bufs) {
  const h = crypto.createHash('sha256')
  for (const b of bufs) h.update(b)
  return h.digest()
}

export function hash16(buf) {
  return sha256(buf).toString('hex').slice(0, 16)
}

// Rekursi urutan residu: t[i] utk i<p = awal[i]; else formula.
// Mengembalikan Uint8Array panjang `jumlah` mulai posisi `dariToken`.
export function hitungUrutan(resep, dariToken = 0, jumlah = TOKEN_PENUH) {
  const { K, p, a, b, c, awal } = resep
  const t = new Uint8Array(dariToken + jumlah)
  for (let i = 0; i < p && i < t.length; i++) t[i] = awal[i] % K
  for (let i = p; i < t.length; i++) t[i] = (a * t[i - 1] + b * t[i - p] + c) % K
  return t.subarray(dariToken)
}

// Pilih parameter rekursi deterministik dari bytes asal data nyata:
// kandidat diuji liputannya pada 8.192 token pertama — harus
// menghadirkan >= 6 residu agar kamus tidak kerdil.
export function pilihResep(awalBytes, K = 8, p = 5) {
  const awal = Array.from(awalBytes.subarray(0, p)).map((v) => v % K)
  const kandidat = [
    [3, 5, 1], [3, 1, 7], [5, 3, 2], [7, 5, 3],
    [3, 7, 5], [1, 3, 2], [5, 1, 4], [7, 3, 6],
  ]
  let terpilih = null
  for (const [a, b, c] of kandidat) {
    const t = hitungUrutan({ K, p, a, b, c, awal }, 0, 8192)
    if (new Set(t).size >= Math.min(6, K)) { terpilih = [a, b, c]; break }
  }
  const [a, b, c] = terpilih ?? [3, 5, 1]
  return { K, p, a, b, c, awal }
}

const IV_NOL = Buffer.alloc(16)

// Amplop: AES-256-CTR atas buffer nol = keystream deterministik.
export function materialkanPayload(kunciBuf, panjang = UKURAN_PAYLOAD) {
  const c = crypto.createCipheriv('aes-256-ctr', kunciBuf, IV_NOL)
  return Buffer.concat([c.update(Buffer.alloc(panjang)), c.final()])
}

// Bingkai header 128 byte: teks self-describing, diisi spasi, diakhiri \n.
export function bangunHeader({ idx, koin, openTime, seq, kunciB64 }) {
  const s = `TERA1|idx=${idx}|koin=${koin}|openTime=${openTime}|seq=${seq}|kunci=${kunciB64}`
  const b = Buffer.from(s, 'utf8')
  if (b.length > UKURAN_HEADER - 1) throw new Error('header meluap: ' + b.length)
  const out = Buffer.alloc(UKURAN_HEADER, 0x20)
  b.copy(out, 0)
  out[UKURAN_HEADER - 1] = 0x0a
  return out
}

export function uraiHeader(buf) {
  const s = buf.toString('utf8', 0, UKURAN_HEADER)
  if (!s.startsWith('TERA1|')) return null
  const bag = {}
  for (const pot of s.split('|')) {
    const j = pot.indexOf('=')
    if (j > 0) bag[pot.slice(0, j)] = pot.slice(j + 1).trim()
  }
  if (bag.idx === undefined || !bag.koin || !bag.kunci || bag.openTime === undefined || bag.seq === undefined) return null
  return {
    idx: Number(bag.idx),
    koin: bag.koin,
    openTime: Number(bag.openTime),
    seq: Number(bag.seq),
    kunciB64: bag.kunci,
  }
}

// Verifikasi bingkai satu token: header sahih + payload = amplop kunci.
// Dipakai hakim dan regenerasi; byte token = header|payload persis.
export function materialkanToken(resepKamus, residu, idx, seq) {
  const k = resepKamus[residu]
  const header = bangunHeader({ idx, koin: k.koin, openTime: k.openTime, seq, kunciB64: k.kunciB64 })
  return Buffer.concat([header, materialkanPayload(Buffer.from(k.kunciB64, 'base64'))])
}
