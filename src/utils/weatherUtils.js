/* -------- Icon / Background helpers -------- */


// Maps a weather condition string to a weather-icons (erikflowers) CSS class.

export const getIconClass = (condition, isNight = false) => {
    switch (condition?.toLowerCase()) {
        case 'clear':
            return isNight ? 'wi-night-clear' : 'wi-day-sunny';
        case 'clouds':
            return isNight ? 'wi-night-alt-cloudy' : 'wi-day-cloudy';
        case 'rain':
        case 'drizzle':
            return isNight ? 'wi-night-alt-rain' : 'wi-day-rain';
        case 'snow':
            return isNight ? 'wi-night-alt-snow' : 'wi-day-snow';
        case 'thunderstorm':
            return isNight ? 'wi-night-alt-lightning' : 'wi-day-thunderstorm';
        default:
            return isNight ? 'wi-night-alt-cloudy' : 'wi-day-cloudy-high';
    }
};

/**
 * Shared helper to get icons for timeline items that might be after dark.
 */
export const getHourlyIconClass = (condition, timeIso, sunrise, sunset) => {
    if (!sunrise || !sunset) return getIconClass(condition);
    const t = new Date(timeIso).getTime();
    const sr = new Date(sunrise).getTime();
    const ss = new Date(sunset).getTime();
    const isNight = t < sr || t > ss;
    return getIconClass(condition, isNight);
};

/**
 * Specifically for sun events using weather-icons classes.
 */
export const getSunIconClass = (type, condition) => {
    // Weather-icons has specific sunrise/sunset
    if (type === 'sunrise') return 'wi-sunrise';
    if (type === 'sunset') return 'wi-sunset';
    return getIconClass(condition);
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

/* -------- Display transforms -------- */

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

    const dt = weatherData.dt;
    const sys = weatherData.sys || {};
    const isNight = dt && sys.sunrise && sys.sunset ? (dt < sys.sunrise || dt > sys.sunset) : false;

    const weatherIconClass = getIconClass(weatherData.weather[0].main, isNight);

    return {
        temp,
        feelsLike,
        description,
        humidity,
        visibilityMi,
        windSpeedKmH,
        windDeg,
        weatherIconClass,
        isNight,
        cityName: weatherData.name,
    };
};

/* -------- Hourly strip builder -------- */

const formatHour = (h) => `${h.toString().padStart(2, '0')}:00`;

/**
 * Build the 5-item hourly strip shown in the WeatherBar.
 * Two "before" slots use real past open-meteo entries where weather changed;
 * two "after" slots use real forecast entries.
 */
export const buildHourlyItems = (weatherData, forecastData, pastHourly, sunrise, sunset) => {
    const currentTemp = Math.round(weatherData.main.temp);
    const currentCondition = weatherData.weather[0]?.main;
    const now = new Date();
    const currentHour = now.getHours();
    const nowIso = now.toISOString();

    // Placeholder values for the two past slots
    const twoHoursAgo = new Date(now.getTime() - 7200000);
    const oneHourAgo = new Date(now.getTime() - 3600000);

    let before1 = {
        time: formatHour(twoHoursAgo.getHours()),
        iconClass: getHourlyIconClass('clear', twoHoursAgo, sunrise, sunset),
        temp: currentTemp + 2,
        time_iso: twoHoursAgo.toISOString()
    };
    let before2 = {
        time: formatHour(oneHourAgo.getHours()),
        iconClass: getHourlyIconClass('snow', oneHourAgo, sunrise, sunset),
        temp: currentTemp - 1,
        time_iso: oneHourAgo.toISOString()
    };
    const current = {
        time: formatHour(currentHour),
        iconClass: getHourlyIconClass(currentCondition, nowIso, sunrise, sunset),
        temp: currentTemp,
        isCurrent: true,
        time_iso: nowIso
    };

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
                    iconClass: getHourlyIconClass(wmoToCondition(pastSlots[0].weather_code), pastSlots[0].time, sunrise, sunset),
                    temp: Math.round(pastSlots[0].temp),
                    time_iso: pastSlots[0].time
                };
                before2 = {
                    time: formatHour(new Date(pastSlots[1].time).getHours()),
                    iconClass: getHourlyIconClass(wmoToCondition(pastSlots[1].weather_code), pastSlots[1].time, sunrise, sunset),
                    temp: Math.round(pastSlots[1].temp),
                    time_iso: pastSlots[1].time
                };
            }
        }
    }

    let items = [before1, before2, current];

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
        const f1TimeIso = new Date(f1.dt * 1000).toISOString();
        items.push({
            time: formatHour(new Date(f1.dt * 1000).getHours()),
            iconClass: getHourlyIconClass(f1.weather[0].main, f1TimeIso, sunrise, sunset),
            temp: Math.round(f1.main.temp),
            dt: f1.dt,
            time_iso: f1TimeIso,
            condition: f1.weather[0].main
        });

        const f2 = futureSlots[1];
        const f2TimeIso = new Date(f2.dt * 1000).toISOString();
        items.push({
            time: formatHour(new Date(f2.dt * 1000).getHours()),
            iconClass: getHourlyIconClass(f2.weather[0].main, f2TimeIso, sunrise, sunset),
            temp: Math.round(f2.main.temp),
            dt: f2.dt,
            time_iso: f2TimeIso,
            condition: f2.weather[0].main
        });
    } else {
        const h1 = new Date(now.getTime() + 3600000);
        const h2 = new Date(now.getTime() + 7200000);
        items.push({ time: formatHour(h1.getHours()), iconClass: getHourlyIconClass('rain', h1, sunrise, sunset), temp: currentTemp, condition: 'rain', time_iso: h1.toISOString() });
        items.push({ time: formatHour(h2.getHours()), iconClass: getHourlyIconClass('clouds', h2, sunrise, sunset), temp: currentTemp + 1, condition: 'clouds', time_iso: h2.toISOString() });
    }

    return injectSunEvents(items, sunrise, sunset);
};

/**
 * Injects sunrise/sunset items into a timeline array.
 */
export const injectSunEvents = (hourlyItems, sunrise, sunset) => {
    if (!sunrise && !sunset) return hourlyItems;

    const result = [...hourlyItems];
    const events = [];
    if (sunrise) events.push({ time: sunrise, type: 'sunrise' });
    if (sunset) events.push({ time: sunset, type: 'sunset' });

    // Sort chronologically so earlier insertions don't displace later search indices
    events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    events.forEach(event => {
        const eventTime = new Date(event.time);
        const eventMs = eventTime.getTime();

        let insertIdx = -1;
        for (let i = 0; i < result.length - 1; i++) {
            // time_iso holds the full ISO string; previously-inserted sun events include it too
            const t1 = new Date(result[i].time_iso).getTime();
            const t2 = new Date(result[i + 1].time_iso).getTime();

            if (eventMs > t1 && eventMs < t2) {
                insertIdx = i + 1;
                break;
            }
        }

        if (insertIdx !== -1) {
            const prevItem = result[insertIdx - 1];
            const cond = prevItem.condition || wmoToCondition(prevItem.weather_code) || 'clear';
            result.splice(insertIdx, 0, {
                time: `${eventTime.getHours().toString().padStart(2, '0')}:${eventTime.getMinutes().toString().padStart(2, '0')}`,
                time_iso: event.time,
                iconClass: getSunIconClass(event.type, cond),
                temp: prevItem.temp,
                isSunEvent: true,
                type: event.type,
            });
        }
    });

    return result;
};
