import { buildHourlyItems } from '@utils/weatherUtils';
import './WeatherBar.css';

const WeatherSlot = ({ item, isMid, onCurrentClick }) => {
    const isSun = item.isSunEvent;
    const sunClass = isSun ? `weather-bar__item--${item.type}` : '';

    return (
        <button
            onClick={isMid ? onCurrentClick : undefined}
            className={`weather-bar__item ${isMid ? 'weather-bar__item--current' : ''} ${sunClass}`}
            aria-label={isSun ? (item.type === 'sunrise' ? `Sunrise at ${item.time}` : `Sunset at ${item.time}`) : undefined}
        >
            <span className={`weather-bar__time ${isMid ? 'weather-bar__time--current' : ''}`}>
                {item.time}
            </span>

            <div className="weather-bar__icon-wrap">
                <i
                    className={`wi ${item.iconClass} weather-bar__icon ${isMid ? 'weather-bar__icon--current' : ''}`}
                    aria-hidden="true"
                />
            </div>

            <span className={`weather-bar__temp ${isMid ? 'weather-bar__temp--current' : ''}`}>
                {isSun ? (item.type === 'sunrise' ? 'Rise' : 'Set') : `${item.temp}°C`}
            </span>
        </button>
    );
};

const WeatherBar = ({ weatherData, forecastData, pastHourly, sunrises = [], sunsets = [], onCurrentClick, hidden }) => {
    if (!weatherData) return null;

    const nowIso = new Date().toISOString();
    const items = buildHourlyItems(weatherData, forecastData, pastHourly, sunrises, sunsets)
        .filter((item) => !item.isSunEvent || item.time_iso > nowIso);

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
