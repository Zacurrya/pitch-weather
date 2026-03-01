import { useMemo } from 'react';

/**
 * Derive rain likelihood from current weather conditions and forecast data.
 *
 * @param {object} weatherData  Current OWM weather response
 * @param {object} forecastData OWM 5-day/3h forecast response
 * @returns {{ isRaining: boolean, rainPct: number|null, rainLabel: string|null }}
 */
const useRainLikelihood = (weatherData, forecastData) => {
    return useMemo(() => {
        if (!weatherData) return { isRaining: false, rainPct: null, rainLabel: null };

        const condition = weatherData.weather?.[0]?.main?.toLowerCase() || '';
        const isRaining = ['rain', 'drizzle', 'thunderstorm'].some((c) => condition.includes(c));

        const pop = forecastData?.list?.[0]?.pop; // 0–1
        const rainPct = pop != null ? Math.round(pop * 100) : null;
        const rainLabel = rainPct != null
            ? (rainPct >= 50 ? 'Likely to Rain' : 'Unlikely to Rain')
            : null;

        return { isRaining, rainPct, rainLabel };
    }, [weatherData, forecastData]);
};

export default useRainLikelihood;
