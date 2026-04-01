import { buildHourlyItems } from '@utils/weatherUtils';
import './WeatherBar.css';

const WeatherBar = ({ weatherData, forecastData, pastHourly, sunrise, sunset, onCurrentClick, hidden }) => {
    if (!weatherData) return null;

    const items = buildHourlyItems(weatherData, forecastData, pastHourly, sunrise, sunset);

    return (
        <div
            className={`weather-bar ${hidden ? 'weather-bar--hidden' : ''}`}
        >
            {items.map((item, itemIndex) => {
                const isMid = item.isCurrent;
                const isSun = item.isSunEvent;
                const itemClassName = `weather-bar__item ${isMid ? 'weather-bar__item--current' : ''} ${isSun ? 'weather-bar__item--sun' : ''}`;
                const content = (
                    <>
                        {/* Time */}
                        <span className={`weather-bar__time ${isMid ? 'weather-bar__time--current' : ''}`}>
                            {item.time}
                        </span>

                        {/* Icon - centered in remaining space */}
                        <div className="weather-bar__icon-wrap">
                            <i
                                className={`wi ${item.iconClass} weather-bar__icon ${isMid ? 'weather-bar__icon--current' : ''}`}
                                aria-hidden="true"
                            />
                        </div>

                        {/* Temperature or event name */}
                        <span className={`weather-bar__temp ${isMid ? 'weather-bar__temp--current' : ''} ${isSun ? 'weather-bar__temp--sun' : ''}`}>
                            {isSun ? (item.type === 'sunrise' ? 'Rise' : 'Set') : `${item.temp}°C`}
                        </span>
                    </>
                );

                if (!isMid) {
                    return (
                        <div key={itemIndex} className={itemClassName}>
                            {content}
                        </div>
                    );
                }

                return (
                    <button
                        key={itemIndex}
                        type="button"
                        onClick={onCurrentClick}
                        className={itemClassName}
                        aria-label="Open current weather details"
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
};

export default WeatherBar;
