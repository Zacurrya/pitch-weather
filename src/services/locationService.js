/**
 * Location service — browser geolocation wrapper.
 * Pure async function, no React dependencies.
 */

const FALLBACK = { lat: 51.52, lng: -0.04 }; // Mile End, London

/**
 * Get the user's geolocation, falling back to Mile End, London.
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export const getUserLocation = () =>
    new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(FALLBACK);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => resolve(FALLBACK),
            { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false },
        );
    });
