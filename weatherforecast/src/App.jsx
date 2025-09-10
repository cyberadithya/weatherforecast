import React, { useState } from 'react'
import Weather from './components/Weather'
import CollegeSearch from './components/CollegeSearch'
import { getWeatherByCoords } from './lib/api'   // <- uses your current api.js

export default function App() {
  // keep track of what campus was chosen and the weather JSON we fetched for it
  const [campus, setCampus] = useState(null)
  const [weather, setWeather] = useState(null)

  // THIS is the "handler" — it runs when a college is selected in CollegeSearch
  async function handleSelect(selected) {
    try {
      setCampus(selected)   // { id, name, city, state, lat, lon }
      setWeather(null)      // clear previous result while we load the new one

      // fetch current weather using the campus coordinates
      const data = await getWeatherByCoords({ lat: selected.lat, lon: selected.lon })
      setWeather(data)      // raw OpenWeather JSON goes to Weather as externalData
    } catch (e) {
      console.error('Failed to fetch weather for campus:', e)
    }
  }

  return (
    <div className='app' style={{ padding: 16 }}>
      <CollegeSearch onSelect={handleSelect} />
      <Weather externalData={weather} selectedCampus={campus} />
    </div>
  )
}
