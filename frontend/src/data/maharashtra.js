// Simplified Maharashtra state outline (approximate, for an offline basemap).
// [lat, lng] pairs traced clockwise. Not survey-grade — a recognizable
// silhouette so the risk bubbles read against the real state shape with
// ZERO external tile/network calls.
export const MAHARASHTRA_OUTLINE = [
  // West (Konkan) coast, south → north
  [15.72, 73.68], [16.30, 73.40], [16.98, 73.28], [17.70, 73.05], [18.40, 72.86],
  [19.10, 72.78], [19.70, 72.70], [20.05, 72.80],
  // North border (MP), west → east
  [20.85, 73.55], [21.45, 74.40], [21.40, 75.55], [21.55, 76.55], [21.45, 77.75],
  [21.75, 78.85], [21.60, 79.70], [21.55, 80.20],
  // East border (Chhattisgarh / Telangana), north → south
  [20.60, 80.25], [19.70, 80.45], [18.95, 80.30], [18.70, 80.05],
  // South border (Telangana / Karnataka), east → west
  [18.40, 79.25], [17.85, 77.95], [17.55, 77.05], [17.30, 76.30], [16.70, 75.30],
  [16.05, 74.60], [15.78, 74.10], [15.72, 73.68],
];

// Revenue-division centroids (for optional division labels / future use).
export const DIVISION_POINTS = {
  Nashik: [20.0, 73.8],
  Pune: [18.5, 73.9],
  Konkan: [18.5, 73.0],
  Amravati: [21.0, 77.8],
  Nagpur: [20.5, 79.5],
};
