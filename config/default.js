const path = require('path');

// Load environment variables from system-level config
require('dotenv').config({
  path: path.join(process.env.HOME, '.config', 'mix-translate', '.env')
});

module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY
  },
};
