import { SPORT_FILTERS } from '../data/venues';

/**
 * Filter venues by the currently active sport keys.
 */
export const filterVenues = (venues, activeFilters) =>
    venues.filter((v) => activeFilters.includes(v.type));

/**
 * Look up the icon path for a given sport type.
 */
export const getSportIcon = (type) => {
    const sport = SPORT_FILTERS.find((s) => s.key === type);
    return sport ? sport.icon : '/sports/Football.svg';
};
