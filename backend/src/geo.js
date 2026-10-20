const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export function distanceMeters(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** One layer of defence, not the only one. No registered property => geoOk=false (never silently true). */
export function checkGeo(point, property, radius) {
  if (!property) return { geoOk: false, distanceMeters: null, reason: 'no_property_location' };
  const d = distanceMeters(point, property);
  return { geoOk: d <= radius, distanceMeters: Math.round(d), reason: d <= radius ? 'within_radius' : 'outside_radius' };
}
