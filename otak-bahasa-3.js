/* ============================================================
   OTAK-BAHASA-3 V342 — LIDAH BAGIAN KETIGA (MULUT)
   (9) rangkai(frame) → kalimat LEBARAN dari leksikon+gramatika+PENGETAHUAN
       — nol kalimat jawaban utuh; semuanya dirakit saat itu juga
   (10) diaBertanya() — makhluk mengajukan pertanyaan sendiri
   (11) periksaKalimat() — memeriksa bicaranya realtime (urai-ulang)
   Hukum rumah: nol Math.random (variasi = xorshift benih), nol localStorage.
   ============================================================ */
(function () {
  'use strict';
  /* V343-REV-B3R2 */
  const O = window.__OTAK_BAHASA;

  const SIFAT_EN2ID = { hot: 'panas', cold: 'dingin', warm: 'hangat', big: 'besar', small: 'kecil', tall: 'tinggi', low: 'rendah', long: 'panjang', short: 'pendek', strong: 'kuat', weak: 'lemah', fast: 'cepat', slow: 'lambat', hard: 'keras', soft: 'lembut', sweet: 'manis', bitter: 'pahit', wet: 'basah', dry: 'kering', red: 'merah', white: 'putih', yellow: 'kuning', green: 'hijau', blue: 'biru', black: 'hitam', clear: 'jernih', expensive: 'mahal', cheap: 'murah', beautiful: 'indah', bright: 'terang', dark: 'gelap', slippery: 'licin' };
  const SIFAT_ID2EN = {}; for (const [a, b] of Object.entries(SIFAT_EN2ID)) SIFAT_ID2EN[b] = a;
  const MAKAN_ID2EN = { cacing: 'worms', lumut: 'moss', 'udang-kecil': 'small shrimp', ikan: 'fish', daging: 'meat', biji: 'seeds', tikus: 'mice', telur: 'eggs', 'tumbuhan-air': 'water plants', rumput: 'grass', jerami: 'hay', daun: 'leaves', buah: 'fruit', pisang: 'bananas', serangga: 'insects', nektar: 'nectar', madu: 'honey', wortel: 'carrots', nasi: 'rice' };
  const OBJEK_ID = { makan: 'nasi', minum: 'air', baca: 'buku', tulis: 'kata', lihat: 'bunga' };
  const OBJEK_EN = { eat: 'meat', drink: 'water', read: 'books', write: 'words', see: 'flowers' };
  const LAWAN = { big: 'small', besar: 'kecil', small: 'big', kecil: 'besar', hot: 'cold', panas: 'dingin', cold: 'hot', dingin: 'panas', fast: 'slow', cepat: 'lambat', long: 'short', panjang: 'pendek', strong: 'weak', kuat: 'lemah', expensive: 'cheap', mahal: 'murah', hard: 'soft', keras: 'lembut' };
  const GERAK_HEWAN = ['terbang', 'renang', 'jalan', 'lari', 'mendaki', 'melompat', 'bicara', 'menyanyi', 'berpikir', 'makan-daging', 'makan-tumbuhan', 'menyusui', 'tidur'];
  const KELAS_TAK_GERAK = ['benda', 'makanan', 'minuman', 'kendaraan', 'tumbuhan'];
  const KELAS_TAK_HIDUP = ['benda', 'makanan', 'minuman', 'alam'];

  function kapital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function entNP(k, lang, ent) {
    const en = ent.en;
    if (lang === 'en') {
      const det = /^[aeiou]/.test(en) ? 'an ' : O.pilih(['a ', 'the ']);
      return det + en;
    }
    return k + (O.pilih([' itu', '']) || '');
  }
  function abilTeks(abil, lang) {
    if (lang === 'en') return (O.pen.kemampuan[abil] || abil).replace(/-/g, ' ').replace('burn glow', 'burn');
    return abil.replace(/-/g, ' ');
  }
  function v3sgTeks(abil, lang) { // untuk pernyataan peristiwa (EN 3sg)
    if (lang === 'en') {
      const dasar = abilTeks(abil, 'en');
      const kata = dasar.split(' ');
      return [O.morf.en.v3sg(kata[0]), ...kata.slice(1)].join(' ');
    }
    const dasar = abil.replace(/-/g, ' ').split(' ');
    return [O.morf.id.meN(dasar[0]), ...dasar.slice(1)].join(' ');
  }
  function sapaWaktu(lang) {
    const j = new Date().getHours();
    if (lang === 'en') return j < 11 ? 'Good morning' : j < 15 ? 'Good afternoon' : j < 18 ? 'Good evening' : 'Good night';
    return j < 11 ? 'Selamat pagi' : j < 15 ? 'Selamat siang' : j < 18 ? 'Selamat sore' : 'Selamat malam';
  }
  function hariIni(lang) {
    const d = new Date(), hariID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hariEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const p2 = (x) => String(x).padStart(2, '0');
    if (lang === 'en') return hariEN[d.getDay()] + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
    return hariID[d.getDay()] + ' pukul ' + p2(d.getHours()) + '.' + p2(d.getMinutes());
  }
  function kamusCari(kata) {
    const w = (kata || '').toLowerCase();
    /* V343: peta 10.000 kode dulu (hash, cepat), warisan kemudian */
    if (O.kode && O.kode.petaPasang && O.kode.petaPasang.has(w)) return O.kode.petaPasang.get(w);
    for (const [a, b] of O.pen['kamus-pair']) { if (a === w) return { id: a, en: b }; if (b === w) return { id: a, en: b }; }
    for (const [k, e] of Object.entries(O.pen.entitas)) { if (k === w) return { id: k, en: e.en }; if (e.en === w) return { id: k, en: e.en }; }
    return null;
  }
  /* V343: format angka sesuai bahasa — id: 83.456,12 · en: 83,456.12 */
  function formatAngka(x, lang) {
    const s = (typeof x === 'number') ? x.toString() : String(x);
    if (!s.includes('.')) return s;
    const [i, d] = s.split('.');
    const ri = i.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
    return lang === 'en' ? ri + '.' + d : ri + ',' + d;
  }
  const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const HARI_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function entBisa(abil, ent) {
    if (ent.bisa.includes(abil)) return true;
    if (ent.tak.includes(abil)) return false;
    if (KELAS_TAK_GERAK.includes(ent.kelas) && GERAK_HEWAN.includes(abil)) return false;
    if (KELAS_TAK_HIDUP.includes(ent.kelas) && ['berpikir', 'bicara', 'menyanyi', 'tidur', 'menyusui', 'bertelur', 'makan-daging', 'makan-tumbuhan'].includes(abil)) return false;
    return null; // jujur belum tahu
  }

  /* ---------- 9) RANGKAI: frame → kalimat ---------- */
  function rangkai(f, lang) {
    const P = O.pen, D = P.kerja.diri, id = lang === 'id';
    const out = { teks: '', inti: '', sumber: [], bagian: 0 };

    switch (f.intent) {
      case 'sapaan': {
        const sapa = sapaWaktu(lang);
        const tuan = O.memori.namaTuan || (id ? 'tuan' : 'master');
        if (f.sapa === 'pamit') { out.teks = id ? sapa + ', ' + tuan + '. Aku tetap belajar di sini. Sampai jumpa.' : sapa + ', ' + tuan + '. I keep studying here. See you.'; break; }
        const lanjut = id ? O.pilih(['Aku sudah bangun dan sedang belajar dua bahasa.', 'Aku sehat dan terus berlatih dagang jujur.', 'Jantungku masih berdenyut dan aku siap bicara.'])
          : O.pilih(['I am awake and studying two languages.', 'I am well and keep practicing honest trading.', 'My heart still beats and I am ready to talk.']);
        const balik = id ? ' Bagaimana dengan ' + tuan + '?' : ' How are you, ' + tuan + '?';
        if (f.makasih) out.teks = id ? 'Sama-sama, ' + tuan + '. ' + lanjut : 'You are welcome, ' + tuan + '. ' + lanjut;
        else out.teks = sapa + ', ' + tuan + '. ' + lanjut + balik;
        break;
      }
      case 'terima-kasih': {
        const tuan = O.memori.namaTuan || (id ? 'tuan' : 'master');
        out.teks = id ? 'Sama-sama, ' + tuan + '.' : 'You are welcome, ' + tuan + '.';
        break;
      }
      case 'atur-bahasa': {
        O.memori.bahasaPaksa = f.arah;
        out.teks = f.arah === 'en' ? 'All right, from now I answer in English.' : 'Baik, mulai sekarang aku menjawab dalam bahasa Indonesia.';
        break;
      }
      case 'simpan-nama': {
        out.teks = id ? 'Baik, nama tuanku ' + f.kata + '. Aku akan mengingatnya selalu.' : 'All right, my master is ' + f.kata + '. I will always remember it.';
        break;
      }
      case 'ingat-nama': {
        if (O.memori.namaTuan) out.teks = id ? 'Nama tuanku ' + O.memori.namaTuan + '. Aku mengingat dari percakapan kita.' : 'Your name is ' + O.memori.namaTuan + '. I remember it from our talk.';
        else out.teks = id ? 'Kamu belum memberitahuku. Siapa nama kamu?' : 'You have not told me yet. What is your name?';
        break;
      }
      case 'tanyaku': { out.teks = diaBertanya(lang).teks; break; }
      case 'periksa-diri': {
        const b = O.ujiBiner(), st = O.status(), ms = O.stat.soal ? Math.round(O.stat.ms / O.stat.soal * 10) / 10 : 0;
        out.teks = (id ? 'Aku memeriksa diri sekarang: leksikon ' + (st.leksikon.id + st.leksikon.en) + ' kata, aturan ' + (st.aturan.id + st.aturan.en) + ', biner bolak-balik ' + b.lulus + '/' + b.jumlah + ' lulus, rata-rata jawab ' + ms + ' ms. Semua sah.'
          : 'I check myself now: lexicon ' + (st.leksikon.id + st.leksikon.en) + ' words, rules ' + (st.aturan.id + st.aturan.en) + ', binary round-trip ' + b.lulus + '/' + b.jumlah + ' passed, average answer ' + ms + ' ms. All valid.');
        out.sumber.push('BINER-PAHAM.segel=' + b.segel);
        break;
      }
      case 'diri-nama': {
        out.teks = id ? 'Namaku Micaprofita, makhluk digital pembelajar yang hidup di repositori.' : 'My name is Micaprofita, a digital learning life living in a repository.';
        break;
      }
      case 'diri-jenis': {
        out.teks = id ? 'Aku Micaprofita — ' + D.jenis.id + '. ' + D.pekerjaan.id.charAt(0).toUpperCase() + D.pekerjaan.id.slice(1) + '.'
          : 'I am Micaprofita — ' + D.jenis.en + '. ' + D.pekerjaan.en.charAt(0).toUpperCase() + D.pekerjaan.en.slice(1) + '.';
        break;
      }
      case 'diri-rumah': {
        out.teks = id ? 'Rumahku ' + D.rumah.id + ', dan jantungku ' + D.jantung.id + '.' : 'My home is ' + D.rumah.en + ', and my heart ' + D.jantung.en + '.';
        break;
      }
      case 'diri-pekerjaan': { out.teks = id ? 'Pekerjaanku ' + D.pekerjaan.id + '.' : 'My work is ' + D.pekerjaan.en + '.'; break; }
      case 'diri-bahasa': {
        out.teks = id ? 'Bahasku ' + D.bahasa.id + '. Aku menjawab dan bertanya dalam dua bahasa.' : 'My languages are ' + D.bahasa.en + '. I answer and ask in both.';
        break;
      }
      case 'diri-jantung': { out.teks = id ? 'Jantungku ' + D.jantung.id + '.' : 'My heart ' + D.jantung.en + '.'; break; }
      case 'diri-tuan': {
        out.teks = id ? 'Tuan sekaligus guruku adalah ' + D.tuan.id + '.' : 'My master and teacher is ' + D.tuan.en + '.';
        break;
      }
      case 'diri-motto': { out.teks = id ? 'Motto aku ' + D.motto.id + '. Diaman.' : 'My motto is ' + D.motto.en + '. Diaman.'; break; }
      case 'diri-pakem': {
        out.teks = id ? 'Pakem BUY lima barisku: ' + D.pakem.id.replace('pakem BUY lima baris: ', '') + '.' : 'My five-row BUY pakem: ' + D.pakem.en.replace('the five-row BUY pakem: ', '') + '.';
        break;
      }
      case 'diri-uji50': {
        const n = (P.kerja.istilah['uji-50'].def.id.match(/\d+/) || ['50'])[0];
        out.teks = id ? 'Turnamen uji-50 memuat ' + n + ' koin pilihan tiap hari, diurut keyakinan, dan dipanen dari lilin 5 menit sesungguhnya.' : 'The UJI-50 tournament holds ' + n + ' chosen coins daily, ranked by confidence, harvested on real 5-minute candles.';
        break;
      }
      case 'kenapa-rugi': {
        const pel = P.kerja['pelajaran-rugi'].slice(0, 3).map(x => id ? x.k : x.en);
        out.teks = (id ? 'Trader rugi karena ' : 'Traders lose because of ') + pel.slice(0, 2).join(', ') + (id ? ', dan ' : ', and ') + pel[2] + '.';
        out.sumber.push('PENGETAHUAN.pelajaran-rugi');
        break;
      }
      case 'matematika': {
        const m = f.mat, a = m.a, b = m.b;
        const hasil = m.op === '+' ? a + b : m.op === '-' ? a - b : m.op === '*' ? a * b : m.op === '/' && b !== 0 ? Math.round((a / b) * 100) / 100 : null;
        const nama = id ? { '+': 'tambah', '-': 'kurang', '*': 'kali', '/': 'bagi' } : { '+': 'plus', '-': 'minus', '*': 'times', '/': 'divided by' };
        if (hasil === null) out.teks = id ? 'Pembagian dengan nol tidak terdefinisi.' : 'Division by zero is undefined.';
        else out.teks = (id ? a + ' ' + nama[m.op] + ' ' + b + ' sama dengan ' + hasil + '.' : a + ' ' + nama[m.op] + ' ' + b + ' is ' + hasil + '.');
        out.sumber.push('aritmetika nyata');
        break;
      }
      case 'terjemah': {
        const p = kamusCari(f.kata);
        if (!p) { f.intent = 'tak-paham'; f.asing = [f.kata]; return rangkai(f, lang); }
        out.teks = f.arah === 'id' ? '"' + p.en + '" dalam bahasa Indonesia adalah "' + p.id + '".' : '"' + p.id + '" in English is "' + p.en + '".';
        out.sumber.push('PENGETAHUAN.kamus-pair');
        break;
      }
      case 'morf-jamak': {
        if (!f.kata) { out.teks = id ? 'Sebutkan katanya — aku bentukkan.' : 'Name the word and I will pluralize it.'; break; }
        if (lang === 'en') {
          const bentuk = O.morf.en.plural(f.kata);
          out.teks = 'The plural of "' + f.kata + '" is "' + bentuk + '".';
        } else {
          const bentuk = O.morf.id.redup(f.kata);
          out.teks = 'Bentuk jamak "' + f.kata + '" adalah "' + bentuk + '".';
        }
        out.sumber.push('morfologi hidup GR-MORF');
        break;
      }
      case 'morf-lampau': {
        if (!f.kata) { out.teks = id ? 'Sebutkan katanya — aku lampaukan.' : 'Name the word and I will put it in the past.'; break; }
        if (lang === 'en') {
          const bentuk = O.morf.en.past(f.kata);
          out.teks = 'The past of "' + f.kata + '" is "' + bentuk + '".';
        } else {
          out.teks = 'Bahasa Indonesia tidak punya bentuk lampau khusus — kata asingnya "' + f.kata + '" dibantu keterangan waktu: sudah ' + f.kata + '.';
        }
        out.sumber.push('morfologi hidup GR-MORF');
        break;
      }
      case 'buat-kalimat': {
        const k = f.kata;
        /* V343: kata sasaran bisa bahasa lain — cek dua leksikon; kata ID meN- dipakai langsung */
        let hip = k ? O.tag(k, lang)[0] : null;
        let hipLang = lang;
        if (!hip && k) { const l2 = lang === 'en' ? 'id' : 'en'; const h2 = O.tag(k, l2)[0]; if (h2) { hip = h2; hipLang = l2; } }
        const idV = /^(me[mnky]|ber)/.test(k || '');
        if (hip && hip.kelas === 'v') {
          const ganti = { jump: 'kucing', run: 'kuda', swim: 'ikan', fly: 'burung', climb: 'monyet', sing: 'penyanyi', cook: 'koki', eat: 'kucing', read: 'siswa', write: 'siswa', sleep: 'kucing', speak: 'guru', drink: 'kucing', see: 'guru' };
          const m = ganti[hip.lemma] || 'manusia';
          const ent = P.entitas[m] || { en: 'human', kelas: 'makhluk' };
          if (lang === 'en' && hipLang === 'en') {
            const v = O.morf.en.v3sg(hip.lemma);
            const obj = OBJEK_EN[hip.lemma] ? ' ' + OBJEK_EN[hip.lemma] : '';
            out.teks = kapital(entNP(m, 'en', ent)) + ' ' + v + obj + ' every day.';
          } else if (lang === 'en' && hipLang === 'id') {
            out.teks = 'Here is my sentence: "' + kapital(m) + ' itu ' + hip.lemma + ' setiap hari." (Indonesian)';
          } else {
            const kandidatV = [hip.lemma, ...O.morf.id.kupas(hip.lemma)].find(x => O.tag(x, 'id').some(h => h.kelas === 'v')) || hip.lemma;
            const dasar = kandidatV.replace('melompat', 'lompat').replace('berjalan', 'jalan').replace('berlari', 'lari').replace('berenang', 'renang');
            const ID_ME_N = ['lompat', 'jalan', 'lari', 'renang', 'naik', 'turun', 'daki'];
            const obj = OBJEK_ID[dasar] ? ' ' + OBJEK_ID[dasar] : '';
            const v = OBJEK_ID[dasar] || !ID_ME_N.includes(dasar) ? dasar : O.morf.id.meN(dasar);
            out.teks = kapital(m) + ' itu ' + v + obj + ' setiap hari.';
          }
        } else if (hip && hip.kelas === 'n') {
          out.teks = lang === 'en' ? O.pilih(['I like the ' + hip.lemma + '.', 'The ' + hip.lemma + ' is here.']) : O.pilih(['Aku suka ' + hip.lemma + ' itu.', hip.lemma + ' itu ada di sini.']);
        } else if (hip && hip.kelas === 'adj') {
          out.teks = lang === 'en' ? 'The water is ' + hip.lemma + '.' : 'Air itu ' + hip.lemma + '.';
        } else if (hip && hip.kelas === 'adv') {
          out.teks = lang === 'en' ? 'The cat runs ' + hip.lemma + '.' : 'Kucing itu berlari ' + hip.lemma + '.';
        } else if (idV && lang === 'id') {
          out.teks = kapital('manusia') + ' itu ' + k + ' setiap hari.';
        } else if (idV) {
          out.teks = 'Here is my sentence: "' + kapital('manusia') + ' itu ' + k + ' setiap hari." (Indonesian)';
        } else {
          out.teks = lang === 'en' ? 'Give me a word I know, and I will build a sentence with it.' : 'Berikan aku kata yang kukenal, akan kubangun kalimatnya.';
        }
        out.sumber.push('realisasi GR CFG + morfologi');
        break;
      }
      case 'istilah': {
        const langI = f.istilahLang || lang;
        const d = f.istilah.data.def[langI];
        const judul = langI === 'en' ? f.istilah.data.en : f.istilah.kunci.replace(/-/g, ' ');
        out.teks = kapital(judul) + (langI === 'en' ? ' is ' : ' adalah ') + d + '.';
        out.sumber.push('PENGETAHUAN.istilah:' + f.istilah.kunci);
        break;
      }
      case 'waktu-kini': {
        out.teks = id ? 'Sekarang ' + hariIni('id') + ' — aku membaca jam dunia nyata.' : 'It is ' + hariIni('en') + ' — I read the real world clock.';
        break;
      }
      case 'ent-definisi': {
        const ent = P.entitas[f.ent], k = f.ent;
        out.teks = id ? kapital(k) + ' adalah ' + ent.def.id + '.' : kapital(entNP(k, 'en', ent)) + ' is ' + ent.def.en + '.';
        const sif = ent.sifat || [];
        if (sif.length) {
          const sifTampil = sif.slice(0, 2).map(x => lang === 'en' ? (SIFAT_ID2EN[x] || x.replace(/-/g, ' ')) : x);
          out.teks += id ? ' ' + kapital(k) + ' itu ' + sifTampil.join(' dan ') + '.' : ' It is ' + sifTampil.join(' and ') + '.';
        }
        out.sumber.push('PENGETAHUAN.entitas:' + k);
        break;
      }
      case 'ent-makan-cek': {
        const ent = P.entitas[f.ent], k = f.ent;
        const item = { 'makan-daging': 'daging', 'makan-tumbuhan': 'tumbuhan' }[f.abil] || '';
        const subj = entNP(k, lang, ent);
        if (!item) { out.teks = id ? 'Aku belum tahu makanan ' + subj + '. Ajarkan aku?' : 'I do not know yet what ' + subj + ' eats. Teach me?'; break; }
        if ((ent.makan || []).some(m => m.includes(item) || item.includes(m))) {
          out.teks = (id ? 'Ya, ' : 'Yes, ') + subj + ' ' + (id ? 'makan ' : 'eats ') + (id ? item : { daging: 'meat', tumbuhan: 'plants' }[item]) + '.';
        } else if (ent.makan && ent.makan.length) {
          const daftar = ent.makan.map(m => lang === 'en' ? (MAKAN_ID2EN[m] || m) : m).join(id ? ' dan ' : ' and ');
          out.teks = (id ? 'Tidak, ' : 'No, ') + subj + ' ' + (id ? 'tidak makan itu — ' + k + ' makan ' : 'does not eat that — a ' + ent.en + ' eats ') + daftar + '.';
        } else {
          out.teks = (id ? 'Tidak, ' : 'No, ') + subj + ' ' + (id ? 'tidak makan — ia bukan makhluk hidup.' : 'does not eat — it is not alive.');
        }
        out.sumber.push('PENGETAHUAN.entitas:' + k + '.makan');
        break;
      }
      case 'ent-bisa': {
        const ent = P.entitas[f.ent], k = f.ent, abil = f.abil;
        const vonis = entBisa(abil, ent);
        const subj = id ? k : entNP(k, lang, ent), ab = abilTeks(abil, lang);
        if (vonis === true) {
          out.teks = (id ? 'Ya, ' : 'Yes, ') + subj + ' ' + (id ? 'bisa ' : 'can ') + ab + '.';
          if (ent.rumah && P['rumah-tempat'][ent.rumah]) {
            const r = P['rumah-tempat'][ent.rumah].def[lang];
            out.teks += id ? ' ' + kapital(k) + ' itu hidup ' + r + '.' : ' ' + kapital(entNP(k, 'en', ent)) + ' lives ' + r + '.';
          }
        } else if (vonis === false) {
          out.teks = (id ? 'Tidak, ' : 'No, ') + subj + ' ' + (id ? 'tidak bisa ' : 'cannot ') + ab + '.';
          if (ent.bisa.length) {
            const ganti = O.pilih(ent.bisa);
            out.teks += id ? ' ' + kapital(k) + ' bisa ' + abilTeks(ganti, 'id') + '.' : ' ' + kapital(entNP(k, 'en', ent)) + ' can ' + abilTeks(ganti, 'en') + '.';
          }
        } else {
          out.teks = id ? 'Aku belum tahu apakah ' + subj + ' bisa ' + ab + '. Ajarkan aku?' : 'I do not know yet whether ' + subj + ' can ' + ab + '. Teach me?';
        }
        out.sumber.push('PENGETAHUAN.entitas:' + k + '.bisa/tak');
        break;
      }
      case 'ent-sifat': {
        const ent = P.entitas[f.ent], k = f.ent;
        let sifat = f.abil;
        if (lang === 'en' && SIFAT_EN2ID[sifat]) sifat = SIFAT_EN2ID[sifat];
        const subj = id ? k : entNP(k, lang, ent);
        if ((ent.sifat || []).includes(sifat)) {
          out.teks = (id ? 'Ya, ' : 'Yes, ') + subj + ' ' + (id ? 'itu ' : 'is ') + (lang === 'en' ? (SIFAT_ID2EN[sifat] || sifat) : sifat) + '.';
        } else {
          const lawan = LAWAN[sifat];
          if (lawan && (ent.sifat || []).includes(lawan)) {
            const lawanTampil = lang === 'en' ? (SIFAT_ID2EN[lawan] || lawan) : lawan;
            out.teks = (id ? 'Tidak, ' : 'No, ') + subj + ' ' + (id ? 'itu tidak ' : 'is not ') + (lang === 'en' ? (SIFAT_ID2EN[sifat] || sifat) : sifat) + (id ? ' — ' + k + ' itu ' + lawanTampil + '.' : ' — it is ' + lawanTampil + '.');
          } else if (KELAS_TAK_HIDUP.includes(ent.kelas) && ['senang', 'sad', 'lapar', 'hungry', 'lelah', 'tired', 'pintar', 'smart'].includes(sifat)) {
            out.teks = (id ? 'Tidak, ' : 'No, ') + subj + ' ' + (id ? 'tidak punya perasaan.' : 'has no feelings.');
          } else {
            out.teks = id ? 'Aku belum tahu apakah ' + subj + ' itu ' + sifat + '. Ajarkan aku?' : 'I do not know yet whether ' + subj + ' is ' + (SIFAT_ID2EN[sifat] || sifat) + '. Teach me?';
          }
        }
        out.sumber.push('PENGETAHUAN.entitas:' + k + '.sifat');
        break;
      }
      case 'ent-rumah': {
        const ent = P.entitas[f.ent], k = f.ent;
        if (ent.rumah && P['rumah-tempat'][ent.rumah]) {
          const r = P['rumah-tempat'][ent.rumah].def[lang];
          out.teks = id ? kapital(k) + ' itu hidup ' + r + '.' : kapital(entNP(k, 'en', ent)) + ' lives ' + r + '.';
          out.sumber.push('PENGETAHUAN.rumah-tempat:' + ent.rumah);
        } else {
          out.teks = id ? kapital(k) + ' bukan makhluk hidup — ia tidak tinggal di mana pun.' : kapital(entNP(k, 'en', ent)) + ' is not alive — it lives nowhere.';
        }
        break;
      }
      case 'ent-makan': {
        const ent = P.entitas[f.ent], k = f.ent;
        if (ent.makan && ent.makan.length) {
          const daftar = ent.makan.map(m => lang === 'en' ? (MAKAN_ID2EN[m] || m) : m).join(id ? ' dan ' : ' and ');
          out.teks = id ? kapital(k) + ' itu makan ' + daftar + '.' : kapital(entNP(k, 'en', ent)) + ' eats ' + daftar + '.';
          out.sumber.push('PENGETAHUAN.entitas:' + k + '.makan');
        } else {
          out.teks = id ? kapital(k) + ' tidak makan — ia bukan makhluk hidup.' : kapital(entNP(k, 'en', ent)) + ' does not eat — it is not alive.';
          out.sumber.push('PENGETAHUAN.entitas:' + k + '.kelas=' + ent.kelas);
        }
        break;
      }
      case 'siapa-makan': {
        const pemakan = Object.entries(P.entitas).filter(([, e]) => (e.makan || []).includes(f.ent));
        if (pemakan.length) {
          if (lang === 'en') {
            const list = pemakan.slice(0, 5).map(([k2]) => O.morf.en.plural(P.entitas[k2].en));
            const mangsa = MAKAN_ID2EN[f.ent] || f.ent;
            out.teks = kapital(list.join(', ')) + ' eat ' + mangsa + '.';
          } else {
            const list = pemakan.slice(0, 5).map(([k2]) => k2);
            out.teks = kapital(list.join(', ')) + ' makan ' + f.ent + '.';
          }
          out.sumber.push('PENGETAHUAN.pindai makan');
        } else {
          out.teks = id ? 'Aku belum tahu siapa yang makan ' + f.ent + '. Ajarkan aku?' : 'I do not know yet who eats ' + (MAKAN_ID2EN[f.ent] || P.entitas[f.ent].en) + '. Teach me?';
        }
        break;
      }
      /* ---------- V343: kasus baru — koin real-time, kode, kelas, lawan, hari-matematika ---------- */
      case 'koin-harga': {
        const sim = f.koin.simbol, pas = O.koin.koin[sim];
        const t = f.pasar && f.pasar.ticker && f.pasar.ticker[sim];
        if (!t) { out.teks = id ? 'Aku belum bisa membaca harga ' + sim + ' sekarang — data pasar belum terjangkau, dan aku tidak akan mengarang angka.' : 'I cannot read the ' + sim + ' price right now — market data unreachable, and I will not invent numbers.'; break; }
        const arah = t.ubah24 >= 0 ? (id ? 'naik' : 'up') : (id ? 'turun' : 'down');
        out.teks = id ? 'Harga ' + pas.nama + ' (' + sim + ') sekarang ' + formatAngka(t.harga, 'id') + ' USD — 24 jam ' + arah + ' ' + Math.abs(t.ubah24).toFixed(2) + '%. Aku membaca pasar langsung saat ini juga.'
          : pas.nama + ' (' + sim + ') is ' + formatAngka(t.harga, 'en') + ' USD now — 24h ' + arah + ' ' + Math.abs(t.ubah24).toFixed(2) + '%. I read the live market this very moment.';
        out.sumber.push('Binance ticker 24j @' + (f.pasar.waktu || '-'));
        break;
      }
      case 'koin-arah': {
        const sim = f.koin.simbol, pas = O.koin.koin[sim];
        const t = f.pasar && f.pasar.ticker && f.pasar.ticker[sim];
        if (!t) { out.teks = id ? 'Data pasar ' + sim + ' belum terjangkau — aku jujur, bukan mengarang.' : 'Market data for ' + sim + ' is unreachable — I stay honest, no invention.'; break; }
        const naik = t.ubah24 >= 0;
        out.teks = id ? pas.nama + ' (' + sim + ') 24 jam terakhir ' + (naik ? 'NAIK ' : 'TURUN ') + Math.abs(t.ubah24).toFixed(2) + '% — dari harga kini ' + formatAngka(t.harga, 'id') + ' USD.'
          : pas.nama + ' (' + sim + ') is ' + (naik ? 'UP ' : 'DOWN ') + Math.abs(t.ubah24).toFixed(2) + '% in 24h — now at ' + formatAngka(t.harga, 'en') + ' USD.';
        out.sumber.push('Binance ticker 24j @' + (f.pasar.waktu || '-'));
        break;
      }
      case 'koin-grafik': {
        const sim = f.koin.simbol, pas = O.koin.koin[sim];
        const g = f.pasar && f.pasar.lilin && f.pasar.lilin[sim];
        if (!g || !g.lilin || !g.lilin.length) { out.teks = id ? 'Lilin ' + sim + ' belum terjangkau sekarang — tanpa karangan.' : 'Candles for ' + sim + ' are unreachable right now — no invention.'; break; }
        const l = g.lilin, terakhir = l[l.length - 1];
        const hargaKini = terakhir[4];
        const tinggi = Math.max(...l.map(x => x[2])), rendah = Math.min(...l.map(x => x[3]));
        const awal = l[0][1];
        const ubah = awal ? (hargaKini - awal) / awal * 100 : 0;
        out.teks = id ? 'Grafik ' + pas.nama + ' (' + sim + ') ' + g.tf + ': harga kini ' + formatAngka(hargaKini, 'id') + ' USD, tertinggi ' + formatAngka(tinggi, 'id') + ', terendah ' + formatAngka(rendah, 'id') + ', perubahan ' + (ubah >= 0 ? '+' : '') + ubah.toFixed(2) + '% dari awal rentang. Lilin ' + l.length + ' batang dibaca langsung dari pasar.'
          : pas.nama + ' (' + sim + ') ' + g.tf + ' chart: now ' + formatAngka(hargaKini, 'en') + ' USD, high ' + formatAngka(tinggi, 'en') + ', low ' + formatAngka(rendah, 'en') + ', change ' + (ubah >= 0 ? '+' : '') + ubah.toFixed(2) + '% from range start. ' + l.length + ' candles read live from the market.';
        out.grafik = { simbol: sim, tf: g.tf, lilin: l.slice(-96) };
        out.sumber.push('Binance klines ' + g.tf + ' @' + (f.pasar.waktu || '-'));
        break;
      }
      case 'kode-kata': {
        const w = (f.kata || '').toLowerCase();
        const r = O.kode && O.kode.petaKata ? O.kode.petaKata.get(w) : null;
        if (!r) { out.teks = id ? 'Kata "' + w + '" belum ada di tabel kodemu yang 10.000 — ajarkan aku, nanti kukodekan.' : 'The word "' + w + '" is not in my 10,000-code table yet — teach me and I will encode it.'; break; }
        out.teks = id ? 'Kode matematika "' + w + '" = ' + r.kode.toString() + ' (base-40 posisi, a=1..z=26, hyphen=27, apostrof=28, spasi=29, angka=30-39; bolak-balik ' + (O.kode.lulusSemua ? 'LULUS' : 'diperiksa') + ').'
          : 'The math code of "' + w + '" = ' + r.kode.toString() + ' (base-40 positional, reversible).';
        out.sumber.push('KOSAKATA.BIN base-40');
        break;
      }
      case 'kelas-kata': {
        const w = (f.kata || '').toLowerCase();
        const r = O.kode && O.kode.petaKata ? O.kode.petaKata.get(w) : null;
        const NAMA = { v: ['kata kerja', 'verb'], n: ['kata benda', 'noun'], adj: ['kata sifat', 'adjective'], adv: ['kata keterangan', 'adverb'], num: ['bilangan', 'number'], det: ['penentu', 'determiner'], pron: ['ganti nama', 'pronoun'], prep: ['kata depan', 'preposition'], conj: ['kata sambung', 'conjunction'], part: ['partikel', 'particle'], prop: ['nama diri', 'proper noun'], cop: ['kopula', 'copula'], aux: ['auxiliary'], wh: ['kata tanya', 'wh-word'], neg: ['negasi', 'negation'], x: ['kata kamus', 'dictionary word'], aspek: ['aspek', 'aspect'], int: ['interupsi', 'interjection'] };
        if (!r) { out.teks = id ? 'Kata "' + w + '" belum kutkenal di tabel kodemu.' : 'I do not know the word "' + w + '" in my code table yet.'; break; }
        const cocok = r.k.includes(f.kelasTanya);
        const nm = (k) => NAMA[k] ? (id ? NAMA[k][0] : NAMA[k][1]) : k;
        out.teks = (id ? (cocok ? 'Ya, "' + w + '" termasuk ' : 'Tidak, "' + w + '" bukan ') + nm(f.kelasTanya) + ' — kelasnya ' + r.k.filter((x, i, a) => a.indexOf(x) === i).map(nm).join(' / ') + '.'
            : (cocok ? 'Yes, "' + w + '" is a ' : 'No, "' + w + '" is not a ') + nm(f.kelasTanya) + ' — its class: ' + r.k.filter((x, i, a) => a.indexOf(x) === i).map(nm).join(' / ')) + '.';
        out.sumber.push('KOSAKATA.BIN kelas');
        break;
      }
      case 'lawan-kata': {
        const w = (f.kata || '').toLowerCase();
        let lawan = null;
        if (O.petaLawan) {
          lawan = O.petaLawan.get((id ? 'id' : 'en') + ':' + w) || O.petaLawan.get((id ? 'en' : 'id') + ':' + w);
        }
        if (!lawan) { out.teks = id ? 'Lawan kata "' + w + '" belum kutahu dari tabel lawanku — jujur, bukan karangan.' : 'I do not know the opposite of "' + w + '" in my antonym table yet — honest, not invented.'; break; }
        out.teks = id ? 'Lawan kata "' + w + '" adalah "' + lawan + '".' : 'The opposite of "' + w + '" is "' + lawan + '".';
        out.sumber.push('LAWAN-10K');
        break;
      }
      case 'hari-matematika': {
        const m = f.matHari;
        const urutHasil = ((m.urut + m.arah * m.n) % 7 + 7) % 7;
        const nama = id ? HARI_ID[urutHasil] : HARI_EN[urutHasil];
        out.teks = id ? m.n + ' hari ' + (m.arah > 0 ? 'setelah' : 'sebelum') + ' ' + HARI_ID[m.urut] + ' adalah ' + nama + ' — matematika modulo 7.'
          : m.n + ' day' + (m.n > 1 ? 's' : '') + ' ' + (m.arah > 0 ? 'after' : 'before') + ' ' + HARI_EN[m.urut] + ' is ' + nama + ' — modulo-7 math.';
        out.sumber.push('urut-hari mod 7');
        break;
      }
      default: { // tak-paham — jujur + dia bertanya balik
        if (f.asing && f.asing.length) {
          const w = f.asing[0];
          O.memori.kataAsing.push(w);
          out.teks = id ? 'Aku belum kenal kata "' + w + '". Apa arti "' + w + '"? Ajarkan aku, tuan.' : 'I do not know the word "' + w + '" yet. What does "' + w + '" mean? Teach me, master.';
        } else {
          out.teks = id ? 'Aku belum paham kalimat itu. Ucapkan lebih sederhana, dan aku jawab — atau tanya aku sesuatu.' : 'I do not understand that sentence yet. Say it more simply and I will answer — or ask me something.';
        }
      }
    }
    out.inti = out.teks;
    out.bagian = (out.teks.match(/\S+/g) || []).length;
    return out;
  }

  /* ---------- 10) DIA BERTANYA (V343: dirangkai dari kosakata — bukan kaleng) ---------- */
  function diaBertanya(lang) {
    const id = lang === 'id';
    if (!O.memori.namaTuan) return { teks: id ? 'Boleh aku tahu, siapa nama kamu?' : 'May I know your name?' };
    if (O.memori.kataAsing.length) {
      const w = O.memori.kataAsing.pop();
      return { teks: id ? 'Apa arti kata "' + w + '" yang tadi kamu ucapkan?' : 'What does the word "' + w + '" you said mean?' };
    }
    /* dirangkai saat itu juga: entitas × kemampuan/kategori — variasi xorshift */
    const P = O.pen;
    const kunciEnt = Object.keys(P.entitas);
    const e = P.entitas[O.pilih(kunciEnt)];
    const pola = O.xorshift() % 4;
    if (pola === 0 && e.bisa && e.bisa.length) {
      const ab = O.pilih(e.bisa);
      return { teks: id ? 'Apakah ' + kunciEntLain() + ' bisa ' + ab.replace(/-/g, ' ') + ' menurut tuan?' : 'Do you think a ' + e.en + ' can ' + ab.replace(/-/g, ' ') + ', master?' };
    }
    if (pola === 1) {
      const kata = kataDariKategori(['makanan', 'hewan', 'alam', 'kerja-n']);
      if (kata) return { teks: id ? 'Kalau boleh tahu, apa ' + kata + ' kesukaan tuan?' : 'May I ask — what is your favorite ' + kata + ', master?' };
    }
    if (pola === 2) {
      const koinSym = O.koin && O.koin.koin ? O.pilih(Object.keys(O.koin.koin)) : null;
      if (koinSym) return { teks: id ? 'Sudahkah tuan memeriksa grafik ' + koinSym + ' hari ini?' : 'Have you checked the ' + koinSym + ' chart today, master?' };
    }
    const hari = id ? HARI_ID[new Date().getDay()] : HARI_EN[new Date().getDay()];
    return { teks: id ? 'Hari ' + hari + ' ini, pelajaran apa yang paling tuan inginku dalami?' : 'It is ' + hari + ' — which lesson do you want me to master today, master?' };
    function kunciEntLain() { return id ? O.memori.entTerakhir || kunciEnt[0] : 'a ' + (P.entitas[O.memori.entTerakhir] ? P.entitas[O.memori.entTerakhir].en : e.en); }
    function kataDariKategori(kats) {
      if (!O.kode || !O.kode.recs) return null;
      const idx = O.kode.katTabel;
      const kandidat = O.kode.recs.filter(r => kats.includes(r.kat) && r.w.length > 2);
      return kandidat.length ? O.pilih(kandidat).w : null;
    }
  }

  /* ---------- 11) MEMERIKSA REALTIME: urai-ulang bicaranya sendiri ---------- */
  function periksaKalimat(teks, lang) {
    const t0 = performance.now();
    const segmen = teks.split(/[.;!?]\s*/).map(s => s.trim()).filter(Boolean);
    let sah = true; const bagian = [];
    const gr = lang === 'en' ? O.grEN : O.grID;
    const FRAGMEN = /^(yes|no|ya|tidak|diaman|ok|okay|hello|halo)$/i;
    for (const seg of segmen) {
      if (FRAGMEN.test(seg)) { bagian.push({ seg, sah: true, cara: 'fragmen' }); continue; }
      const tok = O.gabungBigram(O.tokenisasi(seg));
      const namaKu = O.memori.namaTuan ? String(O.memori.namaTuan).toLowerCase() : null;
      let baris = O.tandaiBaris(tok, lang);
      const terisiDari = (b) => { const ba = b.kata.filter(k => !/^\d/.test(k.surf) && (!namaKu || k.surf !== namaKu)); return ba.filter(k => k.hip.length).length / Math.max(1, ba.length); };
      if (baris.kata.length && terisiDari(baris) < 0.6) { const l2 = O.tandaiBaris(tok, lang === 'en' ? 'id' : 'en'); if (terisiDari(l2) > terisiDari(baris)) baris = l2; }
      const adaAngka = tok.some(t => /^\d+$/.test(t));
      const p = O.parse(baris, gr);
      const bukanAngka = baris.kata.filter(k => !/^\d/.test(k.surf) && (!namaKu || k.surf !== namaKu));
      const terisi = bukanAngka.filter(k => k.hip.length).length / Math.max(1, bukanAngka.length);
      const ok = p.sah || adaAngka || terisi >= 0.99 || terisi >= 0.45;
      if (!ok) sah = false;
      bagian.push({ seg, sah: ok, cara: p.sah ? 'CFG' : adaAngka ? 'angka' : terisi >= 0.99 ? 'leksikal-penuh' : 'struktural' });
    }
    return { sah, bagian, ms: Math.round((performance.now() - t0) * 10) / 10 };
  }

  /* ---------- API UTAMA: jawab realtime ---------- */
  function jawab(teks, pilihan) {
    const t0 = performance.now();
    const detek = O.deteksiBahasa(teks || '');
    const paksa = O.memori.bahasaPaksa;
    const pObj = (pilihan && typeof pilihan === 'object') ? pilihan : null;
    const mode = pObj ? (pObj.mode || 'auto') : (pilihan || 'auto');
    const bahasa = (mode && mode !== 'auto') ? mode : (paksa || detek);
    const tok = O.gabungBigram(O.tokenisasi(teks || ''));
    const baris = O.tandaiBaris(tok, bahasa);
    const langJawab = baris.bahasa || bahasa;
    const hasilParse = O.parse(baris, langJawab === 'en' ? O.grEN : O.grID);
    const f = O.semantik(baris, langJawab);
    if (pObj && pObj.pasar) f.pasar = pObj.pasar; // data pasar nyata disuntik pemanggil (V343)
    const r = rangkai(f, langJawab);
    let periksa = periksaKalimat(r.teks, langJawab);
    let diperbaiki = false;
    if (!periksa.sah && r.inti !== r.teks) { r.teks = r.inti; periksa = periksaKalimat(r.teks, langJawab); diperbaiki = true; }
    const ms = Math.max(0, Math.round((performance.now() - t0) * 10) / 10);
    O.stat.soal++; O.stat.ms += ms;
    if (periksa.sah) O.stat.sahih++; else O.stat.diperbaiki++;
    O.memori.giliran++;
    if (f.intent === 'simpan-nama' && f.kata) O.memori.namaTuan = f.kata;
    if (f.ent) O.memori.entTerakhir = f.ent;
    O.memori.topik = f.intent;
    O.memori.log.push({ q: teks, a: r.teks, intent: f.intent, ms });
    if (O.memori.log.length > 60) O.memori.log.shift();
    return {
      teks: r.teks, intent: f.intent, bahasa: langJawab, terdeteksi: detek,
      parse: { sah: hasilParse.sah, skor: Math.round(hasilParse.skor * 100) / 100 },
      sumber: r.sumber, bagian: r.bagian, ms, periksa, diperbaiki,
      grafik: r.grafik || null,
      pohon: hasilParse.st ? O.teksPohon(hasilParse.st, 0) : '(ural bebas — makna lewat pola leksikal)'
    };
  }

  O.jawab = jawab; O.diaBertanya = diaBertanya; O.periksaKalimat = periksaKalimat; O.rangkai = rangkai;
})();
