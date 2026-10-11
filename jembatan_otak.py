#!/usr/bin/env python3
# JEMBATAN OTAK — satu kebenaran (V299)
# Otak Next.js (z.ai) menerbitkan keputusan MICAPROFITA-nya sendiri ke
# arena-keadaan.json di repo — arena.html menampilkan SASARAN OTAK sebagai
# kebenaran utama; SAKTI server tetap tercatat sebagai suara kedua. Jujur V274.
import json, os, sys, time, base64, urllib.request

REPO = "ririnsherlyna-cloud/Micaprofita-"
BRAIN = os.environ.get("OTAK_URL", "http://localhost:3000/api/arena")
TOK = os.environ.get("GH_TOKEN_MICAPROFITA", "")
B64 = os.environ.get("GH_TOKEN_B64", "")
if not TOK and B64:
    TOK = base64.b64decode(B64).decode()
if not TOK:
    print("GAGAL: token tak tersedia (GH_TOKEN_MICAPROFITA / GH_TOKEN_B64)"); sys.exit(1)

def http(url, data=None, headers=None, method=None):
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in (headers or {}).items(): req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

# 1. Baca keputusan otak
brain = http(BRAIN)
today = brain.get("today")

# picks MICAPROFITA dari standings
mic = {}
for st in brain.get("standings", []):
    if st.get("competitor") == "MICAPROFITA":
        mic = st; break
picks_otak = []
for p in (mic.get("pickList") or mic.get("picksDetail") or []):
    picks_otak.append({"symbol": p.get("symbol"), "direction": p.get("direction"),
                       "confidence": p.get("confidence"), "entryClose": p.get("entryClose")})

# arena hidup: items dengan verdict (CHIP/STRK dgn harga hidup & vonis)
arena_hidup = []
def riset(o):
    if isinstance(o, dict):
        if "symbol" in o and "verdict" in o and o.get("direction"):
            v = o.get("verdict") or {}
            arena_hidup.append({"symbol": o.get("symbol"), "direction": o.get("direction"),
                                "entryClose": o.get("entryClose"), "livePrice": o.get("livePrice"),
                                "liveRetPct": o.get("liveRetPct"),
                                "vonis": v.get("kind"), "keyakinan": o.get("confidence")})
        for v in o.values(): riset(v)
    elif isinstance(o, list):
        for v in o: riset(v)
riset(brain)
# buang duplikat per simbol
lihat = set(); unik = []
for a in arena_hidup:
    if a["symbol"] not in lihat: lihat.add(a["symbol"]); unik.append(a)

otak = {
    "sumber": "otak-nextjs-zai (V299 JEMBATAN-SATU-KEBENARAN)",
    "today": today,
    "diperbarui": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "picks": picks_otak,
    "arenaHidup": unik[:8],
    "ket": "keputusan langsung dari otak AGI (Next.js + memori Prisma) — arena.html menampilkan ini sebagai kebenaran utama; SAKTI server = suara kedua",
}
if not picks_otak and not unik:
    otak["ket"] += " (picks tak terbaca kali ini — jujur, tanpa karangan)"

# 2. Ambil arena-keadaan.json remote + sha (API contents: sha + content sekaligus)
meta = http(f"https://api.github.com/repos/{REPO}/contents/arena-keadaan.json?ref=main")
ak = json.loads(base64.b64decode(meta["content"]))
sha = meta["sha"]

ak["otakPicks"] = otak
# hari tercatat: pergantian hari selalu meninggalkan jejak event
evs = ak.get("events") or []
if not evs or evs[-1].get("day") != today:
    evs.append({"day": today, "kind": "HARI-BARU",
                "text": f"Pergantian hari {today} tercatat — jembatan otak menyala (satu kebenaran V299).",
                "at": otak["diperbarui"]})
    ak["events"] = evs[-40:]

# 3. Terbitkan
isi = base64.b64encode(json.dumps(ak, ensure_ascii=False).encode()).decode()
body = json.dumps({"message": "JEMBATAN-OTAK: keputusan MICAPROFITA (otak next.js) menerbitkan diri — satu kebenaran V299 [skip ci]",
                   "content": isi, "sha": sha})
res = http(f"https://api.github.com/repos/{REPO}/contents/arena-keadaan.json",
           data=body.encode(), headers={"Authorization": "Bearer " + TOK,
           "Accept": "application/vnd.github+json", "Content-Type": "application/json"}, method="PUT")
print("TERBIT:", res.get("commit", {}).get("sha", "?")[:8],
      "| picks otak:", len(picks_otak), "| arena hidup:", len(unik), "| today:", today)
