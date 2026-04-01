import { useState, useCallback, useEffect, useRef } from 'react';
import MapView from '@components/screens/search/MapView';
import WeatherBar from '@components/screens/search/WeatherBar';
import SearchBar from '@components/screens/search/SearchBar';
import PitchModal from '@components/pitch-modal/PitchModal';
import SearchAreaButton from '@components/screens/search/SearchAreaButton';
import LocateUserButton from '@components/screens/search/LocateUserButton';
import { useWeatherContext } from '@contexts/WeatherContext';
import usePitches from '@hooks/usePitches';
import useTextSearch from '@hooks/useTextSearch';
import useMapWeatherSync from '@hooks/useMapWeatherSync';
import { panToTargetWithOffset } from '@utils/mapUtils';
import './SearchScreen.css';

const SearchScreen = ({ onOpenWeather }) => {
  const { location, weatherData, forecastData, pastHourly, sunrises, sunsets, refreshWeather } = useWeatherContext();

  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // The visible center reported by the map after the user pans
  const [visibleCenter, setVisibleCenter] = useState(null);

  // A ref rather than state so toggling it does not trigger a re-render or cause
  const initialSearchDone = useRef(false);

  // Set initial map center from user location (once)
  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location, mapCenter]);

  // Debounced weather refresh when map pans
  useMapWeatherSync(visibleCenter, refreshWeather);

  const { venues, loading, searchArea, isAreaSearched } = usePitches(mapInstance);
  const { textSearchResults, textSearchLoading, handleSearch, clearResults } = useTextSearch(mapInstance, location);

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
    setMapCenter({ lat: venue.lat, lng: venue.lng });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVenue(null);
  }, []);

  const snapToLocation = useCallback(() => {
    if (mapInstance && location) {
      panToTargetWithOffset(mapInstance, location);
      mapInstance.setZoom(15);
    }
  }, [mapInstance, location]);

  return (
    <div className="search-screen">
      {/* Weather bar */}
      <WeatherBar
        weatherData={weatherData}
        forecastData={forecastData}
        pastHourly={pastHourly}
        sunrises={sunrises}
        sunsets={sunsets}
        onCurrentClick={onOpenWeather}
        hidden={searchExpanded}
      />

      {/* Search bar / modal */}
      <SearchBar
        onSearch={handleSearch}
        expanded={searchExpanded}
        onExpand={() => setSearchExpanded(true)}
        onCollapse={() => { setSearchExpanded(false); clearResults(); }}
        venues={venues}
        userLocation={location}
        onVenueSelect={handleVenueSelect}
        searchResults={textSearchResults}
        searchLoading={textSearchLoading}
      />

      {/* "Search this area" button - sits just below the collapsed search bar */}
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
        selectedVenue={selectedVenue}
        zoom={15}
        onVenueSelect={handleVenueSelect}
        onMapReady={setMapInstance}
        onCenterChanged={setVisibleCenter}
      />

      {/* Snap to location button */}
      <LocateUserButton
        show={!selectedVenue && location}
        onClick={snapToLocation}
      />

      {/* Pitch modal */}
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