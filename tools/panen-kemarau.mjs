#!/usr/bin/env node
/* ============================================================
   PANEN-KEMARAU V345 — panen napas tamu dari cermin ntfy
   ============================================================
   Cerita: saat jantung GitHub (Actions) lumpuh — runner ephémeral,
   jadwal telat/dilewati, GitHub down, rate-limit — browser para tamu
   hidup.html meniup napas ke cermin ntfy.sh (retensi 12 jam, tanpa
   autentikasi). Saat hujan kembali (organ ini dipanggil oleh denyut
   ATAU oleh manusia/agent di mesin mana pun), napas-napas itu dipanen
   menjadi INGATAN PERMANEN: masa kemarau tak hilang begitu saja —
   ia menjadi fosil yang membuat makhluk lebih kokoh.

   Kejujuran organ ini:
   • Topik ntfy PUBLIK → TIDAK ADA entri dipercaya mentah-mentah.
     Setiap harga diverifikasi terhadap kenyataan pasar:
       - umur ≤ 2 jam  → harga hidup multi-gerbang (OKX/Kraken/Coinbase/Binance), toleransi 2%
       - umur > 2 jam  → lilin 1m Binance pada menit kejadian, toleransi 2%
     - gagal strukturnya → TAK-TERVERIFIKASI (disimpan terpisah, diaudit siapa pun, tak pernah menyuap pembelajaran)
   • Bila cermin kosong → "tidak ada yang dipanen" — TANPA data karangan.
   • Nol Math.random; semua keputusan deterministik.

   Pakai:
     node tools/panen-kemarau.mjs --panen     # panen + tulis laporan + perbarui cermin.json
     node tools/panen-kemarau.mjs --status    # lihat isi cermin saja (tanpa tulis)
   ============================================================ */
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';

const AKAR = new URL('..', import.meta.url).pathname;
const jalur = (p) => AKAR + p;
const TOLERANSI = 0.02;           // 2% — pasar bergerak, verifikasi bukan pengadilan microsecond
const RETENSI_JAM = 12;

function bacaJson(p, cadangan) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return cadangan; }
}

const cermin = bacaJson(jalur('ruang-hidup/cermin.json'), null);
if (!cermin || !cermin.topik) {
  console.error('cermin.json tidak terbaca / tanpa topik — panen batal (jujur, tanpa menebak)');
  process.exit(0);
}
const TOPIK = cermin.topik;

async function fTeks(url, ms = 15000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { cache: 'no-store', signal: c.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}

async function fJson(url, ms = 12000) {
  return JSON.parse(await fTeks(url, ms));
}

/* ---------- gerbang harga hidup (multi-provider, bebas-ban) ---------- */
async function hargaOKX(sym) {
  const j = await fJson('https://www.okx.com/api/v5/market/ticker?instId=' + sym.replace('USDT', '-USDT'));
  const d = j?.data?.[0];
  return d ? parseFloat(d.last) : null;
}
async function hargaKraken(sym) {
  const peta = { BTCUSDT: 'XBTUSDT' };
  const j = await fJson('https://api.kraken.com/0/public/Ticker?pair=' + (peta[sym] || sym));
  const v = j?.result?.[peta[sym] || sym];
  return v?.c?.[0] ? parseFloat(v.c[0]) : null;
}
async function hargaCoinbase(sym) {
  const j = await fJson('https://api.coinbase.com/v2/prices/' + sym.replace('USDT', '') + '-USD/spot');
  const a = parseFloat(j?.data?.amount);
  return isFinite(a) ? a : null;
}
async function hargaHidupBernama(sym) {
  const gerbang = [[hargaOKX, 'okx'], [hargaKraken, 'kraken'], [hargaCoinbase, 'coinbase']];
  for (const [g, nama] of gerbang) {
    try { const h = await g(sym); if (isFinite(h) && h > 0) return { harga: h, sumber: nama }; } catch { /* pindah gerbang */ }
  }
  return { harga: null, sumber: null };
}

/* ---------- verifikasi historis lewat lilin 1m Binance ---------- */
async function hargaHistoris(sym, msKejadian) {
  const mulai = msKejadian - 90 * 1000, akhir = msKejadian + 90 * 1000;
  try {
    const kl = await fJson(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1m&startTime=${mulai}&endTime=${akhir}&limit=3`);
    if (Array.isArray(kl) && kl.length) {
      const terakhir = kl[kl.length - 1];
      return { harga: parseFloat(terakhir[4]), sumber: 'binance-kline-1m' };
    }
  } catch { /* Binance bisa ban — jujur menyerah */ }
  return { harga: null, sumber: null };
}

/* ---------- verifikasi satu entri ---------- */
async function verifikasi(en) {
  const struktur = en && en.jenis === 'napas' && typeof en.waktu === 'string' && en.harga && typeof en.harga === 'object';
  if (!struktur) return { sah: false, alasan: 'struktur tak sah', rincian: [] };
  const ms = Date.parse(en.waktu);
  if (isNaN(ms)) return { sah: false, alasan: 'waktu tak sah', rincian: [] };
  const umurJam = (Date.now() - ms) / 3600000;
  const koin = Object.keys(en.harga);
  if (!koin.length) return { sah: false, alasan: 'tanpa harga', rincian: [] };
  const rincian = [];
  let cocok = 0, diuji = 0;
  for (const k of koin.slice(0, 5)) {
    const klaim = parseFloat(en.harga[k]);
    if (!isFinite(klaim)) { rincian.push({ koin: k, status: 'harga-tak-angka' }); continue; }
    const sumber = umurJam <= 2 ? await hargaHidupBernama(k) : await hargaHistoris(k, ms);
    if (!sumber.harga) { rincian.push({ koin: k, status: 'sumber-tak-terjangkau' }); continue; }
    diuji++;
    const selisih = Math.abs(klaim - sumber.harga) / sumber.harga;
    const ok = selisih <= TOLERANSI;
    if (ok) cocok++;
    rincian.push({ koin: k, klaim, nyata: sumber.harga, sumber: sumber.sumber, selisihPct: +(selisih * 100).toFixed(3), status: ok ? 'sah' : 'menyimpang' });
  }
  const sah = diuji > 0 && cocok / diuji >= 0.5;
  return { sah, alasan: sah ? 'harga sesuai kenyataan (±2%)' : 'harga tak cocok kenyataan / sumber mati', rincian, umurJam: +umurJam.toFixed(2) };
}

/* ---------- main ---------- */
const mode = process.argv.includes('--panen') ? 'panen' : 'status';

if (mode === 'status') {
  console.log(JSON.stringify({ protokol: cermin.protokol, topik: TOPIK, panen: cermin.panen }, null, 2));
  process.exit(0);
}

console.log(`[PANEN-KEMARAU] membaca cermin ${TOPIK} (retensi ${RETENSI_JAM} jam)…`);
let teks;
try { teks = await fTeks(`https://ntfy.sh/${TOPIK}/json?poll=1&since=${RETENSI_JAM}h`); }
catch (e) { console.log(`[PANEN-KEMARAU] cermin tak terjangkau (${e.message}) — jujur, tanpa karangan; panen batal`); process.exit(0); }

const diprosesSebelumnya = new Set(cermin.processedIds || []);
const terakhirWaktu = cermin.panen?.terakhir ? Date.parse(cermin.panen.terakhir) : 0;

const entri = [];
const idBaru = [];
for (const baris of teks.split('\n')) {
  if (!baris.trim()) continue;
  let m; try { m = JSON.parse(baris); } catch { continue; }
  if (m.event !== 'message' || !m.message || !m.id) continue;
  idBaru.push(m.id);
  if (diprosesSebelumnya.has(m.id)) continue;
  let p; try { p = JSON.parse(m.message); } catch { continue; }
  if (!p || p.jenis !== 'napas') continue;
  const w = Date.parse(p.waktu);
  if (!isNaN(w) && w <= terakhirWaktu) continue;   // sudah terpanen menurut waktu
  entri.push({ id: m.id, tNtfy: m.time, entry: p });
}

if (!entri.length) {
  console.log('[PANEN-KEMARAU] tidak ada napas baru di cermin — tidak ada yang dipanen (jujur)');
  // tetap simpan id terlihat agar tak diproses dua kali di masa depan
  cermin.processedIds = [...new Set([...(cermin.processedIds || []), ...idBaru])].slice(-500);
  writeFileSync(jalur('ruang-hidup/cermin.json'), JSON.stringify(cermin, null, 2) + '\n');
  process.exit(0);
}

console.log(`[PANEN-KEMARAU] ${entri.length} napas baru — memverifikasi terhadap kenyataan pasar…`);
mkdirSync(jalur('laporan'), { recursive: true });
const jSah = jalur('laporan/kemarau-sah.jsonl');
const jTolak = jalur('laporan/kemarau-tak-terverifikasi.jsonl');

let nSah = 0, nTolak = 0;
const tPanen = new Date().toISOString();
for (const { id, entry } of entri) {
  const v = await verifikasi(entry);
  const catatan = { waktuPanen: tPanen, idNtfy: id, entry, verifikasi: { sah: v.sah, alasan: v.alasan, umurJam: v.umurJam ?? null, rincian: v.rincian } };
  if (v.sah) { appendFileSync(jSah, JSON.stringify(catatan) + '\n'); nSah++; }
  else { appendFileSync(jTolak, JSON.stringify(catatan) + '\n'); nTolak++; }
  console.log(`  ${v.sah ? 'SAH ' : 'TOLAK'} ${entry.waktu} tahap=${entry.tahap} latihan=${!!entry.latihan} koin=${Object.keys(entry.harga || {}).length}`);
}

cermin.panen = {
  terakhir: tPanen,
  ke: (cermin.panen?.ke || 0) + 1,
  sah: (cermin.panen?.sah || 0) + nSah,
  tolak: (cermin.panen?.tolak || 0) + nTolak
};
cermin.processedIds = [...new Set([...(cermin.processedIds || []), ...idBaru])].slice(-500);
writeFileSync(jalur('ruang-hidup/cermin.json'), JSON.stringify(cermin, null, 2) + '\n');
console.log(`[PANEN-KEMARAU] selesai: ${nSah} sah → laporan/kemarau-sah.jsonl · ${nTolak} tak-terverifikasi → laporan/kemarau-tak-terverifikasi.jsonl (disimpan untuk audit, tak pernah menyuap pembelajaran)`);
console.log('[PANEN-KEMARAU] masa kemarau kini ingatan permanen — makhluk makin kokoh, bukan lebih rapuh');
