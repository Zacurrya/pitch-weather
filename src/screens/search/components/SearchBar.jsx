import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, CheckCircle, Clock, Loader } from 'lucide-react';
import { getDistanceKm, getVenueSportIcon, SPORT_FILTERS } from '@utils/pitchUtils';
import './SearchBar.css';

const SearchBar = ({ onSearch, expanded, onExpand, onCollapse, venues = [], userLocation, onVenueSelect, searchResults = null, searchLoading = false }) => {
    const [query, setQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState(['football', 'cricket']);
    const [openOnly, setOpenOnly] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (expanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [expanded]);

    // Debounce live search, fire onSearch 300ms after the user stops typing
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (query.trim()) {
            debounceRef.current = setTimeout(() => {
                onSearch?.(query.trim());
            }, 300);
        } else {
            onSearch?.(null);
        }
        return () => clearTimeout(debounceRef.current);
    }, [query, onSearch]);

    const toggleFilter = (key) => {
        setActiveFilters(prev =>
            prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
        );
    };

    // When a live search is active, show those results; otherwise filter the map-fetched venues
    const filteredVenues = useMemo(() => {
        let result = searchResults !== null
            ? searchResults
            : venues.filter((v) => activeFilters.includes(v.type));

        if (openOnly) {
            result = result.filter((v) => v.openNow === true);
        }

        if (userLocation) {
            result = result.map((v) => ({
                ...v,
                _dist: getDistanceKm(userLocation.lat, userLocation.lng, v.lat, v.lng),
            }));
            result.sort((a, b) => a._dist - b._dist);
        }

        return result;
    }, [searchResults, venues, activeFilters, openOnly, userLocation]);

    const formatDistance = (km) => (km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`);

    return (
        <>
            {/* Collapsed search bar */}
            <div
                className={`search-bar__collapsed ${expanded ? 'search-bar__collapsed--hidden' : ''}`}
            >
                <button
                    onClick={onExpand}
                    className="search-bar__pill"
                >
                    <span className="search-bar__pill-text">Search for Pitches</span>
                    <Search className="search-bar__pill-icon" />
                </button>
            </div>

            {/* Expanded search modal */}
            <div
                className={`search-bar__expanded ${expanded ? '' : 'search-bar__expanded--hidden'}`}
            >
                <div className="search-bar__panel">
                    {/* Search input */}
                    <div className="search-bar__input-wrap">
                        <div className="search-bar__input-row">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="search-bar__input"
                            />
                            {searchLoading && (
                                <Loader className="search-bar__loader" />
                            )}
                            <button type="button" onClick={() => { setQuery(''); onCollapse(); }} className="search-bar__close-btn">
                                <X className="search-bar__close-icon" />
                            </button>
                        </div>
                        <div className="search-bar__divider" />
                    </div>

                    {/* Sport filter chips + open now toggle */}
                    <div className="search-bar__filters">
                        {SPORT_FILTERS.map((sport) => {
                            const isActive = activeFilters.includes(sport.key);
                            return (
                                <button
                                    key={sport.key}
                                    onClick={() => toggleFilter(sport.key)}
                                    className={`search-bar__sport-btn ${isActive ? 'search-bar__sport-btn--active' : ''}`}
                                >
                                    <img src={sport.icon} alt={sport.label} className="search-bar__sport-icon" />
                                    {isActive && (
                                        <CheckCircle className="search-bar__check" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Spacer */}
                        <div className="search-bar__spacer" />

                        {/* Open now toggle */}
                        <button
                            onClick={() => setOpenOnly((v) => !v)}
                            className={`search-bar__open-toggle ${openOnly ? 'search-bar__open-toggle--active' : ''}`}
                        >
                            <Clock className="search-bar__open-toggle-icon" strokeWidth={2.5} />
                            Open
                        </button>
                    </div>

                    {/* Venue list */}
                    <div className="search-bar__list">
                        {filteredVenues.length === 0 && (
                            <p className="search-bar__empty">No pitches found nearby</p>
                        )}
                        {filteredVenues.map((venue, idx) => (
                            <button
                                key={venue.placeId || idx}
                                onClick={() => onVenueSelect?.(venue)}
                                className="search-bar__venue"
                            >
                                <img src={getVenueSportIcon(venue.type)} alt={venue.type} className="search-bar__venue-icon" />
                                <div className="search-bar__venue-info">
                                    <p className="search-bar__venue-name">{venue.name}</p>
                                    <div className="search-bar__venue-meta">
                                        {venue.closingSoon ? (
                                            <>
                                                <span className="search-bar__closing-soon">Closing soon</span>
                                                {venue.closesAt && (
                                                    <span className="search-bar__closes-at">{venue.closesAt}</span>
                                                )}
                                            </>
                                        ) : venue.openNow != null ? (
                                            <>
                                                <span className={venue.openNow ? 'search-bar__status--open' : 'search-bar__status--closed'}>
                                                    {venue.openNow ? 'Open' : 'Closed'}
                                                </span>
                                                {venue.closesAt && venue.openNow && (
                                                    <span className="search-bar__closes-at">Closes {venue.closesAt}</span>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                                {venue._dist != null && (
                                    <span className="search-bar__venue-dist">
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
