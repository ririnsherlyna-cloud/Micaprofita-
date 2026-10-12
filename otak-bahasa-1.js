/* ============================================================
   OTAK-BAHASA-1 V342 — LIDAH BAGIAN PERTAMA
   (1) kata-bit + dekoder produksi biner (uji bolak-balik)
   (2) muat BAHASA/*.json dari repo + suntik leksikon dua bahasa
   (3) morfologi EN (jamak/3sg/lampau/ing/er/ly) dua arah
   (4) morfologi ID (meN-/ber-/di-/ter-/peN-/-kan/-an/reduplikasi) dua arah
   (5) tokenizer + deteksi bahasa + tag multi-hipotesis
   Hukum rumah: nol Math.random, nol localStorage, nol kalimat jawaban utuh.
   ============================================================ */
(function () {
  'use strict';
  /* V343-REV-B1R2 */
  const O = (window.__OTAK_BAHASA = window.__OTAK_BAHASA || {
    siap: false, stat: { soal: 0, jawab: 0, sahih: 0, diperbaiki: 0, ms: 0 },
    memori: { namaTuan: null, topik: null, entTerakhir: null, giliran: 0, kataAsing: [], log: [] },
    acak: 0x2f6e2b1 // xorshift benih — deterministik, variasi tanpa Math.random
  });

  /* ---------- 1) kata-bit + biner produksi (identik tempa-biner-paham.js) ---------- */
  function hashStr(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return h >>> 0;
  }
  function bitDari(label) {
    let h = hashStr(label), out = '';
    for (let i = 0; i < 18; i++) {
      out += (h & 1) ? '1' : '0';
      h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    }
    return out;
  }
  function xorshift() { // variasi deterministik per giliran — bukan kebetulan kaleng
    let x = O.acak;
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    O.acak = x; return x;
  }
  function pilih(arr) { return arr[xorshift() % arr.length]; }

  function dekoderBiner(hex, tabel) {
    const balik = {}; for (const [s, b] of Object.entries(tabel)) balik[b] = s;
    let bin = '';
    for (const c of hex) bin += parseInt(c, 16).toString(2).padStart(4, '0');
    const seq = [];
    for (let i = 0; i + 9 <= bin.length; i += 9) { if (balik[bin.slice(i, i + 9)]) seq.push(balik[bin.slice(i, i + 9)]); }
    return { l: seq[0] || null, r: seq.slice(1) };
  }
  function ujiBiner() {
    const B = O.biner; if (!B) return { siap: false };
    let jumlah = 0, lulus = 0;
    for (const a of B.produksi.aturan) {
      jumlah++;
      const balik = dekoderBiner(a.hex, B.skema.simbolBiner);
      const sumber = B.skema.simbolBiner;
      // lulus bila bit kata label sama juga dan dekoder menghasilkan simbol sah
      if (bitDari(a.i) === B.kataBit[a.i] && balik.l) lulus++;
    }
    return { siap: true, jumlah, lulus, segel: B.segel, bitRata: B.stat && B.stat.bitRata };
  }

  /* ---------- 1b) KOSAKATA.BIN — dekoder wujud biner murni (V343) ----------
     format v1: 'MCBA1' + u8 versi + u32 n + tabel kelas + tabel kategori +
     rekaman: u8 wl + utf8 w + u8 bahasa + u8 kelas0 + u8 kelas1 + u16 kat +
     u8 flag(bit0 nilai f64, bit1 urut u16) + i32 pair + [nilai] + [urut] +
     u8 kl + kl byte BigInt kode (base-40 posisi, digit 1..39) */
  function dekoderKosakata(buf) {
    const dv = new DataView(buf);
    const u8 = new Uint8Array(buf);
    if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3], u8[4]) !== 'MCBA1') throw new Error('magic KOSAKATA.BIN salah');
    let p = 5;
    const versi = dv.getUint8(p); p += 1;
    if (versi !== 1) throw new Error('versi biner ' + versi);
    const n = dv.getUint32(p, true); p += 4;
    const td = new TextDecoder();
    const bacaStr = () => { const L = dv.getUint8(p); p += 1; const s = td.decode(u8.slice(p, p + L)); p += L; return s; };
    const nKelas = dv.getUint16(p, true); p += 2;
    const kelasTabel = []; for (let i = 0; i < nKelas; i++) kelasTabel.push(bacaStr());
    const nKat = dv.getUint16(p, true); p += 2;
    const katTabel = []; for (let i = 0; i < nKat; i++) katTabel.push(bacaStr());
    const recs = [];
    for (let i = 0; i < n; i++) {
      const wl = dv.getUint8(p); p += 1;
      const w = td.decode(u8.slice(p, p + wl)); p += wl;
      const b = dv.getUint8(p); p += 1;
      const k0 = dv.getUint8(p), k1 = dv.getUint8(p + 1); p += 2;
      const kat = dv.getUint16(p, true); p += 2;
      const flag = dv.getUint8(p); p += 1;
      const pair = dv.getInt32(p, true); p += 4;
      let nilai = null, urut = null;
      if (flag & 1) { nilai = dv.getFloat64(p, true); p += 8; }
      if (flag & 2) { urut = dv.getUint16(p, true); p += 2; }
      const kl = dv.getUint8(p); p += 1;
      let kode = 0n;
      for (let j = 0; j < kl; j++) kode = (kode << 8n) | BigInt(u8[p + j]);
      p += kl;
      recs.push({ w, b, k: [kelasTabel[k0], kelasTabel[k1]], kat: katTabel[kat], pair, nilai, urut, kode });
    }
    return { n, kelasTabel, katTabel, recs };
  }
  function kodeKeKata(kode) { // balikan matematika murni: BigInt base-40 → kata
    const F = { 27: '-', 28: "'", 29: ' ' };
    const digit = [];
    let k = BigInt(kode);
    while (k > 0n) { digit.push(Number(k % 40n)); k = k / 40n; }
    digit.reverse();
    return digit.map(d => F[d] !== undefined ? F[d] : (d >= 30 ? String(d - 30) : String.fromCharCode(96 + d))).join('');
  }
  function ujiKode() { // bolak-balik SELURUH tabel — bukti hidup tiap kali dimuat
    const K = O.kode; if (!K || !K.recs) return { siap: false, jumlah: 0, lulus: 0 };
    let lulus = 0;
    for (const r of K.recs) if (kodeKeKata(r.kode) === r.w) lulus++;
    return { siap: true, jumlah: K.recs.length, lulus };
  }

  /* ---------- 2) muat data repo ---------- */
  async function muat(basis) {
    const b = basis || './';
    const ambil = async (f) => { const r = await fetch(b + f, { cache: 'no-store' }); if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); };
    const ambilBin = async (f) => { const r = await fetch(b + f, { cache: 'no-store' }); if (!r.ok) throw new Error(f + ' ' + r.status); return r.arrayBuffer(); };
    const [lexE, lexI, grE, grI, pen, bin, kodeBuf, lawan, koin] = await Promise.all([
      ambil('BAHASA/LEXIKON-EN.json'), ambil('BAHASA/LEXIKON-ID.json'),
      ambil('BAHASA/GRAMATIKA-EN.json'), ambil('BAHASA/GRAMATIKA-ID.json'),
      ambil('BAHASA/PENGETAHUAN.json'), ambil('BAHASA/BINER-PAHAM.json'),
      ambilBin('BAHASA/KOSAKATA.BIN'),
      ambil('BAHASA/LAWAN-10K.json').catch(() => ({ en: [], id: [] })),
      ambil('BAHASA/KOIN.json').catch(() => ({ koin: {} }))
    ]);
    O.lexEN = lexE; O.lexID = lexI; O.grEN = grE; O.grID = grI; O.pen = pen; O.biner = bin;
    O.kode = dekoderKosakata(kodeBuf);
    O.lawan = lawan; O.koin = koin;
    suntikLeksikon();
    O.siap = true;
    return status();
  }
  function tambahLex(lang, kata, lemma, kelas, cat) {
    const L = lang === 'en' ? O.lexEN : O.lexID;
    if (!L[kata]) L[kata] = [lemma, kelas, cat || ''];
    else if (L[kata][1] !== kelas) { // kata boleh dua kelas (makan/makan-n; cepat/adv+adj)
      const ada = Array.isArray(L[kata][0]) ? L[kata] : [L[kata]];
      if (!ada.some(e => e[1] === kelas)) L[kata] = [...ada, [lemma, kelas, cat || '']];
    }
  }
  function suntikLeksikon() {
    const P = O.pen;
    for (const [k, e] of Object.entries(P.entitas)) {
      tambahLex('id', k, k, 'n', 'entitas'); tambahLex('en', e.en, e.en, 'n', 'entitas');
    }
    for (const [k, e] of Object.entries(P.kerja.istilah)) {
      const kId = k.replace(/-/g, ' '), kEn = e.en;
      kId.split(' ').forEach(w => tambahLex('id', w, w, 'n', 'istilah'));
      kEn.split(' ').forEach(w => tambahLex('en', w, w, 'n', 'istilah'));
      tambahLex('id', kId, kId, 'n', 'istilah-jamak-kata'); tambahLex('en', kEn, kEn, 'n', 'istilah-jamak-kata');
    }
    for (const [k, v] of Object.entries(P.kemampuan)) {
      k.split('-').forEach(w => tambahLex('id', w, w, 'v', 'kemampuan'));
      v.split('-').forEach(w => tambahLex('en', w, w, 'v', 'kemampuan'));
    }
    for (const [idW, enW] of P['kamus-pair']) {
      tambahLex('id', idW, idW, 'x', 'kamus');
      tambahLex('en', enW, enW, 'x', 'kamus');
    }
    for (const k of Object.keys(P.kerja.diri)) {
      tambahLex('id', k, k, 'n', 'diri');
      tambahLex('en', k, k, 'n', 'diri');
    }
    /* ---------- V343: suntik 10.000 kosakata matematika ---------- */
    if (O.kode && O.kode.recs) {
      O.nilaiKata = {}; O.urutKata = {};
      O.kode.petaKata = new Map(); O.kode.petaKode = new Map(); O.kode.petaPasang = new Map();
      for (const r of O.kode.recs) {
        const lang = r.b === 0 ? 'en' : 'id';
        tambahLex(lang, r.w, r.w, r.k[0], 'kodes10k');
        if (r.k[1] && r.k[1] !== r.k[0]) tambahLex(lang, r.w, r.w, r.k[1], 'kodes10k');
        if (r.nilai != null) O.nilaiKata[r.w] = r.nilai;
        if (r.urut != null) O.urutKata[r.w] = r.urut;
        O.kode.petaKata.set(r.w, r);
        O.kode.petaKode.set(String(r.kode), r);
        if (r.pair >= 0) {
          const q = O.kode.recs[r.pair];
          O.kode.petaPasang.set(r.w, r.b === 0 ? { en: r.w, id: q.w } : { en: q.w, id: r.w });
        }
      }
    }
    if (O.lawan) {
      O.petaLawan = new Map();
      for (const [a, b2] of (O.lawan.en || [])) { O.petaLawan.set('en:' + a, b2); O.petaLawan.set('en:' + b2, a); }
      for (const [a, b2] of (O.lawan.id || [])) { O.petaLawan.set('id:' + a, b2); O.petaLawan.set('id:' + b2, a); }
    }
    if (O.koin && O.koin.koin) {
      for (const [sym, k] of Object.entries(O.koin.koin)) {
        tambahLex('id', sym.toLowerCase(), sym, 'prop', 'koin');
        tambahLex('en', sym.toLowerCase(), sym, 'prop', 'koin');
        tambahLex('id', k.nama.toLowerCase(), k.nama, 'prop', 'koin');
        tambahLex('en', k.nama.toLowerCase(), k.nama, 'prop', 'koin');
      }
    }
  }

  /* ---------- 3) morfologi EN dua arah ---------- */
  const EN_IRREG_PLUR = { man: 'men', woman: 'women', child: 'children', foot: 'feet', tooth: 'teeth', mouse: 'mice', person: 'people', leaf: 'leaves', knife: 'knives', wolf: 'wolves', fish: 'fish', sheep: 'sheep', deer: 'deer', goose: 'geese', ox: 'oxen' };
  const EN_IRREG_PAST = { go: 'went', eat: 'ate', see: 'saw', take: 'took', make: 'made', have: 'had', do: 'did', say: 'said', come: 'came', get: 'got', give: 'gave', find: 'found', know: 'knew', think: 'thought', tell: 'told', run: 'ran', swim: 'swam', fly: 'flew', sleep: 'slept', buy: 'bought', sell: 'sold', teach: 'taught', learn: 'learnt', win: 'won', lose: 'lost', begin: 'began', speak: 'spoke', write: 'wrote', read: 'read', drink: 'drank', sing: 'sang', sit: 'sat', stand: 'stood', meet: 'met', keep: 'kept', hold: 'held', bring: 'brought', send: 'sent', build: 'built', choose: 'chose', spend: 'spent', pay: 'paid', cost: 'cost', fall: 'fell', rise: 'rose', grow: 'grew', hear: 'heard', feel: 'felt', leave: 'left', mean: 'meant' };
  const EN_IRREG_PAST2 = {}; for (const [a, b] of Object.entries(EN_IRREG_PAST)) EN_IRREG_PAST2[b] = a;

  function gandaKons(k) { // CVC terakhir konsonan-vokal-konsonan (bukan w/x/y) → ganda
    if (k.length < 3) return false;
    const c = /[bcdfghjklmnpqrstvz]/, v = /[aeiou]/;
    const a = k[k.length - 3], b = k[k.length - 2], d = k[k.length - 1];
    return c.test(a) && v.test(b) && c.test(d);
  }
  function enPlural(n) {
    if (EN_IRREG_PLUR[n]) return EN_IRREG_PLUR[n];
    if (/(s|x|z|ch|sh)$/.test(n)) return n + 'es';
    if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + 'ies';
    return n + 's';
  }
  function enPlural2Asal(w) { // bentuk jamak → asal
    if (Object.values(EN_IRREG_PLUR).includes(w)) return [Object.entries(EN_IRREG_PLUR).find(([, v]) => v === w)[0]];
    if (w.endsWith('ies')) return [w.slice(0, -3) + 'y', w.slice(0, -3)];
    if (w.endsWith('ves')) return [w.slice(0, -3) + 'f', w.slice(0, -3) + 'fe'];
    if (w.endsWith('es') && /(ch|sh|ss|x|z)es$/.test(w)) return [w.slice(0, -2)];
    if (w.endsWith('s') && !w.endsWith('ss')) return [w.slice(0, -1)];
    return [w];
  }
  function en3sg(v) {
    if (/(s|x|z|ch|sh)$/.test(v)) return v + 'es';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    return v + 's';
  }
  function enPast(v) {
    if (EN_IRREG_PAST[v]) return EN_IRREG_PAST[v];
    if (/e$/.test(v)) return v + 'd';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
    if (gandaKons(v)) return v + v[v.length - 1] + 'ed';
    return v + 'ed';
  }
  function enIng(v) {
    if (/ie$/.test(v)) return v.slice(0, -2) + 'ying';
    if (/e$/.test(v) && !/ee$/.test(v)) return v.slice(0, -1) + 'ing';
    if (gandaKons(v)) return v + v[v.length - 1] + 'ing';
    return v + 'ing';
  }
  function enEr(v) { return gandaKons(v) ? v + v[v.length - 1] + 'er' : (/y$/.test(v) ? v.slice(0, -1) + 'ier' : v + 'er'); }
  function enEst(v) { return gandaKons(v) ? v + v[v.length - 1] + 'est' : (/y$/.test(v) ? v.slice(0, -1) + 'iest' : v + 'est'); }
  function enLy(a) { return /y$/.test(a) ? a.slice(0, -1) + 'ily' : a + 'ly'; }

  /* ---------- 4) morfologi ID dua arah (alofon meN- dst.) ---------- */
  function idMeN(r) { // asal → berimbuhan meN-
    if (/^(l)/.test(r)) return 'me' + r;
    if (/^(s)/.test(r)) return 'meny' + r.slice(1);
    if (/^(p)/.test(r)) return 'mem' + r.slice(1);
    if (/^(t)/.test(r)) return 'men' + r.slice(1);
    if (/^(k)/.test(r)) return 'meng' + r.slice(1);
    if (/^(b)/.test(r)) return 'memb' + r;
    if (/^(d)/.test(r)) return 'mend' + r;
    if (/^(c)/.test(r)) return 'menc' + r;
    if (/^(j)/.test(r)) return 'menj' + r;
    if (/^(m)/.test(r)) return 'mem' + r.slice(1);
    if (/^(l)/.test(r)) return 'mel' + r;
    if (/^(r)/.test(r)) return 'mer' + r;
    if (/^[aiueo]/.test(r)) return 'meng' + r;
    return 'meN' + r;
  }
  function idMeN2Asal(w) { // bentuk meN- → kandidat asal
    const c = [];
    if (w.startsWith('meny')) c.push('s' + w.slice(4));
    if (w.startsWith('mem')) { c.push('p' + w.slice(3), 'm' + w.slice(3)); }
    if (w.startsWith('men') && !w.startsWith('memb') && !w.startsWith('mend') && !w.startsWith('menc') && !w.startsWith('menj')) c.push('t' + w.slice(3));
    if (w.startsWith('meng')) c.push('k' + w.slice(4), w.slice(4));
    if (w.startsWith('memb')) c.push('b' + w.slice(4), 'p' + w.slice(4));
    if (w.startsWith('mend')) c.push('d' + w.slice(4));
    if (w.startsWith('menc')) c.push('c' + w.slice(4));
    if (w.startsWith('menj')) c.push('j' + w.slice(4));
    return c;
  }
  function idBer(r) {
    if (/^(ker)/.test(r)) return 'ber' + r.slice(1);
    if (/^([aiueo])/.test(r)) return 'ber' + r;
    if (/^(r|l)/.test(r)) return 'be' + r;
    return 'ber' + r;
  }
  const ID_AWALAN = ['mem', 'meny', 'meng', 'men', 'memb', 'mend', 'menc', 'menj', 'mel', 'mer', 'ber', 'ter', 'di', 'ke', 'se', 'peN', 'peny', 'peng', 'pen', 'per'];
  function idKupas(w) { // kandidat asal kata berimbuhan — untuk parse & tanya-morfologi
    const c = [];
    for (const p of ID_AWALAN) if (w.startsWith(p) && w.length > p.length + 1) {
      if (p === 'mem') c.push('p' + w.slice(3), 'm' + w.slice(3));
      else if (p === 'meny') c.push('s' + w.slice(4));
      else if (p === 'meng') c.push('k' + w.slice(4), w.slice(4));
      else if (p === 'men') c.push('t' + w.slice(3));
      else if (p === 'memb') c.push('b' + w.slice(4), 'p' + w.slice(4));
      else if (p === 'mend') c.push('d' + w.slice(4));
      else if (p === 'menc') c.push('c' + w.slice(4));
      else if (p === 'menj') c.push('j' + w.slice(4));
      else if (p === 'mel') c.push('l' + w.slice(3));
      else if (p === 'mer') c.push('r' + w.slice(3));
      else c.push(w.slice(p.length));
    }
    if (w.startsWith('meN')) c.push(w.slice(3));
    // sufiks
    for (const s of ['kan', 'an', 'i', 'nya', 'mu', 'ku']) if (w.endsWith(s) && w.length > s.length + 2) c.push(w.slice(0, -s.length));
    return [...new Set(c)];
  }
  function idRedup(w) { return w + '-' + w; } // buku → buku-buku
  function idRedup2Asal(w) { return w.includes('-') && w.split('-')[0] === w.split('-')[1] ? [w.split('-')[0]] : null; }

  /* ---------- 5) tokenizer + deteksi bahasa + tag ---------- */
  const EN_FUNGSI = /\b(the|is|are|am|do|does|did|can|cannot|what|who|where|when|why|how|of|and|to|in|on|a|an|you|your|my|i|it|is|that|this)\b/gi;
  const ID_FUNGSI = /\b(apa|itu|ini|yang|adalah|saya|aku|kamu|siapa|mengapa|kenapa|bagaimana|berapa|kapan|tidak|bukan|dan|atau|dengan|untuk|dari|ke|di|bisa|dapat|akan|sudah|sedang|juga|mana)\b/gi;
  function deteksiBahasa(t) {
    const en = (t.match(EN_FUNGSI) || []).length, id = (t.match(ID_FUNGSI) || []).length;
    if (en === id) return /[^a-z]/i.test(t.replace(/[a-z0-9 .,!?'"-]/gi, '')) ? 'id' : (en > 0 ? 'en' : 'id');
    return en > id ? 'en' : 'id';
  }
  function tokenisasi(t) {
    return t.toLowerCase()
      .replace(/[.,!?;:"'\u201c\u201d\u2018\u2019()\[\]{}]+/g, ' ').replace(/\s+/g, ' ').trim()
      .split(' ').filter(Boolean);
  }
  function kandidatAsal(w, lang) {
    const c = [w];
    if (lang === 'en') {
      const PP = { taken: 'take', given: 'give', known: 'know', written: 'write', spoken: 'speak', broken: 'break', chosen: 'choose', eaten: 'eat', seen: 'see', driven: 'drive', hidden: 'hide', meant: 'mean' };
      if (PP[w]) c.push(PP[w]);
      if (w.endsWith('ies')) c.push(w.slice(0, -3) + 'y');
      if (w.endsWith('ves')) c.push(w.slice(0, -3) + 'f', w.slice(0, -3) + 'fe');
      if (w.endsWith('es')) c.push(w.slice(0, -2));
      if (w.endsWith('s') && !w.endsWith('ss')) c.push(w.slice(0, -1));
      if (w.endsWith('ing')) c.push(w.slice(0, -3), w.slice(0, -3) + 'e');
      if (w.endsWith('ed')) c.push(w.slice(0, -2), w.slice(0, -1));
      if (w.endsWith('er') && w.length > 4) c.push(w.slice(0, -2), w.slice(0, -2) + 'e');
      if (w.endsWith('ly') && w.length > 4) c.push(w.slice(0, -2), w.slice(0, -3) + 'y');
      for (const [a, b] of Object.entries(EN_IRREG_PAST)) if (b === w) c.push(a);
      if (w.endsWith('ies')) c.push(w.slice(0, -3) + 'y');
    } else {
      c.push(...idKupas(w));
      const r = idRedup2Asal(w); if (r) c.push(...r);
      if (w.startsWith('meny')) c.push('s' + w.slice(4));
      if (w.startsWith('meng')) c.push('k' + w.slice(4), w.slice(4));
    }
    return [...new Set(c)];
  }
  function tag(w, lang) {
    const L = lang === 'en' ? O.lexEN : O.lexID;
    const hasil = [];
    const cek = (kata, surf) => {
      const e = L[kata]; if (!e) return;
      const daftar = Array.isArray(e[0]) ? e : [e];
      for (const [lemma, kelas, cat] of daftar) {
        if (!hasil.some(h => h.lemma === lemma && h.kelas === kelas)) hasil.push({ lemma, kelas, surf, cat: cat || '' });
      }
    };
    cek(w, w);
    for (const asal of kandidatAsal(w, lang)) cek(asal, w);
    // entitas dua bahasa: kata EN muncul di teks ID jika bahasa campur
    return hasil;
  }
  function tandaiBaris(tokens, lang) {
    // tandai seluruh baris; jika minim hasil, coba bahasa lain (kalimat campur)
    const satu = tokens.map(t => ({ surf: t, hip: tag(t, lang) }));
    const terisi = satu.filter(x => x.hip.length).length;
    if (terisi < Math.max(1, Math.ceil(tokens.length * 0.4))) {
      const l2 = lang === 'en' ? 'id' : 'en';
      const dua = tokens.map(t => ({ surf: t, hip: tag(t, l2) }));
      const terisi2 = dua.filter(x => x.hip.length).length;
      if (terisi2 > terisi) return { bahasa: l2, kata: dua };
    }
    return { bahasa: lang, kata: satu };
  }

  /* ---------- ekspor ---------- */
  O.bitDari = bitDari; O.ujiBiner = ujiBiner; O.dekoderBiner = dekoderBiner;
  O.dekoderKosakata = dekoderKosakata; O.kodeKeKata = kodeKeKata; O.ujiKode = ujiKode;
  O.muat = muat; O.deteksiBahasa = deteksiBahasa; O.tokenisasi = tokenisasi;
  O.tandaiBaris = tandaiBaris; O.tag = tag; O.pilih = pilih; O.xorshift = xorshift;
  O.morf = {
    en: {
      plural: enPlural, plural2Asal: enPlural2Asal, v3sg: en3sg, past: enPast, ing: enIng, er: enEr, est: enEst, ly: enLy,
      past2Asal: (w) => EN_IRREG_PAST2[w] ? [EN_IRREG_PAST2[w]] : (w.endsWith('ied') ? [w.slice(0, -3) + 'y'] : w.endsWith('ed') ? [w.slice(0, -2), w.slice(0, -1)] : [])
    },
    id: { meN: idMeN, meN2Asal: idMeN2Asal, ber: idBer, kupas: idKupas, redup: idRedup, redup2Asal: idRedup2Asal }
  };
  O.status = status;
  function status() {
    return {
      siap: O.siap,
      leksikon: { en: O.lexEN ? Object.keys(O.lexEN).length : 0, id: O.lexID ? Object.keys(O.lexID).length : 0 },
      aturan: { en: O.grEN ? O.grEN.aturan.length : 0, id: O.grID ? O.grID.aturan.length : 0 },
      entitas: O.pen ? Object.keys(O.pen.entitas).length : 0,
      istilah: O.pen ? Object.keys(O.pen.kerja.istilah).length : 0,
      kamus: O.pen ? O.pen['kamus-pair'].length : 0,
      biner: ujiBiner(),
      kode: ujiKode(),
      pasangKode: O.kode && O.kode.petaPasang ? O.kode.petaPasang.size : 0,
      lawan: O.petaLawan ? O.petaLawan.size / 2 : 0,
      koin: O.koin && O.koin.koin ? Object.keys(O.koin.koin).length : 0
    };
  }
})();
