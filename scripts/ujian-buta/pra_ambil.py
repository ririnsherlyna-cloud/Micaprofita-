#!/usr/bin/env python3
# UJIAN-BUTA-100 — pra-ambil cache data REAL per koin pool.
# 1h klines (sejak 2026-06-01), 1d klines (sejak 2026-03-01), funding history,
# OI-hist / LSR-posisi / taker-ratio (30 hari terakhir), Fear&Greed penuh.
# Semua disimpan JSON di cache_dir agar runs beku tanpa jaringan (anti-bocor).
import json, os, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

CACHE = sys.argv[1] if len(sys.argv) > 1 else '/tmp/ujibuta/cache'
POOL = (sys.argv[2] if len(sys.argv) > 2 else '').split(',') if len(sys.argv) > 2 else [
 'BTC','ETH','SOL','BNB','XRP','DOGE','ADA','AVAX','LINK','TRX','DOT','TON','NEAR','APT','ARB','OP',
 'SUI','PEPE','WIF','TIA','INJ','FIL','LTC','ATOM','ETC','XLM','HBAR','ICP','RENDER','FET','AAVE','UNI',
 'SEI','ORDI','JUP','ENA','W','AR','GRT','ALGO','VET','THETA','SAND','AXS','IMX','GALA','CRV','MKR',
 'LDO','DYDX','RUNE','PENDLE','JTO','PYTH','STRK','ALT','MANTA','ETHFI','ONDO','BLUR','ENS','GNO','SNX',
 'COMP','ZRX','1INCH','BAT','ANKR','BAND','BEL','CELR','CFX','CHZ','CKB','COTI','DASH','DENT','DGB',
 'DODO','ENJ','FLOW','GAS','GMX','HIVE','HOT','IOTA','KAVA','KNC','KSM','LPT','LRC','MANA','MASK',
 'NKN','NMR','OGN','ONE','ONT','PERP','QTUM','RSR','RVN','SKL','SLP','SUSHI','STORJ','TLM','TRB','TRU',
 'UMA','WAVES','WOO','YFI','ZEC','ZIL','BONK','FLOKI','MEME','PORTAL','PIXEL','DYM','PDA','GLM','SC',
]
T0_1H = 1780272000000   # 2026-06-01T00:00Z
T0_1D = 1772150400000   # 2026-03-01T00:00Z
T0_30D = int((time.time() - 28*86400) * 1000)
NOW = int(time.time() * 1000)

os.makedirs(CACHE, exist_ok=True)
for d in ['1h','1d','fund','oi','lsr','taker']:
    os.makedirs(os.path.join(CACHE, d), exist_ok=True)

def get(url, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'ujian-buta/1.0'})
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read())
        except Exception as e:
            last = e
            time.sleep(1.5 * (i + 1))
    raise last

def klines_spot(sym, interval, t0, limit=1000):
    out, start = [], t0
    while True:
        q = urllib.parse.urlencode({'symbol': sym, 'interval': interval, 'startTime': start, 'limit': limit})
        rows = get(f'https://api.binance.com/api/v3/klines?{q}')
        if not rows: break
        out += rows
        if len(rows) < limit: break
        start = rows[-1][6] + 1
        if start >= NOW: break
        time.sleep(0.25)
    return out

def fapi(path, params):
    q = urllib.parse.urlencode(params)
    return get(f'https://fapi.binance.com{path}?{q}')

def ambil_1(sym):
    try:
        k1h = klines_spot(f'{sym}USDT', '1h', T0_1H)
        json.dump(k1h, open(os.path.join(CACHE,'1h',f'{sym}.json'),'w'))
    except Exception as e: print(f'{sym} 1h GAGAL: {e}', flush=True); return sym
    try:
        json.dump(klines_spot(f'{sym}USDT', '1d', T0_1D), open(os.path.join(CACHE,'1d',f'{sym}.json'),'w'))
    except Exception as e: print(f'{sym} 1d GAGAL: {e}', flush=True)
    try:
        json.dump(fapi('/fapi/v1/fundingRate', {'symbol': f'{sym}USDT', 'startTime': T0_1H, 'endTime': NOW, 'limit': 1000}), open(os.path.join(CACHE,'fund',f'{sym}.json'),'w'))
    except Exception as e: print(f'{sym} fund GAGAL: {e}', flush=True)
    for nama, jalur in [('oi','/futures/data/openInterestHist'), ('lsr','/futures/data/topLongShortPositionRatio'), ('taker','/futures/data/takerlongshortRatio')]:
        try:
            rows = []
            for a, b in [(T0_30D, T0_30D + 15*86400000), (T0_30D + 15*86400000, NOW)]:
                rows += fapi(jalur, {'symbol': f'{sym}USDT', 'period': '1h', 'startTime': a, 'endTime': b, 'limit': 500})
                time.sleep(0.2)
            json.dump(rows, open(os.path.join(CACHE,nama,f'{sym}.json'),'w'))
        except Exception as e: print(f'{sym} {nama} GAGAL: {e}', flush=True)
    print(f'{sym} OK 1h={len(k1h)}', flush=True)
    return None

gagal = []
with ThreadPoolExecutor(max_workers=4) as ex:
    for r in ex.map(ambil_1, POOL):
        if r: gagal.append(r)

fng = get('https://api.alternative.me/fng/?limit=0')
json.dump(fng, open(os.path.join(CACHE,'fng.json'),'w'))
print(f'FNG OK {len(fng.get("data",[]))} hari')
print(f'SELESAI — pool {len(POOL)} — gagal: {gagal}')
