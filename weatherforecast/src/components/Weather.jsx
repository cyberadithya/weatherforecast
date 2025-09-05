import React, { use, useEffect } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import cloud_icon from '../assets/cloud.png'
import clear_icon from '../assets/clear.png'
import humidity_icon from '../assets/humidity.png'
import rainy_icon from '../assets/rainy.png'
import snow_icon from '../assets/snow.png'
import storm_icon from '../assets/storm.png'
import wind_icon from '../assets/wind.png'

const Weather = () => {

    const search = async (city) => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_APP_ID}`;

            const response = await fetch(url);
            const data = await response.json();
            console.log(data);

        } catch (error) {
            
        }
    }

    useEffect(() => {
        search("London");
    },[])

  return (
    <div className='weather'>
      <div className="search-bar">
        <input type="text" placeholder='Search'/>
        <img src={search_icon} alt="" />
      </div>
      <img src={clear_icon} alt="" className='weather-icon'/>
      <p className='temperature'> 16 degrees</p>
      <p className='location'> London, UK</p>
      <div className="weather-data">
        <div className="col">
            <img src={humidity_icon} alt=""/>
            <div>
                <p>91 %</p>
                <span>Humidity</span>
            </div>
        </div>
        <div className="col">
            <img src={wind_icon} alt=""/>
            <div>
                <p>3.6 mph</p>
                <span>Wind Speed</span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Weather
