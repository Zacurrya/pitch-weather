import React, { useEffect, useState } from 'react';
import { Navigation2, Footprints, Droplets, Flower2, Globe, Sun, CloudRain } from 'lucide-react';
import { getDistanceKm, getWalkingMinutes, getPitchConditions, getTodayHours } from '../utils/pitchUtils';
import { getPlaceDetails } from '../services/placesService';
import PhotoGallery from './PhotoGallery';

const conditionIcons = {
    'Likely Wet': <Droplets className="w-6 h-6 text-blue-500" strokeWidth={2.5} />,
    'Possibly Damp': <Droplets className="w-6 h-6 text-blue-400" strokeWidth={2.5} />,
    'Likely Dry': <Sun className="w-6 h-6 text-yellow-500" strokeWidth={2.5} />,
    'Likely Muddy': <Flower2 className="w-6 h-6 text-orange-500" strokeWidth={2.5} />,
    'Possibly Muddy': <Flower2 className="w-6 h-6 text-orange-400" strokeWidth={2.5} />,
    'Firm Ground': <Sun className="w-6 h-6 text-green-500" strokeWidth={2.5} />,
};

const PitchModal = ({ venue, userLocation, weatherData, recentRainfall, map, onClose }) => {
    const [details, setDetails] = useState(null);
    const [photoExpanded, setPhotoExpanded] = useState(false);

    useEffect(() => {
        if (venue?.placeId && map) {
            setDetails(null);
            getPlaceDetails(map, venue.placeId).then(setDetails);
        }
    }, [venue?.placeId, map]);

    if (!venue) return null;

    const distKm = userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
        : null;
    const walkMins = distKm != null ? getWalkingMinutes(distKm) : null;

    const conditions = getPitchConditions(weatherData, recentRainfall);

    const thumbUrl = details?.photoUrl || venue.photoUrl || null;
    const allPhotos = details?.photos?.length ? details.photos : (thumbUrl ? [thumbUrl] : []);

    const mapsUrl =
        details?.mapsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}&travelmode=walking`;

    const sportIcon =
        venue.type === 'football' ? '/sports/Football.svg' : '/sports/Cricket.svg';

    // Opening hours
    const isOpen = details?.isOpen ?? venue.openNow;
    const todayHours = getTodayHours(details?.periods);

    return (
        <>
            {/* Tap-outside backdrop */}
            <div className="absolute inset-0 z-20" onClick={onClose} />

            {/* Bottom sheet */}
            <div className="absolute bottom-0 left-0 right-0 z-30 animate-[slideUp_0.4s_ease-out]">
                <div className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-5 pt-5 pb-6 max-h-[65dvh] overflow-y-auto">

                    {/* ── Row 1: Name + Website + Directions ── */}
                    <div className="flex items-center gap-3 mb-3">
                        <img src={sportIcon} alt={venue.type} className="w-10 h-10 object-contain flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-black font-bold text-lg truncate">{venue.name}</p>
                        </div>
                        {details?.website && (
                            <a
                                href={details.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-0.5 flex-shrink-0 active:opacity-70"
                            >
                                <Globe className="w-6 h-6 text-black" strokeWidth={2} />
                                <span className="text-[0.7rem] font-semibold text-black">Website</span>
                            </a>
                        )}
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-0.5 flex-shrink-0 active:opacity-70"
                        >
                            <Navigation2 className="w-6 h-6 text-black" strokeWidth={2} />
                            <span className="text-[0.7rem] font-semibold text-black">Directions</span>
                        </a>
                    </div>

                    {/* ── Row 2: Status + Hours + Photo ── */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1 flex flex-col justify-center gap-1">
                            {isOpen != null && (
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                                        {isOpen ? 'Open' : 'Closed'}
                                    </span>
                                    {todayHours && isOpen && todayHours.closesAt && (
                                        <span className="text-gray-500 text-sm">
                                            Closes {todayHours.closesAt}
                                        </span>
                                    )}
                                    {todayHours && !isOpen && todayHours.opensAt && (
                                        <span className="text-gray-500 text-sm">
                                            Opens {todayHours.opensAt}
                                        </span>
                                    )}
                                </div>
                            )}
                            {venue.address && (
                                <p className="text-gray-500 text-xs leading-snug">{venue.address}</p>
                            )}
                        </div>
                        {thumbUrl && (
                            <button
                                onClick={() => setPhotoExpanded(true)}
                                className="active:opacity-80 transition-opacity flex-shrink-0"
                            >
                                <img
                                    src={thumbUrl}
                                    alt={venue.name}
                                    className="w-[clamp(9rem,42vw,13rem)] h-[clamp(5.5rem,26vw,8rem)] object-cover rounded-xl"
                                />
                            </button>
                        )}
                    </div>

                    {/* ── Row 3: Distance + Walking time ── */}
                    {distKm != null && (
                        <div className="flex items-center gap-4 mb-4 py-2 border-t border-gray-100">
                            <span className="text-black font-bold text-base">
                                {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <Footprints className="w-5 h-5" strokeWidth={2} />
                                <span className="font-semibold text-sm">{walkMins} mins</span>
                            </div>
                        </div>
                    )}

                    {/* ── Row 4: Pitch conditions ── */}
                    <div className="flex flex-col gap-2 mb-3">
                        {conditions.map((c, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {conditionIcons[c.label] || <CloudRain className="w-6 h-6 text-gray-400" />}
                                <span className="text-black font-bold text-base">{c.label}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Photo gallery lightbox */}
            {photoExpanded && allPhotos.length > 0 && (
                <PhotoGallery
                    photos={allPhotos}
                    alt={venue.name}
                    onClose={() => setPhotoExpanded(false)}
                />
            )}
        </>
    );
};

export default PitchModal;
