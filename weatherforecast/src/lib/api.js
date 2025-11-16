// src/lib/api.js
const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE || 'https://weatherforecast-9f67.onrender.com/api')
  : '/api';

console.log('API_BASE =', API_BASE);

export async function searchColleges(q) {
  const res = await fetch(`${API_BASE}/colleges?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("College lookup failed");
  return res.json();
}

export async function getWeatherByCoords({ lat, lon, units = 'imperial' }) {
  const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&units=${units}`);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

export async function getForecastByCoords({ lat, lon, units = 'imperial' }) {
  const url = `${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${units}`;
  console.log('[api] forecast URL:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast fetch failed");
  return res.json();
}
