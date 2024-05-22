import axios from "axios";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const getCurrentWeather = (lat, lng) => {
  return axios
    .get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${
        import.meta.env.VITE_WEATHER_API_KEY
      }&units=metric`
    )
    .then((res) => res.data);
};

export default { getCurrentWeather };
