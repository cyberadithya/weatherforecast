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

  // new: last "use my location" coordinates
  const [geoCoords, setGeoCoords] = useState(null) // { lat, lon } or null
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  // Runs when a college is selected in CollegeSearch
  async function handleSelect(selected) {
    try {
      console.log('[App] campus selected:', selected)
      setCampus(selected)
      setGeoCoords(null)       // we're in campus mode now
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

  // NEW: "Use my location" flow
  async function handleUseMyLocation() {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported in this browser.')
      return
    }

    setLocError('')
    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          console.log('[App] geo coords:', lat, lon)

          // clear campus; this becomes a free location
          setCampus(null)
          setGeoCoords({ lat, lon })
          setWeather(null)
          setForecast(null)

          const data = await getWeatherByCoords({ lat, lon, units })
          setWeather(data)

          const fc = await getForecastByCoords({ lat, lon, units })
          setForecast(fc)
        } catch (err) {
          console.error('Failed to fetch weather for your location:', err)
          setLocError('Could not load weather for your location.')
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setLocating(false)
        if (err.code === 1) {
          setLocError('Location permission was denied.')
        } else {
          setLocError('Unable to determine your location.')
        }
      }
    )
  }

  // When units change:
  // - if a campus is selected, refetch campus weather/forecast (existing behavior)
  // - else if we have geoCoords from "use my location", refetch for those coords
  useEffect(() => {
    if (campus) {
      handleSelect(campus)
    } else if (geoCoords) {
      (async () => {
        try {
          const { lat, lon } = geoCoords
          const data = await getWeatherByCoords({ lat, lon, units })
          setWeather(data)
          const fc = await getForecastByCoords({ lat, lon, units })
          setForecast(fc)
        } catch (err) {
          console.error('Failed to refetch for geo coords on units change:', err)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units])

  return (
    <div className="layout">
      <aside className="sidebar">
        <CollegeSearch onSelect={handleSelect} />

        <div style={{ marginTop: 24 }}>
          <UnitsToggle units={units} onChange={setUnits} />
        </div>

        <div style={{ marginTop: 24}}>
          <button
            onClick={handleUseMyLocation}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid #ccc',
              background: '#007afc',
              cursor: 'pointer',
              width: '100%',
              fontWeight: 600,
            }}
          >
            📍 Use my location
          </button>
          {locating && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Detecting your location...
            </div>
          )}
          {locError && (
            <div style={{ marginTop: 8, fontSize: 14, color: '#b00' }}>
              {locError}
            </div>
          )}
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
