import { useEffect, useState } from 'react';
import { getPlaceDetails } from '@services/placesService';

/**
 * Custom hook to fetch detailed Place info (website, phone, opening hours, photos).
 *
 * @param {google.maps.Map | null} map
 * @param {string | null} placeId
 * @returns {object | null} Place details or null while loading
 */
const usePlaceDetails = (map, placeId) => {
    const [details, setDetails] = useState(null);

    useEffect(() => {
        if (!placeId || !map) return;

        getPlaceDetails(map, placeId).then(setDetails);

        return () => setDetails(null);
    }, [placeId, map]);

    return details;
};

export default usePlaceDetails;
