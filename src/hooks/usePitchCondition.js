import { useEffect, useState } from 'react';
import { fetchPastWeather } from '@services/weatherService';
import { calcPitchCondition } from '@utils/conditionUtils';

/**
 * Module-level cache: placeId -> { wetness, muddiness, futureHourly }
 */
const conditionCache = new Map();
const CONDITION_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Fetch and calculate pitch surface conditions for a given venue.
 * Caches results by placeId to avoid redundant API calls.
 *
 * @param {object | null} venue - Venue with placeId, lat, lng
 * @param {object | null} weatherData - Current weather data from OpenWeatherMap
 * @returns {{ condition: { wetness, muddiness } | null, futureHourly: Array }}
 */
const usePitchCondition = (venue, weatherData) => {
    const [condition, setCondition] = useState(null);
    const [futureHourly, setFutureHourly] = useState([]);
    const [sunrises, setSunrises] = useState([]);
    const [sunsets, setSunsets] = useState([]);

    useEffect(() => {
        if (!venue?.placeId) return undefined;

        const getCondition = async () => {
            // Return cached result immediately if available
            if (conditionCache.has(venue.placeId)) {
                const cached = conditionCache.get(venue.placeId);
                if (cached?.fetchedAt && Date.now() - cached.fetchedAt < CONDITION_CACHE_TTL_MS) {
                    return cached;
                }
            }

            // Fetch weather specific to this pitch's location
            const { totalRainMm, pastHourly, futureHourly: fh, sunrises: sr, sunsets: ss } = await fetchPastWeather(venue.lat, venue.lng);
            const result = calcPitchCondition(weatherData, totalRainMm, pastHourly);
            conditionCache.set(venue.placeId, {
                ...result,
                futureHourly: fh,
                sunrises: sr || [],
                sunsets: ss || [],
                fetchedAt: Date.now(),
            });
            return conditionCache.get(venue.placeId);
        };

        getCondition().then((cached) => {
            setCondition(cached);
            setFutureHourly(cached?.futureHourly ?? []);
            setSunrises(cached?.sunrises ?? []);
            setSunsets(cached?.sunsets ?? []);
        });

        return () => {
            setCondition(null);
            setFutureHourly([]);
            setSunrises([]);
            setSunsets([]);
        };
    }, [venue?.placeId, venue?.lat, venue?.lng, weatherData]);

    return { condition, futureHourly, sunrises, sunsets };
};

export default usePitchCondition;
