// ============================================================
// OTAK-LLM (V292) — mandat pemilik: "lihat teknikmu dalam arena AGI
// yang terhubung LLM, samakan terapkan pada micaprofita GitHub juga".
//
// JUJUR SEJAK LAHIR (hukum V274): otak bahasa TIDAK bisa hidup tanpa kunci.
// Bila pemilik memasang kunci di GitHub Secrets (LLM_URL + LLM_KEY,
// opsional LLM_MODEL — endpoint API kompatibel-OpenAI /chat/completions),
// denyut SAKTI mengirim ringkasan medan ke otak bahasa: narasi analis +
// kritik jujur disegel ke laporan/nalar-llm.json dan dipajang di arena.
// Tanpa kunci: fungsi mengembalikan status jujur "belum terpasang" —
// mesin nalar lokal (dewan bukti + wawasan-360 + metakognisi) tetap
// menganalisa penuh. TIDAK ADA pura-pura LLM; suara LLM hanyalah
// SUARA KEDUA — vonis tetap dari mesin pra-registrasi yang dinilai medan.
//
// V314 SALURAN-PULIH (mandat pemilik: "error circuit open ... harus kuat"):
// panggilan kini lewat pengawat saluran.mjs — breaker TUTUP/TERBUKA/
// SETENGAH yang TIDAK PERNAH macet terbuka (probe pulih otomatis),
// TIDAK PERNAH bisu (cadangan nalar lokal keluar milidetik saat gateway
// tumbang), TIDAK PERNAH menghang (batas 20 dtk per percobaan, 2 coba),
// SOPAN (nol tembakan saat terbuka, kecuali satu probe terjadwal).
// Keadaan breaker dipersist di otak/saluran-keadaan.json — denyut
// berikutnya mengingat luka & tetap mendengarkan pulihan pihak luar.
// ============================================================
import { buatSaluran } from './saluran.mjs'

const saluranLLM = buatSaluran('llm', {
  nGagalBuka: 3, jedaDasarMs: 60000, jedaMaksMs: 900000,
  cobaMaks: 2, batasMs: 20000, jedaCobaMs: 600,
})

export async function nalarLLM (umpan) {
  const url = process.env.LLM_URL
  const key = process.env.LLM_KEY
  const model = process.env.LLM_MODEL || 'gpt-4o-mini'
  if (!url || !key) {
    return {
      aktif: false, model: null,
      ket: 'kunci LLM belum dipasang di repo (Secrets LLM_URL/LLM_KEY kosong) — denyut menganalisa dengan mesin nalar lokal penuh; otak-LLM menyala otomatis begitu kunci terpasang, tanpa pura-pura',
    }
  }
  const sistem = 'Kau analis crypto jujur MICAPROFITA. Balas dalam bahasa Indonesia ringkas (maks 120 kata). Dilarang mengklaim kepastian; sebut selalu ketidakpastian & skenario. Format tepat: NARASI: <pembacaan medan> | KRITIK: <kelemahan argumen sistem ini>'
  return saluranLLM.panggil(async (signal) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: sistem },
          { role: 'user', content: `Medan denyut #${umpan.siklus}:\n` + JSON.stringify(umpan.ringkas) },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
      signal,
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const d = await r.json()
    const teks = d?.choices?.[0]?.message?.content || ''
    if (!teks) throw new Error('jawab kosong')
    const [narasi, kritik] = teks.split('|')
    return {
      aktif: true, model, waktu: new Date().toISOString(),
      narasi: (narasi || '').replace(/^NARASI:/i, '').trim().slice(0, 600),
      kritik: (kritik || '').replace(/^KRITIK:/i, '').trim().slice(0, 600),
      ket: 'narasi dari otak-LLM eksternal (API kompatibel-OpenAI) lewat saluran-pulih V314 (breaker tak-pernah-macet + cadangan lokal) — dipajang jujur sebagai SUARA KEDUA, bukan vonis; vonis tetap dari mesin pra-registrasi yang dinilai medan',
    }
  }, (e) => {
    // H2: cadangan jujur — denyut TIDAK menunggu pihak yang tumbang
    return {
      aktif: true, model, gagal: true,
      saluran: saluranLLM.poel(),
      ket: 'otak-LLM tumbang (' + String(e && e.message ? e.message : e).slice(0, 60) + ') — saluran-pulih menjawab tanpa menunggu, denyut tetap jalan penuh dengan nalar lokal; probe pulihan tetap dijadwalkan otomatis',
    }
  })
}
