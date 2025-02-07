const config = require('../../config/default');
const axios = require('axios');

class DeepSeekTranslator {
  constructor() {
    this.apiKey = config.deepseek.apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';
  }

  async translate(text, targetLang) {
    try {
      // Extract and replace variables before translation
      const { text: preparedText, variables } = prepareForTranslation(text);

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: `Translate the following text to ${targetLang}. Keep the placeholders <0>, <1>, etc. exactly as they are. Respond with ONLY the translation: "${preparedText}"`
          }],
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
      const cleanTranslation = translation.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
      
      // Restore variables in the translated text
      return restoreVariables(cleanTranslation, variables);
    } catch (error) {
      console.error('DeepSeek translation error:', error.response?.data?.error || error.message);
      return null;
    }
  }
}

module.exports = DeepSeekTranslator;