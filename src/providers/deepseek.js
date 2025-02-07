const config = require('../../config/default');
const axios = require('axios');

class DeepSeekTranslator {
  constructor() {
    this.apiKey = config.deepseek.apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';
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
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Your task is to translate text accurately while maintaining exact placeholders. Never translate placeholders starting with @ or enclosed in {}. Never mix languages - use only the target language. Never add explanations.'
            },
            {
              role: 'user',
              content: `Translate this text from English to ${targetLanguage}. Keep all placeholders exactly as they are:
"${text}"

Rules:
1. Translate ONLY to ${targetLanguage}, never mix languages
2. Keep all @variables and {variables} exactly as they are
3. Respond with ONLY the translation
4. Do not add quotes, explanations, or comments`
            }
          ],
          temperature: 0.3,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const translation = response.data.choices[0].message.content.trim();
      return translation.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
    } catch (error) {
      console.error('DeepSeek translation error:', error.response?.data?.error || error.message);
      return null;
    }
  }
}

module.exports = DeepSeekTranslator;