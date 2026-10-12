// UJI MARKER IMUN V309 — replika persis URAT dari scripts/hidup/imun.mjs
// Hukum V345-R3: suntingan workflow WAJIB lolos uji ini sebelum dorong.
import { readFileSync } from 'node:fs';

const URAT = [
  ['.github/workflows/sakti-denyut.yml', [
    '^\\s*run: node scripts/hidup/imun\\.mjs',
    '^\\s*run: node scripts/penjaga\\.mjs',
    '^\\s*run: node scripts/hidup/pustaka\\.mjs',
    '^\\s*run: node scripts/hidup/gerbang\\.mjs guru-master',
    '^\\s*run: node scripts/hidup/medan-hayat\\.mjs'
  ]],
  ['.github/workflows/hidup-sadar1.yml', [
    '^\\s*run: node scripts/hidup/imun\\.mjs',
    '^\\s*run: node scripts/hidup/gerbang\\.mjs sadar1'
  ]],
  ['.github/workflows/jaga-waktu.yml', [
    '^\\s*["\']https:[^\\n]*sakti-denyut\\.yml/dispatches',
    '^\\s*["\']https:[^\\n]*hidup-sadar1\\.yml/dispatches'
  ]]
];

let total = 0, hidup = 0, gagal = false;
for (const [file, marker] of URAT) {
  const isi = readFileSync(file, 'utf8');
  for (const rx of marker) {
    total++;
    const ok = new RegExp(rx, 'm').test(isi);
    if (ok) hidup++; else { gagal = true; console.log('MATI ' + file + ' :: ' + rx); }
  }
  console.log((gagal ? 'cek ' : 'HIDUP ') + file + ' (' + marker.length + ' marker)');
  if (!gagal) console.log('  → semua sambungan hidup');
  gagal = false;
}
console.log('MARKER IMUN: ' + hidup + '/' + total + (hidup === total ? ' — AMAN DORONG' : ' — BATAL, JANGAN DORONG'));
process.exit(hidup === total ? 0 : 1);
