import { useEffect, useRef } from 'react';

/**
 * Debounces weather refreshes when the map center changes.
 * Avoids firing a weather fetch on every intermediate position during a pan gesture.
 *
 * @param {{ lat: number, lng: number } | null} visibleCenter - Current visible map center
 * @param {((lat: number, lng: number) => Promise<void>) | null} refreshWeather - Weather refresh function
 * @param {number} delay - Debounce delay in ms (default 600)
 */
const useMapWeatherSync = (visibleCenter, refreshWeather, delay = 600) => {
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!visibleCenter || !refreshWeather) return;

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            refreshWeather(visibleCenter.lat, visibleCenter.lng);
        }, delay);

        return () => clearTimeout(debounceRef.current);
    }, [visibleCenter, refreshWeather, delay]);
};

export default useMapWeatherSync;
