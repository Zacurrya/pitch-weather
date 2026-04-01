import { useState } from 'react';
import { WeatherProvider } from './contexts/WeatherContext';
import useWeatherContext from '@hooks/useWeatherContext';
import WeatherScreen from '@screens/weather/WeatherScreen';
import SearchScreen from '@screens/search/SearchScreen';
import './App.css';

const AppContent = () => {
    const { location, weatherData, loading, error } = useWeatherContext();
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
        <div className="app__shell">
            {/* Map layer */}
            <div className="app__map-layer">
                <SearchScreen
                    onOpenWeather={() => setShowMap(false)}
                />
            </div>

            {/* Weather screen layer */}
            <div
                className={`app__weather-layer ${showMap ? 'app__weather-layer--hidden' : ''}`}
            >
                <WeatherScreen onOpenMap={() => setShowMap(true)} />
            </div>
        </div>
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
