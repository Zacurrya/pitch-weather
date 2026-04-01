import { Eye, Navigation, ChevronUp, Droplets, TreePine, Sun } from 'lucide-react';
import { getBackground, transformWeatherForDisplay } from '@utils/weatherUtils';
import useWeatherContext from '@hooks/useWeatherContext';
import useRainLikelihood from '@hooks/useRainLikelihood';
import useAirQuality from '@hooks/useAirQuality';
import './WeatherScreen.css';

const WeatherScreen = ({ onOpenMap }) => {
    const { weatherData, forecastData, airQuality, uvIndex } = useWeatherContext();

    const {
        temp,
        feelsLike,
        description,
        humidity,
        visibilityMi,
        windSpeedKmH,
        windDeg,
        weatherIconClass,
        cityName,
    } = transformWeatherForDisplay(weatherData);

    const backgroundImage = getBackground(weatherData.weather, weatherData.sys, weatherData.dt);
    const { isRaining, rainPct, rainLabel } = useRainLikelihood(weatherData, forecastData);
    const { aqiIndex, aqiLabel, aqiColor, uvLabel, uvColor } = useAirQuality(airQuality, uvIndex);

    return (
        <div className="weather-screen">
            <div
                className="weather-screen__bg"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                }}
            />
            <div className="weather-screen__overlay" />
            <div className="weather-screen__content">

                {/* City and condition */}
                <div className="weather-screen__header">
                    <h1 className="weather-screen__city">
                        {cityName}
                    </h1>
                    <p className="weather-screen__desc">
                        {description}
                    </p>
                </div>

                {/* Main weather card */}
                <div className="weather-screen__card">
                    <p className="weather-screen__rain-label">
                        {isRaining ? 'Currently Raining' : rainPct != null ? `${rainLabel} (${rainPct}%)` : ''}
                    </p>

                    <i
                        className={`wi ${weatherIconClass} weather-screen__icon`}
                        aria-label={description}
                    />

                    <h2 className="weather-screen__temp">
                        {temp}°C
                    </h2>
                    <p className="weather-screen__feels-like">
                        Feels like {feelsLike}°C
                    </p>
                </div>

                {/* Info cards */}
                <div className="weather-screen__info-row">
                    {/* Air Quality */}
                    <div className="weather-screen__info-card">
                        <TreePine className="weather-screen__info-icon weather-screen__info-icon--aqi" strokeWidth={2.5} />
                        <p className="weather-screen__info-label">Air Quality</p>
                        <p className="weather-screen__info-value">{aqiIndex ?? '-'}</p>
                        <p className={`weather-screen__info-sublabel ${aqiColor}`}>
                            {aqiLabel ?? 'Loading'}
                        </p>
                    </div>

                    {/* UV Index */}
                    <div className="weather-screen__info-card">
                        <Sun className="weather-screen__info-icon weather-screen__info-icon--uv" strokeWidth={2.5} />
                        <p className="weather-screen__info-label">UV Index</p>
                        <p className="weather-screen__info-value">{uvIndex != null ? Math.round(uvIndex) : '-'}</p>
                        <p className={`weather-screen__info-sublabel ${uvColor}`}>
                            {uvLabel}
                        </p>
                    </div>

                    {/* Humidity */}
                    <div className="weather-screen__info-card">
                        <Droplets className="weather-screen__info-icon weather-screen__info-icon--humidity" strokeWidth={2.5} />
                        <p className="weather-screen__info-label">Humidity</p>
                        <p className="weather-screen__info-value">{humidity}%</p>
                        <p className="weather-screen__info-sublabel weather-screen__info-sublabel--humidity">
                            {humidity > 70 ? 'High' : humidity > 40 ? 'Moderate' : 'Low'}
                        </p>
                    </div>
                </div>

                {/* Detail cards */}
                <div className="weather-screen__detail-row">
                    {/* Visibility */}
                    <div className="weather-screen__detail-card">
                        <p className="weather-screen__detail-title">Visibility</p>
                        <Eye className="weather-screen__visibility-icon" strokeWidth={1.5} />
                        <p className="weather-screen__detail-value">{visibilityMi} mi</p>
                    </div>

                    {/* Wind Speed */}
                    <div className="weather-screen__detail-card">
                        <p className="weather-screen__detail-title weather-screen__detail-title--wind">Wind Speed</p>
                        <div className="weather-screen__compass">
                            <span className="weather-screen__compass-label weather-screen__compass-label--n">N</span>
                            <span className="weather-screen__compass-label weather-screen__compass-label--s">S</span>
                            <span className="weather-screen__compass-label weather-screen__compass-label--w">W</span>
                            <span className="weather-screen__compass-label weather-screen__compass-label--e">E</span>
                            <Navigation
                                className="weather-screen__compass-arrow"
                                fill="currentColor"
                                style={{ transform: `rotate(${windDeg + 180}deg)` }}
                            />
                        </div>
                        <p className="weather-screen__detail-value">{windSpeedKmH}km/h</p>
                    </div>
                </div>

                {/* Bottom button to open map */}
                <button
                    onClick={onOpenMap}
                    className="weather-screen__chevron-btn"
                    aria-label="Open Map"
                >
                    <ChevronUp className="weather-screen__chevron-icon" />
                </button>
            </div>
        </div>
    );
};

export default WeatherScreen;
