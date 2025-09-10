import React, { useEffect, useState } from "react";
import { searchColleges } from "../lib/api";
import './CollegeSearch.css';

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
    <div className="college-search">
      <label className="college-label" htmlFor="college-input">
        Search a College
      </label>

      <input
        id="college-input"
        className="college-input"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="e.g., Stevens, Columbia, UCLA"
      />

      {loading && <div className="status">Searching…</div>}
      {error && <div className="status error">{error}</div>}

      {options.length > 0 && (
        <div className="options">
          {options.map(o => (
            <button
              key={o.id}
              className="option-btn"
              onClick={()=>onSelect && onSelect(o)}
            >
              <div className="option-title">{o.name}</div>
              <div className="option-subtitle">{o.city}, {o.state}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
