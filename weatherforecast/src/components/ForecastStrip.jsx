import React, { useMemo } from 'react'
import './ForecastStrip.css'

console.log('[ForecastStrip] loaded')
// Build a simple 5-day summary from the 3-hour data
function useDailySummary(forecast) {
  return useMemo(() => {
    if (!forecast || !forecast.list || !forecast.city) return []
    const tz = forecast.city.timezone || 0 // seconds offset from UTC

    // Group 3-hour slots by local YYYY-MM-DD
    const groups = {}
    for (const item of forecast.list) {
      const local = new Date((item.dt + tz) * 1000)
      const key = local.toISOString().slice(0, 10)
      ;(groups[key] ||= []).push({ local, item })
    }

    // For each day: pick the slot closest to noon, also compute min/max
    const days = Object.keys(groups).sort().map(key => {
      const slots = groups[key]
      let tmin = Infinity, tmax = -Infinity
      for (const s of slots) {
        const t = s.item.main?.temp
        if (typeof t === 'number') {
          if (t < tmin) tmin = t
          if (t > tmax) tmax = t
        }
      }
      const noonPick = slots.reduce((best, cur) => {
        const curH = cur.local.getUTCHours()
        const bestH = best?.local.getUTCHours() ?? 12
        return Math.abs(curH - 12) < Math.abs(bestH - 12) ? cur : best
      }, slots[0])

      return {
        dateKey: key,
        label: dayLabel(new Date((Date.parse(key) / 1000 - tz) * 1000), tz),
        icon: noonPick.item.weather?.[0]?.icon,
        main: noonPick.item.weather?.[0]?.main,
        min: Math.round(tmin),
        max: Math.round(tmax)
      }
    })

    return days.slice(0, 5)
  }, [forecast])
}

function dayLabel(dateUTC, tz) {
  const now = new Date()
  const todayLocal = new Date(now.getTime() + tz * 1000)
  const dateLocal  = new Date(dateUTC.getTime() + tz * 1000)
  const sameYMD = (a, b) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  if (sameYMD(todayLocal, dateLocal)) return 'Today'
  return dateLocal.toLocaleDateString(undefined, { weekday: 'short' })
}

export default function ForecastStrip({ forecast }) {
  const days = useDailySummary(forecast)
  if (!days.length) return null

  return (
    <div className="forecast">
      {days.map(d => (
        <div className="day-card" key={d.dateKey}>
          <div className="day">{d.label}</div>
          <img
            className="icon"
            alt={d.main || 'forecast'}
            src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
          />
          <div className="temps">
            <span className="max">High: {d.max}°</span>
            <span className="min">Low: {d.min}°</span>
          </div>
        </div>
      ))}
    </div>
  )
}
