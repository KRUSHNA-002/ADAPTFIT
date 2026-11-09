
/**
 * ADAPTFIT – Assessment API calls
 */
import { apiFetch, API_BASE } from './apiClient';

export const assessmentApi = {
  /**
   * Run a full compatibility assessment.
   * Fetches real NASA POWER data for both locations and runs the engine.
   */
  calculate: (payload) =>
    apiFetch('/api/assessments/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** List past assessments */
  list: (page = 1, perPage = 20) =>
    apiFetch(`/api/assessments?page=${page}&per_page=${perPage}`),

  /** Get a specific assessment */
  get: (id) => apiFetch(`/api/assessments/${id}`),

  /** CSV export URL (direct download link) */
  csvExportUrl: (id) => `${API_BASE}/api/assessments/${id}/export/csv`,
};

export const compatibilityApi = {
  /** Score one adaptation or rank all adaptations */
  score: (payload) =>
    apiFetch('/api/compatibility/score', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const satelliteApi = {
  getLayers: () => apiFetch('/api/satellite/layers'),
};



