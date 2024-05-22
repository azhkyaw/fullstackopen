const Weather = ({ capital, weather }) => (
  <div>
    <h2>Weather in {capital}</h2>
    <p>temperature {weather.main.temp} Celcius</p>
    <img
      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
      alt={weather.weather[0].description}
    />
    <p>wind {weather.wind.speed} m/s</p>
  </div>
);

export default Weather;
