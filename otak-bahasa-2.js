/* ============================================================
   OTAK-BAHASA-2 V344 — LIDAH BAGIAN KEDUA
   (6) penggabung bigram (how many / di mana / do not / ...)
   (7) parser Earley atas CFG-W (GRAMATIKA-EN/ID) — struktur SAH/tidak
   (8) semantik: frame makna dari kata bertanda (intent-first) —
       frame = {intent, ent, abil, ...}; nol kalimat jawaban di sini.
   Hukum rumah: nol Math.random, nol localStorage.
   ============================================================ */
(function () {
  'use strict';
  /* V344-REV-B2R1 */
  const O = window.__OTAK_BAHASA;

  /* ---------- 6) bigram gabung ---------- */
  const BIGRAM = [
    ['how', 'many'], ['how', 'much'], ['do', 'not'], ['does', 'not'], ['did', 'not'],
    ['how', 'old'], ['what', 'about'], ['how', 'about'], ['yang', 'tadi'], ['itu', 'tadi'],
    ['di', 'mana'], ['hari', 'ini'], ['di', 'sini'], ['di', 'situ'], ['di', 'sana'],
    ['terima', 'kasih'], ['benar', 'benar'], ['apa', 'itu'],
    ['kata', 'benda'], ['kata', 'kerja'], ['kata', 'sifat'], ['kata', 'keterangan'], ['nama', 'diri'], ['kata', 'tanya'], ['kata', 'sambung'], ['kata', 'ganti'], ['kata', 'depan'], ['kata', 'penentu'], ['kata', 'kamus'], ['proper', 'noun']
  ];
  function gabungBigram(tok) {
    const out = [];
    for (let i = 0; i < tok.length; i++) {
      const pasangan = BIGRAM.find(b => tok[i] === b[0] && tok[i + 1] === b[1]);
      if (pasangan) { out.push(pasangan.join('-')); i++; } else out.push(tok[i]);
    }
    return out;
  }

  /* ---------- 7) parser Earley ---------- */
  const OPS = new Set(['+', '-', '*', '/', 'x', '×', '÷', '=', 'plus', 'minus', 'times', 'tambah', 'kurang', 'kali', 'bagi', 'ditambah', 'dikurang', 'dikurangi', 'dikalikan', 'dibagi']);
  function simbolToken(hip) {
    const s = new Set();
    for (const h of hip) {
      if (h.kelas !== 'x') s.add(h.kelas.toUpperCase());
      if (/^\d+$/.test(h.surf)) s.add('NUM');
      if (OPS.has(h.surf)) s.add('OP');
    }
    return s;
  }
  function parse(baris, gr) {
    const kata = baris.kata, n = kata.length;
    const aturanS = gr.aturan;
    const kunciSt = (st) => st.r.i + '|' + st.dot + '|' + st.asal;
    const chart = Array.from({ length: n + 1 }, () => []);
    const perChart = Array.from({ length: n + 1 }, () => new Set());
    const tamu = (st, i) => {
      const k = kunciSt(st);
      if (perChart[i].has(k)) return false;
      perChart[i].add(k); chart[i].push(st); return true;
    };
    aturanS.filter(r => r.l === 'S').forEach(r => tamu({ r, dot: 0, asal: 0, skor: 0, anak: [] }, 0));
    for (let i = 0; i <= n; i++) {
      for (let k = 0; k < chart[i].length; k++) {
        const st = chart[i][k];
        const sim = st.r.r[st.dot];
        if (sim === undefined) { // selesai → sambungkan ke pendengar yang menunggu
          for (const atasan of chart[st.asal]) {
            if (atasan.r.r[atasan.dot] === st.r.l) {
              const anak = atasan.anak.slice(); anak.push(st);
              tamu({ r: atasan.r, dot: atasan.dot + 1, asal: atasan.asal, skor: atasan.skor + st.r.w, anak }, i);
            }
          }
          continue;
        }
        const nonterminal = aturanS.some(a => a.l === sim);
        if (nonterminal) { // predictor
          for (const r2 of aturanS) if (r2.l === sim) tamu({ r: r2, dot: 0, asal: i, skor: 0, anak: [] }, i);
        } else if (i < n) { // scanner
          const bisa = simbolToken(kata[i].hip);
          if (bisa.has(sim)) {
            const anak = st.anak.slice(); anak.push(kata[i]);
            tamu({ r: st.r, dot: st.dot + 1, asal: st.asal, skor: st.skor, anak }, i + 1);
          }
        }
      }
    }
    // pilih S terbaik menutupi seluruh masukan
    let terbaik = null;
    for (const st of chart[n]) {
      if (st.r.l === 'S' && st.dot === st.r.r.length && st.asal === 0) {
        if (!terbaik || st.skor > terbaik.skor) terbaik = st;
      }
    }
    return terbaik ? { sah: true, skor: terbaik.skor, st: terbaik } : { sah: false, skor: 0, st: null };
  }
  function teksPohon(st, dalam) {
    if (!st) return '';
    const pad = '  '.repeat(dalam || 0);
    if (st.r) {
      let out = pad + st.r.l + ' [' + st.r.i + ']\n';
      for (const a of st.anak) out += a.r ? teksPohon(a, (dalam || 0) + 1) : pad + '  ' + a.surf + '\n';
      return out;
    }
    return '';
  }

  /* ---------- 8) semantik: frame makna ---------- */
  function cariEnt(baris) {
    const P = O.pen;
    for (const k of baris.kata) for (const h of k.hip) {
      if (h.kelas !== 'n' && h.kelas !== 'prop') continue;
      for (const [ek, ev] of Object.entries(P.entitas)) {
        if (h.lemma === ek || h.lemma === ev.en) return { kunci: ek, data: ev, lemma: h.lemma };
      }
    }
    return null;
  }
  function cariIstilah(baris) {
    const P = O.pen;
    const kata = baris.kata.map(k => k.surf);
    for (const [ik, iv] of Object.entries(P.kerja.istilah)) {
      const kId = ik, kEn = iv.en;
      for (const kadang of [kId, kEn, kId.replace(/-/g, ' '), kEn.replace(/-/g, ' ')]) {
        if (kata.includes(kadang)) return { kunci: ik, data: iv };
      }
      const potongan = kId.split('-');
      if (potongan.length > 1 && potongan.every(p => kata.includes(p))) return { kunci: ik, data: iv };
      const potonganEn = kEn.split(' ');
      if (potonganEn.length > 1 && potonganEn.every(p => kata.includes(p))) return { kunci: ik, data: iv };
    }
    return null;
  }
  function cariAbil(baris) {
    const P = O.pen, balik = {};
    for (const [k, v] of Object.entries(P.kemampuan)) { balik[k] = k; balik[v] = k; }
    // dua lapis: verba PERSIS dulu (surface = lemma), baru verba turunan (-er dsb)
    for (const persis of [true, false]) {
      for (const k of [...baris.kata].reverse()) for (const h of k.hip) {
        if (h.kelas !== 'v') continue;
        if (persis !== (h.surf === h.lemma)) continue;
        const varian = [h.lemma, ...(baris.bahasa === 'id' ? O.morf.id.kupas(h.lemma) : [])];
        for (const [label, kunci] of Object.entries(balik)) {
          if (varian.some(v => v === label || v === label.replace(/-/g, ''))) return kunci;
          const potongan = label.split('-');
          if (potongan.length > 1 && potongan[0] === h.lemma) return kunci;
        }
      }
    }
    return null;
  }
  function lemmaAda(baris, lemma, kelas) {
    for (const k of baris.kata) for (const h of k.hip) if (h.lemma === lemma && (!kelas || h.kelas === kelas)) return true;
    return false;
  }
  function adaLemma(baris, daftar) { return daftar.some(l => lemmaAda(baris, l)); }
  function angkaDari(baris) {
    const out = [];
    for (const k of baris.kata) {
      const calon = [];
      const m = k.surf.match(/^\d+$/); if (m) calon.push(+k.surf);
      for (const h of k.hip) if (h.kelas === 'num' && /^\d+$/.test(h.lemma)) { calon.push(+h.lemma); break; }
      // V343: kata-angka dari kode matematika (one/satu = 1, hundred/ratus = 100)
      if (O.nilaiKata && O.nilaiKata[k.surf] != null) calon.push(O.nilaiKata[k.surf]);
      else for (const h of k.hip) if (O.nilaiKata && O.nilaiKata[h.lemma] != null) { calon.push(O.nilaiKata[h.lemma]); break; }
      if (calon.length) out.push(calon[0]); // satu nilai per kata — deterministik
    }
    return out;
  }
  function kataAsing(baris) {
    // kata tak dikenal = tak ada hipotesis dan bukan angka/op
    return baris.kata.filter(k => !k.hip.length && !/^\d+$/.test(k.surf) && !OPS.has(k.surf) && k.surf.length > 1).map(k => k.surf);
  }

  /* ---------- 8b) V343: deteksi koin real-time + kata sasaran ---------- */
  function deteksiKoin(baris) {
    if (!O.koin || !O.koin.koin) return null;
    const KO = O.koin.koin;
    const kata = baris.kata.map(k => k.surf);
    let simbol = null;
    for (const t of kata) {
      const up = t.toUpperCase();
      if (KO[up]) { simbol = up; break; }
    }
    if (!simbol) {
      for (const [sym, k] of Object.entries(KO)) {
        if (kata.includes(k.nama.toLowerCase()) || kata.includes(k.nama.toLowerCase().replace(/\s+/g, '-'))) { simbol = sym; break; }
      }
    }
    /* V344: penggalan giliran — "dan yang tadi?" mewarisi koin & niat giliran lalu */
    if (!simbol && O.memori.koinTerakhir && typeof O.memori.intentTerakhir === 'string' && O.memori.intentTerakhir.indexOf('koin') === 0) {
      const angkaPointer = angkaDari({ kata: baris.kata.filter(k => !['one', 'that', 'tadi', 'yang', 'itu', 'lagi', 'again', 'the', 'a', 'an'].includes(k.surf)) }).length > 0;
      const adaUkur = kata.some(t => ['hari', 'day', 'days', 'minggu', 'week', 'bulan', 'month', 'setelah', 'after', 'sebelum', 'jam', 'hour', 'menit', 'minute'].includes(t));
      const adaSantai = kata.some(t => ['salah', 'wrong', 'keliru', 'benar', 'betul', 'iya', 'ya', 'yes', 'no', 'tidak', 'oke', 'ok', 'maaf', 'sorry', 'pintar', 'hebat', 'bagus'].includes(t)) || adaLemma(baris, ['salah', 'benar', 'maaf']);
      const tunjuk = !angkaPointer && !adaUkur && !adaSantai && kata.length <= 4 && (kata.some(t => ['yang', 'tadi', 'itu', 'lagi', 'again', 'itu-tadi', 'yang-tadi', 'the-one', 'one', 'that', 'earlier'].includes(t))
        || (kata.length <= 3 && kata.every(t => ['dan', 'and', 'yang', 'tadi', 'itu', 'lagi', 'kalau', 'what', 'about', 'bagaimana', 'how', 'the', 'of', 'dari', 'please', 'tolong'].includes(t))));
      if (tunjuk) simbol = O.memori.koinTerakhir;
    }
    if (!simbol) return null;
    const ada = (d) => adaLemma(baris, d);
    const id = baris.bahasa === 'id';
    let jenis = 'koin-harga';
    if (ada(['grafik', 'chart', 'candle', 'lilin', 'gambar-grafik'])) jenis = 'koin-grafik';
    else if (ada(['naik', 'turun', 'up', 'down', 'arah', 'ubah', 'change', 'gainers']) || /24\s?j/.test(kata.join(' '))) jenis = 'koin-arah';
    else if (ada(['harga', 'price', 'berapa', 'how-much', 'worth', 'nilai']) || /^\d/.test('')) jenis = 'koin-harga';
    if (O.memori.intentTerakhir === 'koin-grafik' && jenis === 'koin-harga' && !ada(['harga', 'price', 'berapa', 'how-much', 'worth', 'nilai'])) jenis = 'koin-grafik';
    // rentang waktu grafik: hari ini=1d, 7 hari/minggu=7d, 30 hari/bulan=30d
    let tf = '7d';
    const angka = angkaDari(baris);
    if (ada(['minggu']) || (angka.length && angka[0] <= 7 && ada(['hari', 'days']) && !ada(['hari-ini']))) tf = '7d';
    if (ada(['bulan', 'month']) || (angka.length && angka[0] > 7)) tf = '30d';
    if (ada(['hari-ini', 'today']) || (angka.length && angka[0] === 1)) tf = '1d';
    return { simbol, jenis, tf, pasar: KO[simbol].pasar, nama: KO[simbol].nama };
  }
  function kataTarget(baris) {
    // kata sasaran untuk soal kode/kelas/lawan: kata berisi-kutip terakhir, atau kata isi terakhir
    const meta = ['kode', 'code', 'kata', 'word', 'lawan', 'opposite', 'antonim', 'antonym', 'of', 'dari', 'the', 'is', 'are', 'apa', 'itu', 'adalah', 'number', 'angka', 'math', 'matematika', 'verb', 'noun', 'adjective', 'kata-kerja', 'kata-benda', 'kata-sifat', 'adverb', 'kata-keterangan', 'what', 'class', 'kelas', 'jenis', 'berapa', 'how-much', 'tolong', 'please', 'ini', 'itu', 'a', 'an', 'di', 'apakah', 'apaksim', 'kerja', 'benda', 'sifat', 'keterangan', 'naik', 'turun', 'the', 'wh-word', 'wh', 'nama', 'diri', 'proper', 'nama-diri', 'auxiliary', 'aux', 'bilangan', 'partikel', 'preposition', 'kata-depan', 'conjunction', 'pronoun', 'determiner', 'copula', 'negation', 'interjection', 'kata-tanya', 'kata-sambung', 'kata-ganti', 'kata-depan', 'kata-penentu', 'kata-kamus', 'proper-noun', 'number', 'particle', 'negasi', 'negation', 'ganti', 'tanya', 'sambung', 'depan', 'penentu', 'kamus', 'aspect', 'kopula', 'aspek'];
    const berisi = baris.kata.filter(k => !meta.includes(k.surf) && !/^\d+$/.test(k.surf));
    if (berisi.length) return berisi[berisi.length - 1].surf;
    // tingkat dua: hanya meta keras — kata nama-kelas (sifat, ganti, benda…) tetap sasaran sah
    const keras = ['what', 'is', 'the', 'of', 'apa', 'itu', 'kode', 'code', 'angka', 'number', 'kata', 'word', 'berapa', 'how', 'much', 'math', 'matematika', 'lawan', 'opposite', 'antonim', 'antonym', 'are', 'a', 'an', 'apakah', 'di', 'ke', 'dari', 'the'];
    const dua = baris.kata.filter(k => !keras.includes(k.surf) && !/^kata-/.test(k.surf) && !/^\d+$/.test(k.surf));
    if (dua.length) return dua[0].surf;
    // tingkat tiga: kata terakhir yang sungguh ada di tabel kode
    const mini = ['what', 'is', 'the', 'of', 'apa', 'itu', 'kode', 'code', 'angka', 'number', 'kata', 'word', 'berapa', 'how', 'much', 'math', 'matematika', 'lawan', 'opposite', 'antonim', 'antonym', 'are', 'a', 'an', 'apakah'];
    const tiga = baris.kata.filter(k => {
      if (mini.includes(k.surf) || /^\d+$/.test(k.surf)) return false;
      if (O.kode && O.kode.petaKata.has(k.surf)) return true;
      if (/^kata-/.test(k.surf) && O.kode && O.kode.petaKata.has(k.surf.slice(5))) return true;
      return false;
    });
    if (!tiga.length) return null;
    const pilihTiga = tiga[tiga.length - 1].surf;
    return /^kata-/.test(pilihTiga) ? pilihTiga.slice(5) : pilihTiga;
  }
  function adaSurf(baris, daftar) {
    return baris.kata.some(k => daftar.includes(k.surf));
  }
  function adaFrase(baris, frase) {
    const bag = frase.split(' ');
    const srf = baris.kata.map(k => k.surf);
    for (let i = 0; i + bag.length <= srf.length; i++) {
      if (bag.every((b, j) => srf[i + j] === b)) return true;
    }
    return false;
  }

  function semantik(baris, bahasa) {
    const P = O.pen, D = P.kerja.diri;
    const f = { intent: null, ent: null, abil: null, istilah: null, kata: null, arah: null, angka: [], mat: null, bahasa, negasi: false, sapa: null };
    const id = bahasa === 'id';
    const lemmas = baris.kata.flatMap(k => k.hip.map(h => h.lemma));
    f.angka = angkaDari(baris);
    f.negasi = adaLemma(baris, ['not', 'never', 'cannot', "can't", "don't", "doesn't", 'tidak', 'bukan', 'belum', 'jangan']) || adaSurf(baris, ['not', 'never', 'cannot', "can't", "don't", "doesn't"]); // V344: cannot tak berlemma — cek permukaan
    f.asing = kataAsing(baris);
    const kamu0 = adaLemma(baris, ['you', 'your', 'yourself', 'kamu', 'mu', 'dirimu', 'micaprofita']) || baris.kata.some(k => /mu$/.test(k.surf) && k.surf.length > 4 && !/^(ber|me[mnky]|ter|di|ke|se|pe[nmky])/.test(k.surf));
    const ent0Mentah = cariEnt(baris); // deteksi dini — entitas menang atas intent diri

    /* ---------- V344: giliran santai — pengesahan pendek (iya/yes/tidak/…) ----------
       pesan sangat pendek tanpa angka/entitas/istilah-ujian → sahayaan murni.
       kata puji + kamu diloloskan ke niat pujian; makasih diloloskan ke terima-kasih. */
    if (baris.kata.length <= 3 && !kamu0 && !f.angka.length && !ent0Mentah && !OPS.has(baris.kata[0].surf)
      && !baris.kata.some(k => /^kata-/.test(k.surf) || k.surf === 'nama-diri')
      && !adaSurf(baris, ['kode', 'lawan', 'harga', 'grafik', 'terjemah', 'translate', 'arti', 'artinya', 'plural', 'jamak', 'past', 'lampau', 'kalimat', 'sentence', 'terima-kasih'])
      && !adaLemma(baris, ['thanks', 'thank', 'terima-kasih', 'makasih', 'maaf', 'sorry'])) {
      const pos = adaSurf(baris, ['iya', 'ya', 'yes', 'yep', 'yups', 'betul', 'benar', 'bener', 'oke', 'ok', 'okay', 'sip', 'mantap', 'setuju', 'agree', 'right', 'true', 'correct', 'persis', 'tepat', 'baik', 'sure', 'nice', 'great', 'wow', 'cool', 'keren', 'hebat', 'bagus', 'good']);
      const neg = adaSurf(baris, ['tidak', 'no', 'nope', 'nggak', 'ngga', 'gak', 'ga', 'bukan', 'jangan', 'never']);
      if (pos && !neg) { f.intent = 'akui'; return f; }
      if (neg && !pos) { f.intent = 'bantah'; return f; }
    }

    /* V344: rujukan giliran — dia/ia/itu/it menunjuk entitas giliran lalu (ingatan sesi, RAM saja)
       pagar 1: soal hari/waktu/kabar/umur punya 'it/dia' palsu (dummy subject) — jangan dirujukan
       pagar 2: soal bahasa (arti/terjemah/jamak/kode/kelas/lawan) tak boleh dicemari ingatan */
    let ent0 = ent0Mentah;
    if (!ent0 && !kamu0) {
      const adaPalsu = adaLemma(baris, ['day', 'hari', 'today', 'tanggal', 'time', 'waktu', 'jam', 'kabar', 'umur', 'week', 'minggu']);
      const metaRujuk = adaLemma(baris, ['arti', 'artinya', 'terjemahkan', 'translate', 'mean', 'means', 'meaning', 'inggris', 'english', 'indonesian', 'indonesia', 'jamak', 'plural', 'bentuk', 'lampau', 'past', 'kelas', 'class', 'kode', 'code', 'lawan', 'opposite', 'antonim', 'antonym']) || adaSurf(baris, ['sentence', 'kalimat']);
      const pronRujuk = lemmaAda(baris, 'dia') || lemmaAda(baris, 'ia') || lemmaAda(baris, 'it') || lemmaAda(baris, 'they') || lemmaAda(baris, 'them') || lemmaAda(baris, 'she') || lemmaAda(baris, 'he') || lemmaAda(baris, 'that') || adaSurf(baris, ['itu', 'dia-tadi', 'yang-tadi', 'apa-itu', 'itu-apa', 'what-is-that', 'what-is-it', 'that-one']);
      const adaNal = cariAbil(baris) || baris.kata.some(k => k.hip.some(h => h.kelas === 'adj')) || adaLemma(baris, ['di-mana', 'dimana', 'mana', 'where']) || lemmaAda(baris, 'makan') || lemmaAda(baris, 'eat');
      if (!adaPalsu && !metaRujuk && O.memori.entTerakhir && P.entitas[O.memori.entTerakhir] && (pronRujuk || (baris.kata.length <= 4 && adaNal))) {
        ent0 = { kunci: O.memori.entTerakhir, data: P.entitas[O.memori.entTerakhir] };
      }
    }

    /* ---------- V343: niat baru — koin real-time, kode, kelas, lawan, hari-matematika ---------- */
    const dk = deteksiKoin(baris);
    if (dk) { f.intent = dk.jenis; f.koin = dk; return f; }

    const adaKode = adaSurf(baris, ['kode', 'code']) || adaLemma(baris, ['kode', 'code']) || (id && adaLemma(baris, ['angka']) && adaLemma(baris, ['kata']));
    if (adaKode) {
      const t = kataTarget(baris);
      if (t) { f.intent = 'kode-kata'; f.kata = t; return f; }
    }
    const KTQ = [['ganti nama', 'pron'], ['nama-diri', 'prop'], ['proper noun', 'prop'], ['proper-noun', 'prop'], ['wh-word', 'wh'], ['kata-kerja', 'v'], ['kata-benda', 'n'], ['kata-sifat', 'adj'], ['kata-keterangan', 'adv'], ['verb', 'v'], ['noun', 'n'], ['adjective', 'adj'], ['adverb', 'adv'], ['wh', 'wh'], ['auxiliary', 'aux'], ['aux', 'aux'], ['bilangan', 'num'], ['partikel', 'part'], ['preposition', 'prep'], ['kata-depan', 'prep'], ['conjunction', 'conj'], ['kata-sambung', 'conj'], ['pronoun', 'pron'], ['kata-ganti', 'pron'], ['determiner', 'det'], ['kata-penentu', 'det'], ['copula', 'cop'], ['negation', 'neg'], ['negasi', 'neg'], ['interjection', 'int'], ['dictionary word', 'x'], ['kata kamus', 'x'], ['kata tanya', 'wh'], ['kata-tanya', 'wh'], ['number', 'num'], ['particle', 'part'], ['aspect', 'aspek'], ['aspek', 'aspek'], ['kopula', 'cop'], ['copula2', 'cop']];
    const ktqHit = KTQ.find(([w]) => adaFrase(baris, w.replace(/-/g, ' ')) || baris.kata.some(k => k.surf === w));
    if (ktqHit) {
      const t = kataTarget(baris);
      if (t) { f.intent = 'kelas-kata'; f.kelasTanya = ktqHit[1]; f.kata = t; return f; }
    }
    // hari matematika: [angka] hari setelah/sebelum [nama hari] — dua bahasa
    const hariUrut = O.urutKata || {};
    const namaHari = baris.kata.find(k => hariUrut[k.surf] != null && hariUrut[k.surf] <= 6 && (O.kode && O.kode.petaKata.get(k.surf) && O.kode.petaKata.get(k.surf).kat === 'hari'));
    if (namaHari && f.angka.length >= 1 && (adaSurf(baris, ['setelah', 'sesudah', 'after']) || adaSurf(baris, ['sebelum', 'before']))) {
      f.intent = 'hari-matematika';
      f.matHari = { n: f.angka[0], arah: adaSurf(baris, ['setelah', 'sesudah', 'after']) ? 1 : -1, urut: hariUrut[namaHari.surf] };
      return f;
    }


    // --- sapaan / basa-basi
    if (adaLemma(baris, ['hello', 'hi', 'hey', 'halo', 'hai', 'selamat']) || (adaLemma(baris, ['good', 'baik']) && adaLemma(baris, ['morning', 'afternoon', 'evening', 'night', 'pagi', 'siang', 'sore', 'malam'])) || lemmaAda(baris, 'goodbye') || lemmaAda(baris, 'pamit')) {
      f.intent = 'sapaan';
      f.sapa = lemmaAda(baris, ['goodbye', 'pamit', 'bye']) ? 'pamit' : 'salam';
      f.makasih = adaLemma(baris, ['thanks', 'thank', 'terima-kasih', 'makasih']);
      return f;
    }
    if (adaLemma(baris, ['thanks', 'thank', 'terima-kasih', 'makasih'])) { f.intent = 'terima-kasih'; return f; }
    /* PAGAR metaUjian: bila tuan sedang minta arti/terjemah/kalimat/jamak/kode/kelas/lawan,
       kata-kunci santai (birth, kelahiran, maafkan, help, pintar…) TIDAK boleh membajak soal bahasa. */
    const berapa0 = adaLemma(baris, ['how-many', 'how-much', 'berapa']);
    const metaUjian = adaLemma(baris, ['arti', 'artinya', 'terjemahkan', 'translate', 'mean', 'means', 'meaning', 'inggris', 'english', 'indonesian', 'indonesia', 'jamak', 'plural', 'bentuk', 'lampau', 'past', 'kelas', 'class', 'kode', 'code', 'lawan', 'opposite', 'antonim', 'antonym']) || adaSurf(baris, ['sentence', 'kalimat', 'translate', 'terjemahkan', 'opposite', 'antonym']);
    if (!metaUjian && (lemmaAda(baris, 'maaf') || adaSurf(baris, ['sorry', 'apologize', 'maafkan', 'maaf-ya']))) { f.intent = 'maaf'; return f; }

    /* ---------- V344: kabar, rasa, umur/lahir — giliran santai dua arah ---------- */
    const kabarAda = !metaUjian && (adaFrase(baris, 'apa kabar') || adaFrase(baris, 'how are you') || adaFrase(baris, 'how do you do') || adaFrase(baris, 'how is it going') || adaFrase(baris, 'kabarmu gimana') || (lemmaAda(baris, 'kabar') && (kamu0 || adaLemma(baris, ['apa', 'bagaimana', 'gimana']))));
    if (kabarAda) { f.intent = 'apa-kabar'; return f; }
    const RASA = ['bosan', 'lelah', 'sedih', 'senang', 'marah', 'ngantuk', 'kesepian', 'bingung', 'bahagia', 'gundah', 'bored', 'tired', 'sad', 'happy', 'angry', 'sleepy', 'lonely', 'confused', 'excited', 'joyful'];
    const rasaAda = !metaUjian && RASA.find(r => lemmaAda(baris, r) || adaSurf(baris, [r, r + 'nya', r + ' banget']));
    if (rasaAda && (kamu0 || (!ent0 && baris.kata.length <= 2))) { f.intent = 'diri-rasa'; f.rasa = rasaAda; return f; }
    const adaLahir = !metaUjian && (lemmaAda(baris, 'lahir') || lemmaAda(baris, 'lahiran') || lemmaAda(baris, 'born') || lemmaAda(baris, 'birthday') || adaSurf(baris, ['birth', 'kelahiran', 'born-at', 'birthday', 'birthdate', 'tanggal-lahir', 'hari-lahir']));
    const adaUmur = !metaUjian && (lemmaAda(baris, 'umur') || lemmaAda(baris, 'umurku') || adaSurf(baris, ['umurmu', 'umur-mu', 'how-old']) || adaFrase(baris, 'how old'));
    if (adaLahir) { f.intent = 'diri-lahir'; return f; }
    if (adaUmur && (kamu0 || berapa0 || baris.kata.length <= 3)) { f.intent = 'diri-umur'; return f; }


    const konteksTerjemah = adaLemma(baris, ['inggris', 'english', 'indonesia', 'indonesian']);
    if (!konteksTerjemah && (adaLemma(baris, ['lawan', 'antonim', 'antonym']) || adaSurf(baris, ['opposite', 'antonym', 'antonim', 'lawan-kata']))) {
      const t = kataTarget(baris);
      if (t) { f.intent = 'lawan-kata'; f.kata = t; return f; }
    }
    // --- perintah bahasa (hanya imperatif; kalimat tanya masuk diri-bahasa)
    const adaTanyaKata = adaLemma(baris, ['what', 'who', 'where', 'when', 'why', 'how', 'how-many', 'how-much', 'apa', 'siapa', 'bagaimana', 'berapa', 'kapan', 'mengapa', 'di-mana', 'apakah', 'bisakah']) || adaLemma(baris, ['can', 'could', 'do', 'does', 'did', 'are', 'is', 'bisakah', 'apakah']);
    if ((lemmaAda(baris, 'speak') || lemmaAda(baris, 'bicara') || lemmaAda(baris, 'pakai')) && (!adaTanyaKata || (adaLemma(baris, ['can', 'could', 'do', 'does']) && kamu0))) {
      const en = adaLemma(baris, ['english', 'inggris']), ind = adaLemma(baris, ['indonesian', 'indonesia']);
      if (en || ind) { f.intent = 'atur-bahasa'; f.arah = en ? 'en' : 'id'; return f; }
    }
    if (adaLemma(baris, ['ask', 'tanya']) && (adaLemma(baris, ['me', 'saya', 'aku']) || adaLemma(baris, ['something', 'sesuatu']))) { f.intent = 'tanyaku'; return f; }
    if (adaLemma(baris, ['check', 'verify', 'periksa', 'verifikasi']) && adaLemma(baris, ['yourself', 'dirimu', 'diri', 'bicara', 'jawab', 'answer'])) { f.intent = 'periksa-diri'; return f; }

    // --- nama (memori percakapan): ingat / simpan / diri
    const adaNama = adaLemma(baris, ['name', 'nama']);
    if (adaNama) {
      const iNama = baris.kata.findIndex(k => k.hip.some(h => h.lemma === 'name' || h.lemma === 'nama'));
      const adaTanya = adaLemma(baris, ['what', 'siapa', 'apa']);
      const pronMine = baris.kata.some((k, i) => k.hip.some(h => ['my', 'saya', 'aku', 'ku'].includes(h.lemma))) || baris.kata.some(k => /^nama(ku)?$/.test(k.surf) || /^namaku$/.test(k.surf));
      const pronYours = baris.kata.some((k, i) => k.hip.some(h => ['you', 'kamu', 'mu', 'your', 'nya'].includes(h.lemma)) || /namamu|namanya/.test(k.surf));
      if (adaTanya && pronMine) { f.intent = 'ingat-nama'; return f; }
      if (adaTanya && pronYours) { f.intent = 'diri-nama'; return f; }
      if (pronMine) {
        const kandidat = baris.kata.slice(iNama + 1).find(k => {
          if (/^(is|adalah|ialah)$/.test(k.surf)) return false;
          if (!k.hip.length) return /^[a-z-]{2,}$/.test(k.surf);
          return k.hip.some(h => ['n', 'prop', 'x', 'adj'].includes(h.kelas));
        });
        if (kandidat) { f.intent = 'simpan-nama'; f.kata = kandidat.surf; return f; }
      }
      if (pronYours) { f.intent = 'diri-nama'; return f; }
      f.intent = 'ingat-nama'; return f;
    }

    // --- matematika murni: rangkaian angka + operator (V344: berantai kiri-ke-kanan)
    const opTok = baris.kata.filter(k => OPS.has(k.surf));
    if (f.angka.length >= 2 && opTok.length >= 1) {
      const peta = { '+': '+', plus: '+', tambah: '+', ditambah: '+', '-': '-', minus: '-', kurang: '-', dikurang: '-', dikurangi: '-', '*': '*', x: '*', '×': '*', times: '*', kali: '*', dikalikan: '*', '/': '/', '÷': '/', bagi: '/', '=': '=' };
      if (f.angka.length > 2 && opTok.length >= 2) {
        const rantai = [];
        for (let i = 0; i + 1 < f.angka.length; i++) rantai.push({ op: peta[(opTok[i] || opTok[opTok.length - 1]).surf] || '+' });
        f.intent = 'matematika'; f.mat = { a: f.angka[0], b: f.angka[1], op: rantai[0].op, angka: f.angka.slice(), rantai };
        return f;
      }
      f.intent = 'matematika'; f.mat = { a: f.angka[0], b: f.angka[1], op: peta[opTok[0].surf] || '+' };
      return f;
    }
    // soal cerita tambah/kurang
    const kataTambah = ['more', 'buy', 'get', 'lagi', 'membeli', 'mendapat', 'tambah'];
    const kataKurang = ['eat', 'lose', 'give', 'sell', 'makan', 'kehilangan', 'beri', 'terjual'];
    if (f.angka.length >= 2 && (kataTambah.some(w => lemmas.includes(w)) || kataKurang.some(w => lemmas.includes(w)))) {
      const kurang = kataKurang.some(w => lemmas.includes(w));
      f.intent = 'matematika'; f.mat = { a: f.angka[0], b: f.angka[1], op: kurang ? '-' : '+' , cerita: true };
      return f;
    }

    // --- identitas diri
    const kamu = adaLemma(baris, ['you', 'your', 'yourself', 'kamu', 'mu', 'dirimu', 'micaprofita']) || baris.kata.some(k => /mu$/.test(k.surf) && k.surf.length > 4 && !/^(ber|me[mnky]|ter|di|ke|se|pe[nmky])/.test(k.surf));
    const adaTanyaKata2 = adaLemma(baris, ['what', 'who', 'where', 'when', 'why', 'how', 'how-many', 'how-much', 'apa', 'siapa', 'bagaimana', 'berapa', 'kapan', 'mengapa', 'di-mana', 'apakah', 'bisakah']);
    const diMana = adaLemma(baris, ['where', 'di-mana', 'dimana', 'mana']);
    const kenapa = adaLemma(baris, ['why', 'mengapa', 'kenapa']);
    const bagaimana = adaLemma(baris, ['how', 'bagaimana', 'gimana']);
    const berapa = adaLemma(baris, ['how-many', 'how-much', 'berapa']);
    const siapa = adaLemma(baris, ['who', 'siapa']), apa = adaLemma(baris, ['what', 'apa', 'apa-itu']);
    if (ent0 && diMana) { f.intent = 'ent-rumah'; f.ent = ent0.kunci; return f; }
    if (siapa && adaLemma(baris, ['master', 'tuan', 'owner', 'pemilik', 'guru']) && !ent0) { f.intent = 'diri-tuan'; return f; }
    if (siapa && kamu && !adaNama) { f.intent = 'diri-jenis'; return f; }
    /* V344: siapa aku — makhluk mengingat nama tuannya */
    if (siapa && !kamu && adaLemma(baris, ['aku', 'saya', 'me', 'i'])) { f.intent = 'ingat-nama'; return f; }
    if (kenapa && adaLemma(baris, ['trader', 'pedagang', 'dagang', 'trading', 'berdagang']) && (lemmaAda(baris, 'rugi') || adaSurf(baris, ['rugi', 'loss', 'lose', 'losing'])) && !cariAbil(baris)) { f.intent = 'kenapa-rugi'; f.ent = 'rugi'; return f; }
    if (apa && kamu && adaLemma(baris, ['job', 'work', 'pekerjaan', 'kerja']) && !ent0) { f.intent = 'diri-pekerjaan'; return f; }
    if (apa && adaLemma(baris, ['languages', 'language', 'bahasa']) && (kamu || adaLemma(baris, ['speak', 'bicara', 'menguasai'])) && !ent0) { f.intent = 'diri-bahasa'; return f; }
    if (apa && adaLemma(baris, ['heart', 'jantung']) ) { f.intent = 'diri-jantung'; return f; }
    if (apa && adaLemma(baris, ['motto', 'motto', 'diaman'])) { f.intent = 'diri-motto'; return f; }
    if (adaLemma(baris, ['pakem']) && (apa || bagaimana || adaLemma(baris, ['buy', 'beli']))) { f.intent = 'diri-pakem'; return f; }
    if (apa && adaLemma(baris, ['uji-50', 'tournament', 'turnamen', 'uji50']) || (berapa && adaLemma(baris, ['koin', 'coin', 'turnamen', 'tournament', 'uji-50']))) {
      f.intent = 'diri-uji50'; return f;
    }
    if (diMana && (kamu || adaLemma(baris, ['live', 'rumah', 'hidup', 'tinggal'])) && !ent0) { f.intent = 'diri-rumah'; return f; }
    /* ---------- V344: santai — kenalkan, puji, koreksi, diri-bisa, bantuan ---------- */
    if (!metaUjian && kamu && (adaLemma(baris, ['introduce']) || adaSurf(baris, ['perkenalkan', 'kenalkan', 'kenalkan-diri', 'perkenalkan-diri']))) { f.intent = 'diri-kenalkan'; return f; }
    const PUJI = ['pintar', 'hebat', 'keren', 'bagus', 'mantap', 'smart', 'clever', 'amazing', 'awesome', 'brilliant', 'great', 'gigih', 'cool'];
    if (!metaUjian && kamu && PUJI.some(p => lemmaAda(baris, p) || adaSurf(baris, [p]))) { f.intent = 'pujian'; return f; }
    /* V344: pujian tanpa 'kamu' — "pintar sekali", "keren banget" —
       tapi TANPA kata ganti (dia/itu/it) dan tanpa entitas, kalau bukan itu soal entitas */
    if (!metaUjian && !kamu && !ent0Mentah && !lemmaAda(baris, 'dia') && !lemmaAda(baris, 'ia') && !lemmaAda(baris, 'it') && !lemmaAda(baris, 'that') && !adaSurf(baris, ['itu']) && baris.kata.length <= 3 && PUJI.some(p => lemmaAda(baris, p) || adaSurf(baris, [p]))) { f.intent = 'pujian'; return f; }
    if ((kamu || adaSurf(baris, ['itu', 'ini', 'that'])) && (lemmaAda(baris, 'salah') || adaSurf(baris, ['wrong', 'keliru']) || (f.negasi && lemmaAda(baris, 'benar')))) { f.intent = 'koreksi'; return f; }
    if (kamu && adaLemma(baris, ['bisa', 'kemampuan', 'lakukan', 'can', 'capable']) && !ent0) { f.intent = 'diri-bisa'; f.abil = cariAbil(baris); return f; }
    /* V344: minta bantuan — daftar kemampuan nyata, tanpa mengambil alih soal terjemah/kode */
    if (!metaUjian && !f.intent && !ent0 && baris.kata.length <= 5 && !adaLemma(baris, ['terjemahkan', 'translate', 'arti', 'artinya', 'kode', 'code', 'lawan', 'kalimat', 'sentence', 'plural', 'jamak', 'past', 'lampau', 'kelas', 'class'])
      && (adaSurf(baris, ['tolong', 'bantu', 'bantuaku', 'bantu-saya', 'help', 'help-me', 'bantuan', 'membantu', 'helps', 'helping']) || (lemmaAda(baris, 'tolong') && baris.kata.length <= 3))) { f.intent = 'bantuan'; return f; }
    if (kamu && (apa || siapa) && !f.intent) { f.intent = 'diri-jenis'; return f; }

    // --- terjemahan dua arah
    const adaMetaBahasa = adaLemma(baris, ['language', 'bahasa', 'say', 'bilang', 'ucap']);
    if ((id && adaLemma(baris, ['inggris', 'indonesia', 'english'])) || (!id && adaLemma(baris, ['indonesian', 'english']))) {
      const meta = ['language', 'bahasa', 'inggris', 'english', 'indonesian', 'indonesia', 'say', 'bilang', 'how', 'what', 'apa', 'do', 'you', 'the', 'in', 'word', 'kata', 'from', 'dari', 'is', 'adalah', 'bagaimana', 'how-much', 'how-many', 'arti', 'artinya', 'terjemahkan', 'translate', 'means', 'mean', 'meaning', 'tolong', 'please', 'ke', 'dalam', 'into', 'for'];
      const iBP = baris.kata.findIndex(k => k.hip.some(h => ['inggris', 'english', 'indonesia', 'indonesian'].includes(h.lemma)));
      const layak = (k) => (k.hip.some(h => ['x', 'n'].includes(h.kelas)) || O.tag(k.surf, bahasa === 'en' ? 'id' : 'en').length) && !meta.includes(k.hip[0] ? k.hip[0].lemma : k.surf);
      const layakSasaran = (k) => (k.hip.length || O.tag(k.surf, bahasa === 'en' ? 'id' : 'en').length) && !['inggris', 'english', 'indonesian', 'indonesia', 'say', 'bilang', 'how', 'what', 'apa', 'do', 'you', 'the', 'in', 'from', 'dari', 'is', 'adalah', 'bagaimana', 'how-much', 'how-many', 'word', 'kata', 'bahasa', 'language', 'arti', 'artinya', 'terjemahkan', 'translate', 'tolong', 'please', 'means', 'mean', 'meaning', 'dalam', 'ke', 'into', 'for', 'di', 'to'].includes(k.hip[0] ? k.hip[0].lemma : k.surf);
      let kandidat = baris.kata.filter(layak);
      if (iBP > -1) {
        const sesudah = baris.kata.slice(iBP + 1).filter(layakSasaran);
        kandidat = sesudah.length ? sesudah : baris.kata.slice(0, iBP).filter(layakSasaran);
      }
      const kataTujuan = kandidat.length ? kandidat[kandidat.length - 1] : null;
      if (kataTujuan) { f.intent = 'terjemah'; f.kata = kataTujuan.surf; f.arah = adaLemma(baris, ['inggris', 'english']) ? 'en' : 'id'; return f; }
      if (adaMetaBahasa) { f.intent = 'terjemah-cara'; return f; }
    }

    // --- morfologi hidup
    if (adaLemma(baris, ['plural', 'jamak', 'banyak']) && (apa || adaLemma(baris, ['of', 'dari']))) {
      const meta = ['plural', 'past', 'bentuk', 'jamak', 'lampau'];
      const kt2 = baris.kata.filter(k => k.hip.some(h => h.kelas === 'n') && !meta.includes(k.hip[0].lemma));
      const target = kt2.length ? kt2[kt2.length - 1].surf : (f.asing || [])[0];
      f.intent = 'morf-jamak'; f.kata = target; return f;
    }
    if (adaLemma(baris, ['past', 'lampau']) && (apa || adaLemma(baris, ['of', 'dari']))) {
      const meta = ['plural', 'past', 'bentuk', 'jamak', 'lampau'];
      const kt2 = baris.kata.filter(k => k.hip.some(h => h.kelas === 'v' || h.kelas === 'aux' || h.kelas === 'cop') && !meta.includes(k.hip[0].lemma));
      f.intent = 'morf-lampau'; f.kata = kt2.length ? kt2[kt2.length - 1].surf : (f.asing || [])[0]; return f;
    }

    // --- buat kalimat (generasi hidup)
    if (adaLemma(baris, ['make', 'buat', 'rangkai']) && (adaLemma(baris, ['sentence', 'kalimat']) || adaSurf(baris, ['sentence', 'kalimat']))) {
      const meta = ['make', 'buat', 'rangkai', 'sentence', 'kalimat', 'with', 'dengan', 'a', 'the'];
      const kt = baris.kata.filter(k => k.hip.some(h => ['v', 'n', 'adj'].includes(h.kelas)) && !meta.includes(k.hip[0].lemma));
      let sasaran = kt.length ? kt[kt.length - 1].surf : null;
      if (!sasaran) { // kata lintas-bahasa: cari lewat dua leksikon
        const kand = baris.kata.filter(k => !meta.includes(k.surf) && (O.tag(k.surf, 'en')[0] || O.tag(k.surf, 'id')[0]));
        sasaran = kand.length ? kand[kand.length - 1].surf : null;
      }
      f.intent = 'buat-kalimat'; f.kata = sasaran; return f;
    }

    // --- istilah pekerjaan
    const ist = cariIstilah(baris);
    const adaExplain = adaLemma(baris, ['explain', 'jelaskan']) || adaSurf(baris, ['explain', 'jelaskan']);
    if (ist && (apa || adaExplain || bagaimana)) {
      f.intent = 'istilah'; f.istilah = ist;
      f.istilahLang = adaSurf(baris, ['explain', 'what', 'how', 'is', 'the']) && !adaSurf(baris, ['apa', 'jelaskan', 'itu']) ? 'en' : 'id';
      return f;
    }

    const ITEM_MAKAN = new Set(Object.values(P.entitas).flatMap(e => e.makan || []));
    const MAKAN_EN2ID = { worms: 'cacing', worm: 'cacing', moss: 'lumut', fish: 'ikan', meat: 'daging', seeds: 'biji', seed: 'biji', grass: 'rumput', fruit: 'buah', bananas: 'pisang', banana: 'pisang', insects: 'serangga', insect: 'serangga', nectar: 'nektar', honey: 'madu', carrots: 'wortel', carrot: 'wortel', rice: 'nasi', hay: 'jerami', leaves: 'daun', leaf: 'daun', mice: 'tikus', mouse: 'tikus', eggs: 'telur', egg: 'telur' };
    if (!ent0 && (adaLemma(baris, ['eat', 'makan']))) {
      const kataMakanan = baris.kata.find(k => {
        const lem = k.hip.length ? k.hip[0].lemma : k.surf;
        if (ITEM_MAKAN.has(lem)) return true;
        const en = MAKAN_EN2ID[lem] || (lem.endsWith('s') && MAKAN_EN2ID[lem.slice(0, -1)]);
        return en && ITEM_MAKAN.has(en);
      });
      if (kataMakanan) {
        const lem = kataMakanan.hip.length ? kataMakanan.hip[0].lemma : kataMakanan.surf;
        f.ent = ITEM_MAKAN.has(lem) ? lem : (MAKAN_EN2ID[lem] || MAKAN_EN2ID[lem.slice(0, -1)]);
        f.intent = 'siapa-makan'; return f;
      }
    }
    let ent = ent0 || cariEnt(baris);
    if (ent) {
      f.ent = ent.kunci;
      /* V344: kata ganti subjek menang — "can it give milk?" menanyakan IT (rujuk),
         bukan susu (benda di ekor kalimat) */
      const iPron = baris.kata.findIndex(k => k.hip.some(h => ['it', 'dia', 'ia', 'that', 'they'].includes(h.lemma)) || ['itu', 'yang-tadi'].includes(k.surf));
      if (iPron > -1 && O.memori.entTerakhir && P.entitas[O.memori.entTerakhir] && O.memori.entTerakhir !== ent.kunci) {
        const iEnt = baris.kata.findIndex(k => k.hip.some(h => h.lemma === ent.kunci || h.lemma === ent.data.en));
        if (iEnt < 0 || iPron < iEnt) { ent = { kunci: O.memori.entTerakhir, data: P.entitas[O.memori.entTerakhir] }; f.ent = ent.kunci; }
      }
      /* V344: kenapa + entitas + kemampuan → tanya alasan (bisa/tidak) */
      if (kenapa) {
        const abilK = cariAbil(baris);
        if (!abilK || (abilK !== 'makan-daging' && abilK !== 'makan-tumbuhan')) { f.intent = (f.negasi && abilK) ? 'kenapa-tak' : 'kenapa-abil'; f.abil = abilK || null; return f; }
      }
      const adaAux = baris.kata.some(k => k.hip.some(h => ['aux', 'cop'].includes(h.kelas)));
      const tanyaYa = adaAux || adaLemma(baris, ['apakah', 'bisakah', 'sudahkah', 'bolehkah']);
      const iWh = baris.kata.findIndex(k => k.hip.some(h => ['what', 'who', 'apa', 'siapa'].includes(h.lemma)));
      const iV = baris.kata.findIndex(k => k.hip.some(h => ['eat', 'makan'].includes(h.lemma)));
      const iEnt = baris.kata.findIndex(k => k.hip.some(h => h.lemma === ent.data.en || h.lemma === ent.kunci));
      if (iWh > -1 && iV > -1 && iEnt > iV) { f.intent = 'siapa-makan'; return f; }
      if (iV > -1 && iEnt < iV && (iWh > -1 || adaAux) && (adaLemma(baris, ['what', 'apa']))) { f.intent = 'ent-makan'; return f; }
      let abil = cariAbil(baris);
      if (adaLemma(baris, ['eat', 'makan']) && adaLemma(baris, ['plants', 'plant', 'tumbuhan', 'sayur'])) abil = 'makan-tumbuhan';
      else if (adaLemma(baris, ['eat', 'makan']) && adaLemma(baris, ['meat', 'daging'])) abil = 'makan-daging';
      if (diMana) { f.intent = 'ent-rumah'; return f; }
      if ((adaLemma(baris, ['eat']) && iEnt < baris.kata.findIndex(k => k.hip.some(h => ['eat'].includes(h.lemma))) && !abil) || (adaLemma(baris, ['makanan']) && apa)) { f.intent = 'ent-makan'; return f; }
      // sifat majemuk via adj + tanya — hanya bila TIDAK ada kemampuan (abil menang untuk "apakah emas bisa tidur")
      const adjTok0 = baris.kata.find(k => k.hip.some(h => h.kelas === 'adj'));
      if (adjTok0 && !abil && (tanyaYa || adaLemma(baris, ['is', 'are', 'adalah']))) {
        f.intent = 'ent-sifat'; f.abil = adjTok0.hip.find(h => h.kelas === 'adj').lemma; return f;
      }
      if (abil === 'makan-daging' && adaLemma(baris, ['plants', 'plant', 'tumbuhan', 'sayur'])) abil = 'makan-tumbuhan';
      if (abil === 'makan-tumbuhan' && adaLemma(baris, ['meat', 'daging'])) abil = 'makan-daging';
      if (abil && abil !== 'makan-daging' && abil !== 'makan-tumbuhan' && !(ent.data.sifat || []).includes(abil)) { f.intent = 'ent-bisa'; f.abil = abil; return f; }
      if (abil && (abil === 'makan-daging' || abil === 'makan-tumbuhan') && (tanyaYa) && (f.negasi || iWh < 0)) { // does a cat eat meat? → cek makan
        f.intent = 'ent-makan-cek'; f.abil = abil; return f;
      }
      if (abil && !(ent.data.sifat || []).includes(abil)) { f.intent = 'ent-bisa'; f.abil = abil; return f; }
      if (apa && adaLemma(baris, ['apa-itu', 'what', 'apa'])) { f.intent = 'ent-definisi'; return f; }
      if (adaLemma(baris, ['who', 'siapa'])) { f.intent = 'ent-definisi'; return f; }
      // sifat: "is fire hot?" — V344: pindai frasa sifat DULU (menang atas adj tunggal:
      // "bersayap indah" jangan terpotong jadi 'indah' saja), lalu adj tunggal
      {
        const petaSifat = O.petaSifatEN2ID || {};
        const srf = baris.kata.map(k => k.surf);
        const sifatEnt = ent.data.sifat || [];
        let calon = null;
        for (let jendela = 4; jendela >= 1 && !calon; jendela--) {
          for (let m = 0; m + jendela <= srf.length; m++) {
            const frasa = srf.slice(m, m + jendela).join(' '), frasaK = srf.slice(m, m + jendela).join('-');
            if (sifatEnt.includes(frasa) || sifatEnt.includes(frasaK)) { calon = sifatEnt.includes(frasa) ? frasa : frasaK; break; }
            const idS = petaSifat[frasa] || petaSifat[frasaK];
            if (idS && sifatEnt.includes(idS)) { calon = idS; break; }
          }
        }
        if (calon) { f.intent = 'ent-sifat'; f.abil = calon; return f; }
      }
      const adjTok = baris.kata.find(k => k.hip.some(h => h.kelas === 'adj'));
      if (adjTok && (tanyaYa || lemmaAda(baris, 'is') || lemmaAda(baris, 'are') || bahasa === 'id')) {
        const sifatLemma = adjTok.hip.find(h => h.kelas === 'adj').lemma;
        f.intent = 'ent-sifat'; f.abil = sifatLemma; return f;
      }
      f.intent = 'ent-definisi';
      return f;
    }

    // --- memori: "what is my name" lewat jalur umum
    if (adaNama) { f.intent = 'ingat-nama'; return f; }

    // --- hari / waktu realtime
    if (adaLemma(baris, ['day', 'hari', 'today', 'tanggal', 'time', 'waktu', 'jam']) && (apa || berapa || adaLemma(baris, ['now', 'sekarang']))) {
      f.intent = 'waktu-kini'; return f;
    }

    f.intent = 'tak-paham';
    return f;
  }

  O.gabungBigram = gabungBigram; O.parse = parse; O.teksPohon = teksPohon;
  O.semantik = semantik; O.cariEnt = cariEnt; O.cariIstilah = cariIstilah; O.cariAbil = cariAbil;
  O.angkaDari = angkaDari; O.simbolToken = simbolToken; O.OPS = OPS;
  O.deteksiKoin = deteksiKoin; O.kataTarget = kataTarget; O.adaFrase = adaFrase; O.adaSurf = adaSurf;
  O.deteksiKoinTeks = (teks) => {
    const tok = O.gabungBigram(O.tokenisasi(teks || ''));
    const baris = O.tandaiBaris(tok, 'id');
    baris.bahasa = 'id';
    return deteksiKoin(baris);
  };
})();
