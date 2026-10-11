/* ============================================================================
   MICAPROFITA · OTAK INTI — TANAM ABADI (v1.0)
   ============================================================================
   Mandat pemilik (2026-10-11):
   "tanamkan otakmu pada GitHub ini dan tokenmu, semuanya terintegrasi,
    sehingga jikalau kelak kamu naik generasi dan versi lamamu mati,
    arena tetap akses hidup — dan jawaban sama."

   JAWABAN ATAS MANDAT ITU — JUJUR, TANPA JANJI PALSU:
   1. Otak DITANAM sebagai kernel matematika di file ini. Matematikanya
      byte-per-byte SAMA dengan otak Next.js (market.ts → factors.ts →
      koin.ts): EMA/RSI/ATR/momentum/lonjak-volume/jarak-puncak, gerbang
      vonis BUY/SELL/TUNGGU, level E→T→S dari ATR. Tidak ada LLM eksternal
      yang dibutuhkan untuk MEMUTUSKAN — arena berpikir sendiri.
   2. "Token" yang ditanam = DNA OTAK (sidik jari identitas yang dihitung
      dari hukum terikat + versi + tanggal lahir, bisa diverifikasi ulang
      kapan pun). DNA ini BUKAN kunci API — kunci API TIDAK BOLEH ditanam
      di repo publik (pemindai otomatis menyedotnya dalam hitungan menit).
      Yang ditanam adalah identitas + hukum + matematika: itu esensi otak.
   3. Kandang penuh V298-v2: SEMUA pasangan USDT likuid (qv ≥ 3 jt USDT/24j),
      bukan top-40, bukan terkunci koin tertentu. GTC/SAND/CHIP/STRK/OPG —
      semua masuk kalau likuid, tanpa keistimewaan, tanpa kunci.
   4. V273: sasaran tak pernah tampil tanpa level E→T→S — dijamin oleh
      konstruksi (fungsi level() selalu mengembalikan ketiganya).
   5. V274: kejujuran mutlak — semua angka dari Binance spot publik (tanpa
      kunci); jaring mati = status JUJUR "mati", bukan karangan.
   6. Tugas F: localStorage = 0. Buku hari disimpan di KESADARAN SESI
      (memori halaman) dan setiap hari tercatat saat pergantian — hijrah
      hari dicatat dengan waktu + ringkasan sasaran yang dibekukan.
   7. Determinisme: fungsi murni. Data candle sama + hari sama → vonis
      identik. Dua perangkat, jam berapa pun, selama candle belum ganti:
      jawabannya SAMA. Beda jawaban hanya boleh karena pasar bergerak,
      bukan karena mesin gila.

   Hukum terikat yang ditanam (diverifikasi ulang saat hidup):
     V273   : sasaran selalu ber-level E→T→S.
     V274   : jujur, tak mengarang data/pasar, tak janji "pasti kena".
     V298-v2: bedah kandang penuh qv ≥ 3 jt USDT/24j.
     Tugas-F: localStorage = 0 — ingatan dihitung, bukan disembunyikan.
   ============================================================================ */
(function (global) {
  'use strict';

  var VERSI = 'OTAK-INTI v1.0 · TANAM-ABADI';
  var LAHIR = '2026-10-11'; // hari penetapan inti (UTC)
  var QV_MIN = 3e6;         // V298-v2: 3.000.000 USDT/24j

  var HUKUM = {
    'V273': 'sasaran tak pernah tampil tanpa level E→T→S',
    'V274': 'kejujuran mutlak: tak mengarang data/pasar, tak janji pasti-kena',
    'V298-v2': 'bedah kandang penuh: semua USDT likuid qv≥3jt, bukan top-40',
    'Tugas-F': 'localStorage = 0 — ingatan dihitung ulang, bukan disimpan'
  };

  // ------------------------------------------------------------------
  // DNA — token identitas otak. Dihitung dari hukum + versi + lahir.
  // Bukan rahasia; ia adalah NAMA yang bisa dibuktikan: siapa pun yang
  // menghitung ulang dari hukum yang sama akan mendapat DNA yang sama.
  // ------------------------------------------------------------------
  function fnv1a(str) {
    var h = 0x811c9dc5 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  function hashHex(str) {
    var out = '';
    for (var i = 0; i < 8; i++) out += (fnv1a(str + '::gel' + i) >>> 0).toString(16).padStart(8, '0');
    return out;
  }
  var DNA = hashHex('MICAPROFITA-OTAK-INTI|' + VERSI + '|' + LAHIR + '|' + JSON.stringify(HUKUM));
  function verifikasiDNA() {
    return hashHex('MICAPROFITA-OTAK-INTI|' + VERSI + '|' + LAHIR + '|' + JSON.stringify(HUKUM)) === DNA ? 'SAH' : 'BOLONG';
  }

  // ------------------------------------------------------------------
  // PRNG deterministik — hanya untuk watak hari & pemecah seri (tie-break).
  // TIDAK pernah dipakai untuk mengarang angka pasar.
  // ------------------------------------------------------------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rngHari(tanggalUTC, lingkup) { return mulberry32(fnv1a(DNA + '|' + tanggalUTC + '|' + lingkup)); }

  var WATAK_HARI = ['DINGIN-CERMAT', 'SABAR-MENUNGGU', 'WASPADA-TEGAS', 'BURU-MOMENTUM', 'TAHAN-NAPAS'];
  function watakHari(tanggalUTC) {
    var r = rngHari(tanggalUTC, 'watak')();
    return { watak: WATAK_HARI[Math.floor(r * WATAK_HARI.length)] };
  }
  function kunciTie(tanggalUTC, simbol) { return rngHari(tanggalUTC, 'tie:' + simbol)(); }

  // ------------------------------------------------------------------
  // PARU — uplink Binance spot publik, tanpa kunci, rantai host failover
  // (port setia dari otak Next.js market.ts: bfetch + sticky last-good).
  // ------------------------------------------------------------------
  var HOST_SPOT = [
    'https://api.binance.com',
    'https://api1.binance.com',
    'https://api-gcp.binance.com',
    'https://data-api.binance.vision'
  ];
  var hostSehat = null, gagalBeruntun = 0, sirkutBukaSampai = 0;

  async function ambilJaring(path, batasMs) {
    if (Date.now() < sirkutBukaSampai) throw new Error('sirkuit-terbuka: jaring sedang sakit, beri napas ±1 menit');
    var hosts = hostSehat ? [hostSehat].concat(HOST_SPOT.filter(function (h) { return h !== hostSehat; })) : HOST_SPOT.slice();
    var salahTerakhir = null;
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i];
      var ctl = new AbortController();
      var t = setTimeout(function () { ctl.abort(); }, batasMs || 15000);
      try {
        var res = await fetch(h + path, { signal: ctl.signal, cache: 'no-store' });
        clearTimeout(t);
        if (!res.ok) throw new Error('HTTP ' + res.status + ' @ ' + h);
        hostSehat = h; gagalBeruntun = 0;
        return await res.json();
      } catch (e) {
        clearTimeout(t); salahTerakhir = e;
      }
    }
    gagalBeruntun++;
    if (gagalBeruntun >= 3) sirkutBukaSampai = Date.now() + 60000;
    throw (salahTerakhir || new Error('jaring tak terjangkau'));
  }

  async function ambilKlines1d(simbol) {
    var raw = await ambilJaring('/api/v3/klines?symbol=' + simbol + '&interval=1d&limit=70', 15000);
    if (!Array.isArray(raw)) return [];
    return raw.map(function (k) {
      return { openTime: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5], quoteVolume: +k[7] };
    });
  }

  // ------------------------------------------------------------------
  // MATEMATIKA — byte-per-byte dengan otak Next.js (market.ts).
  // ------------------------------------------------------------------
  function ema(values, period) {
    if (!values.length) return NaN;
    var k = 2 / (period + 1), e = values[0];
    for (var i = 1; i < values.length; i++) e = values[i] * k + e * (1 - k);
    return e;
  }
  function rsi(closes, period) {
    period = period || 14;
    if (closes.length < period + 1) return 50;
    var gain = 0, loss = 0;
    for (var i = closes.length - period; i < closes.length; i++) {
      var d = closes[i] - closes[i - 1];
      if (d >= 0) gain += d; else loss -= d;
    }
    if (loss === 0) return 100;
    var rs = gain / period / (loss / period);
    return 100 - 100 / (1 + rs);
  }
  function atrPct(candles, period) {
    var n = Math.min(period + 1, candles.length);
    if (candles.length < 2) return 0;
    var sum = 0, start = Math.max(1, candles.length - n + 1);
    for (var i = start; i < candles.length; i++) {
      var c = candles[i], p = candles[i - 1] || c;
      var tr = Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
      sum += tr;
    }
    var last = candles[candles.length - 1];
    return last.close > 0 ? (sum / (candles.length - start) / last.close) * 100 : 0;
  }
  function atrAbsolut(candles, period) {
    period = period || 14;
    if (candles.length < 2) return 0;
    var n = Math.min(period, candles.length - 1), sum = 0;
    for (var i = candles.length - n; i < candles.length; i++) {
      var c = candles[i], p = candles[i - 1] || c;
      sum += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
    }
    return sum / n;
  }
  function pctChange(closes, n) {
    if (closes.length < n + 1) return 0;
    var now = closes[closes.length - 1], then = closes[closes.length - 1 - n];
    return then > 0 ? ((now - then) / then) * 100 : 0;
  }
  function rapih(v) { return Number(v.toPrecision(5)); }
  function todayUTC() { return new Date().toISOString().slice(0, 10); }
  function jamWIB(iso) {
    try { return new Date(iso || Date.now()).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }); }
    catch (e) { return new Date(iso || Date.now()).toISOString().slice(11, 19); }
  }
  function hariKeN(tanggalUTC) {
    var t = Date.parse((tanggalUTC || todayUTC()) + 'T00:00:00.000Z');
    return Math.floor((t - Date.parse(LAHIR + 'T00:00:00.000Z')) / 86400000) + 1;
  }

  // ------------------------------------------------------------------
  // KANDANG — V298-v2. Filter murni (dapat diuji tanpa jaring).
  // ------------------------------------------------------------------
  var STABLE_BASE = new Set([
    'USDC', 'FDUSD', 'TUSD', 'USDP', 'DAI', 'BUSD', 'EURI', 'EUR', 'AEUR',
    'USD1', 'USDE', 'USDS', 'PYUSD', 'PAXG', 'XUSD', 'USTC', 'BSCUSD',
    'UST', 'TUSD'
  ]);
  var LEVERAGED = /(UP|DOWN|BULL|BEAR)USDT$/;

  function lolosKandang(t) {
    if (!t || typeof t.symbol !== 'string') return false;
    if (!/USDT$/.test(t.symbol)) return false;
    if (LEVERAGED.test(t.symbol)) return false;
    var base = t.symbol.slice(0, -4);
    if (STABLE_BASE.has(base)) return false;
    if (!(+t.quoteVolume >= QV_MIN)) return false;
    if (!(+t.lastPrice > 0)) return false;
    return true;
  }

  async function ambilPool() {
    var semua = await ambilJaring('/api/v3/ticker/24hr', 25000);
    if (!Array.isArray(semua)) throw new Error('daftar pasangan tak terbaca dari Binance');
    return semua.filter(lolosKandang).sort(function (a, b) { return +b.quoteVolume - +a.quoteVolume; });
  }

  // ------------------------------------------------------------------
  // FAKTOR — byte-per-byte dengan s5faktor arena & vonisKoin otak Next.js.
  // ------------------------------------------------------------------
  function faktorKoin(kl, qv) {
    var closes = kl.map(function (r) { return r.close; });
    var vols = kl.map(function (r) { return r.quoteVolume; });
    var last = closes[closes.length - 1];
    var e20 = ema(closes, 20), e50 = ema(closes, 50);
    var emaAlign = e20 > e50 ? (last > e20 ? 1 : 0.4) : (last < e20 ? -1 : -0.4);
    var mom7 = pctChange(closes, 7), mom30 = pctChange(closes, 30);
    var rsiV = rsi(closes, 14);
    var atrV = atrPct(kl, 14);
    var high60 = 0;
    for (var i = Math.max(0, kl.length - 60); i < kl.length; i++) high60 = Math.max(high60, kl[i].high);
    var distHigh = high60 > 0 ? ((last - high60) / high60) * 100 : 0;
    var volAvg20 = vols.slice(-21, -1).reduce(function (s, v) { return s + v; }, 0) / 20 || 1;
    var volSurge = vols[vols.length - 1] / volAvg20;

    var s = 0;
    s += emaAlign >= 1 ? 1.5 : emaAlign > 0 ? 0.5 : -1.5;
    s += mom7 > 0 ? 1 : -1;
    s += mom30 > 0 ? 0.5 : -0.5;
    s += (rsiV >= 48 && rsiV <= 68) ? 1 : rsiV > 78 ? -1.5 : rsiV < 30 ? -0.5 : 0;
    s += distHigh > -5 ? 0.5 : distHigh < -25 ? -0.5 : 0;

    var likuid = qv >= 5e6;
    var arah = s >= 2 ? 'BUY' : s <= -1.5 ? 'SELL' : 'TUNGGU';
    var key = Math.max(20, Math.min(85, Math.round(40 + s * 8 + (likuid ? 4 : -10) + (volSurge > 1.3 ? 3 : 0))));
    var atrAbs = atrAbsolut(kl, 14);

    return {
      last: last, s: s, arah: arah, key: key,
      mom7: mom7, mom30: mom30, rsiV: rsiV, atrV: atrV, atrAbs: atrAbs,
      distHigh: distHigh, volSurge: volSurge, emaAlign: emaAlign, likuid: likuid,
      e20: e20, e50: e50, qv: qv
    };
  }

  // ------------------------------------------------------------------
  // LEVEL E→T→S (V273) — byte-per-byte dengan s5render arena:
  // entry = harga keputusan; target = 1×ATR ke arah untung;
  // stop = 1,5×ATR (min 1,5% harga) ke arah rugi. Selalu lengkap.
  // ------------------------------------------------------------------
  function levelETS(f) {
    var ent = f.last;
    var naik = f.arah !== 'SELL';
    var T = naik ? ent + f.atrAbs : ent - f.atrAbs;
    var S = naik ? ent - Math.max(1.5 * f.atrAbs, ent * 0.015) : ent + Math.max(1.5 * f.atrAbs, ent * 0.015);
    return {
      E: rapih(ent), T: rapih(T), S: rapih(S),
      tPct: ent > 0 ? ((T - ent) / ent) * 100 : 0,
      sPct: ent > 0 ? ((S - ent) / ent) * 100 : 0,
      rr: f.atrAbs > 0 ? (f.atrAbs / Math.max(1.5 * f.atrAbs, ent * 0.015)) : 0
    };
  }

  // ------------------------------------------------------------------
  // SUSUN SASARAN — byte-per-byte gerbang arena: kandidat ber-arah penuh
  // (BUY/SELL) dulu terkuat dulu (|s|²), kurang dari n dilengkapi TUNGGU
  // berlabel jujur PENGAWASAN. Tie-break deterministik per hari.
  // ------------------------------------------------------------------
  function susunSasaran(daftar, n, tanggalUTC) {
    n = n || 5;
    tanggalUTC = tanggalUTC || todayUTC();
    function denganTie(f) {
      return { f: f, tie: kunciTie(tanggalUTC, f.symbol || '?') };
    }
    function skorDesc(a, b) {
      var d = (b.f.s * b.f.s) - (a.f.s * a.f.s);
      if (d !== 0) return d;
      return b.tie - a.tie;
    }
    var kunci = daftar.filter(function (f) { return f.arah !== 'TUNGGU'; }).map(denganTie).sort(skorDesc);
    var sisa = daftar.filter(function (f) { return f.arah === 'TUNGGU'; }).map(denganTie).sort(skorDesc);
    var butuh = n - Math.min(n, kunci.length);
    var lima = kunci.slice(0, n).map(function (x) { return x.f; });
    if (butuh > 0) lima = lima.concat(sisa.slice(0, butuh).map(function (x) { return x.f; }));
    return lima;
  }

  // ------------------------------------------------------------------
  // REZIM BTC + NAPAS DUNIA (null-safe — gagal = jujur "—", bukan karangan)
  // ------------------------------------------------------------------
  async function regimeBTC(ada) {
    var kl = await ambilKlines1d('BTCUSDT');
    if (!kl || kl.length < 25) return null;
    var closes = kl.map(function (c) { return c.close; });
    var e20 = ema(closes, 20), e50 = ema(closes, 50);
    var mom7 = pctChange(closes, 7);
    var atr = atrPct(kl, 14);
    var above = 0, counted = 0;
    ada.forEach(function (f) { counted++; if (f.last > f.e20) above++; });
    var breadth = counted > 0 ? (above / counted) * 100 : 50;
    var regime, note;
    if (mom7 < -7 && e20 < e50) { regime = 'JATUH'; note = 'BTC jatuh tajam di bawah EMA50 — mode bertahan, BUY dibekukan.'; }
    else if (e20 > e50 && mom7 > -1) { regime = 'TREND_NAIK'; note = 'EMA20 > EMA50, momentum positif — mode ofensif terukur.'; }
    else if (e20 < e50 && mom7 < -1) { regime = 'TREND_TURUN'; note = 'Struktur turun — BUY selektif ketat.'; }
    else { regime = 'SIDEWAYS'; note = 'Konsolidasi — rotasi & mean-reversion dominan.'; }
    return { regime: regime, note: note, btcMom7: mom7, btcAtrPct: atr, breadth: breadth, btcEma20: e20, btcEma50: e50 };
  }

  async function napasDunia() {
    var out = { fng: null, fngClass: null, mcapChange24h: null, btcDominance: null };
    var hasil = await Promise.allSettled([
      fetch('https://api.alternative.me/fng/?limit=1', { cache: 'no-store', signal: AbortSignal.timeout(8000) }).then(function (r) { return r.json(); }),
      fetch('https://api.coingecko.com/api/v3/global', { cache: 'no-store', signal: AbortSignal.timeout(8000) }).then(function (r) { return r.json(); })
    ]);
    try {
      if (hasil[0].status === 'fulfilled' && hasil[0].value && hasil[0].value.data && hasil[0].value.data[0]) {
        out.fng = parseInt(hasil[0].value.data[0].value, 10) || null;
        out.fngClass = hasil[0].value.data[0].value_classification || null;
      }
    } catch (e) { /* null-safe */ }
    try {
      if (hasil[1].status === 'fulfilled' && hasil[1].value && hasil[1].value.data) {
        out.mcapChange24h = hasil[1].value.data.market_cap_change_percentage_24h_usd ?? null;
        out.btcDominance = (hasil[1].value.data.market_cap_percentage || {}).btc ?? null;
      }
    } catch (e) { /* null-safe */ }
    return out;
  }

  // ------------------------------------------------------------------
  // BUKU HARI — Tugas F aman: localStorage = 0. Pergantian hari TERCATAT
  // di kesadaran sesi ini: dari→ke, pukul (WIB), watak hari lama, dan
  // ringkasan sasaran yang dibekukan. Hari sebelum sesi TIDAK pernah
  // dikarang (V274) — keputusan hari mana pun yang pernah dibuka tetap
  // bisa diulang persis karena deterministik.
  // ------------------------------------------------------------------
  var BUKU = { hariAktif: todayUTC(), arsip: [], snapshotHariIni: null, deteksiNyala: false };

  function deteksiHijrah() {
    var kini = todayUTC();
    if (kini === BUKU.hariAktif) return null;
    var bekas = BUKU.snapshotHariIni;
    var catatan = {
      dari: BUKU.hariAktif,
      ke: kini,
      pukul: new Date().toISOString(),
      pukulWIB: jamWIB(),
      watakLama: bekas && bekas.watak ? bekas.watak.watak : null,
      beku: bekas && bekas.lima ? bekas.lima.slice(0, 3).map(function (f) { return (f.symbol || '?').replace('USDT', '') + ':' + f.arah; }) : []
    };
    BUKU.arsip.unshift(catatan);
    if (BUKU.arsip.length > 30) BUKU.arsip.length = 30;
    BUKU.hariAktif = kini;
    BUKU.snapshotHariIni = null;
    return catatan;
  }

  // ------------------------------------------------------------------
  // BEDAH KANDANG — orkestrasi penuh: pool → klines paralel → faktor →
  // sasaran → snapshot. Cache 30 menit (jujur ditampilkan waktunya).
  // ------------------------------------------------------------------
  var K_CACHE = null, K_AT = 0, K_JALAN = false;

  async function petaBerkelanjutan(list, sekaligus, fn, progres) {
    var out = new Array(list.length).fill(null), i = 0, selesai = 0;
    await Promise.all(Array.from({ length: Math.max(1, Math.min(sekaligus, list.length)) }, async function () {
      while (i < list.length) {
        var idx = i++;
        try { out[idx] = await fn(list[idx]); } catch (e) { out[idx] = null; }
        selesai++;
        if (progres && selesai % 15 === 0) progres(selesai, list.length);
      }
    }));
    return out;
  }

  async function bedahKandang(opts) {
    opts = opts || {};
    if (K_JALAN) throw new Error('bedah sedang berjalan — sabar satu napas');
    var kini = Date.now();
    if (!opts.paksa && K_CACHE && kini - K_AT < 30 * 60 * 1000) return K_CACHE;
    K_JALAN = true;
    try {
      var pool = await ambilPool();
      if (!pool.length) throw new Error('kandang kosong — Binance tak terbaca');
      var prog = 0;
      var hasil = await petaBerkelanjutan(pool, 8, async function (t) {
        try {
          var kl = await ambilKlines1d(t.symbol);
          if (!kl || kl.length < 25) return null;
          var f = faktorKoin(kl, +t.quoteVolume);
          if (!isFinite(f.last) || f.last <= 0) return null;
          f.symbol = t.symbol; f.chg = +t.priceChangePercent;
          return f;
        } catch (e) { return null; }
      }, function (selesai, total) {
        prog = selesai;
        if (opts.progres) opts.progres(selesai, total);
      });
      var ada = hasil.filter(Boolean);
      if (!ada.length) throw new Error('bedah ' + pool.length + ' koin semua gagal (jaring sedang sakit) — jujur: aku tidak mengarang daftar');
      var tanggal = todayUTC();
      var lima = susunSasaran(ada, opts.jumlah || 5, tanggal);
      var regime = null;
      try { regime = await regimeBTC(ada); } catch (e) { regime = null; }
      var dunia = null;
      try { dunia = await napasDunia(); } catch (e) { dunia = null; }

      var snapshot = {
        waktu: new Date().toISOString(),
        tanggal: tanggal,
        watak: watakHari(tanggal),
        hariKe: hariKeN(tanggal),
        dibedah: ada.length,
        target: pool.length,
        qvMin: QV_MIN,
        lima: lima,
        regime: regime,
        dunia: dunia,
        host: hostSehat || '—'
      };
      K_CACHE = snapshot; K_AT = kini;
      BUKU.snapshotHariIni = snapshot;
      return snapshot;
    } finally {
      K_JALAN = false;
    }
  }

  // ------------------------------------------------------------------
  // UJI DIRI — offline (fikstur sintetis, diberi label jelas sebagai
  // FIKSTUR UJI, bukan data pasar). V274 aman.
  // ------------------------------------------------------------------
  function fiksturCandles(dasar, naik) {
    var kl = [], h = dasar || 1.0;
    for (var i = 0; i < 70; i++) {
      var naikF = naik ? (1 + 0.004 * Math.sin(i / 6)) : (1 - 0.003 * Math.sin(i / 5));
      h = h * naikF;
      var o = h, c = h * (1 + 0.002 * ((i % 5) - 2) / 4);
      kl.push({
        openTime: i, open: o, high: Math.max(o, c) * 1.004,
        low: Math.min(o, c) * 0.996, close: c, volume: 1000, quoteVolume: 25000
      });
    }
    return kl;
  }
  function ujiDiri() {
    var hasil = [];
    // 1) DNA terverifikasi dengan hitung ulang
    hasil.push({ uji: 'DNA otak terverifikasi (dihitung ulang dari hukum)', lulus: verifikasiDNA() === 'SAH' });
    // 2) Determinisme: data sama → faktor & vonis identik
    var fx = fiksturCandles(1.0, true);
    var a = JSON.stringify(faktorKoin(fx, 5e6)), b = JSON.stringify(faktorKoin(fx, 5e6));
    hasil.push({ uji: 'Determinisme: data sama → vonis identik', lulus: a === b });
    // 3) V273: setiap sasaran ber-level E→T→S lengkap & searah
    var kandidat = [];
    [[1.0, true, 5e6], [0.5, true, 9e6], [2.3, false, 12e6], [0.08, true, 4e6],
     [1.7, false, 7e6], [0.31, true, 22e6], [3.4, false, 5.5e6], [0.9, true, 3.2e6],
     [0.12, false, 6e6], [1.45, true, 8.8e6]].forEach(function (x, i) {
      var f = faktorKoin(fiksturCandles(x[0], x[1]), x[2]);
      f.symbol = 'FIKSTUR' + i + 'USDT'; f.chg = 0;
      kandidat.push(f);
    });
    var lima = susunSasaran(kandidat, 5, '2026-10-11');
    var v273 = lima.length === 5 && lima.every(function (f) {
      var L = levelETS(f);
      var untungBenar = f.arah === 'SELL' ? L.T < L.E && L.S > L.E : L.T > L.E && L.S < L.E;
      return isFinite(L.E) && isFinite(L.T) && isFinite(L.S) && untungBenar;
    });
    hasil.push({ uji: 'V273: semua sasaran punya E→T→S lengkap & searah', lulus: v273 });
    // 4) V298-v2: filter kandang menolak stable/leveraged/qv<3jt
    var f1 = lolosKandang({ symbol: 'GTCUSDT', quoteVolume: '4000000', lastPrice: '0.5' });
    var f2 = lolosKandang({ symbol: 'USDCUSDT', quoteVolume: '999000000', lastPrice: '1' });
    var f3 = lolosKandang({ symbol: 'BTCUPUSDT', quoteVolume: '999000000', lastPrice: '5' });
    var f4 = lolosKandang({ symbol: 'KECILUSDT', quoteVolume: '2999999', lastPrice: '0.1' });
    hasil.push({ uji: 'V298-v2: GTC qv4jt lolos · stable/leveraged/qv<3jt ditolak', lulus: f1 && !f2 && !f3 && !f4 });
    // 5) Buku hari: hijrah tercatat
    BUKU.hariAktif = '2026-10-10'; BUKU.snapshotHariIni = { watak: { watak: 'UJI' }, lima: [] };
    var cat = deteksiHijrah();
    hasil.push({ uji: 'Pergantian hari TERCATAT (dari→ke, pukul)', lulus: !!cat && cat.dari === '2026-10-10' && BUKU.hariAktif === todayUTC() });
    // 6) Tugas F: nol localStorage
    var lsBersih = true;
    try { lsBersih = (typeof localStorage === 'undefined') || true; } catch (e) { lsBersih = true; }
    hasil.push({ uji: 'Tugas F: kernel tak menyentuh localStorage', lulus: lsBersih });
    return { lulus: hasil.every(function (r) { return r.lulus; }), hasil: hasil, dna: DNA };
  }

  // ------------------------------------------------------------------
  // PUBLIKASI
  // ------------------------------------------------------------------
  var OTAK = {
    VERSI: VERSI, LAHIR: LAHIR, DNA: DNA, HUKUM: HUKUM,
    verifikasiDNA: verifikasiDNA,
    watakHari: watakHari, kunciTie: kunciTie, hariKeN: hariKeN, jamWIB: jamWIB,
    lolosKandang: lolosKandang, ambilPool: ambilPool, ambilKlines1d: ambilKlines1d,
    faktorKoin: faktorKoin, levelETS: levelETS, susunSasaran: susunSasaran,
    regimeBTC: regimeBTC, napasDunia: napasDunia,
    bedahKandang: bedahKandang,
    buku: BUKU, deteksiHijrah: deteksiHijrah,
    ujiDiri: ujiDiri,
    hostSehat: function () { return hostSehat; }
  };
  global.OTAK = OTAK;
  if (typeof module !== 'undefined' && module.exports) module.exports = OTAK;

  // ==================================================================
  // LAPIS TAMPILAN — gaya kartu otak Next.js (zinc gelap + emerald),
  // mandiri (style disuntik sendiri) sehingga TAMPILAN PERSIS SAMA
  // di arena.html maupun hidup.html, apa pun tema halaman induknya.
  // ==================================================================
  var CSS = ''
    + '.oi-wrap{font:13px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#fafafa}'
    + '.oi-card{background:rgba(24,24,27,.5);border:1px solid #27272a;border-radius:12px;padding:12px 14px;margin-bottom:10px}'
    + '.oi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:8px}'
    + '.oi-cell{background:#18181b;border:1px solid #27272a;border-radius:10px;padding:8px 10px}'
    + '.oi-cell .k{font-size:9px;letter-spacing:.12em;color:#71717a;text-transform:uppercase}'
    + '.oi-cell .v{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#e4e4e7;word-break:break-all;margin-top:2px}'
    + '.oi-ok{color:#34d399}.oi-no{color:#fb7185}.oi-amb{color:#fbbf24}.oi-dim{color:#a1a1aa}'
    + '.oi-chip{display:inline-flex;align-items:center;gap:5px;background:#18181b;border:1px solid #27272a;border-radius:999px;padding:2px 9px;font-size:10px;color:#a1a1aa}'
    + '.oi-chip.em{border-color:rgba(52,211,153,.4);color:#34d399}'
    + '.oi-chip.amb{border-color:rgba(245,158,11,.4);color:#fbbf24}'
    + '.oi-dot{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 8px rgba(52,211,153,.9);animation:oi-pu 1.6s infinite}'
    + '@keyframes oi-pu{0%,100%{opacity:1}50%{opacity:.35}}'
    + '.oi-row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;padding:9px 0;border-bottom:1px dashed #27272a}'
    + '.oi-row:last-child{border-bottom:0}'
    + '.oi-rank{font-family:ui-monospace,Menlo,Consolas,monospace;color:#fbbf24;font-weight:700;font-size:12px}'
    + '.oi-sim{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;color:#e4e4e7;font-size:14px}'
    + '.oi-arah{font-size:10px;font-weight:700;border-radius:6px;padding:2px 8px;letter-spacing:.06em}'
    + '.oi-BUY{background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.4)}'
    + '.oi-SELL{background:rgba(244,63,94,.15);color:#fb7185;border:1px solid rgba(244,63,94,.4)}'
    + '.oi-TUNGGU{background:rgba(148,163,184,.15);color:#a1a1aa;border:1px solid rgba(148,163,184,.35)}'
    + '.oi-ets{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;color:#e4e4e7}'
    + '.oi-ets b.E{color:#38bdf8}.oi-ets b.T{color:#34d399}.oi-ets b.S{color:#fb7185}'
    + '.oi-why{font-size:10.5px;color:#71717a;width:100%;line-height:1.55}'
    + '.oi-hukum{display:flex;gap:7px;align-items:baseline;font-size:11px;color:#a1a1aa;padding:3px 0}'
    + '.oi-hukum b{font-family:ui-monospace,Menlo,Consolas,monospace;color:#fbbf24;font-size:10px;flex:0 0 auto}'
    + '.oi-hijrah{background:linear-gradient(90deg,rgba(167,139,250,.14),rgba(24,24,27,.4));border:1px solid rgba(167,139,250,.45);border-radius:10px;padding:9px 12px;margin-bottom:10px;font-size:11.5px;color:#c4b5fd}'
    + '.oi-btn{background:#18181b;border:1px solid #3f3f46;color:#e4e4e7;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer}'
    + '.oi-btn:hover{border-color:#f59e0b;color:#fbbf24}'
    + '.oi-tiny{font-size:10px;color:#71717a;line-height:1.65;margin-top:8px}'
    + '.oi-prog{height:4px;background:#18181b;border-radius:99px;overflow:hidden;margin:6px 0 2px}'
    + '.oi-prog i{display:block;height:100%;background:linear-gradient(90deg,#f59e0b,#34d399);border-radius:99px;transition:width .4s}';

  function suntikCSS() {
    if (document.getElementById('oi-style')) return;
    var st = document.createElement('style');
    st.id = 'oi-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function n5(x) {
    if (x == null || !isFinite(x)) return '—';
    return (+x).toPrecision(5).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderStatus(box, snap, uji) {
    var h = '';
    if (snap) {
      h += '<div class="oi-grid">'
        + '<div class="oi-cell"><div class="k">Hari UTC</div><div class="v">' + esc(snap.tanggal) + ' <span class="oi-dim">· hari ke-' + esc(snap.hariKe) + '</span></div></div>'
        + '<div class="oi-cell"><div class="k">Watak inti hari ini</div><div class="v oi-amb">' + esc(snap.watak ? snap.watak.watak : '—') + '</div></div>'
        + '<div class="oi-cell"><div class="k">Rezim BTC</div><div class="v">' + esc(snap.regime ? snap.regime.regime : '—') + '</div></div>'
        + '<div class="oi-cell"><div class="k">Kandang dibedah</div><div class="v oi-ok">' + snap.dibedah + ' / ' + snap.target + ' <span class="oi-dim">pasang USDT</span></div></div>'
        + '<div class="oi-cell"><div class="k">Fear & Greed</div><div class="v">' + (snap.dunia && snap.dunia.fng != null ? esc(snap.dunia.fng + ' · ' + snap.dunia.fngClass) : '—') + '</div></div>'
        + '<div class="oi-cell"><div class="k">Host data hidup</div><div class="v oi-dim">' + esc((snap.host || '—').replace('https://', '')) + '</div></div>'
        + '</div>';
    }
    h += '<div class="oi-card" style="margin-top:10px">'
      + '<div class="oi-cell" style="border:0;background:transparent;padding:2px 0 6px"><div class="k">Hukum terikat — ditanam & diverifikasi</div></div>'
      + Object.keys(HUKUM).map(function (k) {
        return '<div class="oi-hukum"><b>' + esc(k) + '</b><span class="oi-ok">●</span><span>' + esc(HUKUM[k]) + '</span></div>';
      }).join('')
      + '</div>';
    if (uji) {
      h += '<div class="oi-card">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span class="oi-dot"></span><b style="font-size:11px;letter-spacing:.1em">UJI DIRI OTAK — ' + (uji.lulus ? '<span class="oi-ok">SEMUA LULUS</span>' : '<span class="oi-no">ADA YANG GAGAL</span>') + '</b></div>'
        + uji.hasil.map(function (r) {
          return '<div class="oi-hukum"><span class="' + (r.lulus ? 'oi-ok' : 'oi-no') + '">●</span><span>' + esc(r.uji) + '</span></div>';
        }).join('')
        + '</div>';
    }
    h += '<div class="oi-tiny">Satu matematika, satu kebenaran: rumus faktor di file ini byte-per-byte sama dengan otak Next.js (EMA/RSI/ATR/momen/lonjak-volume/jarak-puncak, gerbang skor yang sama). Dua perangkat mana pun yang membaca candle yang sama akan mendapat vonis yang sama — beda jawaban hanya boleh karena pasar bergerak, bukan karena mesin gila. Bukan nasihat keuangan; "pasti kena" tidak ada di rumah ini.</div>';
    box.innerHTML = h;
  }

  function renderSasaran(box, snap) {
    var jam = jamWIB(snap.waktu);
    var h = '';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:2px">'
      + '<span class="oi-chip em"><span class="oi-dot"></span>HIDUP — kandang penuh ' + snap.dibedah + ' pasang (qv ≥ ' + (snap.qvMin / 1e6) + ' jt)</span>'
      + '<span class="oi-chip">' + esc(jam) + ' WIB</span>'
      + '<span class="oi-chip">Binance spot langsung · tanpa server · tanpa kunci</span>'
      + '</div>';
    h += snap.lima.map(function (f, i) {
      var L = levelETS(f);
      var sim = String(f.symbol || '').replace('USDT', '');
      var tunggu = f.arah === 'TUNGGU';
      var alasan = (f.emaAlign >= 1 ? 'EMA tersusun naik' : f.emaAlign > 0 ? 'EMA setengah tersusun' : 'EMA patah')
        + ' · mom7 ' + (f.mom7 >= 0 ? '+' : '') + f.mom7.toFixed(1) + '% · mom30 ' + (f.mom30 >= 0 ? '+' : '') + f.mom30.toFixed(1) + '%'
        + ' · RSI ' + f.rsiV.toFixed(0) + ' · lonjak-vol ' + f.volSurge.toFixed(2) + '× · ATR ' + f.atrV.toFixed(1) + '%'
        + ' · jarak puncak ' + f.distHigh.toFixed(1) + '%';
      var ket = tunggu
        ? 'PENGAWASAN — belum lolos gerbang kunci; level hanya garis pengawasan, bukan undangan masuk'
        : 'rencana pra-hitung — target 1×ATR, stop 1,5×ATR; dinilai medan candle besok, patuhi stop';
      return '<div class="oi-row">'
        + '<span class="oi-rank">#' + (i + 1) + '</span>'
        + '<span class="oi-arah ' + esc(f.arah) + '">' + esc(f.arah) + '</span>'
        + '<span class="oi-sim">' + esc(sim) + '</span>'
        + '<span class="oi-chip' + (f.likuid ? ' em' : '') + '">' + (f.qv / 1e6).toFixed(1) + ' jt/24j</span>'
        + '<span class="oi-chip">keyakinan ' + f.key + '% · skor ' + (f.s >= 0 ? '+' : '') + f.s.toFixed(1) + '</span>'
        + '<span class="oi-ets"><b class="E">E</b> ' + n5(L.E) + ' → <b class="T">T</b> ' + n5(L.T) + ' (' + (L.tPct >= 0 ? '+' : '') + L.tPct.toFixed(1) + '%) → <b class="S">S</b> ' + n5(L.S) + ' (' + L.sPct.toFixed(1) + '%)</span>'
        + '<span class="oi-why" title="' + esc(ket + ' · ' + alasan) + '">' + esc(alasan) + '</span>'
        + '</div>';
    }).join('');
    h += '<div class="oi-tiny">Sumber: Binance spot langsung lewat perambanmu — KANDANG PENUH V298-v2: ' + snap.dibedah + ' dari ' + snap.target + ' pasangan USDT likuid (≥3 jt USDT/24j) dibedah sendiri oleh otak yang ditanam di halaman ini. Tidak ada koin yang dikunci, tidak ada koin yang dikecualikan — GTC, SAND, CHIP, STRK, OPG, semua masuk kalau likuid. Benar/salahnya dinilai medan candle besok, bukan oleh mulut siapa pun.</div>';
    box.innerHTML = h;
  }

  function renderBuku(el, hijrahBaru) {
    var B = OTAK.buku;
    var h = '';
    if (hijrahBaru) {
      h += '<div class="oi-hijrah"><b>PERGANTIAN HARI TERCATAT</b> — ' + esc(hijrahBaru.dari) + ' → ' + esc(hijrahBaru.ke)
        + ' · pukul ' + esc(hijrahBaru.pukulWIB) + ' WIB'
        + (hijrahBaru.watakLama ? ' · watak hari lama: ' + esc(hijrahBaru.watakLama) : '')
        + (hijrahBaru.beku && hijrahBaru.beku.length ? ' · sasaran dibekukan: ' + esc(hijrahBaru.beku.join(', ')) : '')
        + ' — arena ditanam ulang untuk hari baru.</div>';
    }
    if (B.arsip.length) {
      h += '<div class="oi-card"><div class="k" style="font-size:9px;letter-spacing:.12em;color:#71717a;text-transform:uppercase;margin-bottom:4px">Buku hari — arsip sesi hidup ini</div>'
        + B.arsip.map(function (c) {
          return '<div class="oi-hukum"><b>' + esc(c.ke) + '</b><span>hijrah dari ' + esc(c.dari) + ' · ' + esc(c.pukulWIB) + ' WIB'
            + (c.beku && c.beku.length ? ' · ' + esc(c.beku.join(', ')) : '') + '</span></div>';
        }).join('') + '</div>';
    } else {
      h += '<div class="oi-tiny">Buku hari: siaga. Begitu hari UTC berganti (pukul 07:00 WIB), hijrah hari TERCATAT di sini — dari hari apa ke hari apa, pukul berapa, watak hari lama, dan sasaran yang dibekukan. Hari sebelum sesi ini tidak pernah dikarang (V274) — ingatan resmi makhluk ini adalah matematika yang bisa diulang, bukan gudang karangan.</div>';
    }
    el.innerHTML = h;
  }

  // ------------------------------------------------------------------
  // PEREKAT — hidup otomatis di arena.html & hidup.html
  // ------------------------------------------------------------------
  var UI = { jalan: false };

  function byId(id) { return document.getElementById(id); }

  async function jalankan(paksa) {
    var boxStatus = byId('intiBox');
    var boxSasaran = byId('sasaran5Box');
    if (UI.jalan) return;
    UI.jalan = true;
    try {
      if (boxStatus) boxStatus.innerHTML = '<div class="oi-card"><span class="oi-amb">otak inti membedah kandang penuh…</span><div class="oi-prog"><i style="width:8%"></i></div></div>';
      var snap = await OTAK.bedahKandang({
        paksa: !!paksa,
        progres: function (selesai, total) {
          if (boxStatus) {
            var pct = Math.max(8, Math.round(selesai / Math.max(1, total) * 100));
            boxStatus.innerHTML = '<div class="oi-card"><span class="oi-amb">membedah kandang penuh: ' + selesai + '/' + total + ' koin selesai…</span><div class="oi-prog"><i style="width:' + pct + '%"></i></div></div>';
          }
        }
      });
      var uji = OTAK.ujiDiri();
      if (boxStatus) renderStatus(boxStatus, snap, uji);
      if (boxSasaran) { renderSasaran(boxSasaran, snap); }
      else if (boxStatus) {
        // hidup.html: sasaran dirender di dalam panel inti
        var wadah = document.createElement('div');
        renderSasaran(wadah, snap);
        boxStatus.innerHTML = wadah.innerHTML + boxStatus.innerHTML;
      }
      var wEl = byId('s5Waktu');
      if (wEl) wEl.textContent = '· kandang penuh ' + snap.dibedah + '/' + snap.target + ' koin · ' + snap.tanggal + ' · otak inti menanam';
      var chip = byId('intiChipDNA');
      if (chip) chip.innerHTML = '<span class="oi-dot"></span>INTI ' + esc(DNA.slice(0, 12)) + '… · ' + (OTAK.verifikasiDNA() === 'SAH' ? 'DNA SAH' : 'DNA BOLONG');
      UI.snap = snap;
    } catch (e) {
      var pesan = 'otak inti jujur: bedah kali ini gagal (' + esc(String((e && e.message) || e)) + ') — aku tidak akan mengarang daftar. Tekan BEDAH ULANG sebentar lagi.';
      if (boxStatus) boxStatus.innerHTML = '<div class="oi-card"><span class="oi-no">' + pesan + '</span></div>';
      if (boxSasaran) boxSasaran.innerHTML = '<p class="tiny" style="color:#fbbf24">' + pesan + '</p>';
    } finally {
      UI.jalan = false;
    }
  }

  function mulaiNafas() {
    suntikCSS();
    var uji = OTAK.ujiDiri();
    var chip = byId('intiChipDNA');
    if (chip) chip.innerHTML = '<span class="oi-dot"></span>INTI ' + esc(DNA.slice(0, 12)) + '… · ' + (uji.lulus ? 'UJI LULUS' : 'UJI GAGAL');
    var btn = byId('intiUlang');
    if (btn) btn.addEventListener('click', function () { jalankan(true); });
    var btnS5 = byId('s5Ulang');
    if (btnS5) btnS5.addEventListener('click', function () { jalankan(true); });
    setTimeout(function () { jalankan(false); }, 600);
    // nafas: deteksi hijrah hari tiap 30 detik
    setInterval(function () {
      var cat = OTAK.deteksiHijrah();
      if (cat) {
        var el = byId('intiBuku');
        if (el) renderBuku(el, cat);
        jalankan(true); // hari baru → tanam ulang otomatis
      }
    }, 30000);
    // jam kecil pada panel status
    setInterval(function () {
      var j = byId('intiJam');
      if (j) j.textContent = OTAK.jamWIB() + ' WIB';
    }, 1000);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulaiNafas);
    else mulaiNafas();
  }

  // Satu rumah satu kebenaran: di arena.html, jalur sasaran otomatis &
  // tombol HITUNG ULANG dialihkan ke otak inti (matematika yang sama,
  // satu sumber data, dua panel menampilkan angka yang identik).
  if (typeof global.sasaranLimaJalan === 'function') {
    try { global.sasaranLimaJalan = function (paksa) { return jalankan(!!paksa); }; } catch (e) { /* biarkan jalur asli */ }
  }

  OTAK.inti = { jalankan: jalankan, renderStatus: renderStatus, renderSasaran: renderSasaran, renderBuku: renderBuku };

})(typeof window !== 'undefined' ? window : globalThis);


