import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// ─────────────────────────────────────────────────────────────
// CONFIG  —  set these as GitHub Secrets (see README)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:      process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:   process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId:       process.env.REACT_APP_FIREBASE_APP_ID,
};

// Google Apps Script Web App URL (see README — you deploy this once)
const SHEET_URL = process.env.REACT_APP_SHEET_URL;

const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined";

// ─────────────────────────────────────────────────────────────
// FIREBASE AUTH
// ─────────────────────────────────────────────────────────────
let auth = null;
if (!DEMO) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export const fb = {
  isDemo: () => DEMO,

  onAuthChange: (cb) => {
    if (DEMO) return () => {};
    return onAuthStateChanged(auth, cb);
  },

  async signUp(email, password) {
    if (DEMO) return { user: { uid: "demo-" + email, email }, error: null };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return { user: cred.user, error: null };
    } catch (e) {
      return { user: null, error: e.message };
    }
  },

  async signIn(email, password) {
    if (DEMO) return { user: { uid: "demo-" + email, email }, error: null };
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { user: cred.user, error: null };
    } catch (e) {
      return { user: null, error: e.message };
    }
  },

  async signOut() {
    if (DEMO) return;
    await signOut(auth);
  },
};

// ─────────────────────────────────────────────────────────────
// GOOGLE SHEETS  (via Apps Script Web App)
// All reads/writes go through your deployed Apps Script URL.
// ─────────────────────────────────────────────────────────────

// In-memory cache so we don't hammer the Sheet on every render
const cache = { purchases: {}, codes: null };

async function sheetRequest(payload) {
  if (DEMO || !SHEET_URL) return null;
  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // avoids preflight CORS
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    return res.json();
  } catch {
    return null;
  }
}

export const sheets = {
  // ── Purchases ──

  async getPurchases(uid, email) {
  if (DEMO) return cache.purchases[uid] || [];
  // Remove the cache check so it always fetches fresh on login
  const res = await sheetRequest({ action: "getPurchases", uid, email });
  const ids = res?.courseIds || [];
  cache.purchases[uid] = ids;
  return ids;
},

  async savePurchase(uid, email, courseId) {
    if (DEMO) {
      cache.purchases[uid] = [...(cache.purchases[uid] || []), courseId];
      return;
    }
    cache.purchases[uid] = [...(cache.purchases[uid] || []), courseId];
    await sheetRequest({ action: "savePurchase", uid, email, courseId });
  },

  // ── Discount Codes ──

  async validateCode(code) {
    if (DEMO) {
      // Demo: any code gives 20% off
      return { valid: true, percent_off: 20, id: "demo", code: code.toUpperCase() };
    }
    const res = await sheetRequest({ action: "validateCode", code: code.toUpperCase() });
    return res || { valid: false };
  },

  async recordCodeUse(codeId) {
    if (DEMO) return;
    await sheetRequest({ action: "recordCodeUse", codeId });
  },

  // ── Admin ──

  async getAllPurchases() {
    if (DEMO) return [
      { uid: "demo-jane", email: "jane@example.com", courseId: "bundle", date: new Date().toLocaleDateString() },
      { uid: "demo-john", email: "john@example.com", courseId: "puppy",  date: new Date().toLocaleDateString() },
    ];
    const res = await sheetRequest({ action: "getAllPurchases" });
    return res?.rows || [];
  },

  async getAllCodes() {
    if (DEMO) return [
      { id: "1", code: "DEMO20", percent_off: 20, max_uses: "", uses: 3, active: true },
    ];
    const res = await sheetRequest({ action: "getAllCodes" });
    return res?.rows || [];
  },

  async createCode(payload) {
    if (DEMO) return;
    await sheetRequest({ action: "createCode", ...payload });
  },

  async toggleCode(codeId, active) {
    if (DEMO) return;
    await sheetRequest({ action: "toggleCode", codeId, active });
  },

  // ── Traffic (GA4, via Apps Script — no per-visit token needed) ──

  async getGA4Report(range) {
    if (DEMO) return {
      overview: { rows: [{ metricValues: [{value:"128"},{value:"301"},{value:"842"},{value:"95"},{value:"0.42"},{value:"51"}] }] },
      daily: { rows: [] }, sources: { rows: [] }, pages: { rows: [] }, devices: { rows: [] },
    };
    const res = await sheetRequest({ action: "getGA4Report", range });
    return res || { error: { message: "No response from Apps Script — check REACT_APP_SHEET_URL." } };
  },
};
