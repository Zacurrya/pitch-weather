import { Navigation } from 'lucide-react';
import './LocateUserButton.css';

const LocateUserButton = ({ show, onClick }) => {
    if (!show) return null;

    return (
        <button
            onClick={onClick}
            className="locate-btn"
            aria-label="Find my location"
        >
            <Navigation
                className="locate-btn__icon"
                fill="none"
                strokeWidth={2.4}
            />
        </button>
    );
};

export default LocateUserButton;
