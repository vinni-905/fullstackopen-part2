import axios from 'axios'

const getWeather = (capital, apiKey) => {
  if (!capital) return Promise.reject('No capital provided')
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}`
  return axios.get(url).then((res) => {
    const data = res.data
    return {
      temperature: data.main.temp,
      wind: data.wind.speed,
      icon: data.weather[0].icon,
      description: data.weather[0].description,
    }
  })
}

export default { getWeather }
