import React, { useState, useCallback, useEffect } from 'react';
import MapView from './MapView';
import WeatherBar from './WeatherBar';
import SearchBar from './SearchBar';
import PitchModal from './PitchModal';
import usePitches from '../hooks/usePitches';

const InteractiveMap = ({ location, placeName, country, weatherData, forecastData, recentRainfall, pastHourly, onOpenWeather }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // Set initial center from user location (once)
  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  // Single source of truth for pitch data
  const { venues } = usePitches(mapInstance, location);

  const handleVenueSelect = useCallback((venue) => {
    setSelectedVenue(venue);
    setSearchExpanded(false);
    // Center map on the pitch, offset south so marker is visible above the bottom sheet
    setMapCenter({ lat: venue.lat - 0.003, lng: venue.lng });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Weather bar — hides when search is expanded */}
      <WeatherBar
        weatherData={weatherData}
        forecastData={forecastData}
        pastHourly={pastHourly}
        onCurrentClick={onOpenWeather}
        hidden={searchExpanded}
      />

      {/* Search bar / modal */}
      <SearchBar
        onSearch={(q) => console.log('Searching', q)}
        expanded={searchExpanded}
        onExpand={() => setSearchExpanded(true)}
        onCollapse={() => setSearchExpanded(false)}
        venues={venues}
        userLocation={location}
        onVenueSelect={handleVenueSelect}
      />

      {/* Map — center is explicitly controlled */}
      <MapView
        center={mapCenter}
        userLocation={location}
        venues={venues}
        zoom={15}
        onVenueSelect={handleVenueSelect}
        onMapReady={setMapInstance}
      />

      {/* Pitch modal — bottom sheet */}
      {selectedVenue && (
        <PitchModal
          venue={selectedVenue}
          userLocation={location}
          weatherData={weatherData}
          map={mapInstance}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default InteractiveMap;