# 🏃 Road to Miami — Half Marathon Trainer

Miami Half Marathon training dashboard. Built with React + Vite, backed by Google Sheets.

---

## Setup (one-time)

### 1. Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/14p6LdjEXRCbtrG-GVdIUKDh_r2Qk_mdhf_e3XaVk1ac
2. Click **Extensions → Apps Script**
3. Delete any existing code and paste in the contents of `apps-script.js`
4. Click **Run → setupSheets** — this creates all headers and pre-populates your data
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and copy the Web App URL

### 2. Vercel Environment Variable

In your Vercel project settings → Environment Variables, add:

```
VITE_APPS_SCRIPT_URL = <paste your Web App URL here>
```

### 3. Deploy

Push to GitHub → Vercel auto-deploys.

---

## Local Development

```bash
npm install
npm run dev
```

---

## How data works

- **Reads:** App fetches runs and trips from Google Sheet as CSV on every load
- **Writes:** Adding a run or trip POSTs to the Apps Script, which appends a row to the sheet
- **Fallback:** If the sheet is unreachable, the app uses hardcoded initial data

---

## Race Details

- **Race:** Miami Half Marathon
- **Date:** January 25, 2027
- **Goal:** Sub 2:01:46 (beat 2018 PR)
- **Training start:** March 23, 2026
- **Plan:** 44 weeks across 4 phases
