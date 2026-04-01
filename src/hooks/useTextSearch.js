import { useState, useCallback } from 'react';
import { searchPitchesByText } from '@services/placesService';

/**
 * Text-based pitch search hook.
 * Encapsulates the loading state and error handling around the Places text search.
 *
 * @param {google.maps.Map | null} mapInstance
 * @param {{ lat: number, lng: number } | null} userLocation
 * @returns {{ textSearchResults, textSearchLoading, handleSearch }}
 */
const useTextSearch = (mapInstance, userLocation) => {
    const [textSearchResults, setTextSearchResults] = useState(null);
    const [textSearchLoading, setTextSearchLoading] = useState(false);

    const handleSearch = useCallback(async (query) => {
        if (!query) {
            setTextSearchResults(null);
            return;
        }
        if (!mapInstance || !userLocation) return;

        setTextSearchLoading(true);
        try {
            const results = await searchPitchesByText(mapInstance, query, userLocation);
            setTextSearchResults(results);
        } catch (err) {
            console.error('Text search failed:', err);
            setTextSearchResults([]);
        } finally {
            setTextSearchLoading(false);
        }
    }, [mapInstance, userLocation]);

    const clearResults = useCallback(() => {
        setTextSearchResults(null);
    }, []);

    return { textSearchResults, textSearchLoading, handleSearch, clearResults };
};

export default useTextSearch;
