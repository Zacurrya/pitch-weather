import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const LIBRARIES = ['places'];

const MapView = ({ center, userLocation, venues = [], zoom = 14, options = {}, onVenueSelect, onMapReady }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
        if (onMapReady) onMapReady(mapInstance);
    }, [onMapReady]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const mapCenter = center || { lat: 51.5074, lng: -0.1278 };

    const defaultOptions = {
        disableDefaultUI: true,
        zoomControl: false,
        ...options,
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={defaultOptions}
        >
            {/* User location marker */}
            {userLocation && (
                <MarkerF
                    position={{ lat: userLocation.lat, lng: userLocation.lng }}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                    }}
                    title="Your location"
                />
            )}

            {/* Sports venue markers */}
            {venues.map((venue, idx) => (
                <MarkerF
                    key={venue.placeId || idx}
                    position={{ lat: venue.lat, lng: venue.lng }}
                    icon={{
                        url: venue.type === 'football'
                            ? '/sports/Football.svg'
                            : '/sports/Cricket.svg',
                        scaledSize: new window.google.maps.Size(32, 32),
                        anchor: new window.google.maps.Point(16, 16),
                    }}
                    title={venue.name}
                    onClick={() => onVenueSelect?.(venue)}
                />
            ))}
        </GoogleMap>
    );
};

export default MapView;
