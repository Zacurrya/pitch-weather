/**
 * Weather API service - all OpenWeatherMap and Open-Meteo network calls.
 * Pure async functions, no React dependencies.
 */

// Set to true to skip OpenWeatherMap API calls and generate random data.
const MOCK_WEATHER = false;

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY;

/* -------- Mock data -------- */

const mockWeatherResponse = () => {
    const now = Math.floor(Date.now() / 1000);
    const current = {
        name: 'London',
        dt: now,
        sys: { sunrise: now - 3600 * 4, sunset: now + 3600 * 6, country: 'GB' },
        main: { temp: 14, feels_like: 12, humidity: 72, pressure: 1012 },
        weather: [{ id: 801, main: 'Clouds', description: 'partly cloudy', icon: '02d' }],
        wind: { speed: 4.5, deg: 220 },
        visibility: 10000,
    };

    const forecast = {
        list: Array.from({ length: 40 }, (_, i) => ({
            dt: now + i * 10800,
            main: { temp: 13 + Math.round(Math.sin(i) * 3), feels_like: 11, humidity: 70 },
            weather: [{ id: 801, main: 'Clouds', description: 'partly cloudy', icon: '02d' }],
            wind: { speed: 4, deg: 210 },
            pop: 0.1,
            dt_txt: new Date((now + i * 10800) * 1000).toISOString(),
        })),
    };

    const airQuality = { list: [{ main: { aqi: 2 } }] };
    const uvIndex = 2;

    return { current, forecast, airQuality, uvIndex };
};

/* -------- API calls -------- */

/**
 * Fetch current weather, 5-day forecast, air quality, and UV index for given coordinates.
 * @returns {{ current, forecast, airQuality, uvIndex }}
 */
export const fetchWeatherByCoords = async (lat, lng) => {
    if (MOCK_WEATHER) return mockWeatherResponse();

    const apiKey = getApiKey();

    const [currentRes, forecastRes, airRes, uviRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`),
        fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`),
        fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`),
        fetch(`${BASE_URL}/uvi?lat=${lat}&lon=${lng}&appid=${apiKey}`),
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    const airData = airRes.ok ? await airRes.json() : null;
    const uviData = uviRes.ok ? await uviRes.json() : null;

    if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('Failed to fetch weather data');
    }

    return {
        current: currentData,
        forecast: forecastData,
        airQuality: airData,
        uvIndex: uviData?.value ?? null,
    };
};

/**
 * Fetch total rainfall (in mm) over the past 48 hours and past/future hourly data
 * using the free Open-Meteo API (no API key required).
 * @returns {{ totalRainMm, pastHourly, futureHourly }}
 */
export const fetchPastWeather = async (lat, lng) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,sunrise,sunset&hourly=temperature_2m,weather_code&past_days=2&forecast_days=2&timezone=auto&timeformat=unixtime`;
        const res = await fetch(url);
        if (!res.ok) return { totalRainMm: 0, pastHourly: [], futureHourly: [], sunrises: [], sunsets: [] };

        const data = await res.json();
        const offsetSeconds = Number.isFinite(data.utc_offset_seconds) ? data.utc_offset_seconds : 0;

        const toUtcIso = (localTime) => {
            if (localTime == null) return null;

            if (typeof localTime === 'number') {
                const ms = localTime < 1000000000000 ? localTime * 1000 : localTime;
                return new Date(ms).toISOString();
            }

            const withZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(localTime);
            if (withZone) {
                const zonedMs = new Date(localTime).getTime();
                return Number.isNaN(zonedMs) ? null : new Date(zonedMs).toISOString();
            }

            const matched = String(localTime).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
            if (matched) {
                const [, y, m, d, h, min, sec] = matched;
                const utcMs = Date.UTC(
                    Number(y),
                    Number(m) - 1,
                    Number(d),
                    Number(h),
                    Number(min),
                    Number(sec || 0),
                ) - offsetSeconds * 1000;
                return new Date(utcMs).toISOString();
            }

            const [datePart, timePart] = String(localTime).split('T');
            if (!datePart || !timePart) {
                const fallback = new Date(localTime);
                return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
            }

            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);

            const utcMs = Date.UTC(year, month - 1, day, hour, minute) - offsetSeconds * 1000;
            return new Date(utcMs).toISOString();
        };

        const precipArray = data.daily?.precipitation_sum || [];

        let totalRainMm = 0;
        if (precipArray.length >= 1) totalRainMm += (precipArray[0] || 0);
        if (precipArray.length >= 2) totalRainMm += (precipArray[1] || 0);

        // Build pastHourly array
        const times = data.hourly?.time || [];
        const temps = data.hourly?.temperature_2m || [];
        const codes = data.hourly?.weather_code || [];

        const allHourly = times.map((time, hourIndex) => ({
            time: toUtcIso(time),
            temp: temps[hourIndex],
            weather_code: codes[hourIndex],
        })).filter((hourly) => hourly.time);

        const nowIso = new Date().toISOString();
        const pastHourly = allHourly.filter((h) => h.time < nowIso);
        // We want at least 12 hours of future data to be safe for 6h display + any sun event insertions
        const futureHourly = allHourly.filter((h) => h.time >= nowIso).slice(0, 12); 

        // Use current and next local day solar events for explicit day/night windows.
        const dailyDates = data.daily?.time || [];
        const dailySunrises = data.daily?.sunrise || [];
        const dailySunsets = data.daily?.sunset || [];

        const toLocalDateKey = (value) => {
            if (typeof value === 'string') {
                const m = value.match(/^\d{4}-\d{2}-\d{2}/);
                if (m) return m[0];
            }

            const iso = toUtcIso(value);
            if (!iso) return null;

            return new Date(new Date(iso).getTime() + offsetSeconds * 1000)
                .toISOString()
                .slice(0, 10);
        };

        const todayLocalDate = new Date(Date.now() + offsetSeconds * 1000).toISOString().slice(0, 10);
        const tomorrowLocalDate = new Date(Date.now() + offsetSeconds * 1000 + 86400000).toISOString().slice(0, 10);

        const selectedIndices = dailyDates
            .map((d, idx) => ({ idx, key: toLocalDateKey(d) }))
            .filter(({ key }) => key === todayLocalDate || key === tomorrowLocalDate)
            .map(({ idx }) => idx);

        const fallbackLength = Math.min(2, Math.max(dailySunrises.length, dailySunsets.length));
        const fallbackIndices = Array.from({ length: fallbackLength }, (_, idx) => idx);
        const indicesToUse = selectedIndices.length > 0 ? selectedIndices : fallbackIndices;

        const sunrises = indicesToUse
            .map((idx) => toUtcIso(dailySunrises[idx]))
            .filter(Boolean);
        const sunsets = indicesToUse
            .map((idx) => toUtcIso(dailySunsets[idx]))
            .filter(Boolean);

        return { totalRainMm, pastHourly, futureHourly, sunrises, sunsets };
    } catch (e) {
        console.error('Failed to fetch past weather from Open-Meteo:', e);
        return { totalRainMm: 0, pastHourly: [], futureHourly: [], sunrises: [], sunsets: [] };
    }
};
