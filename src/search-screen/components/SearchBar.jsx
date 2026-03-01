import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle, Clock } from 'lucide-react';
import { SPORT_FILTERS } from '../../data/venues';
import { getDistanceKm } from '../../utils/pitchUtils';

const SearchBar = ({ onSearch, expanded, onExpand, onCollapse, venues = [], userLocation, onVenueSelect }) => {
    const [query, setQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState(['football', 'cricket']);
    const [openOnly, setOpenOnly] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [expanded]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch && query.trim()) {
            onSearch(query);
        }
    };

    const toggleFilter = (key) => {
        setActiveFilters(prev =>
            prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
        );
    };

    // Filter venues by sport type, open status, and optional text query, sorted by distance
    const filteredVenues = useMemo(() => {
        let result = venues.filter((v) => activeFilters.includes(v.type));

        if (openOnly) {
            result = result.filter((v) => v.openNow === true);
        }

        if (query.trim()) {
            const q = query.toLowerCase();
            result = result.filter((v) => v.name.toLowerCase().includes(q));
        }

        if (userLocation) {
            result = result.map((v) => ({
                ...v,
                _dist: getDistanceKm(userLocation.lat, userLocation.lng, v.lat, v.lng),
            }));
            result.sort((a, b) => a._dist - b._dist);
        }

        return result;
    }, [venues, activeFilters, openOnly, query, userLocation]);

    const getSportIcon = (type) => {
        const sport = SPORT_FILTERS.find((s) => s.key === type);
        return sport ? sport.icon : '/sports/Football.svg';
    };

    const formatDistance = (km) => (km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`);

    return (
        <>
            {/* Collapsed search bar */}
            <div
                className={`absolute top-[clamp(8.5rem,28vw,11.5rem)] w-full px-4 flex justify-center z-10 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${expanded ? 'opacity-0 scale-95 -translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}
            >
                <button
                    onClick={onExpand}
                    className="w-[70%] max-w-[18rem] bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex items-center px-5 py-3 border border-white/80 pointer-events-auto transition-transform active:scale-95"
                >
                    <span className="flex-1 text-left text-black/50 text-[1rem] font-semibold tracking-wide">Search for Pitches</span>
                    <Search className="w-5 h-5 text-black/40 stroke-[3]" />
                </button>
            </div>

            {/* Expanded search modal — floating card */}
            <div
                className={`absolute top-0 left-0 right-0 z-30 px-3 pt-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${expanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}
            >
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col max-h-[75dvh] overflow-hidden">
                    {/* Search input */}
                    <div className="px-4 pt-4 pb-2 flex-shrink-0">
                        <form onSubmit={handleSubmit} className="flex items-center px-1">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg placeholder-gray-400 font-medium pl-2"
                            />
                            <button type="button" onClick={onCollapse} className="p-1">
                                <X className="w-6 h-6 text-gray-400 stroke-[2.5]" />
                            </button>
                        </form>
                        <div className="mt-2 border-b border-gray-100" />
                    </div>

                    {/* Sport filter chips + Open Now toggle */}
                    <div className="px-5 py-3 flex items-center gap-4 flex-shrink-0">
                        {SPORT_FILTERS.map((sport) => {
                            const isActive = activeFilters.includes(sport.key);
                            return (
                                <button
                                    key={sport.key}
                                    onClick={() => toggleFilter(sport.key)}
                                    className={`relative flex flex-col items-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <img src={sport.icon} alt={sport.label} className="w-12 h-12 object-contain" />
                                    {isActive && (
                                        <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 fill-white" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Open Now toggle */}
                        <button
                            onClick={() => setOpenOnly((v) => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] text-sm font-semibold transition-all ${openOnly
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                                }`}
                        >
                            <Clock className="w-4 h-4" strokeWidth={2.5} />
                            Open
                        </button>
                    </div>

                    {/* Venue list */}
                    <div className="flex-1 overflow-y-auto px-4 pb-3">
                        {filteredVenues.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-6">No pitches found nearby</p>
                        )}
                        {filteredVenues.map((venue, idx) => (
                            <button
                                key={venue.placeId || idx}
                                onClick={() => onVenueSelect?.(venue)}
                                className="w-full flex items-center gap-3 py-3 px-3 border-b border-gray-100 last:border-b-0 text-left active:bg-gray-50 transition-colors"
                            >
                                <img src={getSportIcon(venue.type)} alt={venue.type} className="w-10 h-10 object-contain flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-black font-semibold text-[0.95rem] truncate">{venue.name}</p>
                                    <div className="flex gap-2 items-center text-sm">
                                        {venue.closingSoon ? (
                                            <>
                                                <span className="font-semibold text-orange-500">Closing soon</span>
                                                {venue.closesAt && (
                                                    <span className="text-gray-400">{venue.closesAt}</span>
                                                )}
                                            </>
                                        ) : venue.openNow != null ? (
                                            <>
                                                <span className={`font-semibold ${venue.openNow ? 'text-green-600' : 'text-red-500'}`}>
                                                    {venue.openNow ? 'Open' : 'Closed'}
                                                </span>
                                                {venue.closesAt && venue.openNow && (
                                                    <span className="text-gray-400">Closes {venue.closesAt}</span>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                                {venue._dist != null && (
                                    <span className="text-black font-semibold text-lg flex-shrink-0">
                                        {formatDistance(venue._dist)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchBar;
