/**
 * Re-export all Places functions from the canonical service module.
 * Keeps existing `import { … } from '../utils/placesUtils'` working.
 */
export {
    searchNearbyPitches,
    fetchOpeningHours,
    searchPitchesByText,
    getPlaceDetails,
} from '@services/placesService';
