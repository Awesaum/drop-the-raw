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
const kiloConfigDir = resolve(home, '.config', 'kilo');
const opencodeConfigDir = resolve(home, '.config', 'opencode');

mkdirSync(kiloConfigDir, { recursive: true });
mkdirSync(opencodeConfigDir, { recursive: true });

const kiloConfig = {
  provider: {
    openrouter: {
      options: {
        apiKey: apiKey
      }
    }
  }
};

const opencodeConfig = {
  $schema: 'https://opencode.ai/config.json',
  model: 'openrouter/anthropic/claude-3.5-sonnet',
  providers: {
    openrouter: {
      settings: {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey
      }
    }
  }
};

writeFileSync(resolve(kiloConfigDir, 'kilo.json'), JSON.stringify(kiloConfig, null, 2));
writeFileSync(resolve(opencodeConfigDir, 'opencode.json'), JSON.stringify(opencodeConfig, null, 2));

console.log('✔ Kilo & OpenCode runtime configs written successfully to user home directory.');
