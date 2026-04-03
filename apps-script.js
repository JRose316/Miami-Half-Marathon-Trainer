// ── Miami Half Marathon Trainer — Google Apps Script ──────────
// Deploy this as a Web App with "Anyone" access
// Paste the deployment URL into Vercel as VITE_APPS_SCRIPT_URL

const SHEET_ID = "14p6LdjEXRCbtrG-GVdIUKDh_r2Qk_mdhf_e3XaVk1ac";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
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
      // Check if this trip ID already exists — if so update, otherwise append
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

function doGet(e) {
  return jsonResponse({ status: "Miami Trainer Apps Script is running" });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Setup function — run once to create sheet headers ─────────
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Runs tab
  let runsSheet = ss.getSheetByName("Runs");
  if (!runsSheet) runsSheet = ss.insertSheet("Runs");
  runsSheet.getRange(1, 1, 1, 12).setValues([[
    "id","date","distance","pace","paceSeconds","avgHR","calories","time","cadence","effort","effortLabel","elevation"
  ]]);
  runsSheet.getRange(2, 1, 1, 12).setValues([[1,"2026-03-13",2.00,"8'17\"",497,141,231,"16:36",154,7,"Hard",61]]);
  runsSheet.getRange(3, 1, 1, 12).setValues([[2,"2026-03-14",2.05,"9'09\"",549,152,236,"18:49",145,7,"Hard",72]]);
  runsSheet.getRange(4, 1, 1, 12).setValues([[3,"2026-03-19",2.26,"7'59\"",479,144,268,"18:03",160,6,"Moderate",90]]);
  runsSheet.getRange(5, 1, 1, 12).setValues([[4,"2026-03-24",2.51,"8'09\"",489,143,289,"20:29",158,6,"Moderate",37]]);

  // Trips tab
  let tripsSheet = ss.getSheetByName("Trips");
  if (!tripsSheet) tripsSheet = ss.insertSheet("Trips");
  tripsSheet.getRange(1, 1, 1, 9).setValues([[
    "id","destination","emoji","startDate","endDate","type","notes","restDates","tbd"
  ]]);

  const trips = [
    ["t1","Miami, FL","🌴","2026-03-25","2026-03-30","leisure","Spring trip. Thu–Sun: runs in Miami. Long run Sun 3/29 in Miami. Fly home Mon AM — kickball that evening.","2026-03-25|2026-03-30","false"],
    ["t2","Seattle, WA","🌧️","2026-04-20","2026-04-23","work","Work conference. Morning/evening runs Mon–Thu. Cutback week — perfect timing.","","false"],
    ["t3","Amsterdam & Berlin","🌷","2026-04-27","2026-05-04","leisure","Depart Mon evening. Arrive Amsterdam Tue AM. Berlin Thu. Easy runs throughout. Long run Sun 5/3 wherever you are. Fly home Mon 5/4 — kickball that night.","2026-05-04","false"],
    ["t4","TBD Weekend Getaway","📍","2026-06-04","2026-06-07","leisure","Placeholder trip. Runs only — no gym access.","","false"],
    ["t5","Provincetown, MA","🏖️","2026-07-01","2026-07-06","leisure","Travel day Wed 7/1 — no workout. Runs Thu–Sun. Long run Sun 7/5 in P-town. Home Mon 7/6 — rest day.","2026-07-01|2026-07-06","false"],
    ["t6","Barcelona, Spain","☀️","2026-08-11","2026-08-14","leisure","Solar eclipse trip! Run Tue 8/11 before departure. Arrive Wed 8/12 — rest. Run Thu 8/13. Fly home Fri 8/14 — rest.","2026-08-12|2026-08-14","false"],
    ["t7","Atlanta, GA","🍑","2026-08-24","2026-08-27","work","Work trip. Nothing Mon 8/24. Runs Tue–Thu mornings.","2026-08-24","false"],
    ["t8","Japan","🗾","2026-10-28","2026-11-09","leisure","13-day trip. Full plan TBD — come back closer to trip to map routes and hotel treadmill options. Expect 2–3 runs/week.","2026-10-28|2026-11-09","true"],
    ["t9","Boynton Beach, FL","🌴","2026-11-19","2026-11-22","leisure","Driving to South Florida. PEAK WEEK — 12-mile long run happens here. Great mental prep for race day.","2026-11-19","false"],
    ["t10","Seattle, WA","☕","2026-11-30","2026-12-03","work","Work trip during taper — great timing. Nothing Mon 11/30 or Thu 12/3. Runs Tue/Wed.","2026-11-30|2026-12-03","false"],
  ];
  tripsSheet.getRange(2, 1, trips.length, 9).setValues(trips);

  Logger.log("Setup complete!");
}
