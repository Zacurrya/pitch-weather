import { MapPin } from 'lucide-react';
import './SearchAreaButton.css';

const SearchAreaButton = ({ onClick, loading, show }) => {
    if (!show) return null;

    return (
        <div className="search-area-btn__wrapper">
            <button
                onClick={onClick}
                disabled={loading}
                className="search-area-btn"
            >
                <MapPin className="search-area-btn__icon" strokeWidth={2.5} />
                {loading ? 'Searching…' : 'Search this area'}
            </button>
        </div>
    );
};

export default SearchAreaButton;
