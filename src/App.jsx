import { useState } from 'react';
import { WeatherProvider, useWeatherContext } from './contexts/WeatherContext';
import WeatherScreen from '@screens/weather/WeatherScreen';
import SearchScreen from '@screens/search/SearchScreen';

const AppContent = () => {
    const { location, weatherData, forecastData, airQuality, uvIndex, pastHourly, loading, error, refreshWeather } = useWeatherContext();
    const [showMap, setShowMap] = useState(false);

    if (loading) {
        return (
            <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-white">Locating you...</p>
                </div>
            </div>
        );
    }

    if (error || !weatherData || !location) {
        return (
            <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-2 text-center px-6">
                    <p className="text-white text-lg font-semibold">Could not load weather</p>
                    <p className="text-gray-400 text-sm">Check your API keys and network connection, then reload.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <head>
                <title>Pitch Weather</title>
                <meta name="description" content="Pitch Weather" />
                <link rel="icon" type="image/png" href="/weather_icons/SunnyCloudy.svg" />
            </head>
            <div className="relative w-full h-[100dvh] overflow-hidden bg-white font-sans">
                {/* Map layer (bottom) - always mounted */}
                <div className="absolute inset-0 z-0">
                    <SearchScreen
                        onOpenWeather={() => setShowMap(false)}
                    />
                </div>

                {/* Weather Screen layer (top), slides UP to reveal map */}
                <div
                    className={`absolute inset-0 z-10 transition-transform duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${showMap ? '-translate-y-full pointer-events-none' : 'translate-y-0'}`}
                >
                    <WeatherScreen onOpenMap={() => setShowMap(true)} />
                </div>
            </div>
        </>
    );
};

function App() {
    return (
        <WeatherProvider>
            <AppContent />
        </WeatherProvider>
    );
}

export default App;
