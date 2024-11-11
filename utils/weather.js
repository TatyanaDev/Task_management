const axios = require("axios");

const getWeather = async () => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?id=${process.env.CITY_ID}&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
    const response = await axios.get(url);

    if (response.data) {
      const today = new Date().toISOString().slice(0, 10);

      const todaysForecasts = response.data.list.filter((item) => item.dt_txt.startsWith(today));

      return todaysForecasts[0].weather[0].description;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    return null;
  }
};

module.exports = getWeather;
