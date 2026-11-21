import { LocalStorage } from "@raycast/api";

type Location = { name: string; country?: string; latitude: number; longitude: number };
type GeocodingResponse = { results?: Location[] };
type ForecastResponse = {
  current?: { temperature_2m?: number; weather_code?: number };
};

export type TodayWeather = { city: string; temperature: number; condition: string };

const CACHE_AGE_MS = 15 * 60 * 1000;

function describeWeather(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Variable";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
  return (await response.json()) as T;
}

/**
 * Weather is completely optional; this function may throw without affecting the
 * instant, offline Jalali date. Cache prevents excessive third-party requests.
 */
export async function getTodayWeather(city: string): Promise<TodayWeather> {
  const normalizedCity = city.trim();
  const cacheKey = `today-weather:${normalizedCity.toLocaleLowerCase("en-US")}`;
  const cached = await LocalStorage.getItem<string>(cacheKey);
  if (cached) {
    try {
      const saved = JSON.parse(cached) as { updatedAt: number; value: TodayWeather };
      if (Date.now() - saved.updatedAt < CACHE_AGE_MS && saved.updatedAt <= Date.now()) {
        return saved.value;
      }
    } catch {
      // Malformed cache is ignored and replaced with fresh weather.
    }
  }

  const geocoding = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocoding.searchParams.set("name", normalizedCity);
  geocoding.searchParams.set("count", "1");
  geocoding.searchParams.set("language", "en");
  const places = await fetchJson<GeocodingResponse>(geocoding.toString());
  const location = places.results?.[0];
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new Error("City not found. Try a city and country, such as Tehran, Iran.");
  }

  const forecast = new URL("https://api.open-meteo.com/v1/forecast");
  forecast.searchParams.set("latitude", String(location.latitude));
  forecast.searchParams.set("longitude", String(location.longitude));
  forecast.searchParams.set("current", "temperature_2m,weather_code");
  forecast.searchParams.set("temperature_unit", "celsius");
  forecast.searchParams.set("forecast_days", "1");
  const current = (await fetchJson<ForecastResponse>(forecast.toString())).current;
  if (!current || typeof current.temperature_2m !== "number" || !Number.isFinite(current.temperature_2m) || typeof current.weather_code !== "number" || !Number.isFinite(current.weather_code)) {
    throw new Error("Current weather is unavailable.");
  }

  const weather = {
    city: location.name,
    temperature: Math.round(current.temperature_2m),
    condition: describeWeather(current.weather_code),
  };

  await LocalStorage.setItem(cacheKey, JSON.stringify({ updatedAt: Date.now(), value: weather }));
  return weather;
}
