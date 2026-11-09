/**
 * ADAPTFIT – Climate data API calls (NASA POWER via Flask backend)
 */
import { apiFetch } from './apiClient';

export const climateApi = {
  /**
   * Fetch annual climate summaries for a location.
   * Data from NASA POWER MERRA-2 reanalysis.
   */
  getHistorical: (lat, lng, startYear = 2005, endYear = 2023) =>
    apiFetch(`/api/climate/historical?lat=${lat}&lng=${lng}&start_year=${startYear}&end_year=${endYear}`),

  /**
   * Fetch 20-year monthly climatology (2001–2020 average).
   */
  getClimatology: (lat, lng) =>
    apiFetch(`/api/climate/climatology?lat=${lat}&lng=${lng}`),

  /**
   * Side-by-side historical climate comparison for two locations.
   */
  compare: (latA, lngA, latB, lngB, startYear = 2010, endYear = 2023) =>
    apiFetch(`/api/climate/compare?lat_a=${latA}&lng_a=${lngA}&lat_b=${latB}&lng_b=${lngB}&start_year=${startYear}&end_year=${endYear}`),
};

