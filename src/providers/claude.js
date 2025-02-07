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
      // Extract and replace variables before translation
      const { text: preparedText, variables } = prepareForTranslation(text);

      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Translate the following text to ${targetLang}. Keep the placeholders like @variable, {variable}, etc. exactly as they are. Respond with ONLY the translation, no comments, it's a website ou application string translation: "${preparedText}"`
        }]
      });

      const translation = response.content[0].text.trim();
      const cleanTranslation = translation.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
      
      // Restore variables in the translated text
      return restoreVariables(cleanTranslation, variables);
    } catch (error) {
      console.error('Claude translation error:', error.message);
      return null;
    }
  }
}

module.exports = ClaudeTranslator;
