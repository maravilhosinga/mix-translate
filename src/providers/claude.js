const Anthropic = require('@anthropic-ai/sdk');
const config = require('../../config/default');
const { cleanTranslation } = require('../utils/translation-cleaner');

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
        system: 'You are a professional translator. Translate text accurately while preserving exact placeholders. Never translate or modify placeholders starting with @ or enclosed in {}. Use only the target language, maintaining natural and idiomatic expressions. Never include translation instructions or metadata in the output.',
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

      const rawTranslation = response.content[0].text.trim();
return cleanTranslation(rawTranslation, text);
    } catch (error) {
      console.error('Claude translation error:', error.message);
      return null;
    }
  }
}

module.exports = ClaudeTranslator;
