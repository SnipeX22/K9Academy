import { COURSES, BUNDLE } from "../data/courses";

export default function HomePage({ onBuy, onScrollToCourses, onLegal }) {
  return (
    <>
      <section className="hero">
        <div className="badge">K9 Academy</div>
        <h1 className="h1">RAISE YOUR <span>DOG</span><br />THE RIGHT WAY</h1>
        <p className="hero-sub">Real-world courses from someone who's lived it — built for every dog owner, with dedicated insight for high-drive breeds.</p>
        <div className="hero-btns">
          <button className="btn btn-gold" onClick={() => onBuy("bundle")}>Get the Full Academy — ${BUNDLE.price}</button>
          <button className="btn btn-ghost" onClick={onScrollToCourses}>View Courses</button>
        </div>
      </section>

      <div style={{padding:"70px 24px",maxWidth:800,margin:"0 auto",textAlign:"center"}}>
        <div className="slabel">Who This Is For</div>
        <h2 className="stitle">Built For Every Dog Owner</h2>
        <p style={{fontSize:"clamp(15px,2vw,18px)",color:"var(--muted)",lineHeight:1.9}}>
          Every lesson comes from <strong style={{color:"var(--cream)"}}>real experience raising dogs from puppyhood</strong> — the chaos, the breakthroughs, and the structure that actually works. Practical guides, interactive checklists, and printable resources to make it easier.
        </p>
      </div>

      <div id="courses">
        <div className="section">
          <div className="slabel">Individual Courses</div>
          <h2 className="stitle">Pick What You Need</h2>
          <p className="ssub">Each course includes written guides, interactive checklists, and downloadable printables.</p>
          <div className="grid">
            {COURSES.filter(c => !c.bundleOnly).map(c => (
              <div key={c.id} className="ccard">
                <span className="ctag">{c.tag}</span>
                <div className="ctitle">{c.title}</div>
                <p className="cdesc">{c.description}</p>
                <ul className="cinc">{c.includes.map((it,i)=><li key={i}>{it}</li>)}</ul>
                <div className="cprice">
                  <span className="pbig">${c.price}</span>
                  <span className="plbl">one-time</span>
                </div>
                <button className="btn btn-outline" style={{width:"100%"}} onClick={()=>onBuy(c.id)}>Get This Course</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"0 24px 90px"}}>
        <div className="slabel" style={{marginBottom:14}}>Best Value</div>
        <div className="bwrap">
          <div className="btop">
            <div>
              <span style={{fontSize:9,letterSpacing:"0.28em",textTransform:"uppercase",color:"var(--rust)",display:"block",marginBottom:10}}>Complete Bundle</span>
              <h2>THE FULL<br /><em>K9 ACADEMY</em></h2>
            </div>
            <div className="bpricing">
              <div className="bwas">${BUNDLE.totalIfSeparate} if bought separately</div>
              <div className="bprice">${BUNDLE.price}</div>
              <div className="bsave">You save ${BUNDLE.saves}</div>
            </div>
          </div>
          <p style={{fontSize:15,color:"var(--muted)",lineHeight:1.8,maxWidth:540,marginBottom:28}}>
            Every course, every printable, every lesson — plus exclusive bonus content you won't find anywhere else.
          </p>
          <div className="bitems">
            {COURSES.filter(c => !c.bundleOnly).map(c=>(
              <div key={c.id} className="bitem"><strong>{c.title}</strong><span>{c.tagline}</span></div>
            ))}
            {BUNDLE.exclusive.map((e,i)=>(
              <div key={i} className="bitem"><span className="excl">Bundle Exclusive</span><strong>{e.title}</strong><span>{e.desc}</span></div>
            ))}
            <div className="bitem"><strong>All Printables</strong><span>Every PDF and tracker included.</span></div>
            <div className="bitem"><strong>Lifetime Access</strong><span>All future updates included.</span></div>
          </div>
          <button className="btn btn-gold" style={{display:"block",maxWidth:360,margin:"0 auto",width:"100%"}} onClick={()=>onBuy("bundle")}>
            Get the Full K9 Academy — ${BUNDLE.price}
          </button>
        </div>
      </div>

      <footer style={{borderTop:"1px solid var(--border)",padding:"32px 24px",textAlign:"center"}}>
        <div style={{fontSize:12,color:"var(--muted)",letterSpacing:"0.05em",marginBottom:14}}>
          K9 Academy · Built by a real dog owner, for every dog owner.
        </div>
        <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
          {[["refund","Refund & Fulfillment Policy"],["terms","Terms of Service"],["privacy","Privacy Policy"],["disclaimer","Disclaimer"]].map(([id,label])=>(
            <button key={id} onClick={()=>onLegal(id)}
              style={{background:"none",border:"none",color:"var(--muted)",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em",textDecoration:"underline",padding:0,transition:"color .2s"}}
              onMouseOver={e=>e.currentTarget.style.color="var(--tan)"}
              onMouseOut={e=>e.currentTarget.style.color="var(--muted)"}>
              {label}
            </button>
          ))}
        </div>
      </footer>
    </>
  );
}
