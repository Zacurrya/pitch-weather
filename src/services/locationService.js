// Location service — browser geolocation wrapper.

const FALLBACK = { lat: 51.52, lng: -0.04 }; // Mile End, London

// Get the user's geolocation 
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
