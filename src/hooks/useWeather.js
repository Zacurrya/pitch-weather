import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeatherByCoords, getUserLocation, fetchPastWeather } from '../utils/weatherUtils';

/** Round to ~1 km grid cell for caching. */
const gridKey = (lat, lng) =>
    `${Math.round(lat * 100) / 100},${Math.round(lng * 100) / 100}`;

/** Module-level weather cache: gridKey → { weatherData, forecastData, airQuality, uvIndex, pastHourly } */
const weatherCache = new Map();

export const useWeather = () => {
    const [location, setLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [uvIndex, setUvIndex] = useState(null);
    const [pastHourly, setPastHourly] = useState([]);
    const [loading, setLoading] = useState(true);

    // Keep the original user city name so it never changes on pan
    const cityNameRef = useRef(null);

    /** Fetch + cache weather for any coordinate (bucketed to ~1 km). */
    const fetchAndCache = useCallback(async (lat, lng) => {
        const key = gridKey(lat, lng);
        if (weatherCache.has(key)) {
            return weatherCache.get(key);
        }

        const [{ current, forecast, airQuality: aq, uvIndex: uv }, { totalRainMm, pastHourly: ph }] =
            await Promise.all([
                fetchWeatherByCoords(lat, lng),
                fetchPastWeather(lat, lng),
            ]);

        const entry = {
            weatherData: current,
            forecastData: forecast,
            airQuality: aq,
            uvIndex: uv,
            pastHourly: ph,
        };
        weatherCache.set(key, entry);
        return entry;
    }, []);

    /** Apply a cache entry to state, preserving the original city name. */
    const applyWeather = useCallback((entry) => {
        const patched = { ...entry.weatherData };
        if (cityNameRef.current) {
            patched.name = cityNameRef.current;
        }
        setWeatherData(patched);
        setForecastData(entry.forecastData);
        setAirQuality(entry.airQuality);
        setUvIndex(entry.uvIndex);
        setPastHourly(entry.pastHourly);
    }, []);

    // Initial fetch at user's GPS location
    useEffect(() => {
        const init = async () => {
            try {
                const coords = await getUserLocation();
                setLocation(coords);

                const entry = await fetchAndCache(coords.lat, coords.lng);
                cityNameRef.current = entry.weatherData.name; // lock the city name
                applyWeather(entry);
            } catch (error) {
                console.error('Failed to initialise weather:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [fetchAndCache, applyWeather]);

    /**
     * Refresh weather for a new map center.
     * Only triggers a real API call if the grid cell hasn't been fetched before.
     */
    const refreshWeather = useCallback(
        async (lat, lng) => {
            try {
                const entry = await fetchAndCache(lat, lng);
                applyWeather(entry);
            } catch (err) {
                console.error('Failed to refresh weather:', err);
            }
        },
        [fetchAndCache, applyWeather],
    );

    return { location, weatherData, forecastData, airQuality, uvIndex, pastHourly, loading, refreshWeather };
};
