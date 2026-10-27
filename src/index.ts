import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import { textResult } from './lib/mcpResult.js';
import { registerCompareCitiesPrompt } from './prompts/compareCities.js';
import { registerWeatherCodeResource } from './resources/weatherCodes.js';
import { registerWeatherTools } from './tools/weather.js';

const SERVER_VERSION = '0.4.0';

function createServer(): McpServer {
  const server = new McpServer({
    name: 'learning-weather',
    version: SERVER_VERSION,
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
    async ({ message }) =>
      textResult({
        ok: true,
        ts: new Date().toISOString(),
        echo: message ?? null,
      }),
  );

  registerWeatherTools(server);
  registerWeatherCodeResource(server);
  registerCompareCitiesPrompt(server);

  console.error(
    `learning-weather v${SERVER_VERSION} — tools: ping, geocode_city, get_weather | resource: weather://docs/codes | prompt: compare_cities`,
  );

  return server;
}

// stdout = JSON-RPC. Logs solo por stderr.
void serveStdio(createServer);
console.error('learning-weather MCP server running on stdio');
