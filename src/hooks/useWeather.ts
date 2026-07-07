import { useEffect, useState } from "react";

export interface WeatherSnapshot {
  tempC: number;
  windKph: number;
  condition: string;
  fetchedAt: number;
}

// New York (MetLife-ish) — one of the confirmed 2026 host cities.
const LAT = 40.81;
const LON = -74.07;

const conditions: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Showers",
  95: "Thunderstorm",
};

export function useWeather() {
  const [data, setData] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`
        );
        const json = await res.json();
        if (cancelled) return;
        const c = json.current;
        setData({
          tempC: c.temperature_2m,
          windKph: c.wind_speed_10m,
          condition: conditions[c.weather_code] ?? "—",
          fetchedAt: Date.now(),
        });
      } catch (e) {
        console.error("weather fetch failed", e);
      }
    }
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return data;
}
