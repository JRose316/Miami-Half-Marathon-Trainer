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
      headers.forEach((h, i) => obj[h] = row[i]);
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
  if (runsSheet.getLastRow() < 1) {
    runsSheet.getRange(1,1,1,12).setValues([["id","date","distance","pace","paceSeconds","avgHR","calories","time","cadence","effort","effortLabel","elevation"]]);
    runsSheet.getRange(2,1,4,12).setValues([
      [1,"2026-03-13",2.00,"8'17\"",497,141,231,"16:36",154,7,"Hard",61],
      [2,"2026-03-14",2.05,"9'09\"",549,152,236,"18:49",145,7,"Hard",72],
      [3,"2026-03-19",2.26,"7'59\"",479,144,268,"18:03",160,6,"Moderate",90],
      [4,"2026-03-24",2.51,"8'09\"",489,143,289,"20:29",158,6,"Moderate",37],
    ]);
  }

  let tripsSheet = ss.getSheetByName("Trips");
  if (!tripsSheet) tripsSheet = ss.insertSheet("Trips");
  if (tripsSheet.getLastRow() < 1) {
    tripsSheet.getRange(1,1,1,9).setValues([["id","destination","emoji","startDate","endDate","type","notes","restDates","tbd"]]);
  }

  Logger.log("Setup complete!");
}
