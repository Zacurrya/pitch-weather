import { MapPin } from 'lucide-react';

const SearchAreaButton = ({ onClick, loading, show }) => {
    if (!show) return null;

    return (
        <div className="absolute top-[clamp(12rem,40vw,18rem)] left-0 right-0 flex justify-center z-10 pointer-events-none transition-all duration-500">
            <button
                onClick={onClick}
                disabled={loading}
                className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 bg-white/60 backdrop-blur-md rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-white/40 text-black/80 font-semibold text-[0.75rem] tracking-wide active:scale-95 transition-all disabled:opacity-40"
            >
                <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
                {loading ? 'Searching…' : 'Search this area'}
            </button>
        </div>
    );
};

export default SearchAreaButton;
