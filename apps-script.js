const SHEET_ID = "14p6LdjEXRCbtrG-GVdIUKDh_r2Qk_mdhf_e3XaVk1ac";

// ── GET — returns sheet data as JSON ─────────────────────────
function doGet(e) {
  try {
    const sheetName = e.parameter.sheet;
    if (!sheetName) return jsonResponse({ error: "No sheet specified" });

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ error: "Sheet not found: " + sheetName });

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows    = data.slice(1).filter(r => r[0] !== "").map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i];
        // Format Date objects as strings
        if (val instanceof Date) {
          if (h === "date" || h === "startDate" || h === "endDate") {
            obj[h] = Utilities.formatDate(val, "UTC", "yyyy-MM-dd");
          } else {
            // time fields like "16:36" — format as HH:mm
            obj[h] = Utilities.formatDate(val, "UTC", "HH:mm");
          }
        } else {
          obj[h] = val;
        }
      });
      return obj;
    });

    return jsonResponse({ rows });
  } catch(err) {
    return jsonResponse({ error: err.toString() });
  }
}

// ── POST — writes a row to the sheet ─────────────────────────
function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(data.sheet);
    if (!sheet) return jsonResponse({ error: "Sheet not found: " + data.sheet });

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (data.sheet === "Runs") {
      const row = headers.map(h => data.row[h] !== undefined ? data.row[h] : "");
      sheet.appendRow(row);
    }

    if (data.sheet === "Trips") {
      const row = headers.map(h => data.row[h] !== undefined ? data.row[h] : "");
      const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow()-1,1), 1).getValues().flat();
      const existingRow = ids.indexOf(data.row.id);
      if (existingRow >= 0) {
        sheet.getRange(existingRow + 2, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
    }

    return jsonResponse({ success: true });
  } catch(err) {
    return jsonResponse({ error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Setup — run once ──────────────────────────────────────────
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let runsSheet = ss.getSheetByName("Runs");
  if (!runsSheet) runsSheet = ss.insertSheet("Runs");

  let tripsSheet = ss.getSheetByName("Trips");
  if (!tripsSheet) tripsSheet = ss.insertSheet("Trips");

  Logger.log("Setup complete!");
}
