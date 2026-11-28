// The field overview and full flight tool share the same units, location and freshness check.
window.LaBFieldForecast = (() => {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=42.67&longitude=-83.03&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,precipitation,cloud_cover&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto";
  let pending,
    last = 0,
    latest;
  async function load() {
    if (latest && Date.now() - last < 600000) return latest;
    if (pending) return pending;
    pending = (async () => {
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 9000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw Error("Forecast unavailable");
        const data = await response.json(),
          w = data.current;
        if (
          !w ||
          ![
            w.wind_speed_10m,
            w.wind_gusts_10m,
            w.wind_direction_10m,
            w.temperature_2m,
          ].every(Number.isFinite)
        )
          throw Error("Missing readings");
        const time =
          Date.parse(w.time + "Z") - (data.utc_offset_seconds || 0) * 1000;
        const stale = !Number.isFinite(time) || Date.now() - time > 10800000;
        latest = { ...data, stale };
        last = Date.now();
        return latest;
      } finally {
        clearTimeout(timer);
        pending = null;
      }
    })();
    return pending;
  }
  return { load };
})();
