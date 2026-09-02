const express=require("express"),fs=require("fs"),path=require("path");
const app=express(),PORT=3000,DB=path.join(__dirname,"data.json");
app.use(express.json({limit:"10mb"})); app.use(express.static(path.join(__dirname,"public")));
function db(){return JSON.parse(fs.readFileSync(DB,"utf8"))}
function save(x){fs.writeFileSync(DB,JSON.stringify(x,null,2))}
app.get("/api/db",(q,s)=>s.json(db()));
app.post("/api/settings",(q,s)=>{let d=db();d.settings={...d.settings,...q.body};save(d);s.json(d.settings)});
app.post("/api/categories",(q,s)=>{let d=db(),n=String(q.body.name||"").trim();if(n&&!d.categories.includes(n))d.categories.push(n);save(d);s.json(d.categories)});
app.delete("/api/categories/:name",(q,s)=>{let d=db(),n=decodeURIComponent(q.params.name);d.categories=d.categories.filter(x=>x!==n);d.products=d.products.map(p=>p.category===n?{...p,category:"عام"}:p);save(d);s.json(d.categories)});
app.post("/api/products",(q,s)=>{let d=db(),p=q.body;p.id=Date.now().toString();p.qty=Number(p.qty||0);p.price=Number(p.price||0);p.salePrice=Number(p.salePrice||p.price);p.discount=p.price>0?Math.max(0,Math.round((1-p.salePrice/p.price)*100)):0;p.category=p.category||"عام";d.products.push(p);save(d);s.json(p)});
app.put("/api/products/:id",(q,s)=>{let d=db(),i=d.products.findIndex(p=>p.id===q.params.id);if(i<0)return s.status(404).end();let p={...d.products[i],...q.body};p.price=Number(p.price||0);p.salePrice=Number(p.salePrice||p.price);p.qty=Number(p.qty||0);p.discount=p.price>0?Math.max(0,Math.round((1-p.salePrice/p.price)*100)):0;d.products[i]=p;save(d);s.json(p)});
app.delete("/api/products/:id",(q,s)=>{let d=db();d.products=d.products.filter(p=>p.id!==q.params.id);save(d);s.json({ok:true})});
app.post("/api/orders",(q,s)=>{let d=db(),o=q.body;o.id="ORD-"+Date.now();o.status="جديد";o.createdAt=new Date().toISOString();d.orders.push(o);save(d);s.json(o)});
app.get("/api/orders",(q,s)=>s.json(db().orders));
app.patch("/api/orders/:id",(q,s)=>{let d=db(),o=d.orders.find(x=>x.id===q.params.id);if(!o)return s.status(404).end();o.status=q.body.status||o.status;save(d);s.json(o)});
app.listen(PORT,"0.0.0.0",()=>console.log("MY STORE الجديد يعمل الآن: http://127.0.0.1:"+PORT));
