/**
 * Weather display utilities — pure helper functions with no side effects or API calls.
 * API fetching lives in services/weatherService.js; geolocation in services/locationService.js.
 */

// Re-export service functions so existing imports keep working
export { fetchWeatherByCoords, fetchPastWeather } from '../services/weatherService';
export { getUserLocation } from '../services/locationService';

/* ──────────────────────── Icon / Background helpers ──────────────────────── */

/**
 * Map a weather condition string to an SVG icon path.
 */
export const getIconPath = (condition) => {
    switch (condition?.toLowerCase()) {
        case 'clear':
            return '/weather_icons/Sunny.svg';
        case 'clouds':
            return '/weather_icons/Cloudy.svg';
        case 'rain':
        case 'drizzle':
            return '/weather_icons/Raining.svg';
        case 'snow':
            return '/weather_icons/Snowing.svg';
        case 'thunderstorm':
            return '/weather_icons/Hail.svg';
        default:
            return '/weather_icons/SunnyCloudy.svg';
    }
};

/**
 * Map Open-Meteo WMO weather codes to our condition strings.
 */
export const wmoToCondition = (code) => {
    if (code === 0) return 'clear';
    if ([1, 2, 3, 45, 48].includes(code)) return 'clouds';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([95, 96, 99].includes(code)) return 'thunderstorm';
    return 'clouds';
};

/**
 * Get an appropriate background image path based on time-of-day and weather condition.
 */
export const getBackground = (weather, sys, dt) => {
    const isNight = dt < sys.sunrise || dt > sys.sunset;
    const condition = weather[0]?.main?.toLowerCase() || '';

    if (isNight) {
        if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm'))
            return '/backgrounds/rainy_night.png';
        if (condition.includes('cloud')) return '/backgrounds/cloudy_night.png';
        return '/backgrounds/clear_night.png';
    }

    if (condition.includes('thunderstorm')) return '/backgrounds/thunderstorm.png';
    if (condition.includes('rain') || condition.includes('drizzle')) return '/backgrounds/rainy_day.png';
    if (condition.includes('snow')) return '/backgrounds/snowy_day.png';
    if (condition.includes('cloud')) return '/backgrounds/cloudy_day.png';
    return '/backgrounds/sunny_day.png';
};

/* ──────────────────────── Display transforms ──────────────────────── */

/**
 * Derive all display-ready values the WeatherScreen needs from raw API data.
 */
export const transformWeatherForDisplay = (weatherData) => {
    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);

    const rawDescription = weatherData.weather[0].description;
    const description = rawDescription
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const humidity = weatherData.main.humidity;
    const visibilityMi = Math.round((weatherData.visibility || 10000) / 1609.34);
    const windSpeedKmH = Math.round(weatherData.wind.speed * 3.6);
    const windDeg = weatherData.wind.deg || 0;

    const weatherIcon = getIconPath(weatherData.weather[0].main);

    return {
        temp,
        feelsLike,
        description,
        humidity,
        visibilityMi,
        windSpeedKmH,
        windDeg,
        weatherIcon,
        cityName: weatherData.name,
    };
};

/* ──────────────────────── Hourly strip builder ──────────────────────── */

const formatHour = (h) => `${h.toString().padStart(2, '0')}:00`;

/**
 * Build the 5-item hourly strip shown in the WeatherBar.
 * Two "before" slots use real past open-meteo entries where weather changed;
 * two "after" slots use real forecast entries.
 */
export const buildHourlyItems = (weatherData, forecastData, pastHourly) => {
    const currentTemp = Math.round(weatherData.main.temp);
    const currentCondition = weatherData.weather[0]?.main;
    const currentHour = new Date().getHours();

    // Placeholder values for the two past slots
    let before1 = { time: formatHour((currentHour - 2 + 24) % 24), icon: getIconPath('clear'), temp: currentTemp + 2 };
    let before2 = { time: formatHour((currentHour - 1 + 24) % 24), icon: getIconPath('snow'), temp: currentTemp - 1 };
    const current = { time: formatHour(currentHour), icon: getIconPath(currentCondition), temp: currentTemp, isCurrent: true };

    if (pastHourly && pastHourly.length > 0) {
        const nowMs = Date.now();
        const validPast = pastHourly.filter((p) => new Date(p.time).getTime() < nowMs - 1800000);

        if (validPast.length > 0) {
            let pastSlots = [];
            let lastCond = currentCondition?.toLowerCase() || '';

            for (let i = validPast.length - 1; i >= 0; i--) {
                const mapCond = wmoToCondition(validPast[i].weather_code);
                if (mapCond !== lastCond) {
                    pastSlots.push(validPast[i]);
                    lastCond = mapCond;
                }
                if (pastSlots.length === 2) break;
            }

            for (let i = validPast.length - 1; i >= 0; i--) {
                if (pastSlots.length === 2) break;
                if (!pastSlots.some((s) => s.time === validPast[i].time)) {
                    pastSlots.push(validPast[i]);
                }
            }

            pastSlots.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            if (pastSlots.length >= 2) {
                before1 = {
                    time: formatHour(new Date(pastSlots[0].time).getHours()),
                    icon: getIconPath(wmoToCondition(pastSlots[0].weather_code)),
                    temp: Math.round(pastSlots[0].temp),
                };
                before2 = {
                    time: formatHour(new Date(pastSlots[1].time).getHours()),
                    icon: getIconPath(wmoToCondition(pastSlots[1].weather_code)),
                    temp: Math.round(pastSlots[1].temp),
                };
            }
        }
    }

    if (forecastData?.list && forecastData.list.length >= 2) {
        let futureSlots = [];
        let lastCondition = currentCondition;

        for (const f of forecastData.list) {
            const condition = f.weather[0].main;
            if (condition !== lastCondition) {
                futureSlots.push(f);
                lastCondition = condition;
            }
            if (futureSlots.length === 2) break;
        }

        for (const f of forecastData.list) {
            if (futureSlots.length === 2) break;
            if (!futureSlots.some((slot) => slot.dt === f.dt)) {
                futureSlots.push(f);
            }
        }

        futureSlots.sort((a, b) => a.dt - b.dt);

        const f1 = futureSlots[0];
        const after1 = {
            time: formatHour(new Date(f1.dt * 1000).getHours()),
            icon: getIconPath(f1.weather[0].main),
            temp: Math.round(f1.main.temp),
        };

        const f2 = futureSlots[1];
        const after2 = {
            time: formatHour(new Date(f2.dt * 1000).getHours()),
            icon: getIconPath(f2.weather[0].main),
            temp: Math.round(f2.main.temp),
        };

        return [before1, before2, current, after1, after2];
    }

    return [
        before1,
        before2,
        current,
        { time: formatHour((currentHour + 1) % 24), icon: getIconPath('rain'), temp: currentTemp },
        { time: formatHour((currentHour + 2) % 24), icon: getIconPath('clouds'), temp: currentTemp + 1 },
    ];
};
