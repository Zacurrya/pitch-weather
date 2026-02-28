const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getApiKey = () => import.meta.env.VITE_OPENWEATHER_API_KEY;

/**
 * Fetch current weather, 5-day forecast, and air quality for given coordinates.
 * Returns { current, forecast, airQuality } or throws on failure.
 */
export const fetchWeatherByCoords = async (lat, lng) => {
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
        uvIndex: uviData?.value ?? null
    };
};

/**
 * Get the user's geolocation, falling back to Mile End, London.
 * Returns { lat, lng }.
 */
export const getUserLocation = () => {
    const FALLBACK = { lat: 51.52, lng: -0.04 }; // Mile End

    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(FALLBACK);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => resolve(FALLBACK),
            { timeout: 10000 }
        );
    });
};

/**
 * Fetch total rainfall (in mm) over the past 48 hours and past hourly data using the free Open-Meteo API.
 * This takes no API key.
 */
export const fetchPastWeather = async (lat, lng) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&hourly=temperature_2m,weather_code&past_days=2&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) return { totalRainMm: 0, pastHourly: [] };

        const data = await res.json();
        // data.daily.precipitation_sum usually has [dayBeforeYesterday, yesterday, today]
        // We sum up the past days' rainfall
        const precipArray = data.daily?.precipitation_sum || [];

        // Sum up the first two elements (past 2 days) if they exist
        let totalRainMm = 0;
        if (precipArray.length >= 1) totalRainMm += (precipArray[0] || 0);
        if (precipArray.length >= 2) totalRainMm += (precipArray[1] || 0);

        // Build pastHourly array
        const times = data.hourly?.time || [];
        const temps = data.hourly?.temperature_2m || [];
        const codes = data.hourly?.weather_code || [];

        const pastHourly = times.map((time, idx) => ({
            time,
            temp: temps[idx],
            weather_code: codes[idx]
        }));

        return { totalRainMm, pastHourly };
    } catch (e) {
        console.error("Failed to fetch past weather from Open-Meteo:", e);
        return { totalRainMm: 0, pastHourly: [] };
    }
};
