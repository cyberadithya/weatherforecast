import React, { useState } from 'react'
import Weather from './components/Weather'
import CollegeSearch from './components/CollegeSearch'
import { getWeatherByCoords, getForecastByCoords } from './lib/api'
import './Layout.css'   // NEW

export default function App() {
  // keep track of what campus was chosen and the weather JSON we fetched for it
  const [campus, setCampus] = useState(null)
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)

  // THIS is the "handler" — it runs when a college is selected in CollegeSearch
  async function handleSelect(selected) {
    try {
      console.log('[App] campus selected:', selected) // debug
      setCampus(selected)   // { id, name, city, state, lat, lon }
      setWeather(null)      // clear previous result while we load the new one
      setForecast(null)     // clear previous forecast while we load new one

      const lat = Number(selected.lat)
      const lon = Number(selected.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        console.error('[App] Missing/invalid coords:', { lat: selected.lat, lon: selected.lon })
        return
      }

      // fetch current weather using the campus coordinates
      const data = await getWeatherByCoords({ lat, lon })
      console.log('[App] weather fetched:', data?.weather?.[0]?.main, data?.main?.temp) // debug
      setWeather(data)      // raw OpenWeather JSON goes to Weather as externalData
      const fc = await getForecastByCoords({ lat, lon })
      setForecast(fc)
    } catch (e) {
      console.error('Failed to fetch weather for campus:', e)
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <CollegeSearch onSelect={handleSelect} />
      </aside>
      <main className="main">
        {/* Single Weather card that receives forecast */}
        <Weather externalData={weather} selectedCampus={campus} forecast={forecast} />
      </main>
    </div>
  )

}
