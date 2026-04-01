import { buildHourlyItems } from '@utils/weatherUtils';
import './WeatherBar.css';

const WeatherSlot = ({ item, isMid, onCurrentClick }) => {
    return (
        <button
            onClick={isMid ? onCurrentClick : undefined}
            className={`weather-bar__item ${isMid ? 'weather-bar__item--current' : ''}`}
        >
            {/* Time - pinned to top */}
            <span className={`weather-bar__time ${isMid ? 'weather-bar__time--current' : ''} flex items-center justify-center gap-1`}>
                {item.time}
            </span>

            {/* Icon - centered in remaining space */}
            <div className="weather-bar__icon-wrap">
                <i
                    className={`wi ${item.iconClass} weather-bar__icon ${isMid ? 'weather-bar__icon--current' : ''}`}
                    aria-hidden="true"
                />
            </div>

            {/* Temperature or Event name - pinned to bottom */}
            <span className={`weather-bar__temp ${isMid ? 'weather-bar__temp--current' : ''}`}>
                {`${item.temp}°C`}
            </span>
        </button>
    );
};

const WeatherBar = ({ weatherData, forecastData, pastHourly, sunrises = [], sunsets = [], onCurrentClick, hidden }) => {
    if (!weatherData) return null;

    const items = buildHourlyItems(weatherData, forecastData, pastHourly, sunrises, sunsets)
        .filter((item) => !item.isSunEvent);

    return (
        <div className={`weather-bar ${hidden ? 'weather-bar--hidden' : ''}`}>
            {items.map((item, idx) => (
                <WeatherSlot
                    key={`${item.time_iso || item.time}-${idx}`}
                    item={item}
                    isMid={item.isCurrent}
                    onCurrentClick={onCurrentClick}
                />
            ))}
        </div>
    );
};

export default WeatherBar;
