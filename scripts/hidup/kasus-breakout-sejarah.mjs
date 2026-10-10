// ============================================================
// KASUS-BREAKOUT-SEJARAH (V330) — keluarga SEJARAH ujian
// BREAKOUT-3500.
// Mandat pemilik (2026-10-10): "ujian 3500 soal ... kita buat Dan
// pelajari Dari kasus nyata yakni (False breakout) yang berhasil
// lumpuhkan jutaan trader di Dunia Dan level trader itu bahkan
// professional trader".
// ------------------------------------------------------------
// 9 kasus (8 kasus dunia + 1 kasus pelajaran profesional), 48 soal.
// SEMUA fakta dari catatan publik yang luas terdokumentasi (puncak,
// dasar, tanggal, persentase) — nol karangan; opsi salah dibuat masuk
// akal agar soal tidak bisa ditebak dari bentuk.
// Keluarga ini menguji INGATAN kasus dunia: menembus level kunci
// (resistance/support lama) terlihat persis seperti awal tren sejati —
// para profesional tidak mati karena salah melihat tembusan, melainkan
// karena menganggap SEMUA tembusan = sejati, ukuran posisi, leverage,
// dan tidak punya rencana keluar saat harga kembali masuk ke dalam
// level (breakout batal).
// ============================================================

export const KASUS_BREAKOUT_SEJARAH = [
  {
    id: 'SILVER-1980',
    nama: 'Perak — breakout ATH Hunt Brothers 1980 (Silver Thursday)',
    catatan: 'perak melonjak dari ±$6 (pertengahan 1979) menembus ATH berulang sampai $50,36 intraday 18 Jan 1980 — breakout paling panas sepanjang sejarah komoditas; lalu −80% dalam empat hari; Silver Thursday 27 Maret 1980 memaksa bursa mengubah aturan',
    fakta: [
      { tanya: 'Puncak intraday perak 18 Januari 1980 (breakout ATH era Hunt Brothers) di berapa?', opsi: ['±$20,36', '±$35,36', '±$50,36', '±$80,36'], kunci: 2 },
      { tanya: 'Dari puncak $50,36 (18 Jan 1980), perak jatuh sekitar −80% dalam empat hari — peristiwa 27 Maret 1980 dikenal sebagai?', opsi: ['Black Friday', 'Silver Thursday', 'Flash Crash', 'Margin Monday'], kunci: 1 },
      { tanya: 'Dari ±$6 (pertengahan 1979) ke $50,36 (Jan 1980) — berapa persen kenaikan yang membuat breakout terlihat tak bisa salah?', opsi: ['±+100%', '±+300%', '±+700%', '±+3000%'], kunci: 2 },
      { tanya: 'Pelajaran Silver 1980: breakout yang memimpin pasar (leading) bagaimana nasibnya bagi pembeli puncak?', opsi: ['Puncak selalu lompatan kedua', '−80% dalam empat hari — breakout paling panas pun bisa batal total', 'Perak pulih sebulan', 'Bursa menjamin harga'], kunci: 1 },
    ],
  },
  {
    id: 'NASDAQ-5000',
    nama: 'Nasdaq — dua breakout 5.000: 2000 (palsu, −78%) vs 2015 (sejati)',
    catatan: 'Nasdaq menutup di atas 5.000 pertama kali 10 Maret 2000 (5.048,62) — breakout yang batal: −78% sampai 1.114,11 (9 Okt 2002); baru 23 April 2015 Nasdaq menembus 5.000 lagi (5.056,06) dan kali ini SEJATI — 15 tahun; dua tembusan level yang sama, dua nasib berlawanan',
    fakta: [
      { tanya: 'Nasdaq menutup di atas 5.000 pertama kali pada 10 Maret 2000 — di berapa?', opsi: ['4.048,62', '5.048,62', '6.048,62', '5.548,62'], kunci: 1 },
      { tanya: 'Breakout 5.000 tahun 2000 batal: Nasdaq jatuh −78% ke dasar berapa (9 Oktober 2002)?', opsi: ['1.114,11', '2.114,11', '3.114,11', '4.114,11'], kunci: 0 },
      { tanya: 'Berapa lama Nasdaq butuh untuk menembus kembali level 5.000 — dan kali ini breakout SEJATI (23 April 2015)?', opsi: ['±2 tahun', '±5 tahun', '±15 tahun', 'Belum pernah'], kunci: 2 },
    ],
  },
  {
    id: 'GOLD-2011',
    nama: 'Emas — breakout $1.900 palsu 2011, bear dua tahun',
    catatan: 'emas menembus $1.800 dan menyentuh ±$1.920 (6 September 2011) di tengah ketakutan utang — breakout memimpin yang membuat semua yakin hyperinflation trade dimulai; lalu bear dua tahun: −45% ke $1.046 (Desember 2015); emas baru kembali menyentuh level itu sembilan tahun kemudian',
    fakta: [
      { tanya: 'Puncak intraday emas 6 September 2011 — breakout yang batal — di berapa?', opsi: ['±$1.520', '±$1.720', '±$1.920', '±$2.120'], kunci: 2 },
      { tanya: 'Dari puncak 2011, emas jatuh −45% ke dasar berapa (Desember 2015)?', opsi: ['±$1.046', '±$1.246', '±$1.446', '±$1.646'], kunci: 0 },
      { tanya: 'Berapa lama emas baru menyentuh kembali level puncak 2011 (±9 tahun, Agustus 2020)?', opsi: ['±1 tahun', '±3 tahun', '±9 tahun', 'Belum pernah'], kunci: 2 },
    ],
  },
  {
    id: 'BTC-2021',
    nama: 'Bitcoin — breakout ATH palsu 2021 (double top) — paling mahal di kripto',
    catatan: 'Bitcoin menembus ATH April 2021 (±$64.800) pada 20 Oktober 2021 — breakout yang semua tunggu; puncak baru $69.044 (10 November 2021) bertahan dua hari; lalu −77% ke ±$15.500 (November 2022, era FTX) — breakout ATH palsu paling mahal sepanjang sejarah kripto',
    fakta: [
      { tanya: 'Puncak baru setelah breakout ATH 20 Oktober 2021: BTC menyentuh berapa (10 November 2021)?', opsi: ['±$64.800', '±$69.044', '±$74.044', '±$59.044'], kunci: 1 },
      { tanya: 'Dari puncak $69.044, BTC jatuh ke berapa pada November 2022 (era runtuhnya FTX)?', opsi: ['±$25.500', '±$15.500', '±$5.500', '±$35.500'], kunci: 1 },
      { tanya: 'Total penurunan dari puncak Nov 2021 ke dasar Nov 2022?', opsi: ['±−37%', '±−57%', '±−77%', '±−97%'], kunci: 2 },
      { tanya: 'Berapa lama puncak $69.044 bertahan sebagai harga pasar sebelum jatuh (breakout "sejati" cuma dua hari)?', opsi: ['±2 hari', '±2 minggu', '±2 bulan', '±2 tahun'], kunci: 0 },
    ],
  },
  {
    id: 'BTC-2020-TERUS',
    nama: 'Bitcoin — breakout $20.000 Desember 2020: SEJATI (kontras)',
    catatan: '16-17 Desember 2020 BTC menembus ATH 2017 (±$19.800) dan menutup di atas $20.000 — TIDAK PERNAH kembali; tujuh bulan berikutnya +225% ke ±$64.800; pelajaran paham-vs-hafal: bukan SEMUA breakout palsu — breakout sejati menetap dan tak pernah menyentuh level lama lagi',
    fakta: [
      { tanya: 'Kapan BTC menembus ATH 2017 (±$19.800) dan menutup di atas $20.000 untuk pertama kali?', opsi: ['Desember 2020', 'Desember 2019', 'Juni 2021', 'Maret 2020'], kunci: 0 },
      { tanya: 'Setelah breakout $20.000 Des 2020, BTC menyentuh level $20.000 lagi sebelum melanjutkan ke ±$64.800 (Juli 2021)?', opsi: ['Tidak pernah — breakout sejati menetap (+225% tujuh bulan)', 'Kembali tiga kali', 'Kembali sekali', 'Kembali setelah FTX'], kunci: 0 },
    ],
  },
  {
    id: 'GME-2021',
    nama: 'GameStop — breakout memimpin Januari 2021: $483 lalu −90%',
    catatan: 'GME menembus $40 dan memimpin pasar (+51% sehari) — breakout yang media teriak ke seluruh dunia; puncak intraday $483,00 (28 Januari 2021); dua hari kemudian ±$40 — para pembeli breakout terlambat yang masuk di $300-400 kehilangan ±90% — breakout memimpin paling terkenal sepanjang sejarah pasar saham',
    fakta: [
      { tanya: 'Puncak intraday GameStop 28 Januari 2021 di berapa?', opsi: ['±$83,00', '±$183,00', '±$283,00', '±$483,00'], kunci: 3 },
      { tanya: 'Dua hari setelah puncak $483, GME diperdagangkan di kisaran berapa (awal Februari 2021)?', opsi: ['±$40', '±$140', '±$240', '±$440'], kunci: 0 },
      { tanya: 'Siapa yang paling lumpuh di breakout GME?', opsi: ['Pembeli terlambat yang masuk di puncak memimpin (±−90% dalam hitungan hari)', 'Short seller saja', 'Tidak ada yang rugi', 'Hanya bursa'], kunci: 0 },
    ],
  },
  {
    id: 'BEAR-TRAP-2009',
    nama: 'S&P 500 — bear trap terbesar modern Maret 2009',
    catatan: 'sepanjang akhir 2008, setiap "breakdown" tampak sejati: S&P 500 pecah 800, pecah 750 — para penjual breakdown yakin dunia berakhir; dasar 676,53 (9 Maret 2009) lalu +68% dalam 12 bulan — breakdown yang batal (bear trap) melumpuhkan para short yang tanpa rencana keluar',
    fakta: [
      { tanya: 'Dasar S&P 500 9 Maret 2009 — titik balik bear trap terbesar modern — di berapa?', opsi: ['676,53', '876,53', '1.076,53', '476,53'], kunci: 0 },
      { tanya: 'Dua belas bulan setelah dasar Maret 2009, S&P 500 naik berapa persen (mematikan para short breakdown)?', opsi: ['±+8%', '±+28%', '±+68%', '±+168%'], kunci: 2 },
      { tanya: 'Pelajaran bear trap 2009 bagi penjual breakdown (short)?', opsi: ['Breakdown sejati selalu berlanjut', 'Breakdown yang batal lebih kejam daripada breakout yang batal — short tak punya batas rugi alami', 'Short tidak bisa likuid', 'Margin tidak berlaku untuk short'], kunci: 1 },
    ],
  },
  {
    id: 'GBP-1992',
    nama: 'Pound sterling — floor ERM 2.7780 DM: breakout palsu berulang, sejati menagih $1 miliar',
    catatan: 'pound terikat floor 2.7780 DM di ERM; para spekulan menyerang floor berulang kali (1990-1992) dan GAGAL — breakout bawah palsu berulang melatih pasar bahwa "floor pasti tahan"; 16 September 1992 (Black Wednesday) floor pecah SEJATI: Soros/Quantum Fund untung ±$1 miliar — yang hafal "floor pasti tahan" lumpuh, yang menunggu bukti menagih besar',
    fakta: [
      { tanya: 'Floor pound di ERM yang dijaga hingga Black Wednesday 1992: 1 pound = berapa Deutsche Mark?', opsi: ['2,7780 DM', '1,7780 DM', '3,7780 DM', '4,7780 DM'], kunci: 0 },
      { tanya: '16 September 1992 (Black Wednesday) — setelah bertahun-tahun serangan gagal (breakout bawah palsu berulang), floor pecah sejati. Untung Quantum Fund (Soros)?', opsi: ['±$10 juta', '±$100 juta', '±$1 miliar', 'Rugi $1 miliar'], kunci: 2 },
    ],
  },
  {
    id: 'PELAJARAN-BREAKOUT',
    nama: 'Pelajaran Profesional — intisari semua kasus breakout palsu',
    catatan: 'aturan hidup-mati yang diambil dari kelapan kasus di atas — inilah mengapa tembusan level bisa melumpuhkan bahkan para profesional',
    fakta: [
      { tanya: 'Mengapa breakout (menembus level kunci) memikat bahkan trader profesional?', opsi: ['Terlihat persis seperti awal tren sejati: level pecah, volume meledak, media teriak "tren baru dimulai"', 'Profesional tidak pernah terjerat', 'Breakout selalu sejati', 'Karena level lama tidak pernah penting'], kunci: 0 },
      { tanya: 'Ciri dari DATA pasar yang mengkonfirmasi breakout PALSU (bull trap / bear trap)?', opsi: ['Volume makin naik', 'Harga kembali menutup DI DALAM level lama — tembusan batal', 'RSI melewati 50', 'Lilin jadi hijau'], kunci: 1 },
      { tanya: '"False breakout" artinya?', opsi: ['Tren baru sejati', 'Harga menembus level lalu kembali masuk ke dalam range — tembusan batal; pembeli/penjual breakout terjerat', 'Gap pembukaan', 'Bursa menghentikan perdagangan'], kunci: 1 },
      { tanya: 'Bull trap vs bear trap — bedanya?', opsi: ['Bull trap: menembus KE ATAS lalu batal (menjerat pembeli); bear trap: menembus KE BAWAH lalu batal (menjerat penjual)', 'Sama persis', 'Bull trap hanya di saham', 'Bear trap tidak ada di kripto'], kunci: 0 },
      { tanya: 'Kasus Silver 1980: dari $50,36 ke ±$10,80 dalam empat hari — pelajaran tentang breakout paling panas?', opsi: ['Panas selalu aman', 'Breakout yang paling memimpin pun bisa batal total — kepanasan bukan bukti', 'Perak pulih minggu itu', 'Bursa menjamin harga'], kunci: 1 },
      { tanya: 'Kasus Nasdaq 5.000: breakout 2000 batal (−78%), breakout 2015 sejati — pelajaran?', opsi: ['Level sama, nasib beda — yang memutuskan adalah KETAHANAN di atas level, bukan tembusannya', 'Angka bulat tidak penting', '2000 tidak terjadi', '2015 juga palsu'], kunci: 0 },
      { tanya: 'Kasus Gold 2011: breakout $1.900 batal, −45% dua tahun — pelajaran tentang "breakout memimpin"?', opsi: ['Memimpin = aman', 'Breakout di puncak mania (memimpin) justru sering palsu — makin panas makin hati-hati', 'Emas tidak boleh diperdagangkan', '−45% tidak mungkin'], kunci: 1 },
      { tanya: 'Kasus BTC Desember 2020: menembus $20.000 dan TIDAK PERNAH kembali — mengapa kasus ini wajib diingat?', opsi: ['Agar tidak menghafal "semua breakout palsu" — sejati menetap dan tak menyentuh level lama; yang memutuskan adalah ketahanan, bukan tembusan', 'Karena BTC unik', 'Karena 2020 tidak ada breakout lain', 'Karena $20.000 angka sakral'], kunci: 0 },
      { tanya: 'Kasus GME Januari 2021: pembeli breakout terlambat −90% dalam hitungan hari — kesalahan fatal mereka?', opsi: ['Membeli karena breakout sudah terkenal (media) — masuk paling akhir saat bahan bakar habis', 'Membeli terlalu awal', 'Tidak memakai aplikasi', 'Menjual terlalu cepat'], kunci: 0 },
      { tanya: 'Kasus bear trap 2009: breakdown berulang tampak sejati lalu +68% — pelajaran bagi penjual breakdown?', opsi: ['Short tanpa rencana keluar bisa ditangkap breakdown yang batal — rugi short tak berbatas', 'Short selalu aman', 'Dasar tidak pernah terjadi', 'Margin tidak berlaku'], kunci: 0 },
      { tanya: 'Kasus GBP 1992: serangan floor gagal berulang, lalu sejati menagih ±$1 miliar — pelajaran tentang kesabaran?', opsi: ['Breakout palsu berulang bukan bukti level abadi — sejati datang dengan bukti ketahanan baru; hafalan "pasti tahan" juga mematikan', 'Floor selalu tahan', 'Soros beruntung semata', 'ERM tidak penting'], kunci: 0 },
      { tanya: 'Mengapa trader PROFESIONAL bisa lumpuh di breakout palsu meski arah analisisnya benar sesaat?', opsi: ['Arah benar sesaat otomatis menyelamatkan margin', 'Ukuran posisi terlalu besar + leverage + tanpa rencana keluar saat harga kembali masuk level', 'Profesional tidak pernah rugi', 'Karena kurang membaca berita'], kunci: 1 },
      { tanya: 'Bahan bakar breakout palsu yang terbaca dari data pasar?', opsi: ['Funding positif/panas: posisi searah padat — kerumunan sudah naik kapal saat tembusan', 'Dividen tinggi', 'Volume sepi selalu aman', 'Hari libur bursa'], kunci: 0 },
      { tanya: 'Breakout dengan volume TIPIS — bacaan yang benar?', opsi: ['Semakin tipis semakin sejati', 'Waspada ekstra: tembusan tanpa bahan bakar mudah batal — volume bukti kerelaan', 'Volume tidak relevan', 'Tipis berarti institusi masuk'], kunci: 1 },
      { tanya: 'Retest level yang TAHAN vs breakout yang langsung mundur — mana tanda sejati?', opsi: ['Kembali ke level lalu BERTAHAN (retest tahan) adalah pola breakout sejati; mundur seketika tanpa tahan adalah tanda palsu', 'Retest selalu palsu', 'Keduanya sama saja', 'Tidak ada bedanya'], kunci: 0 },
      { tanya: 'Mengapa stop-loss tepat di level sering gagal melindungi di breakout palsu?', opsi: ['Stop-loss dilarang bursa', 'Balik ke dalam level datang dengan gap/lonjakan — eksekusi jauh lebih buruk dari level; dan likuidasi x5 datang sebelum stop panjang', 'Stop-loss selalu presisi', 'Karena broker lalai'], kunci: 1 },
      { tanya: 'Risiko-reward membeli breakout dengan leverage x5 tanpa rencana keluar?', opsi: ['Simetris sempurna', 'Asimetris buruk: likuidasi −20% bisa datang dalam jam saat tembusan batal; tren sejati butuh waktu tak tentu', 'Selalu untung', 'Reward tak terbatas, risiko nol'], kunci: 1 },
      { tanya: 'Kapan rencana keluar dari posisi breakout HARUS sudah tertulis?', opsi: ['Saat harga sudah melawan', 'Setelah likuidasi', 'Sebelum posisi dibuka — termasuk "kalau kembali masuk level, saya keluar"', 'Tidak perlu rencana'], kunci: 2 },
      { tanya: '"Menambah posisi karena makin tinggi/makin rendah" saat breakout — perangkap apa?', opsi: ['Rata-rata ke arah untung', 'Ukuran tumbuh tepat saat tembusan mungkin batal — likuidasi makin dekat; breakout palsu menagih ukuran yang sudah membesar', 'Margin makin lega', 'Karena fee turun'], kunci: 1 },
      { tanya: 'Puncak ambisi tersentuh (target tercapai) tapi lalu harga kembali masuk level — pelajarannya?', opsi: ['Target tercapai berarti selamat', 'Benar sesaat bukan selamat — tanpa bab keluar tertulis, breakout palsu menagih lunas (Silver 1980, GME 2021)', 'Target cukup dipindah tiap hari', 'Cukup menunggu tanpa rencana'], kunci: 1 },
      { tanya: 'Funding sangat panas (posisi searah padat) saat breakout — sikap bijak?', opsi: ['Tambah ukuran', 'Kecilkan atau keluar — kerumunan panas adalah bahan bakar breakout palsu', 'Gandakan leverage', 'Abaikan saja'], kunci: 1 },
      { tanya: 'Mengapa 48 jam pertama keputusan hidup-mati pembeli breakout?', opsi: ['Sejarah menunjukkan breakout palsu menagih cepat: harga kembali masuk level dan likuidasi x5 datang dalam jam — bukan minggu', '48 jam angka sakral', 'Setelah 48 jam bursa tutup', 'Tidak ada hubungannya'], kunci: 0 },
      { tanya: 'Tanda breakout SEJATI dari data (bukan hafalan)?', opsi: ['Harga bertahan di luar level (tak kembali masuk), volume relatif, dan level lama berubah peran (resistance jadi support)', 'Satu lilin hijau', 'Media bilang begitu', 'Funding negatif'], kunci: 0 },
      { tanya: 'BEDA paling penting antara breakout palsu dan sejati?', opsi: ['Ketahanan di luar level: palsu kembali masuk ke dalam; sejati menetap dan level lama berubah peran — kecepatan tembusan bisa menipu keduanya', 'Warna lilin', 'Nama koinnya', 'Jam berapa menembus'], kunci: 0 },
    ],
  },
]
