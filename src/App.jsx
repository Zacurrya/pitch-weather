import React, { useState } from 'react';
import WeatherScreen from './weather-screen/WeatherScreen';
import InteractiveMap from './components/InteractiveMap';
import { useWeather } from './hooks/useWeather';

function App() {
  const { location, weatherData, forecastData, airQuality, uvIndex, recentRainfall, pastHourly, loading } = useWeather();
  const [showMap, setShowMap] = useState(false);

  if (loading || !weatherData || !location) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">Locating you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white font-sans">
      {/* Map layer (bottom) — always mounted */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap
          location={location}
          placeName={weatherData.name}
          country={weatherData.sys?.country}
          weatherData={weatherData}
          forecastData={forecastData}
          recentRainfall={recentRainfall}
          pastHourly={pastHourly}
          onOpenWeather={() => setShowMap(false)}
        />
      </div>

      {/* Weather Screen layer (top), slides UP to reveal map */}
      <div
        className={`absolute inset-0 z-10 transition-transform duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${showMap ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <WeatherScreen weatherData={weatherData} airQuality={airQuality} uvIndex={uvIndex} onOpenMap={() => setShowMap(true)} />
      </div>
    </div>
  );
}

export default App;
