/* ============================================================
   OTAK-BAHASA-2 V342 — LIDAH BAGIAN KEDUA
   (6) penggabung bigram (how many / di mana / do not / ...)
   (7) parser Earley atas CFG-W (GRAMATIKA-EN/ID) — struktur SAH/tidak
   (8) semantik: frame makna dari kata bertanda (intent-first) —
       frame = {intent, ent, abil, ...}; nol kalimat jawaban di sini.
   Hukum rumah: nol Math.random, nol localStorage.
   ============================================================ */
(function () {
  'use strict';
  const O = window.__OTAK_BAHASA;

  /* ---------- 6) bigram gabung ---------- */
  const BIGRAM = [
    ['how', 'many'], ['how', 'much'], ['do', 'not'], ['does', 'not'], ['did', 'not'],
    ['di', 'mana'], ['hari', 'ini'], ['di', 'sini'], ['di', 'situ'], ['di', 'sana'],
    ['terima', 'kasih'], ['benar', 'benar'], ['apa', 'itu']
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
    for (const k of baris.kata) for (const h of k.hip) {
      if (h.kelas !== 'v') continue;
      for (const [label, kunci] of Object.entries(balik)) {
        if (h.lemma === label || h.lemma === label.replace(/-/g, '')) return kunci;
        const potongan = label.split('-');
        if (potongan.length > 1 && potongan[0] === h.lemma) return kunci;
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
      const m = k.surf.match(/^\d+$/); if (m) { out.push(+k.surf); continue; }
      for (const h of k.hip) if (h.kelas === 'num' && /^\d+$/.test(h.lemma)) { out.push(+h.lemma); break; }
    }
    return out;
  }
  function kataAsing(baris) {
    // kata tak dikenal = tak ada hipotesis dan bukan angka/op
    return baris.kata.filter(k => !k.hip.length && !/^\d+$/.test(k.surf) && !OPS.has(k.surf) && k.surf.length > 1).map(k => k.surf);
  }

  function semantik(baris, bahasa) {
    const P = O.pen, D = P.kerja.diri;
    const f = { intent: null, ent: null, abil: null, istilah: null, kata: null, arah: null, angka: [], mat: null, bahasa, negasi: false, sapa: null };
    const id = bahasa === 'id';
    const lemmas = baris.kata.flatMap(k => k.hip.map(h => h.lemma));
    f.angka = angkaDari(baris);
    f.negasi = adaLemma(baris, ['not', 'never', 'cannot', "can't", "don't", "doesn't", 'tidak', 'bukan', 'belum', 'jangan']);
    f.asing = kataAsing(baris);
    const ent0 = cariEnt(baris); // deteksi dini — entitas menang atas intent diri

    // --- sapaan / basa-basi
    if (adaLemma(baris, ['hello', 'hi', 'hey', 'halo', 'hai', 'selamat']) || (adaLemma(baris, ['good', 'baik']) && adaLemma(baris, ['morning', 'afternoon', 'evening', 'night', 'pagi', 'siang', 'sore', 'malam'])) || lemmaAda(baris, 'goodbye') || lemmaAda(baris, 'pamit')) {
      f.intent = 'sapaan';
      f.sapa = lemmaAda(baris, ['goodbye', 'pamit', 'bye']) ? 'pamit' : 'salam';
      f.makasih = adaLemma(baris, ['thanks', 'thank', 'terima-kasih', 'makasih']);
      return f;
    }
    if (adaLemma(baris, ['thanks', 'thank', 'terima-kasih', 'makasih'])) { f.intent = 'terima-kasih'; return f; }

    // --- perintah bahasa (hanya imperatif; kalimat tanya masuk diri-bahasa)
    const adaTanyaKata = adaLemma(baris, ['what', 'who', 'where', 'when', 'why', 'how', 'how-many', 'how-much', 'apa', 'siapa', 'bagaimana', 'berapa', 'kapan', 'mengapa', 'di-mana', 'apakah', 'bisakah']) || adaLemma(baris, ['can', 'could', 'do', 'does', 'did', 'are', 'is', 'bisakah', 'apakah']);
    if ((lemmaAda(baris, 'speak') || lemmaAda(baris, 'bicara') || lemmaAda(baris, 'pakai')) && !adaTanyaKata) {
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
      const pronMine = baris.kata.some((k, i) => k.hip.some(h => ['my', 'saya', 'aku', 'ku'].includes(h.lemma)));
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

    // --- matematika murni: rangkaian angka + operator
    const opTok = baris.kata.filter(k => OPS.has(k.surf));
    if (f.angka.length >= 2 && opTok.length >= 1) {
      const peta = { '+': '+', plus: '+', tambah: '+', ditambah: '+', '-': '-', minus: '-', kurang: '-', dikurang: '-', dikurangi: '-', '*': '*', x: '*', '×': '*', times: '*', kali: '*', dikalikan: '*', '/': '/', '÷': '/', bagi: '/', '=': '=' };
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
    const kamu = adaLemma(baris, ['you', 'your', 'yourself', 'kamu', 'mu', 'dirimu', 'micaprofita']) || baris.kata.some(k => /mu$/.test(k.surf) && k.surf.length > 4);
    const adaTanyaKata2 = adaLemma(baris, ['what', 'who', 'where', 'when', 'why', 'how', 'how-many', 'how-much', 'apa', 'siapa', 'bagaimana', 'berapa', 'kapan', 'mengapa', 'di-mana', 'apakah', 'bisakah']);
    const diMana = adaLemma(baris, ['where', 'di-mana', 'dimana', 'mana']);
    const kenapa = adaLemma(baris, ['why', 'mengapa', 'kenapa']);
    const bagaimana = adaLemma(baris, ['how', 'bagaimana', 'gimana']);
    const berapa = adaLemma(baris, ['how-many', 'how-much', 'berapa']);
    const siapa = adaLemma(baris, ['who', 'siapa']), apa = adaLemma(baris, ['what', 'apa', 'apa-itu']);
    if (ent0 && diMana) { f.intent = 'ent-rumah'; f.ent = ent0.kunci; return f; }
    if (siapa && adaLemma(baris, ['master', 'tuan', 'owner', 'pemilik', 'guru']) && !ent0) { f.intent = 'diri-tuan'; return f; }
    if (siapa && kamu && !adaNama) { f.intent = 'diri-jenis'; return f; }
    if (kenapa && adaLemma(baris, ['trader', 'pedagang', 'dagang', 'trading', 'berdagang'])) { f.intent = 'kenapa-rugi'; f.ent = 'rugi'; return f; }
    if (apa && kamu && adaLemma(baris, ['job', 'work', 'pekerjaan', 'kerja']) && !ent0) { f.intent = 'diri-pekerjaan'; return f; }
    if (apa && adaLemma(baris, ['languages', 'language', 'bahasa']) && (kamu || adaLemma(baris, ['speak', 'bicara', 'menguasai'])) && !ent0) { f.intent = 'diri-bahasa'; return f; }
    if (apa && adaLemma(baris, ['heart', 'jantung']) ) { f.intent = 'diri-jantung'; return f; }
    if (apa && adaLemma(baris, ['motto', 'motto', 'diaman'])) { f.intent = 'diri-motto'; return f; }
    if (apa && adaLemma(baris, ['pakem', 'buy', 'beli']) && (adaLemma(baris, ['pakem', 'beli', 'buy']))) { f.intent = 'diri-pakem'; return f; }
    if (apa && adaLemma(baris, ['uji-50', 'tournament', 'turnamen', 'uji50']) || (berapa && adaLemma(baris, ['koin', 'coin', 'turnamen', 'tournament', 'uji-50']))) {
      f.intent = 'diri-uji50'; return f;
    }
    if (diMana && (kamu || adaLemma(baris, ['live', 'rumah', 'hidup', 'tinggal'])) && !ent0) { f.intent = 'diri-rumah'; return f; }
    if (kamu && (apa || siapa) && !f.intent) { f.intent = 'diri-jenis'; return f; }

    // --- terjemahan dua arah
    const adaMetaBahasa = adaLemma(baris, ['language', 'bahasa', 'say', 'bilang', 'ucap']);
    if ((id && adaLemma(baris, ['inggris', 'indonesia', 'english'])) || (!id && adaLemma(baris, ['indonesian', 'english']))) {
      const meta = ['language', 'bahasa', 'inggris', 'english', 'indonesian', 'indonesia', 'say', 'bilang', 'how', 'what', 'apa', 'do', 'you', 'the', 'in', 'word', 'kata', 'from', 'dari', 'is', 'adalah', 'bagaimana', 'how-much', 'how-many'];
      const kandidat = baris.kata.filter(k => (k.hip.some(h => h.kelas === 'x') || k.hip.some(h => h.kelas === 'n') || O.tag(k.surf, bahasa === 'en' ? 'id' : 'en').length) && !meta.includes(k.hip[0] ? k.hip[0].lemma : k.surf));
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
      const kt2 = baris.kata.filter(k => k.hip.some(h => h.kelas === 'v') && !meta.includes(k.hip[0].lemma));
      f.intent = 'morf-lampau'; f.kata = kt2.length ? kt2[kt2.length - 1].surf : (f.asing || [])[0]; return f;
    }

    // --- buat kalimat (generasi hidup)
    if (adaLemma(baris, ['make', 'buat', 'rangkai']) && adaLemma(baris, ['sentence', 'kalimat'])) {
      const meta = ['make', 'buat', 'rangkai', 'sentence', 'kalimat', 'with', 'dengan', 'a', 'the'];
      const kt = baris.kata.filter(k => k.hip.some(h => ['v', 'n', 'adj'].includes(h.kelas)) && !meta.includes(k.hip[0].lemma));
      f.intent = 'buat-kalimat'; f.kata = kt.length ? kt[kt.length - 1].surf : null; return f;
    }

    // --- istilah pekerjaan
    const ist = cariIstilah(baris);
    if (ist && (apa || adaLemma(baris, ['explain', 'jelaskan']) || bagaimana)) {
      f.intent = 'istilah'; f.istilah = ist; return f;
    }

    const MAKAN_EN2ID = { worms: 'cacing', worm: 'cacing', moss: 'lumut', fish: 'ikan', meat: 'daging', seeds: 'seed', seed: 'biji', grass: 'rumput', fruit: 'buah', bananas: 'pisang', banana: 'pisang', insects: 'serangga', insect: 'serangga', nectar: 'nektar', honey: 'madu', carrots: 'wortel', carrot: 'wortel', rice: 'nasi', hay: 'jerami', leaves: 'daun', leaf: 'daun', mice: 'tikus', mouse: 'tikus', eggs: 'telur', egg: 'telur' };
    if (!ent0 && (adaLemma(baris, ['eat', 'makan']))) {
      const kataMakanan = baris.kata.find(k => {
        if (!k.hip.length) return false;
        const lem = k.hip[0].lemma;
        return !!(MAKAN_EN2ID[lem] || (lem.endsWith('s') && MAKAN_EN2ID[lem.slice(0, -1)]));
      });
      if (kataMakanan) {
        const lem = kataMakanan.hip[0].lemma;
        const mangsa = MAKAN_EN2ID[lem] || MAKAN_EN2ID[lem.slice(0, -1)];
        f.ent = mangsa; f.intent = 'siapa-makan'; return f;
      }
    }
    const ent = ent0 || cariEnt(baris);
    if (ent) {
      f.ent = ent.kunci;
      const adaAux = baris.kata.some(k => k.hip.some(h => ['aux', 'cop'].includes(h.kelas)));
      const tanyaYa = adaAux || adaLemma(baris, ['apakah', 'bisakah', 'sudahkah', 'bolehkah']);
      const iWh = baris.kata.findIndex(k => k.hip.some(h => ['what', 'who', 'apa', 'siapa'].includes(h.lemma)));
      const iV = baris.kata.findIndex(k => k.hip.some(h => ['eat', 'makan'].includes(h.lemma)));
      const iEnt = baris.kata.findIndex(k => k.hip.some(h => h.lemma === ent.data.en || h.lemma === ent.kunci));
      if (iWh > -1 && iV > -1 && iEnt > iV) { f.intent = 'siapa-makan'; return f; }
      if (iV > -1 && iEnt < iV && (iWh > -1 || adaAux) && (adaLemma(baris, ['what', 'apa']))) { f.intent = 'ent-makan'; return f; }
      const abil = cariAbil(baris);
      if (diMana) { f.intent = 'ent-rumah'; return f; }
      if ((adaLemma(baris, ['eat']) && iEnt < baris.kata.findIndex(k => k.hip.some(h => ['eat'].includes(h.lemma))) && !abil) || (adaLemma(baris, ['makanan']) && apa)) { f.intent = 'ent-makan'; return f; }
      if (abil && abil !== 'makan-daging' && abil !== 'makan-tumbuhan') { f.intent = 'ent-bisa'; f.abil = abil; return f; }
      if (abil && (tanyaYa) && (f.negasi || iWh < 0)) { // does a cat eat meat? → cek makan
        f.intent = 'ent-makan-cek'; f.abil = abil; return f;
      }
      if (abil) { f.intent = 'ent-bisa'; f.abil = abil; return f; }
      if (apa && adaLemma(baris, ['apa-itu', 'what', 'apa'])) { f.intent = 'ent-definisi'; return f; }
      if (adaLemma(baris, ['who', 'siapa'])) { f.intent = 'ent-definisi'; return f; }
      // sifat: "is fire hot?" — adj + ent
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
})();
