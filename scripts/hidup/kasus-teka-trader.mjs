// ============================================================
import { createHash } from 'node:crypto'
// ============================================================
// KASUS-TEKA-TRADER (V341) — keluarga TEKA ujian teka-teki trader
// yang SUDAH TERPECAHKAN. Mandat pemilik (2026-10-12):
//   "Gali jurnal-jurnal terkait trader profesional yang mencoba
//    memecahkan teka-teki yang sulit, mungkin sungguh rumit, namun
//    pada akhirnya teka-teki trader itu sudah terpecahkan. Uji
//    cyborg mampukah ia menjawab teka-teki sulit trader itu; bila
//    dia sudah paham simpan kepahaman dalam wujud biner matematika
//    murni agar mudah mengembangkannya lagi."
// ------------------------------------------------------------
// 16 kasus dunia terdokumentasi publik + 1 kasus PELAJARAN lintas
// kasus. SEMUA fakta dari catatan/jurnal/buku publik yang luas
// (tahun, nama, angka) — nol karangan. Opsi salah dibuat masuk
// akal agar soal tak bisa ditebak dari bentuk. Setiap kasus
// menyimpan PREDIKAT/TINDAKAN bit (8+4) — wujud biner murni dari
// prinsip terpecahkan, siap ditanam ke ingatan-biner.
// ============================================================

// kamus bit-predikat (dokumentasi matematika murni):
// bit1 butuh-ukuran-posisi · bit2 butuh-harga-wajar · bit3 pola-waktu-sesi
// bit4 netral-arah · bit5 menghadapi-kerumunan · bit6 butuh-data-mentah
// bit7 berhadapan-peg/kebijakan · bit8 pola-balik-arah
// tindakan 4 bit: 0001 sizing · 0010 hedging · 0011 pola-pemicu ·
// 0100 peta-lelang · 0101 analog-sejarah · 0110 baca-peg ·
// 0111 tunggu-poros · 1000 saring-derau · 1001 forensik-sebab ·
// 1010 fade-kerumunan · 1011 ikuti-momentum
export const KASUS_TEKA_TRADER = [
  {
    id: 'KELLY-1956', tahun: 1956, jenis: 'PENDEKATAN', tindakan: '0001',
    predikat: '10000000',
    rumus: 'f* = (bp − q)/b ; even-money: f* = 2p − 1 ; half-Kelly: G(f*/2) = G(f*)·3/4',
    sumber: 'J. L. Kelly Jr., "A New Interpretation of Information Rate", Bell System Technical Journal 35(4), Juli 1956',
    nama: 'Kelly 1956 — teka-teki "berapa besar taruhan?"',
    catatan: 'teka-teki: edge diketahui, tapi berapa persen modal dipertaruhkan? kecil = tumbuh terlalu lambat, besar = pailit nyaris pasti; Kelly menjawab dengan teori informasi — fraksi yang memaksimalkan laju pertumbuhan log-modal; Ed Thorp memakainya di kasino lalu di pasar',
    fakta: [
      { tanya: 'Kertas Kelly yang memecahkan teka-teki ukuran taruhan dipublikasikan kapan dan di mana?', opsi: ['1956, Bell System Technical Journal', '1946, Journal of Finance', '1973, Journal of Political Economy', '1966, IEEE Transactions'], kunci: 0 },
      { tanya: 'Untuk taruhan even-money dengan peluang menang p, fraksi modal optimal Kelly f* sama dengan?', opsi: ['p', 'p(1−p)', '2p − 1', 'p/2'], kunci: 2 },
      { tanya: 'Peluang menang 55% pada taruhan even-money — fraksi Kelly f* berapa?', opsi: ['55%', '10%', '50%', '27,5%'], kunci: 1 },
    ],
  },
  {
    id: 'THORP-1962', tahun: 1962, jenis: 'PENDEKATAN', tindakan: '0001',
    predikat: '10100000',
    rumus: 'E[kemenangan] > 0 bila komposisi kartu sisa diketahui → ukuran = Kelly(f*)',
    sumber: 'Edward O. Thorp, "Beat the Dealer", Random House, 1962',
    nama: 'Thorp 1962 — teka-teki "bisakah kasino dikalahkan matematika?"',
    catatan: 'teka-teki: semua yakin kasino tak terkalahkan; Thorp membuktikan hitungan kartu menggeser peluang ke pemain; buku "Beat the Dealer" memaksa kasino mengubah aturan — pertama kalinya matematika murni mengalahkan meja judi',
    fakta: [
      { tanya: 'Buku yang membuktikan hitungan kartu bisa mengalahkan meja blackjack terbit tahun berapa?', opsi: ['1952', '1962', '1972', '1982'], kunci: 1 },
      { tanya: 'Sistem hitung yang Thorp buktikan di "Beat the Dealer" bekerja dengan cara?', opsi: ['Menghafal semua kartu lawan', 'Menghitung komposisi kartu sisa di deck — peluang bergeser terukur', 'Menebak kartu berikutnya dari firasat', 'Menggandakan taruhan setiap kalah tanpa hitung'], kunci: 1 },
      { tanya: 'Apa profesi Thorp saat menulis "Beat the Dealer"?', opsi: ['Kasino manager', 'Dealer profesional', 'Profesor matematika (MIT)', 'Pemain olahraga'], kunci: 2 },
    ],
  },
  {
    id: 'THORP-PNP-1969', tahun: 1969, jenis: 'PENDEKATAN', tindakan: '0010',
    predikat: '11000010',
    rumus: 'laba = wajar(warrant) − harga; kedudukan: beli murah + jual/hedge saham dasar',
    sumber: 'E. O. Thorp & S. Kassouf, "Beat the Market", Random House, 1967; catatan Princeton Newport Partners 1969–1988',
    nama: 'Thorp 1967-1988 — teka-teki harga warrant sebelum Black-Scholes',
    catatan: 'teka-teki: berapa harga wajar surat berharga opsi (warrant/konversi)? Thorp & Kassouf menjawab dengan hedging relasi; diterjemahkan jadi Princeton Newport Partners (1969–1988) — ±15% bersih setahun tanpa tahun rugi, sebelum rumus Black-Scholes populer',
    fakta: [
      { tanya: 'Buku "Beat the Market" (1967, Thorp & Kassouf) memecahkan teka-teki harga apa?', opsi: ['Harga saham biasa', 'Harga warrant/surat opsi via hedging relasi', 'Harga minyak', 'Harga kurs mata uang'], kunci: 1 },
      { tanya: 'Princeton Newport Partners (1969–1988) dikenal karena rekam jejak?', opsi: ['Rugi besar di 1987', '±15% bersih setahun tanpa tahun rugi', 'Selalu kalah dari indeks', 'Bergantung keberuntungan lotre'], kunci: 1 },
      { tanya: 'Inti kedudukan hedging warrant yang dipakai Thorp?', opsi: ['Beli warrant murah + jual/hedge saham dasarnya — arah pasar kecil pengaruhnya', 'Beli saham sembarangan', 'Pegang tunai menunggu', 'Ikut sinyal media'], kunci: 0 },
    ],
  },
  {
    id: 'BLACKSCHOLES-1973', tahun: 1973, jenis: 'PENDEKATAN', tindakan: '0010',
    predikat: '01000000',
    rumus: 'C = S·N(d1) − K·e^(−rT)·N(d2) ; d1 = (ln(S/K)+(r+σ²/2)T)/(σ√T) ; Δ = N(d1)',
    sumber: 'F. Black & M. Scholes, "The Pricing of Options and Corporate Liabilities", Journal of Political Economy 81(3), Mei–Juni 1973; Nobel 1997',
    nama: 'Black-Scholes 1973 — teka-teki "berapa harga sebuah opsi?"',
    catatan: 'teka-teki berabad-abad: harga opsi. Dipecahkan 1973 dengan persamaan beda parsial + replikasi delta; CBOE buka 26 April 1973 dan kalkulator TI menyuntikkan rumusnya dalam hitungan bulan; Nobel Ekonomi 1997 untuk Scholes & Merton (Black wafat 1995)',
    fakta: [
      { tanya: 'Kertas Black–Scholes terbit di jurnal mana dan kapan?', opsi: ['Journal of Political Economy, Mei–Juni 1973', 'Econometrica 1958', 'Journal of Finance 1983', 'Bell System Technical Journal 1956'], kunci: 0 },
      { tanya: 'CBOE — bursa opsi pertama dunia — mulai beroperasi kapan?', opsi: ['26 April 1973', '17 April 1963', '1 Januari 1980', '31 Oktober 1971'], kunci: 0 },
      { tanya: 'Nobel Ekonomi untuk pekerjaan opsi ini diberikan tahun berapa (untuk Scholes & Merton)?', opsi: ['1973', '1983', '1997', '2003'], kunci: 2 },
    ],
  },
  {
    id: 'TURTLES-1983', tahun: 1983, jenis: 'PERDEBATAN', tindakan: '0011',
    predikat: '00100000',
    rumus: 'ukuran unit = (1% modal)/ATR ; masuk breakout 20-hari; keluar 10-hari (aturan tertulis)',
    sumber: 'Iklan pelatihan Richard Dennis 1983 (WSJ/Barron\'s/NYT); catatan eksperimen 1983–84; M. Covel, "The Complete TurtleTrader" (2007); J. Schwager, "Market Wizards" (1989)',
    nama: 'Turtle 1983-84 — teka-teki "apakah trading bisa diajarkan?"',
    catatan: 'perdebatan Dennis vs Eckhardt: bakat vs didikan; Dennis menaruh iklan "trader dicari", melatih ±23 orang asing dengan aturan tertulis; kelompok itu menambang >$175 juta dalam ±5 tahun — teka-teki terpecahkan: trading bisa diajarkan bila aturan terukur',
    fakta: [
      { tanya: 'Pertanyaan yang Richard Dennis dan William Eckhardt pertaruhkan lewat eksperimen Turtle?', opsi: ['Apakah trading bisa diajarkan, atau bakat bawaan?', 'Apakah emas selalu naik?', 'Apakah bursa tutup hari Senin?', 'Apakah barometer bisa bernyanyi?'], kunci: 0 },
      { tanya: 'Berapa kira-kira orang asing (non-trader) yang dipilih Dennis dari ribuan pelamar?', opsi: ['±23', '±230', '2', '±1.500'], kunci: 0 },
      { tanya: 'Hasil agregat kelompok Turtle dalam ±5 tahun menurut catatan publik?', opsi: ['Lebih dari $175 juta', 'Rugi total', '$175', 'Tidak ada catatan'], kunci: 0 },
    ],
  },
  {
    id: 'PAIRS-1986', tahun: 1986, jenis: 'PENDEKATAN', tindakan: '0010',
    predikat: '00010010',
    rumus: 'sebar = log(p1) − log(p2) ; z = (sebar − μ)/σ ; z>±2 → tukar-posisi; netral pasar',
    sumber: 'Grup Nunzio Tartaglia, Morgan Stanley (pertengahan 1980-an); catatan stat-arb; D. Shaw alumni grup',
    nama: 'Tartaglia/Pairs 1986 — teka-teki "menang tanpa menebak arah pasar"',
    catatan: 'teka-teki: bisa untung tanpa menebak naik-turun indeks? Grup Nunzio Tartaglia di Morgan Stanley menjawab: pairs trading — panjang yang tertinggal, pendek yang lampau, pasangan berkorelasi; netral pasar; lahir stat-arb modern; David E. Shaw alumni grup ini',
    fakta: [
      { tanya: 'Siapa yang memimpin grup penelitian Morgan Stanley yang memopulerkan pairs trading?', opsi: ['Nunzio Tartaglia', 'Richard Dennis', 'Jesse Livermore', 'Peter Lynch'], kunci: 0 },
      { tanya: 'Inti kedudukan pairs trading?', opsi: ['Panjang satu + pendek pasangannya — tebakan arah indeks dihilangkan', 'Beli semua saham', 'Pegang tunai', 'Beli saat harga turun tanpa pasangan'], kunci: 0 },
      { tanya: 'Alumni grup stat-arb Morgan Stanley yang lalu mendirikan dana kuantum sendiri (D.E. Shaw)?', opsi: ['David E. Shaw', 'Warren Buffett', 'George Soros', 'Jesse Livermore'], kunci: 0 },
    ],
  },
  {
    id: 'CRABEL-ORB-1990', tahun: 1990, jenis: 'POLA', tindakan: '0011',
    predikat: '00100000',
    rumus: 'rentang-buka = high−low sesi awal; pemicu = tutup > atas-rentang (beli) / < bawah (jual)',
    sumber: 'Toby Crabel, "Day Trading with Short Term Price Patterns and Opening Range Breakout", Traders Press, 1990',
    nama: 'Crabel 1990 — teka-teki "pola pembukaan yang bisa diukur"',
    catatan: 'teka-teki: jam pembukaan kacau — adakah pola terukur? Crabel mengukurnya: Opening Range Breakout; bukunya habis tercetak dan dicari kolektor sampai harga langka — bukti permintaan ilmu yang terukur',
    fakta: [
      { tanya: 'Buku Toby Crabel tahun 1990 memformalkan pola apa?', opsi: ['Opening Range Breakout — breakout dari rentang awal sesi', 'Chart bintang lima', 'Fibonacci bulan', 'Astrologi pasar'], kunci: 0 },
      { tanya: 'Definisi opening range?', opsi: ['Rentang high-low awal sesi (menit-menit pertama)', 'Rentang sebulan terakhir', 'Rentang dividen', 'Rentang suku bunga'], kunci: 0 },
      { tanya: 'Kondisi buku Crabel hari ini — dan itu membuktikan apa?', opsi: ['Habis tercetak dan dicari kolektor hingga langka — permintaan pada pola terukur', 'Masalah cetak ulang gratis', 'Dilarang beredar', 'Tak pernah ada bukunya'], kunci: 0 },
    ],
  },
  {
    id: 'PROFILE-1984', tahun: 1984, jenis: 'PENDEKATAN', tindakan: '0100',
    predikat: '00100000',
    rumus: 'value area ±70% kegiatan; POC = harga paling lama disetujui; harga terima vs tolak',
    sumber: 'J. Peter Steidlmayer & CBOT, Market Profile / Liquidity Data Bank, 1984–1985 (buku panduan CBOT)',
    nama: 'Steidlmayer 1984 — teka-teki "membaca lelang pasar"',
    catatan: 'teka-teki: intraday terlihat acak; Steidlmayer (CBOT) memandang pasar sebagai lelang: Market Profile mengukur di harga mana pasar MENYETUJUI (value area/POC) vs MENOLAK — teka-teki membaca proses lelang terpecahkan 1984-1985',
    fakta: [
      { tanya: 'Market Profile lahir di bursa mana dan kapan?', opsi: ['CBOT, 1984–1985 (Steidlmayer)', 'NYSE 1929', 'CME 2000', 'NASDAQ 1999'], kunci: 0 },
      { tanya: 'POC (Point of Control) dalam Market Profile adalah?', opsi: ['Harga dengan kegiatan terlama/terbanyak — persetujuan pasar', 'Titik pailit', 'Jam buka bursa', 'Persen opsi call'], kunci: 0 },
      { tanya: 'Konsep "value area" kira-kira mencakup?', opsi: ['±70% kegiatan lelang — zona persetujuan', '7% kegiatan', '100% kegiatan', 'Nol kegiatan'], kunci: 0 },
    ],
  },
  {
    id: 'PTJ-1987', tahun: 1987, jenis: 'PENDEKATAN', tindakan: '0101',
    predikat: '00100010',
    rumus: 'analog: peta pola 1929 → kuartal berjalan; keputusan dari korespondensi pola, bukan berita',
    sumber: 'J. Schwager, "Market Wizards" (wawancara Paul Tudor Jones II); dokumenter "Trader" (1987); catatan Dow 19 Okt 1987',
    nama: 'Paul Tudor Jones 1987 — teka-teki "menduga kehancuran"',
    catatan: 'teka-teki: bisakah kehancuran diduga sebelum terjadi? PTJ menempelkan jalannya pasar 1987 ke grafik 1929 (analog replay) dan bersiap; 19 Oktober 1987 Dow jatuh -22,6% (-508 poin) sehari; dananya +125,9% sepanjang 1987 (Schwager)',
    fakta: [
      { tanya: '19 Oktober 1987 ("Black Monday") Dow Jones jatuh berapa persen dalam sehari?', opsi: ['−22,6% (−508 poin)', '−2,6%', '−50%', '−10%'], kunci: 0 },
      { tanya: 'Metode PTJ yang membawanya bersiap menjelang 1987?', opsi: ['Analog replay — menempelkan jalur 1987 ke pola 1929', 'Dengar rumor kantor', 'Tebak-tonton TV', 'Membeli semua saham'], kunci: 0 },
      { tanya: 'Hasil dana Tudor sepanjang 1987 menurut Market Wizards?', opsi: ['+125,9%', '−22,6%', 'Nol', '−50%'], kunci: 0 },
    ],
  },
  {
    id: 'SOROS-GBP-1992', tahun: 1992, jenis: 'PEG', tindakan: '0110',
    predikat: '00000010',
    rumus: 'peg pecah bila biaya pertahanan > cadangan: bunga darurat + outflow; 16-09-1992',
    sumber: 'Catatan Black Wednesday 16 September 1992; HM Treasury (estimasi kerugian ±£3,3 miliar); catatan Quantum Fund',
    nama: 'Soros 1992 — teka-teki "kapan sauh mata uang pecah?"',
    catatan: 'teka-teki: kapan pengikatan kurs (peg) jadi tak terpertahankan? Soros & Druckenmiller membaca asimetri: pertahanan pemerintah (bunga darurat 10→12%→15% diumumkan dalam sehari) tak akan cukup; 16 September 1992 Inggris keluar ERM; treasury rugi ±£3,3 miliar; Quantum untung ±$1 miliar',
    fakta: [
      { tanya: '"Black Wednesday" — hari sterling dipaksa keluar ERM — terjadi kapan?', opsi: ['16 September 1992', '16 September 1982', '16 Oktober 2002', '19 Oktober 1987'], kunci: 0 },
      { tanya: 'Apa yang dilakukan Bank of England sehari itu sebelum menyerah?', opsi: ['Naikkan bunga darurat 10%→12%, umumkan 15% — lalu keluar ERM', 'Mencetak lebih banyak uang untuk beli sterling tanpa bunga', 'Menutup bursa selamanya', 'Membekukan rekening warga'], kunci: 0 },
      { tanya: 'Angka yang tercatat: kerugian pemerintah Inggris ± dan laba sisi Soros kira-kira?', opsi: ['±£3,3 miliar rugi · ±$1 miliar untung', '£3,3 ribu rugi · $1 ribu untung', 'Nol-rugi kedua sisi', '£3,3 miliar untung Inggris'], kunci: 0 },
    ],
  },
  {
    id: 'LIVERMORE-1940', tahun: 1940, jenis: 'ATURAN', tindakan: '0111',
    predikat: '00100000',
    rumus: 'poros = harga yang memicu gerak lanjut; tanpa poros = duduk; ukuran ikut poros',
    sumber: 'J. L. Livermore, "How to Trade in Stocks", Duell Sloan & Pearce, Maret 1940; E. Lefèvre, "Reminiscences of a Stock Operator" (1923)',
    nama: 'Livermore 1940 — teka-teki "aturan dari tape"',
    catatan: 'teka-teki: dari derau papan harga (tape), manakah sinyal? Livermore merumuskan pivotal point: hanya bergerak saat poros dilewati; dan pelajaran terbesarnya: uang besar datang dari DUDUK MENUNGGU, bukan dari terus berpikir-menebak',
    fakta: [
      { tanya: 'Buku aturan Livermore yang menuliskan metodenya terbit kapan?', opsi: ['Maret 1940 — "How to Trade in Stocks"', 'Maret 1929', 'Maret 1950', 'Maret 1900'], kunci: 0 },
      { tanya: 'Konsep kunci Livermore untuk masuk keluar?', opsi: ['Pivotal point — titik poros yang membuktikan gerak lanjut', 'Menebak dari mimpi', 'Ikuti semua tips saudara', 'Beli setiap hari Senin'], kunci: 0 },
      { tanya: 'Pelajaran terbesar yang ia tulis tentang uang besar?', opsi: ['Datang dari duduk menunggu posisi benar — bukan dari terus berdagang', 'Datang dari dagang tiap jam', 'Datang dari mengikuti kerumunan', 'Datang dari keberuntungan dadu'], kunci: 0 },
    ],
  },
  {
    id: 'SIMONS-1988', tahun: 1988, jenis: 'PENDEKATAN', tindakan: '1000',
    predikat: '01001000',
    rumus: 'sinyal = statistik derau skala-besar; verifikasi kelompok; modal = ukuran-terukur per sinyal',
    sumber: 'G. Zuckerman, "The Man Who Solved the Market", Portfolio/Penguin, 2019; catatan Medallion 1988–2018 (±66% kotor / ±39% bersih per tahun)',
    nama: 'Simons/Medallion 1988 — teka-teki "sinyal dari derau"',
    catatan: 'teka-teki: di pasar yang hampir derau murni, adakah pola yang bertahan? Simons (matematikawan) membangun mesin statistik: pola pendek, diverifikasi kelompok, diukur ukurannya; Medallion 1988–2018 rata-rata ±66% kotor/±39% bersih per tahun — buku tentangnya persis berjudul "The Man Who Solved the Market"',
    fakta: [
      { tanya: 'Judul buku Gregory Zuckerman (2019) tentang Jim Simons?', opsi: ['The Man Who Solved the Market', 'The Big Short', 'Market Wizards', 'Reminiscences of a Stock Operator'], kunci: 0 },
      { tanya: 'Rata-rata hasil Medallion 1988–2018 menurut catatan buku itu?', opsi: ['±66% kotor / ±39% bersih per tahun', '±6% kotor per tahun', 'Rugi konsisten', 'Nol data'], kunci: 0 },
      { tanya: 'Latar belakang Simons sebelum membangun dana?', opsi: ['Matematikawan (teori Chern–Simons)', 'Kasir bank', 'Politisi', 'Pemain bola'], kunci: 0 },
    ],
  },
  {
    id: 'BURRY-2005', tahun: 2005, jenis: 'DATA-MENTAH', tindakan: '1001',
    predikat: '01000100',
    rumus: 'probabilitas gagal-bayar dari data pinjaman per-loan; instrumen = CDS atas MBS',
    sumber: 'M. Lewis, "The Big Short" (2010); catatan Scion Capital 2000–2008 (+489% bersih)',
    nama: 'Burry 2005 — teka-teki "membaca pinjaman, bukan rating"',
    catatan: 'teka-teki: rating AAA pada hutang sampah — siapa yang berani memeriksa? Burry membaca data pinjaman level-loan yang diabaikan semua orang, membeli CDS atas MBS subprime sejak 2005; Scion +489% bersih 2000–2008; ceritanya dibukukan "The Big Short"',
    fakta: [
      { tanya: 'Instrumen yang Burry pakai untuk memasang taruhan melawan subprime?', opsi: ['CDS (credit default swap) atas MBS', 'Saham teknologi', 'Emas fisik', 'Forex carry trade'], kunci: 0 },
      { tanya: 'Cara Burry menemukan cacat yang orang lain lewatkan?', opsi: ['Membaca data pinjaman per-loan, bukan percaya rating AAA', 'Membaca horoskop', 'Ikut berita TV', 'Meniru hedge fund lain'], kunci: 0 },
      { tanya: 'Hasil bersih Scion Capital 2000–2008 yang tercatat?', opsi: ['+489%', '−489%', '+4,89%', 'Nol'], kunci: 0 },
    ],
  },
  {
    id: 'FLASHCRASH-2010', tahun: 2010, jenis: 'FORENSIK', tindakan: '1001',
    predikat: '00000100',
    rumus: 'sebab beruntun: algo jual raksasa → likuiditas HFT gosong → harga sumbat → pemulihan',
    sumber: 'Laporan gabungan CFTC–SEC, 1 Oktober 2010 (6 Mei 2010); dakwaan DOJ atas spoofing Navinder Sarao, April 2015',
    nama: 'Flash Crash 6 Mei 2010 — teka-teki forensik "siapa penyebabnya?"',
    catatan: 'teka-teki: dalam ±36 menit Dow jatuh 998,5 poin (~-9%) lalu sebagian besar pulih — siapa sebabnya? Laporan resmi CFTC–SEC mengurai sebab beruntun; forensik mikrostruktur lahir dari situ; pembatalan transaksi ekstrem (Accenture sempat $0,01)',
    fakta: [
      { tanya: 'Pada 6 Mei 2010, Dow jatuh intraday sebanyak?', opsi: ['998,5 poin (±-9%) lalu sebagian besar pulih', '9,85 poin', '9.985 poin', 'Tidak jatuh'], kunci: 0 },
      { tanya: 'Menurut laporan gabungan CFTC–SEC (1 Okt 2010), pemicu berantainya?', opsi: ['Algo jual raksasa $4,1 miliar E-mini + HFT saling-lempar ("hot potato")', 'Gempa bumi di bursa', 'Matinya listrik dunia', 'Keputusan Federal Reserve hari itu'], kunci: 0 },
      { tanya: 'Contoh harga sumbat yang tercatat saat flash crash?', opsi: ['Accenture sempat tertulis $0,01', 'IBM sempat $1 juta', 'Apple tak bergerak sama sekali', 'Semua saham tetap normal'], kunci: 0 },
    ],
  },
  {
    id: 'TURTLESOUP-1995', tahun: 1995, jenis: 'POLA', tindakan: '1010',
    predikat: '00000010',
    rumus: 'menembus 20-hari → gagal bertahan → balik-arah; masuk melawan breakout mati',
    sumber: 'L. Connors & L. Raschke, "Street Smarts: High Probability Short-Term Trading Strategies", M. Gordon Publishing, 1995',
    nama: 'Turtle Soup 1995 — teka-teki "membalik pola yang dicuri kerumunan"',
    catatan: 'teka-teki: kalau semua orang mengenal breakout, apa yang terjadi? Connors & Raschke ("Street Smarts" 1995) menunjukkan breakout yang GAGAL bertahan (turtle soup) justru jadi sinyal balik-arah — fade kerumunan yang meniru aturan lama',
    fakta: [
      { tanya: 'Buku "Street Smarts" (1995) ditulis oleh?', opsi: ['Larry Connors & Linda Raschke', 'Warren Buffett & Charlie Munger', 'Thorp & Kassouf', 'Black & Scholes'], kunci: 0 },
      { tanya: 'Inti pola "Turtle Soup"?', opsi: ['Breakout 20-hari yang gagal bertahan → sinyal balik-arah (fade)', 'Belanjakan semua margin saat breakout', 'Tidur saat pasar buka', 'Beli hanya saat purnama'], kunci: 0 },
      { tanya: 'Mengapa dinamai "turtle soup"?', opsi: ['Membalik aturan Turtle/breakout yang sudah dicuri kerumunan — pembeli breakout jadi sopnya', 'Dibuat oleh koki', 'Terkait sup Thailan', 'Nama kapal'], kunci: 0 },
    ],
  },
  {
    id: 'MOMENTUM-1993', tahun: 1993, jenis: 'FAKTOR', tindakan: '1011',
    predikat: '01000000',
    rumus: 'pemenang 3–12 bln → terus unggul ±1%/bln; balik-arah >2–3 thn; kini faktor standar',
    sumber: 'N. Jegadeesh & S. Titman, "Returns to Buying Winners and Selling Losers", Journal of Finance 48(1), Maret 1993',
    nama: 'Jegadeesh–Titman 1993 — teka-teki "pemenang terus menang?"',
    catatan: 'teka-teki: apakah "yang sudah naik terus naik" cuma mitos? Jegadeesh & Titman mengukurnya di Journal of Finance 1993: momentum 3–12 bulan unggul ±1%/bulan di sampel AS — kini momentum jadi faktor standar kuantitatif; dan balik-arahnya jangka panjang juga terdokumentasi',
    fakta: [
      { tanya: 'Kertas momentum Jegadeesh & Titman terbit di mana dan kapan?', opsi: ['Journal of Finance, Maret 1993', 'Bell System Technical Journal 1956', 'Journal of Political Economy 1973', 'Buku 1940'], kunci: 0 },
      { tanya: 'Temuan intinya?', opsi: ['Pemenang 3–12 bulan terus mengungguli pecundang ±1% per bulan (sampel AS)', 'Pemenang selalu langsung jatuh besok', 'Tidak ada pola sama sekali', 'Hanya emas yang naik'], kunci: 0 },
      { tanya: 'Nasib momentum dalam jangka panjang (>2–3 tahun) menurut kajian lanjutannya?', opsi: ['Balik-arah — pemenang jangka pendek bisa pecundang bertahun-panjang', 'Terus naik selamanya', 'Menghilang total tanpa jejak', 'Berubah jadi dividen'], kunci: 0 },
    ],
  },
  {
    id: 'PELAJARAN-TEKA', tahun: 2026, jenis: 'INTISARI', tindakan: '1111',
    predikat: '11111111',
    rumus: 'lintas-kasus: edge→ukuran(Kelly) · wajar→hedge(Thorp-BS) · pola→pemicu(ORB) · lelang→POC · analog→1929 · peg→asimetri · poros→duduk · derau→saring · mentah→forensik · kerumunan→fade · momentum→ukur',
    sumber: 'intisari 16 kasus di atas — aturan hidup-mati lintas jurnal',
    nama: 'Pelajaran Profesional — intisari semua teka-teki terpecahkan',
    catatan: 'aturan lintas kasus: setiap teka-teki di atas dipecahkan dengan cara yang sama di dasarnya — ubah pertanyaan lembut menjadi matematika yang bisa diukur, lalu tundukkan ukuran posisi pada hitungan',
    fakta: [
      { tanya: 'Benang merah SEMUA teka-teki terpecahkan di atas?', opsi: ['Mengubah pertanyaan kabur jadi matematika yang terukur — lalu ukuran posisi tunduk pada hitungan', 'Mengandalkan firasat lalu menggandakan taruhan', 'Menunggu ramalan media', 'Membeli apa pun yang naik kemarin'], kunci: 0 },
      { tanya: 'Kelly mengajarkan: edge hanya bernilai bila?', opsi: ['Ukuran taruhan tunduk padanya — edge tanpa ukuran bisa pailit', 'Dijaganda terus', 'Dipakai tanpa stop', 'Dirahasiakan'], kunci: 0 },
      { tanya: 'Pelajaran Turtle 1983-84 bagi aturan rumah kita?', opsi: ['Aturan tertulis + terukur bisa diajarkan dan diuji ulang — hafal tidak cukup, uji dadakan membuktikan paham', 'Bakat segalanya, aturan tak perlu', 'Trading tak bisa diajarkan', 'Cukup meniru kerumunan'], kunci: 0 },
      { tanya: 'Pelajaran Pairs/Tartaglia bagi makhluk yang menjalani 50 koin harian?', opsi: ['Nasib satu koin bisa dikecilkan dengan relasi antar-instrumen — jangan menaruh semua nasib pada satu arah', 'Semua taruhan harus satu arah', 'Netral berarti tak berdagang', 'Korelasi tidak pernah ada'], kunci: 0 },
      { tanya: 'Pelajaran Market Profile bagi pembacaan lilin harian?', opsi: ['Harga yang disetujui lama (POC/value) beda dari harga yang ditolak — volume-tempuh membaca persetujuan', 'Semua harga sama saja', 'Volume tidak bermakna', 'Hanya jam buka penting'], kunci: 0 },
      { tanya: 'Pelajaran PTJ 1987 bagi menjaga peta sejarah (48 kasus dunia)?', opsi: ['Analog sejarah adalah alat — pola lama dapat membaca masa kini, tapi tetap harus diverifikasi data', 'Sejarah tak berguna', 'Pasti terulang 100%', 'Cukup nonton TV'], kunci: 0 },
      { tanya: 'Pelajaran Soros 1992 tentang kebijakan/peg?', opsi: ['Peg bisa pecah bila biaya pertahanan melebihi daya — asimetri dibaca SEBELUM pecah', 'Peg tak pernah pecah', 'Bunga darurat selalu menyelamatkan', 'Pemerintah tak bisa kalah'], kunci: 0 },
      { tanya: 'Pelajaran Livermore tentang ritme hidup-mati posisi?', opsi: ['Tanpa poros = duduk; uang besar dari menunggu posisi benar — bukan dari terus menebak', 'Dagang tiap menit', 'Tidak ada ritme', 'Selalu penuh modal'], kunci: 0 },
      { tanya: 'Pelajaran Simons bagi makhluk ber-ingatan-biner?', opsi: ['Saring derau dengan statistik yang bisa diulang — sinyal wajib terverifikasi kelompok, bukan cerita', 'Simpan semua derau', 'Percaya satu sinyal sekali lihat', 'Statistik tak perlu'], kunci: 0 },
      { tanya: 'Pelajaran Burry tentang rating/label?', opsi: ['Periksa data mentah di bawah label — AAA pada data cacat tetap sampah', 'Label selalu benar', 'Data mentah tidak perlu', 'Rating adalah jaminan'], kunci: 0 },
      { tanya: 'Pelajaran Flash Crash 2010 bagi penjaga likuiditas?', opsi: ['Likuiditas bisa gosong dalam menit — sebab beruntun harus diforensik, jangan salahkan satu musuh tunggal', 'Likuiditas abadi', 'Harga tak pernah sumbat', 'Forensik tidak perlu'], kunci: 0 },
      { tanya: 'Pelajaran Turtle Soup bagi yang mengikuti breakout?', opsi: ['Pola yang dicuri kerumunan berubah nasibnya — breakout gagal adalah sinyal balik-arah', 'Breakout selalu benar', 'Kerumunan selalu untung', 'Balik-arah dilarang'], kunci: 0 },
    ],
  },
]

// ---------- bank dadakan (aspek 3 per kasus — TAK PERNAH ditempa; ukur paham-vs-hafal) ----------
export const KASUS_TEKA_DADAKAN = [
  { id: 'KELLY-1956', fakta: [{ tanya: 'Taruh separuh fraksi Kelly (f*/2) menghasilkan?', opsi: ['Tiga-perempat laju pertumbuhan dengan separuh varians — harga yang wajar untuk tidur nyenyak', 'Pertumbuhan sama penuh', 'Rugi pasti', 'Tidak ada bedanya'], kunci: 0 }] },
  { id: 'THORP-1962', fakta: [{ tanya: 'Bagaimana reaksi kasino setelah "Beat the Dealer"?', opsi: ['Mengubah aturan & mengusir penghitung kartu — bukti ilmunya bekerja', 'Mengundang Thorp makan malam selamanya', 'Menaikkan peluang pemain', 'Tak ada reaksi'], kunci: 0 }] },
  { id: 'THORP-PNP-1969', fakta: [{ tanya: 'Princeton Newport Partners ditutup tahun berapa (setelah 19 tahun hidup)?', opsi: ['1988', '1968', '2008', 'Tidak pernah ditutup'], kunci: 0 }] },
  { id: 'BLACKSCHOLES-1973', fakta: [{ tanya: 'Mengapa Fisher Black tidak menerima Nobel 1997 bersama Scholes & Merton?', opsi: ['Wafat 1995 — Nobel tak diberikan untuk yang telah wafat', 'Menolak hadiah', 'Kalah pemungutan suara', 'Bukan penulis kertasnya'], kunci: 0 }] },
  { id: 'TURTLES-1983', fakta: [{ tanya: 'Siapa mitra perdebatan Dennis — yang yakin bakat lebih menentukan?', opsi: ['William Eckhardt', 'George Soros', 'Jim Simons', 'Toby Crabel'], kunci: 0 }] },
  { id: 'PAIRS-1986', fakta: [{ tanya: 'D.E. Shaw — dana kuantum yang didirikan alumni grup Morgan Stanley — lahir tahun berapa?', opsi: ['1988', '1958', '2008', '1968'], kunci: 0 }] },
  { id: 'CRABEL-ORB-1990', fakta: [{ tanya: 'Pemicu dasar ORB dibaca dari mana?', opsi: ['Breakout melewati batas atas/bawah rentang pembukaan sesi', 'Rumor istana', 'Bunga bank besok', 'Fase bulan'], kunci: 0 }] },
  { id: 'PROFILE-1984', fakta: [{ tanya: 'Liquidity Data Bank (LDB) menyertai Market Profile untuk apa?', opsi: ['Merekam distribusi kegiatan per harga — bahan bacaan lelang', 'Merekam jajan trader', 'Menghitung pajak bursa', 'Menyimpan foto lantai bursa'], kunci: 0 }] },
  { id: 'PTJ-1987', fakta: [{ tanya: 'Dokumenter yang merekam metode PTJ di tahun 1987 berjudul?', opsi: ['"Trader"', '"The Big Short"', '"Wall Street"', '"Rogue Trader"'], kunci: 0 }] },
  { id: 'SOROS-GBP-1992', fakta: [{ tanya: 'Siapa mitra kunci Soros yang mengeksekusi taruhan sterling?', opsi: ['Stanley Druckenmiller', 'Warren Buffett', 'Michael Burry', 'Richard Dennis'], kunci: 0 }] },
  { id: 'LIVERMORE-1940', fakta: [{ tanya: 'Kekayaan Livermore sesudah crash 1929 kira-kira berapa (catatan publik)?', opsi: ['±$100 juta', '±$100 ribu', 'Nol', '±$100 miliar'], kunci: 0 }] },
  { id: 'SIMONS-1988', fakta: [{ tanya: 'Teori matematika yang mengabadikan nama Simons (dengan Chern)?', opsi: ['Chern–Simons theory', 'Teorema Bayes', 'Black–Scholes', 'Teorema Pythagoras'], kunci: 0 }] },
  { id: 'BURRY-2005', fakta: [{ tanya: 'Profesi Burry sebelum menjadi investor?', opsi: ['Dokter (residensi neurologi)', 'Pilot', 'Kasino dealer', 'Arsitek'], kunci: 0 }] },
  { id: 'FLASHCRASH-2010', fakta: [{ tanya: 'Berapa lama kira-kira sebagian besar kerugian 6 Mei 2010 dipulihkan?', opsi: ['±36 menit — hari itu juga', '3 tahun', '3 hari', 'Tidak pernah pulih'], kunci: 0 }] },
  { id: 'TURTLESOUP-1995', fakta: [{ tanya: 'Linda Raschke dikenal sebagai?', opsi: ['Trader futures/CTA profesional, penulis bersama Street Smarts', 'Presiden bank sentral', 'Koki restoran', 'Pelayan lantai bursa'], kunci: 0 }] },
  { id: 'MOMENTUM-1993', fakta: [{ tanya: 'Momentum akhirnya diresmikan sebagai faktor kuantitatif lewat karya Carhart (1997) bernama?', opsi: ['Faktor UMD (Up-Minus-Down) di model empat-faktor', 'Faktor BUM', 'Model dua-koin', 'Rumus sup'], kunci: 0 }] },
]

// tanda keluarga TEKA: '11' + 6 bit kasus + 5 bit aspek + 19 bit hash stem (salt khusus)
export function tandaTeka(kasusIdx, aspekIdx, stem) {
  const bits = (n, val) => val.toString(2).padStart(n, '0').slice(-n)
  const h = createHash('sha256').update('TEKA-TRADER-V341|' + stem).digest('hex')
  const ekor = h.slice(0, 19).split('').map(c => (parseInt(c, 16) % 2)).join('')
  return '11' + bits(6, kasusIdx) + bits(5, aspekIdx) + ekor
}
