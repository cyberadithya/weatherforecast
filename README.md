# College Weather Forecast — What I Built & How It Works

**TL;DR:** A college-focused weather app where you type a university, pick the campus, and instantly see current conditions plus a timezone-correct 5-day forecast. Frontend is React (Vite); a tiny Node/Express proxy handles API keys and data stitching.

**Live demo:** [https://cyberadithya.github.io/weatherforecast/](https://cyberadithya.github.io/weatherforecast/)

## Why this project

Most weather apps start with a city. Students (and families) often think in **campuses**. I wanted a smoother flow: *search college → resolve campus → show weather*. It also gave me a chance to practice modern React, API composition, and small-but-real deployment.

## How it works (high level)

1. **Search a college**
   A debounced autocomplete calls a proxy endpoint that queries the **U.S. College Scorecard API** and returns a clean list: `{ id, name, city, state, lat, lon }`.

2. **Fetch weather for that campus**
   Once a campus is selected, the app uses its `lat/lon` to fetch **current conditions** and a **5-day forecast** from **OpenWeather** (free endpoints). There’s also a direct **city search** path that does the same thing using OpenWeather’s returned coordinates.

3. **Display with accurate day labels**
   Forecast items are grouped by the city’s **local day** using OpenWeather’s `city.timezone` offset so “Today” is truly today for that campus (no off-by-one issues across timezones).

## Architecture

* **Frontend:** React + Vite (GitHub Pages)
* **Backend proxy:** Node + Express (Render)
* **APIs:** College Scorecard (data.gov) + OpenWeather (current + 5-day /forecast)
* **Routing:** In dev, `/api` is proxied by Vite. In production, the app reads `VITE_API_BASE` and talks to the Render service.

Why the proxy? It keeps API keys server-side, normalizes responses, and gives me one stable `/api/...` surface from the client.

## Notable decisions & trade-offs

* **Free OpenWeather endpoints:** I avoided One Call 3.0 (paid) and used `weather` + `forecast` to stay free while still delivering a daily summary.
* **Timezone-correct forecast:** I shift each forecast timestamp by the city’s `timezone` seconds and use UTC getters to label days—this avoids browser-local timezone drift.
* **Split hosting:** Pages for static assets, Render for the API. That keeps costs low and the responsibilities clear.

## What I learned

* **API composition:** Turning a name (college) into a place (lat/lon) and piping that into another API (weather).
* **DX details matter:** Vite `base` paths on GitHub Pages and CORS on the proxy will humble you if you’re sloppy.
* **Small UX wins:** Debounced search feels snappier. Autocomplete disambiguation reduces errors. Defaulting the weather card and auto-updating the forecast when switching campuses keeps things fluid.

## Current features

* College search with debounced autocomplete
* Current conditions + 5-day forecast
* Timezone-accurate day labels (“Today”, then Mon/Tue/…)
* City search fallback (same display & forecast)
* Secure server-side API keys

## What’s next

* **°F/°C toggle** (apply to current + forecast)
* **Single smart search bar** (college first; fallback to city)
* **“Use my location”** shortcut
* **Light caching** on the proxy to reduce API calls

---

Key Pieces of the code are:

* `CollegeSearch.jsx` (debounced autocomplete)
* `Weather.jsx` (card UI + city search)
* `ForecastStrip.jsx` (timezone-safe daily summary)
* `server/server.js` (proxy endpoints for colleges, weather, forecast)
