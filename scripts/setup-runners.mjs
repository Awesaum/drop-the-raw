import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

console.log('▶ Initializing autonomous runner environments (Kilo & OpenCode)...');

const apiKey = process.env.OPENROUTER_API_KEY || '';

if (!apiKey) {
  console.log('⚠️ OPENROUTER_API_KEY not found in environment. Skipping credential sync.');
  process.exit(0);
}

const home = homedir();

// Auth directories where Kilo and OpenCode read provider credentials
const opencodeDataDir = resolve(home, '.local', 'share', 'opencode');
const kiloDataDir = resolve(home, '.local', 'share', 'kilo');
const opencodeConfigDir = resolve(home, '.config', 'opencode');
const kiloConfigDir = resolve(home, '.config', 'kilo');

mkdirSync(opencodeDataDir, { recursive: true });
mkdirSync(kiloDataDir, { recursive: true });
mkdirSync(opencodeConfigDir, { recursive: true });
mkdirSync(kiloConfigDir, { recursive: true });

// Standard OpenRouter authentication payload for OpenCode and Kilo CLI
const authConfig = {
  openrouter: {
    type: 'api',
    key: apiKey
  }
};

// OpenCode runtime configuration adhering strictly to V1 schema
const opencodeConfig = {
  $schema: 'https://opencode.ai/config.json',
  model: 'openrouter/anthropic/claude-3.7-sonnet',
  provider: {
    openrouter: {
      options: {
        baseURL: 'https://openrouter.ai/api/v1'
      }
    }
  }
};

// Kilo runtime configuration adhering strictly to Kilo CLI schema
const kiloConfig = {
  $schema: 'https://kilocode.ai/config.json',
  model: 'openrouter/anthropic/claude-3.7-sonnet',
  provider: {
    openrouter: {
      options: {
        baseURL: 'https://openrouter.ai/api/v1'
      }
    }
  }
};

// Write auth credentials
writeFileSync(resolve(opencodeDataDir, 'auth.json'), JSON.stringify(authConfig, null, 2));
writeFileSync(resolve(kiloDataDir, 'auth.json'), JSON.stringify(authConfig, null, 2));

// Write global runner configs
writeFileSync(resolve(opencodeConfigDir, 'opencode.json'), JSON.stringify(opencodeConfig, null, 2));
writeFileSync(resolve(kiloConfigDir, 'kilo.json'), JSON.stringify(kiloConfig, null, 2));

console.log('✔ Kilo & OpenCode auth.json and runtime configs written successfully to runner environment.');

