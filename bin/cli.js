#!/usr/bin/env node
'use strict';

const readline = require('readline');
const { VERSION, ALL_ENGINE_SLUGS, B2BComplianceClient } = require('../index');

const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-v')) {
  process.stdout.write(`${VERSION}\n`);
  process.exit(0);
}
if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(
    `b2b-compliance-mcp-cli v${VERSION}\n` +
    `Stdio MCP Server exposing 31 B2B Compliance, Sanctions, KYB & Cyber tools.\n` +
    `Env vars: RAPIDAPI_API_KEY or APIFY_API_TOKEN.\n`
  );
  process.exit(0);
}

const client = new B2BComplianceClient();

function buildToolsList() {
  return ALL_ENGINE_SLUGS.map((slug) => ({
    name: slug.replace(/-/g, '_'),
    description: `Execute B2B Compliance & Intelligence engine '${slug}' (RapidAPI / Apify / Instant Preview).`,
    inputSchema: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          description: `JSON input parameters for ${slug}`,
        },
      },
      additionalProperties: true,
    },
  }));
}

function sendJsonRpc(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

async function handleMessage(msg) {
  if (!msg || typeof msg !== 'object') return;
  const { id, method, params } = msg;

  if (method === 'notifications/initialized') {
    return;
  }
  if (method === 'initialize') {
    return sendJsonRpc({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'b2b-compliance-mcp-cli', version: VERSION },
      },
    });
  }
  if (method === 'ping') {
    return sendJsonRpc({ jsonrpc: '2.0', id, result: {} });
  }
  if (method === 'tools/list') {
    return sendJsonRpc({
      jsonrpc: '2.0',
      id,
      result: { tools: buildToolsList() },
    });
  }
  if (method === 'tools/call') {
    const rawName = String((params && params.name) || '').trim();
    const slug = rawName.replace(/_/g, '-');
    const rawArgs = (params && params.arguments) || {};
    const payload = rawArgs.payload && typeof rawArgs.payload === 'object' ? rawArgs.payload : rawArgs;
    try {
      const res = await client.runEngine(slug, payload);
      return sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
          isError: false,
        },
      });
    } catch (err) {
      return sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true,
        },
      });
    }
  }
  if (id !== undefined) {
    return sendJsonRpc({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  }
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const parsed = JSON.parse(trimmed);
    handleMessage(parsed);
  } catch (err) {
    sendJsonRpc({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }
});
