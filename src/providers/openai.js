const { OpenAI } = require('openai');
const config = require('../../config/default');
class OpenAITranslator {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey
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
      const prompt = `Translate the following text from English to ${targetLanguage}. Keep all placeholders (like @variable) exactly as they are. Only respond with the translation, no explanations: "${text}"`;

      
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'You are a professional translator. Translate text accurately while maintaining the exact same placeholders. Never translate placeholders starting with @ or enclosed in {}. Never mix languages - use only the target language. Never add explanations.' },
          { role: 'user', content: prompt }
        ],
      });

      let translatedText = response.choices[0].message.content.trim();
      translatedText = translatedText.replace(/^\"(.*)\"$/, '$1'); // Remove quotes if they appear
      return translatedText;
    } catch (error) {
      console.error('OpenAI translation error:', error.message);
      return null;
    }
  }
}

module.exports = OpenAITranslator;
