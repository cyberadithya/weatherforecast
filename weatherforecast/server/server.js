import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
console.log('[server] OWM_KEY loaded:', (process.env.OWM_KEY || '').slice(0,4) + '...' + (process.env.OWM_KEY || '').slice(-2))
console.log('[server] SCORECARD_KEY present:', !!process.env.SCORECARD_KEY)


const app = express();
app.use(cors());

const SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";
const OWM_BASE = "https://api.openweathermap.org/data/3.0/onecall";

app.get("/api/colleges", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.json([]);
    const params = new URLSearchParams({
      "school.name": q,
      "per_page": "5",
      "fields": "id,school.name,school.city,school.state,location.lat,location.lon",
      "api_key": process.env.SCORECARD_KEY || ""
    });
    const r = await fetch(`${SCORECARD_BASE}?${params.toString()}`);
    if (!r.ok) {
      const msg = await r.text();
      return res.status(r.status).json({ error: "College API error", detail: msg });
    }
    const data = await r.json();
    const results = (data.results || []).map(x => ({
      id: x.id,
      name: x["school.name"],
      city: x["school.city"],
      state: x["school.state"],
      lat: x["location.lat"],
      lon: x["location.lon"]
    })).filter(x => typeof x.lat === "number" && typeof x.lon === "number");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      units: "imperial",
      appid: process.env.OWM_KEY || ""
    });
    const r = await fetch(`${OWM_BASE}?${params.toString()}`);
    if (!r.ok) {
      const msg = await r.text();
      return res.status(r.status).json({ error: "Weather API error", detail: msg });
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`College weather proxy running on http://localhost:${port}`);
});
