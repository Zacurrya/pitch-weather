import { useState, useEffect } from 'react';
import { fetchWeatherByCoords, getUserLocation, fetchPastWeather } from '../services/weatherService';

export const useWeather = () => {
    const [location, setLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [uvIndex, setUvIndex] = useState(null);
    const [recentRainfall, setRecentRainfall] = useState(0);
    const [pastHourly, setPastHourly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const coords = await getUserLocation();
                setLocation(coords);

                const [{ current, forecast, airQuality: aq, uvIndex: uv }, { totalRainMm, pastHourly }] = await Promise.all([
                    fetchWeatherByCoords(coords.lat, coords.lng),
                    fetchPastWeather(coords.lat, coords.lng)
                ]);

                setWeatherData(current);
                setForecastData(forecast);
                setAirQuality(aq);
                setUvIndex(uv);
                setRecentRainfall(totalRainMm);
                setPastHourly(pastHourly);
            } catch (error) {
                console.error('Failed to initialise weather:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return { location, weatherData, forecastData, airQuality, uvIndex, recentRainfall, pastHourly, loading };
};
