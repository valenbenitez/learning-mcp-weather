import type { McpServer } from '@modelcontextprotocol/server';

/**
 * Códigos WMO que usa Open-Meteo en `weather_code`.
 * @see https://open-meteo.com/en/docs
 */

const WEATHER_CODES_DOC = `# Open-Meteo weather codes (WMO)

| Code | Meaning |
| --- | --- |
| 0 | Clear sky |
| 1 | Mainly clear |
| 2 | Partly cloudy |
| 3 | Overcast |
| 45 | Fog |
| 48 | Depositing rime fog |
| 51 | Light drizzle |
| 53 | Moderate drizzle |
| 55 | Dense drizzle |
| 56 | Light freezing drizzle |
| 57 | Dense freezing drizzle |
| 61 | Slight rain |
| 63 | Moderate rain |
| 65 | Heavy rain |
| 66 | Light freezing rain |
| 67 | Heavy freezing rain |
| 71 | Slight snow fall |
| 73 | Moderate snow fall |
| 75 | Heavy snow fall |
| 77 | Snow grains |
| 80 | Slight rain showers |
| 81 | Moderate rain showers |
| 82 | Violent rain showers |
| 85 | Slight snow showers |
| 86 | Heavy snow showers |
| 95 | Thunderstorm |
| 96 | Thunderstorm with slight hail |
| 99 | Thunderstorm with heavy hail |

URI: weather://docs/codes
`;

export function registerWeatherCodeResource(server: McpServer): void {
  server.registerResource(
    'weather-codes',
    'weather://docs/codes',
    {
      title: 'Weather codes',
      description:
        'Tabla de weather_code de Open-Meteo (WMO) para interpretar get_weather.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: WEATHER_CODES_DOC,
        },
      ],
    }),
  );
}
