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
import ForecastStrip from './ForecastStrip'
import { getForecastByCoords } from '../lib/api'

const Weather = ({ externalData, selectedCampus, forecast, units = 'imperial' }) => {
  const inputRef = useRef()
  const [weatherData, setWeatherData] = useState(false)
  const [localForecast, setLocalForecast] = useState(null)
  const [lastCity, setLastCity] = useState(null) // remember last city for units toggle
  const [isCityMode, setIsCityMode] = useState(false)
  const [theme, setTheme] = useState('default')

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

  function deriveThemeFromWeather(weatherJson) {
    const main = weatherJson?.weather?.[0]?.main?.toLowerCase()
    if (!main) return 'default'

    if (main.includes('clear')) return 'clear'
    if (main.includes('snow')) return 'snow'
    if (main.includes('rain') || main.includes('drizzle') || main.includes('thunder')) return 'rain'
    if (
      main.includes('cloud') ||
      main.includes('mist') ||
      main.includes('fog') ||
      main.includes('haze') ||
      main.includes('smoke')
    ) {
      return 'cloudy'
    }
    
    return 'default'
  }

  // If App passes in campus weather (from lat/lon), render it
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
    setTheme(deriveThemeFromWeather(externalData))
    // When campus is active, use forecast passed from App
    setLocalForecast(null)
    setIsCityMode(false)
  }, [externalData, selectedCampus])

  // City search (still using OpenWeather directly on the client)
  const search = async (city) => {
    if (city === '') {
      alert('Please enter a city name')
      return
    }
    try {
      setLastCity(city)
      setLocalForecast(null)

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=${units}&appid=${import.meta.env.VITE_APP_ID}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        alert('City not found')
        return
      }

      setIsCityMode(true)
      
      const icon = allIcons[data.weather[0].icon] || clear_icon
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temp: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
      })

      setTheme(deriveThemeFromWeather(data))

      // fetch 5-day forecast using the coords from this city result (via proxy)
      if (data?.coord?.lat != null && data?.coord?.lon != null) {
        try {
          const fc = await getForecastByCoords({
            lat: data.coord.lat,
            lon: data.coord.lon,
            units,
          })
          setLocalForecast(fc)
        } catch (e) {
          console.error('Forecast fetch failed', e)
        }
      }
    } catch (error) {
      setWeatherData(false)
      console.error('Error fetching weather data', error)
    }
  }

  // default view on load
  useEffect(() => {
    search('New York')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If units change and we are in "city mode" (no campus selected), re-run last city search
  useEffect(() => {
    if (selectedCampus) return
    if (!lastCity) return
    search(lastCity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, selectedCampus])

  return (
    <div className={`weather weather--${theme}`}>
      <div className='search-bar'>
        <input ref={inputRef} type='text' placeholder='Search City' />
        <img src={search_icon} alt='' onClick={() => search(inputRef.current.value)} />
      </div>

      {/* Optional: show which campus is selected */}
      {selectedCampus && !isCityMode &&(
        <div
          style={{
            color: 'white',
            marginTop: 20,
            marginBottom: 10,
            fontSize: 20,
            opacity: 1,
            textAlign: 'center',
          }}
        >
          Selected Campus:
          <br />
          {selectedCampus.name} — {selectedCampus.city}, {selectedCampus.state}
        </div>
      )}

      {weatherData ? (
        <>
          <img src={weatherData.icon} alt='' className='weather-icon' />
          <p className='temperature'>
            {weatherData.temp}°{units === 'imperial' ? 'F' : 'C'}
          </p>
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
                <p>
                  {weatherData.windSpeed}{' '}
                  {units === 'imperial' ? 'mph' : 'm/s'}
                </p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
          <div style={{ width: '100%', marginTop: 16 }}>
            {/* Use campus forecast if provided, otherwise local city forecast */}
            <ForecastStrip forecast={localForecast || forecast} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Weather
