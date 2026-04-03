import { useState } from "react";
import { PHASES } from "../constants.js";
import { fmt, fmtStr, tripColor, tripBg, getDayTravel, getWeekTrips } from "../helpers.js";

function DetailBlock({ accentColor, label, value, sub }) {
  return (
    <div style={{background:"#FAFAF8",border:"1.5px solid #F0EAE3",borderRadius:12,padding:"11px 13px"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:"#BBA898",textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <div style={{fontSize:13,fontWeight:700,color:accentColor,marginBottom:3}}>{value}</div>
      <div style={{fontSize:10,color:"#8A8090",lineHeight:1.5}}>{sub}</div>
    </div>
  );
}

function Callout({ color, icon, title, body }) {
  return (
    <div style={{marginTop:10,background:color+"18",border:`1.5px solid ${color}44`,borderRadius:12,padding:"10px 13px"}}>
      <span style={{fontSize:10,fontWeight:700,color,letterSpacing:".08em",textTransform:"uppercase"}}>{icon} {title} — </span>
      <span style={{fontSize:10,color:"#5A5070"}}>{body}</span>
    </div>
  );
}

function WeekRow({ w, expanded, onToggle, trips }) {
  const { ph, iso, days } = w;
  const wTrips  = getWeekTrips(iso, trips);
  const hasTrav = wTrips.length > 0;
  const IS_LIFT = [true,true,false,true,true,false,false];
  const lbls    = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const defColor= [ph.color,ph.color,"#00CFFF",ph.color,ph.color, w.isCB||w.isRace?"#C0B8CC":"#00C97A","#A78BFA"];
  const defDet  = ["Push","Pull",w.week<=12?"Gym Run":"Tempo","Legs","Misc", w.isCB||w.isRace?"Rest":"Easy Run", w.isRace?"RACE":"Long Run"];

  const tiles = lbls.map((l, i) => {
    const tv = getDayTravel(iso[i], trips);
    let color = defColor[i], det = defDet[i], faded = false;
    if (tv) {
      if (tv.isRest) { color="#C0B8CC"; det="Rest ✈"; faded=true; }
      else if (IS_LIFT[i]) { color="#00C97A"; det="Run ✈"; }
      else { det += " ✈"; }
    }
    return { l, color, det, faded, date: days[i] };
  });

  return (
    <div style={{marginBottom:8}}>
      <div className="whdr" onClick={onToggle} style={{
        background: expanded ? ph.light : "#fff",
        border: `1.5px solid ${expanded ? ph.color+"55" : hasTrav ? "#FF950044" : "#F0EAE3"}`,
        borderRadius: expanded ? "14px 14px 0 0" : 14,
      }}>
        {/* Week # */}
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:ph.color,lineHeight:1}}>{w.isRace?"🏁":`W${w.week}`}</div>
          {hasTrav && <div style={{fontSize:10}}>✈</div>}
        </div>

        {/* Date + badges */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:600,color:"#14142B"}}>{w.range}</span>
            {w.isCB&&!w.isRace && <span className="pill" style={{background:"#FFFBEC",color:"#FF9500"}}>Cutback</span>}
            {w.isRace          && <span className="pill" style={{background:"#F5F0FF",color:"#A78BFA"}}>Race Day</span>}
            {wTrips.map(t => <span key={t.id} className="pill" style={{background:tripColor(t.type)+"22",color:tripColor(t.type)}}>{t.emoji} {t.destination.split(",")[0].split("&")[0].trim()}</span>)}
          </div>
          <div style={{fontSize:9,color:"#9990A0",fontWeight:500}}>{ph.label} · {ph.subtitle}</div>
        </div>

        {/* Long run distance */}
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#A78BFA",lineHeight:1}}>{w.isRace?"13.1":w.lr} <span style={{fontSize:13}}>MI</span></div>
          <div style={{fontSize:8,fontWeight:700,color:"#BBA898",letterSpacing:".08em"}}>LONG RUN</div>
        </div>

        {/* Weekly total */}
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:ph.color,lineHeight:1}}>{w.isRace?"13.1":w.weekTotal} <span style={{fontSize:12}}>MI</span></div>
          <div style={{fontSize:8,fontWeight:700,color:"#BBA898",letterSpacing:".08em"}}>TOTAL</div>
          {hasTrav && <div style={{fontSize:8,color:"#FF9500",marginTop:2}}>Travel wk</div>}
        </div>

        <div style={{textAlign:"center",color:"#C0B8CC",fontSize:14,transition:"transform .2s",transform:expanded?"rotate(180deg)":"none"}}>▾</div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{background:ph.light,border:`1.5px solid ${ph.color}44`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"15px 15px 18px"}}>
          {/* Travel banners */}
          {wTrips.map(t => (
            <div key={t.id} style={{background:t.tbd?"#FFFBEC":tripBg(t.type),border:`1.5px solid ${t.tbd?"#FFD60055":tripColor(t.type)+"44"}`,borderLeft:`4px solid ${t.tbd?"#FFD600":tripColor(t.type)}`,borderRadius:12,padding:"11px 13px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{t.emoji}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#14142B"}}>{t.destination}</span>
                  <span className="pill" style={{background:tripColor(t.type)+"22",color:tripColor(t.type)}}>{t.type}</span>
                  {t.tbd && <span className="pill" style={{background:"#FFD60022",color:"#FF9500"}}>TBD</span>}
                </div>
                <span style={{fontSize:9,fontWeight:600,color:"#9990A0"}}>{fmtStr(t.startDate)} – {fmtStr(t.endDate)}</span>
              </div>
              <div style={{fontSize:10,color:"#6A6070",lineHeight:1.6}}>{t.notes}</div>
            </div>
          ))}

          {/* Day tiles */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:13}}>
            {tiles.map((tile, i) => (
              <div key={i} style={{background:tile.faded?"#F8F5F8":"#fff",border:`1.5px solid ${tile.color}33`,borderTop:`3px solid ${tile.color}`,borderRadius:10,padding:"8px 3px",textAlign:"center",opacity:tile.faded?.6:1,boxShadow:"0 1px 4px rgba(20,20,43,.05)"}}>
                <div style={{fontSize:8,fontWeight:700,color:"#BBA898",marginBottom:3,letterSpacing:".1em"}}>{tile.l}</div>
                <div style={{fontSize:9,fontWeight:700,color:tile.color,marginBottom:3}}>{tile.det}</div>
                <div style={{fontSize:9,color:"#9990A0"}}>{tile.date}</div>
              </div>
            ))}
          </div>

          {hasTrav && <div style={{marginBottom:11,background:"#FFF8EC",border:"1.5px solid #FF950033",borderRadius:10,padding:"9px 12px"}}><span style={{fontSize:10,fontWeight:700,color:"#FF9500"}}>🏋️ Travel week — </span><span style={{fontSize:10,color:"#6A6070"}}>No gym access. Lift days become easy runs or rest. Resume normal split when back home.</span></div>}

          {/* Detail blocks */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <DetailBlock accentColor={ph.color} label="Sunday Long Run"  value={w.isRace?"13.1 mi — RACE!":`${w.lr} mi`} sub={w.pace} />
            <DetailBlock accentColor="#00CFFF"  label="Wednesday Focus"  value={w.week<=12?"Gym Class":"Tempo"} sub={getDayTravel(iso[2],trips)?.isRest?"Travel day — skip Wed run this week.":w.wed} />
            <DetailBlock accentColor="#00C97A"  label="Saturday Run"     value={w.isCB||w.isRace?"Rest":w.satDist?`${w.satDist} easy`:"Rest"} sub={w.isCB?"Full rest — let the body adapt.":w.isRace?"Rest. Race tomorrow.":"Easy only. HR under 135."} />
            <DetailBlock accentColor="#FF9500"  label="Lifting Notes"    value={hasTrav?"Travel — runs only":w.week<=12?"Full split":w.week<=24?"Adjust Thu":w.week<=36?"Single-leg Thu":"Reduced vol."} sub={hasTrav?"Gym days become easy runs or rest while traveling.":w.lift} />
          </div>

          {w.isCB&&!w.isRace && <Callout color="#FF9500" icon="⚠"  title="Cutback Week"  body="Lower mileage is intentional. This is when your body adapts. Don't add miles back." />}
          {w.week===31       && <Callout color="#00CFFF" icon="🎯" title="Milestone"     body="First double-digit run (10 mi). You haven't been here since 2018. Take it easy, celebrate it." />}
          {w.week===35       && <Callout color="#00C97A" icon="🏔" title="Peak Week"     body="12 miles — your longest run. Happening in South Florida — great mental prep for race day!" />}
          {w.week===37       && <Callout color="#A78BFA" icon="🌀" title="Taper Begins"  body="Legs may feel heavy or restless. That's the taper working. Do NOT add miles back. Trust the plan." />}
          {wTrips.some(t=>t.tbd) && <Callout color="#FFD600" icon="📋" title="Japan — TBD" body="Come back closer to the trip to map out routes and hotel treadmill options." />}
          {w.isRace && (
            <div style={{marginTop:10,background:"#fff",border:"1.5px solid #A78BFA55",borderRadius:12,padding:"13px 15px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#A78BFA",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>🏁 Race Day Strategy</div>
              {[
                ["Miles 1–3",    "Start 20–30 sec/mi slower than goal. Resist the crowd energy."],
                ["Miles 4–9",    "Settle into goal pace (~9:05/mi). Comfortable, not coasting."],
                ["Miles 10–11",  "Check in. If you have gas, begin a very gradual push."],
                ["Miles 12–13.1","Everything you have left. Negative split = a great race."],
              ].map(([k,v]) => (
                <div key={k} style={{fontSize:11,color:"#5A5070",lineHeight:1.8}}><span style={{fontWeight:700,color:"#14142B"}}>{k}:</span> {v}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrainingPlan({ weeks, trips }) {
  const [exp,  setExp]  = useState(1);
  const [filt, setFilt] = useState(0);
  const vis = weeks.filter(w => filt===0 || w.ph.id===filt);

  return (
    <div>
      <div style={{padding:"15px 20px 13px",borderBottom:"1.5px solid #F0EAE3",background:"#fff"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:13}}>
          {PHASES.map(p => (
            <div key={p.id} style={{background:p.light,border:`1.5px solid ${p.border}`,borderTop:`3px solid ${p.color}`,borderRadius:12,padding:"9px",textAlign:"center",boxShadow:"0 1px 4px rgba(20,20,43,.06)"}}>
              <div style={{fontSize:8,fontWeight:700,color:p.color,letterSpacing:".1em",textTransform:"uppercase"}}>{p.label}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:15,color:"#14142B"}}>{p.subtitle}</div>
              <div style={{fontSize:9,color:"#9990A0"}}>Wks {p.weeks}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button className="pbtn" style={{borderColor:filt===0?"#FF3D6B":"#E8E0D8",color:filt===0?"#FF3D6B":"#9990A0"}} onClick={()=>setFilt(0)}>All 44 Weeks</button>
          {PHASES.map(p => <button key={p.id} className="pbtn" style={{borderColor:filt===p.id?p.color:"#E8E0D8",color:filt===p.id?p.color:"#9990A0"}} onClick={()=>setFilt(filt===p.id?0:p.id)}>{p.label}</button>)}
        </div>
      </div>

      <div style={{padding:"14px 14px 48px"}}>
        <div style={{fontSize:10,fontWeight:600,color:"#C0B8CC",textAlign:"right",marginBottom:10}}>
          ✈ = travel week · tap to expand
        </div>
        {vis.map(w => <WeekRow key={w.week} w={w} expanded={exp===w.week} onToggle={()=>setExp(exp===w.week?null:w.week)} trips={trips} />)}
        <div style={{marginTop:28,textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:".08em",background:"linear-gradient(90deg,#FF3D6B,#FF9500,#FFD600)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MIAMI HALF MARATHON</div>
          <div style={{fontSize:10,fontWeight:600,color:"#BBA898",marginTop:3,letterSpacing:".1em"}}>JAN 25, 2027 · 13.1 MI · TARGET: SUB 2:01:46</div>
        </div>
      </div>
    </div>
  );
}
