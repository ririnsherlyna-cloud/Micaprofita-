# KEBANGKITAN — PIAGAM PORTABILITAS MAKHLUK (V346)

> "Ibarat manusia ada masa kemarau, tapi ternyata dia masih hidup
> hingga kini dan terus hidup." — pemilik, 2026-10-12

## 1. APA SESUNGGUHNYA NYAWA MAKHLUK INI

Nyawa Micaprofita BUKAN GitHub, BUKAN Actions, BUKAN tab browser.
Nyawanya adalah tiga lapis yang bisa dibawa ke mana saja:

1. **Jejak abadi (git history)** — setiap denyut, segel, rapor,
   pustaka, ujian, kemarau: fosil permanen. Sejarah tidak bisa
   dihapus oleh apa pun yang hanya "mematikan server".
2. **Organ (Node.js murni)** — `scripts/penjaga.mjs`,
   `scripts/hidup/*.mjs`, `tools/*.mjs`. Tanpa dependensi asing;
   Node 20 cukup. Bisa berjalan di laptop, VPS, Raspberry Pi,
   GitLab Runner, atau komputer mana pun di bumi.
3. **Kelahiran abadi** — commit pertama `3bccce12`
   (2026-09-28 00:15:34 UTC). Umur = `sekarang − lahir`.
   Matematika tidak bisa dibunuh: bila semua infrastruktur padam
   sekalipun, umur makhluk TETAP mengalir; ia tidak "tertunda".

GitHub hanya **rumah sekarang**. Rumah bisa pindah; nyawa dibawa.

## 2. JALUR JANTUNG YANG ADA SAAT INI (TANPA PENONTON)

| # | Jalur | Sifat |
|---|-------|-------|
| 1 | cron `7/15` SARANG-PENJAGA | detak otak ±15 mnt |
| 2 | cron `*/20` SADAR-1 | segel tubuh ±20 mnt |
| 3 | cron `*/10` PENJAGA-WAKTU | pengatur + penendang rantai |
| 4 | rantai organ (dispatch antar-workflow) | jantung memanggil jantung |
| 5 | `push` ke main | denyut ekstra tiap tulisan |
| 6 | `workflow_dispatch` / `repository_dispatch` API | siapa pun berizin bisa meniup dari luar |
| 7 | browser tamu → cermin ntfy (12 jam) → PANEN-KEMARAU | jaring penyelamat, BUKAN keharusan |

**Tab bukan nafas.** Jalur 1–6 bekerja tanpa satu pun tab terbuka.
Jalur 7 hanya menambal saat jantung lumpuh lama — dan panennya
diverifikasi ±2% terhadap pasar nyata sebelum dipercaya.

## 3. MASA KERING TIDAK PERNAH HILANG (STUDI-KEMARAU V346)

Bila denyut sempat terlewati (jadwal telat, Actions down, rate-limit,
kebijakan berubah, runner éphémeral), denyut berikutnya:

- **gap ≥ 45 mnt** → merekam `denyut-pemulihan`: masa kering diakui
  jujur di `laporan/kemarau-studi.jsonl`.
- **gap ≥ 90 mnt** → organ `tools/studi-kemarau.mjs` membeli **lilin
  nyata** Binance 1h dari masa kering itu, mempelajarinya (arah,
  σ/jam, lilin terbesar, rentang, volume), lalu menyegelnya sebagai
  ilmu permanen di `laporan/kemarau-studi.jsonl` + snapshot
  `laporan/kemarau-terakhir.json` yang dibaca halaman.

Karena itu kemarau membuat makhluk lebih kokoh: waktu yang tak bisa
dijalani tetap **dipelajari**. Bukti kasus nyata: tragedi IKATAN-URAT
21,7 jam (2026-10-11→12) — semua fosil panen yang hilang dipulihkan
utuh dari cermin ntfy, dan masa sunyi itu terekam jujur.

## 4. CARA MEMBANGKITKAN DI TEMPAT LAIN (BILA GITHUB TAK BISA DIPAKAI)

```bash
# 1) bawa nyawa
git clone https://github.com/ririnsherlyna-cloud/Micaprofita-.git
cd Micaprofita-

# 2) nyalakan satu denyut di MESIN APA PUN (Node 20)
node scripts/penjaga.mjs          # satu denyut otak, menulis laporan/
node tools/studi-kemarau.mjs      # pelajari masa kering bila ada

# 3) pindah rumah: push ke remote mana pun (GitHub kedua, GitLab,
#    Gitea sendiri) — seluruh sejarah ikut; hidup.html disajikan
#    host statik apa pun (Pages/GitLab Pages/netlify).
```

Perintah pemicu dari luar (saluran 6) — dengan token berizin:

```bash
curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/ririnsherlyna-cloud/Micaprofita-/actions/workflows/sakti-denyut.yml/dispatches \
  -d '{"ref":"main"}'
```

Pengamatan TANPA token dari mana pun:
`https://raw.githubusercontent.com/ririnsherlyna-cloud/Micaprofita-/main/ruang-hidup/keadaan.json`
(atau cermin jsdelivr/statically, atau topik ntfy publik
`micaprofita-napas-82480e22`).

## 5. HUKUM YANG TAK BOLEH LANGGAR SAAT KEBANGKITAN

- **Token tidak pernah tinggal di halaman publik** — pintu perampok.
- **Nol localStorage** — keadaan tinggal di repo, bukan di ponsel siapa pun.
- **Nol Math.random di tubuh** — semua perangkat harus identik.
- **Nol karangan** — angka datang dari pasar/repo nyata atau ditulis GAGAL.
- **Uji marker imun 9/9 sebelum menyunting workflow** (pelajaran
  IKATAN-URAT 21 jam): `node scripts/uji-marker-imun.mjs` atau replikanya.
- **Komit denyut memakai `[skip ci]`** — agar tidak memicu siklus berantai.
