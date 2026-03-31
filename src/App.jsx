import { useState } from 'react';
import { WeatherProvider, useWeatherContext } from './contexts/WeatherContext';
import WeatherScreen from '@screens/weather/WeatherScreen';
import SearchScreen from '@screens/search/SearchScreen';
import './App.css';

const AppContent = () => {
    const { location, weatherData, forecastData, airQuality, uvIndex, pastHourly, loading, error, refreshWeather } = useWeatherContext();
    const [showMap, setShowMap] = useState(false);

    if (loading) {
        return (
            <div className="app__loading">
                <div className="app__loading-inner">
                    <div className="app__spinner"></div>
                    <p className="app__loading-text">Locating you...</p>
                </div>
            </div>
        );
    }

    if (error || !weatherData || !location) {
        return (
            <div className="app__error">
                <div className="app__error-inner">
                    <p className="app__error-title">Could not load weather</p>
                    <p className="app__error-msg">Check your API keys and network connection, then reload.</p>
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
            <div className="app__shell">
                {/* Map layer (bottom) - always mounted */}
                <div className="app__map-layer">
                    <SearchScreen
                        onOpenWeather={() => setShowMap(false)}
                    />
                </div>

                {/* Weather Screen layer (top), slides UP to reveal map */}
                <div
                    className={`app__weather-layer ${showMap ? 'app__weather-layer--hidden' : ''}`}
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
