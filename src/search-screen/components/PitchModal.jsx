import { useEffect, useState } from 'react';
import { Footprints, Droplets, Globe, CornerUpRight, TreePine } from 'lucide-react';
import { getDistanceKm, getWalkingMinutes, getTodayHours } from '../../utils/pitchUtils';
import { getPlaceDetails } from '../../utils/placesUtils';
import { fetchPastWeather } from '../../utils/weatherUtils';
import { calcPitchCondition, conditionColor, conditionLabel } from '../../utils/conditionUtils';
import PhotoGallery from './PhotoGallery';

// Module-level cache: placeId → { wetness, muddiness }
const conditionCache = new Map();

const PitchModal = ({ venue, userLocation, weatherData, map, onClose }) => {
    const [details, setDetails] = useState(null);
    const [photoExpanded, setPhotoExpanded] = useState(false);
    const [condition, setCondition] = useState(null); // { wetness, muddiness } or null while loading

    // Fetch place details (opening hours, photos, etc.)
    useEffect(() => {
        if (venue?.placeId && map) {
            setDetails(null);
            getPlaceDetails(map, venue.placeId).then(setDetails);
        }
    }, [venue?.placeId, map]);

    // Fetch per-pitch weather and calculate conditions (cached by placeId)
    useEffect(() => {
        if (!venue?.placeId) return;

        // Check cache first
        if (conditionCache.has(venue.placeId)) {
            setCondition(conditionCache.get(venue.placeId));
            return;
        }

        // Fetch weather specific to this pitch's location
        setCondition(null);
        fetchPastWeather(venue.lat, venue.lng).then(({ totalRainMm, pastHourly }) => {
            const result = calcPitchCondition(weatherData, totalRainMm, pastHourly);
            conditionCache.set(venue.placeId, result);
            setCondition(result);
        });
    }, [venue?.placeId, venue?.lat, venue?.lng, weatherData]);

    if (!venue) return null;

    const distKm = userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
        : null;
    const walkMins = distKm != null ? getWalkingMinutes(distKm) : null;

    const wColor = condition ? conditionColor(condition.wetness) : null;
    const mColor = condition ? conditionColor(condition.muddiness) : null;

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
                            <div className="w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center">
                                <CornerUpRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-[0.7rem] font-semibold text-[#1a73e8]">Directions</span>
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

                    {/* ── Row 4: Pitch conditions (percentage bars) ── */}
                    <div className="flex flex-col gap-3 mb-3">
                        {condition ? (
                            <>
                                {/* Wetness */}
                                <div className="flex items-center gap-3">
                                    <Droplets className={`w-5 h-5 flex-shrink-0 ${wColor.text}`} strokeWidth={2.5} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-black font-semibold text-sm">Wetness</span>
                                            <span className={`font-bold text-sm ${wColor.text}`}>
                                                {conditionLabel(condition.wetness, 'wetness')} ({condition.wetness}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${wColor.bar} transition-all duration-700`}
                                                style={{ width: `${condition.wetness}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Muddiness */}
                                <div className="flex items-center gap-3">
                                    <TreePine className={`w-5 h-5 flex-shrink-0 ${mColor.text}`} strokeWidth={2.5} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-black font-semibold text-sm">Muddiness</span>
                                            <span className={`font-bold text-sm ${mColor.text}`}>
                                                {conditionLabel(condition.muddiness, 'muddiness')} ({condition.muddiness}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${mColor.bar} transition-all duration-700`}
                                                style={{ width: `${condition.muddiness}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Shimmer loading skeleton */
                            <>
                                {[0, 1].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-gray-100 animate-pulse" />
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-1" />
                                            <div className="w-full h-2 bg-gray-100 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                </div>
            </div>

            {/* Photo gallery lightbox */}
            {photoExpanded && allPhotos.length > 0 && (
                <PhotoGallery
                    photos={allPhotos}
                    alt={venue.name}
                    title={venue.name}
                    onClose={() => setPhotoExpanded(false)}
                />
            )}
        </>
    );
};

export default PitchModal;
