// ═══════════════════════════════════════════════════════════════
// K9 ACADEMY — Google Apps Script
// ═══════════════════════════════════════════════════════════════
// HOW TO SET UP (takes about 5 minutes):
//
// 1. Go to sheets.google.com and create a new spreadsheet
// 2. Name it "K9 Academy"
// 3. Create these three sheets (tabs at the bottom):
//      - Purchases
//      - DiscountCodes
//      - (the default "Sheet1" can be deleted)
//
// 4. In the Purchases sheet, add these headers in row 1:
//    A: uid | B: email | C: courseId | D: date
//
// 5. In the DiscountCodes sheet, add these headers in row 1:
//    A: id | B: code | C: percent_off | D: max_uses | E: uses | F: active
//
// 6. Click Extensions → Apps Script
// 7. Delete everything in the editor and paste this entire file
// 8. Click Save (floppy disk icon)
// 9. Click Deploy → New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 10. Click Deploy → copy the Web App URL
// 11. Paste that URL as REACT_APP_SHEET_URL in your GitHub Secrets
//
// ── TO ENABLE THE TRAFFIC TAB (GA4, no token needed) ────────────
// 12. Set GA4_PROPERTY_ID below to your GA4 numeric Property ID
//     (analytics.google.com → Admin → Property Settings → Property ID)
// 13. In the Apps Script editor: Project Settings (gear icon, left
//     sidebar) → check "Show appsscript.json manifest file in editor"
// 14. Back in the editor, open appsscript.json. If it has no
//     "oauthScopes" array, add one with ALL of these (adding an
//     explicit list switches Apps Script out of auto-detect mode,
//     so every scope the script needs must be listed):
//       "oauthScopes": [
//         "https://www.googleapis.com/auth/spreadsheets",
//         "https://www.googleapis.com/auth/script.external_request",
//         "https://www.googleapis.com/auth/analytics.readonly"
//       ]
//     If it already has an oauthScopes array, just add the
//     analytics.readonly line to it.
// 15. Click Deploy → Manage deployments → pencil icon → select
//     "New version" → Deploy. You'll be asked to re-authorize —
//     approve access to Google Analytics data.
// (The Traffic tab now loads automatically for whoever opens the
// admin panel — it runs as you, the script owner, so no one else
// needs their own token.)
// ═══════════════════════════════════════════════════════════════

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // paste your Sheet ID here
// (find it in the URL: docs.google.com/spreadsheets/d/THIS_PART/edit)

const GA4_PROPERTY_ID = "YOUR_GA4_PROPERTY_ID"; // paste your numeric GA4 Property ID here

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  let result = {};

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === "getPurchases") {
      result = getPurchases(ss, data.uid);

    } else if (action === "savePurchase") {
      result = savePurchase(ss, data.uid, data.email, data.courseId);

    } else if (action === "validateCode") {
      result = validateCode(ss, data.code);

    } else if (action === "recordCodeUse") {
      result = recordCodeUse(ss, data.codeId);

    } else if (action === "getAllPurchases") {
      result = getAllPurchases(ss);

    } else if (action === "getAllCodes") {
      result = getAllCodes(ss);

    } else if (action === "createCode") {
      result = createCode(ss, data);

    } else if (action === "toggleCode") {
      result = toggleCode(ss, data.codeId, data.active);

    } else if (action === "getGA4Report") {
      result = getGA4Report(data.range);
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Allow GET for health check
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Purchases ──────────────────────────────────────────────────

function getPurchases(ss, uid) {
  const sheet = ss.getSheetByName("Purchases");
  const data = sheet.getDataRange().getValues();
  const courseIds = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === uid) courseIds.push(data[i][2]);
  }
  return { courseIds };
}

function savePurchase(ss, uid, email, courseId) {
  const sheet = ss.getSheetByName("Purchases");
  sheet.appendRow([uid, email, courseId, new Date().toLocaleDateString()]);
  return { success: true };
}

function getAllPurchases(ss) {
  const sheet = ss.getSheetByName("Purchases");
  const data = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      rows.push({ uid: data[i][0], email: data[i][1], courseId: data[i][2], date: data[i][3] });
    }
  }
  return { rows };
}

// ── Discount Codes ─────────────────────────────────────────────

function validateCode(ss, code) {
  const sheet = ss.getSheetByName("DiscountCodes");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1].toString().toUpperCase() === code) {
      const active = row[5] === true || row[5] === "TRUE";
      const maxUses = row[3] ? parseInt(row[3]) : null;
      const uses = parseInt(row[4]) || 0;
      if (!active) return { valid: false, reason: "inactive" };
      if (maxUses && uses >= maxUses) return { valid: false, reason: "maxed" };
      return { valid: true, id: row[0], code: row[1], percent_off: parseInt(row[2]), uses, max_uses: maxUses };
    }
  }
  return { valid: false, reason: "notfound" };
}

function recordCodeUse(ss, codeId) {
  const sheet = ss.getSheetByName("DiscountCodes");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === codeId.toString()) {
      const usesCell = sheet.getRange(i + 1, 5);
      usesCell.setValue((parseInt(data[i][4]) || 0) + 1);
      return { success: true };
    }
  }
  return { success: false };
}

function getAllCodes(ss) {
  const sheet = ss.getSheetByName("DiscountCodes");
  const data = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      rows.push({
        id: data[i][0], code: data[i][1], percent_off: data[i][2],
        max_uses: data[i][3], uses: data[i][4],
        active: data[i][5] === true || data[i][5] === "TRUE",
      });
    }
  }
  return { rows };
}

function createCode(ss, data) {
  const sheet = ss.getSheetByName("DiscountCodes");
  const id = Date.now().toString();
  sheet.appendRow([id, data.code.toUpperCase(), data.percent_off, data.max_uses || "", 0, true]);
  return { success: true, id };
}

function toggleCode(ss, codeId, active) {
  const sheet = ss.getSheetByName("DiscountCodes");
  const sheetData = sheet.getDataRange().getValues();
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0].toString() === codeId.toString()) {
      sheet.getRange(i + 1, 6).setValue(active);
      return { success: true };
    }
  }
  return { success: false };
}

// ── Traffic (GA4) ──────────────────────────────────────────────
// Runs as the script owner (you). No per-visit token needed —
// this uses your own Google login's access, the same one that
// already has Administrator rights on the GA4 property.

function ga4Run(propertyId, token, body) {
  const res = UrlFetchApp.fetch(
    "https://analyticsdata.googleapis.com/v1beta/properties/" + propertyId + ":runReport",
    {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify(body),
      muteHttpExceptions: true,
    }
  );
  return JSON.parse(res.getContentText());
}

function getGA4Report(range) {
  if (!GA4_PROPERTY_ID || GA4_PROPERTY_ID === "YOUR_GA4_PROPERTY_ID") {
    return { error: { message: "GA4_PROPERTY_ID is not set in the Apps Script — paste your numeric GA4 Property ID at the top of this file and redeploy." } };
  }

  const token = ScriptApp.getOAuthToken();
  const dateRange = range || "28daysAgo";
  const dr = [{ startDate: dateRange, endDate: "today" }];

  const overview = ga4Run(GA4_PROPERTY_ID, token, {
    dateRanges: dr,
    metrics: [
      { name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" },
      { name: "averageSessionDuration" }, { name: "bounceRate" }, { name: "newUsers" },
    ],
  });
  if (overview.error) return { overview };

  const daily = ga4Run(GA4_PROPERTY_ID, token, {
    dateRanges: dr,
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
    limit: 30,
  });

  const sources = ga4Run(GA4_PROPERTY_ID, token, {
    dateRanges: dr,
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 6,
  });

  const pages = ga4Run(GA4_PROPERTY_ID, token, {
    dateRanges: dr,
    dimensions: [{ name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 5,
  });

  const devices = ga4Run(GA4_PROPERTY_ID, token, {
    dateRanges: dr,
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  return { overview, daily, sources, pages, devices };
}
