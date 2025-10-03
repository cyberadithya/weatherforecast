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


// GET /api/weather?lat=...&lon=...
app.get("/api/weather", async (req, res) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

    // Use FREE endpoint (no One Call 3.0)
    const base = "https://api.openweathermap.org/data/2.5/weather";

    // Accept either env var name to avoid confusion
    const apiKey = process.env.OWM_KEY || process.env.VITE_APP_ID || "";
    if (!apiKey) return res.status(401).json({ error: "Missing OpenWeather API key on server" });

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      units: "imperial",
      appid: apiKey
    });

    const r = await fetch(`${base}?${params.toString()}`);
    const txt = await r.text();
    res.status(r.status).type(r.headers.get("content-type") || "application/json").send(txt);
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

// GET /api/forecast?lat=...&lon=...
app.get("/api/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

    // FREE 5-day / 3-hour forecast endpoint
    const base = "https://api.openweathermap.org/data/2.5/forecast";

    // Use either env var name (whichever you set)
    const apiKey = process.env.OWM_KEY || process.env.VITE_APP_ID || "";
    if (!apiKey) return res.status(401).json({ error: "Missing OpenWeather API key on server" });

    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      units: "imperial",  // keep consistent with your current UI
      appid: apiKey
    });

    const r = await fetch(`${base}?${params.toString()}`);
    const txt = await r.text();
    res.status(r.status).type(r.headers.get("content-type") || "application/json").send(txt);
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`College weather proxy running on http://localhost:${port}`);
});
