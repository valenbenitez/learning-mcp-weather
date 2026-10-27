import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import { registerCompareCitiesPrompt } from './prompts/compareCities.js';
import { registerWeatherCodeResource } from './resources/weatherCodes.js';
import { registerWeatherTools } from './tools/weather.js';

function createServer(): McpServer {
  const server = new McpServer({
    name: 'learning-weather',
    version: '0.3.0',
  });

  server.registerTool(
    'ping',
    {
      description:
        'Health check del MCP learning-weather. Devuelve ok y un timestamp.',
      inputSchema: z.object({
        message: z
          .string()
          .optional()
          .describe('Mensaje opcional que el server ecoa en la respuesta'),
      }),
    },
    async ({ message }) => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              ok: true,
              ts: new Date().toISOString(),
              echo: message ?? null,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  registerWeatherTools(server);
  registerWeatherCodeResource(server);
  registerCompareCitiesPrompt(server);

  console.error(
    'learning-weather v0.3.0 — tools: ping, geocode_city, get_weather | resource: weather://docs/codes | prompt: compare_cities',
  );

  return server;
}

void serveStdio(createServer);
console.error('learning-weather MCP server running on stdio');
