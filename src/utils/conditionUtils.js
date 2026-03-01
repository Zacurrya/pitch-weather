import { wmoToCondition } from './weatherUtils';

/** WMO codes that indicate rain/drizzle/thunderstorm */
const RAIN_CONDITIONS = new Set(['rain', 'thunderstorm']);

/**
 * Count how many of the past hourly entries had rain.
 */
const countRainHours = (pastHourly) => {
    if (!pastHourly?.length) return 0;
    return pastHourly.filter((h) => RAIN_CONDITIONS.has(wmoToCondition(h.weather_code))).length;
};

/**
 * Hours elapsed since the most recent rainy hour in pastHourly.
 * Returns Infinity if no rain was found.
 */
const hoursSinceLastRain = (pastHourly) => {
    if (!pastHourly?.length) return Infinity;

    const now = Date.now();
    for (let i = pastHourly.length - 1; i >= 0; i--) {
        const cond = wmoToCondition(pastHourly[i].weather_code);
        if (RAIN_CONDITIONS.has(cond)) {
            const hourTime = new Date(pastHourly[i].time).getTime();
            return Math.max(0, (now - hourTime) / (1000 * 60 * 60));
        }
    }
    return Infinity;
};

/**
 * Average temperature across the pastHourly entries (°C).
 */
const avgTemp = (pastHourly) => {
    if (!pastHourly?.length) return 15;
    const sum = pastHourly.reduce((acc, h) => acc + (h.temp ?? 15), 0);
    return sum / pastHourly.length;
};

/**
 * Clamp a value between 0 and 1.
 */
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Calculate pitch surface conditions as percentage scores.
 *
 * @param {object}   weatherData    Current OWM weather response
 * @param {number}   recentRainMm   Total precipitation over the past 48 h (mm)
 * @param {object[]} pastHourly     Array of { time, temp, weather_code } from Open-Meteo
 * @returns {{ wetness: number, muddiness: number }}  Each 0–100
 */
export const calcPitchCondition = (weatherData, recentRainMm = 0, pastHourly = []) => {
    // ── Current conditions ──
    const condition = weatherData?.weather?.[0]?.main?.toLowerCase() || '';
    const isRaining = ['rain', 'drizzle', 'thunderstorm'].some((c) => condition.includes(c));
    const humidity = weatherData?.main?.humidity ?? 50;

    // ── Derived factors ──
    const rainHours = countRainHours(pastHourly);
    const drySince = hoursSinceLastRain(pastHourly);
    const meanTemp = avgTemp(pastHourly);
    const totalHours = pastHourly.length || 48;

    // ────────────────────────────────────
    // Wetness (0–100%)
    // ────────────────────────────────────
    const w_currentRain = isRaining ? 1.0 : 0.0;                          // 40%
    const w_recentRain = clamp01(recentRainMm / 15);                      // 35%
    const w_humidity = clamp01((humidity - 50) / 50);                      // 15%
    const w_drying = drySince === Infinity ? 0 : clamp01(1 - drySince / 12); // 10%

    const wetness = Math.round(
        (w_currentRain * 40 + w_recentRain * 35 + w_humidity * 15 + w_drying * 10)
    );

    // ────────────────────────────────────
    // Muddiness (0–100%)
    // ────────────────────────────────────
    const m_rainfall = clamp01(recentRainMm / 20);                        // 45%
    const m_sustained = clamp01(rainHours / totalHours);                   // 25%
    const m_temp = clamp01((15 - meanTemp) / 15);                          // 15%
    const m_humidity = clamp01((humidity - 50) / 50);                      // 15%

    const muddiness = Math.round(
        (m_rainfall * 45 + m_sustained * 25 + m_temp * 15 + m_humidity * 15)
    );

    return { wetness, muddiness };
};

/**
 * Return a colour class for a given percentage.
 *   0–29  → green  (good)
 *  30–59  → amber  (moderate)
 *  60–100 → red    (poor)
 */
export const conditionColor = (pct) => {
    if (pct < 30) return { bar: 'bg-green-500', text: 'text-green-600' };
    if (pct < 60) return { bar: 'bg-amber-400', text: 'text-amber-600' };
    return { bar: 'bg-red-500', text: 'text-red-600' };
};

/**
 * Convert a percentage to a human-readable label.
 * @param {number} pct  0–100
 * @param {'wetness'|'muddiness'} type
 */
export const conditionLabel = (pct, type) => {
    if (type === 'wetness') {
        if (pct < 15) return 'Bone Dry';
        if (pct < 30) return 'Probably Fine';
        if (pct < 50) return 'Possibly Damp';
        if (pct < 70) return 'Likely Wet';
        return 'Definitely Wet';
    }
    // muddiness
    if (pct < 15) return 'Firm Ground';
    if (pct < 30) return 'Probably Fine';
    if (pct < 50) return 'Possibly Muddy';
    if (pct < 70) return 'Likely Muddy';
    return 'Definitely Muddy';
};
