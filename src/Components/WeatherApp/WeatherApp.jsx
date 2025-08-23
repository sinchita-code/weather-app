import { useEffect, useState } from 'react';
import './WeatherApp.css';

import clearIcon from '../Assets/clear.png';
import cloudIcon from '../Assets/cloud.png';
import drizzleIcon from '../Assets/drizzle.png';
import humidityIcon from '../Assets/humidity.png';
import rainIcon from '../Assets/rain.png';
import searchIcon from '../Assets/search.png';
import snowIcon from '../Assets/snow.png';
import windIcon from '../Assets/wind.png';

const WeatherApp = () => {
    let api_key = "";

    // 🔹 React states
    const [wicon, setWicon] = useState(cloudIcon);
    const [temperature, setTemperature] = useState("--°C");
    const [location, setLocation] = useState("---");
    const [description, setDescription] = useState("---");
    const [humidity, setHumidity] = useState("--%");
    const [wind, setWind] = useState("-- km/h");
    const [precip, setPrecip] = useState("--%");
    const [feelsLike, setFeelsLike] = useState("--°C");
    const [sunrise, setSunrise] = useState("--");
    const [sunset, setSunset] = useState("--");
    const [aqi, setAqi] = useState("-- AQI");
    const [aqiStatus, setAqiStatus] = useState("--");
    const [hourlyForecast, setHourlyForecast] = useState([]);

    // Default background
    useEffect(() => {
        document.body.classList.add("default-bg");
    }, []);

    const search = async () => {
        const element = document.getElementsByClassName("CityInput");
        if (element[0].value === "") return;

        try {
            // 🌡 Current Weather API
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${element[0].value}&units=metric&appid=${api_key}`;
            let response = await fetch(url);
            let data = await response.json();
            console.log("🌡 Current Weather API Response:", data);

            if (!data.main) {
                alert("City not found or invalid response.");
                return;
            }

            // ✅ Update state instead of DOM
            setTemperature(Math.floor(data.main.temp) + "°C");
            setLocation(data.name);
            setDescription(data.weather[0].description);
            setHumidity(data.main.humidity + "%");
            setWind(Math.floor(data.wind.speed) + " km/h");
            setFeelsLike(Math.floor(data.main.feels_like) + "°C");
            setSunrise(
                new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );
            setSunset(
                new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );

            // 🎨 Update weather icon
            if (data.weather[0].icon === "01d" || data.weather[0].icon === "01n") setWicon(clearIcon);
            else if (data.weather[0].icon === "02d" || data.weather[0].icon === "02n") setWicon(cloudIcon);
            else if (data.weather[0].icon === "03d" || data.weather[0].icon === "03n") setWicon(drizzleIcon);
            else if (data.weather[0].icon === "04d" || data.weather[0].icon === "04n") setWicon(drizzleIcon);
            else if (data.weather[0].icon === "09d" || data.weather[0].icon === "09n") setWicon(rainIcon);
            else if (data.weather[0].icon === "10d" || data.weather[0].icon === "10n") setWicon(rainIcon);
            else if (data.weather[0].icon === "13d" || data.weather[0].icon === "13n") setWicon(snowIcon);
            else setWicon(clearIcon);

            // 🌈 Background
            document.body.classList.remove(
                "sunny", "rainy", "snowy", "cloudy", "drizzle", "thunderstorm", "mist", "haze", "default-bg"
            );
            switch (data.weather[0].main) {
                case "Clear": document.body.classList.add("sunny"); break;
                case "Rain": document.body.classList.add("rainy"); break;
                case "Snow": document.body.classList.add("snowy"); break;
                case "Clouds": document.body.classList.add("cloudy"); break;
                case "Drizzle": document.body.classList.add("drizzle"); break;
                case "Thunderstorm": document.body.classList.add("thunderstorm"); break;
                case "Mist":
                case "Fog":
                case "Haze": document.body.classList.add("haze"); break;
                default: document.body.classList.add("default-bg"); break;
            }

            // 📍 Get lat/lon
            let lat = data.coord.lat;
            let lon = data.coord.lon;

            // ⏳ Forecast (for precipitation % and hourly)
            try {
                let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`;
                let forecastRes = await fetch(forecastUrl);
                let forecastData = await forecastRes.json();
                console.log("⏳ Forecast API Response:", forecastData);

                // 🌧 Precipitation Probability (next 3h)
                let precipitationChance = Math.round(forecastData.list[0].pop * 100);
                setPrecip(precipitationChance + "%");

                // Hourly Forecast (next 6 entries)
                const hours = forecastData.list.slice(0, 6).map(hourData => ({
                    time: new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: 'numeric' }),
                    temp: Math.floor(hourData.main.temp),
                    pop: Math.round(hourData.pop * 100)
                }));
                setHourlyForecast(hours);

            } catch (forecastError) {
                console.error("Forecast Fetch Error:", forecastError);
            }

            // 🍃 Air Quality
            try {
                let airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
                let airRes = await fetch(airUrl);
                let airData = await airRes.json();
                console.log("🍃 Air Quality API Response:", airData);

                const aqiValue = airData.list[0].main.aqi;
                setAqi(aqiValue + " AQI");

                let status = "Unknown";
                switch (aqiValue) {
                    case 1: status = "Good"; break;
                    case 2: status = "Fair"; break;
                    case 3: status = "Moderate"; break;
                    case 4: status = "Poor"; break;
                    case 5: status = "Very Poor"; break;
                    default: status = "Unknown"; break;
                }
                setAqiStatus(status);
            } catch (airError) {
                console.error("Air Quality Fetch Error:", airError);
            }

        } catch (error) {
            console.error("❌ Weather Fetch Error:", error);
        }
    };

    return (
        <div className="container">
            <div className="top-bar">
                <input type="text" className="CityInput" placeholder='Search' />
                <div className="search-icon" onClick={search}>
                    <img src={searchIcon} alt="" />
                </div>
            </div>

            {/* Weather Main Display */}
            <div className="weather-main">
                <div className="weather-image">
                    <img src={wicon} alt="weather" />
                </div>
                <div className="weather-temp">{temperature}</div>
                <div className="weather-location">{location}</div>
                <div className="weather-description">{description}</div>
            </div>

            {/* Weather Info */}
            <div className="info-container">
                <div className="info-card">
                    <img src={humidityIcon} alt="humidity" className="icon" />
                    <p>Humidity</p>
                    <h4 className="humidity-percent">{humidity}</h4>
                </div>
                <div className="info-card">
                    <img src={windIcon} alt="wind" className="icon" />
                    <p>Wind Speed</p>
                    <h4 className="wind-rate">{wind}</h4>
                </div>
                <div className="info-card">
                    <img src={rainIcon} alt="precipitation" className="icon" />
                    <p>Precipitation</p>
                    <h4 className="precip-rate">{precip}</h4>
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="section">
                <h3>Hourly Forecast</h3>
                <div className="hourly-forecast">
                    {hourlyForecast.map((hour, idx) => (
                        <div className="hour" key={idx}>
                            {hour.time}
                            <p>{hour.temp}° | {hour.pop}%</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Extra Info */}
            <div className="extra-info">
                <div className="card">
                    <h4>Air Quality</h4>
                    <p className="aqi">{aqi}</p>
                    <span className="aqi-status">{aqiStatus}</span>
                </div>
                <div className="card">
                    <h4>Feels Like</h4>
                    <p className="feels-like">{feelsLike}</p>
                </div>
            </div>

            {/* Sunrise & Sunset */}
            <div className="sun-schedule">
                <div className="sunrise">🌅 Sunrise <span>{sunrise}</span></div>
                <div className="sunset">🌇 Sunset <span>{sunset}</span></div>
            </div>
        </div>
    );
};

export default WeatherApp;
