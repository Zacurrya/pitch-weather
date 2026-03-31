import { useEffect, useState } from 'react';
import { fetchPastWeather } from '@services/weatherService';
import { calcPitchCondition } from '@utils/conditionUtils';

/**
 * Module-level cache: placeId -> { wetness, muddiness, futureHourly }
 */
const conditionCache = new Map();

/**
 * Custom hook to fetch and calculate pitch surface conditions for a given venue.
 * Caches results by placeId to avoid redundant API calls.
 *
 * @param {object | null} venue - Venue with placeId, lat, lng
 * @param {object | null} weatherData - Current weather data from OpenWeatherMap
 * @returns {{ condition: { wetness, muddiness } | null, futureHourly: Array }}
 */
const usePitchCondition = (venue, weatherData) => {
    const [condition, setCondition] = useState(null);
    const [futureHourly, setFutureHourly] = useState([]);

    useEffect(() => {
        if (!venue?.placeId) return;

        const getCondition = async () => {
            // Return cached result immediately if available
            if (conditionCache.has(venue.placeId)) {
                return conditionCache.get(venue.placeId);
            }

            // Fetch weather specific to this pitch's location
            const { totalRainMm, pastHourly, futureHourly: fh } = await fetchPastWeather(venue.lat, venue.lng);
            const result = calcPitchCondition(weatherData, totalRainMm, pastHourly);
            conditionCache.set(venue.placeId, { ...result, futureHourly: fh });
            return conditionCache.get(venue.placeId);
        };

        getCondition().then((cached) => {
            setCondition(cached);
            setFutureHourly(cached?.futureHourly ?? []);
        });

        return () => {
            setCondition(null);
            setFutureHourly([]);
        };
    }, [venue?.placeId, venue?.lat, venue?.lng, weatherData]);

    return { condition, futureHourly };
};

export default usePitchCondition;
