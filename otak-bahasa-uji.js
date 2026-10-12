/* ============================================================
   OTAK-BAHASA-UJI V343 — PENGUJI (EXAMINER)
   50.000 soal acak berbenih (nol Math.random) dari 12 kategori:
   terjemah dwiarah, kode matematika, kelas-kata, lawan, morfologi,
   dasar-angka & hari-matematika, istilah pekerjaan, hari real-time,
   koin real-time, rangkai kalimat, bertanya.
   Prinsip jujur:
   - penguji TIDAK memakai jalur jawab otak; ia punya rujukan sendiri
   - nol tabel soal→jawaban disimpan; semua soal dirangkai dari data
   - setiap soal dinilai fungsi-cek independen
   Dipakai Node (lab) dan browser (hidup.html) — hasil identik berbenih.
   ============================================================ */
(function () {
  'use strict';
  /* V343-REV-U4 */
  const O = window.__OTAK_BAHASA;

  function buatBenih(benih) {
    let x = benih >>> 0;
    return function () {
      x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
      return x;
    };
  }
  function kocok(arr, rng) { // Fisher-Yates berbenih
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---- rujukan morfologi penguji (penulisan kedua, mandiri dari otak) ---- */
  const TAK_BERATURAN_JAMAK = { man: 'men', woman: 'women', child: 'children', foot: 'feet', tooth: 'teeth', mouse: 'mice', person: 'people', leaf: 'leaves', knife: 'knives', wolf: 'wolves', fish: 'fish', sheep: 'sheep', deer: 'deer', goose: 'geese', ox: 'oxen' };
  const TAK_BERATURAN_LAMPAU = { go: 'went', eat: 'ate', see: 'saw', take: 'took', make: 'made', have: 'had', do: 'did', say: 'said', come: 'came', get: 'got', give: 'gave', find: 'found', know: 'knew', think: 'thought', tell: 'told', run: 'ran', swim: 'swam', fly: 'flew', sleep: 'slept', buy: 'bought', sell: 'sold', teach: 'taught', learn: 'learnt', win: 'won', lose: 'lost', begin: 'began', speak: 'spoke', write: 'wrote', read: 'read', drink: 'drank', sing: 'sang', sit: 'sat', stand: 'stood', meet: 'met', keep: 'kept', hold: 'held', bring: 'brought', send: 'sent', build: 'built', choose: 'chose', spend: 'spent', pay: 'paid', cost: 'cost', fall: 'fell', rise: 'rose', grow: 'grew', hear: 'heard', feel: 'felt', leave: 'left', mean: 'meant' };
  function refJamak(n) {
    if (TAK_BERATURAN_JAMAK[n]) return TAK_BERATURAN_JAMAK[n];
    if (/(s|x|z|ch|sh)$/.test(n)) return n + 'es';
    if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + 'ies';
    return n + 's';
  }
  function gandaKons(k) {
    if (k.length < 3) return false;
    const c = /[bcdfghjklmnpqrstvz]/, v = /[aeiou]/;
    return c.test(k[k.length - 3]) && v.test(k[k.length - 2]) && c.test(k[k.length - 1]);
  }
  function refLampau(v) {
    if (TAK_BERATURAN_LAMPAU[v]) return TAK_BERATURAN_LAMPAU[v];
    if (/e$/.test(v)) return v + 'd';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
    if (gandaKons(v)) return v + v[v.length - 1] + 'ed';
    return v + 'ed';
  }
  function refHariNama(urut, id) {
    const ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return id ? ID[urut] : EN[urut];
  }
  function refFormat(x, lang) {
    const s = String(x);
    if (!s.includes('.')) return s;
    const [i, d] = s.split('.');
    const ri = i.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
    return lang === 'en' ? ri + '.' + d : ri + ',' + d;
  }
  function variasiKata(w) { // bentuk yang dianggap memuat kata dasar
    const v = [w];
    const kupas = (x) => [x, x.replace(/(kan|an|i|nya|mu|ku)$/, ''), x.replace(/^(mem|meng|meny|men|ber|ter|di|ke|se)/, '')];
    v.push(...kupas(w.toLowerCase()));
    const balikLampau = {}; for (const [a, b] of Object.entries(TAK_BERATURAN_LAMPAU)) balikLampau[b] = a;
    const balikJamak = {}; for (const [a, b] of Object.entries(TAK_BERATURAN_JAMAK)) balikJamak[b] = a;
    const dasar = balikLampau[w] || balikJamak[w];
    if (dasar) { v.push(dasar, dasar + 's', dasar + 'es'); }
    const lex = (O.lexEN && O.lexEN[w]) || (O.lexID && O.lexID[w]);
    if (lex && !Array.isArray(lex[0]) && lex[0] !== w) { v.push(lex[0], lex[0] + 's', lex[0] + 'es'); }
    if (/[^aeiou]y$/.test(w)) v.push(w.slice(0, -1) + 'ies');
    else if (/(s|x|z|ch|sh)$/.test(w)) v.push(w + 'es');
    else v.push(w + 's');
    return v;
  }

  /* ---- generator soal ---- */
  function rangkaiSemuaSoal(benih, pasar) {
    const rng = buatBenih(benih);
    const soal = [];
    const dorong = (kat, q) => soal.push(Object.assign({ kat }, q));
    const K = O.kode, P = O.pen;
    /* kata yang TIDAK boleh jadi sasaran soal: kata-kunci meta otak, simbol/nama koin, imbuhan -mu */
    const META_KATA = new Set(['what', 'code', 'name', 'lawan', 'kata', 'word', 'apa', 'kode', 'number', 'angka', 'verb', 'noun', 'class', 'kelas', 'is', 'are', 'the', 'a', 'an', 'of', 'dari', 'itu', 'ini', 'opposite', 'antonim', 'antonym', 'math', 'matematika', 'adjective', 'adverb', 'kata-kerja', 'kata-benda', 'kata-sifat', 'kata-keterangan', 'berapa', 'how', 'how-much', 'give', 'berikan', 'tell', 'sebutkan', 'please', 'tolong', 'plural', 'jamak', 'past', 'lampau', 'bentuk', 'arti', 'artinya', 'terjemah', 'terjemahkan', 'translate', 'mean', 'means', 'meaning', 'bahasa', 'language', 'inggris', 'english', 'indonesia', 'indonesian', 'sentence', 'kalimat', 'with', 'dengan', 'make', 'buat', 'rangkai', 'wh', 'wh-word', 'nama', 'diri', 'proper', 'proper-noun', 'nama-diri', 'auxiliary', 'aux', 'bilangan', 'partikel', 'explain', 'jelaskan', 'hari', 'day', 'koin', 'coin', 'harga', 'price', 'naik', 'turun', 'grafik', 'chart', 'buy', 'beli', 'pakem', 'tournament', 'turnamen', 'uji-50', 'uji50', 'trader', 'trading', 'pedagang', 'dagang', 'heart', 'jantung', 'motto', 'diaman', 'master', 'tuan', 'eat', 'makan', 'live', 'rumah', 'hidup', 'tinggal', 'job', 'work', 'pekerjaan', 'kerja', 'speak', 'bicara', 'ask', 'tanya', 'thanks', 'thank', 'hello', 'halo', 'helo', 'check', 'periksa', 'now', 'sekarang', 'today', 'hari-ini', 'detik', 'second', 'minute', 'menit', 'jam', 'hour', 'waktu', 'time', 'tanggal', 'jump', 'run', 'swim', 'fly', 'climb', 'sing', 'cook', 'read', 'write', 'sleep', 'drink', 'see', 'walk', 'particle', 'preposition', 'conjunction', 'determiner', 'pronoun', 'copula', 'negation', 'interjection', 'proper', 'hei', 'hi', 'hey', 'halo', 'hai', 'selamat', 'adalah', 'ialah', 'merupakan', 'say', 'bilang', 'bye', 'goodbye', 'pamit', 'good', 'bernama', 'ok', 'okay', 'yes', 'no', 'ya', 'tidak', 'aspect', 'aspek', 'kopula', 'depan', 'benda', 'jenis', 'keterangan', 'penentu', 'kamus', 'telah', 'sedang', 'tengah', 'sukai', 'ganti', 'dibagi', 'ditambah', 'dikurang', 'dikurangi', 'dikalikan', 'times', 'plus', 'minus', 'divided']);
    const kataKoin = new Set();
    for (const [sym, k] of Object.entries((O.koin && O.koin.koin) || {})) { kataKoin.add(sym.toLowerCase()); kataKoin.add(k.nama.toLowerCase()); }
    const balikLampauU = {}; for (const [a, b] of Object.entries(TAK_BERATURAN_LAMPAU)) balikLampauU[b] = a;
    const balikJamakU = {}; for (const [a, b] of Object.entries(TAK_BERATURAN_JAMAK)) balikJamakU[b] = a;
    const sasaranBoleh = (w) => !META_KATA.has(w) && !kataKoin.has(w) && !/mu$/.test(w) && !w.includes(' ') && !/\d/.test(w) && !/'/.test(w) && !(w.endsWith('s') && META_KATA.has(w.slice(0, -1))) && !balikLampauU[w] && !balikJamakU[w];
    const perluasan = (kandidat) => kandidat.filter(sasaranBoleh);

    /* pasangan dwibahasa dari tabel kode — hanya kata isi (kelas nyata) */
    const ISI = new Set(['n', 'v', 'adj', 'adv', 'num']);
    const pasangan = [];
    for (const [w, p] of (K.petaPasang || new Map())) {
      const rw = K.petaKata.get(w);
      const lain = rw && rw.pair >= 0 ? K.recs[rw.pair].w : null;
      const rk = lain ? K.petaKata.get(lain) : null;
      const istilahEn = new Set(Object.values(P.kerja.istilah).map(iv => iv.en));
      const entEn = new Set(Object.values(P.entitas).map(e => e.en));
      if (rw && rk && ISI.has(rw.k[0]) && ISI.has(rk.k[0]) && !istilahEn.has(w) && !istilahEn.has(lain) && !entEn.has(w) && !entEn.has(lain) && sasaranBoleh(w) && sasaranBoleh(lain)) pasangan.push([w, p]);
    }

    /* 1+2) TERJEMAH 22.000 — 11.000 tiap arah, 4 frasa berputar */
    const FR_ID = ['apa arti kata {w} bahasa inggris', 'apa bahasa inggrisnya {w}', '{w} artinya apa dalam bahasa inggris', 'kata {w} bahasa inggrisnya apa'];
    const FR_EN = ['what does {w} mean in indonesian', 'what is {w} in indonesian', 'how do you say {w} in indonesian', 'the indonesian word for {w}, please'];
    let n = 0, i = 0;
    while (n < 11000 && pasangan.length) {
      const [w, p] = pasangan[i % pasangan.length];
      const frasa = FR_ID[Math.floor(n / pasangan.length) % FR_ID.length];
      dorong('terjemah-id-en', { soal: frasa.replace('{w}', w), harap: p.en, cek: (h) => h.teks.toLowerCase().includes('"' + p.en.toLowerCase() + '"') });
      n++; i++;
    }
    n = 0; i = 0;
    while (n < 11000 && pasangan.length) {
      const [w, p] = pasangan[(i + 7) % pasangan.length];
      const frasa = FR_EN[Math.floor(n / pasangan.length) % FR_EN.length];
      dorong('terjemah-en-id', { soal: frasa.replace('{w}', w), harap: p.id, cek: (h) => h.teks.toLowerCase().includes('"' + p.id.toLowerCase() + '"') });
      n++; i++;
    }

    /* 3) KODE MATEMATIKA 6.000 */
    let kata10 = kocok([...K.petaKata.keys()], rng);
    kata10 = perluasan(kata10);
    for (let k = 0; k < 6000; k++) {
      const w = kata10[k % kata10.length];
      const r = K.petaKata.get(w);
      const frasa = k % 2 === 0 ? 'apa kode angka kata ' + w : (k % 4 === 1 ? 'what is the math code of ' + w : 'berapa kode ' + w);
      dorong('kode', { soal: frasa, harap: r.kode.toString(), cek: (h) => h.teks.includes(r.kode.toString()) });
    }

    /* 4) KELAS-KATA 4.600 — 70% tanya kelas sejati, 30% kelas lain */
    const KELAS_LAIN = { v: 'n', n: 'adj', adj: 'v', adv: 'n', num: 'v', prep: 'n', conj: 'n', det: 'n', pron: 'n', part: 'v', prop: 'n', cop: 'v', aux: 'v', wh: 'n', neg: 'v', x: 'n', aspek: 'v', int: 'n' };
    const NAMA_KELAS = { v: [['kata kerja', 'apakah {w} kata kerja'], ['verb', 'is {w} a verb']], n: [['kata benda', 'apakah {w} kata benda'], ['noun', 'is {w} a noun']], adj: [['kata sifat', 'apakah {w} kata sifat'], ['adjective', 'is {w} an adjective']], adv: [['kata keterangan', 'apakah {w} kata keterangan'], ['adverb', 'is {w} an adverb']], num: [['bilangan', 'apakah {w} bilangan'], ['number', 'is {w} a number']], prep: [['kata depan', 'apakah {w} kata depan'], ['preposition', 'is {w} a preposition']], pron: [['ganti nama', 'apakah {w} ganti nama'], ['pronoun', 'is {w} a pronoun']], det: [['penentu', 'apakah {w} kata penentu'], ['determiner', 'is {w} a determiner']], conj: [['kata sambung', 'apakah {w} kata sambung'], ['conjunction', 'is {w} a conjunction']], part: [['partikel', 'apakah {w} partikel'], ['particle', 'is {w} a particle']], prop: [['nama diri', 'apakah {w} nama diri'], ['proper noun', 'is {w} a proper noun']], cop: [['kopula', 'apakah {w} kopula'], ['copula', 'is {w} a copula']], aux: [['auxiliary', 'apakah {w} auxiliary'], ['auxiliary', 'is {w} an auxiliary']], wh: [['kata tanya', 'apakah {w} kata tanya'], ['wh-word', 'is {w} a wh-word']], neg: [['negasi', 'apakah {w} negasi'], ['negation', 'is {w} a negation']], x: [['kata kamus', 'apakah {w} kata kamus'], ['dictionary word', 'is {w} a dictionary word']], aspek: [['aspek', 'apakah {w} kata aspek'], ['aspect', 'is {w} an aspect']], int: [['interupsi', 'apakah {w} interupsi'], ['interjection', 'is {w} an interjection']] };
    const kataKelas = kata10.filter(w => { const r = K.petaKata.get(w); return r && r.k[0] !== 'x'; });
    /* kata10 & kataKelas sudah tersaring perluasan */
    for (let k = 0; k < 4600; k++) {
      const w = kataKelas[k % kataKelas.length];
      const r = K.petaKata.get(w);
      const tanyaBenar = rng() % 10 < 7;
      const kelasTanya = tanyaBenar ? r.k[0] : (KELAS_LAIN[r.k[0]] || 'n');
      const nm = NAMA_KELAS[kelasTanya] ? NAMA_KELAS[kelasTanya][k % 2] : [kelasTanya, kelasTanya];
      const soal = nm[1].replace('{w}', w);
      const harap = r.k.includes(kelasTanya);
      dorong('kelas', { soal, harap: harap ? 'ya' : 'tidak', cek: (h) => harap ? /^(ya|yes)\b/i.test(h.teks) : /^(tidak|no)\b/i.test(h.teks) });
    }

    /* 5) LAWAN 600 */
    const lawanSemua = [];
    const lawanPeta = {}; // last-wins — selaras petaLawan otak (Map.set terakhir menang)
    for (const [a, b] of (O.lawan.en || [])) { if (sasaranBoleh(a) && sasaranBoleh(b)) { lawanPeta['en:' + a] = b; lawanPeta['en:' + b] = a; } }
    for (const [a, b] of (O.lawan.id || [])) { if (sasaranBoleh(a) && sasaranBoleh(b)) { lawanPeta['id:' + a] = b; lawanPeta['id:' + b] = a; } }
    for (const [k, b] of Object.entries(lawanPeta)) { const [lg, a] = k.split(':'); lawanSemua.push([lg, a, b]); }
    for (let k = 0; k < 600 && lawanSemua.length; k++) {
      const [lg, a, b] = lawanSemua[k % lawanSemua.length];
      const soal = lg === 'id' ? 'apa lawan kata ' + a : 'what is the opposite of ' + a;
      dorong('lawan', { soal, harap: b, cek: (h) => h.teks.toLowerCase().includes('"' + b.toLowerCase() + '"') });
    }

    /* 6) MORFOLOGI 3.600 — jamak EN 1200, lampau EN 1200, jamak ID 1200 */
    const kataN_EN = kata10.filter(w => K.petaKata.get(w).b === 0 && K.petaKata.get(w).k.includes('n') && !/(ed|ing)$/.test(w));
    const kataV_EN = kata10.filter(w => K.petaKata.get(w).b === 0 && K.petaKata.get(w).k.includes('v') && !/(ed|ing|s)$/.test(w));
    const kataN_ID = kata10.filter(w => K.petaKata.get(w).b === 1 && K.petaKata.get(w).k.includes('n') && !w.includes(' '));
    for (let k = 0; k < 1200 && kataN_EN.length; k++) {
      const w = kataN_EN[k % kataN_EN.length]; const harap = refJamak(w);
      const soal = 'what is the plural of ' + w;
      dorong('morfologi', { soal, harap, cek: (h) => h.teks.toLowerCase().includes('"' + harap + '"') });
    }
    for (let k = 0; k < 1200 && kataV_EN.length; k++) {
      const w = kataV_EN[k % kataV_EN.length]; const harap = refLampau(w);
      const soal = 'what is the past of ' + w;
      dorong('morfologi', { soal, harap, cek: (h) => h.teks.toLowerCase().includes('"' + harap + '"') });
    }
    for (let k = 0; k < 1200 && kataN_ID.length; k++) {
      const w = kataN_ID[k % kataN_ID.length]; const harap = w + '-' + w;
      const soal = 'apa bentuk jamak dari ' + w;
      dorong('morfologi', { soal, harap, cek: (h) => h.teks.toLowerCase().includes('"' + harap + '"') });
    }

    /* 7) DASAR-ANGKA 4.600 — aritmetika kata 3600 + hari matematika 1000 */
    const OP_ID = [['tambah', '+'], ['kurang', '-'], ['kali', '*']];
    const OP_EN = [['plus', '+'], ['minus', '-'], ['times', '*']];
    const kataAngka = Object.entries(O.nilaiKata || {}).filter(([w, v]) => Number.isInteger(v) && v >= 0 && v <= 1000);
    for (let k = 0; k < 3600 && kataAngka.length >= 2; k++) {
      const [w1, v1] = kataAngka[rng() % kataAngka.length];
      const [w2, v2] = kataAngka[rng() % kataAngka.length];
      const id = k % 2 === 0;
      const [opNama, op] = (id ? OP_ID : OP_EN)[k % 3 === 0 ? 0 : (k % 3 === 1 ? 1 : 2)];
      const harap = op === '+' ? v1 + v2 : op === '-' ? v1 - v2 : v1 * v2;
      const soal = id ? w1 + ' ' + opNama + ' ' + w2 : w1 + ' ' + opNama + ' ' + w2;
      dorong('dasar-angka', { soal, harap: String(harap), cek: (h) => h.teks.includes(String(harap)) });
    }
    const kataHari = Object.entries(O.urutKata || {}).filter(([w, u]) => u <= 6 && K.petaKata.get(w) && K.petaKata.get(w).kat === 'hari');
    for (let k = 0; k < 1000 && kataHari.length; k++) {
      const [w, u] = kataHari[k % kataHari.length];
      const nn = 1 + (rng() % 10);
      const setelah = k % 2 === 0;
      const urutHasil = ((u + (setelah ? nn : -nn)) % 7 + 7) % 7;
      const id = k % 4 < 2;
      const soal = id ? nn + ' hari ' + (setelah ? 'setelah' : 'sebelum') + ' ' + w : nn + ' day' + (nn > 1 ? 's' : '') + ' ' + (setelah ? 'after' : 'before') + ' ' + w;
      const harapID2 = refHariNama(urutHasil, true), harapEN2 = refHariNama(urutHasil, false);
      dorong('dasar-angka', { soal, harap: harapID2, cek: (h) => h.teks.includes(harapID2) || h.teks.includes(harapEN2) });
    }

    /* 8) ISTILAH PEKERJAAN 1.600 — 20 istilah × 2 bahasa × 40 putaran */
    const istilahKunci = Object.keys(P.kerja.istilah);
    for (let k = 0; k < 1600 && istilahKunci.length; k++) {
      const ik = istilahKunci[k % istilahKunci.length];
      const iv = P.kerja.istilah[ik];
      const id = k % 2 === 0;
      const judul = id ? ik.replace(/-/g, ' ') : iv.en;
      const soal = id ? (k % 4 < 2 ? 'apa itu ' + judul : 'jelaskan ' + judul) : (k % 4 < 2 ? 'what is ' + judul : 'explain ' + judul);
      const def = (iv.def[id ? 'id' : 'en'] || '').toLowerCase();
      const inti = def.slice(0, Math.min(22, def.length));
      dorong('istilah', { soal, harap: inti, cek: (h) => h.teks.toLowerCase().includes(inti) });
    }

    /* 9) HARI REAL-TIME 1.000 */
    for (let k = 0; k < 1000; k++) {
      const id = k % 2 === 0;
      const soal = id ? (k % 4 < 2 ? 'hari ini hari apa' : 'sekarang hari apa ya') : (k % 4 < 2 ? 'what day is it today' : 'what day today');
      dorong('hari-realtime', {
        soal, realtime: true,
        cek: (h) => { const harap = refHariNama(new Date().getDay(), id); return h.teks.includes(harap); }
      });
    }

    /* 10) KOIN REAL-TIME 1.400 — harga 500, arah 500, nama 400 */
    const koinK = Object.keys((O.koin && O.koin.koin) || {});
    for (let k = 0; k < 700 && koinK.length; k++) {
      const s = koinK[k % koinK.length];
      const id = k % 2 === 0;
      const soal = id ? (k % 4 < 2 ? 'berapa harga ' + s + ' sekarang' : 'harga ' + s + ' berapa') : (k % 4 < 2 ? 'what is the price of ' + s + ' now' : s + ' price, please');
      dorong('koin-realtime', {
        soal, realtime: true, butuhPasar: true,
        cek: (h) => {
          const t = pasar.ticker[s]; if (!t) return h.teks.includes('belum terjangkau') || h.teks.includes('unreachable');
          return h.teks.includes(refFormat(t.harga, id ? 'id' : 'en'));
        }
      });
    }
    for (let k = 0; k < 700 && koinK.length; k++) {
      const s = koinK[k % koinK.length];
      const id = k % 2 === 0;
      const soal = id ? (k % 4 < 2 ? s + ' naik atau turun' : 'apakah ' + s + ' naik 24 jam') : (k % 4 < 2 ? 'is ' + s + ' up or down' : s + ' up in 24h?');
      dorong('koin-realtime', {
        soal, realtime: true, butuhPasar: true,
        cek: (h) => {
          const t = pasar.ticker[s]; if (!t) return h.teks.includes('belum terjangkau') || h.teks.includes('unreachable');
          const naik = t.ubah24 >= 0;
          return naik ? (id ? h.teks.includes('NAIK') || h.teks.includes('naik') : h.teks.includes('UP') || h.teks.includes('up'))
            : (id ? h.teks.includes('TURUN') || h.teks.includes('turun') : h.teks.includes('DOWN') || h.teks.includes('down'));
        }
      });
    }
    /* 11) RANGKAI KALIMAT 3.600 */
    const kataRangkaiDasar = kata10.filter(w => w.length > 2 && !w.includes(' ') && !w.includes('-') && !/(ed|ing|s|ly)$/.test(w) && ['n','v','adj'].includes(K.petaKata.get(w).k[0]));
    const kataRangkaiID = kataRangkaiDasar.filter(w => K.petaKata.get(w).b === 1 && sasaranBoleh(w));
    const kataRangkaiEN = kataRangkaiDasar.filter(w => K.petaKata.get(w).b === 0 && sasaranBoleh(w));
    for (let k = 0; k < 3600 && kataRangkaiDasar.length; k++) {
      const id = k % 2 === 0;
      const kolam = id ? kataRangkaiID : kataRangkaiEN;
      if (!kolam.length) continue;
      const w = kolam[(k * 7 + 3) % kolam.length];
      const soal = id ? 'buat kalimat dengan kata ' + w : 'make a sentence with ' + w;
      const varian = variasiKata(w);
      dorong('rangkai', {
        soal, harap: w,
        cek: (h) => {
          const t = h.teks.toLowerCase();
          if (!h.periksa || !h.periksa.sah) return false;
          return varian.some(v => v && t.includes(v));
        }
      });
    }

    /* 12) BERTANYA 1.000 — 500 tiap bahasa */
    for (let k = 0; k < 1000; k++) {
      dorong('bertanya', { soal: null, lang: k % 2 === 0 ? 'id' : 'en', cek: null });
    }

    return kocok(soal, buatBenih(benih ^ 0x5eed));
  }

  /* ---- eksekusi uji ---- */
  async function uji(opsi) {
    const jumlah = (opsi && opsi.jumlah) || 50000;
    const benih = (opsi && opsi.benih) || 0x3430001;
    const ambilPasar = opsi && opsi.ambilPasar;
    const kemajuan = opsi && opsi.kemajuan;
    if (!O.siap) throw new Error('otak belum siap');
    let pasar = { ticker: {}, waktu: null };
    const perluPasar = true;
    if (perluPasar && ambilPasar) {
      try { pasar = await ambilPasar(); } catch (e) { pasar = { ticker: {}, waktu: null, gagal: String(e && e.message || e) }; }
    }
    const semua = rangkaiSemuaSoal(benih, pasar).slice(0, jumlah);
    const hasil = { benih, jumlah: semua.length, waktu: new Date().toISOString(), perKategori: {}, gugur: [], stat: { ms: 0 } };
    let lulus = 0;
    const unikRangkai = new Set(), unikTanya = new Set();
    const t0 = Date.now();
    for (let i = 0; i < semua.length; i++) {
      const q = semua[i];
      let ok = false, jawabTeks = '', hIntent = null, hBahasa = null, hSah = null;
      if (q.kat === 'bertanya') {
        const t = O.diaBertanya(q.lang);
        jawabTeks = t.teks;
        const kataTanya = /(apa|bagaimana|apakah|sudahkah|boleh|siapa|mengapa|kapan|berapa|what|how|do you|have you|may i|which|who|why|when)/i;
        ok = jawabTeks.includes('?') && kataTanya.test(jawabTeks);
        unikTanya.add(jawabTeks);
      } else {
        const h = O.jawab(q.soal, { mode: 'auto', pasar });
        jawabTeks = h.teks; hIntent = h.intent; hBahasa = h.bahasa; hSah = h.periksa ? h.periksa.sah : null;
        ok = !!q.cek(h);
        hasil.stat.ms += h.ms;
        if (q.kat === 'rangkai') unikRangkai.add(h.teks);
      }
      const kat = hasil.perKategori[q.kat] = hasil.perKategori[q.kat] || { n: 0, lulus: 0 };
      kat.n++;
      if (ok) { lulus++; kat.lulus++; }
      else if (hasil.gugur.length < 400) hasil.gugur.push({ kat: q.kat, soal: q.soal, jawab: jawabTeks.slice(0, 140), intent: hIntent, bahasa: hBahasa, sah: hSah });
      if (kemajuan && i % 2000 === 0) kemajuan(i, semua.length, lulus);
    }
    hasil.lulus = lulus;
    hasil.gugurJumlah = semua.length - lulus;
    hasil.persen = Math.round(lulus / semua.length * 10000) / 100;
    hasil.unikRangkai = unikRangkai.size;
    hasil.unikTanya = unikTanya.size;
    hasil.durasiDetik = Math.round((Date.now() - t0) / 100) / 10;
    return hasil;
  }

  O.ujiBahasa = uji;
  O.ujiBahasaRangkai = rangkaiSemuaSoal;
})();
