import React, { useEffect, useMemo, useState } from "react";
import { searchColleges } from "../lib/api";

export default function CollegeSearch({ onSelect }) {
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // simple debounce
  useEffect(() => {
    if (!q.trim()) { setOptions([]); return; }
    setLoading(true);
    setError("");
    const t = setTimeout(async () => {
      try {
        const res = await searchColleges(q.trim());
        setOptions(res);
      } catch (e) {
        setError("Lookup failed");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="college-search" style={{maxWidth: 540, margin: "0 auto 16px"}}>
      <label style={{display:"block", fontWeight:600, marginBottom:8}}>Search a college</label>
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="e.g., Stevens, Columbia, UCLA"
        style={{width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #ccc"}}
      />
      {loading && <div style={{marginTop:8, fontSize:14}}>Searching…</div>}
      {error && <div style={{marginTop:8, fontSize:14, color:"#b00"}}>{error}</div>}
      {options.length > 0 && (
        <div style={{marginTop:8, border:"1px solid #eee", borderRadius:12}}>
          {options.map(o => (
            <button
              key={o.id}
              onClick={()=>onSelect && onSelect(o)}
              style={{display:"block", width:"100%", textAlign:"left", padding:"10px 12px", border:"none", background:"white", borderBottom:"1px solid #f0f0f0", cursor:"pointer"}}
            >
              <div style={{fontWeight:600}}>{o.name}</div>
              <div style={{fontSize:14, color:"#555"}}>{o.city}, {o.state}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
