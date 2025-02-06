#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

const providers = {
  openai: {
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    modelVar: 'OPENAI_MODEL',
    url: 'https://platform.openai.com/api-keys',
    models: {
      '1': 'gpt-3.5-turbo',
      '2': 'gpt-4'
    }
  },
  google: {
    name: 'Google Cloud',
    envVar: 'GOOGLE_API_KEY',
    url: 'https://console.cloud.google.com/apis/credentials'
  },
  claude: {
    name: 'Anthropic Claude',
    envVar: 'CLAUDE_API_KEY',
    url: 'https://console.anthropic.com/settings/keys'
  },
  deepseek: {
    name: 'DeepSeek',
    envVar: 'DEEPSEEK_API_KEY',
    url: 'https://platform.deepseek.com/api_keys'
  },
  gemini: {
    name: 'Google Gemini',
    envVar: 'GEMINI_API_KEY',
    url: 'https://makersuite.google.com/app/apikey'
  }
};

function updateConfigFile(providerKeys) {
  // Get the package root directory (where package.json is located)
  const packageRoot = path.dirname(path.dirname(__filename));
  const configPath = path.join(packageRoot, 'config', 'default.js');
  
  // Ensure config directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let configContent = 'const path = require(\'path\');\n\n';
  configContent += '// Load environment variables from system-level config\n';
  configContent += 'require(\'dotenv\').config({\n';
  configContent += '  path: path.join(process.env.HOME, \'.config\', \'mix-translate\', \'.env\')\n';
  configContent += '});\n\n';
  configContent += 'module.exports = {\n';

  for (const [provider, key] of Object.entries(providerKeys)) {
    configContent += `  ${provider}: {\n`;
    configContent += `    apiKey: process.env.${providers[provider].envVar}`;
    if (provider === 'openai') {
      configContent += ',\n    model: process.env.OPENAI_MODEL || \'gpt-3.5-turbo\'';
    }
    configContent += '\n  },\n';
  }

  configContent += '};\n';
  fs.writeFileSync(configPath, configContent);
}

async function setup() {
  console.log('🔧 Mix Translate CLI Setup\n');
  
  // Create system-level config directory
  const configDir = path.join(process.env.HOME, '.config', 'mix-translate');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const envPath = path.join(configDir, '.env');
  
  // Read existing env file if it exists
  let existingEnv = {};
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        existingEnv[key.trim()] = value.trim();
      }
    });
  }

  let envContent = '';
  const configuredProviders = {};
  
  for (const [key, provider] of Object.entries(providers)) {
    console.log(`\n📦 Setting up ${provider.name}`);
    console.log(`Get your API key from: ${provider.url}`);
    
    const apiKey = await question(`Enter your ${provider.name} API key (press Enter to skip): `);
    
    // Ask for OpenAI model if setting up OpenAI
    if (key === 'openai' && apiKey.trim()) {
      console.log('\nAvailable models:');
      for (const [num, model] of Object.entries(provider.models)) {
        console.log(`${num}. ${model}`);
      }
      const modelChoice = await question(`Select OpenAI model (1-${Object.keys(provider.models).length}, default: 1): `);
      const selectedModel = provider.models[modelChoice] || provider.models['1'];
      envContent += `${provider.modelVar}=${selectedModel}\n`;
    }
    if (apiKey.trim()) {
      envContent += `${provider.envVar}=${apiKey.trim()}\n`;
      configuredProviders[key] = apiKey.trim();
      console.log('✅ API key saved');
    } else {
      // If skipped but exists in previous env, keep it
      if (existingEnv[provider.envVar]) {
        envContent += `${provider.envVar}=${existingEnv[provider.envVar]}\n`;
        configuredProviders[key] = existingEnv[provider.envVar];
        console.log('🔄 Keeping existing API key');
      } else {
        console.log('⏭️  Skipped');
      }
      // Keep existing model for OpenAI if it exists
      if (key === 'openai' && existingEnv[provider.modelVar]) {
        envContent += `${provider.modelVar}=${existingEnv[provider.modelVar]}\n`;
      }
    }
  }
  
  // Save to system config directory
  fs.writeFileSync(envPath, envContent);
  console.log(`\n✨ Environment file saved to: ${envPath}`);

  // Update config/default.js
  updateConfigFile(configuredProviders);
  console.log('✨ Updated config/default.js with environment variables');
  
  console.log('\n🚀 You can now use mix-translate with your configured providers!');
  console.log('\nExample usage:');
  console.log('  mix-translate input.json es -p openai');
  console.log('  mix-translate strings.json fr -p gemini');
  
  rl.close();
}

setup().catch(console.error);
