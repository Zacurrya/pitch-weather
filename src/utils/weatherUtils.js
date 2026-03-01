/**
 * Mapping of weather conditions to SVG icon paths.
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
 * Maps Open-Meteo WMO weather codes to our condition strings.
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
 * Get an appropriate background image path based on time and weather.
 * Images are stored locally in /backgrounds/.
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

const formatHour = (h) => `${h.toString().padStart(2, '0')}:00`;

/**
 * Build the 5-item hourly strip shown in the WeatherBar.
 * When forecast data is available the two "after" slots use real forecast entries;
 * the two "before" slots use real past open-meteo entries where weather changed.
 */
export const buildHourlyItems = (weatherData, forecastData, pastHourly) => {
    const currentTemp = Math.round(weatherData.main.temp);
    const currentCondition = weatherData.weather[0]?.main;
    const currentHour = new Date().getHours();

    let before1 = { time: formatHour((currentHour - 2 + 24) % 24), icon: getIconPath('clear'), temp: currentTemp + 2 };
    let before2 = { time: formatHour((currentHour - 1 + 24) % 24), icon: getIconPath('snow'), temp: currentTemp - 1 };
    const current = { time: formatHour(currentHour), icon: getIconPath(currentCondition), temp: currentTemp, isCurrent: true };

    if (pastHourly && pastHourly.length > 0) {
        const nowMs = Date.now();
        // Keep past hours that are strictly before the current hour block roughly
        const validPast = pastHourly.filter((p) => new Date(p.time).getTime() < nowMs - 1800000); // at least 30 mins ago

        if (validPast.length > 0) {
            let pastSlots = [];
            let lastCond = currentCondition?.toLowerCase() || '';

            // Scan backward to find changes
            for (let i = validPast.length - 1; i >= 0; i--) {
                const mapCond = wmoToCondition(validPast[i].weather_code);
                if (mapCond !== lastCond) {
                    pastSlots.push(validPast[i]);
                    lastCond = mapCond;
                }
                if (pastSlots.length === 2) break;
            }

            // Fill blindly if not enough changes found
            for (let i = validPast.length - 1; i >= 0; i--) {
                if (pastSlots.length === 2) break;
                if (!pastSlots.some((s) => s.time === validPast[i].time)) {
                    pastSlots.push(validPast[i]);
                }
            }

            // Ensure chronological order
            pastSlots.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            if (pastSlots.length >= 2) {
                before1 = {
                    time: formatHour(new Date(pastSlots[0].time).getHours()),
                    icon: getIconPath(wmoToCondition(pastSlots[0].weather_code)),
                    temp: Math.round(pastSlots[0].temp)
                };
                before2 = {
                    time: formatHour(new Date(pastSlots[1].time).getHours()),
                    icon: getIconPath(wmoToCondition(pastSlots[1].weather_code)),
                    temp: Math.round(pastSlots[1].temp)
                };
            }
        }
    }

    if (forecastData?.list && forecastData.list.length >= 2) {
        let futureSlots = [];
        let lastCondition = currentCondition;

        // Find the next forecasts where the weather condition changes
        for (const f of forecastData.list) {
            const condition = f.weather[0].main;
            if (condition !== lastCondition) {
                futureSlots.push(f);
                lastCondition = condition;
            }
            if (futureSlots.length === 2) break;
        }

        // Fast-forward fill if there aren't enough changes in the forecast
        for (const f of forecastData.list) {
            if (futureSlots.length === 2) break;
            if (!futureSlots.some((slot) => slot.dt === f.dt)) {
                futureSlots.push(f);
            }
        }

        // Sort chronologically just in case the fill grabbed earlier items
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
