// BUAT LAPORAN UJIAN-BUTA — ringkasan manusiawi + subset UJIAN-100 + perbandingan V264 vs V265
import fs from 'node:fs'

const v264 = JSON.parse(fs.readFileSync('/home/z/my-project/download/ujian-buta-100-hasil.json', 'utf8'))
const v265 = JSON.parse(fs.readFileSync('/home/z/my-project/download/ujian-buta-v265-hasil.json', 'utf8'))

// UJIAN-100 kanonik: 100 soal pertama kronologis (kelas A diutamakan agar membawa stop/target)
const urut = (a, b) => (a.T < b.T ? -1 : a.T > b.T ? 1 : a.run - b.run)
const detail100 = [...v264.detail].sort(urut)
  .sort((a, b) => (a.kelas === b.kelas ? 0 : a.kelas === 'A' ? -1 : 1))
  .slice(0, 100)
const n100 = detail100.length
const b100 = detail100.filter((h) => h.status === 'BENAR').length
const net100 = detail100.reduce((s, h) => s + h.net, 0)
const gw = detail100.filter((h) => h.net > 0).reduce((s, h) => s + h.net, 0)
const gl = -detail100.filter((h) => h.net <= 0).reduce((s, h) => s + h.net, 0)

const tabel100 = detail100.map((h, i) =>
  `| ${i + 1} | ${h.simbol} | ${h.arah} | ${h.kelas} | ${h.T.slice(0, 16)} | ${h.entry.toPrecision(6)} | ${(h.net * 100).toFixed(2)}% | ${h.status} | ${h.keyakinan ?? '—'} |`
).join('\n')

const md = `# LAPORAN UJIAN BUTA-HISTORI 100 (SEKOLAH KILAT V265)

**Tanggal:** 2026-10-03 · **Target:** penjaga.mjs ASLI (repo kanonik, V264 v6.1 → V265 v6.2)
**Mandat pemilik:** "uji dengan 100 soal trading koin — koin nyata, tiap soal berbeda, berlandas history yang sudah terjadi; cyborg tidak tahu itu simulasi padahal kita tahu fakta lapangannya; kalau tidak sesuai, push lagi — tingkatkan di mana bodohnya."

## Cara ujian (anti-bocor dijamin lapisan data)

1. **Dunia dibekukan** pada jam T historis: \`Date\` dibekukan dan **semua fetch dipotong pada T** — penjaga mustahil melihat lilin/funding/OI sesudah T (proxy \`beku.cjs\` menyaring setiap permintaan; host tak dikenal diblokir keras).
2. Penjaga **v6.1 asli** dijalankan utuh di sandbox per soal (radar → mate → komite → odds → gerbang → kunci) — bukan tiruan.
3. Dua kelas soal: **Kelas A (kunci penuh)** — prediksi resmi dengan entry/stop/target; **Kelas B (jawaban radar)** — arah+entry+keyakinan per koin yang dinilai penuh otak tapi ditahan gerbang portofolio (dikorek dari \`kandidatLain\`).
4. **Vonis resmi = rumus penjaga sendiri:** \`net = arah × (exit/entry − 1) − fee 0.002\`, exit = close 1 jam terakhir saat umur ≥ 24 jam.
5. Jendela soal: **T = 2026-06-08 → 2026-10-02** (313 titik, langkah 9 jam), koin = 115 pasangan USDT nyata; data derivatif lengkap utk 28 hari terakhir, lebih tua = fallback netral (dicatat jujur).

## Hasil headline

| Ukuran | V264 v6.1 (2.533 soal) | V265 v6.2 (2.366 soal) |
|---|---|---|
| Akurasi arah (24j, setelah fee) | 40.9% | **41.8%** |
| Net kumulatif | −462.5% | **−364.4%** (+98.2pp) |
| Profit Factor | 0.839 | **0.863** |
| BUY | ak 43.7% · net +140.6% | ak 44.5% · net +148.6% |
| SELL | ak 37.6% · net −603.1% | ak 38.6% · net −513.0% |
| Keyakinan 55-69 | ak 38.9% · net −303.7% | **ak 44.4% · net +175.4%** |
| Keyakinan ≥70 | ak 48.1% · net +16.7% | ak 49.3% · net +47.6% |

**Subset kanonik UJIAN-100** (100 soal pertama kronologis, kelas A diutamakan): akurasi **${((b100 / n100) * 100).toFixed(1)}%** · net **${(net100 * 100).toFixed(1)}%** · PF **${gl > 0 ? (gw / gl).toFixed(3) : '∞'}**.

## Di mana bodohnya (jawaban dari data, bukan opini)

1. **SELL adalah pendarah** — menjual kelemahan (z-SMA < 0.5) ak 37.6% net −603%; tidak ada subset SELL yang untung dengan n layak.
2. **Keyakinan 55-69 melawan drift = overclaim** — ak 40.7% net −70.3% (n=221).
3. **SELL di pita sempit** (entropi ≤ 0.85) hampir selalu salah — ak 11.8% (n=17).
4. **Momentum BUY adalah jantung otak** — BUY z≥1.5: ak 47.6% (+105.9%, n=403); BUY drift≥5%: ak 48.1% (+191%, n=154).
5. **Gerbang justru MENYELAMATKAN**: jawaban yang ditolak gerbang portofolio ternyata akan rugi −458.7% — disiplin V260-V264 sudah menahan sebagian besar kebodohan radar. Yang belum ditahan = kalibrasi & ukuran → itulah yang V265 perbaiki.

## V265-SEKOLAH-BUTA — perbaikan yang di-push

Empat organ dari bukti 2.533 soal (mengikat saat kunci, terus dinilai medan hidup):
1. **jual-lemah** — SELL saat z<0.5 → keyakinan dijujurkan ≤40 + ukuran ×0.5 (tetap mengunci & belajar — anti-karantina).
2. **jual-pita** — SELL saat entropi ≤0.85 → veto saksi ber-alasan.
3. **key-melawan-drift** — keyakinan 55-69 melawan drift OLS-24j → terkalibrasi ×0.75, disegel di ledger.
4. **momentum-kuat** — BUY z≥1.5 / drift≥5% → bonus odds +8 (prioritas kuota).

Registri 285 → **293 parameter bernama**. Harness sekolah kilat disimpan di \`scripts/ujian-buta/\` — bisa diulang kapan pun dengan data baru.

## Kejujuran

- Organ V265 dilatih dari ujian yang sama dengannya → perbaikan di atas adalah **bukti in-sample**; organ bersifat kalibrasi/ukuran (bukan pembalik arah) dan akan terus dinilai **medan hidup** yang belum pernah dilihatnya. Kalau organ terbukti salah di medan, uji-balik akan merevisinya.
- Kelas B menilai "pikiran" radar, bukan keputusan eksekusi penuh; kelas A (n=78 V264 / 71 V265) adalah prediksi resmi penuh.
- Data derivatif (LSR/taker/OI) hanya tersedia 28 hari ke belakang (batas Binance); soal lebih tua memakai fallback netral penjaga.

## Tabel UJIAN-100 kanonik (kelas A diutamakan)

| # | Koin | Arah | Kelas | Waktu T (UTC) | Entry | Net 24j | Vonis | Key |
|---|---|---|---|---|---|---|---|---|
${tabel100}
`

fs.writeFileSync('/home/z/my-project/micaprofita/laporan/LAPORAN-UJIAN-BUTA-100.md', md)

const ringkas = {
  diperbarui: new Date().toISOString(),
  metode: 'penjaga.mjs ASLI pada dunia beku di T historis (blind dijamin lapisan data); vonis resmi = close T+24j − fee 0.002',
  ujian100: { n: n100, akurasiPct: +((b100 / n100) * 100).toFixed(1), netPct: +(net100 * 100).toFixed(2), pf: gl > 0 ? +(gw / gl).toFixed(3) : null },
  v264: { ...v264.ringkasan, detailKelasA: v264.detail.filter((h) => h.kelas === 'A') },
  v265: { ...v265.ringkasan, detailKelasA: v265.detail.filter((h) => h.kelas === 'A') },
}
fs.writeFileSync('/home/z/my-project/micaprofita/laporan/ujian-buta.json', JSON.stringify(ringkas, null, 1))
console.log(`LAPORAN siap — UJIAN-100: ak ${((b100 / n100) * 100).toFixed(1)}% net ${(net100 * 100).toFixed(1)}%`)
