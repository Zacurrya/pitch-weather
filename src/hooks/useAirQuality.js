import { useMemo } from 'react';

const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
const AQI_COLORS = ['text-green-600', 'text-lime-600', 'text-amber-600', 'text-orange-600', 'text-red-600'];

const UV_THRESHOLDS = [
    { max: 2, label: 'Low', color: 'text-green-600' },
    { max: 5, label: 'Moderate', color: 'text-amber-600' },
    { max: 7, label: 'High', color: 'text-orange-600' },
    { max: 10, label: 'Very High', color: 'text-red-600' },
];

/**
 * Derive AQI and UV display values from raw API data.
 *
 * @param {object|null} airQuality  OWM air_pollution response
 * @param {number|null} uvIndex     Raw UV index value
 * @returns {{ aqiLabel: string|null, aqiColor: string, uvLabel: string, uvColor: string }}
 */
const useAirQuality = (airQuality, uvIndex) => {
    return useMemo(() => {
        // AQI
        const aqiIndex = airQuality?.list?.[0]?.main?.aqi; // 1–5
        const aqiLabel = aqiIndex ? AQI_LABELS[aqiIndex - 1] : null;
        const aqiColor = aqiIndex ? AQI_COLORS[aqiIndex - 1] : 'text-gray-500';

        // UV
        let uvLabel = 'Loading';
        let uvColor = 'text-gray-500';

        if (uvIndex != null) {
            const threshold = UV_THRESHOLDS.find((t) => uvIndex <= t.max);
            if (threshold) {
                uvLabel = threshold.label;
                uvColor = threshold.color;
            } else {
                uvLabel = 'Extreme';
                uvColor = 'text-purple-600';
            }
        }

        return { aqiIndex, aqiLabel, aqiColor, uvLabel, uvColor };
    }, [airQuality, uvIndex]);
};

export default useAirQuality;
