const WeatherSlot = ({ item, isMid, onCurrentClick, sunrises, sunsets }) => {
    return (
        <button
            onClick={isMid ? onCurrentClick : undefined}
            className={`flex flex-col items-center bg-white/95 backdrop-blur-md rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/60 transition-all flex-1
              ${isMid
                ? 'h-[clamp(5.5rem,22vw,7.5rem)] mx-0.5 translate-y-1 cursor-pointer active:scale-95 shadow-[0_8px_25px_rgba(0,0,0,0.12)] border-white/90 z-10'
                : 'h-[clamp(4.5rem,18vw,6rem)] mx-0.5 opacity-80 cursor-default'
            }`}
        >
            {/* Time - pinned to top */}
            <span className={`pt-2 flex items-center gap-1 text-black font-medium ${isMid ? 'text-[clamp(0.65rem,2.8vw,0.85rem)]' : 'text-[clamp(0.6rem,2.2vw,0.75rem)]'}`}>
                {item.time}
            </span>

            {/* Icon - centered in remaining space */}
            <div className="flex-1 flex items-center justify-center">
                <i
                    className={`wi ${item.iconClass} ${isMid ? 'text-[clamp(2rem,9vw,3rem)]' : 'text-[clamp(1.6rem,7vw,2.2rem)]'}`}
                    aria-label="weather"
                />
            </div>

            {/* Temperature - pinned to bottom */}
            <span className={`pb-2 text-black font-semibold ${isMid ? 'text-[clamp(0.75rem,2.8vw,0.95rem)]' : 'text-[clamp(0.65rem,2.2vw,0.8rem)]'}`}>
                {item.isSunEvent ? (item.type === 'sunrise' ? 'Rise' : 'Set') : `${item.temp}°C`}
            </span>
        </button>
    );
};

export default WeatherSlot;
