import { useState } from "react";
import { sheets, fb } from "../lib/firebase";
import { COURSES, BUNDLE } from "../data/courses";

const STRIPE = {
  puppy:     process.env.REACT_APP_STRIPE_PUPPY,
  engage:    process.env.REACT_APP_STRIPE_ENGAGE,
  obedience: process.env.REACT_APP_STRIPE_OBEDIENCE,
  know:      process.env.REACT_APP_STRIPE_KNOW,
  bundle:    process.env.REACT_APP_STRIPE_BUNDLE,
};

export default function PurchaseModal({ courseId, user, onClose, onSimulatePurchase }) {
  const course = courseId === "bundle" ? null : COURSES.find(c => c.id === courseId);
  const basePrice = course ? course.price : BUNDLE.price;
  const title = course ? course.title : BUNDLE.title;

  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [codeErr, setCodeErr] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const isDemo = fb.isDemo() || !STRIPE[courseId];

  const finalPrice = applied
    ? Math.max(0, Math.round(basePrice * (1 - applied.percent_off / 100) * 100) / 100)
    : basePrice;

  async function applyCode() {
    if (!code.trim()) return;
    setCodeErr(""); setCodeLoading(true);
    const result = await sheets.validateCode(code.trim());
    if (!result.valid) {
      const msgs = { inactive: "This code is no longer active.", maxed: "This code has reached its limit.", notfound: "Code not found." };
      setCodeErr(msgs[result.reason] || "Invalid code.");
    } else {
      setApplied(result);
    }
    setCodeLoading(false);
  }

  function removeCode() { setApplied(null); setCode(""); setCodeErr(""); }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}>✕</button>
        <h2>Get {title}</h2>
        <p className="modal-sub">One-time payment · instant access after purchase.</p>

        {/* Discount code */}
        <div className="fg">
          <label>Discount Code</label>
          {applied ? (
            <div className="disc-applied">
              ✓ {applied.code} — {applied.percent_off}% off
              <button onClick={removeCode}>Remove</button>
            </div>
          ) : (
            <div className="disc-row">
              <input className="fi" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" onKeyDown={e => e.key === "Enter" && applyCode()} />
              <button className="btn btn-outline btn-sm" onClick={applyCode} disabled={codeLoading}>{codeLoading ? "..." : "Apply"}</button>
            </div>
          )}
          {codeErr && <div className="ferr">{codeErr}</div>}
        </div>

        {/* Price summary */}
        <div className="price-box">
          <div className="price-row"><span>{title}</span><span>${basePrice.toFixed(2)}</span></div>
          {applied && <div className="price-row disc"><span>Discount ({applied.percent_off}% off)</span><span>-${(basePrice - finalPrice).toFixed(2)}</span></div>}
          <div className="price-row total"><span>Total</span><span>${finalPrice.toFixed(2)}</span></div>
        </div>

        {isDemo ? (
          <>
            <p style={{fontSize:13,color:"var(--muted)",textAlign:"center",marginBottom:14,lineHeight:1.7}}>
              Stripe not configured yet. Add your payment links as GitHub Secrets to go live.
            </p>
            <button className="btn btn-gold btn-block" onClick={() => { onSimulatePurchase(courseId, user); onClose(); }}>
              Simulate Purchase (Demo)
            </button>
          </>
        ) : (
          <>
            <p style={{fontSize:13,color:"var(--muted)",textAlign:"center",marginBottom:14,lineHeight:1.7}}>
              Secure checkout via Stripe. Return here after payment to access your courses.
            </p>
            <a className="btn btn-gold btn-block" href={STRIPE[courseId]} target="_blank" rel="noreferrer">
              Pay ${finalPrice.toFixed(2)} with Stripe →
            </a>
          </>
        )}
        <p style={{fontSize:11,color:"var(--muted)",textAlign:"center",marginTop:12}}>No card info stored here.</p>
      </div>
    </div>
  );
}
