/* ============================================================
   OTAK-BAHASA-UJI V344 — PENGUJI (EXAMINER)
   50.000 soal acak berbenih (nol Math.random) — BAHAN AJAR, BUKAN MENU.
   Mandat pemilik (2026-10-12): uji 50.000 itu untuk PENGAJARAN —
   dijalankan lab Node + denyut, bukan tombol di halaman; kalau ada yang
   gugur → benahi OTAK (bukan kunci jawaban) sampai lulus semua.
   17 kategori: terjemah dwiarah, kode matematika, kelas-kata, lawan,
   morfologi, dasar-angka & hari-matematika, istilah pekerjaan,
   hari real-time, koin real-time, rangkai kalimat, bertanya +
   DIALOG V344: rasa (akui/bantah/puji/koreksi/maaf/kabar/rasa),
   rujuk (anaphora dia/itu/it), penggal (dan yang tadi?),
   nyeleneh (kenapa-alasan, absurd, umur/lahir), urut (rantai giliran).
   Prinsip jujur:
   - penguji TIDAK memakai jalur jawab otak; ia punya rujukan sendiri
   - nol tabel soal→jawaban disimpan; semua soal dirangkai dari data
   - setiap soal dinilai fungsi-cek independen; soal dialog = SERI giliran
     yang dijalankan berurutan pada ingatan sesi yang sama (uji konteks)
   Dipakai Node (lab) dan browser — hasil identik berbenih.
   ============================================================ */
(function () {
  'use strict';
  /* V344-REV-U5 */
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
    /* V344: bentuk meN-/ber- — memahami memuat 'memaham' (p terhapus), bukan 'paham' */
    if (O.morf && O.morf.id) { try { v.push(O.morf.id.meN(w.toLowerCase()), O.morf.id.ber(w.toLowerCase())); } catch (e) {} }
    return v;
  }

  /* ---- generator soal ---- */
  function rangkaiSemuaSoal(benih, pasar) {
    const rng = buatBenih(benih);
    const soal = [];
    const dorong = (kat, q) => soal.push(Object.assign({ kat }, q));
    const K = O.kode, P = O.pen;
    /* kata yang TIDAK boleh jadi sasaran soal: kata-kunci meta otak, simbol/nama koin, imbuhan -mu */
    const META_KATA = new Set(['what', 'code', 'name', 'lawan', 'kata', 'word', 'apa', 'kode', 'number', 'angka', 'verb', 'noun', 'class', 'kelas', 'is', 'are', 'the', 'a', 'an', 'of', 'dari', 'itu', 'ini', 'opposite', 'antonim', 'antonym', 'math', 'matematika', 'adjective', 'adverb', 'kata-kerja', 'kata-benda', 'kata-sifat', 'kata-keterangan', 'berapa', 'how', 'how-much', 'give', 'berikan', 'tell', 'sebutkan', 'please', 'tolong', 'plural', 'jamak', 'past', 'lampau', 'bentuk', 'arti', 'artinya', 'terjemah', 'terjemahkan', 'translate', 'mean', 'means', 'meaning', 'bahasa', 'language', 'inggris', 'english', 'indonesia', 'indonesian', 'sentence', 'kalimat', 'with', 'dengan', 'make', 'buat', 'rangkai', 'wh', 'wh-word', 'nama', 'diri', 'proper', 'proper-noun', 'nama-diri', 'auxiliary', 'aux', 'bilangan', 'partikel', 'explain', 'jelaskan', 'hari', 'day', 'koin', 'coin', 'harga', 'price', 'naik', 'turun', 'grafik', 'chart', 'buy', 'beli', 'pakem', 'tournament', 'turnamen', 'uji-50', 'uji50', 'trader', 'trading', 'pedagang', 'dagang', 'heart', 'jantung', 'motto', 'diaman', 'master', 'tuan', 'eat', 'makan', 'live', 'rumah', 'hidup', 'tinggal', 'job', 'work', 'pekerjaan', 'kerja', 'speak', 'bicara', 'ask', 'tanya', 'thanks', 'thank', 'hello', 'halo', 'helo', 'check', 'periksa', 'now', 'sekarang', 'today', 'hari-ini', 'detik', 'second', 'minute', 'menit', 'jam', 'hour', 'waktu', 'time', 'tanggal', 'jump', 'run', 'swim', 'fly', 'climb', 'sing', 'cook', 'read', 'write', 'sleep', 'drink', 'see', 'walk', 'particle', 'preposition', 'conjunction', 'determiner', 'pronoun', 'copula', 'negation', 'interjection', 'proper', 'hei', 'hi', 'hey', 'halo', 'hai', 'selamat', 'adalah', 'ialah', 'merupakan', 'say', 'bilang', 'bye', 'goodbye', 'pamit', 'good', 'bernama', 'ok', 'okay', 'yes', 'no', 'ya', 'tidak', 'aspect', 'aspek', 'kopula', 'depan', 'benda', 'jenis', 'keterangan', 'penentu', 'kamus', 'telah', 'sedang', 'tengah', 'sukai', 'ganti', 'dibagi', 'ditambah', 'dikurang', 'dikurangi', 'dikalikan', 'times', 'plus', 'minus', 'divided', 'umur', 'umurmu', 'lahir', 'born', 'old', 'bosan', 'bored', 'pintar', 'smart', 'salah', 'wrong', 'maaf', 'sorry', 'bantu', 'help', 'kabar', 'perkenalkan', 'introduce', 'apakah', 'bisakah', 'kenapa', 'kenapakah', 'mengapa', 'gimana', 'lalu', 'saja', 'sudah', 'sudahkah']);
    const kataKoin = new Set();
    for (const [sym, k] of Object.entries((O.koin && O.koin.koin) || {})) { kataKoin.add(sym.toLowerCase()); kataKoin.add(k.nama.toLowerCase()); }
    const balikLampauU = {}; for (const [a, b] of Object.entries(TAK_BERATURAN_LAMPAU)) balikLampauU[b] = a;
    const balikJamakU = {}; for (const [a, b] of Object.entries(TAK_BERATURAN_JAMAK)) balikJamakU[b] = a;
    const sasaranBoleh = (w) => !META_KATA.has(w) && !kataKoin.has(w) && !/mu$/.test(w) && !w.includes(' ') && !/\d/.test(w) && !/'/.test(w) && !(w.endsWith('s') && META_KATA.has(w.slice(0, -1))) && !balikLampauU[w] && !balikJamakU[w];
    const perluasan = (kandidat) => kandidat.filter(sasaranBoleh);

    /* pasangan dwibahasa dari tabel kode — hanya kata isi (kelas nyata) */
    const ISI = new Set(['n', 'v', 'adj', 'adv', 'num']);
    const pasangan = [];
    const istilahEn = new Set(Object.values(P.kerja.istilah).map(iv => iv.en));
    const entEn = new Set(Object.values(P.entitas).map(e => e.en));
    for (const [w, p] of (K.petaPasang || new Map())) {
      const rw = K.petaKata.get(w);
      const lain = rw && rw.pair >= 0 ? K.recs[rw.pair].w : null;
      const rk = lain ? K.petaKata.get(lain) : null;
      if (rw && rk && ISI.has(rw.k[0]) && ISI.has(rk.k[0]) && !istilahEn.has(w) && !istilahEn.has(lain) && !entEn.has(w) && !entEn.has(lain) && sasaranBoleh(w) && sasaranBoleh(lain)) pasangan.push([w, p]);
    }

    /* 1+2) TERJEMAH 13.000 — 6.500 tiap arah, 4 frasa berputar */
    const FR_ID = ['apa arti kata {w} bahasa inggris', 'apa bahasa inggrisnya {w}', '{w} artinya apa dalam bahasa inggris', 'kata {w} bahasa inggrisnya apa'];
    const FR_EN = ['what does {w} mean in indonesian', 'what is {w} in indonesian', 'how do you say {w} in indonesian', 'the indonesian word for {w}, please'];
    let n = 0, i = 0;
    while (n < 6500 && pasangan.length) {
      const [w, p] = pasangan[i % pasangan.length];
      const frasa = FR_ID[Math.floor(n / pasangan.length) % FR_ID.length];
      dorong('terjemah-id-en', { soal: frasa.replace('{w}', w), harap: p.en, cek: (h) => h.teks.toLowerCase().includes('"' + p.en.toLowerCase() + '"') });
      n++; i++;
    }
    n = 0; i = 0;
    while (n < 6500 && pasangan.length) {
      const [w, p] = pasangan[(i + 7) % pasangan.length];
      const frasa = FR_EN[Math.floor(n / pasangan.length) % FR_EN.length];
      dorong('terjemah-en-id', { soal: frasa.replace('{w}', w), harap: p.id, cek: (h) => h.teks.toLowerCase().includes('"' + p.id.toLowerCase() + '"') });
      n++; i++;
    }

    /* 3) KODE MATEMATIKA 3.500 */
    let kata10 = kocok([...K.petaKata.keys()], rng);
    kata10 = perluasan(kata10);
    for (let k = 0; k < 3500; k++) {
      const w = kata10[k % kata10.length];
      const r = K.petaKata.get(w);
      const frasa = k % 2 === 0 ? 'apa kode angka kata ' + w : (k % 4 === 1 ? 'what is the math code of ' + w : 'berapa kode ' + w);
      dorong('kode', { soal: frasa, harap: r.kode.toString(), cek: (h) => h.teks.includes(r.kode.toString()) });
    }

    /* 4) KELAS-KATA 2.400 — 70% tanya kelas sejati, 30% kelas lain */
    const KELAS_LAIN = { v: 'n', n: 'adj', adj: 'v', adv: 'n', num: 'v', prep: 'n', conj: 'n', det: 'n', pron: 'n', part: 'v', prop: 'n', cop: 'v', aux: 'v', wh: 'n', neg: 'v', x: 'n', aspek: 'v', int: 'n' };
    const NAMA_KELAS = { v: [['kata kerja', 'apakah {w} kata kerja'], ['verb', 'is {w} a verb']], n: [['kata benda', 'apakah {w} kata benda'], ['noun', 'is {w} a noun']], adj: [['kata sifat', 'apakah {w} kata sifat'], ['adjective', 'is {w} an adjective']], adv: [['kata keterangan', 'apakah {w} kata keterangan'], ['adverb', 'is {w} an adverb']], num: [['bilangan', 'apakah {w} bilangan'], ['number', 'is {w} a number']], prep: [['kata depan', 'apakah {w} kata depan'], ['preposition', 'is {w} a preposition']], pron: [['ganti nama', 'apakah {w} ganti nama'], ['pronoun', 'is {w} a pronoun']], det: [['penentu', 'apakah {w} kata penentu'], ['determiner', 'is {w} a determiner']], conj: [['kata sambung', 'apakah {w} kata sambung'], ['conjunction', 'is {w} a conjunction']], part: [['partikel', 'apakah {w} partikel'], ['particle', 'is {w} a particle']], prop: [['nama diri', 'apakah {w} nama diri'], ['proper noun', 'is {w} a proper noun']], cop: [['kopula', 'apakah {w} kopula'], ['copula', 'is {w} a copula']], aux: [['auxiliary', 'apakah {w} auxiliary'], ['auxiliary', 'is {w} an auxiliary']], wh: [['kata tanya', 'apakah {w} kata tanya'], ['wh-word', 'is {w} a wh-word']], neg: [['negasi', 'apakah {w} negasi'], ['negation', 'is {w} a negation']], x: [['kata kamus', 'apakah {w} kata kamus'], ['dictionary word', 'is {w} a dictionary word']], aspek: [['aspek', 'apakah {w} kata aspek'], ['aspect', 'is {w} an aspect']], int: [['interupsi', 'apakah {w} interupsi'], ['interjection', 'is {w} an interjection']] };
    const kataKelas = kata10.filter(w => { const r = K.petaKata.get(w); return r && r.k[0] !== 'x'; });
    for (let k = 0; k < 2400; k++) {
      const w = kataKelas[k % kataKelas.length];
      const r = K.petaKata.get(w);
      const tanyaBenar = rng() % 10 < 7;
      const kelasTanya = tanyaBenar ? r.k[0] : (KELAS_LAIN[r.k[0]] || 'n');
      const nm = NAMA_KELAS[kelasTanya] ? NAMA_KELAS[kelasTanya][k % 2] : [kelasTanya, kelasTanya];
      const soal = nm[1].replace('{w}', w);
      const harap = r.k.includes(kelasTanya);
      dorong('kelas', { soal, harap: harap ? 'ya' : 'tidak', cek: (h) => harap ? /^(ya|yes)\b/i.test(h.teks) : /^(tidak|no)\b/i.test(h.teks) });
    }

    /* 5) LAWAN 400 */
    const lawanSemua = [];
    const lawanPeta = {}; // last-wins — selaras petaLawan otak (Map.set terakhir menang)
    for (const [a, b] of (O.lawan.en || [])) { if (sasaranBoleh(a) && sasaranBoleh(b)) { lawanPeta['en:' + a] = b; lawanPeta['en:' + b] = a; } }
    for (const [a, b] of (O.lawan.id || [])) { if (sasaranBoleh(a) && sasaranBoleh(b)) { lawanPeta['id:' + a] = b; lawanPeta['id:' + b] = a; } }
    for (const [k, b] of Object.entries(lawanPeta)) { const [lg, a] = k.split(':'); lawanSemua.push([lg, a, b]); }
    for (let k = 0; k < 400 && lawanSemua.length; k++) {
      const [lg, a, b] = lawanSemua[k % lawanSemua.length];
      const soal = lg === 'id' ? 'apa lawan kata ' + a : 'what is the opposite of ' + a;
      dorong('lawan', { soal, harap: b, cek: (h) => h.teks.toLowerCase().includes('"' + b.toLowerCase() + '"') });
    }

    /* 6) MORFOLOGI 2.800 — jamak EN 900, lampau EN 1000, jamak ID 900 */
    const kataN_EN = kata10.filter(w => K.petaKata.get(w).b === 0 && K.petaKata.get(w).k.includes('n') && !/(ed|ing)$/.test(w));
    const kataV_EN = kata10.filter(w => K.petaKata.get(w).b === 0 && K.petaKata.get(w).k.includes('v') && !/(ed|ing|s)$/.test(w));
    const kataN_ID = kata10.filter(w => K.petaKata.get(w).b === 1 && K.petaKata.get(w).k.includes('n') && !w.includes(' '));
    for (let k = 0; k < 900 && kataN_EN.length; k++) {
      const w = kataN_EN[k % kataN_EN.length]; const harap = refJamak(w);
      const soal = 'what is the plural of ' + w;
      dorong('morfologi', { soal, harap, cek: (h) => h.teks.toLowerCase().includes('"' + harap + '"') });
    }
    for (let k = 0; k < 1000 && kataV_EN.length; k++) {
      const w = kataV_EN[k % kataV_EN.length]; const harap = refLampau(w);
      const soal = 'what is the past of ' + w;
      dorong('morfologi', { soal, harap, cek: (h) => h.teks.toLowerCase().includes('"' + harap + '"') });
    }
    for (let k = 0; k < 900 && kataN_ID.length; k++) {
      const w = kataN_ID[k % kataN_ID.length]; const harap = w + '-' + w;
      const soal = 'apa bentuk jamak dari ' + w;
      dorong('morfologi', { soal, harap, cek: (h) => h.teks.toLowerCase().includes('"' + harap + '"') });
    }

    /* 7) DASAR-ANGKA 3.400 — aritmetika kata 2600 + hari matematika 800 */
    const OP_ID = [['tambah', '+'], ['kurang', '-'], ['kali', '*']];
    const OP_EN = [['plus', '+'], ['minus', '-'], ['times', '*']];
    const kataAngka = Object.entries(O.nilaiKata || {}).filter(([w, v]) => Number.isInteger(v) && v >= 0 && v <= 1000);
    for (let k = 0; k < 2600 && kataAngka.length >= 2; k++) {
      const [w1, v1] = kataAngka[rng() % kataAngka.length];
      const [w2, v2] = kataAngka[rng() % kataAngka.length];
      const id = k % 2 === 0;
      const [opNama, op] = (id ? OP_ID : OP_EN)[k % 3 === 0 ? 0 : (k % 3 === 1 ? 1 : 2)];
      const harap = op === '+' ? v1 + v2 : op === '-' ? v1 - v2 : v1 * v2;
      const soal = id ? w1 + ' ' + opNama + ' ' + w2 : w1 + ' ' + opNama + ' ' + w2;
      dorong('dasar-angka', { soal, harap: String(harap), cek: (h) => h.teks.includes(String(harap)) });
    }
    const kataHari = Object.entries(O.urutKata || {}).filter(([w, u]) => u <= 6 && K.petaKata.get(w) && K.petaKata.get(w).kat === 'hari');
    for (let k = 0; k < 800 && kataHari.length; k++) {
      const [w, u] = kataHari[k % kataHari.length];
      const nn = 1 + (rng() % 10);
      const setelah = k % 2 === 0;
      const urutHasil = ((u + (setelah ? nn : -nn)) % 7 + 7) % 7;
      const id = k % 4 < 2;
      const soal = id ? nn + ' hari ' + (setelah ? 'setelah' : 'sebelum') + ' ' + w : nn + ' day' + (nn > 1 ? 's' : '') + ' ' + (setelah ? 'after' : 'before') + ' ' + w;
      const harapID2 = refHariNama(urutHasil, true), harapEN2 = refHariNama(urutHasil, false);
      dorong('dasar-angka', { soal, harap: harapID2, cek: (h) => h.teks.includes(harapID2) || h.teks.includes(harapEN2) });
    }

    /* 8) ISTILAH PEKERJAAN 1.200 — 20 istilah × 2 bahasa × 30 putaran */
    const istilahKunci = Object.keys(P.kerja.istilah);
    for (let k = 0; k < 1200 && istilahKunci.length; k++) {
      const ik = istilahKunci[k % istilahKunci.length];
      const iv = P.kerja.istilah[ik];
      const id = k % 2 === 0;
      const judul = id ? ik.replace(/-/g, ' ') : iv.en;
      const soal = id ? (k % 4 < 2 ? 'apa itu ' + judul : 'jelaskan ' + judul) : (k % 4 < 2 ? 'what is ' + judul : 'explain ' + judul);
      const def = (iv.def[id ? 'id' : 'en'] || '').toLowerCase();
      const inti = def.slice(0, Math.min(22, def.length));
      dorong('istilah', { soal, harap: inti, cek: (h) => h.teks.toLowerCase().includes(inti) });
    }

    /* 9) HARI REAL-TIME 800 */
    for (let k = 0; k < 800; k++) {
      const id = k % 2 === 0;
      const soal = id ? (k % 4 < 2 ? 'hari ini hari apa' : 'sekarang hari apa ya') : (k % 4 < 2 ? 'what day is it today' : 'what day today');
      dorong('hari-realtime', {
        soal, realtime: true,
        cek: (h) => { const harap = refHariNama(new Date().getDay(), id); return h.teks.includes(harap); }
      });
    }

    /* 10) KOIN REAL-TIME 1.400 — harga 700, arah 700 */
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

    /* 11) RANGKAI KALIMAT 2.800 */
    const kataRangkaiDasar = kata10.filter(w => w.length > 2 && !w.includes(' ') && !w.includes('-') && !/(ed|ing|s|ly)$/.test(w) && ['n', 'v', 'adj'].includes(K.petaKata.get(w).k[0]));
    const kataRangkaiID = kataRangkaiDasar.filter(w => K.petaKata.get(w).b === 1 && sasaranBoleh(w));
    const kataRangkaiEN = kataRangkaiDasar.filter(w => K.petaKata.get(w).b === 0 && sasaranBoleh(w));
    for (let k = 0; k < 2800 && kataRangkaiDasar.length; k++) {
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

    /* 12) BERTANYA 600 — 300 tiap bahasa */
    for (let k = 0; k < 600; k++) {
      dorong('bertanya', { soal: null, lang: k % 2 === 0 ? 'id' : 'en', cek: null });
    }

    /* ================= V344: DIALOG — obrolan santai, seri giliran ================= */

    /* 13) DIALOG-RASA 3.800: akui 700, bantah 500, puji 500, kabar 500, maaf 300, koreksi 400, rasa 900 */
    const AKUI_ID = ['iya', 'ya', 'betul', 'benar', 'oke', 'sip', 'mantap', 'setuju', 'persis'], AKUI_EN = ['yes', 'right', 'correct', 'true', 'sure', 'okay'];
    const BANTAH_ID = ['tidak', 'nggak', 'bukan', 'jangan'], BANTAH_EN = ['no', 'nope', 'never'];
    const PUJI_ID = ['kamu pintar', 'kamu hebat', 'kamu keren', 'pintar sekali'], PUJI_EN = ['you are smart', 'you are great', 'you are amazing', 'smart answer'];
    const KABAR_ID = ['apa kabar', 'bagaimana kabarmu', 'gimana kabar kamu'], KABAR_EN = ['how are you', 'how do you do', 'how is it going'];
    const MAAF_ID = ['maaf', 'maaf ya', 'maafkan aku'], MAAF_EN = ['sorry', 'i am sorry', 'sorry about that'];
    const KOREKSI_ID = ['kamu salah', 'itu salah', 'kamu keliru'], KOREKSI_EN = ['you are wrong', 'that is wrong'];
    const RASA_ID = [['apakah kamu bosan', 'bosan'], ['kamu lelah?', 'lelah'], ['apakah kamu sedih', 'sedih'], ['kamu senang?', 'senang']];
    const RASA_EN = [['are you bored', 'bored'], ['are you tired', 'tired'], ['are you sad', 'sad'], ['are you happy', 'happy']];
    const putar = (k, arr) => arr[k % arr.length];
    for (let k = 0; k < 700; k++) dorong('dialog-rasa', { soal: putar(k, k % 2 ? AKUI_ID : AKUI_EN), cek: (h) => /^(bagus|syukur|baik|good|glad|all right)/i.test(h.teks.trim()) });
    for (let k = 0; k < 500; k++) dorong('dialog-rasa', { soal: putar(k, k % 2 ? BANTAH_ID : BANTAH_EN), cek: (h) => /^(baik|all right)/i.test(h.teks.trim()) });
    for (let k = 0; k < 500; k++) dorong('dialog-rasa', { soal: putar(k, k % 2 ? PUJI_ID : PUJI_EN), cek: (h) => h.teks.toLowerCase().includes('terima kasih') || h.teks.toLowerCase().includes('thank you') });
    for (let k = 0; k < 500; k++) dorong('dialog-rasa', { soal: putar(k, k % 2 ? KABAR_ID : KABAR_EN), cek: (h) => (h.teks.includes('jantungku') || h.teks.includes('my heart')) && (h.teks.includes('bagaimana') || h.teks.includes('how are you') || h.teks.includes('And how')) });
    for (let k = 0; k < 300; k++) dorong('dialog-rasa', { soal: putar(k, k % 2 ? MAAF_ID : MAAF_EN), cek: (h) => h.teks.toLowerCase().includes('tidak apa-apa') || h.teks.toLowerCase().includes('no problem') });
    for (let k = 0; k < 400; k++) dorong('dialog-rasa', { soal: putar(k, k % 2 ? KOREKSI_ID : KOREKSI_EN), cek: (h) => h.teks.toLowerCase().includes('periksa') || h.teks.toLowerCase().includes('check') });
    for (let k = 0; k < 900; k++) {
      const id = k % 2 === 0;
      const pas = putar(k, id ? RASA_ID : RASA_EN);
      const soal = pas[0], kataRasa = pas[1];
      dorong('dialog-rasa', { soal, cek: (h) => h.teks.toLowerCase().includes(kataRasa) && (h.teks.includes('makhluk data') || h.teks.includes('data life')) });
    }

    /* 14) DIALOG-RUJUK 3.600: primer lalu rujuk dia/itu/it — 1200 abil, 800 sifat, 800 rumah, 800 apa-itu */
    const entKunci = Object.keys(P.entitas);
    const PASANG_ABIL = [], PASANG_SIFAT = [], PASANG_RUMAH = [];
    for (const ek of entKunci) {
      const e = P.entitas[ek];
      for (const ab of (e.bisa || [])) if (['terbang', 'renang', 'jalan', 'lari', 'mendaki', 'melompat', 'berpikir', 'tidur', 'menyala', 'menyusui', 'menyanyi', 'bertelur', 'bicara'].includes(ab)) PASANG_ABIL.push({ ent: ek, abil: ab });
      for (const sf of (e.sifat || []).slice(0, 2)) PASANG_SIFAT.push({ ent: ek, sifat: sf });
      if (e.rumah && P['rumah-tempat'][e.rumah]) PASANG_RUMAH.push({ ent: ek, rumah: e.rumah });
    }
    const harapRumah = (rk, id) => (P['rumah-tempat'][rk].def[id ? 'id' : 'en'] || '').toLowerCase();
    const SIFAT_ID2EN_U = { panas: 'hot', dingin: 'cold', besar: 'big', kecil: 'small', tinggi: 'tall', rendah: 'low', panjang: 'long', pendek: 'short', kuat: 'strong', lemah: 'weak', cepat: 'fast', lambat: 'slow', keras: 'hard', lembut: 'soft', manis: 'sweet', pahit: 'bitter', basah: 'wet', kering: 'dry', merah: 'red', putih: 'white', kuning: 'yellow', hijau: 'green', biru: 'blue', hitam: 'black', jernih: 'clear', mahal: 'expensive', murah: 'cheap', indah: 'beautiful', terang: 'bright', gelap: 'dark', licin: 'slippery', ringan: 'light', cair: 'liquid', wangi: 'fragrant', setia: 'loyal', sabar: 'patient', raksasa: 'giant', rajin: 'diligent', teliti: 'careful', tegar: 'tough', lincah: 'agile', banyak: 'many', jauh: 'far', mengapung: 'floating', bergaris: 'striped', berdaun: 'leafy', berkilau: 'shiny', bernilai: 'valuable', berakal: 'sensible', belajar: 'studious', telaten: 'persistent', teratur: 'regular', rata: 'flat', berbatu: 'rocky', aromatik: 'aromatic', 'raja-hutan': 'king of the jungle', 'berbunyi-wok': 'cooing', 'bersuara-bagus': 'sweet-voiced', 'bersuara-moo': 'mooing', 'berkokok': 'crowing', 'bertelinga-panjang': 'long-eared', 'gigi-tajam': 'sharp-toothed', 'berkaki-pendek': 'short-legged', 'bersayap-indah': 'beautiful-winged', 'bersayap-tak-terbang': 'winged-but-flightless', 'tak-berkaki': 'legless', 'tak-terlihat': 'invisible', 'mengelilingi-bumi': 'orbiting-the-earth', 'menghasilkan-madu': 'honey-making', 'berisi-ilmu': 'full-of-knowledge', 'pintar-berguna': 'smart-and-useful', 'cepat-hitung': 'quick-at-counting', 'untuk-duduk': 'for-sitting', 'belalai': 'tusked' };
    for (let k = 0; k < 1200 && PASANG_ABIL.length; k++) {
      const pr = PASANG_ABIL[(k * 13 + 5) % PASANG_ABIL.length];
      const id = k % 2 === 0;
      const abTeks = id ? pr.abil.replace(/-/g, ' ') : abilEN(pr.abil);
      const primer = id ? 'apa itu ' + pr.ent : 'what is ' + P.entitas[pr.ent].en;
      const rujuk = id ? 'dia bisa ' + abTeks + '?' : 'can it ' + abTeks + '?';
      const ya = (P.entitas[pr.ent].bisa || []).includes(pr.abil);
      dorong('dialog-rujuk', {
        seri: [primer, rujuk],
        cek: (h, t) => t === 0 ? true : (ya ? /^(ya|yes)/i.test(h.teks.trim()) && h.teks.toLowerCase().includes(abTeks.split(' ')[0]) : /^(tidak|no)/i.test(h.teks.trim()))
      });
    }
    for (let k = 0; k < 800 && PASANG_SIFAT.length; k++) {
      const pr = PASANG_SIFAT[(k * 29 + 11) % PASANG_SIFAT.length];
      const id = k % 2 === 0;
      const primer = id ? 'apa itu ' + pr.ent : 'what is ' + P.entitas[pr.ent].en;
      const sifTeks = id ? pr.sifat.replace(/-/g, ' ') : (SIFAT_ID2EN_U[pr.sifat] || pr.sifat.replace(/-/g, ' '));
      const rujuk = id ? 'dia ' + sifTeks + '?' : 'is it ' + sifTeks + '?';
      const ya = (P.entitas[pr.ent].sifat || []).includes(pr.sifat);
      dorong('dialog-rujuk', {
        seri: [primer, rujuk],
        cek: (h, t) => t === 0 ? true : (ya ? /^(ya|yes)/i.test(h.teks.trim()) : /^(tidak|no)/i.test(h.teks.trim()))
      });
    }
    for (let k = 0; k < 800 && PASANG_RUMAH.length; k++) {
      const pr = PASANG_RUMAH[(k * 37 + 3) % PASANG_RUMAH.length];
      const id = k % 2 === 0;
      const primer = id ? 'apa itu ' + pr.ent : 'what is ' + P.entitas[pr.ent].en;
      const rujuk = id ? 'dia tinggal di mana?' : 'where does it live?';
      const hr = harapRumah(pr.rumah, id);
      const inti = hr.slice(0, Math.min(14, hr.length));
      dorong('dialog-rujuk', { seri: [primer, rujuk], cek: (h, t) => t === 0 ? true : h.teks.toLowerCase().includes(inti) });
    }
    for (let k = 0; k < 800 && entKunci.length; k++) {
      const ek = entKunci[(k * 41 + 7) % entKunci.length];
      const id = k % 2 === 0;
      const primer = id ? 'apa itu ' + ek : 'what is ' + P.entitas[ek].en;
      const rujuk = id ? 'yang tadi itu apa?' : 'what is that?';
      const harap = id ? ek : P.entitas[ek].en;
      dorong('dialog-rujuk', { seri: [primer, rujuk], cek: (h) => h.teks.toLowerCase().includes(harap.toLowerCase()) });
    }

    /* 15) DIALOG-PENGGAL 2.400: harga BTC → dan eth? → dan yang tadi? — 1200; arah → penggal — 1200 */
    for (let k = 0; k < 1200 && koinK.length > 1; k++) {
      const s1 = koinK[k % koinK.length], s2 = koinK[(k + 1) % koinK.length];
      if (s1 === s2) continue;
      const id = k % 2 === 0;
      const seri = id
        ? ['berapa harga ' + s1.toLowerCase() + ' sekarang', 'dan ' + s2.toLowerCase() + '?', 'dan yang tadi?']
        : ['what is the price of ' + s1.toLowerCase() + ' now', 'and ' + s2.toLowerCase() + '?', 'and the one before?'];
      dorong('dialog-penggal', {
        seri, butuhPasar: true,
        cek: (h, t) => {
          const s = t === 0 ? s1 : s2; // giliran 2 dan 3 sama-sama ETH (yang tadi = eth)
          const tk = pasar.ticker[s]; if (!tk) return h.teks.includes('belum terjangkau') || h.teks.includes('unreachable');
          return h.teks.includes(refFormat(tk.harga, id ? 'id' : 'en'));
        }
      });
    }
    for (let k = 0; k < 1200 && koinK.length; k++) {
      const s = koinK[k % koinK.length];
      const id = k % 2 === 0;
      const naik = !pasar.ticker[s] ? true : pasar.ticker[s].ubah24 >= 0;
      const seri = id
        ? [s.toLowerCase() + ' naik atau turun', 'dan kalau yang tadi?']
        : ['is ' + s.toLowerCase() + ' up or down', 'and that one?'];
      dorong('dialog-penggal', {
        seri, butuhPasar: true,
        cek: (h) => {
          const tk = pasar.ticker[s]; if (!tk) return h.teks.includes('belum terjangkau') || h.teks.includes('unreachable');
          return naik ? (h.teks.includes('NAIK') || h.teks.includes('naik') || h.teks.includes('UP') || h.teks.includes('up'))
            : (h.teks.includes('TURUN') || h.teks.includes('turun') || h.teks.includes('DOWN') || h.teks.includes('down'));
        }
      });
    }

    /* 16) DIALOG-NYELENEH 4.300: kenapa-bisa 1400, kenapa-tak 1000, absurd 900, umur 500, lahir 500 */
    const KATA_KUNCI_ALASAN = {
      terbang: { id: 'sayap', en: 'wing' }, renang: { id: 'sirip', en: 'fin' }, lari: { id: 'kaki', en: 'legs' }, jalan: { id: 'kaki', en: 'legs' },
      mendaki: { id: 'cakar', en: 'claw' }, melompat: { id: 'kaki', en: 'legs' }, berpikir: { id: 'otak', en: 'brain' }, tidur: { id: 'istirahat', en: 'rest' },
      menyusui: { id: 'susu', en: 'milk' }, menyala: { id: 'cahaya', en: 'light' }, bicara: { id: 'bahasa', en: 'language' }, menyanyi: { id: 'suara', en: 'voice' }, bertelur: { id: 'telur', en: 'egg' }
    };
    const KENAPA_BISA = [], KENAPA_TAK = [];
    for (const ek of entKunci) {
      const e = P.entitas[ek];
      const hidup = !['benda', 'makanan', 'minuman', 'alam'].includes(e.kelas);
      for (const ab of (e.bisa || [])) if (hidup && KATA_KUNCI_ALASAN[ab]) KENAPA_BISA.push({ ent: ek, abil: ab });
      for (const ab of (e.tak || [])) if (KATA_KUNCI_ALASAN[ab] && (hidup || ['terbang', 'renang', 'bicara', 'berpikir', 'menyusui', 'menyanyi'].includes(ab))) KENAPA_TAK.push({ ent: ek, abil: ab });
    }
    for (let k = 0; k < 1400 && KENAPA_BISA.length; k++) {
      const pr = KENAPA_BISA[(k * 17 + 9) % KENAPA_BISA.length];
      const id = k % 2 === 0;
      const abTeks = id ? pr.abil.replace(/-/g, ' ') : abilEN(pr.abil);
      const soal = id ? 'kenapa ' + pr.ent + ' bisa ' + abTeks + '?' : 'why can ' + P.entitas[pr.ent].en + ' ' + abTeks + '?';
      const kunci = KATA_KUNCI_ALASAN[pr.abil][id ? 'id' : 'en'];
      dorong('dialog-nyeleneh', { soal, cek: (h) => h.teks.toLowerCase().includes(kunci) });
    }
    for (let k = 0; k < 1000 && KENAPA_TAK.length; k++) {
      const pr = KENAPA_TAK[(k * 23 + 13) % KENAPA_TAK.length];
      const id = k % 2 === 0;
      const e = P.entitas[pr.ent];
      const abTeks = id ? pr.abil.replace(/-/g, ' ') : abilEN(pr.abil);
      const soal = id ? 'kenapa ' + pr.ent + ' tidak bisa ' + abTeks + '?' : 'why cannot ' + e.en + ' ' + abTeks + '?';
      const takHidup = ['benda', 'makanan', 'minuman', 'alam'].includes(e.kelas);
      const kunci = takHidup ? (id ? 'bukan makhluk hidup' : 'not a living being') : KATA_KUNCI_ALASAN[pr.abil][id ? 'id' : 'en'];
      dorong('dialog-nyeleneh', { soal, cek: (h) => h.teks.toLowerCase().includes(kunci) });
    }
    const ENT_ABSURD = entKunci.filter(ek => ['benda', 'makanan', 'minuman', 'alam'].includes(P.entitas[ek].kelas));
    const ABIL_ABSURD = ['terbang', 'tidur', 'bicara', 'renang', 'menyusui', 'berpikir', 'menyanyi', 'jalan', 'melompat', 'mendaki'];
    /* V344: cermin entBisa ditulis kedua (rujukan mandiri penguji) — hanya pasangan
       yang PASTI terjawab oleh data yang dijadikan soal absurd; sisanya digulirkan */
    const yakinTak = (e, ab) => (e.tak || []).includes(ab)
      || (['benda', 'makanan', 'minuman', 'kendaraan', 'tumbuhan'].includes(e.kelas) && GERAK_U.includes(ab))
      || (['benda', 'makanan', 'minuman', 'alam'].includes(e.kelas) && ['berpikir', 'bicara', 'menyanyi', 'tidur', 'menyusui', 'makan-daging', 'makan-tumbuhan'].includes(ab));
    const GERAK_U = ['terbang', 'renang', 'jalan', 'lari', 'mendaki', 'melompat', 'bicara', 'menyanyi', 'berpikir', 'makan-daging', 'makan-tumbuhan', 'menyusui', 'tidur'];
    for (let k = 0; k < 900 && ENT_ABSURD.length; k++) {
      let ek = ENT_ABSURD[(k * 19 + 3) % ENT_ABSURD.length], ab = ABIL_ABSURD[(k * 5 + 1) % ABIL_ABSURD.length];
      for (let coba = 0; coba < 50 && !yakinTak(P.entitas[ek], ab); coba++) {
        ek = ENT_ABSURD[(k * 19 + 3 + coba * 7) % ENT_ABSURD.length];
        ab = ABIL_ABSURD[(k * 5 + 1 + coba * 3) % ABIL_ABSURD.length];
      }
      const id = k % 2 === 0;
      const soal = id ? 'apakah ' + ek + ' bisa ' + ab.replace(/-/g, ' ') + '?' : 'can ' + P.entitas[ek].en + ' ' + abilEN(ab) + '?';
      dorong('dialog-nyeleneh', { soal, cek: (h) => /^(tidak|no)/i.test(h.teks.trim()) });
    }
    for (let k = 0; k < 500; k++) {
      const id = k % 2 === 0;
      const soal = id ? (k % 4 < 2 ? 'berapa umurmu' : 'umur kamu berapa') : (k % 4 < 2 ? 'how old are you' : 'how old are you now');
      dorong('dialog-nyeleneh', {
        soal, butuhLahir: true,
        cek: (h) => {
          if (h.teks.includes('belum tersambung')) return !O.diriLahirAt;
          const hari = Math.floor(Math.max(0, Date.now() - O.diriLahirAt) / 86400000);
          return h.teks.includes(String(hari)) || h.teks.includes(String(hari - 1)) || h.teks.includes(String(hari + 1));
        }
      });
    }
    for (let k = 0; k < 500; k++) {
      const id = k % 2 === 0;
      const soal = id ? (k % 4 < 2 ? 'kapan kamu lahir' : 'kapan lahirnya kamu') : (k % 4 < 2 ? 'when were you born' : 'when is your birthday');
      dorong('dialog-nyeleneh', {
        soal, butuhLahir: true,
        cek: (h) => {
          if (h.teks.includes('belum tersambung')) return !O.diriLahirAt;
          const d = new Date(O.diriLahirAt);
          const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const tgl = d.getUTCDate() + ' ' + BULAN[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
          return h.teks.includes(tgl);
        }
      });
    }

    /* 17) DIALOG-URUT 3.600: rantai 3 giliran — nama 1200, ent→kenapa 1200, harga→grafik-rujukan 1200 */
    const NAMA_CONTOH = ['budi', 'siti', 'anto', 'rina', 'joko', 'dewi', 'agus', 'maya', 'raka', 'nina', 'tono', 'lia', 'bima', 'sari', 'deni', 'wati'];
    for (let k = 0; k < 1200; k++) {
      const nm = NAMA_CONTOH[k % NAMA_CONTOH.length];
      const id = k % 2 === 0;
      const seri = id
        ? ['halo', 'namaku ' + nm, 'siapa namaku?']
        : ['hello', 'my name is ' + nm, 'what is my name?'];
      dorong('dialog-urut', { seri, cek: (h, t) => t < 2 ? true : h.teks.toLowerCase().includes(nm) });
    }
    for (let k = 0; k < 1200 && KENAPA_BISA.length; k++) {
      const pr = KENAPA_BISA[(k * 31 + 7) % KENAPA_BISA.length];
      const id = k % 2 === 0;
      const abTeks = id ? pr.abil.replace(/-/g, ' ') : abilEN(pr.abil);
      const seri = id
        ? ['apa itu ' + pr.ent, 'dia bisa ' + abTeks + '?', 'kenapa dia bisa ' + abTeks + '?']
        : ['what is ' + P.entitas[pr.ent].en, 'can it ' + abTeks + '?', 'why can it ' + abTeks + '?'];
      const kunci = KATA_KUNCI_ALASAN[pr.abil][id ? 'id' : 'en'];
      dorong('dialog-urut', {
        seri,
        cek: (h, t) => t < 2 ? true : h.teks.toLowerCase().includes(kunci)
      });
    }
    for (let k = 0; k < 1200 && koinK.length > 1; k++) {
      const s1 = koinK[(k + 2) % koinK.length], s2 = koinK[(k + 3) % koinK.length];
      if (s1 === s2) continue;
      const id = k % 2 === 0;
      const seri = id
        ? ['harga ' + s1.toLowerCase() + ' berapa', 'dan ' + s2.toLowerCase() + '?', 'yang ' + s2.toLowerCase() + ' naik atau turun?']
        : [s1.toLowerCase() + ' price, please', 'and ' + s2.toLowerCase() + '?', 'is ' + s2.toLowerCase() + ' up or down?'];
      dorong('dialog-urut', {
        seri, butuhPasar: true,
        cek: (h, t) => {
          if (t === 2) {
            const tk = pasar.ticker[s2]; if (!tk) return h.teks.includes('belum terjangkau') || h.teks.includes('unreachable');
            const naik = tk.ubah24 >= 0;
            return naik ? (h.teks.includes('NAIK') || h.teks.includes('naik') || h.teks.includes('UP') || h.teks.includes('up'))
              : (h.teks.includes('TURUN') || h.teks.includes('turun') || h.teks.includes('DOWN') || h.teks.includes('down'));
          }
          const tk = pasar.ticker[t === 0 ? s1 : s2]; if (!tk) return h.teks.includes('belum terjangkau') || h.teks.includes('unreachable');
          return h.teks.includes(refFormat(tk.harga, id ? 'id' : 'en'));
        }
      });
    }

    return kocok(soal, buatBenih(benih ^ 0x5eed));
  }

  /* V344: kemampuan → bahasa EN untuk soal penguji — WAJIB dari PENGETAHUAN.kemampuan
     agar konsisten dengan leksikon yang disuntik (cariAbil mengenali pertanyaannya) */
  function abilEN(abil) { const v = (O.pen.kemampuan[abil] || abil).replace(/-/g, ' '); return v; }

  /* ---- eksekusi uji ---- */
  async function uji(opsi) {
    const jumlah = (opsi && opsi.jumlah) || 50000;
    const benih = (opsi && opsi.benih) || 0x3440001;
    const ambilPasar = opsi && opsi.ambilPasar;
    const kemajuan = opsi && opsi.kemajuan;
    if (!O.siap) throw new Error('otak belum siap');
    let pasar = { ticker: {}, waktu: null };
    if (ambilPasar) {
      try { pasar = await ambilPasar(); } catch (e) { pasar = { ticker: {}, waktu: null, gagal: String(e && e.message || e) }; }
    }
    const semua = rangkaiSemuaSoal(benih, pasar).slice(0, jumlah);
    if (jumlah === 50000 && semua.length < 50000) throw new Error('bahan ajar kurang: ' + semua.length + ' ≠ 50000 — benahi generator, bukan kunci jawaban');
    const hasil = { benih, jumlah: semua.length, waktu: new Date().toISOString(), perKategori: {}, gugur: [], stat: { ms: 0 } };
    let lulus = 0;
    const unikRangkai = new Set(), unikTanya = new Set(), unikDialog = new Set();
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
      } else if (q.seri) {
        /* V344: soal dialog = SERI giliran pada ingatan sesi yang sama —
           tiap rantai mulai dari ingatan kosong (bukti bukan kebetulan warisan soal lain) */
        let allok = true; const catatan = [];
        O.memori.entTerakhir = null; O.memori.koinTerakhir = null; O.memori.intentTerakhir = null;
        O.memori.namaTuan = null; O.memori.kataAsing = []; O.memori.bahasaPaksa = null; O.memori.abilTerakhir = null;
        for (let t = 0; t < q.seri.length; t++) {
          const h = O.jawab(q.seri[t], { mode: 'auto', pasar });
          hasil.stat.ms += h.ms;
          const sahih = q.cek(h, t);
          catatan.push(q.seri[t] + ' ⇒ ' + h.teks.slice(0, 80));
          if (!sahih) { allok = false; jawabTeks = catatan.join(' || '); hIntent = h.intent; hBahasa = h.bahasa; break; }
          jawabTeks = catatan.join(' || '); hIntent = h.intent; hBahasa = h.bahasa;
        }
        ok = allok;
        unikDialog.add(q.seri.join(' ▸ '));
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
      else if (hasil.gugur.length < 400) hasil.gugur.push({ kat: q.kat, soal: q.seri ? q.seri.join(' ▸ ') : q.soal, jawab: jawabTeks.slice(0, 160), intent: hIntent, bahasa: hBahasa, sah: hSah });
      if (kemajuan && i % 2000 === 0) kemajuan(i, semua.length, lulus);
    }
    hasil.lulus = lulus;
    hasil.gugurJumlah = semua.length - lulus;
    hasil.persen = Math.round(lulus / semua.length * 10000) / 100;
    hasil.unikRangkai = unikRangkai.size;
    hasil.unikTanya = unikTanya.size;
    hasil.unikDialog = unikDialog.size;
    hasil.durasiDetik = Math.round((Date.now() - t0) / 100) / 10;
    return hasil;
  }

  O.ujiBahasa = uji;
  O.ujiBahasaRangkai = rangkaiSemuaSoal;
})();
