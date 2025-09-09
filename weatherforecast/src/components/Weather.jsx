import React, { use, useEffect, useRef, useState } from 'react'
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

    const inputRef = useRef()
    const [weatherData, setWeatherData] = useState(false);

    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": cloud_icon,
        "04n": cloud_icon,
        "09d": rainy_icon,
        "09n": rainy_icon,
        "10d": rainy_icon,
        "10n": rainy_icon,
        "11d": storm_icon,
        "11n": storm_icon,
        "13d": snow_icon,
        "13n": snow_icon,
        "50d": cloud_icon,
        "50n": cloud_icon,
    }


    const search = async (city) => {
        if(city === ""){
            alert("Please enter a city name");
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${import.meta.env.VITE_APP_ID}`;

            const response = await fetch(url);
            const data = await response.json();

            if(!response.ok){
                alert("City not found");
                return;
            }

            console.log(data);
            const icon = allIcons[data.weather[0].icon] || clear_icon;
            setWeatherData({
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              temp: Math.floor(data.main.temp),
              location: data.name,
              icon: icon
            })

        } catch (error) {
            setWeatherData(false);
            console.error("Error fetching weather data");
        }
    }

    useEffect(() => {
        search("New York");
    },[])

  return (
    <div className='weather'>
      <div className="search-bar">
        <input ref ={inputRef} type="text" placeholder='Search'/>
        <img src={search_icon} alt="" onClick={()=>search(inputRef.current.value)}/>
      </div>
      {weatherData?<>
      <img src={weatherData.icon} alt="" className='weather-icon'/>
      <p className='temperature'>{weatherData.temp}°F</p>
      <p className='location'>{weatherData.location}</p>
      <div className="weather-data">
        <div className="col">
            <img src={humidity_icon} alt=""/>
            <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
            </div>
        </div>
        <div className="col">
            <img src={wind_icon} alt=""/>
            <div>
                <p>{weatherData.windSpeed} mph</p>
                <span>Wind Speed</span>
            </div>
        </div>
      </div>
      </>:<></>}
    </div>
  )
}

export default Weather
