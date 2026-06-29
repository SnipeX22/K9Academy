import { useState, useEffect } from "react";
import "./styles.css";
import { fb, sheets } from "./lib/firebase";
import AuthModal from "./components/AuthModal";
import PurchaseModal from "./components/PurchaseModal";
import LessonViewer from "./components/LessonViewer";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import HomePage from "./components/HomePage";
import LegalPage from "./components/LegalPage";

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || "";

export default function App() {
  const [page, setPage] = useState("home");
  const [legalSection, setLegalSection] = useState("refund");
  const [authModal, setAuthModal] = useState(null);
  const [buyModal, setBuyModal] = useState(null);
  const [pendingBuy, setPendingBuy] = useState(null);
  const [user, setUser] = useState(null);
  const [ownedIds, setOwnedIds] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [checks, setChecks] = useState({});

  useEffect(() => {
    try { const s = sessionStorage.getItem("k9_checks"); if (s) setChecks(JSON.parse(s)); } catch {}
  }, []);

  function saveChecks(next) {
    setChecks(next);
    try { sessionStorage.setItem("k9_checks", JSON.stringify(next)); } catch {}
  }

  function handleCheck(courseId, lessonIdx, itemIdx) {
    const next = { ...checks, [courseId]: { ...(checks[courseId]||{}), [lessonIdx]: { ...((checks[courseId]||{})[lessonIdx]||{}), [itemIdx]: !((checks[courseId]||{})[lessonIdx]||{})[itemIdx] } } };
    saveChecks(next);
  }

  function handleAuth(u, courseIds) {
    setUser(u);
    setOwnedIds(courseIds);
    setAuthModal(null);
    if (pendingBuy) {
      setBuyModal(pendingBuy);
      setPendingBuy(null);
    } else {
      setPage("dashboard");
    }
  }

  function handleLogout() {
    fb.signOut();
    setUser(null);
    setOwnedIds([]);
    setPage("home");
  }

  function handleBuy(courseId) {
    if (!user) {
      setPendingBuy(courseId || "bundle");
      setAuthModal("signup");
      return;
    }
    setBuyModal(courseId || "bundle");
  }

  function handleLegal(section) {
    setLegalSection(section || "refund");
    setPage("legal");
    window.scrollTo(0, 0);
  }

  async function handleRefresh() {
    if (!user) return;
    const courseIds = await sheets.getPurchases(user.uid, user.email);
    setOwnedIds(courseIds);
  }

  async function handleSimulatePurchase(courseId, u) {
    const uid = (u || user)?.uid;
    const email = (u || user)?.email;
    if (!uid) return;
    const newIds = courseId === "bundle" ? ["bundle"] : [courseId];
    const updated = [...new Set([...ownedIds, ...newIds])];
    setOwnedIds(updated);
    for (const id of newIds) await sheets.savePurchase(uid, email, id);
  }

  function openCourse(course) {
    setActiveCourse(course);
    setActiveLessonIdx(0);
    setPage("course");
  }

  const isAdmin = user?.email === ADMIN_EMAIL || user?.uid?.startsWith("demo-admin");

  const Nav = () => (
    <nav className="nav">
      <span className="logo" onClick={() => setPage("home")}>K9 Academy</span>
      <div className="nav-actions">
        {user ? (
          <>
            <button className="nav-link" onClick={() => setPage("dashboard")}>My Courses</button>
            {isAdmin && <button className="nav-link" onClick={() => setPage("admin")}>Admin</button>}
            <button className="nav-btn solid" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={() => setAuthModal("login")}>Sign In</button>
            <button className="nav-btn solid" onClick={() => setAuthModal("signup")}>Get Started</button>
          </>
        )}
      </div>
    </nav>
  );

  const Modals = () => (
    <>
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuth={handleAuth} />}
      {buyModal && <PurchaseModal courseId={buyModal} user={user} onClose={() => setBuyModal(null)} onSimulatePurchase={handleSimulatePurchase} />}
    </>
  );

  if (page === "admin") return (
    <div><Nav /><AdminPanel onBack={() => setPage("home")} /><Modals /></div>
  );

  if (page === "legal") return (
    <div>
      <Nav />
      <LegalPage
        section={legalSection}
        onBack={(newSection) => {
          if (newSection && typeof newSection === "string" && newSection !== legalSection) {
            setLegalSection(newSection);
            window.scrollTo(0, 0);
          } else {
            setPage("home");
          }
        }}
      />
      <Modals />
    </div>
  );

  if (page === "course" && activeCourse) return (
    <div>
      <Nav />
      <LessonViewer course={activeCourse} lessonIdx={activeLessonIdx} onSelectLesson={setActiveLessonIdx} onBack={() => setPage("dashboard")} checks={checks} onCheck={handleCheck} />
      <Modals />
    </div>
  );

  if (page === "dashboard" && user) return (
    <div><Nav /><Dashboard user={user} ownedIds={ownedIds} onBuy={handleBuy} onOpenCourse={openCourse} onRefresh={handleRefresh} /><Modals /></div>
  );

  return (
    <div>
      <Nav />
      <HomePage
        onBuy={handleBuy}
        onScrollToCourses={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
        onLegal={handleLegal}
      />
      <Modals />
    </div>
  );
}
