// ============================================================
// KASUS-SUCKER-SEJARAH (V326) — keluarga SEJARAH ujian SUCKER-3500.
// Mandat pemilik (2026-10-10): "ujian 3500 soal ... kita buat Dan
// pelajari Dari kasus nyata yakni Sucker's rally yang berhasil
// lumpuhkan jutaan trader di Dunia Dan level trader itu bahkan
// professional trader".
// ------------------------------------------------------------
// 9 kasus (8 kasus dunia + 1 kasus pelajaran profesional), 48 soal.
// SEMUA fakta dari catatan publik yang luas terdokumentasi (puncak,
// dasar, tanggal, persentase) — nol karangan; opsi salah dibuat masuk
// akal agar soal tidak bisa ditebak dari bentuk.
// Keluarga ini menguji INGATAN kasus dunia: rally muda dalam tren
// turun terlihat persis seperti pulih sejati — para profesional tidak
// mati karena salah baca lonjakan, melainkan karena ukuran posisi,
// leverage, dan tidak punya rencana keluar saat dasar bocor.
// ============================================================

export const KASUS_SUCKER_SEJARAH = [
  {
    id: 'DJ-1930',
    nama: 'Dow Jones — rally pulih 1930 (paling maut sepanjang sejarah)',
    catatan: 'rally +48% dari dasar Nov 1929 membuat dunia yakin krisis selesai; para profesional beli "pulih"; lalu Dow jatuh -86% lagi — jebakan yang menagih empat tahun',
    fakta: [
      { tanya: 'Dow Jones ditutup di berapa pada puncak 3 September 1929 sebelum crash?', opsi: ['281,17', '381,17', '481,17', '581,17'], kunci: 1 },
      { tanya: 'Dasar crash 13 November 1929 — Dow ditutup di berapa (turun ±48%)?', opsi: ['198,60', '298,60', '98,60', '338,60'], kunci: 0 },
      { tanya: 'Dari puncak rally 1930 (294,07, 17 April) ke dasar 8 Juli 1932 (41,22) — Dow kehilangan berapa persen?', opsi: ['-46%', '-66%', '-86%', '-96%'], kunci: 2 },
      { tanya: 'Rally Nov 1929→Apr 1930 (+48%) membuat banyak orang yakin krisis selesai — total penurunan Dow dari puncak 1929 ke dasar 1932 mencapai berapa?', opsi: ['±-49%', '±-69%', '±-89%', '±-29%'], kunci: 2 },
    ],
  },
  {
    id: 'NASDAQ-2000',
    nama: 'Nasdaq — rally dalam gelembung dot-com pecah, 2000',
    catatan: 'setelah -37% dari puncak Maret 2000, rally +35% (Mei→Juli) membuat semua yakin "dasar sudah lewat"; profesional beli "pulih" — Nasdaq masih jatuh -78% pada 2002',
    fakta: [
      { tanya: 'Puncak gelembung dot-com: Nasdaq ditutup di berapa pada 10 Maret 2000 (intraday 5.132,52)?', opsi: ['2.548,62', '5.048,62', '7.048,62', '4.048,62'], kunci: 1 },
      { tanya: 'Dari dasar 3.164,55 (23 Mei 2000), Nasdaq melonjak ke 4.274,67 (17 Juli 2000) — berapa persen rally itu?', opsi: ['+15%', '+35%', '+75%', '+135%'], kunci: 1 },
      { tanya: 'Dasar akhir pasar beruang dot-com: Nasdaq ditutup di berapa pada 9 Oktober 2002?', opsi: ['2.114,11', '1.114,11 (±-78% dari puncak)', '3.114,11', '5.114,11'], kunci: 1 },
    ],
  },
  {
    id: 'SPX-2008',
    nama: 'S&P 500 — rally "tahun baru" 2008-2009',
    catatan: 'krisis Lehman; rally +26% dari dasar November membuat semua yakin masalah selesai di awal 2009; lalu -27% lagi dalam dua bulan — rally terbaik adalah yang mengelabui',
    fakta: [
      { tanya: 'Peristiwa apa yang menghantam dunia keuangan pada 15 September 2008?', opsi: ['Lehman Brothers mengajukan kebangkrutan', 'FTX bangkrut', 'Minyak negatif', 'Lockdown COVID'], kunci: 0 },
      { tanya: 'Dari dasar 741,02 (21 November 2008), S&P 500 melonjak ke 931,80 (2 Januari 2009) — berapa persen rally "tahun baru" itu?', opsi: ['+6%', '+26%', '+56%', '+86%'], kunci: 1 },
      { tanya: 'Setelah rally itu batal, S&P 500 jatuh ke dasar berapa pada 9 Maret 2009 (total ±-57% dari puncak Okt 2007)?', opsi: ['876,53', '676,53', '476,53', '276,53'], kunci: 1 },
    ],
  },
  {
    id: 'BTC-2018',
    nama: 'Bitcoin — rally pasar beruang 2018',
    catatan: 'setelah -70% dari ATH, dua rally besar (Feb-Mar +99%) membuat semua yakin bear market selesai; "support $6.000" dijaga berminggu-minggu; lalu semuanya batal — dasar ~$3.100',
    fakta: [
      { tanya: 'Rally Feb-Mar 2018: dari dasar ±$5.900 (6 Februari) ke puncak rally ±$11.700 (5 Maret) — berapa persen?', opsi: ['+20%', '+50%', '+99%', '+300%'], kunci: 2 },
      { tanya: 'Rally itu batal: 18 Maret 2018 Bitcoin balik ke berapa?', opsi: ['±$6.700', '±$9.000', '±$11.000', '±$14.000'], kunci: 0 },
      { tanya: '"Support $6.000" pecah November 2018 — dasar akhir pasar beruang 2018 di berapa (Desember)?', opsi: ['±$3.100', '±$5.000', '±$7.000', '±$10.000'], kunci: 0 },
    ],
  },
  {
    id: 'COVID-2020',
    nama: 'COVID-19 — bounces Maret 2020, jebakan tercepat zaman modern',
    catatan: 'lonjakan optimisme awal Maret 2020 membuat semua beli "pulih V"; lalu empat circuit breaker dalam dua minggu dan -34%; Black Thursday BTC -50% sehari; minyak jadi negatif — paling kejam',
    fakta: [
      { tanya: 'Berapa kali circuit breaker level-1 S&P 500 tersulut dalam dua minggu Maret 2020?', opsi: ['1 kali', '2 kali', '4 kali (9, 12, 16, 18 Maret)', '0 kali'], kunci: 2 },
      { tanya: 'S&P 500 turun berapa persen dari puncak 19 Februari 2020 (3.386,15) ke dasar 23 Maret 2020 (2.191,86)?', opsi: ['-12%', '-25%', '-34%', '-57%'], kunci: 2 },
      { tanya: 'Pada 20 April 2020, kontrak minyak WTI melakukan apa untuk pertama kalinya sepanjang sejarah?', opsi: ['Settle positif rekor', 'Settle NEGATIF −$37,63', 'Dihentikan permanen', 'Naik +$37,63'], kunci: 1 },
      { tanya: '12 Maret 2020 "Black Thursday" kripto: BTC turun dari ±$7.900 ke ±$3.800 — berapa persen dalam hitungan hari?', opsi: ['±-15%', '±-30%', '±-50%', '±-80%'], kunci: 2 },
    ],
  },
  {
    id: 'LUNA-2022',
    nama: 'Terra/LUNA — lonjakan di dalam death spiral, Mei 2022',
    catatan: 'UST kehilangan peg; LUNA dari ~$80 ke di bawah $0,001 dalam satu minggu; lonjakan +50-300% sekejap DI DALAM spiral menjerat para pembeli "jumpa dasar" — ~$40-60 miliar menguap',
    fakta: [
      { tanya: 'Saat Terra/LUNA runtuh (Mei 2022), LUNA jatuh dari ~$80 ke di bawah $0,001 dalam satu minggu — berapa kira-kira nilai kekayaan yang menguap?', opsi: ['~$4-6 miliar', '~$40-60 miliar', '~$400 miliar', 'Tidak ada yang rugi'], kunci: 1 },
    ],
  },
  {
    id: 'FTX-2022',
    nama: 'FTX — "stabilitas" palsu November 2022',
    catatan: 'BTC "stabil" $20-21k sementara FTX rapuh di dalam; Binance mundur dari akuisisi (9 Nov) dan semuanya runtuh -26% dalam 3 hari; stabilitas di dalam risiko tersembunyi bukan kekuatan',
    fakta: [
      { tanya: 'BTC "stabil" di $20-21.000 awal November 2022; setelah Binance membatalkan akuisisi FTX (9 November), BTC runtuh ke berapa pada 10 November 2022?', opsi: ['±$21.000', '±$19.000', '±$15.500', '±$10.000'], kunci: 2 },
    ],
  },
  {
    id: 'NIKKEI-1990',
    nama: 'Nikkei — tiga dekade rally-rally palsu Jepang',
    catatan: 'puncak 38.915,87 (29 Des 1989); rally +51% tahun 1990 gagal lalu -40% lagi; setiap rally tiga dekade adalah jebakan — pulih penuh baru terjadi Februari 2024 (34 tahun)',
    fakta: [
      { tanya: 'Nikkei mencapai puncak 38.915,87 pada 29 Desember 1989 — berapa lama sampai akhirnya memulihkan puncak itu?', opsi: ['±4 tahun', '±12 tahun', '±34 tahun (Februari 2024)', 'Belum pernah pulih'], kunci: 2 },
    ],
  },
  {
    id: 'PELAJARAN-SUCKER',
    nama: 'Pelajaran Profesional — intisari semua kasus jebakan',
    catatan: 'aturan hidup-mati yang diambil dari kelapan kasus di atas — inilah mengapa rally muda dalam tren turun bisa melumpuhkan bahkan para profesional',
    fakta: [
      { tanya: 'Mengapa rally dalam tren turun (sucker rally) memikat bahkan trader profesional?', opsi: ['Terlihat persis seperti pulih sejati: harga naik dari dasar, volume meledak, media teriak "bottom is in"', 'Profesional tidak pernah terjerat', 'Rally dalam tren turun selalu aman', 'Karena berita buruk sudah selesai'], kunci: 0 },
      { tanya: 'Ciri dari DATA pasar yang mengkonfirmasi jebakan banteng (bull trap)?', opsi: ['Volume terus naik', 'Harga menembus ke bawah dasar rally — rally batal', 'RSI di atas 80', 'Funding negatif'], kunci: 1 },
      { tanya: '"Dead cat bounce" artinya?', opsi: ['Pulih permanen', 'Lonjakan sesaat dalam tren turun yang gagal bertahan — bukan tanda pulih', 'Indeks menghentikan perdagangan', 'Pump terjadwal'], kunci: 1 },
      { tanya: 'Mengapa teriakan "bottom is in" dari media berbahaya?', opsi: ['Media selalu salah', 'Nyaring justru di puncak rally muda — kerumunan tiba paling akhir, jadi bahan bakar jebakan', 'Media punya data rahasia', 'Tidak berbahaya sama sekali'], kunci: 1 },
      { tanya: 'Kasus 1930: rally +48% membuat semua yakin krisis selesai — lalu apa yang terjadi?', opsi: ['Krisis selesai tepat waktu', 'Dow jatuh −86% lagi dari puncak rally (total ±−89% dari 1929)', 'Dow mendatar satu tahun lalu naik', 'Pemerintah menjamin Dow'], kunci: 1 },
      { tanya: 'Kasus Nasdaq 2000: rally +35% (Mei→Juli) — pelajarannya?', opsi: ['Rally dalam pasar beruang bukan pulih — Nasdaq masih jatuh −78% pada 2002', 'Rally besar selalu pulih', 'Tahun 2000 tidak terjadi apa-apa', 'Dasar pasti sudah tercapai saat itu'], kunci: 0 },
      { tanya: 'Kasus 2008: rally +26% "tahun baru" (Nov 2008→2 Jan 2009) — lalu?', opsi: ['Pulih permanen', 'S&P 500 jatuh −27% lagi ke 676,53 (9 Maret 2009)', 'Naik dua kali lipat', 'Perdagangan dihentikan'], kunci: 1 },
      { tanya: 'Kasus COVID: empat circuit breaker dan −34% — pelajaran dari optimisme tiga hari awal Maret 2020?', opsi: ['Optimisme awal bukan bukti dasar tahan — jebakan menagih dalam hitungan hari', 'COVID tidak mengajarkan apa-apa', 'Circuit breaker membuat harga aman', 'Dasar selalu 2.191,86'], kunci: 0 },
      { tanya: 'Kasus BTC 2018: rally +99% (Feb→Mar) — lalu?', opsi: ['Terus naik tanpa henti', 'Balik ke ±$6.700 dalam dua minggu; "support $6.000" pecah November, dasar ±$3.100', 'Mendatar selamanya', 'Naik sepuluh kali lipat'], kunci: 1 },
      { tanya: 'Kasus LUNA Mei 2022: lonjakan +50–300% sekejap DI DALAM death spiral — siapa yang terjerat?', opsi: ['Pembeli "jumpa dasar" di dalam spiral — rugi total saat spiral berlanjut', 'Tidak ada yang terjerat', 'Hanya short seller', 'Bursa saja'], kunci: 0 },
      { tanya: 'Kasus FTX: BTC "stabil" $20–21k awal November 2022 — pelajaran?', opsi: ['Stabilitas di dalam risiko yang belum terlihat bukan kekuatan — runtuh −26% dalam 3 hari', 'Stabil berarti aman', 'FTX tidak berpengaruh', 'Binance menjamin BTC'], kunci: 0 },
      { tanya: 'Kasus Nikkei: tiga dekade penuh rally yang gagal — mengapa "murah" bukan jaminan?', opsi: ['Murah-terhadap-kemarin bukan dasar-akan-tahan — Nikkei terlihat "murah" selama tiga dekade sebelum pulih', 'Murah pasti naik', 'Pasti naik besok', 'Turun 60% tidak mungkin'], kunci: 0 },
      { tanya: 'Mengapa trader PROFESIONAL bisa lumpuh di sucker rally meski arah analisisnya benar?', opsi: ['Arah benar otomatis menyelamatkan margin', 'Ukuran posisi terlalu besar + leverage + tanpa rencana keluar saat dasar bocor', 'Profesional tidak pernah likuid', 'Karena kurang membaca berita'], kunci: 1 },
      { tanya: 'Bahan bakar rally muda yang terbaca dari data pasar?', opsi: ['Funding positif/panas: posisi long padat membayar posisi short — kerumunan sudah naik kapal', 'Dividen tinggi', 'Volume sepi', 'Hari libur bursa'], kunci: 0 },
      { tanya: 'Funding sangat panas (longs padat) saat rally muda dalam tren turun — sikap bijak seorang pembeli?', opsi: ['Tambah ukuran', 'Kecilkan atau keluar — kerumunan panas adalah bahan bakar jebakan', 'Gandakan leverage', 'Abaikan saja'], kunci: 1 },
      { tanya: 'Risiko-reward long x5 di rally muda dalam tren turun?', opsi: ['Simetris sempurna', 'Asimetris buruk: likuidasi −20% bisa datang dalam jam; pulih nyata butuh waktu tak tentu', 'Selalu untung', 'Reward tak terbatas, risiko nol'], kunci: 1 },
      { tanya: 'Kapan rencana keluar dari posisi long HARUS sudah tertulis?', opsi: ['Saat harga sudah melawan', 'Setelah likuidasi', 'Sebelum posisi dibuka', 'Tidak perlu rencana'], kunci: 2 },
      { tanya: 'Mengapa stop-loss di bawah "dasar yang pasti tahan" sering gagal melindungi?', opsi: ['Stop-loss dilarang bursa', 'Kebocoran dasar datang dengan gap/lompatan — eksekusi jauh lebih buruk dari level', 'Stop-loss selalu presisi', 'Karena broker lalai'], kunci: 1 },
      { tanya: '"Dasar pecah" sebagai konfirmasi jebakan — artinya?', opsi: ['Harga tutup di bawah low dasar rally — semua yang membeli rally tenggelam di bawah air', 'Harga naik di atas dasar', 'Volume habis', 'Bursa tutup'], kunci: 0 },
      { tanya: 'Mengapa menambah long (averaging) saat "makin murah" dalam tren turun jadi perangkap?', opsi: ['Rata-rata selalu aman', 'Ukuran tumbuh tepat saat risiko tumbuh — likuidasi makin dekat', 'Margin makin lega', 'Karena fee turun'], kunci: 1 },
      { tanya: 'Puncak ambisi tercapai (target tersentuh) tapi lalu harga pecah dasar — pelajarannya?', opsi: ['Target tercapai berarti selamat', 'Benar sesaat bukan selamat — tanpa bab keluar tertulis, jebakan menagih lunas', 'Target cukup dipindah tiap hari', 'Cukup menunggu tanpa rencana'], kunci: 1 },
      { tanya: 'Rally +6% sehari dengan volume 1,5× dalam tren turun — bacaan yang benar?', opsi: ['Pasti pulih', 'Ujian sesungguhnya bukan kekuatan lonjakan, tapi ketahanan dasar — lonjakan bisa menipu', 'Pasti jebakan', 'Volume tidak relevan'], kunci: 1 },
      { tanya: 'Kapan rally muda menjadi pulih NYATA?', opsi: ['Saat dasar rally bertahan dan harga menembus ke atas puncak sebelumnya — bukan dari volume sehari', 'Setelah satu lilin hijau', 'Saat media bilang begitu', 'Saat funding negatif'], kunci: 0 },
      { tanya: 'Mengapa 48 jam pertama keputusan hidup-mati pembeli rally?', opsi: ['Sejarah menunjukkan jebakan menagih cepat: likuidasi x5 datang dalam jam, bukan minggu', '48 jam angka sakral', 'Setelah 48 jam bursa tutup', 'Tidak ada hubungannya'], kunci: 0 },
      { tanya: 'Siapa yang mati lebih dulu di jebakan: ukuran besar "yakin dasar tahan", atau kecil dengan rencana tertulis?', opsi: ['Besar dan yakin', 'Kecil dan tertulis', 'Sama saja', 'Tidak ada yang mati'], kunci: 0 },
      { tanya: 'Mengapa peta pelajaran (tanda 40 bit → kelas) lebih andal daripada ingatan kisah?', opsi: ['Karena lebih panjang', 'Matematika biner tidak kabur — tanda dicocokkan deterministik (warisan ingatan-biner)', 'Karena kisah membosankan', 'Tidak ada bedanya'], kunci: 1 },
      { tanya: 'Ringkasan semua kasus: kematian pembeli rally selalu beririsan dengan?', opsi: ['Rally muda dalam tren turun + kerumunan panas + ukuran/leverage tanpa rencana keluar', 'Kurang membaca chart hijau', 'Hari Senin pagi', 'Keberuntungan semata'], kunci: 0 },
      { tanya: 'BEDA paling penting antara jebakan dan pulih sejati?', opsi: ['Ketahanan dasar: jebakan membocorkan dasar; pulih menjaganya — kekuatan lonjakan bisa menipu keduanya', 'Warna lilin', 'Nama koinnya', 'Jam berapa naik'], kunci: 0 },
    ],
  },
]
