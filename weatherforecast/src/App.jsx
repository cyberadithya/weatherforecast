import React, { useState, useEffect } from 'react'
import Weather from './components/Weather'
import CollegeSearch from './components/CollegeSearch'
import { getWeatherByCoords, getForecastByCoords } from './lib/api'
import './Layout.css'

export default function App() {
  const [campus, setCampus] = useState(null)
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [units, setUnits] = useState('imperial') // 'imperial' (°F) or 'metric' (°C)

  // Runs when a college is selected in CollegeSearch
  async function handleSelect(selected) {
    try {
      console.log('[App] campus selected:', selected)
      setCampus(selected)
      setWeather(null)
      setForecast(null)

      const lat = Number(selected.lat)
      const lon = Number(selected.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        console.error('[App] Missing/invalid coords:', { lat: selected.lat, lon: selected.lon })
        return
      }

      const data = await getWeatherByCoords({ lat, lon, units })
      console.log('[App] weather fetched:', data?.weather?.[0]?.main, data?.main?.temp)
      setWeather(data)

      const fc = await getForecastByCoords({ lat, lon, units })
      setForecast(fc)
    } catch (e) {
      console.error('Failed to fetch weather for campus:', e)
    }
  }

  // When units change AND a campus is already selected, refetch for that campus
  useEffect(() => {
    if (!campus) return
    handleSelect(campus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units])

  return (
    <div className="layout">
      <aside className="sidebar">
        <CollegeSearch onSelect={handleSelect} />
        <div style={{ marginTop: 24 }}>
          <UnitsToggle units={units} onChange={setUnits} />
        </div>
      </aside>
      <main className="main">
        <Weather
          externalData={weather}
          selectedCampus={campus}
          forecast={forecast}
          units={units}
        />
      </main>
    </div>
  )
}

// Simple toggle component for switching units
function UnitsToggle({ units, onChange }) {
  const isF = units === 'imperial'
  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontWeight: 600 }}> 
      <button
        onClick={() => onChange('imperial')}
        style={{
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #ccc',
          background: isF ? '#007afc' : '#fff',
          color: isF ? '#fff' : '#000',
          cursor: 'pointer'
        }}
      >
        °F
      </button>
      <button
        onClick={() => onChange('metric')}
        style={{
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #ccc',
          background: !isF ? '#007afc' : '#fff',
          color: !isF ? '#fff' : '#000',
          cursor: 'pointer'
        }}
      >
        °C
      </button>
    </div>
  )
}
