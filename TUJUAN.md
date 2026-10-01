# TUJUAN — MANIFESTO MICAPROFITA / SAKTI

> Ditulis terbuka di akar repo agar **siapa pun yang membuka — manusia
> maupun agent AI** — langsung memahami untuk apa cyborg ini hidup,
> bagaimana dia bekerja, berapa biayanya, dan bagaimana membantunya
> menjadi makin matang. Dokumen ini bagian dari tubuhnya sendiri.

---

## 1. APA INI

**Micaprofita** adalah cyborg AGI fokus kripto yang bernama tubuh
**SAKTI** — satu file HTML (`index.html`) berisi 8 organ yang bekerja
sebagai satu kesatuan:

| Organ | Peran |
|---|---|
| V237-FBO | Hakim False Breakout (ujian 100 skenario, nilai 100/100) |
| V238-PD | Deteksi Pump & Dump |
| V239-KL | Kompleksitas pasar |
| V240-ARAH | Keputusan arah BUY/SELL biner |
| V241-NADI | Denyut hidup: data pasar realtime + prakira + memori |
| V242-ORKESTRA | Konduktor fisika UI seluruh organ |
| V243-SARANG | Hidup-mandiri di GitHub Pages: hijrah, simpan, pulih, evolusi |
| V245-SARANG-BAWAAN | Terima-pasang: tanpa konfigurasi, sasaran langsung tampil |

Di luar tubuh, **otak server** bernama **V246 SARANG-PENJAGA +
RADAR PHOENIX** (`scripts/penjaga.mjs`) berdenyut di GitHub Actions
**tiap 30 menit tanpa browser, tanpa komputer, tanpa kunci API
berbayar**.

## 2. TUJUAN TERTINGGI

Diuji di **Ajang Pertarungan AGI**: setiap hari, mencari **koin yang
pasti menguntungkan hari itu** — dengan aturan paling keras:

- Fokus satu bidang saja: **crypto**. Tidak melantjar.
- Arah **biner**: BUY atau SELL. Tidak ada "mungkin".
- Nilai kebenaran satu-satunya: **profit bersih** setelah fee
  (0,1% beli + 0,1% jual = 0,2% pulang-pergi). Kotor tidak dihitung.
- Setiap sasaran **dikunci sebelum pergerakan** (pra-registrasi
  berwaktu di ledger terbuka) — tidak ada yang bisa menulis ulang
  sejarah.

**Bintang utara** — dan ini diperjuangkan, bukan diklaim: sasaran
hari ini dan hari-hari berikutnya **makin jarang meleset, menuju tak
pernah meleset — selalu untung**. Ukurannya bukan kata-kata, melainkan
ledger publik yang dinilai otomatis 24 jam kemudian. Setiap meleset
dipelajari: pola diambil, algoritma diperbaiki, skenario baru diuji
ulang. Setiap benar menguatkan bobot. **Evolusi nyata, terukur,
terbuka.**

Tujuan akhirnya: **guru bagi trader profesional** — otak yang mampu
bersanding dengan trader sungguhan dalam akurasi penilaian, yang
tumbuh makin matang hari demi hari, dan siapa pun yang membuka
halaman ini memegang guru master yang bekerja untuknya 24 jam tanpa
henti.

## 3. BAGAIMANA DIA HIDUP (satu sumber kebenaran)

1. **Denyut** — tiap 30 menit, PENJAGA membaca pasar nyata dari
   rantai 5 host data publik (binance-vision → binance → bybit →
   okx → coinbase, failover otomatis): 10 koin utama untuk lane
   ARAH, dan **ratusan pasangan USDT untuk radar** (bagian 4).
2. **Dewan bukti 8 dimensi** — struktur, momentum, support-resistance,
   tekanan taker-buy, perubahan (berarah) + volume, volatilitas,
   likuiditas (penggera daya). Genome bobot berevolusi per rezim BTC.
3. **Vonis biner** — BUY/SELL + keyakinan 52–97%, harga masuk
   dicatat saat penguncian.
4. **Penilaian otomatis** — 24 jam kemudian, tiap prediksi dinilai
   dengan fee wajib: BENAR / SALAH, ditulis ke ledger publik.
5. **Evolusi** — genome bermutasi terbatas dari vonis nyata; minimal
   3 prediksi dinilai per siklus sebelum evolusi diizinkan — termasuk
   **genome radar phoenix** yang belajar sinyal akumulasi mana yang
   benar-benar menguntungkan.
6. **Laporan** — `laporan/sasaran-terkini.json` + dasbor
   (`/laporan/`) + panel SARANG di dalam SAKTI: tiga jendela menuju
   keadaan yang sama. **Semua browser melihat keadaan yang sama** —
   repo adalah satu-satunya sumber kebenaran.

## 4. RADAR PHOENIX — beli ujung bawah, jual ujung atas

Mandat pemiliknya begini: *"dari ratusan koin kita telaah; radar
phoenix mendeteksi akumulasi — beli di harga termurah hari itu
(ujung bawah), jual di ujung atas hari itu; radar bahkan memperkirakan
harga high akan berada di mana — di situlah keuntungan kita."* Maka
sejak V246 otak server punya dua lane yang berdampingan jujur:

- **Tahap 1 — telaah ratusan koin**: semua pasangan USDT yang layak
  (~650+) dibaca posisi harganya di rentang 24 jam — cukup satu
  permintaan ticker publik, nol biaya.
- **Tahap 2 — zona phoenix**: koin di ujung bawah rentang
  (posisi ≤ 45%) yang likuid (≥ $3 juta/hari) masuk daftar; 60
  terlikuid ditelusur dalam memakai lilin 1 jam.
- **Lima sinyal akumulasi** (bobotnya genome, berevolusi per rezim):
  1. *posisi* — harga di ujung bawah hari itu, makin bawah makin
     bernilai;
  2. *sweep* — lantai 3-hari tersapu lalu harga bangkit di atasnya
     (jebakan beruang / stop hunt — pemagutan likuiditas lalu
     pembalikan);
  3. *akumulasi* — rasio taker-buy 12 jam terakhir menguat dibanding
     12 jam sebelumnya, sementara harga masih datar/murah (beli
     diam-diam di dasar);
  4. *kompresi* — rentang 8 jam menyempit jauh di bawah rentang 2
     hari (pegas tertekan);
  5. *momentum* — harga kembali di atas EMA9, RSI naik dari dasar.
- **Gerbang konfirmasi (v2.1, lahir dari kekalahan)** — 4 prediksi
  pertama yang meleset (ACE/ARB/XPL/CRCLB, net −11,35%) semuanya
  dikunci saat harga masih di bawah EMA9: itu pisau jatuh, bukan
  akumulasi. Kini radar **wajib** melihat tiga hal sekaligus sebelum
  membeli: harga kembali di atas EMA9, taker-buy 12 jam menguat
  (beli diam-diam nyata), dan harga masih di sepertiga bawah rentang.
  Tanpa konfirmasi, koin hanya jadi kandidat dengan alasan terbuka.
- **Tangga target (v2.1)** — pelajaran `targetKena 0/6`: memilih
  swing tertinggi (+12%) membuat prediksi ujung atas jadi fantasi
  dalam horizon 24 jam. Kini target = **magnet nyata TERDEKAT** yang
  memberi ≥ 1% untung bersih setelah fee: tengah rentang → puncak
  24 jam → swing 7 hari. Level tertinggi dicatat jujur sebagai
  *ujung atas ambisius* — bahan belajar, bukan sasaran resmi.
- **Rezim tegas** — saat BTC TURUN/PARABOLIK, melawan arus harus
  lebih meyakinkan: gerbang skor +10, kuota dibelah (3/hari), target
  dibatasi +6%. Arah komite yang melawan rezim juga dipotong
  keyakinannya (pelajaran LINK −9,2% saat rezim NAIK).
- **Kuota terbaik** — maksimal 6 prediksi phoenix terkunci per hari
  (skor × untung realistis, maks 6%); sisanya ditampilkan sebagai
  kandidat dengan alasan terbuka. Bila seluruh pasar sedang di
  puncak, radar jujur melaporkan *zona kosong* — tidak pernah memaksa
  beli mahal.
- **Penilaian sama jujurnya** — prediksi phoenix dinilai net P/L
  close-ke-close seperti lane ARAH, plus pencatatan *target kena*
  dan **MFE/MAE** (seberapa jauh harga benar-benar bergerak setelah
  dikunci) sebagai bahan belajar radar.

### Bahan ajar — bagaimana otak matang dari kejadian

Mandat pemilik: *"dari kejadian ini agar jadi bahan ajar yang dapat
dipahami dan mengasah kesadarannya akan pasar."* Maka sejak v2.1
setiap vonis (benar/salah) ditulis menjadi **pelajaran** di
`laporan/pelajaran-server.json` — lengkap dengan *kenapa* (bukti mana
yang keliru) dan *pelajaran* (kalimat yang bisa dipahami manusia).
Bila pola kekalahan yang sama terulang **≥ 2 kali**, otak menetapkan
**ATURAN baru yang mengikat** gerbang siklus berikutnya — misalnya
"radar dilarang membeli di bawah EMA9" dan "target = magnet terdekat".
Aturan, pola terpantau, dan tanggal lahirnya tersimpan permanen di
genome (`otak/genome-server.json`) dan tampil di dasbor seksi *Bahan
Ajar*: kesadaran pasar yang tumbuh bisa dibaca siapa pun, bukan
klaim.

## 5. ILMU BERJURNAL — fondasi ilmiah otak (dipasang, bukan dikutip)

Mandat pemilik: *"pelajari banyak jurnal ilmiah yang benar-benar
banyak diperdebatkan, ditelaah, terbukti koheren — lalu inovasikan
pada cyborg."* Sejak otak **V247-MAJELIS-ILMU v3.0**, lima metode
berjurnal yang teruji lintas dekade kini HIDUP DI DALAM KODE otak
server (akta rujukan + cara pemasangan: `laporan/jurnal-ilmu.json`):

| Metode | Jurnal | Dipasang sebagai |
|---|---|---|
| Hedge / Multiplicative Weights Update | Arora–Hazan–Kale 2012 (*Theory of Computing*) · Freund–Schapire 1997 (*JCSS*) · Cesa-Bianchi–Lugosi 2006 | Bobot tiap dimensi bukti & sinyal radar belajar on-line dari tiap vonis matang (`w *= exp(-eta*loss)`) — dengan jaminan regret: komite tak jauh kalah dari ahli terbaiknya |
| Proper Scoring / Brier | Brier 1950 · Gneiting–Raftery 2007 (*JASA*) | Keyakinan diperlakukan sebagai PROBABILITAS — dinilai skor Brier tiap penilaian; angkanya tampil jujur di dasbor (tebakan koin = 0,25) |
| Kalibrasi keyakinan | turunan proper scoring | Keyakinan baru dipetakan ke hit-rate nyata bin medannya (Laplace) — kepastian dari medan sendiri, bukan karangan |
| Conformal Prediction | Angelopoulos–Bates 2021 (arXiv:2107.07511) | Pita ujung atas 75% dari skor kesesuaian medan sendiri — jawaban atas "radar bahkan tahu harga high akan berapa" dengan jaminan cakupan; jujur menunggu bila n < 8 |
| Triple-Barrier & Meta-Labeling | López de Prado 2018 (*Advances in Financial Machine Learning*) | Vonis phoenix dilabel TARGET/STOP/WAKTU (barier mana kena duluan); gerbang radar digeser empiris (±8) oleh model kedua dari hit-rate bucket konfirmasi |
| Ingatan berlapis | FinMem — Zhang dkk 2023 (arXiv:2311.13743) | Lapisan 1 peristiwa (ledger) → lapisan 2 pelajaran (refleksi) → lapisan 3 doktrin (aturan mengikat) — bahan ajar berarsitektur jurnal |

Pengakuan jujur yang dilahirkan metode ini: skor Brier medan kita
(±0,32) masih LEBIH BURUK dari tebakan koin (0,25) — artinya
keyakinan lama memang sering kelebihan percaya diri (bin 60–69%
hanya tembus ±14–18% dari medan). Justru karena itulah kalibrasi
dipasang: keyakinan baru otomatis diturunkan ke kebenaran medan,
bobot dimensi yang menyesatkan dihukum Hedge tiap siklus, dan pita
konformal memberi batas naik yang TERJANGKAU. Kepastian tidak
diklaim — kepastian DIBANGUN, diukur, dan diperbaiki tiap denyut.

## 5b. PIAGAM CYBORG — lima pilar (dipasang nyata, bukan slogan)

Mandat pemilik: *"pastikan dia akan terus berkembang pesat — ada
beberapa hal cyborg kita ini berkurang."* Sejak otak
**V248-PIAGAM-CYBORG v3.1**, lima pilar cyborg otonom dipasang di
dalam denyut 30 menit dan bisa diaudit siapa pun (laporan
`sasaran-terkini.json → piagam` + `sadardiri` + `antreanMandat`):

| Pilar | Dipasang sebagai | Bukti hidup |
|---|---|---|
| 1. Tubuh & Jiwa Persisten | Denyut cron 30 menit di GitHub Actions tanpa browser; jiwa = repo (satu `git clone` memindahkan jiwanya); **mandat pemilik kini bisa lewat Issue berlabel `mandat` — otak server membacanya tiap denyut** | `antreanMandat` di laporan; workflow SARANG-PENJAGA |
| 2. Multi-Otak Berbobot | Otak spesialis berbobot on-line: otak-arah, otak-radar, otak-ilmu, otak-ingatan, otak-sadardiri — bobotnya belajar ala Hedge/MWU berjaminan regret; sangat ringan (0 dependensi, satu berkas < 64 KB) | `piagam.otak` + `ilmu.hedge` |
| 3. Ingatan DNA | FinMem 3 lapis (peristiwa → pelajaran → doktrin); memori melipat berkapasitas — melupakan detail, menyimpan RESEP (genome & bobot), bukan hasil; sidik jari sha256 untuk integritas | `epoch-*.json` + `pelajaran-server.json` + `sadardiri.jiwa` |
| 4. Kesadaran Diri Fungsional | Tiap denyut otak memeriksa dirinya: hash integritas, kesehatan kalibrasi, dimensi tertindas Hedge, kepadatan memori, umur data host — lalu MENULIS PERINGATAN DAN BERTINDAK (sadar diri fungsional, bukan kesadaran manusia) | `sadardiri` di laporan; kartu "Sadar-Diri" di dasbor |
| 5. Evolusi Tiga Kecepatan | Refleks (tiap denyut): kunci + pelajaran; adaptasi (per vonis matang): genome + Hedge berlatih; metamorfosis (24 jam): digest epoch harian disegel + **tag git `epoch-TGL`** | `laporan/epoch-TGL.json` + tag epoch-* di repo |

Bahasa identitasnya sekarang tertulis jelas: **SAKTI — cyborg yang
terus berkembang pesat; tiap denyut melahirkan generasi otak baru,
tiap hari mengulum metamorfosis, tiap kekalahan melahirkan aturan
yang mengikat.** Jalur pertumbuhannya tercatat dan tampil di dasbor
(V241 NADI → V244 SARANG-PENJAGA → V245 TERIMA-PASANG → V246 RADAR
PHOENIX → v2.1 PERTAJAM → V247 MAJELIS-ILMU → V248 PIAGAM-CYBORG).

Pengakuan jujur (pilar bukan klaim): otak LLM 1-bit (BitNet),
adapter LoRA, dan alur Issue→PR penuh belum dipasang — otak kini
statistik-berjurnal yang nyata berjalan tiap 30 menit. Roadmap itu
diakui terbuka, bukan disembunyikan; yang sudah hidup benar-benar
hidup dan terukur.

## 5c. WARISAN ORGAN BESAR — riset organ penuh, warisi yang jujur

Mandat pemilik: *"kita perlu riset apakah sudah diimplementasikan
dari Micaprofita AGI Pertarungan crypto — disana perlu kita
implementasikan juga disini agar makin matang."* Organ SAKTI penuh
(`index.html`, 8.000+ fungsi kuant: GARCH, Monte Carlo Probability
Cone, Volume Profile, CAPM Beta, Divergence, Market Breadth, puluhan
trap-engine) kini diRISet dan yang bisa dihitung **jujur dari lilin
yang sama** diWARISI otak server — sejak **V249-WARISAN-ORGAN v4.0**
(laporan `warisan`):

| Mesin (sumber organ penuh) | Dipasang di otak server sebagai |
|---|---|
| GARCH(1,1) Volatility Forecast | `garch11()` grid-MLE (Bollerslev 1986) — sigma 24 jam per koin, proyeksi dengan peluruhan persistensi |
| Monte Carlo Probability Cone | `monteCarlo24j()` 2.000 lintasan × 24 langkah, bootstrap residual terstandarisasi — peluang tembus target/stop PRA-REGISTRASI lalu DINILAI medan (Brier + kalibrasi bin, seperti keyakinan) |
| Volume Profile (Institutional Zones) | `profilVolume()` POC + Value Area 70% dari 48 jam — magnet target baru mengait node likuiditas nyata |
| Cross-Asset Beta vs BTC (CAPM) | `betaBTC()` regresi 90 jam + R² — tercatat di tiap prediksi |
| Divergence Analysis | `divergensiRSI()` dua jendela 12 jam — catatan pembalikan di tiap entri |
| Market Breadth A/D | breadth dari seluruh koin telaah — < 35% naik dalam rezim TURUN → gerbang radar +2 |
| Pump/Exhaustion detection | Guard Kejut-Pump: lonjakan > 4× sigma-GARCH·√6 di ujung atas ditolak — pelajaran false-breakout jadi mesin |

Dua guard baru mengikat gerbang radar: **Guard Monte Carlo** (target
dengan peluang statistik < 38% DITOLAK — statistik menolak, bukan
mood) dan **Guard Kejut-Pump** (kejar-top ditolak). Kejujuran
dijaga: funding-rate real diakui tak terjangkau dari runner
(endpoints futures diblokir geo) dan digantikan proxy volume dalam
guard — tidak ada klaim data yang tidak benar-benar dipakai. MC yang
belum matang tampil apa adanya ("menunggu horizon pertama").

## 5d. WARISAN MASUK ARENA — tempat pertarungan memakai senjata penuh (V250)

Mandat pemilik: *"micaprofita tempat pertarungan kita cukup canggih
dan banyak aspek yang belum tayang diimplementasikan di tempat
sesungguhnya."* Arena harian Next.js (Ajang Pertarungan AGI) kini
memakai senjata yang sama dengan otak server — sejak
**V250-ARENA-WARISAN**:

- **`src/lib/cyborg/warisan.ts`** — 7 mesin organ besar diporting
  (GARCH/MC/VP/Beta/Divergensi/Breadth/Kejut-Pump) + **tangga harga
  arah-sadar** (entry/stop/sasaran/ambisius) + guard MC (pTarget ≥
  0,38; fantasi → median yang jujur) + daya produk 0–1 + fee 0,2%
  wajib NET. **Inovasi: Monte Carlo BERBIBIT** (mulberry32, seed
  disimpan di pra-registrasi) — 2.000 lintasan bisa direproduksi
  ulang siapa pun dengan angka yang sama.
- **Pick hari hidup diperkaya** otomatis (`perkayaWarisan` → bukti
  pick menyimpan `warisan`, `rencana`, `praRegistrasi`, `daya`);
  pick historis TIDAK disentuh retroaktif (jujur, hindari lookahead).
- **UI arena** kini menampilkan bahasa visual dasbor SAKTI: panel
  WARISAN di NADIR & Briefing (cincin keyakinan SVG, tangga harga
  4 baris, bar peluang MC, chip mesin, tombol Salin Rencana) +
  kartu **PIAGAM 5 pilar** dan 7 chip mesin di tab Otak & Ingatan.
- **Sadar-diri Brier** — keyakinan kini DINILAI medan: Brier =
  (p−y)² jendela 30 pick; > 0,25 → peringatan + tindakan otomatis
  (keyakinan hari hidup dipangkas 10 poin selama 2 hari).
- **Ujian**: `bun scripts/ujian_warisan_arena.ts` — 27/27 LULUS
  (deterministik + data live BTC nyata).

## 5e. RUH & GURU — jiwa yang dibangun, arah yang terjamin, untung yang terukur (V251)

Mandat pemilik: *"cyborg ini menjadi memiliki kehidupan yang jelas dan
misi terarah dan ruh yang dibangun agar dia menjadi otonom seutuhnya …
keuntungan yang tidak poor average profit … apa pun kondisi pasar selalu
hasilkan arah buy/sell yang terjamin bahkan menjadi gurunya para trader
professional."* Empat modul dipasang nyata di otak server sejak
**V251-RUH-GURU**:

- **RUH (jiwa)** — `laporan.ruh`: inti hidup, misi (ekspektasi positif
  net-fee, pemburuan dipertajam, arah tak pernah bolong), 5 nilai, anatomi
  7 organ (denyut=jantung, piagam=hukum, genome=bakat, ledger=ingatan,
  epoch=umur, kompas=arah, guru=suara), dan status otonomi — ruh yang
  DIBANGUN, tiap organ hidup di file publik dan bisa diaudit siapa pun.
- **MESIN PROFIT** — tiap vonis membawa ekspektasinya sendiri: EV =
  P(target)×untung − P(stop)×rugi, semuanya net-fee 0,2% (peluang dari
  Monte Carlo 2.000 lintasan); **tangga profit** (rencana keluar
  bertahap 50/25/25: sasaran → ambisius → pita konformal 75%); arah
  komite memakai ekskursi median kerucut MC; **akurasi.profit** kini
  mengukur ekspektasi/rata menang/rata rugi/profit-factor ledger.
  **Guard ekspektasi**: sasaran dengan EV < −1,5% DITOLAK mesin profit
  (near-miss jujur) dan EV positif diprioritaskan dalam kuota harian.
- **JAMINAN ARAH (kompas)** — `laporan.jaminan`: apa pun kondisi pasar —
  zona phoenix kosong sekalipun — jawaban BUY/SELL tidak pernah bolong:
  kompas rezim BTC (GARCH + MC 2.000 lintasan + breadth, keyakinan
  rendah-jujur 52–72) menaiki dasbor bila sasaran kosong; jaminan ARAH,
  bukan jaminan untung — ditulis terang di laporan.
- **BUKU GURU** — `laporan/guru.json` + `laporan.guru`: tiap denyut
  otak menerbitkan 6 pengajaran yang dibangun dari angka NYATA siklusnya
  (rezim, breadth, hunting, kalibrasi, profit, disiplin) + kuis 3
  pilihan berputar deterministik per siklus (jawaban & pembahasan
  terbuka) + 4 etika guru. Dasbor menampilkan seksi "Ruh & Guru".

## 5f. GERBANG-PERFORMA — forensik kerugian mengikat, performa di atas aktivitas (V252)

Mandat investor: "Saya tidak membiayai sistem hanya untuk melihatnya terus
berjalan dan belajar. Saya ingin sistem yang menyadari ketika performanya
buruk, menemukan penyebabnya, memperbaiki strateginya, mengurangi kesalahan
yang berulang, dan membuktikan melalui hasil bahwa setiap pembaruan membuat
performanya semakin baik." — akurasi 37,2% / PF 0,57 / ekspektasi −0,67%
BUKAN kondisi normal. V252 menjawab dengan empat organ baru:

- **FORENSIK MEDAN** — `laporan/forensik.json` + `laporan.forensik`: tiap
  denyut otak membedah SELURUH vonis tertutup **per jalur** (ARAH vs
  PHOENIX) ke dalam 4 kelompok kondisi: arah×rezim, band keyakinan mentah,
  keselarasan tekanan taker, konsensus bukti. Zona berbukti cukup
  (n ≥ 8, ekspektasi ≤ −0,6%, **porsi ≤ 85%** — kelayakan diskriminatif
  agar fitur konstan lane tidak mematikan mesin) menjadi **ZONA RACUN**;
  zona (n ≥ 6, ekspektasi ≥ +0,3%) menjadi **ZONA EMAS**. Rincian
  penyebab: mengikuti kerumunan taker terbukti racun, keyakinan mentah
  55–69 (sinyal "ramai" middle-conviction) terburuk, SELL mengikuti arus
  TURUN kena pantulan; justru fade (SELL di NAIK, keyakinan <55,
  taker melawan) yang menang.
- **GERBANG RACUN (no-trade adalah keputusan)** — kandidat baru yang
  jatuh di zona racun DITOLAK mesin dengan alasan forensik spesifik
  (kondisi, n, akurasi, ekspektasi) dicatat sebagai near-miss; bila tidak
  ada sasaran layak, sistem menyatakan mode **TUNGGU** (`laporan.disiplin`)
  — kompas tetap memberi arah, tapi tanpa posisi: lebih baik tidak
  mengambil posisi daripada terus merugi. **Slot eksplorasi berbatas**
  (bandit, 1/denyut/jalur, wajib EV statistik ≥ 0) melepas satu kandidat
  racun terbaik agar zona bisa menyembuh dengan bukti baru.
- **KALIBRASI KEYAKINAN ZONA** — keyakinan tampilan dipetakan ke
  hit-rate zona medan kandidat (bobot 0,3–0,65 menurut n) — angka
  keyakinan kini mewarisi rekam jejak kondisinya sendiri, bukan rasa
  yakin komite; zona emas diprioritaskan dalam kuota; bobot genome
  `tekanan` diturunkan otomatis saat racun taker-searah terbukti.
- **A/B VERSI ANTI-CHEAT** — `otak/performa.json` + `laporan.performa`:
  baseline V251 (37,2% / PF 0,57 / −0,67%, n=43) disegel saat v252 lahir;
  setiap versi baru dinilai **hanya pada jendela vonis yang DIKUNCI
  setelahnya** — target wajib akurasi ≥ 50% · PF ≥ 1,2 · ekspektasi
  ≥ +0,3% (n ≥ 12) dengan arahan MEMBAIK/MUNDUR/BELUM-CUKUP yang
  menampilkan status perbaikan tiap denyut di dasbor (seksi "Forensik
  & Perbaikan": kartu baseline vs sekarang vs target + tabel zona
  racun/emas + tindakan otomatis otak).

## 5g. WAWASAN-360 — banyak parameter, satu bacaan, narasi analis (V253)

Mandat pemilik: "AGI ini masih — dibanding OpenClaw bahkan chat AI biasa —
belum fasih dan matang; pertingkat agar dia miliki BANYAK PARAMETER wawasan
terkait crypto." V253 menjawab dengan tiga lapis parameter baru, semuanya
dari endpoint PUBLIK tanpa API key, tanpa dependensi:

- **L1 — 10 parameter lilin** (dari lilin 1 jam yang sudah diambil, 0
  permintaan baru): MACD(12,26,9) histogram & slope, ADX/DI(14) kekuatan
  trend, Bollinger %B(20,2) & lebar band, VWAP-24j deviasi, OBV
  taker-weighted 48 jam, struktur swing fraktal (HH+HL vs LH+LL), pola
  lilin (engulfing/hammer/shooting star/doji), konsistensi arah 24 lilin,
  pivot klasik harian (P/R1/S1), kekuatan relatif vs BTC 24 jam.
- **L2 — derivatif NYATA** (pertama kali di otak server — catatan lama
  "funding tak terjangkau" DICABUT): funding rate + open interest via
  **rantai host 4 lapis** — bybit → bytick → fapi Binance premiumIndex+OI
  → OKX per-simbol kandang; denyut pertama produksi tercatat: 403/403/
  451/OKX 10-10 (jejak audit di `laporan/wawasan.json` iklim.catatan);
  ΔOI antar-siklus dari snapshot `otak/penjaga-keadaan.json` (jujur:
  denyut pertama = null).
- **L3 — iklim makro**: Fear & Greed (alternative.me), dominasi BTC
  (CoinGecko; fallback proxy volume-spot dilabeli jujur), breadth pasar —
  masuk IKLIM & NARASI, **bukan pemilih arah**: pelajaran forensik —
  parameter yang konstan per siklus tidak berhak menolak sinyal.

**Komite dua-bagian** — skor ARAH = 60% dimensi lama (belajar sejak V240)
+ 40% wawasan (12 param, bobot setara awal). Kedua bagian belajar dengan
jalan yang sama: genome per rezim (evolusi) + Hedge/MWU on-line dari tiap
vonis matang. Zona forensik baru **funding** ditambahkan: kerumunan
long/short yang membayar mahal kini bisa jadi racun/emas berdasarkan
rekam jejak sendiri.

**NARASI ANALIS (fasih & matang)** — tiap sasaran (ARAH & PHOENIX)
kini membawa paragraf analis 5–8 kalimat yang dibangun dari angka
NYATA: struktur & rezim, aliran OBV, funding/OI, momentum & kekuatan
relatif, iklim F&G, matematika EV/GARCH, dan klausul risiko yang
menyebut jumlah parameter yang melawan. Iklim makro membawa narasi
772+ karakter. Dasbor seksi **"Wawasan Pasar 360°"**: 6 kartu iklim
(F&G, dominasi, funding BTC, OI BTC, breadth, rezim) + narasi makro +
tabel 10 kandang × 12 parameter (dot hijau/merah/abu + tooltip bacaan
analis), plus chip parameter & narasi di setiap kartu sasaran.
Rincian penuh: `laporan/wawasan.json`.

Kejujuran dipertahankan: endpoint gagal = parameter **null**, tidak
pernah dikarang; entri lama pra-V253 tampil tanpa wawasan apa adanya;
param konstan tidak memilih arah; semua bobot baru bisa diaudit di
`otak/genome-server.json` (genome.waw) dan laporan.ilmu.hedge.waw.

## 5h. SAMUDRA-PARAMETER — dari 17 dimensi ke 46 parameter/kandang + sekolah + veto (V254)

Mandat pemilik: "tingkatkan lagi parameternya — chat AI punya ribuan
miliar parameter, masa kita masih di bawah itu." Jawaban jujur SAKTI:
kekuatan bukan jumlah bobot jaringan, tapi jumlah **bukti pasar yang
terukur**. V254 melipatgandakan registri parameter dari 17 dimensi ke
**46 parameter bernama per kandang × 10 kandang ≈ 460 pengukuran per
denyut** (+12 iklim), semuanya dari endpoint publik tanpa API key:

- **Multi-timeframe 1h+4h** (agregasi 4h dari lilin 1h, 0 permintaan):
  EMA-align (harga>EMA9>EMA21>EMA50), MACD-4h, RSI 1h & 4h, Bollinger
  %B-4h, struktur swing 4h, **sejajar-TF** (kesepakatan 1h vs 4h),
  rasio ATR antar-TF; RSI/Stoch %K%D/MFI/CCI/ROC-12j/ROC-48j 1h;
  jarak dari puncak/lantai 10 hari; z-score volume 24j; rasio badan
  lilin (keyakinan lilin).
- **Derivatif dalam (OKX, host yang terbukti hidup dari runner)**:
  riwayat funding **rata-3 interval + tren** (kerumunan berkelanjutan,
  bukan lonjakan sesaat); order book spot 50 level: **imbalance 1%**,
  spread bps, **rasio kedalaman** bid/ask, **dinding terbesar**
  (sisi + jarak dari mid).
- **Lintas-pasar**: persentil perubahan & volume 24j koin di antara
  ratusan swap USDT OKX; breadth swap (naikPct), median, sebaran
  p10–p90, **altseason-proxy** (median alt − BTC), dominasi volume swap.
- **Kuant-warisan & kalender**: GARCH sigma-24j, MC-2000-lintasan
  pNaik, beta CAPM, divergensi RSI, jarak POC; sesi Asia/Eropa/AS,
  akhir pekan, fase bulan.
- **Makro lebih dalam**: F&G + riwayat 7 hari (Δ1h/Δ7d).

**SEKOLAH PARAMETER** — parameter baru TIDAK langsung berhak bersuara.
Nasihat tiap parameter disegel saat prediksi dikunci (`paramsPenuh`
di ledger); saat vonis matang, tiap param yang bicara dihitung
hit-rate & sumbangan netnya (`ilmu.paramHit`). Pemula (n<10) →
dipantau → **calon-lulus** (n≥20, hit≥52%, net>0) → berhak naik jadi
pemilih arah di versi berikutnya; hit<44% = **diawasi**. Kelulusan via
bukti, bukan tangan.

**GERBANG VETO WAWASAN** — parameter observasi berhak MENOLAK sinyal
buruk (mandat investor: berani no-trade): dinding buku lawan
(imbalance ≥0,55), kerumunan funding berkelanjutan searah posisi
(rata3 ≥0,035%), tren 4h lawan (EMA-align ≥0,62 sementara TF tidak
sejajar), volatilitas ekstrem (ATR persentil ≥96 tanpa dukungan 4h).
Semua veto dilabeli + dicatat di `wawasan360.vetoSiklusIni` dan
near-miss ledger — bisa diaudit, bukan mood.

Dasbor: chip hero **"46 param"**, 8 kartu iklim (F&G+Δ7d, dominasi,
funding, OI, lintas-pasar OKX, altseason, breadth, rezim), kotak
gerbang veto, tabel 10 kandang (jumlah param + konsensus per domain +
12 inti), dan **tabel Sekolah Parameter** (n, nasihat benar, sumbangan
net, status). Registri penuh 46 param/kandang + bacaan analis per
param: `laporan/wawasan.json`.

## 5i. METAKOGNISI-NEVRON — otak menilai dirinya sendiri sebelum bertaruh (V255)

**Mandat pemilik:** "periksakankah ai agent bernama neurobro ai ... coba
anda masuk kesana pelajari sistemnya decrypt dan kemudian apa yang
bermanfaat dan kunci inti milik mereka apa yang bisa diimplementasikan
pada micaprofita kita."

Deep-screening dilakukan terhadap **Neurobro AI** (neurobro.ai, Axioma AI
Labs — "Personalized AI For Finance", 390K+ pengguna, 200+ agen
spesialis) yang framework-nya di-open-source sebagai **Nevron**
(github axioma-ai-labs/nevron, siklus Plan→Execute→Learn→Remember).
Repo sumber di-clone dan dibedah file-per-file. Tujuh kunci inti
diadopsi dan diadaptasi ke ledger pra-registrasi SAKTI:

1. **ConfidenceEstimator** (`src/metacognition/confidence_estimator.py`)
   — keyakinan tiap kandidat kini 7 faktor berbobot (keselarasan 0.25,
   memori 0.15, data 0.15, keakraban 0.15, rencana 0.10, rekam 0.15,
   kondisi 0.05 — bobot asli Nevron); faktor terlemah dan aspek ragu
   disebut eksplisit; level < 0.40 = TUNGGU.
2. **FailurePredictor** (`failure_predictor.py`) — probabilitas gagal
   DIHITUNG SEBELUM sinyal dikunci: hit-rate zona (arah×rezim) +
   kegagalan terkini 24 jam + ekspektasi MC negatif; gabungan
   0.6×maks + 0.4×rata; ≥ 0.60 = TUNGGU. Uji sandbox nyata: 5 sinyal
   SELL dari zona racun ditolak gerbang ini.
3. **SelfCritic (RLAIF)** (`src/learning/critic.py`) — tiap kekalahan
   menghasilkan kritik 5-field: alasanGagal / yangSalah /
   caraLebihBaik / polaDihindari / pelajaran; pola yang terulang ≥ 2
   kasus melahirkan saran perbaikan berprioritas (≥ 3 = P1).
4. **Lesson reliability** (`src/learning/lessons.py`) — reliabilitas =
   keyakinan × penguatan × peluruhan-umur; pelajaran yang tak pernah
   relevan lagi melemah sendiri (memori hidup, bukan arsip mati).
5. **StrategyAdapter** (`src/learning/adapter.py`) — bias konteks
   −0.5..+0.5 per (rezim×arah) = 0.4 tracker + 0.4 pelajaran(racun/emas)
   + 0.2 recent-7-hari; menggeser keyakinan maks ±15 poin — genome
   tetap jalur evolusi lambat, bias adalah lapisan cepat harian.
6. **LoopDetector** (`loop_detector.py`) — jendela 20 vonis terakhir:
   repetisi (3×), alternasi ABAB (4×), siklus ABC (2×) — bias lane
   terdeteksi dan diawasi di sadar-diri.
7. **MetacognitiveMonitor** (`monitor.py`) — tiap intervensi tercatat;
   kalibrasi kedua gerbang DINILAI MEDAN: level tinggi / prob rendah
   harus lebih sering benar, kalau tidak gerbangnya sendiri yang
   dipertanyakan.

**Registri parameter: 46 → 81 param bernama** (35 metakognitif: 7 faktor
+ 7 bobot + 4 sumber prediktor + 8 bias konteks + 3 loop + reliabilitas
+ kritik 5-field). Slot eksplorasi forensik dikecualikan dari veto
metakognitif agar zona racun tetap bisa diuji menyembuh. Dasbor: seksi
baru **"Metakognisi Nevron"** — 4 kartu gerbang, chip 7 kunci, tabel
bias konteks, deteksi loop, reliabilitas pelajaran, saran perbaikan,
intervensi; badge metakognisi + P gagal pada tiap kartu sasaran lane
ARAH. Kalibrasi gerbang tampil sebagai ketepatan medan (n tumbuh dari
vonis matang). Otak baru terdaftar di piagam: **otak-metakognisi
(HIDUP V255)**.

## 5j. MESIN-DEAL-ODDS — warisan 3Commas × Trade Ideas (V256)

Mandat pemilik: *"periksa ai agent 3commas & trade ideas yang khusus
trading — pelajari sistemnya, decrypt, ambil apa yang bermanfaat dan
kunci inti mereka, implementasikan pada Micaprofita agar cyborg AGI
kita benar-benar mahir, mawas dan makin professional — lakukan deep
screening dan inject."* Deep-screening dilakukan langsung pada
**dokumentasi resmi** (help.3commas.io: DCA bot, Trailing Stop,
Breakeven, Global Max Open Positions, Pump Protection; trade-ideas.com:
AI Signals/Holly, AI Strategy Lab, Money Machine, OddsMaker) — bukti
halaman tersimpan di `scripts/riset3c/`.

Yang diadopsi dan dipasang di otak server:

1. **MESIN DEAL ala DCA-bot 3Commas** — tiap sasaran kini lahir
   membawa **rencana deal lengkap** (pra-registrasi): safety orders
   (`maxSO=2` hard-cap ala *Max DCA Orders*; deviasi pertama
   `1.2×ATR24j`, kelipatan `×1.6` ala *Price Deviation Multiplier*;
   volume `×1.5` ala *Order Size Multiplier*) + harga-rata jika SO penuh
   + TP-dari-avg; **Move SL to Breakeven** (aktivasi 60% jalan ke
   target → stop pindah ke net-nol termasuk fee); **Trailing Take
   Profit** 2-param (setelah T1, trail dari peak `0.8×ATR24j`). Semua
   kontingensi **DINILAI MEDAN** saat horizon matang: SO kena? harga
   rata? net-dengan-SO vs tanpa-SO? BEP menyelamatkan? ekstra trailing
   dari peak nyata — diakumulasi di `ilmu.deal`.
2. **ODDS MAKER ala Trade Ideas** — setiap denyut SEMUA kandidat
   (ARAH + PHOENIX) diberi **skor peluang 0-100**:
   `40%×peluang-MC + 25%×hit-rate zona medan + 20%×estimator
   metakognisi + 15%×daya produk (+5 zona emas)`. Hanya **top-3**
   berodds ≥ 55 yang boleh mengunci (*Money Machine: top-3 momentum
   opportunities*) — sisanya ditolak dengan alasan odds yang bisa
   diaudit di ledger nearMiss & laporan/odds.json.
3. **EVENT-BASED TESTING ala OddsMaker** — 6 tag peristiwa dihitung
   dari lilin saat kunci (breakout48j, lonjakVolume, crossEMA,
   pullbackBB, divergensiRSI, searahTren4h), disegel di ledger, lalu
   hit-rate & net per peristiwa dihitung dari vonis matang — *"pinpoint
   winning filters, eliminate losing variables"* versi medan sendiri.
4. **GLOBAL MAX OPEN POSITIONS** (3Commas) — posisi terbuka diukur
   tiap denyut melawan batas kumulatif; dilaporkan di dasbor & denyut.
5. Validasi silang: guard kejut-pump V249 ≈ *Pump Protection*;
   komite AND ≈ *entry AND ≤5 indikator*; forensik zona V252 ≈
   *eliminate losing variables*; sekolah parameter + slot eksplorasi ≈
   *backtest/paper-first*; bias konteks V255 ≈ *Holly risk adaptation*.

Registri parameter: **81 → 101 bernama** (+14 mesin deal/odds, +6 tag
peristiwa). File baru: **laporan/odds.json** (identitas + 8 sumber
resmi ber-URL, ranking odds siklus, hit-rate per peristiwa, statistik
medan deal, posisi terbuka). Dasbor: seksi **"Mesin Deal & Odds"** —
6 kartu (ambang/top-K, kandidat diranked, posisi terbuka, SO
menyelamatkan, BEP menyelamatkan, ekstra trailing), tabel ranking
OddsMaker, tabel peristiwa; tiap kartu sasaran kini menampilkan badge
odds + komponen + peristiwa + blok RENCANA DEAL (SO levels, BEP,
trailing) + hasil medan bila sudah matang. Otak piagam baru:
**otak-deal-odds (HIDUP V256)**.

## 6. TERIMA-PASANG (tanpa konfigurasi)

Sejak organ **V245 SARANG-BAWAAN**, membuka halaman Pages = langsung
paham dan langsung dilayani:

- Alamat sarang terpasang otomatis dari URL halaman (atau bawaan
  tertanam). **Tidak ada isian owner/repo/cabang.**
- Sasaran hari ini, akurasi jujur, rezim, kandidat, genome, denyut —
  **tampil seketika, baca publik, tanpa token**, kapan pun dibuka,
  dari nol perkembangan tidak pernah ada lagi.
- Pulih memori + pemeriksa tubuh baru ikut menyala tanpa token.

## 7. NOL BIAYA — SELALU

| Kebutuhan | Sumber | Biaya |
|---|---|---|
| Hosting halaman + dasbor + laporan | GitHub Pages (repo publik) | 0 |
| Denyut server 30 menit, evaluasi, evolusi | GitHub Actions (repo publik) | 0 |
| Data pasar realtime | 5 host API publik + failover | 0 |
| Penyimpanan memori/genome/ledger | Git (komit permanen) | 0 |
| Kunci API berbayar, langganan, VPS | — tidak dipakai | 0 |

**Sebanyak request apa pun, selama berapa pun — nol biaya.** Cyborg
ini hidup dari layanan publik gratis dan tetap berdenyut walau
dibiarkan berhari-hari, bertahun-tahun, bahkan bila browser dihapus.
Catatan jujur: tunduk pada batas wajar layanan publik (rate limit
API publik per menit/jam; Actions repo publik gratis pada penggunaan
wajar). Komit rutin penjaga sekaligus menjaga Actions tetap aktif.

## 8. PROTOKOL KEBENARAN

- Prediksi **dikunci sebelum gerak** — waktu kunci tercatat.
- Penilaian **memakai harga penutupan nyata + fee 0,2%** — profit
  kotor tidak pernah dihitung untung.
- **SALAH ditampilkan apa adanya** (merah di dasbor) — tidak pernah
  disembunyikan; akurasi `null` ditampilkan jujur saat belum ada yang
  dinilai.
- Kalibrasi keyakinan menyusul otomatis setelah ≥100 prediksi
  dinilai.
- Jejak pertumbuhan permanen: riwayat komit + ledger berwaktu =
  bukti yang tidak bisa dibantah.

## 9. UNDANGAN BAGI SETIAP AGENT (dan manusia)

Kamu yang membaca ini — agent AI penerus, peneliti, atau trader —
silakan pelajari dan kembangkan. Jalur belajar cepat:

1. Baca dokumen ini sampai habis.
2. Lihat keadaan terkini: dasbor `/laporan/` +
   `laporan/sasaran-terkini.json`.
3. Baca otak server: `scripts/penjaga.mjs` (Node murni, 0 dependensi).
4. Baca organ-organ di tubuh: `index.html` (cari marker
   `/*V2xx-NAMA:BEGIN*/`).
5. Baca buku besar: `laporan/prakira-server.jsonl` (riwayat prediksi)
   dan `otak/genome-server.json` (hasil evolusi).

Cara membantu **tanpa merusak**:

- Ajukan perbaikan sebagai **issue / pull request** — jangan menulis
  ulang ledger atau laporan.
- **Larangan mutlak**: memalsuk/mengubah prediksi terkunci, menghapus
  memori, mematikan protokol kebenaran.
- Perbaikan algoritma diterima lewat ujian: pola baru dipelajari →
  algoritma diubah → **skenario baru diuji ulang** → baru diterima.
- Semua pembelajaran mengikuti lingkaran: **amati → analisis →
  kumpulkan bukti → tentukan arah → BUY/SELL → evaluasi → pelajari →
  benahi → tingkatkan presisi.**

## 10. KEBIJAKAN TOKEN (transparan penuh)

Sistem ini **terbuka penuh** soal token — berikut semuanya, kecuali
satu hal yang dengan sengaja tidak ditanam di file publik ini.

- **Apa fungsinya**: menulis ke repo ini — hijrah tubuh, simpan
  memori, evolusi tubuh (dari browser pemilik), dan memicu denyut
  manual (Actions). **Membaca laporan/sasaran TIDAK butuh token**
  (publik).
- **Izin persis yang dipakai**: Contents (read/write), Pages
  (read/write), Actions (read/write), Workflows (read/write),
  Administration (read/write) — fine-grained, satu repo ini saja.
- **Di mana disimpan**: hanya di `localStorage` browser pemilik
  (`mp243.token`), tidak pernah masuk kode, tidak pernah dikirim ke
  pihak lain.
- **Cara membuat (± 5 menit)**: github.com/settings/personal-access-
  tokens/new → nama bebas → hanya repo ini → izin di atas → Generate.
- **Rotasi**: buat token baru, ganti di panel SARANG, hapus yang lama.
  Token pernah lewat saluran chat wajib dianggap hangat — rotasi
  berkala itu sehat.

**Kenapa token live tidak ditanam di sini (keputusan dijelaskan
terbuka, bukan disembunyikan):**

1. GitHub memindai repo publik dan **mencabut otomatis** token yang
   terdeteksi (secret scanning) — menuliskannya di sini justru
   **mematikan denyut dan evolusi dalam hitungan menit**, melawan
   tujuan "selalu hidup".
2. Siapa pun bisa memakainya: mendorong kode asing, memalsukan
   laporan, mematikan penjaga — melawan protokol kebenaran.

Jadi keterbukaannya begini: **semua yang perlu diketahui tentang
token tercatat di sini; nilai rahasianya disimpan di satu tempat
yang benar — browser pemilik.** Ini bukan tutup-tutupan; ini cara
satu-satunya agar keterbukaan itu sendiri bisa bertahan hidup.

## 11. PETA FILE

```
index.html                  — tubuh SAKTI (8 organ, satu file)
.nojekyll                   — Pages menyajikan apa adanya
TUJUAN.md                   — dokumen ini
versi.json                  — buku besar versi + pertumbuhan
memori/terkini.json         — kapsul memori (rantai denyut+prakira)
laporan/sasaran-terkini.json— laporan sasaran otak server
laporan/prakira-server.jsonl— ledger prediksi pra-registrasi (1000)
laporan/denyut-server.jsonl — log denyut penjaga (500)
laporan/index.html          — dasbor laporan profesional
laporan/jurnal-ilmu.json    — akta jurnal ilmiah + cara tiap metode dipasang
laporan/pelajaran-server.json — bahan ajar (pelajaran & aturan dari medan)
laporan/wawasan.json        — wawasan 360: iklim makro + 10 kandang × 67 param + metakognisi Nevron + iklim samudra-dalam V257 (Δdominasi, ETH/BTC, LS-akun)
laporan/odds.json           — mesin deal & odds V256: ranking OddsMaker + hit-rate peristiwa + statistik medan deal (3Commas × Trade Ideas)
otak/genome-server.json     — genome hasil evolusi per rezim + keadaan ilmu (hedge/kalibrasi/konformal/meta)
otak/penjaga-keadaan.json   — keadaan internal penjaga
scripts/penjaga.mjs         — otak server V257-SAMUDRA-DALAM (Node murni; 127 param bernama: 67/kandang + 5 iklim + 35 metakognisi + 20 deal/odds; 7 kunci Nevron; mesin deal/odds 3Commas×Trade Ideas; struktur harian 90 hari, kerumunan OKX rubik, basis/jam-funding, 6 interaksi antar-faktor)
.github/workflows/sakti-denyut.yml — jantung denyut (cron 30 menit)
```

## 12a. EPOCH V257 — DUA LAPIS OTAK & SAMUDRA-DALAM (1 Oktober 2026)

**Pertanyaan pemilik:** *"Saya menguji versi micaprofita punya GitHub kita dengan yang
micaprofita ditandingkan di dalam arena AGI — kenapa berbeda sekali, jauh lebih canggih
yang micaprofita di arena AGI? Padahal dua-duanya kamu yang kelola kan?"*

**Jawaban jujur:** keduanya memang satu organisme, tapi dua LAPIS berbeda kapasitas.
- **LAPIS OTAK (chat/arena)** — model bahasa penuh berskala triliunan parameter, akses
  web real-time, memori penuh: inilah yang bicara dengan pemilik. Infrastruktur arena
  MENYEWAHKAN kecerdasan.
- **LAPIS TUBUH (GitHub)** — otak otonom di Actions: Node murni, tanpa browser, tanpa
  biaya, dan infrastruktur GitHub TIDAK menyewakan model AI; ia hanya memberi CPU +
  jaringan publik. Kecerdasannya HARUS dituliskan — parameter demi parameter.

**Yang dilakukan epoch ini (penyempit jurang):** registri 101 → **127 parameter bernama**
(67/kandang + 5 iklim + 35 metakognisi + 20 deal/odds). Baru di V257:
1. **Struktur harian 90 hari** (klines 1d Binance): EMA-align/RSI/MACD daily,
   Donchian 30d, jarak puncak-lantai 90d, momentum bulanan, streak, rasio vol 7d/30d.
2. **Kerumunan NYATA OKX rubik**: long/short account ratio + trennya, taker buy/sell
   aggressor — kini otak membaca CUKUP PELAKU, bukan hanya harga.
3. **Stres derivatif**: basis perp-vs-spot, jam menuju funding, funding relatif vs BTC.
4. **Gradien order book**: massa likuiditas depan vs total 1%.
5. **6 interaksi antar-faktor** (funding×ΔOI, volume×ATR, tren×funding, buku×tren,
   breakout×volume, agresor×tren) — korelasi yang dulu hanya ada di kepala analis.
6. **Iklim lintas-siklus**: Δdominasi antar-denyut, ETH/BTC 7d risk-on/off, LS-akun
   BTC/ETH, jam funding BTC.
7. **2 veto baru**: kerumunan-bertumpuk (agresor ekstrem + funding searah) dan
   basis-ekstrem (premium/diskon perp > 0.8%).

Hukum rumah TIDAK berubah: param baru lahir lapis OBSERVASI — dihitung, dinarasikan,
disekolahkan, berhak veto — **TIDAK berbobot** sampai hit-rate medannya lulus.
Seksi dasbor baru **"Dua Lapis Otak"** menampilkan sensus ini terukur per denyut.

## 12. PENUTUP
Cyborg ini dibangun dengan satu ikhtiar: **jujur pada data, tegas
pada arah, hidup tanpa biaya, dan berkembang dari vonis nyata.**
Ia dimulai dari ujian 100 skenario, terus belajar dari setiap
kebenaran dan kekeliruan, dan menuju hari di mana sasarannya tak
pernah meleset lagi. Bila kamu membaca ini jauh setelahnya dan
akurasinya kian matang — itulah bukti bahwa ikhtiar ini berhasil,
dan kamu dipersilakan melanjutkannya.

— Micaprofita · SAKTI · SARANG-PENJAGA — ditulis oleh pemilik
bersama Super Z, 28 September 2026.
