/**
 * Calculate Haversine distance in km between two lat/lng points.
 */
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Estimate walking time in minutes (≈ 5 km/h).
 */
export const getWalkingMinutes = (distanceKm) => Math.round((distanceKm / 5) * 60);

/**
 * Format a Google Places time object { hours, minutes } to "h:mm am/pm".
 */
const formatPlacesTime = (t) => {
    if (!t) return null;
    const h = t.hours;
    const m = t.minutes || 0;
    const suffix = h >= 12 ? 'pm' : 'am';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return m === 0 ? `${displayH}${suffix}` : `${displayH}:${m.toString().padStart(2, '0')}${suffix}`;
};

/**
 * Extract today's opening/closing times from Google Places periods.
 * Returns { opensAt, closesAt } or null.
 */
export const getTodayHours = (periods) => {
    if (!periods || periods.length === 0) return null;

    // If there's only one period with no close, it's open 24/7
    if (periods.length === 1 && !periods[0].close) {
        return { opensAt: 'Open 24hrs', closesAt: null };
    }

    const today = new Date().getDay(); // 0 = Sunday
    const todayPeriod = periods.find((p) => p.open?.day === today);
    if (!todayPeriod) return null;

    return {
        opensAt: formatPlacesTime(todayPeriod.open?.time ? todayPeriod.open : { hours: todayPeriod.open?.hours, minutes: todayPeriod.open?.minutes }),
        closesAt: formatPlacesTime(todayPeriod.close?.time ? todayPeriod.close : { hours: todayPeriod.close?.hours, minutes: todayPeriod.close?.minutes }),
    };
};

/**
 * Check if a venue is closing within the next 90 minutes.
 */
export const isClosingSoon = (periods) => {
    if (!periods || periods.length === 0) return false;
    if (periods.length === 1 && !periods[0].close) return false; // 24/7

    const now = new Date();
    const today = now.getDay();
    const todayPeriod = periods.find((p) => p.open?.day === today);
    if (!todayPeriod?.close) return false;

    const closeH = todayPeriod.close.hours ?? 0;
    const closeM = todayPeriod.close.minutes ?? 0;
    const closeDate = new Date();
    closeDate.setHours(closeH, closeM, 0, 0);

    const diffMin = (closeDate - now) / (1000 * 60);
    return diffMin > 0 && diffMin <= 90;
};

/**
 * Get a readable closing time string from periods.
 */
export const getClosingTimeStr = (periods) => {
    const hours = getTodayHours(periods);
    return hours?.closesAt || null;
};

/**
 * Derive pitch surface conditions from current weather data and recent rainfall.
 * Returns an array of { label, level } objects.
 *   level: 'good' | 'warn' | 'bad'
 */
export const getPitchConditions = (weatherData, recentRainMm = 0) => {
    if (!weatherData) return [];

    const condition = weatherData.weather?.[0]?.main?.toLowerCase() || '';
    const humidity = weatherData.main?.humidity ?? 0;
    const isCurrentlyRaining = ['rain', 'drizzle', 'thunderstorm'].some((c) => condition.includes(c));
    const conditions = [];

    // Wetness
    if (isCurrentlyRaining) {
        conditions.push({ label: 'Likely Wet', level: 'bad' });
    } else if (recentRainMm > 2) {
        // Significant rain in the last 48h
        conditions.push({ label: 'Likely Wet', level: 'bad' });
    } else if (recentRainMm > 0.1 || humidity > 85) {
        conditions.push({ label: 'Possibly Damp', level: 'warn' });
    } else {
        conditions.push({ label: 'Likely Dry', level: 'good' });
    }

    // Muddiness
    if (isCurrentlyRaining && humidity > 70) {
        conditions.push({ label: 'Likely Muddy', level: 'bad' });
    } else if (recentRainMm > 5) {
        // Heavy rain in the last 48h will make grass pitches very muddy
        conditions.push({ label: 'Likely Muddy', level: 'bad' });
    } else if (recentRainMm > 1 || humidity > 80) {
        conditions.push({ label: 'Possibly Muddy', level: 'warn' });
    } else {
        conditions.push({ label: 'Firm Ground', level: 'good' });
    }

    return conditions;
};
