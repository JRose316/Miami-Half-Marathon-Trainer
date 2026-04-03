import { START_MONDAY, PHASES } from './constants.js';

export const fmt    = d => d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
export const fmtStr = s => fmt(new Date(s + "T12:00:00"));
export const toISO  = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const weeksUntilRace = (raceDate) => Math.ceil((raceDate - new Date()) / (1000*60*60*24*7));
export const getPhase = w => PHASES[w<=12?0:w<=24?1:w<=36?2:3];
export const effortMeta = e => e>=7 ? {bg:"#FFF0F3",color:"#FF3D6B"} : e>=5 ? {bg:"#FFFBEC",color:"#FF9500"} : {bg:"#ECFFF8",color:"#00C97A"};
export const tripColor = t => t==="work" ? "#00CFFF" : "#FF9500";
export const tripBg    = t => t==="work" ? "#E8FAFF" : "#FFF8EC";

export function getWeekISO(weekNum) {
  return Array.from({length:7}, (_, i) => {
    const d = new Date(START_MONDAY);
    d.setDate(d.getDate() + (weekNum - 1) * 7 + i);
    return toISO(d);
  });
}

export function getWeekRange(w) {
  const iso = getWeekISO(w);
  return `${fmt(new Date(iso[0]+"T12:00:00"))} – ${fmt(new Date(iso[6]+"T12:00:00"))}`;
}

export function getDayTravel(dateStr, trips) {
  for (const t of trips)
    if (dateStr >= t.startDate && dateStr <= t.endDate)
      return { trip: t, isRest: t.restDates.includes(dateStr) };
  return null;
}

export function getWeekTrips(isoArr, trips) {
  const seen = new Set(), res = [];
  for (const d of isoArr)
    for (const t of trips)
      if (!seen.has(t.id) && d >= t.startDate && d <= t.endDate) { seen.add(t.id); res.push(t); }
  return res;
}

export function getDatesInRange(s, e) {
  if (!s || !e || s > e) return [];
  const dates = [], cur = new Date(s+"T12:00:00"), end = new Date(e+"T12:00:00");
  while (cur <= end) { dates.push(toISO(cur)); cur.setDate(cur.getDate()+1); }
  return dates;
}

export function buildWeeks() {
  const lrs = [
    2.75,3.0,3.25,3.0, 3.5,3.75,4.0,3.5, 4.0,4.25,4.5,4.0,
    4.75,5.0,5.25,5.0, 5.5,5.75,6.0,5.5, 6.5,7.0,7.5,6.5,
    7.5,8.0,8.5,8.0,   9.0,9.5,10.0,9.0, 10.5,11.0,12.0,10.0,
    9.0,8.0,7.0,6.0,   5.0,4.0,3.0,13.1,
  ];
  const cutbacks = new Set([4,8,12,16,20,24,28,32,36]);

  return lrs.map((lr, i) => {
    const w = i+1, ph = getPhase(w), isCB = cutbacks.has(w), isRace = w === 44;
    const iso  = getWeekISO(w);
    const days = iso.map(d => fmt(new Date(d+"T12:00:00")));

    const satDist = isRace||isCB ? null : w<=12 ? "1.5–2 mi" : w<=24 ? `${Math.round(lr*.4*4)/4} mi` : `${Math.round(lr*.45*4)/4} mi`;
    const wedMi   = isRace?0 : w<=12?2.5 : w<=24?3.5 : w<=36?4.5 : w<=41?3.0 : w===42?2.5 : w===43?2.0 : 0;
    const satMi   = isRace||isCB ? 0 : w<=12 ? 1.75 : parseFloat((Math.round(lr*(w<=24?.4:.45)*4)/4).toFixed(2));
    const weekTotal = parseFloat((lr + wedMi + satMi).toFixed(1));

    const wed = w<=12 ? "Gym run class — easy/moderate"
      : w<=16 ? "Gym class + 10 min tempo (8:00–8:30/mi)"
      : w<=20 ? "Gym class + 12 min tempo (8:00–8:30/mi)"
      : w<=24 ? "Gym class + 15 min tempo (8:00–8:30/mi)"
      : w<=28 ? "Tempo — 20 min at race pace (9:05/mi)"
      : w<=36 ? "Tempo — 25 min at race pace (9:05/mi)"
      : w<=41 ? "Easy 20–30 min shakeout. HR under 140."
      : w===42 ? "Easy 25 min + 4×20 sec strides."
      : w===43 ? "Easy 20 min only. Final tune-up."
      : "Rest or 15 min shakeout in Miami.";

    const pace = isRace ? "Goal: sub 9:05/mi. Start conservative, build."
      : isCB  ? "Easy throughout — 10:00–10:30/mi. Full recovery."
      : w<=12 ? "Conversational — 9:30–10:30/mi. HR under 145."
      : w<=24 ? "Easy 9:30–10:00/mi. Last mile pick up to ~9:15."
      : w<=36 ? `Easy first ${Math.max(1,lr-3)} mi, last 2–3 mi at goal pace (9:00–9:10).`
      : "Easy — 9:30–10:00/mi. Trust the taper.";

    const lift = w<=12 ? "Full split: Mon push, Tue pull, Thu legs, Fri misc + core."
      : w<=20 ? "Thu: swap 1 heavy compound for lunges/step-ups."
      : w<=36 ? "Thu: single-leg, RDLs, hip/glute. No heavy squats. Fri: core + hip flexors."
      : w<=41 ? "Reduce volume ~20%. Keep intensity, fewer sets."
      : w===42 ? "Upper body Mon/Tue only. Nothing Thu/Fri."
      : w===43 ? "Mon upper only. Rest remainder."
      : "No lifting race week. Walk, stretch, sleep.";

    return { week:w, ph, lr, isCB, isRace, iso, days, satDist, wed, pace, lift, weekTotal, range:getWeekRange(w) };
  });
}

// ── JSON parsing (data comes from Apps Script GET) ────────────
export function parseRunsCSV(json) {
  try {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    if (!data.rows) return [];
    return data.rows.map(obj => ({
      id:          parseInt(obj.id),
      date:        String(obj.date),
      distance:    parseFloat(obj.distance),
      pace:        obj.pace ? String(obj.pace).replace(/(\d+):(\d+)/, (_,m,s) => `${m}'${s}"`) : "—",
      paceSeconds: parseInt(obj.paceSeconds) || 0,
      avgHR:       parseInt(obj.avgHR) || 0,
      calories:    parseInt(obj.calories) || 0,
      time:        String(obj.time || "—"),
      cadence:     parseInt(obj.cadence) || 0,
      effort:      parseInt(obj.effort) || 6,
      effortLabel: String(obj.effortLabel || "Moderate"),
      elevation:   parseInt(obj.elevation) || 0,
    })).filter(r => r.id && r.date && r.distance);
  } catch(e) { return []; }
}

export function parseTripsCSV(json) {
  try {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    if (!data.rows) return [];
    return data.rows.map(obj => ({
      id:          String(obj.id),
      destination: String(obj.destination),
      emoji:       String(obj.emoji || "✈️"),
      startDate:   String(obj.startDate),
      endDate:     String(obj.endDate),
      type:        String(obj.type || "leisure"),
      notes:       String(obj.notes || ""),
      restDates:   obj.restDates ? String(obj.restDates).split("|").filter(Boolean) : [],
      tbd:         obj.tbd === true || obj.tbd === "true",
    })).filter(t => t.id && t.startDate);
  } catch(e) { return []; }
}
