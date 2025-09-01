import React from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import cloud_icon from '../assets/cloud.png'
import clear_icon from '../assets/clear.png'
import humidity_icon from '../assets/humidity.png'
import rainy_icon from '../assets/rainy.png'
import snow_icon from '../assets/snowy.png'
import storm_icon from '../assets/storm.png'
import wind_icon from '../assets/wind.png'

const Weather = () => {
  return (
    <div className='weather'>
      <div className="search-bar">
        <input type="text" placeholder='Search'/>
        <img src={search_icon} alt="" />
      </div>
      <img src={clear_icon} alt="" className='weather-icon'/>
      <p className='temperature'> 16 degrees</p>
      <p className='location'> London, UK</p>
    </div>
  )
}

export default Weather
