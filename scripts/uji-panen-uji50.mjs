// Uji PANEN UJI-50 — lilin sintetis menyatakan semua jalur keputusan
import { panenSatu } from '/home/z/my-project/Micaprofita-/scripts/hidup/uji-50.mjs'

const pakem = { entry: 100, stopLoss: 98, jualProfit: 104, jualAmbisius: 108, risikoPct: 2, jarakJualPct: 4, jarakAmbisiusPct: 8 }
const L = (h, l) => ({ t: 0, o: 101, h, l, c: 102, v: 1 })

const kasus = [
  ['stop dulu', [L(103, 97.5)], 'kalah-sl'],
  ['tp lalu impas', [L(105, 99), L(103, 99.5)], 'menang-tp'],
  ['tp lalu ambisius', [L(105, 99), L(109, 104)], 'menang-ambisius'],
  ['satu lilin stop+tp = pesimis stop', [L(105, 97.5)], 'kalah-sl'],
  ['terkunci: amb+impas sekaligus = pesimis tp', [L(105, 99), L(109, 99.5)], 'menang-tp'],
  ['tidak sentuh apa pun', [L(103, 100.5), L(103.5, 101)], null],
  ['lilin satu langsung ambisius', [L(110, 99)], 'kalah-sl'], // l=99 ≤ stop 98? tidak: 99 > 98 → tp terkunci, h≥amb → menang-ambisius
]
// koreksi kasus 7: l=99 > stop=98 → MURNI: kenaStop false, kenaTp true (h=110≥104) → TERKUNCI + ambisius langsung = menang-ambisius
kasus[6] = ['lilin satu tembus ambisius (stop tak tersentuh)', [L(110, 99)], 'menang-ambisius']

let gagal = 0
for (const [nama, lilin, harap] of kasus) {
  const x = { pakem }
  const h = panenSatu(x, lilin)
  const dapat = h.selesai ? h.status : null
  const ok = dapat === harap
  if (!ok) gagal++
  console.log(`${ok ? 'LULUS' : 'GUGUR'} — ${nama}: dapat ${dapat}${h.selesai ? ` (ret ${h.retPct}% · R ${h.r})` : ' (terbuka)'}`)
}
// ret checks
const a = panenSatu({ pakem }, [L(105, 99), L(109, 104)])
console.log(`ret menang-ambisius = ${a.retPct}% (harap 6.0 = 0.5*4 + 0.5*8), R = ${a.r} (harap 3)`)
const b = panenSatu({ pakem }, [L(103, 97.5)])
console.log(`ret kalah-sl = ${b.retPct}% (harap -2), R = ${b.r} (harap -1)`)
process.exit(gagal ? 1 : 0)
