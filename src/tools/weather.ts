import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import {
  geocodeCity,
  getForecast,
  getWeatherByCity,
  OpenMeteoError,
} from '../providers/openMeteo.js';

function textResult(data: unknown, isError = false) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
    isError,
  };
}

function fromCaught(err: unknown) {
  if (err instanceof OpenMeteoError) {
    return textResult(err.message, true);
  }
  const detail = err instanceof Error ? err.message : String(err);
  return textResult(`Error inesperado: ${detail}`, true);
}

export function registerWeatherTools(server: McpServer): void {
  server.registerTool(
    'geocode_city',
    {
      title: 'Geocode city',
      description:
        'Resuelve un nombre de ciudad a coordenadas (lat/lon) usando Open-Meteo Geocoding.',
      inputSchema: z.object({
        city: z
          .string()
          .min(1)
          .describe('Nombre de la ciudad, p. ej. "Córdoba" o "Buenos Aires"'),
      }),
    },
    async ({ city }) => {
      try {
        const place = await geocodeCity(city);
        return textResult(place);
      } catch (err) {
        return fromCaught(err);
      }
    },
  );

  server.registerTool(
    'get_weather',
    {
      title: 'Get current weather',
      description:
        'Obtiene el clima actual. Pasá "city" o el par latitude+longitude.',
      inputSchema: z.object({
        city: z
          .string()
          .min(1)
          .optional()
          .describe('Ciudad a consultar (geocode interno). Ej: "Rosario"'),
        latitude: z
          .number()
          .optional()
          .describe('Latitud en grados decimales (usar junto con longitude)'),
        longitude: z
          .number()
          .optional()
          .describe('Longitud en grados decimales (usar junto con latitude)'),
      }),
    },
    async ({ city, latitude, longitude }) => {
      try {
        const hasCity = city != null;
        const hasCoords = latitude != null && longitude != null;

        if (!hasCity && !hasCoords) {
          return textResult(
            'Pasá "city" o ambos "latitude" y "longitude".',
            true,
          );
        }

        if (hasCity) {
          const { place, weather } = await getWeatherByCity(city);
          return textResult({ place, weather });
        }

        if (latitude == null || longitude == null) {
          return textResult(
            'Si no pasás city, necesitás latitude y longitude.',
            true,
          );
        }

        const weather = await getForecast(latitude, longitude);
        return textResult({ weather });
      } catch (err) {
        return fromCaught(err);
      }
    },
  );
}
