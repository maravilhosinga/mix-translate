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
      // Map language codes to full names for clearer instruction
      const languageMap = {
        'it': 'Italian',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean'
      };
      
      const targetLanguage = languageMap[targetLang.toLowerCase()] || targetLang;
      
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        system: 'You are a professional translator. Your task is to translate text accurately while maintaining exact placeholders. Never translate placeholders starting with @ or enclosed in {}. Never mix languages - use only the target language. Never add explanations.',
        messages: [{
          role: 'user',
          content: `Translate this text from English to ${targetLanguage}. Keep all placeholders exactly as they are:
"${text}"

Rules:
1. Translate ONLY to ${targetLanguage}, never mix languages
2. Keep all @variables and {variables} exactly as they are
3. Respond with ONLY the translation
4. Do not add quotes, explanations, or comments`
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
