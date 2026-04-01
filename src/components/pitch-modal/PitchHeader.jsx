import { Globe, CornerUpRight } from 'lucide-react';
import './PitchHeader.css';

const PitchHeader = ({ venue, details, mapsUrl, sportIcon }) => {
    return (
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
    );
};

export default PitchHeader;
