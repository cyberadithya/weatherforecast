import React, { useMemo } from 'react'
import './ForecastStrip.css'

// Make a YYYY-MM-DD key using UTC getters *after* shifting by tz
function ymdFromLocalDate(d) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const da = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

function sameYMD(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

function dayLabelFromLocal(localDate, tzSeconds) {
  // "Now" in the city's local time
  const nowLocal = new Date(Date.now() + tzSeconds * 1000)
  if (sameYMD(nowLocal, localDate)) return 'Today'
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[localDate.getUTCDay()] // UTC getters on the tz-shifted date
}

function useDailySummary(forecast) {
  return useMemo(() => {
    if (!forecast || !forecast.list || !forecast.city) return []
    const tz = forecast.city.timezone || 0 // seconds offset from UTC (can be negative)

    // Group 3-hour slots by the city's local day
    const groups = {}
    for (const item of forecast.list) {
      // Shift the UTC timestamp by tz to get the city's "local" date object
      const local = new Date((item.dt + tz) * 1000)
      const key = ymdFromLocalDate(local)
      ;(groups[key] ||= []).push({ local, item })
    }

    // Summarize each day
    const days = Object.keys(groups).sort().map(key => {
      const slots = groups[key]

      // daily min/max temp
      let tmin = Infinity, tmax = -Infinity
      for (const s of slots) {
        const t = s.item.main?.temp
        if (typeof t === 'number') {
          if (t < tmin) tmin = t
          if (t > tmax) tmax = t
        }
      }

      // pick the slot closest to 12:00 (city local time)
      const noonPick = slots.reduce((best, cur) => {
        const h = cur.local.getUTCHours()       // UTC getters on tz-shifted date == local hours
        const score = Math.abs(h - 12)
        const bestScore = Math.abs((best?.local.getUTCHours() ?? 12) - 12)
        return score < bestScore ? cur : best
      }, slots[0])

      return {
        dateKey: key,
        label: dayLabelFromLocal(noonPick.local, tz),
        icon: noonPick.item.weather?.[0]?.icon,
        main: noonPick.item.weather?.[0]?.main,
        min: Math.round(tmin),
        max: Math.round(tmax),
      }
    })

    return days.slice(0, 5)
  }, [forecast])
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
