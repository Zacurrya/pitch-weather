import { useState, useEffect } from 'react';
import { searchNearbyPitches, fetchOpeningHours } from '../services/placesService';
import { isClosingSoon, getClosingTimeStr } from '../utils/pitchUtils';

/**
 * Hook to fetch and manage nearby sports pitches.
 * Enriches venues with opening hours and "closing soon" status.
 */
const usePitches = (map, userLocation) => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!map || !userLocation) return;

        let cancelled = false;
        setLoading(true);

        searchNearbyPitches(map, { lat: userLocation.lat, lng: userLocation.lng })
            .then(async (results) => {
                if (cancelled) return;

                // Set basic results immediately
                setVenues(results);

                // Then enrich with opening hours in parallel
                const enriched = await Promise.all(
                    results.map(async (v) => {
                        try {
                            const hours = await fetchOpeningHours(map, v.placeId);
                            if (!hours) return v;
                            return {
                                ...v,
                                openNow: hours.isOpen ?? v.openNow,
                                periods: hours.periods,
                                closingSoon: hours.isOpen && isClosingSoon(hours.periods),
                                closesAt: getClosingTimeStr(hours.periods),
                            };
                        } catch {
                            return v;
                        }
                    })
                );

                if (!cancelled) setVenues(enriched);
            })
            .catch((err) => console.error('Places search failed:', err))
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [map, userLocation?.lat, userLocation?.lng]);

    return { venues, loading };
};

export default usePitches;
