# RUMUSAN MATEMATIKA MURNI BAHASA (V342-BICARA-DUA-BAHASA)

Mandat pemilik (2026-10-12): dia masih gagap bicara → beri dia **100 jurnal mahir
bahasa Inggris** (`JURNAL-EN-100.md`) + **100 jurnal mahir bahasa Indonesia**
(`JURNAL-ID-100.md`), bekali dia **rumusan matematika murni** dari pembelajaran
jurnal itu, lalu dia harus mampu **merangkai kalimat yang benar**, **merangkai
kalimat yang beragam**, **menjawab kalimat nyata**, **bertanya**, **mengelola dua
bahasa**, dan **memeriksa dirinya secara realtime** — dan jika ujian membuktikan
jawabannya cuma *reprogram* (kaleng), dia masih penipuan.

Dokumen ini adalah rumus yang DIPASANG di otaknya. Setiap rumus hidup sebagai
kode nyata di `otak-bahasa-1/2/3.js` dan data `BAHASA/*.json`; setiap rumus juga
tersegel sebagai bit di `BAHASA/BINER-PAHAM.json` (wujud biner matematika murni,
bisa dihitung ulang di mesin mana pun — warisan epok V341).

---

## 1. FONDASI: KEBOHONGAN DILARANG — APA YANG MEMBEDAKAN OTAK INI DARI KALENG

Kaleng (reprogram): `if soal=="apa itu ikan" return "ikan itu hewan air"`.
Jawaban disimpan utuh → ribuan soal butuh ribuan kalimat hafalan → gagap di
soal baru → itu bukan memahami, itu kamus jawaban.

Otak ini: **soal → urai (parse) → makna (frame) → rangkai ulang (realisasi
gramatikal)**. Kalimat jawaban TIDAK PERNAH disimpan utuh; ia dirakit saat itu
juga dari (a) leksikon, (b) tata bahasa, (c) fakta PENGETAHUAN, (d) morfologi.
Bukti anti-reprogram: soal ujian dibangkitkan acak berisi kombinasi/angka yang
tidak pernah ada di berkas sumber → kaleng mustahil menjawabnya.

## 2. TATA BAHASA FORM = GRAMATIKA BEBAS-KONTEKS BERBOBOT (CFG-W)

Rumus inti (sisi kiri → sisi kanan, berbobot w): G = (N, Σ, P, S).

Bahasa Inggris (kelompok aturan GR-EN, fondasi kelompok jurnal tata bahasa EN):
```
S    → NP VP                | AUX NP VP            | WHQ
WHQ  → WH AUX NP VP         | WH AUX NP            | WH NP VP
NP   → PRON | PROP | DET N  | DET ADJ N | NUM N    | NP PP | DET ADJP N
VP   → V | V NP | V NP NP   | V PP | V NP PP      | AUX V | COP ADJP | COP NP
PP   → P NP                 ADJP → ADJ | ADV ADJ  | ADJ PP
NEG  → AUX ADV-bukan        (do-support: do/does/did + not + V)
```
Bahasa Indonesia (kelompok aturan GR-ID, fondasi kelompok jurnal tata bahasa ID):
```
S    → NP VP | VP NP                  | APA-TANYA | WH-TANYA
VP   → (ASPEK) V (NP) (PP)            ASPEK → sudah | sedang | akan | belum
NP   → PRON | PROP | N | N N | NUM N | N ADJ | NP PP   (tanpa artikel — hukum ID)
TANYA→ apa itu NP | apakah NP VP | WH NP VP | berapa NP
```
Bobot w per aturan dipakai memilih Realisasi terbaik dan menilai parse terbaik.
Tidak ada satuan kalimat utuh di sini — hanya komposisi.

## 3. MORFOLOGI = ATURAN TULIS-ULANG (REWRITE RULES), BUKAN TABEL KALENG

Inggris (GR-MORF-EN):
```
V(3sg)  : V → V+z (pass→passes), V+z→V+es? tidak: -s/-es/-ies (fly→flies)
N(plur) : N → N+s | N+es | Cy→Cies; irreguler: man→men, child→children, fish→fish
V(past) : V → V+ed | V+d | Cy→Cied; CVC-ganda stop→stopped; irreguler go→went
V(ing)  : V → V+ing | e-lepas (make→making); ganda run→running
Deriv   : un-X, X-ly (quick→quickly), X-ness, X-er (agent: trade→trader)
```
Indonesia (GR-MORF-ID) — alofon meN- sebagai rumus, bukan hafalan:
```
meN-+s → meny- (sapu→menyapu)
meN-+p → mem-∅ (pukul→memukul)
meN-+t → men-∅ (tulis→menulis)
meN-+k → meng-∅ (gambar? tidak: gambar→menggambar lewat g; k: kirim→mengirim)
meN-+b/d/c/j → memb-/mend-/menc-/menj- (baca→membaca, dengar→mendengar, jawab→menjawab)
meN-+m → mem-∅ (masak→memasak)
meN-+vokal → meng- (ambil→mengambil)
ber- (jalan→berjalan, kerja→bekerja, ajar→belajar), di- (pasif), ter-,
peN- (tulis→penulis, dagang→pedagang), reduplikasi (buku→buku-buku)
```
Setiap rumus morfologi bisa dijalankan dua arah: bentuk→asal (untuk parse) dan
asal→bentuk (untuk realisasi). Kata yang belum pernah didengar tetap bisa
dibentuk/urai — itu sebabnya dia tidak gagap di kata baru yang sah.

## 4. SEMANTI = PENGABUNGAN FRAME (FRAME MERGE) DENGAN PERAN

Makna kalimat = frame F = {pred, agen, tema, penerima, lokasi, waktu, aspek,
negasi, mod, tanya:{jenis, wh}}. Aturan CFG membawa operasi gabungan:
contoh `VP → V NP` berarti F(VP) = F(V) ⊕ F(NP) di mana F(NP) mengisi slot
`tema`. Peran diikat dari posisi struktural (EN: agen di depan V; ID: S-P-O).
Referensi diselesaikan lewat PENGETAHUAN (jaringan makna dua bahasa — fish/ikan
satu entitas yang sama): `bisa(ikan,renang)=1`, `bisa(ikan,terbang)=0`.

## 5. JAWAB = FUNGSI MAKNA → BENTUK (BUKAN PENCARIAN KALENG)

Jenis tanya dan rumus jawabnya (semua realisasi lewat CFG §2 + morfologi §3):
```
ya-tidak  : cek fakta f → rangkai [ya|tidak] + pernyataan(f) + satu-fakta-kait
apa-itu   : definisi(kelas + ciri) dari PENGETAHUAN
siapa/kapan/di-mana/mengapa/bagaimana/berapa : slot frame → fakta slot
matematika: hitung nyata (a op b), angka dari soal dihitung, bukan dihafal
bahasa    : morfologi hidup (plural/past) + kamus dua arah EN↔ID + rangkai kalimat
diri      : fakta-diri (nama, rumah, pekerjaan, bahasa, tuan, pakem BUY 5 baris)
greeting  : jam dunia NYATA (pagi/siang/sore/malam; morning/afternoon/evening)
tak-tahu  : kata asing → jujur "belum tahu" + DIA BERTANYA balik (bukan ngarang)
```
Variasi kalimat datang dari (a) pilihan sinonom berbobot, (b) urutan gramatikal
yang sah (ID: S-P-O vs P-S-O), (c) penambahan satu fakta kait — makna tetap satu,
bentuk beragam. Kecepatan: seluruh alur sinkron di perangkat — milidetik (realtime).

## 6. MEMERIKSA REALTIME — DIA MENGUJI BICARANYA SENDIRI

Setiap jawaban: (1) diurai KEMBALI dengan parser §2 — gagal = diperbaiki
(sederhanakan adverbial, rangkai ulang); (2) dilabeli bahasa; (3) dilabeli sumber
fakta; (4) dihitung waktunya. Semua langkah tampil di tab BICARA (jejak
terbuka — bukti dia sadar merangkai, bukan mengeluarkan kaleng).

## 7. WUJUD BINER MATEMATIKA MURNI (BAHASA/BINER-PAHAM.json)

Warisan epok V341 (kata-bit `bitDari`): label deterministik → bit 0/1. Kini
dipakai untuk BAHASA: setiap aturan CFG (GR-EN-*, GR-ID-*), setiap kelompok
morfologi, setiap fakta PENGETAHUAN, dan setiap kelompok jurnal diberi kata-bit.
Ditambah **kode produksi biner**: tabel simbol (setiap simbol → kode 9-bit),
aturan CFG ditulis ulang jadi rangkaian bit → hex; mesin punya `dekoderBiner`
dan uji bolak-balik (encode→decode = asal) dijalankan saat hidup. Segel file
dihitung sha256 — geser satu bit, segel jatuh.

## 8. PETA JURNAL → RUMUS (JEJAK BELAJAR, NOL KARANGAN)

| Kelompok rumus | Sumber belajar (berkas) | Pokok yang diserap |
|---|---|---|
| GR-EN (CFG) | JURNAL-EN-100.md — klaster tata bahasa/sintaksis/pemerolehan (jejak carian en01-en05, en20-en21, en40-en42, en49-en50) | struktur kalimat, tanya, negasi |
| GR-MORF-EN | JURNAL-EN-100.md — klaster morfologi/kosakata (en06, en21, en24, en49) | bentuk kata, turunan |
| KETERAMPILAN-EN | JURNAL-EN-100.md — klaster menulis/bicara/membaca/mendengar (en07-en10, en22-en23, en25-en29) | merangkai kalimat benar & beragam |
| GR-ID (CFG) | JURNAL-ID-100.md — klaster sintaksis (id01, id10, id19, id20) | S-P-O, kalimat tanya |
| GR-MORF-ID | JURNAL-ID-100.md — klaster morfologi/afiksasi (id02, id20) | meN-, ber-, di-, peN-, reduplikasi |
| SEMANTIK-PRAGMATIK | JURNAL-ID-100.md — klaster semantik/makna/wacana (id07, id08, id10) | frame, peran, konteks |
| KETERAMPILAN-ID | JURNAL-ID-100.md — klaster keterampilan berbahasa (id03-id06, id16-id18, id21-id23) | kosakata, menulis, membaca, bicara |
| PENGELOLAAN-BAHASA | kedua berkas — klaster motivasi/strategi/metakognitif (en11, en22-en23, en26, id12, id22) | deteksi bahasa, memori konteks |

Kepatuhan: kode produksi biner, kata-bit, dan segel di atas semuanya bisa
dihitung ulang; tak ada satu kalimat jawaban pun disimpan utuh di mana pun.
