const fs=require("fs");const path=require("path");
function walk(d,a=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,a);else if(/\.tsx?$/.test(e.name))a.push(p);}return a;}
const root=path.join("C:","projects","WorkMitra_Enterprise_v2","src");
const rows=[];
for(const f of walk(root)){const n=fs.readFileSync(f,"utf8").split(/\r?\n/).length;if(n>300)rows.push({f,n});}
rows.sort((a,b)=>b.n-a.n);
console.log("OVER300 "+rows.length);
rows.slice(0,10).forEach(r=>console.log(r.n+" "+r.f.replace(/\\/g,"/")));
