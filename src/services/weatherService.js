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
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,sunrise,sunset&hourly=temperature_2m,weather_code&past_days=2&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) return { totalRainMm: 0, pastHourly: [], futureHourly: [], sunrise: null, sunset: null };

        const data = await res.json();
        const precipArray = data.daily?.precipitation_sum || [];

        let totalRainMm = 0;
        if (precipArray.length >= 1) totalRainMm += (precipArray[0] || 0);
        if (precipArray.length >= 2) totalRainMm += (precipArray[1] || 0);

        // Build pastHourly array
        const times = data.hourly?.time || [];
        const temps = data.hourly?.temperature_2m || [];
        const codes = data.hourly?.weather_code || [];

        const allHourly = times.map((time, hourIndex) => ({
            time,
            temp: temps[hourIndex],
            weather_code: codes[hourIndex],
        }));

        const nowIso = new Date().toISOString().slice(0, 16);
        const pastHourly = allHourly.filter((h) => h.time < nowIso);
        const futureHourly = allHourly.filter((h) => h.time >= nowIso).slice(0, 7); // Fetch a bit more to accommodate insertions

        // The 'daily' array will have 4 entries (2 past days, 1 current, 1 forecast day)
        // We want the current day's sunrise/sunset.
        // Usually index 2 is the current day if we have past_days=2.
        const currentDayIndex = 2;
        const sunrise = data.daily?.sunrise?.[currentDayIndex] || null;
        const sunset = data.daily?.sunset?.[currentDayIndex] || null;

        return { totalRainMm, pastHourly, futureHourly, sunrise, sunset };
    } catch (e) {
        console.error('Failed to fetch past weather from Open-Meteo:', e);
        return { totalRainMm: 0, pastHourly: [], futureHourly: [], sunrise: null, sunset: null };
    }
};
