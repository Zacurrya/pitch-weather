import { buildHourlyItems } from '@utils/weatherUtils';
import './WeatherBar.css';

const WeatherBar = ({ weatherData, forecastData, pastHourly, onCurrentClick, hidden }) => {
    if (!weatherData) return null;

    const items = buildHourlyItems(weatherData, forecastData, pastHourly);

    return (
        <div
            className={`weather-bar ${hidden ? 'weather-bar--hidden' : ''}`}
        >
            {items.map((item, idx) => {
                const isMid = item.isCurrent;
                return (
                    <button
                        key={idx}
                        onClick={isMid ? onCurrentClick : undefined}
                        className={`weather-bar__item ${isMid ? 'weather-bar__item--current' : ''}`}
                    >
                        {/* Time - pinned to top */}
                        <span className={`weather-bar__time ${isMid ? 'weather-bar__time--current' : ''}`}>
                            {item.time}
                        </span>

                        {/* Icon - centered in remaining space */}
                        <div className="weather-bar__icon-wrap">
                            <img
                                src={item.icon}
                                alt="weather"
                                className={`weather-bar__icon ${isMid ? 'weather-bar__icon--current' : ''}`}
                            />
                        </div>

                        {/* Temperature - pinned to bottom */}
                        <span className={`weather-bar__temp ${isMid ? 'weather-bar__temp--current' : ''}`}>
                            {item.temp}°C
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default WeatherBar;
