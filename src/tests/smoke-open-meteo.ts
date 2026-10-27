/**
 * Smoke test de Fase 2 (sin MCP).
 * Uso: npm run smoke:weather -- "Buenos Aires"
 */
import { getWeatherByCity, OpenMeteoError } from '../providers/openMeteo.js';

const city = process.argv[2] ?? 'Buenos Aires';

try {
  const { place, weather } = await getWeatherByCity(city);
  console.log(
    JSON.stringify(
      {
        place,
        weather,
      },
      null,
      2,
    ),
  );
} catch (err) {
  if (err instanceof OpenMeteoError) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
  throw err;
}
