import WeatherSlot from './WeatherSlot';

const WeatherBar = ({ items, sunrises, sunsets, onCurrentClick, hidden }) => {
    if (!items || items.length === 0) return null;

    return (
        <div
            className={`absolute top-1.5 left-0 right-0 w-full px-2 flex justify-center z-10 transition-transform duration-500 ease-out ${hidden ? '-translate-y-[120%]' : 'translate-y-0'}`}
        >
            {items.map((item, idx) => (
                <WeatherSlot
                    key={idx}
                    item={item}
                    isMid={item.isCurrent}
                    onCurrentClick={onCurrentClick}
                    sunrises={sunrises}
                    sunsets={sunsets}
                />
            ))}
        </div>
    );
};

export default WeatherBar;
