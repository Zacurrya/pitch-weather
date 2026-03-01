import { useState, useCallback, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import WeatherBar from './components/WeatherBar';
import SearchBar from './components/SearchBar';
import PitchModal from './components/PitchModal';
import SearchAreaButton from './components/SearchAreaButton';
import LocateUserButton from './components/LocateUserButton';
import usePitches from '../hooks/usePitches';

const SearchScreen = ({ location, weatherData, forecastData, pastHourly, refreshWeather, onOpenWeather }) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // The visible centre reported by the map after the user pans
  const [visibleCenter, setVisibleCenter] = useState(null);

  const initialSearchDone = useRef(false);
  const weatherDebounceRef = useRef(null);

  // Set initial map center from user location (once)
  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  // Refresh weather when the map pans to a new area (debounced 600ms)
  useEffect(() => {
    if (!visibleCenter || !refreshWeather) return;
    clearTimeout(weatherDebounceRef.current);
    weatherDebounceRef.current = setTimeout(() => {
      refreshWeather(visibleCenter.lat, visibleCenter.lng);
    }, 600);
    return () => clearTimeout(weatherDebounceRef.current);
  }, [visibleCenter, refreshWeather]);

  const { venues, loading, searchArea, isAreaSearched } = usePitches(mapInstance);

  // Auto-search around user location on first load
  useEffect(() => {
    if (location && mapInstance && !initialSearchDone.current) {
      initialSearchDone.current = true;
      searchArea({ lat: location.lat, lng: location.lng });
    }
  }, [location, mapInstance, searchArea]);

  // Show button only when the visible area hasn't been searched yet
  const showSearchButton =
    visibleCenter &&
    !isAreaSearched(visibleCenter) &&
    !searchExpanded &&
    !selectedVenue;

  const handleSearchArea = useCallback(() => {
    if (!visibleCenter) return;
    searchArea({ lat: visibleCenter.lat, lng: visibleCenter.lng }, visibleCenter.visibleRadius);
  }, [visibleCenter, searchArea]);

  const handleVenueSelect = useCallback((venue) => {
    setSelectedVenue(venue);
    setSearchExpanded(false);
    setMapCenter({ lat: venue.lat - 0.003, lng: venue.lng });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  const snapToLocation = useCallback(() => {
    if (mapInstance && location) {
      mapInstance.panTo({ lat: location.lat, lng: location.lng });
      mapInstance.setZoom(13);
    }
  }, [mapInstance, location]);

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

      {/* "Search this area" — sits just below the collapsed search bar */}
      <SearchAreaButton
        show={showSearchButton}
        loading={loading}
        onClick={handleSearchArea}
      />

      {/* Map */}
      <MapView
        center={mapCenter}
        userLocation={location}
        venues={venues}
        zoom={12}
        onVenueSelect={handleVenueSelect}
        onMapReady={setMapInstance}
        onCenterChanged={setVisibleCenter}
      />

      {/* Snap to Location Button */}
      <LocateUserButton
        show={!selectedVenue && location}
        onClick={snapToLocation}
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

export default SearchScreen;