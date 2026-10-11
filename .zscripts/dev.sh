#!/bin/bash
# ============================================================
# PENJAGA SERVER ARENA AGI — v2 produksi anti-OOM
# Dipanggil platform saat boot (start.sh → .zscripts/dev.sh).
# Prinsip:
#   1. Mode PRODUKSI standalone (ringan ~400 MB), bukan dev (1,8 GB → OOM).
#   2. Heap cap eksplisit agar OOM killer tak pernah menyambar.
#   3. Loop penjaga: kalau port 3000 mati → nyalakan ulang sendiri.
#   4. Skrip TIDAK PERNAH keluar (tanpa set -e) — hidup sepanjang wadah.
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

export NODE_OPTIONS="--max-old-space-size=1536"
RUN_LOG="$SCRIPT_DIR/dev-run.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$RUN_LOG"; }

port_hidup() { (exec 3<>/dev/tcp/127.0.0.1/3000) 2>/dev/null && exec 3>&- && return 0; return 1; }

log "=== PENJAGA mulai (pid $$) ==="

# --- 1. Dependensi (hanya bila hilang setelah restore repo.tar) ---
if [ ! -d node_modules ]; then
  log "node_modules hilang → bun install"
  bun install >> "$RUN_LOG" 2>&1 || log "bun install GAGAL (lanjut)"
fi

# --- 2. Skema database (toleran gagal — db lama tetap dipakai) ---
bun run db:push >> "$RUN_LOG" 2>&1 || log "db:push gagal (abaikan)"

# --- 3. Build produksi bila artefak standalone belum ada ---
if [ ! -f .next/standalone/server.js ]; then
  log "standalone hilang → build produksi (heap 2048)"
  NODE_OPTIONS="--max-old-space-size=2048" bun run build >> "$RUN_LOG" 2>&1 \
    || log "build GAGAL — akan pakai dev sebagai jalan terakhir"
fi
# Pastikan aset statis menempel pada paket standalone
if [ -f .next/standalone/server.js ] && [ ! -d .next/standalone/.next/static ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null
  cp -r public .next/standalone/ 2>/dev/null
fi

# --- 4. Loop penjaga (selamanya) ---
while true; do
  if ! port_hidup; then
    if [ -f .next/standalone/server.js ]; then
      log "port 3000 mati → nyalakan PRODUKSI standalone"
      ( cd .next/standalone && \
        NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1536" \
        PORT=3000 HOSTNAME=0.0.0.0 bun server.js ) >> "$RUN_LOG" 2>&1 &
    else
      log "port 3000 mati & standalone tak ada → dev jalan terakhir"
      bun run dev >> "$RUN_LOG" 2>&1 &
    fi
    sleep 8
  fi
  sleep 20
done
