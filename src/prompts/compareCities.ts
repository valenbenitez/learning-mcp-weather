import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';


export function registerCompareCitiesPrompt(server: McpServer): void {
  server.registerPrompt(
    'compare_cities',
    {
      title: 'Compare cities weather',
      description:
        'Arma un pedido para comparar el clima actual de dos ciudades usando get_weather.',
      argsSchema: z.object({
        cityA: z.string().min(1).describe('Primera ciudad, p. ej. "Buenos Aires"'),
        cityB: z.string().min(1).describe('Segunda ciudad, p. ej. "Córdoba"'),
      }),
    },
    ({ cityA, cityB }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              `Compará el clima actual entre ${cityA} y ${cityB}.`,
              '',
              'Usá la tool get_weather del MCP learning-weather para cada ciudad.',
              'Si aparece un weather_code, interpretarlo con el resource weather://docs/codes.',
              'Respondé en español con temperatura, viento y condición en lenguaje claro.',
            ].join('\n'),
          },
        },
      ],
    }),
  );
}
