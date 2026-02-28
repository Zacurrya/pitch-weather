import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 51.5074,
  lng: -0.1278
};

const InteractiveMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div className="w-full h-screen relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <></>
      </GoogleMap>

      <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <MapPin className="text-blue-600 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 leading-tight">London</h2>
          <p className="text-sm text-gray-500">United Kingdom</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default InteractiveMap;