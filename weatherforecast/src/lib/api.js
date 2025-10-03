// src/lib/api.js
export async function searchColleges(q) {
  const res = await fetch(`/api/colleges?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("College lookup failed");
  return res.json();
}

export async function getWeatherByCoords({ lat, lon }) {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

export async function getForecastByCoords({ lat, lon }) {
  const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error('Forecast fetch failed')
  return res.json()
}
