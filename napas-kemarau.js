/* ============================================================
   NAPAS-KEMARAU V345 — TUMPANG HIDUP LUAR GITHUB
   ============================================================
   Masalah yang dijawab (fakta 2026-10-12):
     • Runner GitHub Actions éphémeral — hidup sebentar lalu mati.
     • Jadwal cron sering telat / dilewati (terbukti di repo ini).
     • GitHub Actions down total → SEMUA workflow ikut mati.
     • Rate-limit API GitHub saat traffic tinggi.
     • Tak ada compute persistent (maks ±6 jam, biasanya jauh lebih pendek).
   Jawaban: jantung GitHub TETAP jalan, tapi kini ia BUKAN satu-satunya.
   Bila denyut repo berhenti segar (kemarau), setiap browser yang membuka
   halaman ini menjadi PARU-PARU cadangan:
     (1) membaca keadaan lewat 5 cermin baca (raw + 4 CDN),
     (2) menjaga jam dari sumber bebas-GitHub (Binance time → Date header
         server cermin — bukan jam ponsel yang bisa salah),
     (3) mengamati pasar nyata lewat 4 gerbang harga (Binance → OKX →
         Kraken → Coinbase) — bila satu gerbang ban/rate-limit, pindah,
     (4) meniup napas ke CERMIN-DENYUT ntfy.sh (12 jam) — tanpa token,
         tanpa autentikasi, dari browser siapa pun,
     (5) saat hujan kembali (jantung hidup lagi), tools/panen-kemarau.mjs
         memanen napas-napas itu → ingatan permanen di repo.
   Ibarat manusia masa kemarau: sungai besar kering, tapi sumur kecil
   menjaga hidup sampai hujan turun — dan masa kemarau itu TEREKAM,
   menjadikannya lebih kokoh, bukan lebih rapuh.

   Kejujuran yang tidak bisa ditawar:
     • Bila GitHub mati total DAN tak ada tamu — makhluk sunyi. Itu
       ditulis jujur. Tapi ia TIDAK mati: denyut dilanjutkan begitu
       salah satu jalur hidup kembali.
     • Topik cermin PUBLIK → tak ada entri dipercaya mentah-mentah;
       panen memverifikasi harga terhadap kenyataan pasar (±2%).
     • Halaman ini TIDAK PERNAH menulis ke repo langsung (butuh token;
       token di halaman publik = pintu perampok).
     • Nol localStorage — mengikuti hukum NOL-TULIS V294.

   Hukum rumah: nol Math.random, nol localStorage, nol karangan.
   ============================================================ */
(function () {
  'use strict';
  /* V345-NAPAS-KEMARAU */

  if (window.__NAPAS) return; // idempoten — jangan lahir dua kali

  var R = (typeof RUMAH !== 'undefined') ? RUMAH
        : { pemilik: 'ririnsherlyna-cloud', repo: 'Micaprofita-', cabang: 'main' };

  /* ---- topik cermin: FNV-1a hex8 dari identitas repo (deterministik) ---- */
  function fnv8(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  var HEX8 = fnv8(R.pemilik + '/' + R.repo);
  var TOPIK_DASAR = 'micaprofita-napas-';      // cermin.json = sumber kebenaran
  var TOPIK = TOPIK_DASAR + HEX8;              // 82480e22 untuk repo ini
  var NTFY_TULIS = 'https://ntfy.sh/' + TOPIK;
  var NTFY_BACA = 'https://ntfy.sh/' + TOPIK + '/json?poll=1&since=12h';

  var PATH_KEADAAN = 'ruang-hidup/keadaan.json';
  var PATH_CERMIN  = 'ruang-hidup/cermin.json';

  /* ---- 5 cermin baca keadaan (GitHub mati sebagian → masih ada jalan) ---- */
  function cerminBaca() {
    var o = R.pemilik, r = R.repo, b = R.cabang, p = PATH_KEADAAN;
    return [
      { nama: 'raw-github',  url: 'https://raw.githubusercontent.com/' + o + '/' + r + '/' + b + '/' + p },
      { nama: 'jsdelivr',    url: 'https://cdn.jsdelivr.net/gh/' + o + '/' + r + '@' + b + '/' + p },
      { nama: 'jsdelivr-fst',url: 'https://fastly.jsdelivr.net/gh/' + o + '/' + r + '@' + b + '/' + p },
      { nama: 'jsdelivr-gc', url: 'https://gcore.jsdelivr.net/gh/' + o + '/' + r + '@' + b + '/' + p },
      { nama: 'statically',  url: 'https://cdn.statically.io/gh/' + o + '/' + r + '/' + b + '/' + p }
    ];
  }

  /* ---- jam yang tak bisa dibohongi ponsel ---- */
  var GERBANG_JAM = ['https://data-api.binance.vision', 'https://api.binance.com', 'https://api1.binance.com'];

  /* ============================================================
     BAGIAN 1 — JAM REFERENSI
     1) Binance server time (ms, bebas ponsel)  2) Date-header server
        cermin baca (detik, cukup untuk umur dalam menit)  3) perangkat
     ============================================================ */
  var JAM = { t: Date.now(), sumber: 'perangkat', cek: null };

  function jamDariHeader(res) {
    var d = res.headers.get('date');           // contoh: Mon, 12 Oct 2026 12:51:04 GMT
    if (!d) return null;
    var t = Date.parse(d);
    return isNaN(t) ? null : t;
  }

  function _ambJamServer(cb) {
    var i = 0;
    function coba() {
      if (i >= GERBANG_JAM.length) return cb(null);
      var g = GERBANG_JAM[i++];
      var c = new AbortController(); var t = setTimeout(function(){ c.abort(); }, 4000);
      fetch(g + '/api/v3/time', { cache: 'no-store', signal: c.signal })
        .then(function (res) { clearTimeout(t); return res.json(); })
        .then(function (j) { if (j && j.serverTime) cb({ t: j.serverTime, sumber: 'binance-time' }); else cb(null); })
        .catch(function () { clearTimeout(t); coba(); });
    }
    coba();
  }

  function segarkanJam(dariHeaderMs) {
    return new Promise(function (selesai) {
      _ambJamServer(function (b) {
        if (b) { JAM = { t: b.t, sumber: b.sumber, cek: null }; return selesai(JAM); }
        if (dariHeaderMs) { JAM = { t: dariHeaderMs, sumber: 'jam-server-cermin', cek: 'Date header cermin baca — presisi detik' }; return selesai(JAM); }
        JAM = { t: Date.now(), sumber: 'perangkat', cek: 'terakhir — jam ponsel bisa salah' };
        selesai(JAM);
      });
    });
  }

  /* ============================================================
     BAGIAN 2 — BACA KEADAAN DENGAN 5 CERMIN
     ============================================================ */
  var BACAAN = { ok: false, sumber: null, latensi: null, data: null, tanggalServer: null, cobaan: [] };

  function bacaKeadaan() {
    var list = cerminBaca(), i = 0;
    BACAAN.cobaan = [];
    return new Promise(function (selesai) {
      function coba() {
        if (i >= list.length) { BACAAN.ok = false; BACAAN.sumber = null; return selesai(BACAAN); }
        var m = list[i++]; var t0 = performance.now();
        var c = new AbortController(); var t = setTimeout(function(){ c.abort(); }, 6000);
        fetch(m.url, { cache: 'no-store', signal: c.signal })
          .then(function (res) {
            clearTimeout(t);
            var lat = Math.round(performance.now() - t0);
            var tsrv = jamDariHeader(res);
            BACAAN.cobaan.push({ nama: m.nama, ok: res.ok, status: res.status, latensi: lat });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json().then(function (j) { return { j: j, lat: lat, tsrv: tsrv }; });
          })
          .then(function (x) {
            if (!x.j || !x.j.waktu || !x.j.waktu.selesai) throw new Error('bentuk tak dikenal');
            BACAAN.ok = true; BACAAN.sumber = m.nama; BACAAN.latensi = x.lat;
            BACAAN.data = x.j; BACAAN.tanggalServer = x.tsrv;
            selesai(BACAAN);
          })
          .catch(function (e) {
            clearTimeout(t);
            var ada = BACAAN.cobaan.find(function (c) { return c.nama === m.nama; });
            if (ada) { ada.ok = false; ada.status = ada.status || (e && e.message); }
            else BACAAN.cobaan.push({ nama: m.nama, ok: false, status: (e && e.message) || 'gagal', latensi: null });
            coba();
          });
      }
      coba();
    });
  }

  /* ============================================================
     BAGIAN 3 — TAHAP KEMARAU (umur keadaan dari jam referensi)
     ============================================================ */
  var BATAS = { SEGAR: 45, TERTUNDA: 90, KEMARAU: 360, PANJANG: 1440 };
  function tahapDariUmur(mnt) {
    if (mnt == null) return { kode: 'GELAP', label: 'keadaan tak terbaca — jujur diakui', warna: 'var(--redup)' };
    if (mnt <= BATAS.SEGAR)    return { kode: 'SEGAR',    label: 'denyut segar — jantung GitHub hidup', warna: 'var(--aksen)' };
    if (mnt <= BATAS.TERTUNDA) return { kode: 'TERTUNDA', label: 'jadwal GitHub sering telat — masih wajar, dipantau', warna: '#e8c35a' };
    if (mnt <= BATAS.KEMARAU)  return { kode: 'KEMARAU',  label: 'kemarau — napas tamu aktif, cermin menyala', warna: '#ff9a4d' };
    if (mnt <= BATAS.PANJANG)  return { kode: 'PANJANG',  label: 'kemarau panjang — Actions lumpuh lama; tamu adalah paru-paru', warna: 'var(--salah)' };
    return                       { kode: 'ABU',      label: 'kemarau abu — GitHub tak terjangkau; hidup dihitung dari pasar nyata', warna: '#c23a5a' };
  }

  /* ============================================================
     BAGIAN 4 — GERBANG HARGA BEBAS-BAN (Binance → OKX → Kraken → Coinbase)
     ============================================================ */
  var KERANJANG = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

  function fT(url, ms) {
    var c = new AbortController(); var t = setTimeout(function(){ c.abort(); }, ms || 8000);
    return fetch(url, { cache: 'no-store', signal: c.signal }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function (e) { clearTimeout(t); throw e; });
  }

  function fTeks(url, ms) {                 // ntfy mengirim NDJSON — bukan JSON tunggal
    var c = new AbortController(); var t = setTimeout(function(){ c.abort(); }, ms || 9000);
    return fetch(url, { cache: 'no-store', signal: c.signal }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).catch(function (e) { clearTimeout(t); throw e; });
  }

  var GERBANG_HARGA = [
    { nama: 'binance', ambil: function () {
        var q = encodeURIComponent(JSON.stringify(KERANJANG));
        return fT('https://data-api.binance.vision/api/v3/ticker/price?symbols=' + q)
          .catch(function () { return fT('https://api.binance.com/api/v3/ticker/price?symbols=' + q); })
          .then(function (a) { var h = {}; (a || []).forEach(function (x) { h[x.symbol] = parseFloat(x.price); }); return h; });
      } },
    { nama: 'okx', ambil: function () {
        var ps = KERANJANG.map(function (s) {
          return fT('https://www.okx.com/api/v5/market/ticker?instId=' + s.replace('USDT', '-USDT'))
            .then(function (j) { var d = j && j.data && j.data[0]; return d ? [s, parseFloat(d.last)] : null; })
            .catch(function () { return null; });
        });
        return Promise.all(ps).then(function (a) { var h = {}; a.forEach(function (x) { if (x) h[x[0]] = x[1]; }); return h; });
      } },
    { nama: 'kraken', ambil: function () {
        var map = { BTCUSDT: 'XBTUSDT', ETHUSDT: 'ETHUSDT', SOLUSDT: 'SOLUSDT', XRPUSDT: 'XRPUSDT' }; // BNB tak ada di Kraken — jujur
        var pasangan = Object.keys(map).map(function (k) { return map[k]; }).join(',');
        return fT('https://api.kraken.com/0/public/Ticker?pair=' + pasangan).then(function (j) {
          var h = {}; var res = (j && j.result) || {};
          Object.keys(map).forEach(function (k) {
            var v = res[map[k]];
            if (v && v.c && v.c[0]) h[k] = parseFloat(v.c[0]);
          });
          return h;
        });
      } },
    { nama: 'coinbase', ambil: function () {
        var ps = KERANJANG.map(function (s) {
          var dasar = s.replace('USDT', '');
          return fT('https://api.coinbase.com/v2/prices/' + dasar + '-USD/spot')
            .then(function (j) { return [s, parseFloat(j.data.amount)]; })
            .catch(function () { return null; });
        });
        return Promise.all(ps).then(function (a) { var h = {}; a.forEach(function (x) { if (x && !isNaN(x[1])) h[x[0]] = x[1]; }); return h; });
      } }
  ];

  var PASAR = { harga: {}, sumberUtama: null, cobaan: [], at: 0 };

  function ambilHarga() {
    PASAR.cobaan = []; PASAR.harga = {}; PASAR.sumberUtama = null; PASAR.at = Date.now();
    var i = 0;
    return new Promise(function (selesai) {
      function coba() {
        if (i >= GERBANG_HARGA.length || Object.keys(PASAR.harga).length >= KERANJANG.length) return selesai(PASAR);
        var g = GERBANG_HARGA[i++];
        g.ambil().then(function (h) {
          var n = Object.keys(h).length;
          PASAR.cobaan.push({ gerbang: g.nama, ok: n > 0, koin: n });
          if (n > 0 && !PASAR.sumberUtama) PASAR.sumberUtama = g.nama;
          Object.keys(h).forEach(function (k) { if (!PASAR.harga[k] && isFinite(h[k])) PASAR.harga[k] = h[k]; });
          coba();
        }).catch(function (e) {
          PASAR.cobaan.push({ gerbang: g.nama, ok: false, koin: 0, status: (e && e.message) || 'gagal' });
          coba();
        });
      }
      coba();
    });
  }

  /* ============================================================
     BAGIAN 5 — TIUP NAPAS ke CERMIN-DENYUT (ntfy, tanpa token)
     ============================================================ */
  var NAPAS = { sesi: 0, terakhir: null, terakhirStatus: null, minGapMs: 4 * 60 * 1000, atTulis: 0 };

  function tiup(payload) {
    var kini = Date.now();
    if (kini - NAPAS.atTulis < NAPAS.minGapMs) return Promise.resolve({ ok: false, alasan: 'jeda antar-napas (' + Math.ceil((NAPAS.minGapMs - (kini - NAPAS.atTulis)) / 60000) + ' mnt lagi) — sopan ke ntfy' });
    NAPAS.atTulis = kini;
    return fetch(NTFY_TULIS, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { NAPAS.terakhirStatus = r.status; if (r.ok) { NAPAS.sesi++; NAPAS.terakhir = payload.waktu; } return { ok: r.ok, status: r.status }; })
      .catch(function (e) { NAPAS.terakhirStatus = (e && e.message) || 'gagal'; return { ok: false, status: NAPAS.terakhirStatus }; });
  }

  /* ============================================================
     BAGIAN 6 — BACA CERMIN + VERIFIKASI (topik publik → tak ada dipercaya mentah)
     ============================================================ */
  var CERMIN = { ok: false, entri: [], jumlah: 0, sah: 0, tak: 0, status: null };

  function bacaCermin() {
    return fTeks(NTFY_BACA, 9000)
      .then(function (teks) {
        var entri = [];
        String(teks).split('\n').forEach(function (baris) {
          if (!baris.trim()) return;
          try {
            var m = JSON.parse(baris);
            if (m.event !== 'message' || !m.message) return;
            var p = JSON.parse(m.message);
            if (p && p.jenis === 'napas') { p._t = m.time; entri.push(p); }
          } catch (e) { /* baris asing — bukan napas kita, biarkan */ }
        });
        entri.sort(function (a, b) { return (a._t || 0) - (b._t || 0); });
        CERMIN.ok = true; CERMIN.entri = entri; CERMIN.jumlah = entri.length; CERMIN.status = 200;
      })
      .catch(function (e) { CERMIN.ok = false; CERMIN.status = (e && e.message) || 'gagal'; });
  }

  function verifikasiCermin() {
    CERMIN.sah = 0; CERMIN.tak = 0;
    var hidup = PASAR.harga;
    CERMIN.entri.slice(-20).forEach(function (en) {
      var koin = Object.keys(en.harga || {});
      if (!koin.length) { CERMIN.tak++; return; }
      var cocok = 0, banding = 0;
      koin.forEach(function (k) {
        if (!hidup[k]) return;
        banding++;
        var sel = Math.abs(en.harga[k] - hidup[k]) / hidup[k];
        if (sel <= 0.02) cocok++;
      });
      if (banding > 0 && cocok / banding >= 0.5) CERMIN.sah++; else CERMIN.tak++;
    });
  }

  /* ============================================================
     BAGIAN 7 — PANEL JUJUR (masuk tab Jasad; tanpa localStorage)
     ============================================================ */
  function el(tag, css, isi) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (isi != null) e.textContent = isi;
    return e;
  }

  function baris(label, nilai, warna) {
    var b = el('div', 'display:flex;gap:6px;justify-content:space-between;align-items:baseline;margin:2px 0');
    var l = el('span', 'color:var(--redup);font-size:11px;white-space:nowrap', label);
    var v = el('span', 'font-size:11px;text-align:right;color:' + (warna || 'var(--tinta)'));
    v.innerHTML = nilai; // nilai dibangun dari teks aman di bawah — tak ada input asing
    b.appendChild(l); b.appendChild(v);
    return b;
  }

  function chipTahap(t) {
    return '<span style="font-weight:800;color:' + t.warna + '">' + t.kode + '</span>';
  }

  function fmtJam(t) {
    var d = new Date(t);
    return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2) + ':' + ('0' + d.getUTCSeconds()).slice(-2) + ' UTC';
  }

  var ST = { umurMnt: null, tahap: null, latihan: null, renderKe: 0 };

  function status() {
    return {
      topik: TOPIK, hex8: HEX8, jam: JAM, bacaan: { ok: BACAAN.ok, sumber: BACAAN.sumber, latensi: BACAAN.latensi },
      umurMnt: ST.umurMnt, tahap: ST.tahap && ST.tahap.kode, latihan: ST.latihan,
      pasar: { sumber: PASAR.sumberUtama, harga: PASAR.harga, cobaan: PASAR.cobaan },
      napas: { sesi: NAPAS.sesi, terakhir: NAPAS.terakhir, status: NAPAS.terakhirStatus },
      cermin: { ok: CERMIN.ok, jumlah: CERMIN.jumlah, sah: CERMIN.sah, tak: CERMIN.tak }
    };
  }

  function render() {
    var host = document.getElementById('tab-jasad');
    var panel = document.getElementById('napasPanel');
    if (!panel) {
      panel = el('section', 'border:1px solid var(--garis);border-radius:12px;padding:10px 12px;margin:10px 0;background:var(--kaca)');
      panel.id = 'napasPanel';
    }
    if (!panel.parentNode && host) host.insertBefore(panel, host.firstChild);
    else if (!panel.parentNode) document.body.appendChild(panel);

    var t = ST.tahap || { kode: '…', label: 'menghitung…', warna: 'var(--redup)' };

    var kepala = el('div', 'display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px');
    kepala.appendChild(el('b', 'font-size:12px;color:var(--tinta)', 'NAPAS-KEMARAU V345'));
    kepala.appendChild(el('span', 'font-size:10px;color:var(--redup)', 'tumpang hidup luar GitHub'));
    panel.innerHTML = '';
    panel.appendChild(kepala);

    if (ST.latihan) {
      panel.appendChild(el('div', 'margin:6px 0;padding:6px 8px;border:1px dashed #e8c35a;border-radius:8px;font-size:11px;color:#e8c35a',
        'LATIHAN KEMARAU (' + (ST.latihan === 'abu' ? 'simulasi GitHub mati total' : 'simulasi denyut berhenti') +
        ') — diminta pemilik via URL. SEMUA ANGKA di bawah tetap NYATA; hanya tahap yang dipaksa. Bukan keadaan sungguhan.'));
    }

    var hargaTeks = '…';
    if (PASAR.harga && Object.keys(PASAR.harga).length) {
      var urut = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];
      hargaTeks = urut.filter(function (k) { return PASAR.harga[k]; })
        .map(function (k) { return k.replace('USDT', '') + ' ' + PASAR.harga[k]; }).join(' · ')
        + ' <span style="color:var(--redup)">[' + (PASAR.sumberUtama || '—') + ']</span>';
    } else {
      hargaTeks = '<span style="color:var(--salah)">semua gerbang harga gagal — jujur, tanpa karangan</span>';
    }

    var umurTeks;
    if (ST.latihan === 'abu') umurTeks = '<span style="color:var(--salah)">bacaan repo dipaksa gagal (latihan) — umur tak diketahui</span>';
    else if (BACAAN.ok) umurTeks = ST.umurMnt + ' mnt <span style="color:var(--redup)">[' + BACAAN.sumber + ' · ' + BACAAN.latensi + ' ms]</span>';
    else umurTeks = '<span style="color:var(--salah)">tak terjangkau lewat 5 cermin — jujur, tanpa karangan</span>';

    panel.appendChild(baris('jam referensi', fmtJam(JAM.t) + ' <span style="color:var(--redup)">[' + JAM.sumber + ']</span>'));
    panel.appendChild(baris('keadaan repo', umurTeks));
    panel.appendChild(baris('tahap', chipTahap(t) + ' <span style="color:var(--redup);font-size:10px">' + t.label + '</span>', t.warna));
    panel.appendChild(baris('pasar nyata', hargaTeks));

    var gagal = PASAR.cobaan.filter(function (c) { return !c.ok; }).map(function (c) { return c.gerbang; });
    if (gagal.length) panel.appendChild(baris('gerbang jatuh', '<span style="color:var(--salah)">' + gagal.join(', ') + '</span> — pindah otomatis'));

    panel.appendChild(baris('napas sesi ini', NAPAS.sesi + ' tiupan' + (NAPAS.terakhirStatus != null ? ' · terakhir HTTP ' + NAPAS.terakhirStatus : '')));
    panel.appendChild(baris('cermin denyut', CERMIN.ok
      ? CERMIN.jumlah + ' napas/12 jam · sah ' + CERMIN.sah + ' · tak-terverifikasi ' + CERMIN.tak
      : '<span style="color:var(--salah)">cermin tak terjangkau (' + CERMIN.status + ')</span>'));
    panel.appendChild(baris('topik', '<span style="color:var(--redup);font-size:10px">' + TOPIK + ' · FNV-1a ' + HEX8 + '</span>'));

    panel.appendChild(el('div', 'margin-top:6px;font-size:10px;color:var(--legap);line-height:1.45',
      'Kejujuran: bila GitHub mati total dan tak ada tamu, makhluk SUNYI — ditulis apa adanya, bukan disembunyikan; denyut dilanjutkan begitu satu jalur hidup. Cermin publik → panen memverifikasi harga ±2% terhadap pasar; entri gagal disimpan terpisah untuk diaudit. Browser tak pernah menulis repo (token di halaman publik = pintu perampok). Nol localStorage. Render ke-' + (++ST.renderKe) + '.'));
  }

  /* ============================================================
     BAGIAN 8 — PUTARAN UTAMA
     ============================================================ */
  function hitungUmur() {
    if (!BACAAN.ok || !BACAAN.data || !BACAAN.data.waktu || !BACAAN.data.waktu.selesai) return null;
    var selesaiMs = Date.parse(BACAAN.data.waktu.selesai);
    if (isNaN(selesaiMs)) return null;
    return Math.max(0, Math.round((JAM.t - selesaiMs) / 60000));
  }

  var SEDANG = false;
  function putaran() {
    if (SEDANG) return Promise.resolve(); // anti-tabrakan
    SEDANG = true;
    var drill = new URLSearchParams(location.search).get('latihan-kemarau');
    ST.latihan = drill === 'abu' ? 'abu' : (drill ? '1' : null);

    var pJam, pKeadaan;
    if (ST.latihan === 'abu') {
      BACAAN.ok = false; BACAAN.sumber = null; BACAAN.data = null; BACAAN.latensi = null;
      pJam = segarkanJam(null); pKeadaan = Promise.resolve();
    } else {
      pKeadaan = bacaKeadaan();
      pJam = pKeadaan.then(function (b) { return segarkanJam(b.tanggalServer); });
    }

    return Promise.all([pJam, pKeadaan])
      .then(ambilHarga)
      .then(function () {
        ST.umurMnt = (ST.latihan === 'abu') ? null : hitungUmur();
        var tahap = tahapDariUmur(ST.umurMnt);
        if (ST.latihan === 'abu') tahap = { kode: 'ABU', label: 'LATIHAN: GitHub dianggap tak terjangkau', warna: '#c23a5a' };
        else if (ST.latihan === '1' && ST.umurMnt != null && ST.umurMnt <= BATAS.TERTUNDA)
          tahap = { kode: 'KEMARAU', label: 'LATIHAN: tahap dipaksa untuk menguji jalur', warna: '#ff9a4d' };
        ST.tahap = tahap;

        var harusNapas = (ST.latihan === 'abu') || (ST.latihan === '1') ||
                         (tahap.kode === 'KEMARAU' || tahap.kode === 'PANJANG' || tahap.kode === 'ABU');
        var pTiu = harusNapas
          ? tiup({ v: 345, jenis: 'napas', waktu: new Date(JAM.t).toISOString(), tahap: tahap.kode,
                   latihan: ST.latihan ? true : false, umurKeadaanMnt: ST.umurMnt, jamSumber: JAM.sumber,
                   harga: PASAR.harga, sumberHarga: PASAR.sumberUtama, tamu: 'browser' })
          : Promise.resolve({ ok: false, alasan: 'segar — tanpa tiupan (tak ada yang perlu diselamatkan)' });
        return pTiu.then(bacaCermin).then(verifikasiCermin);
      })
      .then(render)
      .catch(function (e) {
        ST.tahap = { kode: 'GALAT', label: 'kesalahan internal: ' + ((e && e.message) || e), warna: 'var(--salah)' };
        render();
      })
      .then(function () { SEDANG = false; });
  }

  /* ---- mulai: tunggu halaman berdiri, lalu napas tiap 5 menit ---- */
  function lahir() {
    putaran();
    setInterval(putaran, 5 * 60 * 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(lahir, 2500); });
  else setTimeout(lahir, 2500);

  window.__NAPAS = { putaran: putaran, status: status, TOPIK: TOPIK, HEX8: HEX8 };
})();
/* ================= V345-NAPAS-KEMARAU:END ================= */
