# learning-mcp-weather

MCP server de aprendizaje en **TypeScript** que wrappea [Open-Meteo](https://open-meteo.com/) (API pública, sin API key) y se conecta a **Cursor** por **stdio**.

Objetivo: entender el protocolo MCP end-to-end — **tools**, **resources** y **prompts** — con un ejemplo útil de verdad.

## Qué es MCP (en una frase)

Un host lanza tu proceso, habla **JSON-RPC** por **stdin/stdout**, y puede usar las capacidades que vos registrás.

```text
Cursor  --JSON-RPC-->  stdin  -->  este server
Cursor  <--JSON-RPC--  stdout <--  este server
logs / debug                   -->  stderr
```

Importante: **nunca** uses `console.log` en el server. Contamina stdout y rompe el protocolo. Usá `console.error`.

## Tool vs Resource vs Prompt

| Pieza | Rol | En este proyecto |
| --- | --- | --- |
| **Tool** | Acción que el modelo puede ejecutar | `ping`, `geocode_city`, `get_weather` |
| **Resource** | Dato/doc legible con URI | `weather://docs/codes` |
| **Prompt** | Plantilla de mensajes reutilizable | `compare_cities` |

## Arquitectura

```text
src/index.ts                 entry: McpServer + serveStdio
src/tools/weather.ts         tools de clima
src/resources/weatherCodes.ts  resource de códigos WMO
src/prompts/compareCities.ts   prompt de comparación
src/providers/openMeteo.ts   HTTP puro (sin MCP)
src/lib/mcpResult.ts         respuestas / errores consistentes
src/tests/smoke-open-meteo.ts  prueba del provider sin Cursor
```

Flujo de una pregunta de clima:

```text
Usuario → Cursor Agent → tools/call get_weather
                              ↓
                        openMeteo.ts (fetch)
                              ↓
                        Open-Meteo API
                              ↓
                        texto JSON → modelo → respuesta
```

## Requisitos

- Node.js **20+**
- Cursor (u otro host MCP con stdio)

## Setup

```bash
npm install
```

### Probar el provider sin MCP

```bash
npm run smoke:weather -- "Buenos Aires"
```

### Correr el server a mano

```bash
npm start
```

Queda esperando en stdin (normal). Para usarlo de verdad, registralo en Cursor.

## Registrar en Cursor

Este repo ya incluye [`.cursor/mcp.json`](.cursor/mcp.json):

```json
{
  "mcpServers": {
    "learning-weather": {
      "command": "npx",
      "args": ["tsx", "${workspaceFolder}/src/index.ts"]
    }
  }
}
```

1. Abrí esta carpeta como workspace en Cursor.
2. Settings → MCP → confirmá que `learning-weather` está en verde.
3. Reiniciá el server si cambiaste código (toggle off/on).
4. Debug: Output → **MCP Logs**. Deberías ver el banner con tools / resource / prompt.

## Capacidades

### Tools

- **`ping`** — health check (`message` opcional).
- **`geocode_city`** — `city` → lat/lon.
- **`get_weather`** — `city` **o** `latitude` + `longitude` → clima actual.

### Resource

- **`weather://docs/codes`** — tabla de `weather_code` (WMO / Open-Meteo).

### Prompt

- **`compare_cities`** — args `cityA`, `cityB`; arma un pedido para comparar clima usando las tools.

## Ejemplos en Agent chat

- “Usá get_weather y decime la temperatura en Córdoba.”
- “Leé weather://docs/codes y explicá qué es weather_code 61.”
- “Compará el clima entre Buenos Aires y Rosario.”

## Errores

- Errores de Open-Meteo / validación → resultado de tool con `isError: true` (el proceso sigue vivo).
- Errores inesperados → mismo patrón + log en stderr.
- El provider lanza `OpenMeteoError`; las tools lo traducen con `fromCaught`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm start` / `npm run dev` | Levanta el MCP por stdio |
| `npm run smoke:weather -- "Ciudad"` | Prueba Open-Meteo sin MCP |

## Referencias

- [Cursor MCP docs](https://cursor.com/docs/mcp)
- [MCP TypeScript SDK — first server](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server.html)
- [Open-Meteo docs](https://open-meteo.com/en/docs)
