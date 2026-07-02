import { useState, useEffect, useCallback } from "react";
import { sheets, fb } from "../lib/firebase";
import { COURSES } from "../data/courses";

const CMAP = Object.fromEntries([...COURSES.map(c=>[c.id,c.title]),["bundle","Full K9 Academy"]]);

// ── GA4 Property ID — set this to your GA4 Property ID
// Find it: analytics.google.com → Admin (gear icon) → Property Settings → Property ID
// It looks like: 123456789 (numbers only, NOT the G-XXXXXXX measurement ID)
const GA4_PROPERTY_ID = process.env.REACT_APP_GA4_PROPERTY_ID || "";

function CustomersTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sheets.getAllPurchases().then(data => { setRows(data); setLoading(false); });
  }, []);

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

  const allC = [...COURSES.filter(c=>!c.bundleOnly).map(c=>({id:c.id,title:c.title,price:c.price})),{id:"bundle",title:"Full K9 Academy",price:20}];
  const counts = allC.map(c=>({...c, count: rows.filter(r=>r.courseId===c.id).length}));
  const revenue = counts.reduce((s,c)=>s+c.count*c.price, 0);

  if (loading) return <div style={{padding:40,textAlign:"center",color:"var(--muted)"}}>Loading...</div>;

  return (
    <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:2,marginBottom:20}}>
        {[["Total Sales", rows.length], ["Est. Revenue", `$${revenue}`], ["Customers", new Set(rows.map(r=>r.email)).size]].map(([lbl,val])=>(
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

// ── STAT CARD ──────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="acard" style={{textAlign:"center",padding:"22px 16px"}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:color||"var(--tan)",lineHeight:1}}>{value}</div>
      <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)",marginTop:6}}>{label}</div>
      {sub && <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{sub}</div>}
    </div>
  );
}

// ── MINI BAR CHART ─────────────────────────────────────────────
function BarChart({ data, label }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tan)",marginBottom:12}}>{label}</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{fontSize:9,color:"var(--muted)"}}>{d.value||""}</div>
            <div style={{width:"100%",background:"var(--tan)",opacity:0.85,borderRadius:2,height:`${Math.max((d.value/max)*64,d.value>0?4:0)}px`,transition:"height .3s"}}/>
            <div style={{fontSize:8,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",maxWidth:28,textOverflow:"ellipsis"}}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TRAFFIC TAB ────────────────────────────────────────────────
function TrafficTab() {
  const [gaData, setGaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [range, setRange] = useState("28daysAgo");
  const propId = GA4_PROPERTY_ID;

  const rangeLabels = {
    "7daysAgo": "Last 7 days",
    "28daysAgo": "Last 28 days",
    "90daysAgo": "Last 90 days",
  };

  async function fetchGA() {
    if (!token) { setError("Paste your access token below to load analytics."); return; }
    if (!propId) { setError("Add your GA4 Property ID as REACT_APP_GA4_PROPERTY_ID in GitHub Secrets."); return; }
    setLoading(true); setError("");

    try {
      // Fetch overview metrics
      const overviewRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRanges: [{ startDate: range, endDate: "today" }],
            metrics: [
              { name: "activeUsers" },
              { name: "sessions" },
              { name: "screenPageViews" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
              { name: "newUsers" },
            ],
          })
        }
      );
      const overview = await overviewRes.json();
      if (overview.error) { setError("GA Error: " + overview.error.message); setLoading(false); return; }

      // Fetch daily sessions for chart
      const dailyRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRanges: [{ startDate: range, endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
            limit: 30,
          })
        }
      );
      const daily = await dailyRes.json();

      // Fetch top traffic sources
      const sourcesRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRanges: [{ startDate: range, endDate: "today" }],
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 6,
          })
        }
      );
      const sources = await sourcesRes.json();

      // Fetch top pages
      const pagesRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRanges: [{ startDate: range, endDate: "today" }],
            dimensions: [{ name: "pageTitle" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 5,
          })
        }
      );
      const pages = await pagesRes.json();

      // Fetch devices
      const devicesRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRanges: [{ startDate: range, endDate: "today" }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          })
        }
      );
      const devices = await devicesRes.json();

      setGaData({ overview, daily, sources, pages, devices });
    } catch (e) {
      setError("Network error — check your token and try again.");
    }
    setLoading(false);
  }

  // Parse helpers
  const getMetric = (report, index) => {
    try { return report.rows?.[0]?.metricValues?.[index]?.value || "0"; } catch { return "0"; }
  };

  const fmtDuration = (seconds) => {
    const s = Math.round(parseFloat(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
  };

  const fmtPct = (val) => `${(parseFloat(val)*100).toFixed(1)}%`;

  const dailyChartData = gaData?.daily?.rows?.map(r => ({
    label: r.dimensionValues[0].value.slice(4), // MMDD
    value: parseInt(r.metricValues[0].value)
  })) || [];

  if (!propId) return (
    <div className="acard">
      <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,marginBottom:12}}>Setup Required</h3>
      <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.8,marginBottom:16}}>
        To enable analytics in your admin panel, add your GA4 Property ID as a GitHub Secret:
      </p>
      <ol style={{fontSize:13,color:"var(--muted)",lineHeight:2,paddingLeft:20}}>
        <li>Go to <strong style={{color:"var(--cream)"}}>analytics.google.com</strong></li>
        <li>Click the <strong style={{color:"var(--cream)"}}>gear icon</strong> (Admin) at the bottom left</li>
        <li>Click <strong style={{color:"var(--cream)"}}>Property Settings</strong></li>
        <li>Copy the <strong style={{color:"var(--cream)"}}>Property ID</strong> (numbers only, e.g. 123456789)</li>
        <li>Go to your GitHub repo → <strong style={{color:"var(--cream)"}}>Settings → Secrets → Actions</strong></li>
        <li>Add secret: <code style={{color:"var(--tan)"}}>REACT_APP_GA4_PROPERTY_ID</code> = your Property ID</li>
        <li>Trigger a new build (edit any file and commit)</li>
      </ol>
    </div>
  );

  return (
    <div>
      {/* Controls */}
      <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)",marginBottom:6}}>Date Range</div>
          <select className="fi" value={range} onChange={e=>setRange(e.target.value)} style={{background:"#1a1a1a",border:"1px solid var(--border)",color:"var(--cream)",padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,width:"100%"}}>
            {Object.entries(rangeLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{flex:2,minWidth:200}}>
          <div style={{fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--muted)",marginBottom:6}}>
            Access Token — <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" style={{color:"var(--tan)"}}>Get one here</a>
          </div>
          <input className="fi" type="password" value={token} onChange={e=>setToken(e.target.value)} placeholder="Paste your OAuth2 access token" style={{fontSize:12}} />
        </div>
        <button className="btn btn-gold btn-sm" onClick={fetchGA} disabled={loading} style={{flexShrink:0}}>
          {loading ? "Loading..." : "Load Analytics"}
        </button>
      </div>

      {/* Token instructions */}
      {!gaData && !loading && (
        <div className="acard" style={{marginBottom:20,borderColor:"rgba(201,169,110,0.3)"}}>
          <div style={{fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--tan)",marginBottom:10}}>How to get your Access Token</div>
          <ol style={{fontSize:13,color:"var(--muted)",lineHeight:2,paddingLeft:20}}>
            <li>Click the <strong style={{color:"var(--cream)"}}>Get one here</strong> link above</li>
            <li>In Step 1, find and select <strong style={{color:"var(--cream)"}}>Google Analytics Data API v1</strong></li>
            <li>Check <strong style={{color:"var(--cream)"}}>https://www.googleapis.com/auth/analytics.readonly</strong></li>
            <li>Click <strong style={{color:"var(--cream)"}}>Authorize APIs</strong> and sign in with your Google account</li>
            <li>Click <strong style={{color:"var(--cream)"}}>Exchange authorization code for tokens</strong></li>
            <li>Copy the <strong style={{color:"var(--cream)"}}>Access token</strong> and paste it above</li>
          </ol>
          <div style={{fontSize:12,color:"var(--muted)",marginTop:10,padding:"8px 12px",border:"1px solid var(--border)",background:"rgba(0,0,0,0.2)"}}>
            Note: Access tokens expire after 1 hour. You'll need to get a new one each time you visit this page.
          </div>
        </div>
      )}

      {error && <div className="ferr" style={{marginBottom:16}}>{error}</div>}

      {/* Analytics Data */}
      {gaData && (
        <>
          {/* Overview stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:2,marginBottom:20}}>
            <StatCard label="Users" value={parseInt(getMetric(gaData.overview,0)).toLocaleString()} />
            <StatCard label="New Users" value={parseInt(getMetric(gaData.overview,5)).toLocaleString()} color="var(--success)" />
            <StatCard label="Sessions" value={parseInt(getMetric(gaData.overview,1)).toLocaleString()} />
            <StatCard label="Page Views" value={parseInt(getMetric(gaData.overview,2)).toLocaleString()} />
            <StatCard label="Avg Session" value={fmtDuration(getMetric(gaData.overview,3))} />
            <StatCard label="Bounce Rate" value={fmtPct(getMetric(gaData.overview,4))} color={parseFloat(getMetric(gaData.overview,4)) > 0.7 ? "var(--danger)" : "var(--tan)"} />
          </div>

          {/* Daily sessions chart */}
          {dailyChartData.length > 0 && (
            <div className="acard" style={{marginBottom:16}}>
              <BarChart data={dailyChartData} label="Daily Sessions" />
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2}}>
            {/* Traffic sources */}
            {gaData.sources?.rows?.length > 0 && (
              <div className="acard">
                <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tan)",marginBottom:14}}>Traffic Sources</div>
                {gaData.sources.rows.map((r,i)=>{
                  const total = gaData.sources.rows.reduce((s,row)=>s+parseInt(row.metricValues[0].value),0);
                  const val = parseInt(r.metricValues[0].value);
                  const pct = total > 0 ? Math.round((val/total)*100) : 0;
                  return (
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                        <span style={{color:"var(--cream)"}}>{r.dimensionValues[0].value}</span>
                        <span style={{color:"var(--muted)"}}>{val} ({pct}%)</span>
                      </div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                        <div style={{height:"100%",width:`${pct}%`,background:"var(--tan)",borderRadius:2}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Devices */}
            {gaData.devices?.rows?.length > 0 && (
              <div className="acard">
                <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tan)",marginBottom:14}}>Devices</div>
                {gaData.devices.rows.map((r,i)=>{
                  const total = gaData.devices.rows.reduce((s,row)=>s+parseInt(row.metricValues[0].value),0);
                  const val = parseInt(r.metricValues[0].value);
                  const pct = total > 0 ? Math.round((val/total)*100) : 0;
                  const icons = { mobile:"📱", desktop:"🖥", tablet:"📱" };
                  return (
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                        <span style={{color:"var(--cream)",textTransform:"capitalize"}}>{r.dimensionValues[0].value}</span>
                        <span style={{color:"var(--muted)"}}>{val} ({pct}%)</span>
                      </div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                        <div style={{height:"100%",width:`${pct}%`,background:"var(--rust)",borderRadius:2}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top pages */}
          {gaData.pages?.rows?.length > 0 && (
            <div style={{border:"1px solid var(--border)",background:"var(--card)",marginTop:2}}>
              <table className="atable">
                <thead><tr><th>Top Pages</th><th>Views</th></tr></thead>
                <tbody>
                  {gaData.pages.rows.map((r,i)=>(
                    <tr key={i}>
                      <td>{r.dimensionValues[0].value}</td>
                      <td>{parseInt(r.metricValues[0].value).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{fontSize:11,color:"var(--muted)",marginTop:16,textAlign:"right"}}>
            Showing {rangeLabels[range]} · <button onClick={fetchGA} style={{background:"none",border:"none",color:"var(--tan)",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>Refresh</button>
          </div>
        </>
      )}
    </div>
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
        {[["customers","Customers"],["discounts","Discount Codes"],["stats","Sales Stats"],["traffic","Traffic"]].map(([id,lbl])=>(
          <button key={id} className={`atab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>
      {tab==="customers" && <CustomersTab />}
      {tab==="discounts" && <DiscountTab />}
      {tab==="stats" && <StatsTab />}
      {tab==="traffic" && <TrafficTab />}
    </div>
  );
}
