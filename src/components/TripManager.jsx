import { useState } from "react";
import { fmtStr, toISO, tripColor, getDatesInRange } from "../helpers.js";

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function TripManager({ trips, setTrips, appsScriptUrl }) {
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ destination:"", emoji:"✈️", startDate:"", endDate:"", type:"leisure", notes:"", restDates:[] });

  const range      = getDatesInRange(form.startDate, form.endDate);
  const toggleRest = d => setForm(p => ({ ...p, restDates: p.restDates.includes(d) ? p.restDates.filter(x=>x!==d) : [...p.restDates, d] }));
  const openAdd    = () => { setForm({ destination:"", emoji:"✈️", startDate:"", endDate:"", type:"leisure", notes:"", restDates:[] }); setEditId(null); setShowForm(true); };
  const openEdit   = t  => { setForm({ destination:t.destination, emoji:t.emoji||"✈️", startDate:t.startDate, endDate:t.endDate, type:t.type, notes:t.notes||"", restDates:[...t.restDates] }); setEditId(t.id); setShowForm(true); };
  const del        = id => setTrips(p => p.filter(t => t.id !== id));

  const save = async () => {
    if (!form.destination || !form.startDate || !form.endDate) return;
    const trip = editId
      ? { ...trips.find(t=>t.id===editId), ...form }
      : { id:`t${Date.now()}`, ...form, tbd:false };

    if (editId) setTrips(p => p.map(t => t.id===editId ? trip : t));
    else        setTrips(p => [...p, trip].sort((a,b) => a.startDate.localeCompare(b.startDate)));
    setShowForm(false);

    if (appsScriptUrl && !editId) {
      setSaving(true);
      try {
        await fetch(appsScriptUrl, {
          method: "POST",
          body: JSON.stringify({ sheet:"Trips", row:{ ...trip, restDates:trip.restDates.join("|") } }),
        });
      } catch(e) { console.log("Save failed:", e); }
      finally { setSaving(false); }
    }
  };

  const today    = toISO(new Date());
  const upcoming = trips.filter(t => t.endDate >= today);
  const past     = trips.filter(t => t.endDate < today);

  return (
    <div style={{padding:"20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#14142B"}}>Travel & Trips</div>
          <div style={{fontSize:11,color:"#9990A0",marginTop:2}}>{trips.length} trips · {upcoming.length} upcoming</div>
        </div>
        <button className="btn btn-sm" onClick={openAdd}>+ Add Trip</button>
      </div>

      {saving && <div style={{textAlign:"center",padding:"8px",fontSize:11,color:"#FF9500",marginBottom:8}}>Saving...</div>}

      {showForm && (
        <div className="card" style={{marginBottom:18,borderTop:"3px solid #FF3D6B"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#FF3D6B",letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>
            {editId?"Edit Trip":"Add New Trip"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"48px 1fr",gap:8,marginBottom:10}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,textTransform:"uppercase"}}>Icon</div>
              <input className="inp" style={{textAlign:"center",fontSize:18,padding:"6px"}} value={form.emoji} onChange={e=>setForm(p=>({...p,emoji:e.target.value}))} />
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,textTransform:"uppercase"}}>Destination *</div>
              <input className="inp" placeholder="e.g. Paris, France" value={form.destination} onChange={e=>setForm(p=>({...p,destination:e.target.value}))} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,textTransform:"uppercase"}}>Start Date *</div>
              <input className="inp" type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value,restDates:[]}))} />
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,textTransform:"uppercase"}}>End Date *</div>
              <input className="inp" type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value,restDates:[]}))} />
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,textTransform:"uppercase"}}>Type</div>
              <select className="inp" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                <option value="leisure">Leisure</option>
                <option value="work">Work</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:700,color:"#BBA898",marginBottom:4,textTransform:"uppercase"}}>Notes</div>
            <textarea className="txta" placeholder="Trip details, running plans..." value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
          </div>
          {range.length > 0 && (
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:"#14142B",marginBottom:3}}>Mark rest / travel days</div>
              <div style={{fontSize:9,color:"#9990A0",marginBottom:8}}>Tap a day to toggle between run and rest.</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {range.map(d => {
                  const isR = form.restDates.includes(d);
                  const dObj = new Date(d+"T12:00:00");
                  return (
                    <div key={d} className="dtog" onClick={()=>toggleRest(d)}
                      style={{background:isR?"#FFF0F3":"#ECFFF8",borderColor:isR?"#FF3D6B":"#00C97A",color:isR?"#FF3D6B":"#00C97A"}}>
                      <div style={{fontSize:9}}>{DAY_NAMES[dObj.getDay()]}</div>
                      <div>{dObj.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                      <div style={{fontSize:9,marginTop:2}}>{isR?"✈ Rest":"🏃 Run"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-sm" onClick={save}>Save</button>
            <button className="btng btn-sm" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,color:"#BBA898",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Upcoming — {upcoming.length}</div>
          {upcoming.map(t => (
            <div key={t.id} className="tcard">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{t.emoji}</span>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#14142B"}}>{t.destination}</span>
                      <span className="pill" style={{background:tripColor(t.type)+"22",color:tripColor(t.type)}}>{t.type}</span>
                      {t.tbd && <span className="pill" style={{background:"#FFD60022",color:"#FF9500"}}>TBD</span>}
                    </div>
                    <div style={{fontSize:10,color:"#9990A0"}}>{fmtStr(t.startDate)} – {fmtStr(t.endDate)} · {getDatesInRange(t.startDate,t.endDate).length} days · {t.restDates.length} rest days</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btng" onClick={()=>openEdit(t)} style={{padding:"4px 12px",fontSize:10}}>Edit</button>
                  <button className="btng" onClick={()=>del(t.id)}   style={{padding:"4px 12px",fontSize:10,color:"#FF3D6B",borderColor:"#FF3D6B44"}}>✕</button>
                </div>
              </div>
              {t.notes && <div style={{fontSize:10,color:"#6A6070",lineHeight:1.6,paddingTop:8,borderTop:"1px solid #F5EFE8"}}>{t.notes}</div>}
              {t.restDates.length > 0 && (
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                  {t.restDates.map(d => <span key={d} className="pill" style={{background:"#FFF0F3",color:"#FF3D6B",fontSize:9}}>✈ {fmtStr(d)}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div style={{fontSize:10,fontWeight:700,color:"#BBA898",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Past — {past.length}</div>
          {past.map(t => (
            <div key={t.id} className="tcard" style={{opacity:.55}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>{t.emoji}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#14142B"}}>{t.destination}</div>
                    <div style={{fontSize:10,color:"#9990A0"}}>{fmtStr(t.startDate)} – {fmtStr(t.endDate)}</div>
                  </div>
                </div>
                <button className="btng" onClick={()=>del(t.id)} style={{padding:"4px 12px",fontSize:10,color:"#FF3D6B",borderColor:"#FF3D6B44"}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
