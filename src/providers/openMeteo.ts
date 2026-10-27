const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export class OpenMeteoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenMeteoError';
  }
}

export type GeoPlace = {
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
};

export type CurrentWeather = {
  time: string;
  temperatureC: number;
  weatherCode: number;
  windSpeedKmh: number;
  latitude: number;
  longitude: number;
  timezone: string;
};

type GeocodeApiResponse = {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
};

type ForecastApiResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
};

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new OpenMeteoError(`No se pudo conectar a Open-Meteo: ${detail}`);
  }

  if (!res.ok) {
    throw new OpenMeteoError(`Open-Meteo respondió HTTP ${res.status} para ${url}`);
  }

  return (await res.json()) as T;
}

/** Resuelve un nombre de ciudad a coordenadas (primer match). */
export async function geocodeCity(name: string): Promise<GeoPlace> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new OpenMeteoError('El nombre de ciudad no puede estar vacío');
  }

  const url = new URL(GEOCODE_URL);
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'es');
  url.searchParams.set('format', 'json');

  const data = await getJson<GeocodeApiResponse>(url.toString());
  const hit = data.results?.[0];

  if (!hit) {
    throw new OpenMeteoError(`No encontré coordenadas para "${trimmed}"`);
  }

  return {
    name: hit.name,
    country: hit.country ?? null,
    admin1: hit.admin1 ?? null,
    latitude: hit.latitude,
    longitude: hit.longitude,
    timezone: hit.timezone ?? null,
  };
}

/** Clima actual para lat/lon. */
export async function getForecast(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,weather_code,wind_speed_10m',
  );
  url.searchParams.set('timezone', 'auto');

  const data = await getJson<ForecastApiResponse>(url.toString());

  return {
    time: data.current.time,
    temperatureC: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    windSpeedKmh: data.current.wind_speed_10m,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
  };
}

/** Atajo: ciudad → geocode → forecast. */
export async function getWeatherByCity(city: string): Promise<{
  place: GeoPlace;
  weather: CurrentWeather;
}> {
  const place = await geocodeCity(city);
  const weather = await getForecast(place.latitude, place.longitude);
  return { place, weather };
}
