import { useState } from 'react';
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
    let api_key = "your API key here"; // Replace with your OpenWeatherMap API key

    const [wicon, setWicon] = useState(cloudIcon);
    const [weatherData, setWeatherData] = useState(null);

    // 🌄 Background images for different weathers
    const backgroundImages = {
        Clear: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b",
        Rain: "https://thumb.r2.moele.me/t/38838/38828992/a-0005.jpg",
        Snow: "https://kalumatravel.co.uk/wp-content/uploads/2017/09/Snow.jpg",
        Clouds: "https://images.unsplash.com/photo-1500835556837-99ac94a94552",
        Drizzle: "https://postimg.cc/PC0swwtK",
        Thunderstorm: "https://images.unsplash.com/photo-1500674425229-f692875b0ab7",
        Mist: "https://unsplash.com/photos/a-person-riding-a-surfboard-on-a-wave-in-the-ocean--_rLOQp8aZk",
        Haze: "https://www.freepik.com/free-photo/view-metro-city-buildings-cityscape_2765754.htm#fromView=keyword&page=1&position=0&uuid=f49fb266-6fcd-4807-9fe5-34aebbfdc597&query=Haze+Weather",
        Default: "https://images.unsplash.com/photo-1503264116251-35a269479413",
    };

    const search = async () => {
        const element = document.getElementsByClassName("CityInput");
        if (element[0].value === "") {
            return 0;
        }

        // 🌡 Current Weather
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${element[0].value}&units=metric&appid=${api_key}`;
        let response = await fetch(url);
        let data = await response.json();

        setWeatherData(data);

        const humidity = document.getElementsByClassName("humidity-percent");
        const wind = document.getElementsByClassName("wind-rate");
        const temperature = document.getElementsByClassName("weather-temp");
        const location = document.getElementsByClassName("weather-location");
        const feelsLike = document.querySelector(".feels-like");
        const sunrise = document.querySelector(".sunrise span");
        const sunset = document.querySelector(".sunset span");

        humidity[0].innerHTML = data.main.humidity + "%";
        wind[0].innerHTML = Math.floor(data.wind.speed) + " km/h";
        temperature[0].innerHTML = Math.floor(data.main.temp) + "°C";
        location[0].innerHTML = data.name;
        feelsLike.innerHTML = Math.floor(data.main.feels_like) + "°C";

        let sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        let sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        sunrise.innerHTML = sunriseTime;
        sunset.innerHTML = sunsetTime;

        // 🎨 Update weather icon
        if (data.weather[0].icon === "01d" || data.weather[0].icon === "01n") {
            setWicon(clearIcon);
        } else if (data.weather[0].icon === "02d" || data.weather[0].icon === "02n") {
            setWicon(cloudIcon);
        } else if (data.weather[0].icon === "03d" || data.weather[0].icon === "03n") {
            setWicon(drizzleIcon);
        } else if (data.weather[0].icon === "04d" || data.weather[0].icon === "04n") {
            setWicon(drizzleIcon);
        } else if (data.weather[0].icon === "09d" || data.weather[0].icon === "09n") {
            setWicon(rainIcon);
        } else if (data.weather[0].icon === "10d" || data.weather[0].icon === "10n") {
            setWicon(rainIcon);
        } else if (data.weather[0].icon === "13d" || data.weather[0].icon === "13n") {
            setWicon(snowIcon);
        } else {
            setWicon(clearIcon);
        }

        // 🌈 Dynamic Background
        const weatherMain = data.weather[0].main;
        const bgImage = backgroundImages[weatherMain] || backgroundImages.Default;

        document.body.style.backgroundImage = `url(${bgImage})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";

        // 📍 Get lat/lon for forecast and air quality
        let lat = data.coord.lat;
        let lon = data.coord.lon;

        // ⏳ Hourly Forecast
        let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`;
        let forecastRes = await fetch(forecastUrl);
        let forecastData = await forecastRes.json();

        let hourlyContainer = document.querySelector(".hourly-forecast");
        hourlyContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            let hourData = forecastData.list[i];
            let time = new Date(hourData.dt * 1000).toLocaleTimeString([], { hour: 'numeric' });
            let temp = Math.floor(hourData.main.temp);
            hourlyContainer.innerHTML += `<div class="hour">${time}<p>${temp}°</p></div>`;
        }

        // 🍃 Air Quality
        let airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
        let airRes = await fetch(airUrl);
        let airData = await airRes.json();

        const aqi = airData.list[0].main.aqi;
        const aqiElement = document.querySelector(".aqi");
        const aqiText = document.querySelector(".aqi-status");

        aqiElement.innerHTML = aqi + " AQI";
        switch (aqi) {
            case 1: aqiText.innerHTML = "Good"; break;
            case 2: aqiText.innerHTML = "Fair"; break;
            case 3: aqiText.innerHTML = "Moderate"; break;
            case 4: aqiText.innerHTML = "Poor"; break;
            case 5: aqiText.innerHTML = "Very Poor"; break;
            default: aqiText.innerHTML = "Unknown";
        }
    }

    return (
        <div className="container">
            <div className="top-bar">
                <input type="text" className="CityInput" placeholder='Search' />
                <div className="search-icon" onClick={() => { search() }}>
                    <img src={searchIcon} alt="" />
                </div>
            </div>

            {/* Weather Main Display */}
            <div className="weather-main">
                <div className="weather-image">
                    <img src={wicon} alt="weather" />
                </div>
                <div className="weather-temp">32°C</div>
                <div className="weather-location">Siliguri</div>
                {/* ✅ Show actual description from API */}
                <div className="weather-description">
                    {weatherData?.weather[0].description || "Partly Cloudy"}
                </div>
            </div>

            {/* Weather Info */}
            <div className="info-container">
                <div className="info-card">
                    <img src={humidityIcon} alt="humidity" className="icon" />
                    <p>Humidity</p>
                    <h4 className="humidity-percent">60%</h4>
                </div>
                <div className="info-card">
                    <img src={windIcon} alt="wind" className="icon" />
                    <p>Wind Speed</p>
                    <h4 className="wind-rate">3 km/h</h4>
                </div>
                <div className="info-card">
                    <img src={rainIcon} alt="precipitation" className="icon" />
                    <p>Precipitation</p>
                    <h4 className="precip-rate">30%</h4>
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="section">
                <h3>Hourly Forecast</h3>
                <div className="hourly-forecast"></div>
            </div>

            {/* Extra Info */}
            <div className="extra-info">
                <div className="card">
                    <h4>Air Quality</h4>
                    <p className="aqi">-- AQI</p>
                    <span className="aqi-status">--</span>
                </div>
                <div className="card">
                    <h4>Feels Like</h4>
                    <p className="feels-like">--°C</p>
                </div>
            </div>

            {/* Sunrise & Sunset */}
            <div className="sun-schedule">
                <div className="sunrise">🌅 Sunrise <span>--</span></div>
                <div className="sunset">🌇 Sunset <span>--</span></div>
            </div>
        </div>
    );
}

export default WeatherApp;
