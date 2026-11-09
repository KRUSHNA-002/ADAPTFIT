/**
 * ADAPTFIT – Unified API client for Flask backend.
 * Seamlessly handles:
 *  1. Vite development proxy (/api)
 *  2. Direct local loopback (http://127.0.0.1:5001 & http://localhost:5001)
 *  3. Cloud deployment environments (e.g. Render: https://adaptfit-api.onrender.com)
 */
let normalizedEnvUrl = (import.meta.env.VITE_API_URL || '').trim();
// Automatically prepend https:// if Render injects bare hostname (e.g. fromService: property: host)
if (
  normalizedEnvUrl &&
  !normalizedEnvUrl.startsWith('http://') &&
  !normalizedEnvUrl.startsWith('https://') &&
  !normalizedEnvUrl.startsWith('/')
) {
  normalizedEnvUrl = `https://${normalizedEnvUrl}`;
}
// Strip any accidental trailing slash to ensure clean path concatenation
const ENV_URL = normalizedEnvUrl.endsWith('/') ? normalizedEnvUrl.slice(0, -1) : normalizedEnvUrl;

function getCandidateEndpoints(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If explicitly configured with a remote cloud URL (e.g. Render production)
  if (ENV_URL && !ENV_URL.includes('localhost') && !ENV_URL.includes('127.0.0.1')) {
    return [`${ENV_URL}${cleanPath}`];
  }

  // Local development order:
  // 1. Relative path: routes cleanly through Vite's local dev server proxy (no CORS/IPv6 issues)
  // 2. Direct 127.0.0.1:5001 (standard IPv4 loopback)
  // 3. Direct localhost:5001 (system loopback)
  return [cleanPath, `http://127.0.0.1:5001${cleanPath}`, `http://localhost:5001${cleanPath}`];
}

export async function apiFetch(path, options = {}) {
  const candidates = getCandidateEndpoints(path);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (_) { /* ignore */ }
        throw new Error(errMsg);
      }
      clearTimeout(timeout);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (jsonErr) {
        if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('<head>')) {
          throw new Error(
            'Received HTML document instead of API JSON. In production on Render, ensure the frontend environment variable VITE_API_URL is configured to your Flask backend service URL (e.g. https://adaptfit-api.onrender.com).'
          );
        }
        throw new Error('Invalid JSON payload returned from API.');
      }
    } catch (err) {
      lastError = err;
      // Do not retry connection if server explicitly responded with an HTTP client/server error
      if (err.message && (err.message.startsWith('HTTP 4') || err.message.startsWith('HTTP 5'))) {
        clearTimeout(timeout);
        throw err;
      }
      // Continue to next candidate endpoint if it was a connection/network failure
    }
  }

  clearTimeout(timeout);
  if (lastError?.name === 'AbortError') {
    throw new Error('Request timed out. The backend or external data provider may be slow.');
  }
  if (
    lastError?.message &&
    (lastError.message.includes('fetch') ||
      lastError.message.includes('NetworkError') ||
      lastError.message.includes('Failed to fetch'))
  ) {
    throw new Error('Cannot connect to backend. Please ensure the Flask backend is running on port 5001.');
  }
  throw lastError || new Error('Network request failed');
}

export const API_BASE = ENV_URL && !ENV_URL.includes('localhost') && !ENV_URL.includes('127.0.0.1')
  ? ENV_URL
  : '';
