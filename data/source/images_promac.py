import openpyxl,re,subprocess,json,html
def get(u): return subprocess.run(['curl','-sL','-m',40,u] if False else ['curl','-sL','-m','40',u],capture_output=True,text=True).stdout
ws=openpyxl.load_workbook('/Users/misterjin/Documents/one S Digital/Hardware site/supplier-catalogue.xlsx')['Products']
rows=[(i,r) for i,r in enumerate(ws.iter_rows(min_row=2,values_only=True),2) if r[0]=='Promac']
n=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
pages={}
for i,r in rows: pages.setdefault(r[8],[]).append((i,r))
res={};miss=[]
for u,rs in pages.items():
    t=get(u); pairs=[(html.unescape(html.unescape(a)),b) for b,a in re.findall(r'<img class="thumb-image"[^>]*?data-image="([^"]+)"[^>]*?alt="([^"]*)"',t)]
    print(u,len(rs),'products',len(pairs),'images')
    for i,r in rs:
        k=n(r[4]); hit=[b for a,b in pairs if n(a)==k] or [b for a,b in pairs if k and (k in n(a) or (n(a) and n(a) in k))]
        if hit: res[i]=hit[0]
        else: miss.append((r[4],[a for a,_ in pairs]))
print(len(res),'matched');
for m in miss[:40]: print('MISS',m)
json.dump(res,open('promac_found.json','w'))
