import { useEffect, useState } from 'react'
import axios from 'axios'

const Weather = ({ capital }) => {
  const [weather, setWeather] = useState(null)
  const api_key = import.meta.env.VITE_WEATHER_API_KEY

  useEffect(() => {
    if (!capital) return

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${api_key}`

    axios
      .get(url)
      .then(response => {
        setWeather(response.data)
      })
      .catch(error => {
        console.error('Error fetching weather data:', error)
      })
  }, [capital])

  if (!weather) return null

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <p><strong>Temperature:</strong> {weather.main.temp} °C</p>
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
      />
      <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
    </div>
  )
}

export default Weather
