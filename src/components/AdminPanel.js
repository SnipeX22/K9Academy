import { useState, useEffect, useCallback } from "react";
import { sheets, fb } from "../lib/firebase";
import { COURSES } from "../data/courses";

const CMAP = Object.fromEntries([...COURSES.map(c=>[c.id,c.title]),["bundle","Full K9 Academy"]]);

function CustomersTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sheets.getAllPurchases().then(data => { setRows(data); setLoading(false); });
  }, []);

  // group by email
  const byUser = rows.reduce((acc, r) => {
    const key = r.email || r.uid;
    if (!acc[key]) acc[key] = { email: key, courses: [], date: r.date };
    acc[key].courses.push(r.courseId);
    return acc;
  }, {});
  const users = Object.values(byUser);

  if (loading) return <div style={{padding:40,textAlign:"center",color:"var(--muted)"}}>Loading from Google Sheets...</div>;
  if (!users.length) return <div className="empty">No purchases yet. Your customers will appear here automatically.</div>;

  return (
    <>
      <div style={{marginBottom:12,fontSize:13,color:"var(--muted)"}}>{users.length} customer{users.length!==1?"s":""} · {rows.length} total sale{rows.length!==1?"s":""}</div>
      <div style={{border:"1px solid var(--border)",background:"var(--card)"}}>
        <table className="atable">
          <thead><tr><th>Email</th><th>Courses Owned</th><th>Date</th></tr></thead>
          <tbody>
            {users.map((u,i) => (
              <tr key={i}>
                <td>{u.email}</td>
                <td>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {u.courses.map((id,j) => (
                      <span key={j} style={{fontSize:11,padding:"2px 8px",background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)",color:"var(--tan)"}}>
                        {CMAP[id]||id}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{u.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DiscountTab() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code:"", percent_off:"10", max_uses:"" });
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    sheets.getAllCodes().then(d => { setCodes(d); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create() {
    setErr(""); setOk("");
    if (!form.code.trim()) { setErr("Enter a code."); return; }
    if (!form.percent_off || +form.percent_off < 1 || +form.percent_off > 100) { setErr("Discount must be 1–100%."); return; }
    setSaving(true);
    await sheets.createCode({ code: form.code, percent_off: +form.percent_off, max_uses: form.max_uses ? +form.max_uses : null });
    setOk(`"${form.code.toUpperCase()}" created!`);
    setForm({ code:"", percent_off:"10", max_uses:"" });
    load();
    setSaving(false);
  }

  async function toggle(c) {
    await sheets.toggleCode(c.id, !c.active);
    load();
  }

  return (
    <>
      <div className="acard" style={{marginBottom:22}}>
        <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,marginBottom:18}}>Create Discount Code</h3>
        {err && <div className="ferr">{err}</div>}
        {ok && <div className="fok">{ok}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 100px 120px auto",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div className="fg" style={{margin:0}}>
            <label>Code</label>
            <input className="fi" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="SAVE20" />
          </div>
          <div className="fg" style={{margin:0}}>
            <label>% Off</label>
            <input className="fi" type="number" min="1" max="100" value={form.percent_off} onChange={e=>setForm(f=>({...f,percent_off:e.target.value}))} />
          </div>
          <div className="fg" style={{margin:0}}>
            <label>Max Uses</label>
            <input className="fi" type="number" min="1" value={form.max_uses} onChange={e=>setForm(f=>({...f,max_uses:e.target.value}))} placeholder="Unlimited" />
          </div>
          <button className="btn btn-gold btn-sm" onClick={create} disabled={saving}>{saving?"...":"Create"}</button>
        </div>
      </div>

      {loading ? <div style={{padding:40,textAlign:"center",color:"var(--muted)"}}>Loading...</div>
      : !codes.length ? <div className="empty">No codes yet. Create one above.</div>
      : (
        <div style={{border:"1px solid var(--border)",background:"var(--card)"}}>
          <table className="atable">
            <thead><tr><th>Code</th><th>Discount</th><th>Uses</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id}>
                  <td style={{fontFamily:"monospace",color:"var(--tan)",letterSpacing:"0.1em"}}>{c.code}</td>
                  <td>{c.percent_off}% off</td>
                  <td>{c.uses}{c.max_uses?` / ${c.max_uses}`:" / ∞"}</td>
                  <td><span className={`pill ${c.active?"pill-on":"pill-off"}`}>{c.active?"Active":"Inactive"}</span></td>
                  <td><button className={`btn btn-xs ${c.active?"btn-ghost":"btn-outline"}`} onClick={()=>toggle(c)}>{c.active?"Deactivate":"Activate"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function StatsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { sheets.getAllPurchases().then(d=>{ setRows(d); setLoading(false); }); }, []);

  const allC = [...COURSES.map(c=>({id:c.id,title:c.title,price:c.price})),{id:"bundle",title:"Full K9 Academy",price:20}];
  const counts = allC.map(c=>({...c, count: rows.filter(r=>r.courseId===c.id).length}));
  const revenue = counts.reduce((s,c)=>s+c.count*c.price, 0);

  if (loading) return <div style={{padding:40,textAlign:"center",color:"var(--muted)"}}>Loading...</div>;

  return (
    <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:2,marginBottom:20}}>
        {[["Total Sales", rows.length], ["Est. Revenue", `$${revenue}`], ["Courses", allC.length]].map(([lbl,val])=>(
          <div key={lbl} className="acard" style={{textAlign:"center",padding:20}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:44,color:"var(--tan)"}}>{val}</div>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)"}}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{border:"1px solid var(--border)",background:"var(--card)"}}>
        <table className="atable">
          <thead><tr><th>Course</th><th>Price</th><th>Sales</th><th>Revenue</th></tr></thead>
          <tbody>
            {counts.sort((a,b)=>b.count-a.count).map(c=>(
              <tr key={c.id}>
                <td>{c.title}</td><td>${c.price}</td><td>{c.count}</td>
                <td style={{color:"var(--tan)"}}>${c.count*c.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminPanel({ onBack }) {
  const [tab, setTab] = useState("customers");
  return (
    <div className="admin">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16}}>
        <h1>Admin <span style={{color:"var(--tan)"}}>Panel</span></h1>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {fb.isDemo() && <span style={{fontSize:11,color:"var(--rust)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Demo Mode</span>}
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back to Site</button>
        </div>
      </div>
      <div style={{fontSize:13,color:"var(--muted)",marginBottom:22,lineHeight:1.7}}>
        Customer data and discount codes are stored in your <strong style={{color:"var(--cream)"}}>Google Sheet</strong> — open it anytime to see everything directly.
      </div>
      <div className="atabs">
        {[["customers","Customers"],["discounts","Discount Codes"],["stats","Sales Stats"]].map(([id,lbl])=>(
          <button key={id} className={`atab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>
      {tab==="customers" && <CustomersTab />}
      {tab==="discounts" && <DiscountTab />}
      {tab==="stats" && <StatsTab />}
    </div>
  );
}
