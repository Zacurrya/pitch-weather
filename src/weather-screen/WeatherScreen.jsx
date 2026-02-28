import React from 'react';
import { Eye, Navigation, ChevronUp, Droplets, TreePine, Sun } from 'lucide-react';  // Removed Wind if not used, or keep it if needed
import { getBackground, transformWeatherForDisplay } from '../utils/weatherUtils';

// AQI levels from OpenWeatherMap (1–5)
const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
const AQI_COLORS = ['text-green-600', 'text-lime-600', 'text-amber-600', 'text-orange-600', 'text-red-600'];

const WeatherScreen = ({ weatherData, airQuality, uvIndex, onOpenMap }) => {
    const {
        temp,
        feelsLike,
        description,
        humidity,
        visibilityMi,
        windSpeedKmH,
        windDeg,
        weatherIcon,
        cityName,
    } = transformWeatherForDisplay(weatherData);

    const backgroundImage = getBackground(weatherData.weather, weatherData.sys, weatherData.dt);

    // Air quality data
    const aqiIndex = airQuality?.list?.[0]?.main?.aqi; // 1–5
    const aqiLabel = aqiIndex ? AQI_LABELS[aqiIndex - 1] : null;
    const aqiColor = aqiIndex ? AQI_COLORS[aqiIndex - 1] : 'text-gray-500';

    // UV Index data
    const getUvLabel = (val) => {
        if (val === null || val === undefined) return { label: 'Loading', color: 'text-gray-500' };
        if (val <= 2) return { label: 'Low', color: 'text-green-600' };
        if (val <= 5) return { label: 'Moderate', color: 'text-amber-600' };
        if (val <= 7) return { label: 'High', color: 'text-orange-600' };
        if (val <= 10) return { label: 'Very High', color: 'text-red-600' };
        return { label: 'Extreme', color: 'text-purple-600' };
    };
    const { label: uvLabel, color: uvColor } = getUvLabel(uvIndex);

    return (
        <div className="h-[100dvh] w-full relative overflow-hidden flex flex-col items-center bg-sky-200">
            {/* Background image */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Semi-transparent overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/15 pointer-events-none" />

            {/* Content wrapper — safe area aware */}
            <div className="relative z-10 flex flex-col items-center justify-between w-full h-full pt-[max(env(safe-area-inset-top,0px),2rem)] pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] px-5">

                {/* ── Top: City & condition ── */}
                <div className="text-center flex-shrink-0 mt-2">
                    <h1 className="text-[clamp(2rem,9vw,2.75rem)] font-semibold text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                        {cityName}
                    </h1>
                    <p className="text-[clamp(0.95rem,4vw,1.25rem)] text-white/90 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                        {description}
                    </p>
                </div>

                {/* ── Center: Main weather card ── */}
                <div className="w-[85%] max-w-[20rem] rounded-[2rem] bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/30 p-[clamp(1rem,4vw,1.5rem)] flex flex-col items-center gap-1">
                    <p className="text-black/80 font-medium text-[clamp(0.8rem,3.2vw,1.05rem)] tracking-wide">
                        Unlikely to Rain (15%)
                    </p>

                    <img
                        src={weatherIcon}
                        alt={description}
                        className="w-[clamp(5.5rem,25vw,9rem)] h-[clamp(5.5rem,25vw,9rem)] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.1)] my-1"
                    />

                    <h2 className="text-[clamp(3rem,13vw,5rem)] leading-[0.95] font-semibold text-black tracking-tighter">
                        {temp}°C
                    </h2>
                    <p className="text-[clamp(0.85rem,3.2vw,1.15rem)] text-black/70 font-medium -mt-1">
                        Feels like {feelsLike}°C
                    </p>
                </div>

                {/* ── Info cards: Air Quality, UV, Humidity ── */}
                <div className="flex gap-2 w-full max-w-[24rem] flex-shrink-0">
                    {/* Air Quality */}
                    <div className="flex-1 rounded-[1.25rem] bg-white/40 backdrop-blur-2xl shadow-sm border border-white/25 py-3 px-2 flex flex-col items-center gap-1">
                        <TreePine className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                        <p className="text-[0.65rem] font-bold text-black/60 uppercase tracking-tight">Air Quality</p>
                        <p className="text-xl font-bold text-black leading-none">{aqiIndex ?? '–'}</p>
                        <p className={`text-[0.6rem] font-bold ${aqiColor} truncate w-full text-center`}>
                            {aqiLabel ?? 'Loading'}
                        </p>
                    </div>

                    {/* UV Index */}
                    <div className="flex-1 rounded-[1.25rem] bg-white/40 backdrop-blur-2xl shadow-sm border border-white/25 py-3 px-2 flex flex-col items-center gap-1">
                        <Sun className="w-6 h-6 text-amber-500" strokeWidth={2.5} />
                        <p className="text-[0.65rem] font-bold text-black/60 uppercase tracking-tight">UV Index</p>
                        <p className="text-xl font-bold text-black leading-none">{uvIndex != null ? Math.round(uvIndex) : '–'}</p>
                        <p className={`text-[0.6rem] font-bold ${uvColor} truncate w-full text-center`}>
                            {uvLabel}
                        </p>
                    </div>

                    {/* Humidity */}
                    <div className="flex-1 rounded-[1.25rem] bg-white/40 backdrop-blur-2xl shadow-sm border border-white/25 py-3 px-2 flex flex-col items-center gap-1">
                        <Droplets className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                        <p className="text-[0.65rem] font-bold text-black/60 uppercase tracking-tight">Humidity</p>
                        <p className="text-xl font-bold text-black leading-none">{humidity}%</p>
                        <p className="text-[0.6rem] font-bold text-blue-600 truncate w-full text-center">
                            {humidity > 70 ? 'High' : humidity > 40 ? 'Moderate' : 'Low'}
                        </p>
                    </div>
                </div>

                {/* ── Detail cards row: Visibility & Wind ── */}
                <div className="flex gap-3 w-[75%] max-w-[18rem] justify-center flex-shrink-0">
                    {/* Visibility */}
                    <div className="flex-1 aspect-square rounded-[1.5rem] bg-white/40 backdrop-blur-2xl shadow-sm border border-white/25 p-4 flex flex-col items-center justify-center gap-2">
                        <p className="text-[clamp(0.75rem,2.8vw,0.95rem)] font-semibold text-black/70">Visibility</p>
                        <Eye className="w-[clamp(2.2rem,9vw,3.5rem)] h-[clamp(2.2rem,9vw,3.5rem)] text-black/80" strokeWidth={1.5} />
                        <p className="text-[clamp(1rem,4vw,1.4rem)] font-bold text-black">{visibilityMi} mi</p>
                    </div>

                    {/* Wind Speed */}
                    <div className="flex-1 aspect-square rounded-[1.5rem] bg-white/40 backdrop-blur-2xl shadow-sm border border-white/25 p-4 flex flex-col items-center justify-center gap-2">
                        <p className="text-[clamp(0.75rem,2.8vw,0.95rem)] font-semibold text-black/70 text-center leading-tight">Wind Speed</p>
                        <div className="relative w-[clamp(3rem,12vw,4.5rem)] h-[clamp(3rem,12vw,4.5rem)] rounded-full border-[2.5px] border-black/60 flex items-center justify-center bg-white/30">
                            <span className="absolute top-1 text-[9px] font-bold text-black/60">N</span>
                            <span className="absolute bottom-1 text-[9px] font-bold text-black/40">S</span>
                            <span className="absolute left-1.5 text-[9px] font-bold text-black/40">W</span>
                            <span className="absolute right-1.5 text-[9px] font-bold text-black/40">E</span>
                            <Navigation
                                className="w-[clamp(1.2rem,5vw,1.8rem)] h-[clamp(1.2rem,5vw,1.8rem)] text-black/80"
                                fill="currentColor"
                                style={{ transform: `rotate(${windDeg + 180}deg)` }}
                            />
                        </div>
                        <p className="text-[clamp(1rem,4vw,1.4rem)] font-bold text-black">{windSpeedKmH}km/h</p>
                    </div>
                </div>

                {/* ── Bottom chevron ── */}
                <button
                    onClick={onOpenMap}
                    className="flex-shrink-0 w-14 h-8 flex items-center justify-center active:opacity-70 transition-all mb-1"
                    aria-label="Open Map"
                >
                    <ChevronUp className="w-9 h-9 text-white stroke-[3] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default WeatherScreen;
