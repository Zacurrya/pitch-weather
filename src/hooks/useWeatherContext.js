import { useContext } from 'react';
import WeatherContext from '@contexts/WeatherContext';

const useWeatherContext = () => {
    const ctx = useContext(WeatherContext);
    if (!ctx) {
        throw new Error('useWeatherContext must be used within a WeatherProvider');
    }
    return ctx;
};

export default useWeatherContext;
