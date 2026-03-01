import { useState, useCallback, useRef } from 'react';
import { searchNearbyPitches, fetchOpeningHours } from '../utils/placesUtils';
import { isClosingSoon, getClosingTimeStr } from '../utils/pitchUtils';


/**
 * Haversine distance in metres.
 */
const haversineM = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Does `point` fall inside any of the `circles`? */
const isPointCovered = (lat, lng, circles) =>
    circles.some((c) => haversineM(lat, lng, c.lat, c.lng) <= c.radius);

/** Offset a lat/lng by `dist` metres at `bearing` radians (0 = north, π/2 = east). */
const offsetPoint = (lat, lng, dist, bearing) => ({
    lat: lat + (dist * Math.cos(bearing)) / 111320,
    lng: lng + (dist * Math.sin(bearing)) / (111320 * Math.cos((lat * Math.PI) / 180)),
});

/**
 * Hook to fetch and manage pitches.
 * Call `searchArea({ lat, lng })` to search around a point.
 * Call `isAreaSearched({ lat, lng, visibleRadius })` to check viewport coverage.
 */
const usePitches = (map) => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchedCircles, setSearchedCircles] = useState([]);
    const knownIdsRef = useRef(new Set());

    const enrichVenues = useCallback(async (raw) => {
        if (!map) return raw;
        return Promise.all(
            raw.map(async (v) => {
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
    }, [map]);

    const searchArea = useCallback(async (center, radius = 3000) => {
        if (!map || !center) return;

        // Record this circle immediately so the button hides
        setSearchedCircles((prev) => [
            ...prev,
            { lat: center.lat, lng: center.lng, radius },
        ]);

        setLoading(true);
        try {
            const raw = await searchNearbyPitches(map, center, radius);

            // Dedupe against existing venues
            const fresh = raw.filter((v) => !knownIdsRef.current.has(v.placeId));
            if (fresh.length === 0) return;

            fresh.forEach((v) => knownIdsRef.current.add(v.placeId));
            setVenues((prev) => [...prev, ...fresh]);

            // Enrich in background
            const enriched = await enrichVenues(fresh);
            setVenues((prev) => {
                const enrichedIds = new Set(enriched.map((v) => v.placeId));
                return [
                    ...prev.filter((v) => !enrichedIds.has(v.placeId)),
                    ...enriched,
                ];
            });
        } catch (err) {
            console.error('Places search failed:', err);
        } finally {
            setLoading(false);
        }
    }, [map, enrichVenues]);

    /**
     * Is the current viewport fully covered by previously-searched circles?
     * Samples centre + 8 boundary points of the visible area.
     */
    const isAreaSearched = useCallback(
        (visibleInfo) => {
            if (!visibleInfo || searchedCircles.length === 0) return false;
            const { lat, lng, visibleRadius } = visibleInfo;
            if (visibleRadius == null) return false;

            // Build sample points: centre + 8 evenly-spaced boundary points
            const points = [{ lat, lng }];
            for (let i = 0; i < 8; i++) {
                const bearing = (i * Math.PI) / 4;
                points.push(offsetPoint(lat, lng, visibleRadius, bearing));
            }

            return points.every((p) => isPointCovered(p.lat, p.lng, searchedCircles));
        },
        [searchedCircles],
    );

    return { venues, loading, searchArea, isAreaSearched };
};

export default usePitches;
