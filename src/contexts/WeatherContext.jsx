import { createContext, useContext } from 'react';
import { useWeather } from '@hooks/useWeather';

/**
 * WeatherContext - provides weather state and refresh function to the entire component tree.
 * Eliminates prop-drilling of weatherData, forecastData, airQuality, etc.
 */
const WeatherContext = createContext(null);

export const WeatherProvider = ({ children }) => {
    const weather = useWeather();

    return (
        <WeatherContext.Provider value={weather}>
            {children}
        </WeatherContext.Provider>
    );
};

/**
 * Hook to consume weather data from the nearest WeatherProvider.
 * @returns {{ location, weatherData, forecastData, airQuality, uvIndex, pastHourly, loading, error, refreshWeather }}
 */
export const useWeatherContext = () => {
    const ctx = useContext(WeatherContext);
    if (!ctx) {
        throw new Error('useWeatherContext must be used within a WeatherProvider');
    }
    return ctx;
};

export default WeatherContext;
