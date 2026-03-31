import { useState } from 'react';
import { Footprints, Droplets, Globe, CornerUpRight, Car, Bus } from 'lucide-react';
import { getDistanceKm, getWalkingMinutes, getDrivingMinutes, getBusMinutes, getTodayHours, getVenueSportIcon } from '@utils/pitchUtils';
import { conditionColor, conditionLabel, pitchVerdict } from '@utils/conditionUtils';
import { getIconPath, wmoToCondition } from '@utils/weatherUtils';
import usePlaceDetails from '@hooks/usePlaceDetails';
import usePitchCondition from '@hooks/usePitchCondition';
import PhotoGallery from './PhotoGallery';
import './PitchModal.css';

const PitchModal = ({ venue, userLocation, weatherData, map, onClose }) => {
    const [photoExpanded, setPhotoExpanded] = useState(false);

    // Hooks handle all data fetching
    const details = usePlaceDetails(map, venue?.placeId);
    const { condition, futureHourly } = usePitchCondition(venue, weatherData);

    if (!venue) return null;

    const distKm = userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
        : null;
    const walkMins = distKm != null ? getWalkingMinutes(distKm) : null;
    const driveMins = distKm != null ? getDrivingMinutes(distKm) : null;
    const busMins = distKm != null ? getBusMinutes(distKm) : null;

    const wColor = condition ? conditionColor(condition.wetness) : null;
    const mColor = condition ? conditionColor(condition.muddiness) : null;

    const thumbUrl = details?.photoUrl || venue.photoUrl || null;
    const allPhotos = details?.photos?.length ? details.photos : (thumbUrl ? [thumbUrl] : []);

    const mapsUrl =
        details?.mapsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}&travelmode=walking`;

    const sportIcon = getVenueSportIcon(venue.type);

    // Opening hours
    const isOpen = details?.isOpen ?? venue.openNow;
    const todayHours = getTodayHours(details?.periods);

    return (
        <>
            {/* Tap-outside backdrop */}
            <div className="pitch-modal__backdrop" onClick={onClose} />

            {/* Bottom sheet */}
            <div className="pitch-modal__sheet-wrapper">
                <div className="pitch-modal__sheet">

                    {/* Row 1: Name, website, directions */}
                    <div className="pitch-modal__header">
                        <img src={sportIcon} alt={venue.type} className="pitch-modal__sport-icon" />
                        <div className="pitch-modal__name-wrap">
                            <p className="pitch-modal__name">{venue.name}</p>
                        </div>
                        {details?.website && (
                            <a
                                href={details.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pitch-modal__link"
                            >
                                <Globe className="pitch-modal__link-icon" strokeWidth={2} />
                                <span className="pitch-modal__link-label">Website</span>
                            </a>
                        )}
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pitch-modal__link"
                        >
                            <div className="pitch-modal__directions-circle">
                                <CornerUpRight className="pitch-modal__directions-arrow" strokeWidth={2.5} />
                            </div>
                            <span className="pitch-modal__directions-label">Directions</span>
                        </a>
                    </div>

                    {/* Next 5 hours from Open-Meteo (1-hour intervals, pitch coordinates) */}
                    {futureHourly.length > 0 && (
                        <div className="pitch-modal__forecast">
                            {futureHourly.map((h) => {
                                const hour = new Date(h.time).getHours();
                                const time = `${hour.toString().padStart(2, '0')}:00`;
                                const icon = getIconPath(wmoToCondition(h.weather_code));
                                const temp = Math.round(h.temp);
                                return (
                                    <div key={h.time} className="pitch-modal__forecast-item">
                                        <span className="pitch-modal__forecast-time">{time}</span>
                                        <img src={icon} alt={time} className="pitch-modal__forecast-icon" />
                                        <span className="pitch-modal__forecast-temp">{temp}°C</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Row 2: Status, hours, photo, and distance */}
                    <div className="pitch-modal__info-row">
                        <div className="pitch-modal__info-left">
                            {isOpen != null && (
                                <div className="pitch-modal__status-row">
                                    <span className={isOpen ? 'pitch-modal__status--open' : 'pitch-modal__status--closed'}>
                                        {isOpen ? 'Open' : 'Closed'}
                                    </span>
                                    {todayHours && isOpen && todayHours.closesAt && (
                                        <span className="pitch-modal__hours">
                                            Closes {todayHours.closesAt}
                                        </span>
                                    )}
                                    {todayHours && !isOpen && todayHours.opensAt && (
                                        <span className="pitch-modal__hours">
                                            Opens {todayHours.opensAt}
                                        </span>
                                    )}
                                </div>
                            )}
                            {venue.address && (
                                <p className="pitch-modal__address">{venue.address}</p>
                            )}

                            {distKm != null && (
                                <div className="pitch-modal__distance-inline">
                                    <span className="pitch-modal__distance">
                                        {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}
                                    </span>
                                    <div className="pitch-modal__transit-options">
                                        <div className="pitch-modal__transit-item">
                                            <Footprints className="pitch-modal__transit-icon" strokeWidth={2} />
                                            <span className="pitch-modal__transit-time">{walkMins}m</span>
                                        </div>
                                        <div className="pitch-modal__transit-item">
                                            <Bus className="pitch-modal__transit-icon" strokeWidth={2} />
                                            <span className="pitch-modal__transit-time">{busMins}m</span>
                                        </div>
                                        <div className="pitch-modal__transit-item">
                                            <Car className="pitch-modal__transit-icon" strokeWidth={2} />
                                            <span className="pitch-modal__transit-time">{driveMins}m</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {thumbUrl && (
                            <button
                                onClick={() => setPhotoExpanded(true)}
                                className="pitch-modal__photo-btn"
                            >
                                <img
                                    src={thumbUrl}
                                    alt={venue.name}
                                    className="pitch-modal__thumbnail"
                                />
                            </button>
                        )}
                    </div>

                    {/* Row 4: Pitch condition bars */}
                    <div className="pitch-modal__conditions">
                        {condition ? (
                            <>
                                {/* Overall verdict */}
                                {(() => {
                                    const v = pitchVerdict(condition.wetness, condition.muddiness);
                                    return (
                                        <div className={`pitch-modal__verdict ${v.bg}`}>
                                            <span className={`pitch-modal__verdict-label ${v.color}`}>{v.label}</span>
                                        </div>
                                    );
                                })()}

                                {/* Wetness */}
                                <div className="pitch-modal__condition-row">
                                    <Droplets className="pitch-modal__condition-icon pitch-modal__condition-icon--wetness" strokeWidth={2.5} />
                                    <div className="pitch-modal__condition-body">
                                        <div className="pitch-modal__condition-header">
                                            <span className="pitch-modal__condition-title">Wetness</span>
                                            <span className={`pitch-modal__condition-value ${wColor.text}`}>
                                                {conditionLabel(condition.wetness, 'wetness')} ({condition.wetness}%)
                                            </span>
                                        </div>
                                        <div className="pitch-modal__bar-track">
                                            <div
                                                className={`pitch-modal__bar-fill ${wColor.bar}`}
                                                style={{ width: `${condition.wetness}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Muddiness */}
                                <div className="pitch-modal__condition-row">
                                    <Footprints className="pitch-modal__condition-icon pitch-modal__condition-icon--muddiness" strokeWidth={2.5} />
                                    <div className="pitch-modal__condition-body">
                                        <div className="pitch-modal__condition-header">
                                            <span className="pitch-modal__condition-title">Muddiness</span>
                                            <span className={`pitch-modal__condition-value ${mColor.text}`}>
                                                {conditionLabel(condition.muddiness, 'muddiness')} ({condition.muddiness}%)
                                            </span>
                                        </div>
                                        <div className="pitch-modal__bar-track">
                                            <div
                                                className={`pitch-modal__bar-fill ${mColor.bar}`}
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
                                    <div key={i} className="pitch-modal__skeleton-row">
                                        <div className="pitch-modal__skeleton-icon" />
                                        <div className="pitch-modal__skeleton-body">
                                            <div className="pitch-modal__skeleton-text" />
                                            <div className="pitch-modal__skeleton-bar" />
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
