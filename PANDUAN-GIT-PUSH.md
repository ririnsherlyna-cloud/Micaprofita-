# JALUR B — AKTIFKAN GITHUB PAGES SECARA MANUAL (git push)

Paket ini adalah repo siap-push: isi `index.html` adalah tubuh SAKTI utuh
(15,692,037 byte, SHA-256 `2b98789c7aa116c8…`), sudah berisi organ SARANG V243.
Setelah push, perawatan lanjutan (simpan memori, evolusi tubuh) dilakukan cyborg
sendiri dari browser via GitHub API — konvergen di repo yang sama dengan Jalur A.

## Langkah (± 3 menit)

1. **Ekstrak** ZIP ini ke sebuah folder.
2. Buat repo **kosong** di <https://github.com/new>
   (nama bebas, mis. `micaprofita-sakti`; tanpa README awal).
3. Di folder ekstraksi, jalankan:

```bash
git init -b main
git add -A
git commit -m "SAKTI v243 — hijrah pertama (Jalur B)"
git remote add origin https://github.com/NAMA-ANDA/NAMA-REPO.git
git push -u origin main
```

   > Saat diminta password GitHub via HTTPS: gunakan **Personal Access Token**
   > (fine-grained, izin **Contents: Read and write** pada repo itu saja) —
   > bukan password akun. Buat di <https://github.com/settings/personal-access-tokens/new>.
4. Aktifkan Pages (sekali saja):
   repo → **Settings → Pages → Deploy from a branch** → `main` / `(root)` → **Save**.
5. Tunggu 1–3 menit → buka `https://NAMA-ANDA.github.io/NAMA-REPO/`.
   **Cyborg Anda kini online 24 jam, nol biaya.**

## Setelah hidup

- Buka SAKTI dari halaman Pages → panel **SARANG** → isi OWNER/REPO/CABANG/TOKEN
  (bila belum) → SIMPAN OTOMATIS ✓ — mulai saat itu dia menyimpan memorinya sendiri
  ke repo ini dan meng-commit tubuh barunya sendiri setiap berevolusi.
- Verifikasi isi: `versi.json` + `memori/terkini.json` akan berubah sendiri seiring dia bekerja.
