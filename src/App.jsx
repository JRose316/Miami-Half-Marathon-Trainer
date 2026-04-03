import { useState, useEffect } from "react";
import { RACE_DATE, GOAL_DISTANCE, INCREMENT, GOALS, MILESTONES, PHASES, INITIAL_RUNS, INITIAL_TRIPS, RUNS_CSV_URL, TRIPS_CSV_URL, APPS_SCRIPT_URL } from "./constants.js";
import { fmt, fmtStr, toISO, weeksUntilRace, effortMeta, tripColor, tripBg, getWeekISO, getDayTravel, getWeekTrips, getDatesInRange, buildWeeks, parseRunsCSV, parseTripsCSV } from "./helpers.js";
import Dashboard from "./components/Dashboard.jsx";
import TrainingPlan from "./components/TrainingPlan.jsx";
import TripManager from "./components/TripManager.jsx";
import "./App.css";

const ALL_WEEKS = buildWeeks();
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function App() {
  const [page,   setPage]   = useState("dashboard");
  const [runs,   setRuns]   = useState(INITIAL_RUNS);
  const [trips,  setTrips]  = useState(INITIAL_TRIPS);
  const [loading, setLoading] = useState(true);
  const wl = weeksUntilRace(RACE_DATE);

  const [debugMsg, setDebugMsg] = useState("");

  // Load live data from Google Sheet
  useEffect(() => {
    async function loadData() {
      try {
        const bust = `?cachebust=${Date.now()}`;
        const [runsRes, tripsRes] = await Promise.all([
          fetch(RUNS_CSV_URL + bust),
          fetch(TRIPS_CSV_URL + bust),
        ]);
        const runsText  = await runsRes.text();
        const tripsText = await tripsRes.text();
        const rawRows = runsText.trim().split("\n").length;
        const firstRow = runsText.trim().split("\n")[0];
        const secondRow = runsText.trim().split("\n")[1];
        const parsedRuns  = parseRunsCSV(runsText);
        const parsedTrips = parseTripsCSV(tripsText);
        if (parsedRuns.length  > 0) setRuns(parsedRuns);
        if (parsedTrips.length > 0) setTrips(parsedTrips);
        setDebugMsg(`rows:${rawRows} | h:${firstRow.substring(0,60)} | r1:${secondRow ? secondRow.substring(0,60) : "none"}`);
      } catch(e) {
        setDebugMsg(`❌ Sheet error: ${e.message} — using fallback`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const today = toISO(new Date());
  const upcomingTrips = trips.filter(t => t.endDate >= today);

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-inner">
          <div>
            <div className="header-eyebrow">Training Log</div>
            <div className="header-title">ROAD TO MIAMI</div>
            <div className="header-sub">Half Marathon · Jan 25, 2027 · Sub 2:01:46</div>
          </div>
          <div className="header-countdown">
            <div className="header-weeks">{wl}</div>
            <div className="header-weeks-label">Weeks Out</div>
          </div>
        </div>
        <div className="nav">
          <button className={`nav-btn ${page==="dashboard"?"active":""}`} onClick={()=>setPage("dashboard")}>Dashboard</button>
          <button className={`nav-btn ${page==="plan"?"active":""}`}      onClick={()=>setPage("plan")}>Training Plan</button>
          <button className={`nav-btn ${page==="trips"?"active":""}`}     onClick={()=>setPage("trips")}>✈ Trips ({upcomingTrips.length})</button>
        </div>
      </div>

      {debugMsg && (
        <div style={{textAlign:"center",padding:"6px 20px",fontSize:11,background: debugMsg.startsWith("✅") ? "#ECFFF8" : "#FFF0F3", color: debugMsg.startsWith("✅") ? "#00C97A" : "#FF3D6B", borderBottom:"1px solid #F0EAE3"}}>
          {debugMsg}
        </div>
      )}

      {loading && (
        <div style={{textAlign:"center",padding:"40px",color:"#9990A0",fontSize:13}}>
          Loading your data...
        </div>
      )}

      {!loading && (
        <>
          {page==="dashboard" && <Dashboard runs={runs} setRuns={setRuns} appsScriptUrl={APPS_SCRIPT_URL} />}
          {page==="plan"      && <TrainingPlan weeks={ALL_WEEKS} trips={trips} />}
          {page==="trips"     && <TripManager trips={trips} setTrips={setTrips} appsScriptUrl={APPS_SCRIPT_URL} />}
        </>
      )}
    </div>
  );
}
