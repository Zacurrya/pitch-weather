import { useMemo } from 'react';

const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
const AQI_COLORS = ['aqi--good', 'aqi--fair', 'aqi--moderate', 'aqi--poor', 'aqi--very-poor'];

const UV_THRESHOLDS = [
    { max: 2, label: 'Low', color: 'uv--low' },
    { max: 5, label: 'Moderate', color: 'uv--moderate' },
    { max: 7, label: 'High', color: 'uv--high' },
    { max: 10, label: 'Very High', color: 'uv--very-high' },
];

/**
Derive AQI and UV display values from raw API data.

@param airQuality  OWM air_pollution response
@param uvIndex     Raw UV index value
@returns { aqiLabel, aqiColor, uvLabel, uvColor }
*/
const useAirQuality = (airQuality, uvIndex) => {
    return useMemo(() => {
        // AQI
        const aqiIndex = airQuality?.list?.[0]?.main?.aqi; // 1-5
        const aqiLabel = aqiIndex ? AQI_LABELS[aqiIndex - 1] : null;
        const aqiColor = aqiIndex ? AQI_COLORS[aqiIndex - 1] : 'uv--default';

        // UV
        let uvLabel = 'Loading';
        let uvColor = 'uv--default';

        if (uvIndex != null) {
            const threshold = UV_THRESHOLDS.find((t) => uvIndex <= t.max);
            if (threshold) {
                uvLabel = threshold.label;
                uvColor = threshold.color;
            } else {
                uvLabel = 'Extreme';
                uvColor = 'uv--extreme';
            }
        }

        return { aqiIndex, aqiLabel, aqiColor, uvLabel, uvColor };
    }, [airQuality, uvIndex]);
};

export default useAirQuality;
