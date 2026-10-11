// ============================================================
// KASUS-PUMPSPIKE-SEJARAH (V333) — keluarga SEJARAH ujian
// PUMPSPIKE-3500.
// Mandat pemilik (2026-10-11): "Sekarang ujian 3500 soal ujian
// simulasi dimana kita buat Dan pelajari Dari kasus nyata yakni
// (Pump spike) yang berhasil lumpuhkan jutaan trader di Dunia
// baik tipe short, kemudian tipe long Dan level trader itu
// bahkan professional trader, paham kan silahkan pastikan
// jikalau 3500 belum Lulus semuanya kita buat dia inovasikan
// lagi agar Lulus penuh".
// ------------------------------------------------------------
// 9 kasus (8 kasus dunia + 1 kasus pelajaran profesional), 48 soal.
// CIRI KHAS PUMP SPIKE (beda dari empat jebakan sebelumnya): DUA SISI
// MATI BERSAMA — short yang membidik "spike palsu pasti balik" dilikuidasi
// di jalannya naik; long pemburu-candle yang membeli vertikal dilikuidasi
// saat spike runtuh. Semua fakta dari catatan publik yang luas
// terdokumentasi (puncak, dasar, tanggal, persentase) — nol karangan.
// ============================================================

export const KASUS_PUMPSPIKE_SEJARAH = [
  {
    id: 'GME-2021',
    nama: 'GameStop — Januari 2021: $39 → $483 → −90%; short & long DUA-DUANYA dibantai dalam 2 pekan',
    catatan: '13 Jan 2021 GME ±$39; badai WSB membawanya ke puncak intraday $483,30 (28 Jan 2021, ±+1.100% dalam ±2 pekan); short interest ±140% dari float membuat squeeze bersejarah: short profesional (Melvin Capital −53% Januari, lalu menutup posisi) dilikuidasi di jalannya naik; 28 Jan broker membatasi pembelian — dari puncak $483 harga runtuh ±90% dalam ±1 pekan perdagangan (1 Feb ~$90; awal Feb ~$40-60) — long pemburu puncak ikut musnah; satu peristiwa, dua pemakaman',
    fakta: [
      { tanya: 'Puncak intraday GME pada 28 Januari 2021 di berapa?', opsi: ['±$183', '±$283', '±$483', '±$983'], kunci: 2 },
      { tanya: 'Dari ±$39 (13 Jan) ke ±$483 (28 Jan 2021) — berapa persen naiknya dalam ±2 pekan?', opsi: ['±+110%', '±+1.100%', '±+11.000%', '±+11%'], kunci: 1 },
      { tanya: 'Nasib SHORT profesional di GME (short interest ±140% float)?', opsi: ['Dilikuidasi di jalannya naik — Melvin Capital −53% Januari lalu menutup posisi', 'Untung besar', 'Tidak terpengaruh', 'Ditebus pemerintah'], kunci: 0 },
      { tanya: 'Nasib LONG yang membeli di puncak $483 (28 Jan)?', opsi: ['Harga runtuh ±90% dalam ±1 pekan — pemburu puncak ikut musnah', 'Harga naik lagi ke $1.000', 'Sempat stabil di $483', 'Broker menjamin harga'], kunci: 0 },
    ],
  },
  {
    id: 'VW-2008',
    nama: 'Volkswagen — Okt 2008: €210 → €1.005 dalam ±2 hari; squeeze paling brutal sejarah saham, lalu −70%',
    catatan: '24-26 Okt 2008 VW ordinary ±€210; 28 Okt 2008 Porsche mengumumkan menguasai 74,1% saham (opsi) — free float sempit memicu squeeze paling brutal sejarah pasar saham modern: VW menyentuh ±€1.005 intraday (+~400% dalam ±2 hari) dan sesaat menjadi perusahaan paling bernilai di dunia; para short — termasuk hedge fund profesional; seorang miliarder Jerman dilaporkan rugi ratusan juta euro di short VW — dilikuidasi memaksa di jalan €1.005; setelah disclosure penuh (29-30 Okt) harga anjlok ke ±€300 dalam ±3 hari (−70% dari puncak) — long pemburu puncak juga dibantai',
    fakta: [
      { tanya: 'Puncak intraday VW 28 Oktober 2008 di berapa?', opsi: ['±€405', '±€605', '±€1.005', '±€2.005'], kunci: 2 },
      { tanya: 'Apa pemicu squeeze VW 2008?', opsi: ['Porsche mengumumkan menguasai 74,1% (opsi) — free float sempit, short terjepit', 'Laporan keuangan rugi', 'Bursa tutup', 'Krisis kredit AS'], kunci: 0 },
      { tanya: 'Dari puncak €1.005, ke mana VW dalam ±3 hari setelah disclosure penuh?', opsi: ['Anjlok ke ±€300 (−70% dari puncak) — long pemburu puncak ikut dibantai', 'Naik ke €2.000', 'Tetap di €1.005', 'Bursa membekukan harga'], kunci: 0 },
      { tanya: 'Pelajaran VW-2008 tentang spike yang dipicu struktur pasar?', opsi: ['Spike yang disebabkan free float/konstruksi pasar bisa +400% dalam 2 hari — "mustahil naik segitu" bukan bantalan; dua sisi tanpa rencana keluar musnah dalam sepekan', 'Saham besar tidak bisa spike', 'Squeeze hanya di kripto', 'Regulator menahan harga'], kunci: 0 },
    ],
  },
  {
    id: 'CHF-2015',
    nama: 'Franc Swiss — 15 Januari 2015: lantai SNB dihapus, CHF +±30% dalam MENIT; broker pailit, profesional dilikuidasi',
    catatan: '15 Januari 2015 pukul 10:30 CET, Bank Nasional Swiss menghapus lantai 1,20 EUR/CHF tanpa peringatan; CHF melonjak ±+30% dalam hitungan MENIT (EUR/CHF 1,20 → sesaat di bawah 0,90); posisi ber-leverage melawan CHF lenyap sekejap: broker Alpari UK dinyatakan pailit; FXCM butuh bailout ±$300 juta untuk bertahan; trader profesional & retail yang short CHF dilikuidasi massal dalam menit — stop-loss tak sempat terisi (harga gap melompati level); spike regulasi = spike tanpa kereta rem',
    fakta: [
      { tanya: 'Berapa cepat CHF melonjak saat lantai SNB dihapus (15 Jan 2015)?', opsi: ['±+30% dalam hitungan MENIT', '±+30% dalam setahun', '±+3% dalam sehari', 'Tidak bergerak'], kunci: 0 },
      { tanya: 'Nasib broker yang kena spike CHF 2015?', opsi: ['Alpari UK pailit; FXCM butuh bailout ±$300 juta', 'Semua broker untung', 'Tidak ada dampak', 'Broker menolak klien'], kunci: 0 },
      { tanya: 'Mengapa stop-loss gagal melindungi di spike CHF 2015?', opsi: ['Harga gap melompati level dalam menit — eksekusi stop jauh lebih buruk; likuidasi datang sebelum stop terisi', 'Stop dilarang SNB', 'Broker lupa memasang', 'Stop selalu presisi'], kunci: 0 },
      { tanya: 'Pelajaran CHF-2015 tentang "peristiwa tanpa peringatan"?', opsi: ['Spike regulasi datang tanpa kereta rem — leverage di posisi melawan risiko peristiwa = ukuran yang bisa musnah dalam menit, bukan hari', 'Regulator selalu memberi peringatan', 'CHF tidak pernah bergerak', 'Leverage aman di forex'], kunci: 0 },
    ],
  },
  {
    id: 'FLASH-CRASH-2010',
    nama: 'Flash Crash 6 Mei 2010: DJIA −998 poin dalam menit lalu V-recovery — dua sisi dilukai dalam SATU jam',
    catatan: '6 Mei 2010: DJIA jatuh ±998 poin (±±9%) dalam hitungan menit — penurunan intraday terbesar sepanjang sejarahnya saat itu; ±$1 triliun nilai ekuitas menguap sesaat; beberapa saham tertrade di harga mustahil sesaat (Accenture $0,01; P&G anjlok dua digit persen dalam menit); lalu V-recovery memulihkan mayoritas kerugian dalam ±30-90 menit; DUA SISI dilukai dalam satu jam yang sama: long yang stop-lossnya terisi di dasar (eksekusi $0,01) musnah, dan short yang baru masuk di dasar ditimpa v-reversal; investigasi CFTC/SEC menunjuk layering/spoofing (Navinder Sarao, diadili 2015)',
    fakta: [
      { tanya: 'Berapa jatuh DJIA pada Flash Crash 6 Mei 2010?', opsi: ['±998 poin (±9%) dalam hitungan menit', '±9 poin', '±9% dalam setahun', 'Tidak jatuh'], kunci: 0 },
      { tanya: 'Apa yang terjadi SESUDAH dasar Flash Crash 2010?', opsi: ['V-recovery: mayoritas kerugian pulih dalam ±30-90 menit — short yang masuk di dasar ditimpa', 'Pasar tutup sepekan', 'Bear market 2 tahun', 'Recovery setahun'], kunci: 0 },
      { tanya: 'Contoh eksekusi mustahil saat Flash Crash (long dilukai)?', opsi: ['Accenture tertrade $0,01 sesaat — stop-loss long terisi di harga mustahil', 'Accenture naik 10×', 'Tidak ada eksekusi', 'Semua fill normal'], kunci: 0 },
      { tanya: 'Apa yang ditemukan investigasi CFTC/SEC pasca-Flash-Crash?', opsi: ['Layering/spoofing menyumbang kejatuhan (Navinder Sarao diadili 2015)', 'Tidak ada penyebab', 'Salahnya investor ritel', 'Bursa sengaja'], kunci: 0 },
    ],
  },
  {
    id: 'BTC-2019-04-02',
    nama: 'Bitcoin — 2 April 2019: +$900 dalam ±1 jam (+±17-20%); short ber-leverage dilikuidasi massal seketika',
    catatan: '2 April 2019 sekitar pukul 12:00 UTC: BTC melompat dari ±$4.145 ke ±$4.900-5.000 dalam ±1 jam (+±17-20%) — lilin 1 jam paling keras era 2019; laporan publik menyebut satu order raksasa (±20.000 BTC) menyapu buku pesanan tipis di Bitstamp dengan dugaan spoofing; likuidasi short ber-leverage melimpah lintas bursa dalam jam itu; para short yang "menunggu double-top di $4.200" ditimpa tanpa sempat berpikir; pelajaran: spike memutus likuiditas — jarak $4.145 → $4.900 memutus semua jalan keluar short x5',
    fakta: [
      { tanya: 'Pump spike BTC 2 April 2019: dari ±$4.145 ke mana dalam ±1 jam?', opsi: ['±$4.900-5.000 (+±17-20%)', '±$4.200 (+2%)', '±$9.000', 'Turun ke $3.000'], kunci: 0 },
      { tanya: 'Apa yang dilaporkan memicu pump 2 April 2019?', opsi: ['Order raksasa (±20.000 BTC) menyapu buku pesanan tipis — dugaan spoofing di Bitstamp', 'Bank sentral membeli BTC', 'Halving', 'Tidak ada penyebab'], kunci: 0 },
      { tanya: 'Nasib short ber-leverage di jam pump itu?', opsi: ['Dilikuidasi massal lintas bursa — spike memutus likuiditas dan semua jalan keluar', 'Untung besar', 'Tidak terpengaruh', 'Bursa menahan harga'], kunci: 0 },
    ],
  },
  {
    id: 'SHIB-2021-10',
    nama: 'Shiba Inu — Okt 2021: +±780% dalam ±1 bulan ke ATH $0,00008861, lalu −60%; dua sisi dibantai',
    catatan: 'SHIB dari ±$0,0000100 (27 Sep 2021) meluncur ke ATH ±$0,00008861 (28 Okt 2021, ±+780% dalam ±1 bulan); jalannya naik melikuidasi short berlapis-lapis ("meme tanpa guna pasti balik"); setelah puncak, −60%± dalam ±3-4 pekan (pertengahan Nov ke ±$0,000033) — long pemburu puncak yang FOMO di $0,00008 kehilangan mayoritas nilainya dalam sebulan; dua sisi mati di dua fase peristiwa yang sama',
    fakta: [
      { tanya: 'ATH SHIB pada 28 Oktober 2021 di berapa?', opsi: ['±$0,000008861', '±$0,00008861', '±$0,0008861', '±$0,08861'], kunci: 1 },
      { tanya: 'Kenaikan SHIB dari ±$0,0000100 (27 Sep) ke ATH (28 Okt 2021)?', opsi: ['±+780% dalam ±1 bulan', '±+78%', '±+7.800%', 'Tidak naik'], kunci: 0 },
      { tanya: 'Apa yang terjadi SETELAH puncak SHIB (28 Okt 2021)?', opsi: ['−60%± dalam ±3-4 pekan — long pemburu puncak kehilangan mayoritas nilai', 'Naik 60% lagi', 'Tetap di ATH', 'Bursa menahan'], kunci: 0 },
    ],
  },
  {
    id: 'LUNA-2022-05',
    nama: 'LUNA — Mei 2022: dead-cat spike +ratusan% di tengah runtuh; pemburu-dasar mati ke nol, short pantulan dilikuidasi',
    catatan: '7-13 Mei 2022: LUNA runtuh dari $60+ ke mikro (runtuhnya UST); di tengah kejatuhan, 12-13 Mei terjadi dead-cat spike +ratusan persen dalam hitungan menit dari level mikro — pantulan yang terlihat seperti "dasar pasti"; long pemburu-dasar yang membeli pantulan itu musnah total (harga lanjut ke ±$0,000001 — −99%+ dalam jam-jam); short yang pasang di tengah dead-cat dilikuidasi oleh spike naiknya; ±$40 miliar+ nilai (LUNA+UST) menguap dalam ±1 pekan; satu peristiwa melikuidasi dua sisi BERULANG-ULANG dalam beberapa hari',
    fakta: [
      { tanya: 'Apa itu dead-cat spike LUNA 12-13 Mei 2022?', opsi: ['Pantulan +ratusan persen dalam hitungan menit di tengah runtuh — terlihat seperti dasar, ternyata jebakan', 'Pantulan yang berhasil', 'Kenaikan yang stabil', 'Tidak ada pantulan'], kunci: 0 },
      { tanya: 'Nasib long pemburu-dasar yang membeli dead-cat LUNA?', opsi: ['Musnah total — harga lanjut ke ±$0,000001 (−99%+ dalam jam-jam)', 'Untung 99%', 'Impas', 'Bursa menjamin'], kunci: 0 },
      { tanya: 'Nasib short yang pasang di tengah dead-cat spike LUNA?', opsi: ['Dilikuidasi oleh lonjakan naiknya — spike pantulan membakar short baru', 'Untung besar', 'Tidak terpengaruh', 'Short dilarang'], kunci: 0 },
      { tanya: 'Berapa nilai yang menguap pada runtuh LUNA+UST Mei 2022?', opsi: ['±$40 miliar+ dalam ±1 pekan', '±$40 juta', '±$4 miliar', 'Tidak ada nilai hilang'], kunci: 0 },
    ],
  },
  {
    id: 'BTC-2017-12-17',
    nama: 'Bitcoin — 17 Des 2017: puncak ±$19.800; short Desember dilikuidasi berulang, pemburu puncak −40% dalam 5 hari',
    catatan: 'BTC dari ±$10.000 (29 Nov 2017) meluncur ke puncak ±$19.800 (17 Des 2017, hari peluncuran CME futures) — +±100% dalam ±2,5 pekan; jalannya melikuidasi short berulang-ulang (para short "double top sejak $11.000" dilikuidasi bertahap); SEJAK HARI PUNCAK yang sama, jatuh ke ±$11.200 (22 Des — −40%+ dari puncak dalam ±5 hari) membantai long pemburu puncak yang masuk saat mania (termasuk posisi futures CME hari pertama); satu peristiwa, dua fase pemakaman — inilah anatomi pump spike yang sempurna',
    fakta: [
      { tanya: 'Puncak BTC 17 Desember 2017 (hari peluncuran CME futures) di berapa?', opsi: ['±$9.800', '±$19.800', '±$29.800', '±$69.000'], kunci: 1 },
      { tanya: 'Nasib short yang "menunggu double top sejak $11.000" di Desember 2017?', opsi: ['Dilikuidasi berulang-ulang sepanjang jalannya $10.000 → $19.800', 'Untung konsisten', 'Tidak ada short', 'Bursa menolak'], kunci: 0 },
      { tanya: 'Nasib long yang membeli di puncak ±$19.800 (17 Des)?', opsi: ['Jatuh ke ±$11.200 dalam ±5 hari (−40%+) — pemburu puncak dibantai sejak hari pertama', 'Naik ke $40.000 sepekan', 'Tetap stabil', 'CME menjamin harga'], kunci: 0 },
    ],
  },
  {
    id: 'PELAJARAN-PUMPSPIKE',
    nama: 'Pelajaran Profesional — intisari semua kasus pump spike yang melikuidasi DUA sisi',
    catatan: 'aturan hidup-mati yang diambil dari delapan kasus dunia di atas — inilah mengapa pump spike melumpuhkan jutaan trader DUA SISI (short di jalan naik, long di jalan runtuh), termasuk para profesional',
    fakta: [
      { tanya: 'Mengapa pump spike memikat DUA sisi sekaligus?', opsi: ['Vertikal terlihat seperti dua cerita sekaligus: "pasti balik" bagi short dan "pasti lanjut" bagi long — kedua cerita terlihat benar di kartu, kenyataan menagih keduanya', 'Hanya long yang tertarik', 'Hanya short yang tertarik', 'Spike tidak menarik siapa pun'], kunci: 0 },
      { tanya: 'Sisi pertama yang mati di GME/VW/BTC-2017 saat naik?', opsi: ['SHORT — dilikuidasi di jalannya naik, sering jauh SEBELUM puncak', 'Long', 'Tidak ada', 'Bursa'], kunci: 0 },
      { tanya: 'Sisi yang mati setelah puncak (GME $483, VW €1.005, SHIB ATH, BTC $19.800)?', opsi: ['LONG pemburu-puncak/FOMO — runtuhnya −60% sampai −90% datang jauh lebih cepat dari naiknya', 'Short', 'Tidak ada', 'Market maker'], kunci: 0 },
      { tanya: 'Kesalahan fatal profesional di pump spike?', opsi: ['Ukuran besar + leverage + tanpa rencana keluar di pasar yang likuiditasnya sempit saat spike — cerita "pasti balik"/"pasti lanjut" dijawab kenyataan dengan likuidasi', 'Mereka salah baca kalender', 'Mereka tidak pakai RSI', 'Mereka pakai margin rendah'], kunci: 0 },
      { tanya: 'Apa itu dead-cat bounce (LUNA Mei 2022)?', opsi: ['Pantulan +ratusan% di tengah runtuh — memancing pemburu-dasar, lalu lanjut ke nol; dua sisi lagi yang mati: long pantulan & short spike', 'Pantulan yang sehat', 'Dasar yang terbukti', 'Nama indikator'], kunci: 0 },
      { tanya: 'Apa itu V-reversal (Flash Crash 2010)?', opsi: ['Jatuh keras lalu pulih nyaris penuh dalam menit-jam — melukai dua sisi: stop long terisi di dasar, short baru ditimpa', 'Naik terus', 'Turun terus', 'Saham batal'], kunci: 0 },
      { tanya: 'Mengapa stop-loss sering gagal di pump spike (CHF 2015)?', opsi: ['Harga gap/lompat melampaui level dalam menit — eksekusi stop jauh lebih buruk dari level; likuidasi datang sebelum stop terisi', 'Stop dilarang', 'Stop selalu presisi', 'Broker lalai selalu'], kunci: 0 },
      { tanya: 'Bahaya buku pesanan tipis saat spike?', opsi: ['Likuiditas menguap tepat saat dibutuhkan — jarak harga memutus jalan keluar; satu order raksasa bisa +17% dalam 1 jam (BTC 2019)', 'Buku tipis lebih aman', 'Tidak ada hubungan', 'Spread mengecil saat spike'], kunci: 0 },
      { tanya: 'Mengapa "sudah naik 300% pasti turun" bukan premis (VW +400% dalam 2 hari)?', opsi: ['Spike bisa menambah ratusan persen lagi dalam JAM — kenaikan lampau bukan batas; yang melindungi adalah premis keluar tertulis, bukan angka asal', '300% mustahil', 'Regulator menahan', 'Karena naik selalu aman'], kunci: 0 },
      { tanya: 'Mengapa "spike = pasti palsu" juga bukan premis (BTC 2019 lanjut berbulan-bulan)?', opsi: ['Spike bisa jadi awal tren nyata — short spike tanpa premis keluar dilikuidasi di jalan naiknya, terlepas dari tesis', 'Semua spike palsu', 'Spike selalu balik dalam 1 jam', 'Short selalu aman'], kunci: 0 },
      { tanya: 'Fungsi wick atas panjang di puncak spike?', opsi: ['Tanda penolakan: pembeli vertikal mulai kalah — spike yang tertutup jauh di bawah puncaknya lebih sering mati; tapi bukan jaminan — tetap butuh premis keluar', 'Tidak bermakna', 'Tanda pasti naik', 'Hanya di forex'], kunci: 0 },
      { tanya: 'Mengapa 48 jam pertama memutuskan hidup-mati posisi di pump spike?', opsi: ['Kasus menunjukkan likuidasi dua sisi terjadi dalam JAM-JAM sejak spike (CHF: menit; BTC-2019: 1 jam; GME: hari) — bukan minggu; x5 tanpa bab keluar mati di jendela itu', '48 jam angka sakral', 'Setelah 48 jam pasar tutup', 'Tidak ada hubungan'], kunci: 0 },
      { tanya: 'Risiko-reward posisi x5 mengejar pump spike?', opsi: ['Asimetris buruk: −20% datang dalam menit-jam saat spike mati (dan naiknya juga +20% dalam jam saat spike hidup); dua arah ambang sama-sama bisa tersentuh dalam satu hari', 'Simetris sempurna', 'Selalu untung', 'Risiko nol'], kunci: 0 },
      { tanya: 'Sikap yang BENAR saat spike vertikal terjadi?', opsi: ['Ukuran terjaga + premis keluar tertulis SEBELUM entry (naik ke mana keluar, turun ke mana keluar) ATAU diam di pinggir — bukan mengejar vertikal dengan leverage penuh', 'Leverage maksimal', 'Menambah tiap naik 10%', 'Menambah tiap turun 10%'], kunci: 0 },
      { tanya: 'Mengapa spike sering terjadi di free float sempit / likuiditas tipis?', opsi: ['Konstruksi pasar memperbesar gerakan: VW 74,1% terkunci; koin meme tipis — harga tak perlu banyak pembeli untuk +400%; ini mempercepat likuidasi dua sisi', 'Free float menstabilkan harga', 'Tidak ada hubungan', 'Semua pasar sama likuidnya'], kunci: 0 },
      { tanya: 'Pola urutan yang SAMA di GME, VW, SHIB, BTC-2017?', opsi: ['Likuidasi SHORT di jalan naik → puncak → likuidasi LONG pemburu-puncak di jalan runtuh — dua pemakaman, satu peristiwa', 'Hanya short yang mati', 'Hanya long yang mati', 'Tidak ada pola'], kunci: 0 },
      { tanya: 'Pelajaran khusus dead-cat (LUNA): "sudah turun 99% tidak mungkin turun lagi"?', opsi: ['Bisa turun 99% LAGI dari pantulannya — dasar-telah-dicoba bukan bantalan; pantulan mikro mematikan pemburu-dasar ber-leverage', '−99% adalah dasar pasti', 'Harga tidak bisa −99% dua kali', 'Pemburu-dasar selalu untung'], kunci: 0 },
      { tanya: 'Mengapa regulator/berita bisa jadi pemicu spike tanpa kereta rem (CHF 2015)?', opsi: ['Keputusan satu institusi mengubah konstruksi pasar seketika — semua posisi melawan arus baru dinilai ulang dalam menit; leverage kecil sekalipun bisa habis', 'Regulator selalu mengumumkan bertahap', 'Forex tak berisiko', 'Berita tidak berpengaruh'], kunci: 0 },
      { tanya: 'Intisari tertulis dari semua kasus pump spike untuk makhluk yang belajar?', opsi: ['Jangan menjawab cerita telanjang ("pasti balik"/"pasti lanjut"); baca LIKUIDITAS, WICK/ketahanan di atas puncak, ukuran posisi, leverage, dan rencana keluar dua arah — itulah yang memisahkan selamat dari dua pemakaman', 'Semua spike pasti balik', 'Semua spike pasti lanjut', 'Cukup menebak dari nama koin'], kunci: 0 },
    ],
  },
]
