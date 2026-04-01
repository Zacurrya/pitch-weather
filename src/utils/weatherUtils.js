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

const toArray = (value) => (Array.isArray(value) ? value : (value ? [value] : []));

const toTimestampMs = (value) => {
    if (value == null) return NaN;
    if (value instanceof Date) return value.getTime();

    if (typeof value === 'number') {
        return value < 1000000000000 ? value * 1000 : value;
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? NaN : parsed;
};

const buildDayIntervals = (sunrises = [], sunsets = []) => {
    const sunriseTimes = toArray(sunrises)
        .map(toTimestampMs)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    const sunsetTimes = toArray(sunsets)
        .map(toTimestampMs)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    const intervals = [];
    let sunsetIdx = 0;

    for (const sunriseTime of sunriseTimes) {
        while (sunsetIdx < sunsetTimes.length && sunsetTimes[sunsetIdx] <= sunriseTime) {
            sunsetIdx += 1;
        }

        if (sunsetIdx < sunsetTimes.length) {
            intervals.push({ start: sunriseTime, end: sunsetTimes[sunsetIdx] });
            sunsetIdx += 1;
        }
    }

    return intervals;
};

const isNightForTime = (timeValue, sunrises = [], sunsets = []) => {
    const timestamp = toTimestampMs(timeValue);
    if (!Number.isFinite(timestamp)) return false;

    const dayIntervals = buildDayIntervals(sunrises, sunsets);
    if (dayIntervals.length === 0) return false;

    for (const interval of dayIntervals) {
        if (timestamp >= interval.start && timestamp < interval.end) {
            return false;
        }

        if (timestamp < interval.start) {
            return true;
        }
    }

    return true;
};

/**
 * Shared helper to get icons for timeline items that might be after dark.
 */
export const getHourlyIconClass = (condition, timeIso, sunrises = [], sunsets = []) => {
    const isNight = isNightForTime(timeIso, sunrises, sunsets);
    return getIconClass(condition, isNight);
};

/**
 * Ensure every timeline item has an icon class computed in weatherUtils.
 */
export const assignTimelineIconClasses = (timelineItems = [], sunrises = [], sunsets = []) => {
    return timelineItems.map((item) => {
        if (item.isSunEvent) {
            return {
                ...item,
                iconClass: getSunIconClass(item.type, item.condition || 'clear')
            };
        }

        const timeIso = item.time_iso || item.time;
        const condition = item.condition || wmoToCondition(item.weather_code) || 'clouds';

        return {
            ...item,
            iconClass: getHourlyIconClass(condition, timeIso, sunrises, sunsets)
        };
    });
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

const buildForecastSlot = (forecastItem) => {
    const time = new Date(forecastItem.dt * 1000);
    return {
        time: formatHour(time.getHours()),
        temp: Math.round(forecastItem.main.temp),
        dt: forecastItem.dt,
        time_iso: time.toISOString(),
        condition: forecastItem.weather[0].main
    };
};

/**
 * Build the 5-item hourly strip shown in the WeatherBar.
 * Two "before" slots use real past open-meteo entries where weather changed;
 * two "after" slots use real forecast entries.
 */
export const buildHourlyItems = (weatherData, forecastData, pastHourly, sunrises, sunsets) => {
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
        condition: 'clear',
        temp: currentTemp + 2,
        time_iso: twoHoursAgo.toISOString()
    };
    let before2 = {
        time: formatHour(oneHourAgo.getHours()),
        condition: 'snow',
        temp: currentTemp - 1,
        time_iso: oneHourAgo.toISOString()
    };
    const current = {
        time: formatHour(currentHour),
        condition: currentCondition,
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
                    condition: wmoToCondition(pastSlots[0].weather_code),
                    temp: Math.round(pastSlots[0].temp),
                    time_iso: pastSlots[0].time
                };
                before2 = {
                    time: formatHour(new Date(pastSlots[1].time).getHours()),
                    condition: wmoToCondition(pastSlots[1].weather_code),
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

        items.push(buildForecastSlot(futureSlots[0]));
        items.push(buildForecastSlot(futureSlots[1]));
    } else {
        const h1 = new Date(now.getTime() + 3600000);
        const h2 = new Date(now.getTime() + 7200000);
        items.push({ time: formatHour(h1.getHours()), temp: currentTemp, condition: 'rain', time_iso: h1.toISOString() });
        items.push({ time: formatHour(h2.getHours()), temp: currentTemp + 1, condition: 'clouds', time_iso: h2.toISOString() });
    }

    return assignTimelineIconClasses(injectSunEvents(items, sunrises, sunsets), sunrises, sunsets);
};

/**
 * Build pitch forecast timeline with precomputed icon classes.
 */
export const buildPitchForecastItems = (futureHourly = [], sunrises = [], sunsets = []) => {
    const items = futureHourly.map((fh) => ({
        time: fh.time,
        time_iso: fh.time,
        displayTime: `${new Date(fh.time).getHours().toString().padStart(2, '0')}:00`,
        condition: wmoToCondition(fh.weather_code),
        temp: Math.round(fh.temp)
    }));

    const timeline = injectSunEvents(items, sunrises, sunsets);
    return assignTimelineIconClasses(timeline, sunrises, sunsets);
};

/**
 * Injects sunrise/sunset items into a timeline array.
 */
export const injectSunEvents = (hourlyItems, sunrises = [], sunsets = []) => {
    // Standardize inputs as arrays
    const sunriseList = toArray(sunrises);
    const sunsetList = toArray(sunsets);

    if (sunriseList.length === 0 && sunsetList.length === 0) return hourlyItems;

    const result = [...hourlyItems];
    const events = [];
    const nowMs = Date.now();

    sunriseList.forEach(sr => {
        const timeMs = toTimestampMs(sr);
        if (Number.isFinite(timeMs) && timeMs > nowMs) events.push({ time: sr, timeMs, type: 'sunrise' });
    });
    sunsetList.forEach(ss => {
        const timeMs = toTimestampMs(ss);
        if (Number.isFinite(timeMs) && timeMs > nowMs) events.push({ time: ss, timeMs, type: 'sunset' });
    });

    events.sort((a, b) => a.timeMs - b.timeMs);

    events.forEach(event => {
        const eventTime = new Date(event.time);
        const eventMs = event.timeMs;

        let insertIdx = -1;
        for (let i = 0; i < result.length - 1; i++) {
            const t1 = toTimestampMs(result[i].time_iso || result[i].time);
            const t2 = toTimestampMs(result[i + 1].time_iso || result[i + 1].time);

            if (!Number.isFinite(t1) || !Number.isFinite(t2)) continue;

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
                time_iso: event.time // for consistent sorting/comparison
            });
        }
    });

    return result;
};
