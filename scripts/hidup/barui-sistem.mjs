#!/usr/bin/env node
// ============================================================
// PENERIMA-SISTEM (V349) — organ yang membuat makhluk
// MEMPERBARUI SISTEMNYA SENDIRI, sepenuhnya, tiap denyut:
//
//   1. TAMBANG   — gali kotak-kotak kekalahan dari buku besar hidup
//                  (laporan/prakira-server.jsonl, vonis matang nyata).
//   2. DRAF      — susun aturan DSL sempit (whitelist, nol kode).
//   3. UJI-REPLAY— putar ulang SELURUH buku besar: aturan wajib
//                  menyelamatkan net kumulatif, tak merusak satu
//                  jendela waktu pun, tak menelan >25% buku.
//   4. SEGEL     — sha256 kanonik; isi aturan beku setelah segel.
//   5. PASANG    — otak/aturan-dinamis.json (AKTIF) + fosil jsonl;
//                  denyut yang sama, penjaga mengikatnya saat kunci.
//   6. NILAI-ULANG— tiap denyut replay diulang di buku besar yang
//                  tumbuh; yang berbalik merugikan DIBATALKAN sendiri.
//                  BLOK berumur (96 denyut = 24 jam) — pasar berubah,
//                  aturan lama tak boleh menggantung selamanya.
//
// Hukum: gagal organ = LUKA TERCATAT, denyut TETAP JALAN (V334) —
// organ ini TIDAK PERNAH exit non-zero. Nol Math.random. Nol karangan.
// ============================================================
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import {
  JALUR_ANGKA, JALUR_KATA, N_MIN, DELTA_MIN, HIT_MAKS_BLOK, HIT_MAKS_UKURAN,
  MAKSAKTIF, MAKS_BLOK, KEDALUWARSA_DENYUT, kartuDariEntri, cocokSyarat,
  validasiAturan, replayAturan, segelDari, statistikKotak,
} from './aturan-dinamis.mjs'

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const P_LEDGER = join(AKAR, 'laporan/prakira-server.jsonl')
const P_JSON = join(AKAR, 'otak/aturan-dinamis.json')
const P_JSONL = join(AKAR, 'otak/aturan-dinamis.jsonl')
const P_LAPOR = join(AKAR, 'laporan/pembaruan-sistem.json')
const ISO = () => new Date().toISOString()
const log = (s) => console.log('[penerima-sistem] ' + s)
const bulat = (x, d = 5) => +(+x).toFixed(d)

const bacaJson = (p, cadangan) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return cadangan } }
const bacaJsonl = (p) => { try { return readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) } catch { return [] } }

// ==================== bantuan (dihisit penuh — dipakai blok utama) ====================
function cocokAtomLokal (atom, kartu) {
  const v = kartu[atom.p]
  if (atom.op === 'eq') return v !== undefined && v === atom.v
  if (atom.op === 'neq') return v !== undefined && v !== atom.v
  if (typeof v !== 'number') return false
  return atom.op === 'lt' ? v < atom.v : atom.op === 'lte' ? v <= atom.v : atom.op === 'gt' ? v > atom.v : v >= atom.v
}
function teksSyarat (syarat) {
  return syarat.map((a) => {
    const op = { lt: '<', lte: '≤', gt: '>', gte: '≥', eq: '=', neq: '≠' }[a.op]
    return `${a.p} ${op} ${a.v}`
  }).join(' DAN ')
}
function hitKotak (matang, draf) {
  const kotak = matang.filter((e) => cocokSyarat(draf, kartuDariEntri(e)))
  return kotak.length ? +((kotak.filter((e) => e.status === 'BENAR').length / kotak.length) * 100).toFixed(1) : 0
}
function netKotak (matang, draf) {
  const kotak = matang.filter((e) => cocokSyarat(draf, kartuDariEntri(e)))
  return +kotak.reduce((a, e) => a + (e.net || 0), 0).toFixed(5)
}
function rekapLedger (matang) {
  const benar = matang.filter((e) => e.status === 'BENAR').length
  return { matang: matang.length, benar, salah: matang.length - benar, hitPct: +(benar / matang.length * 100).toFixed(1), netSum: +matang.reduce((a, e) => a + (e.net || 0), 0).toFixed(4) }
}
function tulisLaporan ({ tindakan, aktif, ledger, ms, organGagal }) {
  try {
    writeFileSync(P_LAPOR, JSON.stringify({
      protokol: 'PENERIMA-SISTEM-V349', waktu: ISO(), organGagal: organGagal || null,
      ledger: ledger || null, tindakan, ms: ms || 0,
      aktif: (aktif || []).map((a) => ({
        id: a.id, jenis: a.jenis, syarat: teksSyarat(a.syarat), faktor: a.efek && a.efek.faktor,
        segel: a.segel, pasangDenyut: a.pasangDenyut, status: a.status,
        bukti: a.bukti && { n: a.bukti.n, hitPctKotak: a.bukti.hitPctKotak, deltaReplay: a.bukti.deltaReplay },
        penilaian: a.penilaian,
      })),
      catatan: 'semua angka dihitung dari laporan/prakira-server.jsonl (buku besar vonis nyata); aturan mengikat saat kunci denyut yang sama; organ ini tidak pernah mematikan denyut (V334)',
    }, null, 1))
  } catch {}
}
let _idBerikut = null
function idBaru () {
  if (_idBerikut === null) {
    let maks = 0
    try {
      const d = JSON.parse(readFileSync(join(AKAR, 'otak/aturan-dinamis.json'), 'utf8'))
      for (const a of [...(d.aktif || []), ...(d.sejarah || [])]) {
        const m = /^AD-(\d+)$/.exec(a.id || ''); if (m) maks = Math.max(maks, +m[1])
      }
    } catch {}
    _idBerikut = maks
  }
  _idBerikut += 1
  return 'AD-' + String(_idBerikut).padStart(4, '0')
}

try {
  const t0 = Date.now()
  // ---- 0. buku besar hidup ----
  const ledger = bacaJsonl(P_LEDGER)
  const matang = ledger.filter((e) => (e.status === 'BENAR' || e.status === 'SALAH') && e.waktuDinilai && Number.isFinite(e.net))
  if (matang.length < N_MIN * 2) {
    log(`buku besar terlalu muda (${matang.length} matang) — belum waktunya menulis aturan; jujur menunggu`)
    tulisLaporan({ tindakan: [{ jenis: 'TUNGGU', ket: `buku besar ${matang.length} matang < ${N_MIN * 2} — tidak ada aturan ditulis` }], aktif: [] })
    process.exit(0)
  }
  const denyutSekarang = (() => { const s = bacaJson(join(AKAR, 'otak/penjaga-keadaan.json'), {}); return (s.siklus ?? ledger.filter((e) => e.waktuKunci).length) + 1 })()
  const tubuh = bacaJson(P_JSON, { protokol: 'PENERIMA-SISTEM-V349', aktif: [], sejarah: [], ringkas: { totalTerpasang: 0, dibatalkanCt: 0, kedaluwarsaCt: 0 } })
  tubuh.aktif = Array.isArray(tubuh.aktif) ? tubuh.aktif.filter((a) => validasiAturan(a).ok) : []
  tubuh.sejarah = Array.isArray(tubuh.sejarah) ? tubuh.sejarah.slice(-40) : []

  const tindakan = []
  const fosilkan = (peristiwa, a, catatan) => {
    appendFileSync(P_JSONL, JSON.stringify({ waktu: ISO(), siklus: denyutSekarang, peristiwa, id: a.id, jenis: a.jenis, segel: a.segel, catatan }) + '\n')
  }

  // ---- 1. NILAI-ULANG aturan aktif di buku besar yang tumbuh ----
  const bertahan = []
  for (const a of tubuh.aktif) {
    const replay = replayAturan(a, matang)
    const baru = matang.filter((e) => Date.parse(e.waktuKunci || '') >= Date.parse(a.pasangAt || 0))
    // UKURAN: dinilai dari replay penuh setelah ≥5 vonis baru; BLOK: berumur.
    if (a.jenis === 'UKURAN') {
      if (baru.length >= 5 && replay.delta < 0) {
        a.status = 'DIBATALKAN'
        a.penilaian = { waktu: ISO(), vonisBaru: baru.length, deltaKini: replay.delta, alasan: 'replay buku besar terkini berbalik merugikan — dibatalkan sendiri, bukti medan di atas segel' }
        tubuh.sejarah.push(a); fosilkan('BATAL', a, `delta ${replay.delta} < 0 setelah ${baru.length} vonis baru`)
        tindakan.push({ jenis: 'BATAL', id: a.id, ket: `replay ${replay.delta} < 0 pada ${baru.length} vonis baru` })
        log(`aturan ${a.id} DIBATALKAN — replay berbalik merugikan (delta ${replay.delta})`)
        continue
      }
      a.penilaian = { waktu: ISO(), vonisBaru: baru.length, deltaKini: replay.delta, statusPengamatan: baru.length < 5 ? 'pengamatan (baru <5 vonis)' : 'sehat' }
      bertahan.push(a)
    } else { // BLOK — berumur 96 denyut; kotaknya tetap jelek? boleh ditambang ulang.
      const usia = denyutSekarang - (a.pasangDenyut || denyutSekarang)
      if (usia >= KEDALUWARSA_DENYUT) {
        a.status = 'DIBATALKAN'
        a.penilaian = { waktu: ISO(), usiaDenyut: usia, alasan: `kedaluwarsa ${KEDALUWARSA_DENYUT} denyut — pasar boleh berubah; bila kotak masih kalah, tambang akan melahirkannya lagi dengan bukti baru` }
        tubuh.sejarah.push(a); fosilkan('KEDALUWARSA', a, `usia ${usia} denyut`)
        tindakan.push({ jenis: 'KEDALUWARSA', id: a.id, ket: `usia ${usia} denyut` })
        continue
      }
      a.penilaian = { waktu: ISO(), usiaDenyut: usia, deltaReplay: replay.delta, statusPengamatan: 'blok aktif' }
      bertahan.push(a)
    }
  }
  tubuh.aktif = bertahan

  // ---- 2. TAMBAHAN kotak kekalahan (maks 1 aturan baru per denyut) ----
  const blokAktif = tubuh.aktif.filter((a) => a.jenis === 'BLOK').length
  if (tubuh.aktif.length < MAKSAKTIF) {
    const draf = tambangAturan(matang, tubuh)
    if (draf) {
      const replay = replayAturan(draf, matang)
      const gagal = []
      if (!replay.lulus) {
        if (replay.kena < N_MIN) gagal.push(`n=${replay.kena} < ${N_MIN}`)
        if (replay.delta < DELTA_MIN) gagal.push(`delta ${replay.delta} < ${DELTA_MIN}`)
        if (Math.min(...replay.jendelaDelta) < -0.004) gagal.push(`jendela terburuk ${Math.min(...replay.jendelaDelta)}`)
      }
      if (gagal.length) {
        tindakan.push({ jenis: 'DRAF-TERTOLAK', ket: `kotak ${teksSyarat(draf.syarat)} ditolak gerbang replay: ${gagal.join('; ')}` })
        log('draf tertolak gerbang replay: ' + gagal.join('; ') + ' — tidak ada aturan dipasang (anti-overfit)')
      } else {
        draf.bukti = {
          n: replay.kena, hitPctKotak: hitKotak(matang, draf), netKotak: netKotak(matang, draf),
          deltaReplay: replay.delta, pfSebelum: replay.sebelum.pf, pfSesudah: replay.sesudah.pf,
          jendelaDelta: replay.jendelaDelta, dibangunDari: matang.length,
        }
        draf.segel = segelDari(draf)
        draf.pasangDenyut = denyutSekarang
        const sah = validasiAturan(draf)
        if (!sah.ok) { tindakan.push({ jenis: 'DRAF-TERTOLAK', ket: 'validator menolak: ' + sah.alasan }) } else {
          tubuh.aktif.push(draf)
          tubuh.ringkas.totalTerpasang = (tubuh.ringkas.totalTerpasang || 0) + 1
          fosilkan('PASANG', draf, `${teksSyarat(draf.syarat)} — menyelamatkan ${(replay.delta * 100).toFixed(2)}% dari ${replay.kena} vonis`)
          tindakan.push({ jenis: 'PASANG', id: draf.id, jenisAturan: draf.jenis, syarat: teksSyarat(draf.syarat), delta: replay.delta, n: replay.kena, segel: draf.segel })
          log(`PASANG ${draf.id} (${draf.jenis}) ${teksSyarat(draf.syarat)} — replay menyelamatkan ${(replay.delta * 100).toFixed(2)}% dari ${replay.kena} vonis; segel ${draf.segel}`)
        }
      }
    } else {
      tindakan.push({ jenis: 'TAMBAHAN-KOSONG', ket: 'tidak ada kotak kekalahan baru yang lulus ambang tambang — sistem puas dengan aturan yang ada' })
    }
  } else {
    tindakan.push({ jenis: 'PENUH', ket: `${tubuh.aktif.length} aturan aktif (maks ${MAKSAKTIF}) — tidak menumpuk` })
  }

  // ---- 3. SEGEL KUMPULAN + tulis tubuh ----
  tubuh.protokol = 'PENERIMA-SISTEM-V349'
  tubuh.diperbarui = ISO()
  tubuh.siklus = denyutSekarang
  tubuh.ringkas = {
    ...(tubuh.ringkas || {}),
    aktifCt: tubuh.aktif.length,
    blokCt: tubuh.aktif.filter((a) => a.jenis === 'BLOK').length,
    ukuranCt: tubuh.aktif.filter((a) => a.jenis === 'UKURAN').length,
    dibatalkanCt: (tubuh.ringkas && tubuh.ringkas.dibatalkanCt || 0) + tindakan.filter((t) => t.jenis === 'BATAL').length,
    kedaluwarsaCt: (tubuh.ringkas && tubuh.ringkas.kedaluwarsaCt || 0) + tindakan.filter((t) => t.jenis === 'KEDALUWARSA').length,
  }
  writeFileSync(P_JSON, JSON.stringify(tubuh, null, 1))
  tulisLaporan({ tindakan, aktif: tubuh.aktif, ledger: rekapLedger(matang), ms: Date.now() - t0 })
} catch (e) {
  // V334: organ gagal = luka tercatat, denyut TETAP JALAN — nol exit non-zero
  try {
    log('luka: ' + (e && e.message))
    tulisLaporan({ organGagal: String(e && e.message).slice(0, 300), tindakan: [{ jenis: 'LUKA', ket: String(e && e.message).slice(0, 200) }], aktif: [] })
  } catch {}
  process.exit(0)
}

// ==================== tambangan ====================
function tambangAturan (matang, tubuh) {
  const rows = matang.map((e) => ({ e, k: kartuDariEntri(e) })).sort((a, b) => String(a.e.waktuDinilai).localeCompare(String(b.e.waktuDinilai)))
  const tersegel = new Set([...tubuh.aktif, ...(tubuh.sejarah || [])].map((a) => a.jenis + '|' + JSON.stringify(a.syarat.map((s) => [s.p, s.op, s.v]))))
  const kandidat = []
  const dorong = (atom) => {
    const kotak = rows.filter((r) => cocokAtomLokal(atom, r.k))
    if (kotak.length < N_MIN) return
    const st = statistikKotak(kotak)
    if (st.hitPct > HIT_MAKS_UKURAN * 100 || st.netSum > -0.02) return
    kandidat.push({ atom, st })
  }
  for (const p of JALUR_ANGKA) {
    const nilai = rows.map((r) => r.k[p]).filter((v) => typeof v === 'number')
    if (nilai.length < N_MIN * 2) continue
    const urut = [...nilai].sort((a, b) => a - b)
    for (let d = 1; d <= 9; d++) {
      const ambang = +urut[Math.floor(urut.length * d / 10)].toFixed(6)
      if (d > 1 && ambang === +urut[Math.floor(urut.length * (d - 1) / 10)].toFixed(6)) continue
      dorong({ p, op: 'lt', v: ambang })
      dorong({ p, op: 'gte', v: ambang })
    }
  }
  for (const p of JALUR_KATA) {
    if (p === 'simbol') continue // daftar-hitam koin dilarang sebagai aturan (bukan keterampilan)
    const himp = [...new Set(rows.map((r) => r.k[p]).filter((v) => typeof v === 'string'))]
    for (const v of himp) { dorong({ p, op: 'eq', v }); dorong({ p, op: 'neq', v }) }
  }
  if (!kandidat.length) return null
  kandidat.sort((a, b) => a.st.netSum - b.st.netSum || b.st.n - a.st.n)
  const intiSyarat = (arr) => JSON.stringify(arr.map((s) => [s.p, s.op, s.v]))
  // penyempurnaan: pasangkan atom terbaik dgn SATU atom lain (konjungsi) bila makin menyelamatkan
  for (const seed of kandidat.slice(0, 6)) {
    for (const tambah of kandidat.slice(0, 20)) {
      if (tambah.atom.p === seed.atom.p) continue
      const syarat2 = [seed.atom, tambah.atom]
      const kotak2 = rows.filter((r) => syarat2.every((a) => cocokAtomLokal(a, r.k)))
      if (kotak2.length < N_MIN) continue
      const st2 = statistikKotak(kotak2)
      if (st2.netSum < seed.st.netSum && st2.hitPct <= seed.st.hitPct + 2) {
        const draf2 = buatDraf(syarat2, st2)
        if (!tersegel.has(draf2.jenis + '|' + intiSyarat(syarat2))) return draf2
      }
    }
    const draf1 = buatDraf([seed.atom], seed.st)
    if (!tersegel.has(draf1.jenis + '|' + intiSyarat([seed.atom]))) return draf1
  }
  return null
}
function buatDraf (syarat, st) {
  const jenis = st.hitPct <= HIT_MAKS_BLOK * 100 ? 'BLOK' : 'UKURAN'
  const fator = +0.6
  const kotakTeks = teksSyarat(syarat)
  const alasan = `lahir dari buku besar sendiri: ${st.n} vonis dengan ${kotakTeks} — hit ${(st.hitPct).toFixed(1)}%, net ${(st.netSum * 100).toFixed(2)}%; ${jenis === 'BLOK' ? 'kotak ini mayoritas SALAH dan menggerus modal — ditutup saat kunci' : 'kotak ini kalah-dominan — ukurannya disusutkan ×0.6, tetap mengunci dan tetap belajar (hukum karantina-dilarang V263)'}`
  return {
    id: idBaru(), versi: 1, jenis, syarat, efek: jenis === 'UKURAN' ? { faktor: fator } : {},
    alasan, bukti: {}, segel: '', pasangAt: ISO(), pasangDenyut: 0, status: 'AKTIF', penilaian: null,
  }
}
