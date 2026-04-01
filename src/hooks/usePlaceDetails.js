import { useEffect, useState } from 'react';
import { getPlaceDetails } from '@services/placesService';

/**
 * Fetch detailed place info (website, phone, opening hours, photos).
 *
 * @param {google.maps.Map | null} map
 * @param {string | null} placeId
 * @returns {object | null} Place details or null while loading
 */
const usePlaceDetails = (map, placeId) => {
    const [detailsState, setDetailsState] = useState({ placeId: null, data: null });

    useEffect(() => {
        if (!placeId || !map) return undefined;

        let isActive = true;

        getPlaceDetails(map, placeId)
            .then((nextDetails) => {
                if (isActive) {
                    setDetailsState({ placeId, data: nextDetails });
                }
            })
            .catch(() => {
                if (isActive) {
                    setDetailsState({ placeId, data: null });
                }
            });

        return () => {
            isActive = false;
        };
    }, [placeId, map]);

    if (!placeId || detailsState.placeId !== placeId) return null;
    return detailsState.data;
};

export default usePlaceDetails;
