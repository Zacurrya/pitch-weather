import { getHourlyIconClass, wmoToCondition, injectSunEvents } from '@utils/weatherUtils';
import './PitchForecast.css';

const PitchForecast = ({ futureHourly, sunrise, sunset }) => {
    if (!futureHourly || futureHourly.length === 0) return null;

    // Standardize each hour as much as buildHourlyItems does
    const items = futureHourly.map(fh => ({
        time: fh.time, // raw ISO
        displayTime: `${new Date(fh.time).getHours().toString().padStart(2, '0')}:00`,
        condition: wmoToCondition(fh.weather_code),
        temp: Math.round(fh.temp)
    }));

    const timeline = injectSunEvents(items, sunrise, sunset);

    return (
        <div className="pitch-modal__forecast">
            {timeline.slice(0, 6).map((item, idx) => {
                const iconClass = item.isSunEvent 
                    ? item.iconClass // injectSunEvents already sets this
                    : getHourlyIconClass(item.condition, item.time, sunrise, sunset);

                return (
                    <div key={idx} className="pitch-modal__forecast-item">
                        <span className="pitch-modal__forecast-time">
                            {item.isSunEvent ? item.time : item.displayTime}
                        </span>
                        <i className={`wi ${iconClass} pitch-modal__forecast-icon`} aria-hidden="true" />
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
