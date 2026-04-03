import { useState } from "react";
import { AreaChart, Area, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { RACE_DATE, GOAL_DISTANCE, INCREMENT, GOALS, MILESTONES, APPS_SCRIPT_URL } from "../constants.js";
import { fmt, fmtStr, effortMeta } from "../helpers.js";

export default function Dashboard({ runs, setRuns, appsScriptUrl }) {
  const [tab, setTab] = useState("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nr, setNr] = useState({ date:"", distance:"", pace:"", avgHR:"", effort:6, effortLabel:"Moderate", calories:"", time:"", cadence:"", elevation:"" });

  const last = runs[runs.length - 1];
  const pct  = Math.min(100, (last.distance / GOAL_DISTANCE) * 100);
  const next = parseFloat((last.distance + INCREMENT).toFixed(2));
  const cdata = runs.map(r => ({ date:fmtStr(r.date), distance:r.distance, pace:r.paceSeconds, hr:r.avgHR }));

  const proj = (() => {
    const pts = []; let d = last.distance, wk = 0;
    const base = new Date(last.date + "T12:00:00");
    while (d < GOAL_DISTANCE && wk < 60) {
      const dt = new Date(base); dt.setDate(dt.getDate() + wk*7);
      pts.push({ date:fmt(dt), projected:parseFloat(d.toFixed(2)) });
      d += INCREMENT; wk++;
    }
    pts.push({ date:fmt(RACE_DATE), projected:GOAL_DISTANCE });
    return pts;
  })();

  const addRun = async () => {
    if (!nr.date || !nr.distance) return;
    const ps = nr.pace ? (() => { const [m,s] = nr.pace.replace(/['"]/g,"").split(":").map(Number); return (m||0)*60+(s||0); })() : 0;
    const paceFormatted = nr.pace ? (() => { const [m,s] = nr.pace.replace(/['"]/g,"").split(":"); return `${m}'${(s||"00").padStart(2,"0")}"`; })() : "—";
    const newRun = {
      id: runs.length + 1, date: nr.date, distance: parseFloat(nr.distance),
      pace: paceFormatted, paceSeconds: ps, avgHR: parseInt(nr.avgHR)||0,
      calories: parseInt(nr.calories)||0, time: nr.time||"—",
      cadence: parseInt(nr.cadence)||0, effort: parseInt(nr.effort),
      effortLabel: nr.effortLabel, elevation: parseInt(nr.elevation)||0,
    };

    // Optimistic UI update
    setRuns(prev => [...prev, newRun].sort((a,b) => a.date.localeCompare(b.date)));
    setShowAdd(false);
    setNr({ date:"", distance:"", pace:"", avgHR:"", effort:6, effortLabel:"Moderate", calories:"", time:"", cadence:"", elevation:"" });

    // Write to Google Sheet
    if (appsScriptUrl) {
      setSaving(true);
      try {
        await fetch(appsScriptUrl, {
          method: "POST",
          body: JSON.stringify({ sheet: "Runs", row: newRun }),
        });
      } catch(e) { console.log("Save failed:", e); }
      finally { setSaving(false); }
    }
  };

  const tt = { contentStyle:{ background:"#fff", border:"1.5px solid #F0EAE3", borderRadius:10, fontSize:11, fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 4px 14px rgba(20,20,43,.1)" } };

  return (
    <div>
      <div className="tabs">
        {["overview","runs","projection","pace"].map(t => (
          <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="page-content">
        {saving && <div style={{textAlign:"center",padding:"8px",fontSize:11,color:"#FF9500",marginBottom:8}}>Saving to Google Sheet...</div>}

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
              {[
                { l:"Last Run",    v:`${last.distance} mi`, s:fmtStr(last.date), a:"#FF3D6B" },
                { l:"Next Target", v:`${next} mi`,          s:"+0.25 mi",        a:"#00CFFF" },
                { l:"Runs Logged", v:runs.length,           s:"total",           a:"#C6F135" },
                { l:"Total Miles", v:`${runs.reduce((sum,r) => sum + r.distance, 0).toFixed(1)} mi`, s:"since Mar 13", a:"#A78BFA" },
              ].map(x => (
                <div key={x.l} className="card" style={{textAlign:"center",padding:"14px 6px",borderTop:`3px solid ${x.a}`}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:x.a,lineHeight:1}}>{x.v}</div>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:".08em",color:"#BBA898",textTransform:"uppercase",marginTop:5}}>{x.l}</div>
                  <div style={{fontSize:9,color:"#9990A0",marginTop:2}}>{x.s}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{marginBottom:14,borderTop:"3px solid #FF3D6B"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,color:"#14142B"}}>Distance to Goal</span>
                <span style={{fontSize:12,fontWeight:700,color:"#FF3D6B"}}>{last.distance} / {GOAL_DISTANCE} mi</span>
              </div>
              <div style={{height:10,background:"#F5EFE8",borderRadius:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#FF3D6B,#FF9500)",borderRadius:6}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                <span style={{fontSize:9,color:"#BBA898"}}>0 mi</span>
                <span style={{fontSize:9,color:"#BBA898"}}>13.1 mi</span>
              </div>
            </div>

            <div className="card" style={{marginBottom:14,borderTop:"3px solid #FFD600"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#FF9500",textTransform:"uppercase",marginBottom:10}}>2018 PR to Beat</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:"#FFD600",lineHeight:1}}>2:01:46</div>
                  <div style={{fontSize:10,color:"#9990A0",marginTop:3}}>Miami Half · Jan 28, 2018 · 9'05"/mi · 179 bpm avg</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <span className="pill" style={{background:"#ECFFF8",color:"#00C97A"}}>Pace gap closing</span>
                  <div style={{fontSize:10,color:"#9990A0",marginTop:5}}>Gap = stamina, not speed</div>
                </div>
              </div>
            </div>

            <div className="card" style={{marginBottom:14,borderTop:"3px solid #C6F135"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#8AAA00",textTransform:"uppercase",marginBottom:12}}>Recent Trends</div>
              {[
                { l:"Avg Pace", vals:runs.map(r=>r.pace),           better:runs[runs.length-1].paceSeconds<runs[0].paceSeconds },
                { l:"Avg HR",   vals:runs.map(r=>`${r.avgHR} bpm`), better:runs[runs.length-1].avgHR<runs[0].avgHR },
                { l:"Effort",   vals:runs.map(r=>r.effortLabel),    better:runs[runs.length-1].effort<=runs[0].effort },
              ].map(x => (
                <div key={x.l} className="srow">
                  <span style={{fontSize:11,fontWeight:500,color:"#6A6070"}}>{x.l}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,color:"#BBA898"}}>{x.vals[0]}</span>
                    <span style={{color:"#D0C8C0"}}>→</span>
                    <span style={{fontSize:12,fontWeight:700,color:x.better?"#00C97A":"#FF3D6B"}}>{x.vals[x.vals.length-1]}</span>
                    <span>{x.better?"↓":"↑"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{borderTop:"3px solid #00CFFF"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#009FCC",textTransform:"uppercase",marginBottom:12}}>Upcoming Milestones</div>
              {MILESTONES.map(m => {
                const wa = Math.max(0, Math.ceil((m.distance - last.distance) / INCREMENT));
                const eta = new Date(); eta.setDate(eta.getDate() + wa*7);
                const done = last.distance >= m.distance;
                return (
                  <div key={m.distance} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F5EFE8"}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:done?"#ECFFF8":"#F5EFE8",border:`2px solid ${done?"#00C97A":"#E0D8D0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:done?"#00C97A":"#BBA898",flexShrink:0}}>
                      {done?"✓":m.distance}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:done?"#00C97A":"#14142B"}}>{m.label}</div>
                      <div style={{fontSize:10,color:"#9990A0"}}>{m.distance} mi</div>
                    </div>
                    <div style={{fontSize:10,fontWeight:600,color:done?"#00C97A":"#9990A0",textAlign:"right"}}>{done?"Done ✓":`~${wa}w · ${fmt(eta)}`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RUNS */}
        {tab === "runs" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"#9990A0"}}>{runs.length} RUNS LOGGED</div>
              <button className="btn btn-sm" onClick={() => setShowAdd(!showAdd)}>{showAdd?"Cancel":"+ Add Run"}</button>
            </div>
            {showAdd && (
              <div className="card" style={{marginBottom:14,borderTop:"3px solid #FF3D6B"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#FF3D6B",letterSpacing:".08em",textTransform:"uppercase",marginBottom:13}}>Log New Run</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  {[
                    {k:"date",l:"Date *",t:"date"},
                    {k:"distance",l:"Distance (mi) *",t:"number",p:"2.75",s:"0.01"},
                    {k:"pace",l:"Avg Pace (m:ss)",t:"text",p:"8:15"},
                    {k:"avgHR",l:"Avg HR (bpm)",t:"number",p:"145"},
                    {k:"time",l:"Workout Time",t:"text",p:"22:30"},
                    {k:"calories",l:"Active Calories",t:"number",p:"290"},
                    {k:"cadence",l:"Cadence (spm)",t:"number",p:"155"},
                    {k:"elevation",l:"Elevation Gain (ft)",t:"number",p:"60"},
                  ].map(f => (
                    <div key={f.k}>
                      <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,letterSpacing:".08em",textTransform:"uppercase"}}>{f.l}</div>
                      <input className="inp" type={f.t} placeholder={f.p} step={f.s} value={nr[f.k]} onChange={e => setNr(p => ({...p,[f.k]:e.target.value}))} />
                    </div>
                  ))}
                  <div>
                    <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,letterSpacing:".08em",textTransform:"uppercase"}}>Effort (1–10)</div>
                    <select className="inp" value={nr.effort} onChange={e => { const v=parseInt(e.target.value); setNr(p => ({...p,effort:v,effortLabel:v>=8?"Very Hard":v>=6?"Hard":v>=4?"Moderate":"Easy"})); }}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-sm" onClick={addRun}>Save Run</button>
              </div>
            )}
            {[...runs].reverse().map(r => {
              const em = effortMeta(r.effort);
              return (
                <div key={r.id} className="rcard">
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#FF3D6B",lineHeight:1}}>{r.distance}</div>
                    <div style={{fontSize:8,fontWeight:700,color:"#BBA898",letterSpacing:".08em"}}>MI</div>
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#14142B"}}>{fmtStr(r.date)}</span>
                      <span className="pill" style={{background:em.bg,color:em.color}}>{r.effortLabel}</span>
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {r.pace!=="—" && <span style={{fontSize:10,color:"#9990A0"}}>⏱ {r.pace}/mi</span>}
                      {r.avgHR>0    && <span style={{fontSize:10,color:"#9990A0"}}>♥ {r.avgHR} bpm</span>}
                      {r.cadence>0  && <span style={{fontSize:10,color:"#9990A0"}}>↕ {r.cadence} spm</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#6A6070"}}>{r.time}</div>
                    {r.calories>0 && <div style={{fontSize:10,color:"#9990A0"}}>{r.calories} cal</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROJECTION */}
        {tab === "projection" && (
          <div>
            <div className="card" style={{marginBottom:14,borderTop:"3px solid #FF3D6B"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#14142B",marginBottom:2}}>Distance Progression</div>
              <div style={{fontSize:10,color:"#9990A0",marginBottom:14}}>+0.25 mi/week · dashed = projected</div>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={[...cdata,...proj.slice(1)]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE3" />
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#BBA898"}} />
                  <YAxis domain={[0,14]} tick={{fontSize:9,fill:"#BBA898"}} />
                  <Tooltip {...tt} />
                  <ReferenceLine y={13.1} stroke="#FFD600" strokeDasharray="4 4" label={{value:"13.1 mi",fill:"#FF9500",fontSize:9}} />
                  <Bar dataKey="distance" fill="#FF3D6B" opacity={.85} radius={[4,4,0,0]} />
                  <Line dataKey="projected" stroke="#FF9500" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{borderTop:"3px solid #00CFFF"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#14142B",marginBottom:14}}>Milestone ETAs</div>
              {MILESTONES.map(m => {
                const wa = Math.max(0, Math.ceil((m.distance - last.distance) / INCREMENT));
                const eta = new Date(); eta.setDate(eta.getDate() + wa*7);
                const done = last.distance >= m.distance;
                return (
                  <div key={m.distance} className="srow">
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:done?"#00C97A":"#14142B"}}>{m.label}</div>
                      <div style={{fontSize:10,color:"#9990A0"}}>{m.distance} mi</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      {done ? <span style={{fontSize:11,fontWeight:700,color:"#00C97A"}}>Reached ✓</span>
                        : <><div style={{fontSize:11,fontWeight:600,color:"#14142B"}}>{fmt(eta)}</div><div style={{fontSize:9,color:"#9990A0"}}>{wa} weeks away</div></>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PACE */}
        {tab === "pace" && (
          <div>
            <div className="card" style={{marginBottom:14,borderTop:"3px solid #FF3D6B"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#14142B",marginBottom:2}}>Pace Trend</div>
              <div style={{fontSize:10,color:"#9990A0",marginBottom:13}}>Lower = faster</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={cdata}>
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF3D6B" stopOpacity={.15}/><stop offset="95%" stopColor="#FF3D6B" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE3" />
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#BBA898"}} />
                  <YAxis domain={["auto","auto"]} tick={{fontSize:9,fill:"#BBA898"}} tickFormatter={v=>`${Math.floor(v/60)}'${String(v%60).padStart(2,"0")}"`} />
                  <Tooltip {...tt} formatter={v=>[`${Math.floor(v/60)}'${String(v%60).padStart(2,"0")}"/mi`,"Pace"]} />
                  <Area type="monotone" dataKey="pace" stroke="#FF3D6B" fill="url(#pg)" strokeWidth={2.5} dot={{fill:"#FF3D6B",r:4,strokeWidth:2,stroke:"#fff"}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{marginBottom:14,borderTop:"3px solid #FF6B8A"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#14142B",marginBottom:2}}>Heart Rate Trend</div>
              <div style={{fontSize:10,color:"#9990A0",marginBottom:13}}>Avg BPM per run</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={cdata}>
                  <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B8A" stopOpacity={.15}/><stop offset="95%" stopColor="#FF6B8A" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE3" />
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#BBA898"}} />
                  <YAxis domain={[130,165]} tick={{fontSize:9,fill:"#BBA898"}} />
                  <Tooltip {...tt} formatter={v=>[`${v} bpm`,"Avg HR"]} />
                  <Area type="monotone" dataKey="hr" stroke="#FF6B8A" fill="url(#hg)" strokeWidth={2.5} dot={{fill:"#FF6B8A",r:4,strokeWidth:2,stroke:"#fff"}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{borderTop:"3px solid #FFD600"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:"#FF9500",textTransform:"uppercase",marginBottom:13}}>Race Day Goals</div>
              {GOALS.map(g => (
                <div key={g.label} className="srow">
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:g.color,boxShadow:`0 0 8px ${g.color}99`}} />
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#14142B"}}>{g.label}</div>
                      <div style={{fontSize:10,color:"#9990A0"}}>{g.note}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:g.color}}>{g.time}</div>
                    <div style={{fontSize:10,color:"#9990A0"}}>{g.pace}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
