/**
 * Search for nearby sports pitches using the Google Maps Places API.
 * Runs multiple keyword permutations per sport to maximise results
 * (the API hard-caps each nearbySearch call at 20 results).
 * Returns a flat, deduplicated array of venue objects.
 *
 * @param {google.maps.Map} map
 * @param {{ lat: number, lng: number }} location
 * @param {number} [radius=3000] Search radius in metres (clamped to 100–10000)
 */
export const searchNearbyPitches = (map, location, radius = 3000) => {
    const service = new window.google.maps.places.PlacesService(map);
    const clampedRadius = Math.max(100, Math.min(10000, Math.round(radius)));

    const search = (keyword, sportType) =>
        new Promise((resolve) => {
            const request = { location, radius: clampedRadius, keyword };

            service.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(
                        results
                            // Client-side filter to completely exclude unbookable professional grounds
                            .filter((r) => !(r.types || []).includes('stadium'))
                            .map((r) => ({
                                name: r.name,
                                type: sportType,
                                placeId: r.place_id,
                                lat: r.geometry.location.lat(),
                                lng: r.geometry.location.lng(),
                                address: r.vicinity || '',
                                rating: r.rating ?? null,
                                openNow: r.opening_hours?.open_now ?? null,
                                photoUrl: r.photos?.[0]?.getUrl({ maxWidth: 400 }) || null,
                            }))
                    );
                } else {
                    resolve([]);
                }
            });
        });

    return Promise.all([
        search('football pitch', 'football'),
        search('football recreation ground', 'football'),
        search('cricket pitch', 'cricket'),
        search('cricket club', 'cricket'),
    ]).then((batches) => {
        const seen = new Set();
        return batches.flat().filter((v) => {
            if (seen.has(v.placeId)) return false;
            seen.add(v.placeId);
            return true;
        });
    });
};

/**
 * Lightweight details call — only fetches opening_hours for a place.
 */
export const fetchOpeningHours = (map, placeId) =>
    new Promise((resolve) => {
        const service = new window.google.maps.places.PlacesService(map);
        service.getDetails(
            { placeId, fields: ['opening_hours'] },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    resolve({
                        isOpen: place.opening_hours?.isOpen?.() ?? null,
                        periods: place.opening_hours?.periods || [],
                    });
                } else {
                    resolve(null);
                }
            }
        );
    });

/**
 * Fetch detailed Place info (website, formatted phone, opening hours).
 */
export const getPlaceDetails = (map, placeId) =>
    new Promise((resolve) => {
        const service = new window.google.maps.places.PlacesService(map);
        service.getDetails(
            {
                placeId,
                fields: ['website', 'formatted_phone_number', 'opening_hours', 'url', 'photos'],
            },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    resolve({
                        website: place.website || null,
                        phone: place.formatted_phone_number || null,
                        mapsUrl: place.url || null,
                        weekdayText: place.opening_hours?.weekday_text || [],
                        isOpen: place.opening_hours?.isOpen?.() ?? null,
                        periods: place.opening_hours?.periods || [],
                        photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 600 }) || null,
                        photos: (place.photos || [])
                            .slice(0, 5)
                            .map((p) => p.getUrl({ maxWidth: 800 })),
                    });
                } else {
                    resolve(null);
                }
            }
        );
    });
