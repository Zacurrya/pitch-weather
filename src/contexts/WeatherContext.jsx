import { createContext } from 'react';
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

export default WeatherContext;
