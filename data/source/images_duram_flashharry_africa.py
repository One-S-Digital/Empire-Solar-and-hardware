import openpyxl,re,subprocess,json,html
def get(u): return subprocess.run(['curl','-sL',u],capture_output=True,text=True).stdout
ws=openpyxl.load_workbook('/Users/misterjin/Documents/one S Digital/Hardware site/supplier-catalogue.xlsx')['Products']
rows=[(i,r) for i,r in enumerate(ws.iter_rows(min_row=2,values_only=True),2)]
res={}  # row -> url
n=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
# Duram
d=json.load(open('duram.json'))
dm={p['permalink'].rstrip('/'):p['images'][0]['src'] for p in d if p['images']}
for i,r in rows:
    if r[0]=='Duram' and r[9] is None:
        u=dm.get((r[8] or '').rstrip('/'))
        if u: res[i]=u
print('duram',sum(1 for i,r in rows if r[0]=='Duram' and i in res))
# Flash Harry
h=get('https://flashharry.co.za/products')
fm={}
for m in re.finditer(r':product="([^"]+)"',h):
    try: j=json.loads(html.unescape(m.group(1)))
    except Exception: continue
    fm[j['slug']]=j['id']
for i,r in rows:
    if r[0]=='Flash Harry' and r[9] is None:
        s=(r[8] or '').rstrip('/').rsplit('/',1)[-1]
        if s in fm: res[i]=f'https://flashharry.co.za/products/{fm[s]}.png'
print('fh',sum(1 for i,r in rows if r[0]=='Flash Harry' and i in res))
# Africa
pages={}
for i,r in rows:
    if r[0]=='Africa Paints': pages.setdefault(r[8],[]).append((i,r))
for u,rs in pages.items():
    t=get(u); pairs=[]
    for m in re.finditer(r'<img\s+class="img-fluid" src="(images/(?!colours|logo)[^"]+)".*?<h2 style="background[^>]*>([^<]*)</h2>',t,re.S):
        pairs.append((n(m.group(2)),m.group(1)))
    base=u.rsplit('/',1)[0]+'/'
    for i,r in rs:
        k=n(r[4]); hit=[p for nm,p in pairs if nm==k or k in nm or nm in k]
        if not hit and len(pairs)==1 and len(rs)==1: hit=[pairs[0][1]]
        if hit: res[i]=base+hit[0].replace(' ','%20')
        else: print('AP unmatched',r[4],[p[0] for p in pairs])
print('ap',sum(1 for i,r in rows if r[0]=='Africa Paints' and i in res))
json.dump(res,open('small_found.json','w'))
