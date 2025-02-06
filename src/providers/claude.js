const Anthropic = require('@anthropic-ai/sdk');
const config = require('../../config/default');

class ClaudeTranslator {
  constructor() {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey
    });
  }

  async translate(text, targetLang) {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Translate the following text to ${targetLang}. Respond with ONLY the translation, no explanations or additional text: "${text}"`
        }]
      });

      const translation = response.content[0].text.trim();
      return translation.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
    } catch (error) {
      console.error('Claude translation error:', error.message);
      return null;
    }
  }
}

module.exports = ClaudeTranslator;
