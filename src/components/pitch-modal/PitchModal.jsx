import { useState } from 'react';
import { getDistanceKm, getWalkingMinutes, getDrivingMinutes, getBusMinutes, getTodayHours, getVenueSportIcon } from '@utils/pitchUtils';
import { conditionColor, conditionLabel, pitchVerdict } from '@utils/conditionUtils';
import usePlaceDetails from '@hooks/usePlaceDetails';
import usePitchCondition from '@hooks/usePitchCondition';

import PhotoGallery from './PhotoGallery';
import PitchHeader from './PitchHeader';
import PitchForecast from './PitchForecast';
import PitchInfo from './PitchInfo';
import PitchConditions from './PitchConditions';

import './PitchModal.css';

const PitchModal = ({ venue, userLocation, weatherData, map, onClose }) => {
    const [photoExpanded, setPhotoExpanded] = useState(false);

    const details = usePlaceDetails(map, venue?.placeId);
    const { condition, futureHourly, sunrise, sunset } = usePitchCondition(venue, weatherData);

    if (!venue) return null;

    const distKm = userLocation
        ? getDistanceKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng)
        : null;
    const walkMins = distKm != null ? getWalkingMinutes(distKm) : null;
    const driveMins = distKm != null ? getDrivingMinutes(distKm) : null;
    const busMins = distKm != null ? getBusMinutes(distKm) : null;

    const wColor = condition ? conditionColor(condition.wetness) : { text: '', bar: '' };
    const mColor = condition ? conditionColor(condition.muddiness) : { text: '', bar: '' };
    const verdict = condition ? pitchVerdict(condition.wetness, condition.muddiness) : { bg: '', color: '', label: '' };

    const thumbUrl = details?.photoUrl || venue.photoUrl || null;
    const allPhotos = details?.photos?.length ? details.photos : (thumbUrl ? [thumbUrl] : []);

    const mapsUrl =
        details?.mapsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}&travelmode=walking`;

    const sportIcon = getVenueSportIcon(venue.type);
    const isOpen = details?.isOpen ?? venue.openNow;
    const todayHours = getTodayHours(details?.periods);

    return (
        <>
            <div className="pitch-modal__backdrop" onClick={onClose} />
            <div className="pitch-modal__sheet-wrapper">
                <div className="pitch-modal__sheet">
                    <PitchHeader
                        venue={venue}
                        details={details}
                        mapsUrl={mapsUrl}
                        sportIcon={sportIcon}
                    />
                    
                    <PitchForecast
                        futureHourly={futureHourly}
                        sunrise={sunrise}
                        sunset={sunset}
                    />

                    <PitchInfo
                        isOpen={isOpen}
                        venue={venue}
                        todayHours={todayHours}
                        distKm={distKm}
                        walkMins={walkMins}
                        busMins={busMins}
                        driveMins={driveMins}
                        thumbUrl={thumbUrl}
                        onPhotoClick={() => setPhotoExpanded(true)}
                    />

                    <PitchConditions
                        condition={condition}
                        weatherData={weatherData}
                        venueType={venue.type}
                        verdict={verdict}
                        wColor={wColor}
                        mColor={mColor}
                    />
                </div>
            </div>

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
