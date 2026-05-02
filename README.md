# K9 Academy — Setup Guide
## 100% in your browser. No downloads. No terminal. Ever.

---

## What you need
- A **Google account** (you almost certainly have one)
- That's it to start. Stripe comes later when you're ready to take payments.

---

## PART 1 — Firebase (free customer logins)

Firebase is Google's free authentication service. It handles your customers' emails and passwords securely.

1. Go to **https://console.firebase.google.com**
2. Click **Create a project** → name it `k9academy` → click through the steps → **Create project**
3. Once inside the project, click **Authentication** in the left sidebar
4. Click **Get started** → click the **Email/Password** option → toggle **Enable** → **Save**
5. Now click the **gear icon** (top left) → **Project settings**
6. Scroll down to **Your apps** → click the **</>** (web) icon
7. Name it `k9academy` → click **Register app**
8. You'll see a block of code. Copy and save these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `appId`

You'll paste these as GitHub Secrets in Part 3.

---

## PART 2 — Google Sheets (stores purchases and discount codes)

This is your database — you'll see everything in a regular spreadsheet.

### Create the spreadsheet

1. Go to **https://sheets.google.com** → click the **+** to create a new spreadsheet
2. Name it **K9 Academy**
3. At the bottom, you'll see a tab called "Sheet1" — rename it to **Purchases** (double-click the tab)
4. Click the **+** button next to the tab to add a second sheet — name it **DiscountCodes**

### Add headers

In the **Purchases** sheet, click cell A1 and type these headers across row 1:
```
A1: uid    B1: email    C1: courseId    D1: date
```

In the **DiscountCodes** sheet, type these headers across row 1:
```
A1: id    B1: code    C1: percent_off    D1: max_uses    E1: uses    F1: active
```

### Find your Spreadsheet ID

Look at the URL of your spreadsheet — it looks like:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit
```
Copy that long string of letters and numbers in the middle. You'll need it in a moment.

### Set up the Apps Script

1. In your spreadsheet, click **Extensions → Apps Script**
2. A new tab opens with a code editor
3. Delete everything in the editor
4. Open the file **google-apps-script.js** from this project (it's in the root folder of the zip)
5. Copy the entire contents and paste it into the Apps Script editor
6. Find this line near the top:
   ```
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
   ```
   Replace `YOUR_SPREADSHEET_ID` with the ID you copied from the URL
7. Click the **floppy disk icon** (Save)
8. Click **Deploy → New deployment**
   - Click the gear icon next to "Type" → select **Web app**
   - Description: `K9 Academy`
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy** → if it asks to authorize, click through and allow
10. Copy the **Web app URL** that appears (looks like `https://script.google.com/macros/s/.../exec`)

Save that URL — it goes in GitHub Secrets as `REACT_APP_SHEET_URL`.

---

## PART 3 — GitHub (hosts your site for free)

### Create your account and repository

1. Go to **https://github.com/signup** → create a free account
2. Go to **https://github.com/new**
   - Repository name: `k9academy`
   - Set to **Public**
   - Do NOT check any initialize boxes
   - Click **Create repository**

### Upload the project files

1. On your new empty repository page, click **uploading an existing file**
2. Unzip the project file on your computer
3. Drag ALL files and folders into the GitHub upload area
   - **Important:** make sure the `.github` folder is included
   - On Mac: press **Cmd+Shift+Period** to show hidden files before dragging
   - On Windows: check **Show hidden items** in File Explorer options
4. Scroll down and click **Commit changes**

### Add your Secret keys

1. In your repository, click **Settings** (top tab bar)
2. Click **Secrets and variables → Actions** (left sidebar)
3. Click **New repository secret** for each one below:

| Secret Name | Where to find it |
|---|---|
| `REACT_APP_FIREBASE_API_KEY` | Firebase Project Settings → your app → apiKey |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Project Settings → authDomain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Project Settings → projectId |
| `REACT_APP_FIREBASE_APP_ID` | Firebase Project Settings → appId |
| `REACT_APP_SHEET_URL` | The Apps Script Web App URL from Part 2 |
| `REACT_APP_ADMIN_EMAIL` | The email YOU will use to log in as admin |
| `REACT_APP_STRIPE_PUPPY` | Stripe payment link for Puppy Starter Pack |
| `REACT_APP_STRIPE_ENGAGE` | Stripe payment link for Engage & Thrive |
| `REACT_APP_STRIPE_OBEDIENCE` | Stripe payment link for Foundation Obedience |
| `REACT_APP_STRIPE_KNOW` | Stripe payment link for Know Your Dog |
| `REACT_APP_STRIPE_BUNDLE` | Stripe payment link for Full K9 Academy |

> Stripe secrets can be added later — the site works in demo mode without them.

---

## PART 4 — Enable GitHub Pages

1. In your repo, click **Settings → Pages** (left sidebar)
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** · folder: **/ (root)**
4. Click **Save**

> The `gh-pages` branch appears after your first build. If it's not there yet, do Part 5 first then come back.

---

## PART 5 — Run Your First Build

1. Click the **Actions** tab in your repository
2. Click **Deploy K9 Academy** → **Run workflow** → **Run workflow**
3. Wait about 2–3 minutes for a green checkmark

**Your site is live at:**
```
https://YOURUSERNAME.github.io/k9academy
```

---

## PART 6 — Stripe (when you're ready to take payments)

1. Go to **https://stripe.com** → create a free account
2. Click **Products** → create one product per course:

| Product | Price |
|---|---|
| Puppy Starter Pack | $10.00 |
| Engage & Thrive | $5.00 |
| Foundation Obedience | $5.00 |
| Know Your Dog | $5.00 |
| Full K9 Academy | $20.00 |

3. For each product, click into it → **Create payment link** → copy the URL
4. Add each URL as a GitHub Secret (the REACT_APP_STRIPE_* ones from Part 3)
5. Go to **Actions → Run workflow** again to rebuild with Stripe active

> Stripe starts in test mode. Use card number `4242 4242 4242 4242` to test purchases. When ready to go live, toggle off test mode in the Stripe dashboard.

---

## Making Changes (All In Your Browser)

1. Open any file on GitHub (e.g. `src/data/courses.js`)
2. Click the **pencil icon** ✏️ to edit it
3. Make your changes
4. Scroll down → click **Commit changes**
5. Your site rebuilds automatically in ~2 minutes

### Key files:
| File | What it controls |
|---|---|
| `src/data/courses.js` | All course content, prices, lessons, and what's included |
| `src/components/HomePage.js` | The main sales page layout |
| `src/components/AdminPanel.js` | Your admin panel |

---

## Running Your Business

### Create a discount code
Log in with your admin email → click **Admin** in the nav → **Discount Codes** tab → fill in the form → **Create**. Share the code with your customer and they enter it before paying.

### View customers and sales
Admin panel → **Customers** or **Sales Stats** tabs. Same data also appears directly in your Google Sheet.

### After someone pays via Stripe (manual access grant)
Until a Stripe webhook is set up, after a customer pays:
1. Open your **K9 Academy** Google Sheet
2. In the **Purchases** tab, add a new row:
   - Column A: their Firebase User ID (find it in Firebase Console → Authentication → Users)
   - Column B: their email
   - Column C: the course ID (`puppy`, `engage`, `obedience`, `know`, or `bundle`)
   - Column D: today's date

---

## Troubleshooting

**Build failed (red X in Actions):** Click the failed run → find the red step → read the error. Usually a typo in a secret name.

**Site is outdated:** Wait 3–5 min then hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac).

**Admin link not showing:** Must be signed in with the exact email in `REACT_APP_ADMIN_EMAIL`.

**Google Sheet not updating:** Make sure your Apps Script is deployed as a Web App with "Anyone" access. Re-deploy if needed (Apps Script → Deploy → Manage deployments).
