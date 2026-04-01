import { Footprints, Bus, Car } from 'lucide-react';
import './PitchInfo.css';

const PitchInfo = ({ isOpen, venue, todayHours, distKm, walkMins, busMins, driveMins, thumbUrl, onPhotoClick }) => {
    return (
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
                    onClick={onPhotoClick}
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
    );
};

export default PitchInfo;
