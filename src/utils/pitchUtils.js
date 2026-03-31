/*
Calculate Haversine distance in km between two lat/lng points.
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

/*
Estimate walking time in minutes (approx. 5 km/h).
*/
export const getWalkingMinutes = (distanceKm) => Math.round((distanceKm / 5) * 60);

/*
Estimate driving time in minutes (approx. 28 km/h city average).
*/
export const getDrivingMinutes = (distanceKm) => Math.max(1, Math.round((distanceKm / 28) * 60));

/*
Estimate bus/public transport time in minutes (approx. 16 km/h with stops).
*/
export const getBusMinutes = (distanceKm) => Math.max(1, Math.round((distanceKm / 16) * 60));


/*
Format a Google Places time object { hours, minutes } to "h:mm am/pm".
*/
const formatPlacesTime = (t) => {
    if (!t) return null;
    const h = t.hours;
    const m = t.minutes || 0;
    const suffix = h >= 12 ? 'pm' : 'am';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return m === 0 ? `${displayH}${suffix}` : `${displayH}:${m.toString().padStart(2, '0')}${suffix}`;
};

/*
Extract today's opening/closing times from Google Places periods.
Returns { opensAt, closesAt } or null.
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



/*
Get the sport icon path for a venue type.
*/
export const getVenueSportIcon = (type) => {
    if (type === 'cricket') return '/sports/Cricket.svg';
    return '/sports/Football.svg';
};

/*
Filter options used in SearchBar.
*/
export const SPORT_FILTERS = [
    { key: 'football', label: 'Football', icon: '/sports/Football.svg' },
    { key: 'cricket', label: 'Cricket', icon: '/sports/Cricket.svg' },
];
