import { useState } from "react";
import { fb, sheets } from "../lib/firebase";

export default function AuthModal({ mode, onClose, onAuth }) {
  const [tab, setTab] = useState(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (!email) { setError("Please enter your email."); return; }
    if (!fb.isDemo() && (!password || password.length < 6)) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    const { user, error: err } = tab === "login"
      ? await fb.signIn(email, password)
      : await fb.signUp(email, password);
    if (err) { setError(err); setLoading(false); return; }
    const courseIds = await sheets.getPurchases(user.uid, user.email);
    onAuth(user, courseIds);
    setLoading(false);
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}>✕</button>
        <h2>{tab === "login" ? "Sign In" : "Create Account"}</h2>
        <p className="modal-sub">
          {tab === "login" ? "Access your purchased courses." : "Create a free account to purchase and access courses."}
          {fb.isDemo() && <><br /><span style={{color:"var(--tan)"}}>Demo mode — any email works.</span></>}
        </p>
        {error && <div className="ferr">{error}</div>}
        <div className="fg">
          <label>Email</label>
          <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        {!fb.isDemo() && (
          <div className="fg">
            <label>Password</label>
            <input className="fi" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
        )}
        <button className="btn btn-gold btn-block" onClick={submit} disabled={loading}>
          {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
        </button>
        <div style={{textAlign:"center",marginTop:16,fontSize:13,color:"var(--muted)"}}>
          {tab === "login"
            ? <>No account? <button className="nav-link" style={{color:"var(--tan)",textDecoration:"underline"}} onClick={() => setTab("signup")}>Sign up free</button></>
            : <>Already have one? <button className="nav-link" style={{color:"var(--tan)",textDecoration:"underline"}} onClick={() => setTab("login")}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}
