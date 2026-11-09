/**
 * Standardized Location Schema for ADAPTFIT
 * Formatted for direct integration with future Flask REST API,
 * SQLite storage tables, and external environmental data providers.
 */

/**
 * Creates a clean location data object from Google Geocoder or Places result.
 */
export function createAdaptfitLocation({
  id = 'loc_a',
  role = 'reference', // 'reference' | 'target'
  name = '',
  formattedAddress = '',
  lat = 0,
  lng = 0,
  placeId = '',
  locationType = 'APPROXIMATE',
  addressComponents = {},
  viewport = null,
  assignedAdaptationIds = []
}) {
  return {
    id,
    role,
    name: name || formattedAddress.split(',')[0] || 'Unknown Location',
    formattedAddress,
    coordinates: {
      lat: Number(Number(lat).toFixed(6)),
      lng: Number(Number(lng).toFixed(6))
    },
    addressComponents: {
      locality: addressComponents.locality || '',
      administrativeAreaLevel1: addressComponents.administrativeAreaLevel1 || '',
      administrativeAreaLevel2: addressComponents.administrativeAreaLevel2 || '',
      country: addressComponents.country || '',
      countryCode: addressComponents.countryCode || '',
      postalCode: addressComponents.postalCode || ''
    },
    placeId: placeId || '',
    locationType: locationType || 'APPROXIMATE',
    viewport: viewport || null,
    geocodedAt: new Date().toISOString(),
    assignedAdaptationIds: Array.isArray(assignedAdaptationIds) ? assignedAdaptationIds : []
  };
}

/**
 * Parses OpenStreetMap Nominatim result (search or reverse geocode) into structured location.
 */
export function parseNominatimResult(result, role = 'reference') {
  if (!result || result.lat == null || result.lon == null) return null;

  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  if (isNaN(lat) || isNaN(lng)) return null;

  const addr = result.address || {};
  const locality = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || '';
  const admin1 = addr.state || addr.province || addr.region || '';
  const admin2 = addr.state_district || addr.county || '';
  const country = addr.country || '';
  const countryCode = (addr.country_code || '').toUpperCase();
  const postalCode = addr.postcode || '';

  // Derive concise name
  let conciseName = locality;
  if (conciseName && country) {
    conciseName = `${conciseName}, ${country}`;
  } else if (admin1 && country) {
    conciseName = `${admin1}, ${country}`;
  } else if (result.name) {
    conciseName = country ? `${result.name}, ${country}` : result.name;
  } else if (result.display_name) {
    const parts = result.display_name.split(',');
    conciseName = parts.length > 1 ? `${parts[0].trim()}, ${parts[parts.length - 1].trim()}` : parts[0].trim();
  } else {
    conciseName = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  }

  return createAdaptfitLocation({
    id: role === 'A' || role === 'reference' ? 'loc_a' : 'loc_b',
    role: role === 'A' || role === 'reference' ? 'reference' : 'target',
    name: conciseName,
    formattedAddress: result.display_name || conciseName,
    lat,
    lng,
    placeId: String(result.place_id || result.osm_id || ''),
    locationType: result.type || 'APPROXIMATE',
    addressComponents: {
      locality,
      administrativeAreaLevel1: admin1,
      administrativeAreaLevel2: admin2,
      country,
      countryCode,
      postalCode
    }
  });
}

/**
 * Parses Google Maps Geocoder result into structured address components.
 */
export function parseGoogleGeocodeResult(result, role = 'reference') {
  if (!result || !result.geometry) return null;

  const lat = typeof result.geometry.location.lat === 'function'
    ? result.geometry.location.lat()
    : result.geometry.location.lat;
  const lng = typeof result.geometry.location.lng === 'function'
    ? result.geometry.location.lng()
    : result.geometry.location.lng;

  const components = {
    locality: '',
    administrativeAreaLevel1: '',
    administrativeAreaLevel2: '',
    country: '',
    countryCode: '',
    postalCode: ''
  };

  if (Array.isArray(result.address_components)) {
    result.address_components.forEach((c) => {
      const types = c.types || [];
      if (types.includes('locality')) {
        components.locality = c.long_name;
      } else if (!components.locality && types.includes('postal_town')) {
        components.locality = c.long_name;
      } else if (!components.locality && types.includes('sublocality_level_1')) {
        components.locality = c.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.administrativeAreaLevel1 = c.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        components.administrativeAreaLevel2 = c.long_name;
      } else if (types.includes('country')) {
        components.country = c.long_name;
        components.countryCode = c.short_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = c.long_name;
      }
    });
  }

  // Derive a user-friendly concise name
  let conciseName = components.locality;
  if (conciseName && components.country) {
    conciseName = `${conciseName}, ${components.country}`;
  } else if (components.administrativeAreaLevel1 && components.country) {
    conciseName = `${components.administrativeAreaLevel1}, ${components.country}`;
  } else {
    conciseName = result.formatted_address ? result.formatted_address.split(',')[0] : 'Pinned Location';
  }

  let viewport = null;
  if (result.geometry.viewport) {
    const vp = result.geometry.viewport;
    viewport = {
      north: typeof vp.getNorthEast === 'function' ? vp.getNorthEast().lat() : vp.north,
      east: typeof vp.getNorthEast === 'function' ? vp.getNorthEast().lng() : vp.east,
      south: typeof vp.getSouthWest === 'function' ? vp.getSouthWest().lat() : vp.south,
      west: typeof vp.getSouthWest === 'function' ? vp.getSouthWest().lng() : vp.west
    };
  }

  return createAdaptfitLocation({
    id: role === 'reference' ? 'loc_a' : 'loc_b',
    role,
    name: conciseName,
    formattedAddress: result.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    lat,
    lng,
    placeId: result.place_id || '',
    locationType: result.geometry.location_type || 'APPROXIMATE',
    addressComponents: components,
    viewport
  });
}

/**
 * Calculates geodesic distance between two coordinate pairs using Haversine formula.
 * Real geographic calculation - zero fabricated environmental metrics.
 */
export function computeGeodesicDistance(coordA, coordB) {
  if (!coordA || !coordB) return null;
  const lat1 = coordA.lat;
  const lon1 = coordA.lng;
  const lat2 = coordB.lat;
  const lon2 = coordB.lng;

  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMiles = distanceKm * 0.621371;
  const distanceNauticalMiles = distanceKm * 0.539957;

  return {
    km: Number(distanceKm.toFixed(1)),
    miles: Number(distanceMiles.toFixed(1)),
    nauticalMiles: Number(distanceNauticalMiles.toFixed(1))
  };
}

/**
 * Calculates initial bearing (forward azimuth) from coordA to coordB in degrees (0–360°).
 */
export function computeInitialBearing(coordA, coordB) {
  if (!coordA || !coordB) return null;
  const lat1 = (coordA.lat * Math.PI) / 180;
  const lon1 = (coordA.lng * Math.PI) / 180;
  const lat2 = (coordB.lat * Math.PI) / 180;
  const lon2 = (coordB.lng * Math.PI) / 180;

  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const dirIndex = Math.round(bearing / 22.5) % 16;

  return {
    degrees: Number(bearing.toFixed(1)),
    cardinal: directions[dirIndex]
  };
}

/**
 * Export structured JSON payload ready for Flask / SQLite backend.
 */
export function exportLocationPayload(locationA, locationB) {
  const distance = computeGeodesicDistance(
    locationA?.coordinates,
    locationB?.coordinates
  );
  const bearing = computeInitialBearing(
    locationA?.coordinates,
    locationB?.coordinates
  );

  return {
    schemaVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    benchmark: {
      geodesicDistance: distance,
      initialBearing: bearing,
      spatialDivergenceKm: distance?.km || null
    },
    referenceLocationA: locationA ? { ...locationA } : null,
    targetLocationB: locationB ? { ...locationB } : null
  };
}

