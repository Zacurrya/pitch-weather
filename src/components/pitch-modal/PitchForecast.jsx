import { buildPitchForecastItems } from '@utils/weatherUtils';
import './PitchForecast.css';

const PitchForecast = ({ futureHourly, sunrises = [], sunsets = [] }) => {
    if (!futureHourly || futureHourly.length === 0) return null;

    const timeline = buildPitchForecastItems(futureHourly, sunrises, sunsets);

    return (
        <div className="pitch-modal__forecast">
            {timeline.slice(0, 6).map((item, idx) => {
                const sunClass = item.isSunEvent ? `pitch-modal__forecast-item--${item.type}` : '';

                return (
                    <div key={`${item.time}-${idx}`} className={`pitch-modal__forecast-item ${sunClass}`}>
                        <span className="pitch-modal__forecast-time">
                            {item.isSunEvent ? item.time : item.displayTime}
                        </span>
                        <i className={`wi ${item.iconClass} pitch-modal__forecast-icon`} aria-hidden="true" />
                        <span className="pitch-modal__forecast-temp">
                            {item.isSunEvent ? (item.type === 'sunrise' ? 'Rise' : 'Set') : `${item.temp}°C`}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default PitchForecast;
