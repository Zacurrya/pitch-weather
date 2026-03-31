import { Navigation } from 'lucide-react';

const LocateUserButton = ({ show, onClick }) => {
    if (!show) return null;

    return (
        <button
            onClick={onClick}
            className="absolute bottom-10 right-5 w-[3.25rem] h-[3.25rem] bg-white/60 backdrop-blur-md rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-white/40 flex items-center justify-center z-10 active:scale-95 transition-transform"
            aria-label="Find my location"
        >
            <Navigation
                className="w-5 h-5 text-black/80"
                fill="none"
                strokeWidth={2.4}
            />
        </button>
    );
};

export default LocateUserButton;
