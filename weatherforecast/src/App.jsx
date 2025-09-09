import React, { useState } from 'react'
import Weather from './components/Weather'
import CollegeSearch from './components/CollegeSearch'
import { getCurrent } from './lib/api'

export default function App() {
  // NEW: hold the selected campus and its fetched weather
  const [campus, setCampus] = useState(null)
  const [weather, setWeather] = useState(null)

  // NEW: when user picks a campus from the list
  async function handleSelect(selected) {
    try {
      setCampus(selected) // { id, name, city, state, lat, lon }
      setWeather(null)    // clear previous result while loading

      // call your proxy: /api/weather/current?lat=&lon=
      const data = await getCurrent({ lat: selected.lat, lon: selected.lon })
      setWeather(data)    // raw OpenWeather JSON
    } catch (e) {
      console.error('Failed to fetch weather for campus:', e)
    }
  }

  return (
    <div className='app'>
      {/* NEW: college search sits above your weather UI */}
      <CollegeSearch onSelect={handleSelect} />

      {/* Pass the fetched JSON down.
         In step 6, we’ll make Weather use externalData (if present)
         and otherwise keep behaving like your tutorial version. */}
      <Weather externalData={weather} selectedCampus={campus} />
    </div>
  )
}
