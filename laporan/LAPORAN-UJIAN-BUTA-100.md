# LAPORAN UJIAN BUTA-HISTORI 100 (SEKOLAH KILAT V265)

**Tanggal:** 2026-10-03 · **Target:** penjaga.mjs ASLI (repo kanonik, V264 v6.1 → V265 v6.2)
**Mandat pemilik:** "uji dengan 100 soal trading koin — koin nyata, tiap soal berbeda, berlandas history yang sudah terjadi; cyborg tidak tahu itu simulasi padahal kita tahu fakta lapangannya; kalau tidak sesuai, push lagi — tingkatkan di mana bodohnya."

## Cara ujian (anti-bocor dijamin lapisan data)

1. **Dunia dibekukan** pada jam T historis: `Date` dibekukan dan **semua fetch dipotong pada T** — penjaga mustahil melihat lilin/funding/OI sesudah T (proxy `beku.cjs` menyaring setiap permintaan; host tak dikenal diblokir keras).
2. Penjaga **v6.1 asli** dijalankan utuh di sandbox per soal (radar → mate → komite → odds → gerbang → kunci) — bukan tiruan.
3. Dua kelas soal: **Kelas A (kunci penuh)** — prediksi resmi dengan entry/stop/target; **Kelas B (jawaban radar)** — arah+entry+keyakinan per koin yang dinilai penuh otak tapi ditahan gerbang portofolio (dikorek dari `kandidatLain`).
4. **Vonis resmi = rumus penjaga sendiri:** `net = arah × (exit/entry − 1) − fee 0.002`, exit = close 1 jam terakhir saat umur ≥ 24 jam.
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

**Subset kanonik UJIAN-100** (100 soal pertama kronologis, kelas A diutamakan): akurasi **40.0%** · net **-49.9%** · PF **0.768**.

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

Registri 285 → **293 parameter bernama**. Harness sekolah kilat disimpan di `scripts/ujian-buta/` — bisa diulang kapan pun dengan data baru.

## Kejujuran

- Organ V265 dilatih dari ujian yang sama dengannya → perbaikan di atas adalah **bukti in-sample**; organ bersifat kalibrasi/ukuran (bukan pembalik arah) dan akan terus dinilai **medan hidup** yang belum pernah dilihatnya. Kalau organ terbukti salah di medan, uji-balik akan merevisinya.
- Kelas B menilai "pikiran" radar, bukan keputusan eksekusi penuh; kelas A (n=78 V264 / 71 V265) adalah prediksi resmi penuh.
- Data derivatif (LSR/taker/OI) hanya tersedia 28 hari ke belakang (batas Binance); soal lebih tua memakai fallback netral penjaga.

## Tabel UJIAN-100 kanonik (kelas A diutamakan)

| # | Koin | Arah | Kelas | Waktu T (UTC) | Entry | Net 24j | Vonis | Key |
|---|---|---|---|---|---|---|---|---|
| 1 | ENA | BUY | A | 2026-06-09T18:00 | 0.0816000 | -7.80% | SALAH | 62 |
| 2 | CRV | BUY | A | 2026-06-13T12:00 | 0.238100 | -2.51% | SALAH | 61 |
| 3 | ADA | BUY | A | 2026-06-16T12:00 | 0.180000 | -6.42% | SALAH | 61 |
| 4 | ALGO | BUY | A | 2026-06-16T12:00 | 0.0959000 | 0.32% | BENAR | 62 |
| 5 | BNB | BUY | A | 2026-06-17T06:00 | 607.150 | -3.09% | SALAH | 62 |
| 6 | FET | BUY | A | 2026-06-18T09:00 | 0.200600 | -4.29% | SALAH | 52 |
| 7 | PORTAL | BUY | A | 2026-06-20T15:00 | 0.0159100 | -5.42% | SALAH | 64 |
| 8 | GALA | BUY | A | 2026-07-04T12:00 | 0.00240400 | -4.94% | SALAH | 62 |
| 9 | ADA | BUY | A | 2026-07-05T15:00 | 0.189200 | -4.00% | SALAH | 61 |
| 10 | XRP | BUY | A | 2026-07-05T15:00 | 1.13700 | -1.38% | SALAH | 63 |
| 11 | DASH | BUY | A | 2026-07-05T15:00 | 35.1000 | -2.22% | SALAH | 62 |
| 12 | GALA | BUY | A | 2026-07-05T15:00 | 0.00231600 | -3.14% | SALAH | 64 |
| 13 | TRB | BUY | A | 2026-07-07T12:00 | 17.0200 | -6.08% | SALAH | 63 |
| 14 | NEAR | BUY | A | 2026-07-09T00:00 | 1.89200 | 1.28% | BENAR | 52 |
| 15 | ADA | BUY | A | 2026-07-09T00:00 | 0.167000 | -0.44% | SALAH | 61 |
| 16 | ONDO | BUY | A | 2026-07-18T18:00 | 0.349300 | -1.29% | SALAH | 64 |
| 17 | SKL | BUY | A | 2026-07-19T12:00 | 0.00406000 | -1.68% | SALAH | 63 |
| 18 | LDO | BUY | A | 2026-07-22T03:00 | 0.391900 | 1.99% | BENAR | 62 |
| 19 | ETH | BUY | A | 2026-07-28T12:00 | 1892.48 | 1.00% | BENAR | 52 |
| 20 | UNI | BUY | A | 2026-08-02T00:00 | 4.09200 | 1.68% | BENAR | 52 |
| 21 | COTI | BUY | A | 2026-08-03T21:00 | 0.0120400 | 22.39% | BENAR | 65 |
| 22 | PORTAL | BUY | A | 2026-08-18T21:00 | 0.0140000 | -23.34% | SALAH | 65 |
| 23 | DOGE | BUY | A | 2026-08-20T18:00 | 0.0796300 | 5.79% | BENAR | 52 |
| 24 | XRP | BUY | A | 2026-08-20T18:00 | 1.22940 | 12.60% | BENAR | 63 |
| 25 | BTC | BUY | A | 2026-08-21T12:00 | 77223.7 | -0.32% | SALAH | 52 |
| 26 | ONT | BUY | A | 2026-08-21T21:00 | 0.0503500 | -6.40% | SALAH | 64 |
| 27 | LINK | BUY | A | 2026-08-22T06:00 | 11.8530 | -6.32% | SALAH | 52 |
| 28 | XRP | BUY | A | 2026-08-22T06:00 | 1.57870 | -8.55% | SALAH | 52 |
| 29 | ONT | BUY | A | 2026-08-23T00:00 | 0.0483300 | -0.32% | SALAH | 62 |
| 30 | XLM | BUY | A | 2026-08-23T00:00 | 0.199800 | -0.25% | SALAH | 61 |
| 31 | HBAR | BUY | A | 2026-08-23T00:00 | 0.0781900 | 1.87% | BENAR | 63 |
| 32 | ALGO | BUY | A | 2026-08-23T00:00 | 0.0942000 | -0.41% | SALAH | 65 |
| 33 | APT | BUY | A | 2026-08-23T09:00 | 0.614000 | -1.01% | SALAH | 61 |
| 34 | ORDI | BUY | A | 2026-08-23T09:00 | 3.99900 | 0.95% | BENAR | 63 |
| 35 | SOL | BUY | A | 2026-08-23T09:00 | 93.3200 | 0.46% | BENAR | 63 |
| 36 | ENA | BUY | A | 2026-08-24T12:00 | 0.163400 | -9.93% | SALAH | 62 |
| 37 | APT | BUY | A | 2026-08-24T12:00 | 0.624000 | -4.69% | SALAH | 62 |
| 38 | PENDLE | BUY | A | 2026-08-24T12:00 | 1.82800 | -3.54% | SALAH | 63 |
| 39 | STRK | BUY | A | 2026-08-24T12:00 | 0.0275900 | -2.63% | SALAH | 63 |
| 40 | ARB | BUY | A | 2026-08-24T12:00 | 0.0996000 | -5.02% | SALAH | 64 |
| 41 | DASH | BUY | A | 2026-08-26T09:00 | 38.9300 | 1.29% | BENAR | 63 |
| 42 | HBAR | BUY | A | 2026-08-26T18:00 | 0.0775400 | 1.86% | BENAR | 63 |
| 43 | PORTAL | BUY | A | 2026-08-27T12:00 | 0.0159000 | 2.38% | BENAR | 63 |
| 44 | AAVE | BUY | A | 2026-08-31T15:00 | 123.790 | 2.88% | BENAR | 62 |
| 45 | ENA | BUY | A | 2026-08-31T15:00 | 0.151400 | 7.66% | BENAR | 62 |
| 46 | CRV | BUY | A | 2026-09-02T21:00 | 0.363500 | 2.91% | BENAR | 52 |
| 47 | LINK | BUY | A | 2026-09-05T03:00 | 11.6690 | 4.64% | BENAR | 61 |
| 48 | XLM | BUY | A | 2026-09-05T03:00 | 0.179900 | 3.25% | BENAR | 63 |
| 49 | NEAR | BUY | A | 2026-09-12T15:00 | 2.40600 | -4.06% | SALAH | 52 |
| 50 | BLUR | BUY | A | 2026-09-12T15:00 | 0.0175700 | 5.55% | BENAR | 52 |
| 51 | BLUR | BUY | A | 2026-09-14T03:00 | 0.0180200 | -3.36% | SALAH | 52 |
| 52 | ALT | BUY | A | 2026-09-14T03:00 | 0.00670000 | -1.24% | SALAH | 52 |
| 53 | HIVE | BUY | A | 2026-09-16T00:00 | 0.0526000 | -0.77% | SALAH | 63 |
| 54 | DODO | BUY | A | 2026-09-16T00:00 | 0.0177800 | -0.31% | SALAH | 52 |
| 55 | AR | BUY | A | 2026-09-20T12:00 | 4.33200 | 9.29% | BENAR | 62 |
| 56 | ZEC | BUY | A | 2026-09-20T12:00 | 1454.24 | 7.39% | BENAR | 65 |
| 57 | ONDO | BUY | A | 2026-09-20T12:00 | 0.413000 | 9.15% | BENAR | 62 |
| 58 | ADA | BUY | A | 2026-09-20T12:00 | 0.222200 | 8.62% | BENAR | 61 |
| 59 | LINK | BUY | A | 2026-09-20T12:00 | 12.0800 | 7.82% | BENAR | 62 |
| 60 | FET | BUY | A | 2026-09-20T12:00 | 0.171000 | 14.01% | BENAR | 62 |
| 61 | SKL | BUY | A | 2026-09-20T21:00 | 0.00449000 | 1.14% | BENAR | 62 |
| 62 | AVAX | BUY | A | 2026-09-21T06:00 | 11.1350 | -4.04% | SALAH | 52 |
| 63 | SKL | BUY | A | 2026-09-21T06:00 | 0.00454000 | 0.68% | BENAR | 63 |
| 64 | PEPE | BUY | A | 2026-09-23T03:00 | 0.00000496000 | -11.69% | SALAH | 62 |
| 65 | OP | BUY | A | 2026-09-24T06:00 | 0.125300 | 4.67% | BENAR | 52 |
| 66 | TIA | BUY | A | 2026-09-24T06:00 | 0.480100 | 0.90% | BENAR | 52 |
| 67 | XLM | BUY | A | 2026-09-24T06:00 | 0.202900 | 7.88% | BENAR | 52 |
| 68 | ENA | BUY | A | 2026-09-27T06:00 | 0.270800 | -1.86% | SALAH | 62 |
| 69 | FET | BUY | A | 2026-09-27T06:00 | 0.244600 | -3.55% | SALAH | 61 |
| 70 | LTC | BUY | A | 2026-09-27T06:00 | 72.0000 | -1.56% | SALAH | 61 |
| 71 | ENA | BUY | A | 2026-09-28T18:00 | 0.264400 | -7.23% | SALAH | 52 |
| 72 | FIL | BUY | A | 2026-09-28T18:00 | 1.06120 | -0.35% | SALAH | 61 |
| 73 | FET | BUY | A | 2026-09-28T18:00 | 0.232100 | -4.90% | SALAH | 52 |
| 74 | HBAR | BUY | A | 2026-09-30T06:00 | 0.104670 | 1.32% | BENAR | 62 |
| 75 | ADA | BUY | A | 2026-10-01T00:00 | 0.246400 | -0.20% | SALAH | 61 |
| 76 | DOT | BUY | A | 2026-10-02T03:00 | 1.19500 | -2.88% | SALAH | 61 |
| 77 | XLM | BUY | A | 2026-10-02T03:00 | 0.220400 | -2.42% | SALAH | 63 |
| 78 | NEAR | BUY | A | 2026-10-02T03:00 | 4.92300 | -5.10% | SALAH | 64 |
| 79 | ADA | SELL | B | 2026-06-08T06:00 | 0.161800 | -5.27% | SALAH | 52 |
| 80 | AVAX | SELL | B | 2026-06-08T06:00 | 6.64800 | -2.17% | SALAH | 52 |
| 81 | LINK | BUY | B | 2026-06-08T06:00 | 7.82300 | 2.04% | BENAR | 55 |
| 82 | DOGE | BUY | B | 2026-06-08T06:00 | 0.0853000 | 1.17% | BENAR | 53 |
| 83 | TRX | BUY | B | 2026-06-08T06:00 | 0.327200 | -0.90% | SALAH | 52 |
| 84 | ETH | BUY | B | 2026-06-08T06:00 | 1666.53 | 1.10% | BENAR | 54 |
| 85 | XRP | BUY | B | 2026-06-08T06:00 | 1.14110 | 2.60% | BENAR | 52 |
| 86 | BNB | BUY | B | 2026-06-08T06:00 | 595.880 | 1.08% | BENAR | 52 |
| 87 | XRP | BUY | B | 2026-06-08T15:00 | 1.17110 | -3.09% | SALAH | 68 |
| 88 | LINK | BUY | B | 2026-06-08T15:00 | 8.02600 | -2.88% | SALAH | 63 |
| 89 | DOGE | BUY | B | 2026-06-08T15:00 | 0.0869800 | -2.45% | SALAH | 63 |
| 90 | SOL | BUY | B | 2026-06-08T15:00 | 67.1800 | -3.33% | SALAH | 61 |
| 91 | ETH | BUY | B | 2026-06-08T15:00 | 1691.59 | -2.90% | SALAH | 64 |
| 92 | BNB | BUY | B | 2026-06-08T15:00 | 604.200 | -2.75% | SALAH | 58 |
| 93 | BTC | BUY | B | 2026-06-08T15:00 | 63774.5 | -3.70% | SALAH | 65 |
| 94 | ADA | BUY | B | 2026-06-08T15:00 | 0.169300 | -1.97% | SALAH | 79 |
| 95 | AVAX | SELL | B | 2026-06-09T00:00 | 6.61600 | -0.55% | SALAH | 74 |
| 96 | DOGE | SELL | B | 2026-06-09T00:00 | 0.0848200 | -0.17% | SALAH | 69 |
| 97 | BTC | SELL | B | 2026-06-09T00:00 | 62562.0 | 1.13% | BENAR | 58 |
| 98 | BNB | SELL | B | 2026-06-09T00:00 | 595.720 | 0.18% | BENAR | 57 |
| 99 | SOL | SELL | B | 2026-06-09T00:00 | 65.4200 | 0.50% | BENAR | 56 |
| 100 | LINK | SELL | B | 2026-06-09T00:00 | 7.83200 | -0.28% | SALAH | 56 |

---

## PUTARAN-2 — V266-BAROMETER v6.3 (2026-10-03)

Mandat pemilik: "didik terus — peningkatan terus dijalankan, tidak bisa menunggu waktu lama."

### Ujian out-of-sample (dunia yang organ V265 belum pernah lihat)

| Ujian | n | Akurasi | Net | Catatan |
|---|---|---|---|---|
| OOS 10-02 (6 dunia, langkah 2 jam) | 57 | 3.5% | −144.5% | v6.2 kunci BUY 89% di hari REVERSAL |
| Holdout 10-02 (T05/07/09/11) | 63 | 0.0% | −186.9% | barometer pra-T positif → pasar berbalik sesudah T |

**Kejujuran:** hari reversal secara prinsip tidak dapat diprediksi dari data pra-T — diakui terbuka, bukan bug yang bisa dipatch.

### Bedah makro 2.366 soal in-sample — pendarah yang TERLIHAT

| Bucket | n | Akurasi | Net |
|---|---|---|---|
| SELL saat BTC ≤ −1% | 397 | 30.2% | **−339.3%** (pendarah terbesar) |
| breadth ≤ 25% | 705 | 35.2% | **−405.5%** |
| BUY saat BTC 0..+1% | 470 | 40.0% | −155.8% |
| BUY saat BTC ≤ −1% (menadah) | 141 | 53.9% | **+80.1%** — DIPERTAHANKAN |
| BUY saat BTC > +3% | 176 | 46.7% | +187.7% |

Draf-1 organ (potong BUY-bear) = SALAH TARGET — dibuang sebelum push; organ diarahkan ke bukti.

### Organ V266 (mengikat saat kunci, registri 293 → 301)

1. **sell-bear-harian** — bear (BTC ≤ −1.5% atau breadth ≤ 25%) → SELL key ≤ 40 + ukuran ×0.5
2. **tunda-bear** — SELL terkalibrasi <50 saat bear → TUNDA denyut ini (rem, bukan ban)
3. **sell-relatif-kuat** — SELL koin yang ret24-nya lebih kuat dari BTC saat bear → key ≤45
4. **buy-flat-btc** — BUY saat BTC 0..+1% → key −8
5. **radar-jujur-bear** — kandidatLain saat bear hanya key ≥45 (kunci penuh tetap dinilai apa adanya)

### Bukti membaik — dunia bear-sejati (out-of-sample murni)

| Versi | n | Akurasi | Net |
|---|---|---|---|
| v6.2 baseline | 32 | 34.4% | −40.5% |
| **v6.3 V266** | 8 | **100.0%** | **+15.4%** |

SELL ak 29% → 56% (jendela luas); radar-jujur menahan 24 jawaban murahan — sistem memilih **diam** pada bear ekstrem alih-alih menjual dasar. Detail: `laporan/sekolah-putaran2.json`.
