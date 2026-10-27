import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import { registerWeatherTools } from './tools/weather.js';

function createServer(): McpServer {
  const server = new McpServer({
    name: 'learning-weather',
    version: '0.2.1',
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

  console.error(
    'learning-weather tools: ping, geocode_city, get_weather (v0.2.1)',
  );

  return server;
}

void serveStdio(createServer);
console.error('learning-weather MCP server running on stdio');
