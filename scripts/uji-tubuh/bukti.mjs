#!/usr/bin/env node
// ============================================================
// BUKTI — mata lab V309: snapshot keadaan tubuh makhluk per label.
//   node scripts/uji-tubuh/bukti.mjs <label>
// Menyimpan snapshot ke scripts/uji-tubuh/bukti/<label>.json
// (lampiran audit laporan/uji-tubuh.json). Fakta saja — nol tafsir.
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'

const label = process.argv[2] || 'tanpa-label'
const bacaJSON = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')) } catch { return null } }

const guru = bacaJSON('laporan/guru.json')
const peta = bacaJSON('laporan/peta-geladak.json')
const sasaran = bacaJSON('laporan/sasaran-terkini.json')
const keadaan = bacaJSON('ruang-hidup/keadaan.json')
const imun = bacaJSON('laporan/imun.json')
const pustaka = bacaJSON('pustaka/indeks.json')

const denyutYml = readFileSync('.github/workflows/sakti-denyut.yml', 'utf8')
const sadarYml = existsSync('.github/workflows/hidup-sadar1.yml') ? readFileSync('.github/workflows/hidup-sadar1.yml', 'utf8') : ''

const snap = {
  label, waktu: new Date().toISOString(),
  komitTerakhir: execSync('git log --oneline -6').toString().trim(),
  tubuh: {
    organGuruAda: existsSync('scripts/hidup/guru-master.mjs'),
    organSadarAda: existsSync('scripts/hidup/sadar1.js'),
    uratGuruTerhubung: /^\s*run: node scripts\/hidup\/guru-master\.mjs/m.test(denyutYml),
    uratGuruTerkomentar: /^\s*#\s*.*node scripts\/hidup\/guru-master\.mjs/m.test(denyutYml),
    uratSadarTerhubung: /^\s*run: node scripts\/hidup\/sadar1\.js/m.test(sadarYml),
    uratSadarTerkomentar: /^\s*#\s*.*node scripts\/hidup\/sadar1\.js/m.test(sadarYml),
    tanamIsi: existsSync('tanam') ? readdirSync('tanam') : []
  },
  denyut: {
    siklus: sasaran && sasaran.pertumbuhan ? sasaran.pertumbuhan.siklus : null,
    saktiDihasilkan: sasaran ? sasaran.dihasilkan : null,
    guruDiperbarui: guru ? guru.diperbarui : null,
    petaDiperbarui: peta ? peta.dihasilkan || peta.diperbarui || null : null,
    sadarSelesai: keadaan && keadaan.waktu ? keadaan.waktu.selesai || keadaan.waktu.mulai : null,
    pustaka: pustaka && pustaka.gerbang509 ? pustaka.gerbang509.tercapai : null
  },
  imunTerakhir: imun ? { dihasilkan: imun.dihasilkan, rekap: imun.rekap, nafas: imun.nafas ? imun.nafas.putusan.slice(0, 90) : null, tindakan: (imun.tindakan || []).map(t => t.jenis + ':' + t.file) } : null
}

mkdirSync('scripts/uji-tubuh/bukti', { recursive: true })
writeFileSync(`scripts/uji-tubuh/bukti/${label}.json`, JSON.stringify(snap, null, 1))
console.log(`[bukti:${label}] guru=${snap.denyut.guruDiperbarui} sakti=${snap.denyut.saktiDihasilkan} sadar=${snap.denyut.sadarSelesai} pustaka=${snap.denyut.pustaka} siklus=${snap.denyut.siklus}`)
console.log(`[bukti:${label}] urat: guruTerhubung=${snap.tubuh.uratGuruTerhubung} guruIkat=${snap.tubuh.uratGuruTerkomentar} sadarTerhubung=${snap.tubuh.uratSadarTerhubung} sadarIkat=${snap.tubuh.uratSadarTerkomentar} organGuru=${snap.tubuh.organGuruAda} tanam=${JSON.stringify(snap.tubuh.tanamIsi)}`)
console.log(`[bukti:${label}] imun: ${snap.imunTerakhir ? JSON.stringify(snap.imunTerakhir.rekap) + ' @' + snap.imunTerakhir.dihasilkan : 'null'}`)
