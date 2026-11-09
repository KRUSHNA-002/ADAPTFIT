/**
 * ADAPTFIT – Location API calls
 */
import { apiFetch } from './apiClient';

export const locationApi = {
  /** Save a location to the backend database */
  save: (location) =>
    apiFetch('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        name: location.name,
        formatted_address: location.formattedAddress || location.name,
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        place_id: location.placeId || '',
        country: location.addressComponents?.country || '',
        admin_area: location.addressComponents?.administrativeAreaLevel1 || '',
        role: location.role || 'reference',
      }),
    }),

  /** List saved locations */
  list: () => apiFetch('/api/locations'),

  /** Save location pair comparison */
  saveComparison: (locationAId, locationBId, notes = '') =>
    apiFetch('/api/locations/compare', {
      method: 'POST',
      body: JSON.stringify({
        location_a_id: locationAId,
        location_b_id: locationBId,
        notes,
      }),
    }),

  /** List saved comparisons */
  listComparisons: () => apiFetch('/api/locations/comparisons'),
};

