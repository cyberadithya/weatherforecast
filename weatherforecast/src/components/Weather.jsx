import React, { useEffect, useRef, useState } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import cloud_icon from '../assets/cloud.png'
import clear_icon from '../assets/clear.png'
import humidity_icon from '../assets/humidity.png'
import rainy_icon from '../assets/rainy.png'
import snow_icon from '../assets/snow.png'
import storm_icon from '../assets/storm.png'
import wind_icon from '../assets/wind.png'

const Weather = ({ externalData, selectedCampus }) => {
  const inputRef = useRef()
  const [weatherData, setWeatherData] = useState(false)

  const allIcons = {
    '01d': clear_icon,
    '01n': clear_icon,
    '02d': cloud_icon,
    '02n': cloud_icon,
    '03d': cloud_icon,
    '03n': cloud_icon,
    '04d': cloud_icon,
    '04n': cloud_icon,
    '09d': rainy_icon,
    '09n': rainy_icon,
    '10d': rainy_icon,
    '10n': rainy_icon,
    '11d': storm_icon,
    '11n': storm_icon,
    '13d': snow_icon,
    '13n': snow_icon,
    '50d': cloud_icon,
    '50n': cloud_icon,
  }

  // NEW: if App passes in campus weather (from lat/lon), render it
  useEffect(() => {
    if (!externalData) return
    const iconCode = externalData?.weather?.[0]?.icon
    const icon = allIcons[iconCode] || clear_icon

    setWeatherData({
      humidity: externalData?.main?.humidity,
      windSpeed: externalData?.wind?.speed,
      temp: Math.floor(externalData?.main?.temp ?? 0),
      location: selectedCampus
        ? `${selectedCampus.name} — ${selectedCampus.city}, ${selectedCampus.state}`
        : externalData?.name || 'Selected location',
      icon,
    })
  }, [externalData, selectedCampus])

  // Your original city-search flow (kept as-is)
  const search = async (city) => {
    if (city === '') {
      alert('Please enter a city name')
      return
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${import.meta.env.VITE_APP_ID}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        alert('City not found')
        return
      }

      const icon = allIcons[data.weather[0].icon] || clear_icon
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temp: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
      })

    } catch (error) {
      setWeatherData(false)
      console.error('Error fetching weather data')
    }
  }

  useEffect(() => {
    // default view on load; this won't interfere with campus selection later
    search('New York')
  }, [])

  return (
    <div className='weather'>
      <div className='search-bar'>
        <input ref={inputRef} type='text' placeholder='Search City Name' />
        <img src={search_icon} alt='' onClick={() => search(inputRef.current.value)} />
      </div>

      {/* Optional: show which campus is selected */}
      {selectedCampus && (
        <div style={{ color:"white", marginTop: 20, marginBottom: 10, fontSize: 20, opacity: 1 , textAlign: 'center'}}>
          Selected Campus:
          <br />
          {selectedCampus.name} — {selectedCampus.city}, {selectedCampus.state}
        </div>
      )}

      {weatherData ? (
        <>
          <img src={weatherData.icon} alt='' className='weather-icon' />
          <p className='temperature'>{weatherData.temp}°F</p>
          <p className='location'>{weatherData.location}</p>
          <div className='weather-data'>
            <div className='col'>
              <img src={humidity_icon} alt='' />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className='col'>
              <img src={wind_icon} alt='' />
              <div>
                <p>{weatherData.windSpeed} mph</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

export default Weather
