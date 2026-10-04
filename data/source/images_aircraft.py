import openpyxl,re,subprocess,json,html,urllib.parse
wb=openpyxl.load_workbook('/Users/misterjin/Documents/one S Digital/Hardware site/supplier-catalogue.xlsx')
ws=wb['Products']
urls={}
for r in ws.iter_rows(min_row=2,values_only=True):
    if r[0].startswith('Air') and r[8]: urls[r[8]]=r[5]
cats=sorted({u.rsplit('/',1)[0] for u in urls})
print(len(urls),len(cats))
found={}
for c in cats:
    p=1
    while True:
        out=subprocess.run(['curl','-sL',f'{c}?limit=200&page={p}'],capture_output=True,text=True).stdout
        n=0
        for m in re.finditer(r'<a href="([^"]+)" class="product-img[^"]*">(.*?)</a>',out,re.S):
            d=re.search(r'data-src="([^"]+)"',m.group(2))
            if d and m.group(1) not in found: found[m.group(1)]=html.unescape(d.group(1)); n+=1
        if n==0 or len(out)<1000: break
        p+=1
        if p>8: break
    print(c.rsplit('/',1)[1],len(found))
json.dump(found,open('air_found.json','w'))
print(sum(1 for u in urls if u in found),'of',len(urls))
