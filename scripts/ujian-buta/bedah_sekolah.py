#!/usr/bin/env python3
# BEDAH-SEKOLAH — korelasikan setiap jawaban ujian-buta dengan fitur
# matematika murni yang DIHITUNG ULANG dari lilin 1j saat itu
# (persis metode mesinMate penjaga): z-SMA20, drift OLS 30-bar,
# autokorelasi, entropi arah. Tujuan: temukan aturan organ V265.
import json, math, os, glob
from collections import defaultdict

CACHE = '/tmp/ujibuta/cache'
PANEN = '/home/z/my-project/scripts/ujian-buta/panen.jsonl'

k1h_cache = {}
def k1h(base):
    if base not in k1h_cache:
        try: k1h_cache[base] = json.load(open(os.path.join(CACHE, '1h', base + '.json')))
        except: k1h_cache[base] = []
    return k1h_cache[base]

def sma(v, n): return sum(v[-n:]) / n
def z_sma(closes, n=20):
    m = sma(closes, n)
    var = sum((x - m) ** 2 for x in closes[-n:]) / n
    sd = math.sqrt(var) if var > 0 else 1e-9
    return (closes[-1] - m) / sd
def drift_ols(closes, n=30):
    y = closes[-n:]; N = len(y)
    xm = (N - 1) / 2; ym = sum(y) / N
    sxy = sum((i - xm) * (y[i] - ym) for i in range(N))
    sxx = sum((i - xm) ** 2 for i in range(N))
    if sxx == 0: return 0
    b = sxy / sxx  # per jam
    return b / ym * 100 * 24  # proyeksi 24 jam %
def autokorr(closes, n=48):
    rets = [(closes[i] - closes[i-1]) / closes[i-1] for i in range(len(closes)-n, len(closes))]
    if len(rets) < 12: return 0
    m = sum(rets) / len(rets)
    num = sum((rets[i] - m) * (rets[i-1] - m) for i in range(1, len(rets)))
    den = sum((r - m) ** 2 for r in rets)
    return num / den if den > 0 else 0
def entropi_arah(closes, n=24):
    rets = [(closes[i] - closes[i-1]) / closes[i-1] for i in range(len(closes)-n, len(closes))]
    naik = sum(1 for r in rets if r > 0)
    p = naik / len(rets) if rets else 0.5
    if p in (0, 1): return 0
    return -(p * math.log2(p) + (1-p) * math.log2(1-p))

soal = []
for l in open(PANEN):
    r = json.loads(l)
    e = r['e']
    base = e['simbol'].replace('USDT', '')
    T = r['T']; entry = e.get('entry'); arah = e.get('arah')
    if not entry or not arah: continue
    c = k1h(base)
    if len(c) < 60: continue
    idx = None
    for i, row in enumerate(c):
        if row[0] <= T < row[6]: idx = i; break
    if idx is None or idx < 60: continue
    closes = [float(x[4]) for x in c[max(0, idx-60):idx+1]]  # sampai candle berjalan (blind: ≤ T)
    # vonis resmi: close candle terakhir dengan closeTime ≤ T+24j
    batas = T + 24*3600*1000
    exit_c = None
    for row in c:
        if row[6] <= batas: exit_c = row
        else: break
    if not exit_c: continue
    exitp = float(exit_c[4])
    d = 1 if arah == 'BUY' else -1
    net = d * (exitp / entry - 1) - 0.002
    soal.append({
        'simbol': base, 'arah': arah, 'kelas': r.get('kelas', 'A'), 'net': net,
        'benar': net > 0,
        'z': z_sma(closes), 'drift': drift_ols(closes), 'ak': autokorr(closes), 'en': entropi_arah(closes),
        'key': e.get('keyakinan') or 0,
    })

print(f'soal terukur: {len(soal)}')

def pivot(keyfn, label, buckets_order=None):
    m = defaultdict(lambda: [0, 0, 0.0])
    for s in soal:
        k = keyfn(s)
        m[k][0] += 1
        if s['benar']: m[k][1] += 1
        m[k][2] += s['net']
    rows = [(k, v[0], round(100*v[1]/v[0], 1), round(100*v[2], 1)) for k, v in m.items()]
    if buckets_order: rows.sort(key=lambda r: buckets_order.index(r[0]) if r[0] in buckets_order else 99)
    print(f'\n== {label} ==')
    print(f'{"bucket":<22}{"n":>6}{"ak%":>7}{"net%":>9}')
    for k, n, ak, net in rows: print(f'{str(k):<22}{n:>6}{ak:>7}{net:>9}')

def bucket_z(z): return 'z<=-1.5' if z <= -1.5 else '-1.5<z<=-0.5' if z <= -0.5 else '-0.5<z<0.5' if z < 0.5 else '0.5<=z<1.5' if z < 1.5 else 'z>=1.5'
def bucket_d(d): return 'drift<=-5%' if d <= -5 else '-5<d<0' if d < 0 else '0<=d<5' if d < 5 else 'd>=5%'
def bucket_ak(a): return 'ak<=-0.15' if a <= -0.15 else '-0.15<ak<0.15' if a < 0.15 else 'ak>=0.15'
def bucket_en(e): return 'en<=0.85(pita-sempit)' if e <= 0.85 else 'en>0.85'
def bucket_key(k): return '<40' if k < 40 else '40-54' if k < 55 else '55-69' if k < 70 else '>=70'

pivot(lambda s: bucket_z(s['z']), 'z-SMA20 × SEMUA')
pivot(lambda s: f"{s['arah']}|{bucket_z(s['z'])}", 'ARAH × z-SMA20')
pivot(lambda s: f"{s['arah']}|{bucket_d(s['drift'])}", 'ARAH × drift-OLS-24j')
pivot(lambda s: f"{s['arah']}|{bucket_ak(s['ak'])}", 'ARAH × autokorelasi')
pivot(lambda s: f"{s['arah']}|{bucket_en(s['en'])}", 'ARAH × entropi')
pivot(lambda s: f"{s['arah']}|{bucket_key(s['key'])}", 'ARAH × keyakinan')
pivot(lambda s: f"{s['arah']}|{bucket_z(s['z'])}|{bucket_d(s['drift'])}", 'ARAH × z × drift (cari organ)')

# kandidat aturan organ: SELL hanya saat z tinggi & drift negatif, dsb.
aturan = [
  ('SELL semua (baseline)', lambda s: s['arah'] == 'SELL'),
  ('SELL z>=0.5', lambda s: s['arah'] == 'SELL' and s['z'] >= 0.5),
  ('SELL z>=0.5 & drift<=0', lambda s: s['arah'] == 'SELL' and s['z'] >= 0.5 and s['drift'] <= 0),
  ('SELL drift<=-5%', lambda s: s['arah'] == 'SELL' and s['drift'] <= -5),
  ('BUY semua (baseline)', lambda s: s['arah'] == 'BUY'),
  ('BUY z<=0.5 (anti-chase)', lambda s: s['arah'] == 'BUY' and s['z'] <= 0.5),
  ('BUY drift>=0', lambda s: s['arah'] == 'BUY' and s['drift'] >= 0),
  ('BUY key>=70', lambda s: s['arah'] == 'BUY' and s['key'] >= 70),
  ('SELL key>=70', lambda s: s['arah'] == 'SELL' and s['key'] >= 70),
  ('SEMUA: key 55-69 tanpa-drift-searah', lambda s: 55 <= s['key'] < 70 and ((s['arah']=='BUY' and s['drift']<0) or (s['arah']=='SELL' and s['drift']>0))),
]
print('\n== UJI ATURAN ORGAN ==')
print(f'{"aturan":<42}{"n":>6}{"ak%":>7}{"net%":>9}')
for nama, fn in aturan:
    sub = [s for s in soal if fn(s)]
    if not sub: print(f'{nama:<42}{0:>6}'); continue
    ak = 100 * sum(1 for s in sub if s['benar']) / len(sub)
    net = 100 * sum(s['net'] for s in sub)
    print(f'{nama:<42}{len(sub):>6}{ak:>7.1f}{net:>9.1f}')

json.dump(soal, open('/home/z/my-project/scripts/ujian-buta/soal-terukur.json', 'w'))
print('\nsimpan → soal-terukur.json')
