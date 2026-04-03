export const RACE_DATE     = new Date("2027-01-25");
export const START_MONDAY  = new Date("2026-03-23");
export const GOAL_DISTANCE = 13.1;
export const INCREMENT     = 0.25;

// ── Google Sheet config ───────────────────────────────────────
// Sheet ID from your Google Sheet URL
export const SHEET_ID = "14p6LdjEXRCbtrG-GVdIUKDh_r2Qk_mdhf_e3XaVk1ac";

// Data fetched via Vercel serverless proxies (avoids CORS issues)
export const RUNS_CSV_URL  = "/api/runs";
export const TRIPS_CSV_URL = "/api/trips";

// Apps Script web app URL (set after deploying the script — see README)
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

export const GOALS = [
  { label:"Beat 2018 PR",      time:"2:01:46", pace:"9'05\"/mi", note:"Your 2018 Miami finish",  color:"#FFD600" },
  { label:"Sub 2:00:00",       time:"1:59:59", pace:"9'09\"/mi", note:"Just under the 2hr wall", color:"#FF3D6B" },
  { label:"Stretch: Sub 1:55", time:"1:54:59", pace:"8'47\"/mi", note:"Strong fitness goal",     color:"#00CFFF" },
];

export const MILESTONES = [
  { distance:5,    label:"5-mile run"    },
  { distance:6.2,  label:"10K distance"  },
  { distance:8,    label:"8 miles"       },
  { distance:10,   label:"10 miles"      },
  { distance:13.1, label:"Half Marathon" },
];

export const PHASES = [
  { id:1, label:"Phase 1", subtitle:"Foundation",  weeks:"1–12",  color:"#FF3D6B", light:"#FFF0F3", border:"#FF3D6B33" },
  { id:2, label:"Phase 2", subtitle:"Development", weeks:"13–24", color:"#FF9500", light:"#FFF8EC", border:"#FF950033" },
  { id:3, label:"Phase 3", subtitle:"Build",       weeks:"25–36", color:"#00CFFF", light:"#E8FAFF", border:"#00CFFF33" },
  { id:4, label:"Phase 4", subtitle:"Taper",       weeks:"37–44", color:"#A78BFA", light:"#F5F0FF", border:"#A78BFA33" },
];

export const INITIAL_RUNS = [
  { id:1, date:"2026-03-13", distance:2.00, pace:"8'17\"", paceSeconds:497, avgHR:141, calories:231, time:"16:36", cadence:154, effort:7, effortLabel:"Hard",     elevation:61 },
  { id:2, date:"2026-03-14", distance:2.05, pace:"9'09\"", paceSeconds:549, avgHR:152, calories:236, time:"18:49", cadence:145, effort:7, effortLabel:"Hard",     elevation:72 },
  { id:3, date:"2026-03-19", distance:2.26, pace:"7'59\"", paceSeconds:479, avgHR:144, calories:268, time:"18:03", cadence:160, effort:6, effortLabel:"Moderate", elevation:90 },
  { id:4, date:"2026-03-24", distance:2.51, pace:"8'09\"", paceSeconds:489, avgHR:143, calories:289, time:"20:29", cadence:158, effort:6, effortLabel:"Moderate", elevation:37 },
];

export const INITIAL_TRIPS = [
  { id:"t1",  destination:"Miami, FL",          emoji:"🌴", startDate:"2026-03-25", endDate:"2026-03-30", type:"leisure", restDates:["2026-03-25","2026-03-30"], notes:"Spring trip. Thu–Sun: runs in Miami. Long run Sun 3/29 in Miami. Fly home Mon AM — kickball that evening.", tbd:false },
  { id:"t2",  destination:"Seattle, WA",         emoji:"🌧️", startDate:"2026-04-20", endDate:"2026-04-23", type:"work",    restDates:[],                          notes:"Work conference. Morning/evening runs Mon–Thu. Cutback week — perfect timing.", tbd:false },
  { id:"t3",  destination:"Amsterdam & Berlin",  emoji:"🌷", startDate:"2026-04-27", endDate:"2026-05-04", type:"leisure", restDates:["2026-05-04"],              notes:"Depart Mon evening. Arrive Amsterdam Tue AM. Berlin Thu. Easy runs throughout. Long run Sun 5/3 wherever you are. Fly home Mon 5/4 — kickball that night.", tbd:false },
  { id:"t4",  destination:"TBD Weekend Getaway", emoji:"📍", startDate:"2026-06-04", endDate:"2026-06-07", type:"leisure", restDates:[],                          notes:"Placeholder trip. Runs only — no gym access.", tbd:false },
  { id:"t5",  destination:"Provincetown, MA",    emoji:"🏖️", startDate:"2026-07-01", endDate:"2026-07-06", type:"leisure", restDates:["2026-07-01","2026-07-06"], notes:"Travel day Wed 7/1 — no workout. Runs Thu–Sun. Long run Sun 7/5 in P-town. Home Mon 7/6 — rest day.", tbd:false },
  { id:"t6",  destination:"Barcelona, Spain",    emoji:"☀️", startDate:"2026-08-11", endDate:"2026-08-14", type:"leisure", restDates:["2026-08-12","2026-08-14"], notes:"Solar eclipse trip! Run Tue 8/11 before departure. Arrive Wed 8/12 — rest. Run Thu 8/13. Fly home Fri 8/14 — rest.", tbd:false },
  { id:"t7",  destination:"Atlanta, GA",         emoji:"🍑", startDate:"2026-08-24", endDate:"2026-08-27", type:"work",    restDates:["2026-08-24"],              notes:"Work trip. Nothing Mon 8/24. Runs Tue–Thu mornings.", tbd:false },
  { id:"t8",  destination:"Japan",               emoji:"🗾", startDate:"2026-10-28", endDate:"2026-11-09", type:"leisure", restDates:["2026-10-28","2026-11-09"], notes:"13-day trip. Full plan TBD — come back closer to trip to map routes and hotel treadmill options. Expect 2–3 runs/week.", tbd:true },
  { id:"t9",  destination:"Boynton Beach, FL",   emoji:"🌴", startDate:"2026-11-19", endDate:"2026-11-22", type:"leisure", restDates:["2026-11-19"],              notes:"Driving to South Florida. PEAK WEEK — 12-mile long run happens here. Great mental prep for race day.", tbd:false },
  { id:"t10", destination:"Seattle, WA",         emoji:"☕", startDate:"2026-11-30", endDate:"2026-12-03", type:"work",    restDates:["2026-11-30","2026-12-03"], notes:"Work trip during taper — great timing. Nothing Mon 11/30 or Thu 12/3. Runs Tue/Wed.", tbd:false },
];
