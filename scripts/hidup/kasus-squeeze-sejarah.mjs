// ============================================================
// KASUS-SQUEEZE-SEJARAH (V325) — keluarga SEJARAH ujian SQUEEZE-3500.
// Mandat pemilik (2026-10-10): "ujian 3500 soal ... kita buat Dan
// pelajari Dari kasus nyata yakni shorts squeeze yang berhasil
// lumpuhkan jutaan trader di Dunia Dan level trader itu bahkan
// professional trader".
// ------------------------------------------------------------
// 9 kasus (8 kasus dunia + 1 kasus pelajaran profesional), 48 soal.
// SEMUA fakta dari catatan publik yang luas terdokumentasi (harga
// puncak, tanggal, persentase, nasib fund) — nol karangan; opsi salah
// dibuat masuk akal agar soal tidak bisa ditebak dari bentuk.
// Keluarga ini menguji INGATAN kasus dunia: para profesional tidak
// mati karena salah arah, melainkan karena ukuran posisi, leverage,
// dan tidak punya rencana keluar — pelajaran inti seluruh ujian.
// ============================================================

export const KASUS_SEJARAH = [
  {
    id: 'GME-2021',
    nama: 'GameStop — Januari 2021',
    catatan: 'short interest ~140% float; jutaan akun retail membeli serentak; fund profesional Melvin Capital lumpuh — kasus squeeze paling terdokumentasi sedunia',
    fakta: [
      { tanya: 'Puncak intrahari GameStop pada 28 Januari 2021 mencapai berapa?', opsi: ['$193,00', '$347,89', '$483,00', '$913,00'], kunci: 2 },
      { tanya: 'Melvin Capital — fund profesional yang short GME — rugi berapa persen pada Januari 2021 saja?', opsi: ['-13%', '-30%', '-53%', '-90%'], kunci: 2 },
      { tanya: 'Kisaran short interest GME pertengahan Januari 2021 terhadap float?', opsi: ['~140%', '~60%', '~20%', '~400%'], kunci: 0 },
      { tanya: 'Kenaikan harga GME dari 12 ke 27 Januari 2021 (tutup-ke-tutup) kira-kira berapa?', opsi: ['+17%', '+170%', '+17.000%', '+1.700%'], kunci: 3 },
      { tanya: 'Apa nasib akhir Melvin Capital?', opsi: ['Ditutup dan mengembalikan dana investor pada 2022', 'Masih hidup jaya', 'Untung besar kembali pada 2022', 'Diambil alih oleh GameStop'], kunci: 0 },
      { tanya: 'Estimasi kerugian gabungan short seller di GME sepanjang Januari 2021?', opsi: ['~$19-20 juta', '~$19-20 miliar', '~$190 miliar', 'Justru untung besar'], kunci: 1 },
    ],
  },
  {
    id: 'VW-2008',
    nama: 'Volkswagen — Oktober 2008',
    catatan: 'Porsche mengumumkan menguasai 42,6% + opsi kal 31,5%; float bebas tinggal ~5-6%; VW sesaat menjadi perusahaan termahal dunia; salah satu squeeze terbesar sepanjang sejarah',
    fakta: [
      { tanya: 'Kapan Porsche mengumumkan menguasai 42,6% saham VW ditambah opsi kal 31,5%?', opsi: ['26 Oktober 2008 (hari Minggu)', '1 April 2008', '28 Oktober 2008 (saat pasar buka)', '31 Desember 2008'], kunci: 0 },
      { tanya: 'Puncak intrahari VW pada 28 Oktober 2008 mencapai berapa?', opsi: ['€210,85', '€520,00', '€1.005,09', '€2.010,00'], kunci: 2 },
      { tanya: 'Pada puncak squeeze itu, VW sesaat menjadi apa?', opsi: ['Perusahaan dengan kapitalisasi terbesar di dunia', 'Perusahaan yang bangkrut', 'Saham yang didelisting', 'Perusahaan milik negara sepenuhnya'], kunci: 0 },
      { tanya: 'Dengan Porsche 42,6% + opsi 31,5% dan Sachsen Hilir 20,2% (beku), float bebas VW saat itu tinggal berapa?', opsi: ['~60%', '~40%', '~20%', '~5-6%'], kunci: 3 },
      { tanya: 'Estimasi kerugian para short seller di kasus VW 2008 menurut media waktu itu?', opsi: ['€10-30 miliar (belasan sampai puluhan miliar euro)', '€10-30 juta', 'Tak ada yang rugi', 'VW yang rugi'], kunci: 0 },
    ],
  },
  {
    id: 'TSLA-2020',
    nama: 'Tesla — 2020',
    catatan: 'saham paling banyak di-short dunia pada 2020; tahun terburuk sepanjang sejarah bagi short seller pada satu saham',
    fakta: [
      { tanya: 'Kerugian short seller saham Tesla sepanjang 2020 (data S3 Partners) — terburuk bagi satu saham sepanjang sejarah?', opsi: ['~$3,8 miliar', '~$38 miliar', '~$380 miliar', '~$3,8 triliun'], kunci: 1 },
      { tanya: 'Kenaikan harga TSLA sepanjang tahun 2020 kira-kira berapa?', opsi: ['+74%', '+174%', '+743%', '+7.400%'], kunci: 2 },
    ],
  },
  {
    id: 'AMC-2021',
    nama: 'AMC Entertainment — 2021',
    catatan: 'gelombang kedua squeeze retail setelah GME; biografi dari nyaris bangkrut ke puncak parabolik dalam 4 bulan',
    fakta: [
      { tanya: 'AMC: dari ~$2 pada Januari 2021 ke puncak intrahari 2 Juni 2021 mencapai berapa?', opsi: ['$7,26', '$27,62', '$72,62', '$726,20'], kunci: 2 },
    ],
  },
  {
    id: 'HRTZ-2020',
    nama: 'Hertz — Mei-Juni 2020',
    catatan: 'saham naik ~890% TEPAT SAAT perusahaannya mengajukan kebangkrutan — bukti squeeze tak peduli fundamental',
    fakta: [
      { tanya: 'Hertz melonjak dari $0,56 ke $5,53 intrahari (+~890%) pada Mei-Juni 2020 dalam kondisi apa?', opsi: ['Laba rekor', 'Baru melakukan IPO', 'Sedang mengajukan kebangkrutan (Chapter 11)', 'Diakuisisi Tesla'], kunci: 2 },
      { tanya: 'Pelajaran paling tajam dari kasus Hertz?', opsi: ['Harga selalu mengikuti fundamental', 'Squeeze bisa berjalan terlepas dari kebangkrutan — aliran dan tekanan beli menang sementara', 'Saham bangkrut selalu naik', 'Bank sentral menjamin saham'], kunci: 1 },
    ],
  },
  {
    id: 'KBIO-2015',
    nama: 'KaloBios — November 2015',
    catatan: 'kabar pengambilalihan memicu lompatan ~800% dalam SEHARI — likuidasi short terjadi dalam hitungan jam',
    fakta: [
      { tanya: 'KaloBios pada 20 November 2015 melonjak berapa dalam sehari setelah kabar Martin Shkreli mengambil kendali?', opsi: ['~8%', '~80%', '~800%', '~8.000%'], kunci: 2 },
    ],
  },
  {
    id: 'HLF-2013',
    nama: 'Herbalife vs Ackman — 2012-2018',
    catatan: 'profesional paling terkena: riset panjang, keyakinan penuh, tetap dikoyak waktu — lima tahun perang',
    fakta: [
      { tanya: 'Bill Ackman (profesional) membuka short Herbalife senilai $1 miliar sejak Des 2012 — kapan ia menutup posisi dengan rugi sekitar $1 miliar?', opsi: ['Maret 2013', 'Maret 2015', 'Maret 2018', 'Dipegang sampai sekarang'], kunci: 2 },
    ],
  },
  {
    id: 'BBBY-2022',
    nama: 'Bed Bath & Beyond — Agustus 2022',
    catatan: '+440% dalam 3 minggu lalu jatuh tajam lagi — path naik-sementara tetap membunuh short yang "akhirnya benar"',
    fakta: [
      { tanya: 'Bed Bath & Beyond Agustus 2022 melonjak +~440% dalam 3 minggu ($5,55 ke intrahari $30) — lalu apa yang terjadi?', opsi: ['Terus naik tanpa henti', 'Jatuh tajam lagi pada minggu-minggu berikutnya', 'Ditutup paksa oleh bursa', 'Dibelikan pemerintah'], kunci: 1 },
    ],
  },
  {
    id: 'PELAJARAN-PROFESIONAL',
    nama: 'Pelajaran Profesional — intisari semua kasus',
    catatan: 'aturan hidup-mati yang diambil dari kelapan kasus di atas — inilah mengapa para profesional bisa lumpuh',
    fakta: [
      { tanya: 'Mengapa trader PROFESIONAL bisa lumpuh di short squeeze meski arah analisisnya benar?', opsi: ['Arah benar otomatis menyelamatkan margin', 'Profesional tidak pernah likuid', 'Ukuran posisi terlalu besar + leverage + tanpa rencana keluar', 'Karena kurang membaca berita'], kunci: 2 },
      { tanya: 'Bahan bakar utama short squeeze yang terbaca dari data pasar?', opsi: ['Dividen tinggi', 'Short interest ekstrem + pasokan yang menyusut', 'Laba kuartalan', 'Hari libur bursa'], kunci: 1 },
      { tanya: 'Laporan fund menyebut "shorts pay long" — artinya?', opsi: ['Posisi short menerima bunga', 'Funding negatif: posisi short membayar posisi long — bahan bakar squeeze', 'Posisi long membayar short', 'Tidak ada artinya'], kunci: 1 },
      { tanya: 'Hertz +890% saat bangkrut — pelajaran terpentingnya?', opsi: ['Harga selalu adil', 'Aliran dan tekanan beli bisa menang atas fundamental sampai waktu tak tentu', 'Kebangkrutan menaikkan harga', 'Pemerintah menaikkan saham'], kunci: 1 },
      { tanya: 'Float bebas VW tinggal ~5-6% — artinya bagi para short?', opsi: ['Makin aman untuk short', 'Pasokan untuk buy-back nyaris habis — jerat maut', 'Float tidak relevan', 'Makin mudah meminjam saham'], kunci: 1 },
      { tanya: 'Kapan rencana keluar dari posisi short HARUS sudah tertulis?', opsi: ['Saat harga sudah melawan', 'Setelah likuidasi', 'Sebelum posisi dibuka', 'Tidak perlu rencana'], kunci: 2 },
      { tanya: '"Puncak ambisi tercapai tapi harga tak berbalik" (kasus GME/VW) — pelajarannya?', opsi: ['Target tercapai berarti selamat', 'Benar arah tidak sama dengan selamat — tanpa bab keluar tertulis, squeeze menagih lunas', 'Target cukup dipindah tiap hari', 'Cukup menunggu dengan sabar tanpa rencana'], kunci: 1 },
      { tanya: 'Mengapa stop-loss sering gagal melindungi short saat squeeze parah?', opsi: ['Stop-loss dilarang bursa', 'Gap/lompatan harga dan halting membuat eksekusi jauh lebih buruk dari level', 'Stop-loss selalu presisi', 'Karena broker lalai'], kunci: 1 },
      { tanya: 'Short interest 140% dari float artinya?', opsi: ['140 trader aktif', 'Rata-rata saham dipinjam-jual lebih dari sekali — buy-back paksa berlapis-lapis', 'Harga naik 140%', 'Float turun 140%'], kunci: 1 },
      { tanya: 'Mengapa menambah short (averaging) saat harga melawan jadi perangkap?', opsi: ['Rata-rata selalu aman', 'Ukuran tumbuh tepat saat risiko tumbuh — likuidasi makin dekat', 'Margin makin lega', 'Karena biaya pinjam turun'], kunci: 1 },
      { tanya: 'Funding sangat negatif berkepanjangan TAPI harga justru naik — sinyal apa itu?', opsi: ['Sinyal dump pasti datang', 'Bahan bakar squeeze aktif: tekanan beli paksa berlapis', 'Sinyal pasar mendatar', 'Sinyal likuiditas kering'], kunci: 1 },
      { tanya: 'Pola umum sebelum squeeze meledak (GME, VW, TSLA, AMC, HRTZ)?', opsi: ['Short interest tinggi / pasokan sempit + pemicu bertemu uapan beli', 'Laba perusahaan turun', 'Volume sepi', 'Semua analis sepakat turun'], kunci: 0 },
      { tanya: 'Ambang likuidasi short x5 (rugi 20% = margin maintenance habis) tersentuh saat harga naik berapa persen dari entry?', opsi: ['~+2%', '~+5%', '~+20%', '~+90%'], kunci: 2 },
      { tanya: 'Siapa yang mengendalikan pasokan saham VW di kasus 2008?', opsi: ['Bank dunia', 'Porsche (42,6% + opsi 31,5%) dan negara Sachsen Hilir (20,2%)', 'Rumah investasi retail', 'Tak ada yang memegang'], kunci: 1 },
      { tanya: 'Mengapa GME di-halt berkali-kali oleh bursa pada Januari 2021?', opsi: ['Volatilitas ekstrem — likuiditas menguap tepat saat paling dibutuhkan', 'Jam istirahat biasa', 'Libur nasional', 'Server bursa rusak'], kunci: 0 },
      { tanya: 'Ackman punya riset "benar" (Herbalife model piramida) tapi tetap rugi ~$1 miliar — pelajarannya?', opsi: ['Riset tak perlu dilakukan', 'Benar-cerita tidak sama dengan benar-waktu; pasar bisa tak-sadar lebih lama dari solvenmu', 'Herbalife yang benar', 'Short selalu untung'], kunci: 1 },
      { tanya: 'Dampak VW ke indeks DAX saat squeeze 2008?', opsi: ['Tidak berdampak', 'Bobot saham sempit membuat indeks berputar liar — risiko sistemik', 'DAX dihentikan permanen', 'VW keluar dari DAX'], kunci: 1 },
      { tanya: 'Siapa yang mati lebih dulu di squeeze: ukuran besar dan "yakin", atau ukuran kecil dengan rencana tertulis?', opsi: ['Besar dan yakin', 'Kecil dan tertulis', 'Sama saja', 'Tidak ada yang mati'], kunci: 0 },
      { tanya: 'Risiko-reward short di tengah pump aktif (naik ratusan persen mungkin, turun maksimal 100%)?', opsi: ['Simetris sempurna', 'Asimetris buruk: ekor risiko praktis tak terbatas', 'Selalu untung', 'Reward tak terbatas'], kunci: 1 },
      { tanya: '"Cover" dalam konteks posisi short berarti?', opsi: ['Menambah short', 'Membeli kembali untuk menutup posisi — mass-cover = bahan bakar pump', 'Menutup akun', 'Membeli asuransi posisi'], kunci: 1 },
      { tanya: 'VW sesaat menjadi perusahaan termahal dunia (28 Okt 2008) — itu tanda apa?', opsi: ['Kekayaan sejati negara Jerman', 'Harga tak mencerminkan nilai — squeeze sempit meniup kapitalisasi sesaat', 'Ekonomi global kuat', 'Bonus Porsche'], kunci: 1 },
      { tanya: 'Di kasus GME, siapa yang tak punya rencana keluar dan lumpuh?', opsi: ['Hanya retail', 'Hanya profesional', 'Keduanya — squeeze tidak memilih label', 'Tidak ada yang lumpuh'], kunci: 2 },
      { tanya: 'Mengapa keyakinan "harga pasti balik ke dasar" gagal total saat squeeze?', opsi: ['Mean reversion dilarang bursa', 'Buy-back paksa mengubah aliran — asumsi pasokan-penetral rusak', 'Dasar berpindah tiap hari', 'Karena tak ada dasar'], kunci: 1 },
      { tanya: 'Funding "shorts pay long" panjang terbaca di kartu — sikap bijak seorang short?', opsi: ['Tambah ukuran', 'Kecilkan atau keluar — jangan pancing pasokan sempit', 'Gandakan leverage', 'Abaikan saja'], kunci: 1 },
      { tanya: 'KBIO +~800% sehari setelah kabar pengambilalihan — likuidasi short di kasus begini terjadi dalam?', opsi: ['Bulan', 'Minggu', 'Jam, bukan hari', 'Tahun'], kunci: 2 },
      { tanya: 'BBBY +440% lalu jatuh lagi — mengapa tetap kejam bagi short yang "akhirnya benar"?', opsi: ['Path lebih dulu: mati di naik-sementara sebelum sempat benar', 'Karena jatuhnya terlalu cepat', 'Karena tidak jatuh', 'Karena dividen'], kunci: 0 },
      { tanya: 'Ukuran posisi aman menurut pelajaran semua kasus?', opsi: ['Ukuran yang "pasti untung"', 'Ukuran yang tak melikuid saat +20% melawan — bukan ukuran terbesar yang mampu', 'Ukuran penuh modal', 'Tidak ada batas'], kunci: 1 },
      { tanya: 'Mengapa peta pelajaran (tanda 32 bit → kelas) melindungi lebih baik daripada ingatan kisah?', opsi: ['Karena lebih panjang', 'Matematika biner tidak kabur — tanda dicocokkan deterministik (warisan ingatan-biner)', 'Karena kisah membosankan', 'Tidak ada bedanya'], kunci: 1 },
      { tanya: 'Ringkasan semua kasus: kematian para short selalu beririsan dengan?', opsi: ['Pasokan sempit + tekanan beli paksa + ukuran/leverage tanpa rencana keluar', 'Kurang membaca chart hijau', 'Hari Senin pagi', 'Keberuntungan semata'], kunci: 0 },
    ],
  },
]
