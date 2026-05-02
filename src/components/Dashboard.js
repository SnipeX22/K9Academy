import { COURSES, BUNDLE } from "../data/courses";

export default function Dashboard({ user, ownedIds, onBuy, onOpenCourse }) {
  const allOwned = ownedIds.includes("bundle");
  return (
    <div className="dash">
      <h1>My <span style={{color:"var(--tan)"}}>Courses</span></h1>
      <p className="dash-sub">Welcome back{user.email ? `, ${user.email}` : ""}. Click any owned course to open it.</p>

      {ownedIds.length === 0 && (
        <div className="empty" style={{marginBottom:32}}>
          You haven't purchased any courses yet.
          <br />
          <button className="btn btn-gold" style={{marginTop:18}} onClick={() => onBuy(null)}>Browse Courses</button>
        </div>
      )}

      <div className="grid" style={{marginBottom:32}}>
        {COURSES.map(c => {
          const owned = allOwned || ownedIds.includes(c.id);
          return (
            <div key={c.id} className={`dcard ${owned ? "" : "locked"}`} onClick={() => owned && onOpenCourse(c)}>
              <span className="ctag">{c.tag}</span>
              <div className="ctitle">{c.title}</div>
              <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginBottom:14}}>{c.tagline}</p>
              {owned
                ? <span className="owned-lbl">Owned — Click to Open →</span>
                : <>
                    <span className="locked-lbl">Not purchased</span>
                    <button className="btn btn-outline btn-sm" style={{marginTop:12,display:"block"}}
                      onClick={e => { e.stopPropagation(); onBuy(c.id); }}>
                      Get for ${c.price}
                    </button>
                  </>}
            </div>
          );
        })}
      </div>

      {!allOwned && (
        <div style={{border:"1px solid rgba(201,169,110,0.3)",background:"rgba(201,169,110,0.04)",padding:26,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"var(--rust)",marginBottom:6}}>Bundle Deal</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22}}>Get Everything — ${BUNDLE.price}</div>
            <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>All 4 courses + exclusive bonuses. Save ${BUNDLE.saves}.</div>
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => onBuy("bundle")}>Get the Full Academy</button>
        </div>
      )}
    </div>
  );
}
