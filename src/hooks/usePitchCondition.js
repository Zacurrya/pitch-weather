import { useEffect, useState } from 'react';
import { fetchPastWeather } from '@services/weatherService';
import { calcPitchCondition } from '@utils/conditionUtils';

// Module-level cache for API-heavy location weather data.
const placeWeatherCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Fetch and calculate pitch surface conditions for a given venue.
 * Caches results by placeId to avoid redundant API calls.
 *
 * @param {object | null} venue - Venue with placeId, lat, lng
 * @param {object | null} weatherData - Current weather data from OpenWeatherMap
 * @returns {{ condition: { wetness, muddiness } | null, futureHourly: Array }}
 */
const usePitchCondition = (venue, weatherData) => {
    const [conditionState, setConditionState] = useState({
        placeId: null,
        condition: null,
        futureHourly: [],
        sunrise: null,
        sunset: null,
    });

    useEffect(() => {
        if (!venue?.placeId) return undefined;

        let isActive = true;

        const getOrFetchPlaceWeather = async () => {
            const cached = placeWeatherCache.get(venue.placeId);
            const isFresh = cached && (Date.now() - cached.fetchedAt < CACHE_TTL_MS);
            if (isFresh) return cached;

            const fetched = await fetchPastWeather(venue.lat, venue.lng);
            const entry = {
                totalRainMm: fetched.totalRainMm,
                pastHourly: fetched.pastHourly,
                futureHourly: fetched.futureHourly,
                sunrise: fetched.sunrise,
                sunset: fetched.sunset,
                fetchedAt: Date.now(),
            };
            placeWeatherCache.set(venue.placeId, entry);
            return entry;
        };

        getOrFetchPlaceWeather()
            .then((entry) => {
                if (!isActive) return;

                const computed = calcPitchCondition(
                    weatherData,
                    entry?.totalRainMm ?? 0,
                    entry?.pastHourly ?? [],
                );
                setConditionState({
                    placeId: venue.placeId,
                    condition: computed,
                    futureHourly: entry?.futureHourly ?? [],
                    sunrise: entry?.sunrise ?? null,
                    sunset: entry?.sunset ?? null,
                });
            })
            .catch(() => {
                if (!isActive) return;
                setConditionState({
                    placeId: venue.placeId,
                    condition: null,
                    futureHourly: [],
                    sunrise: null,
                    sunset: null,
                });
            });

        return () => {
            isActive = false;
        };
    }, [venue?.placeId, venue?.lat, venue?.lng, weatherData]);

    if (!venue?.placeId || conditionState.placeId !== venue.placeId) {
        return { condition: null, futureHourly: [], sunrise: null, sunset: null };
    }

    return {
        condition: conditionState.condition,
        futureHourly: conditionState.futureHourly,
        sunrise: conditionState.sunrise,
        sunset: conditionState.sunset,
    };
};

export default usePitchCondition;
