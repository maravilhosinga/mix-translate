const { OpenAI } = require('openai');
const config = require('../../config/default');
const { prepareForTranslation, restoreVariables } = require('../utils/translation-helper');

class OpenAITranslator {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async translate(text, targetLang) {
    try {
      // Extract and replace variables before translation
      const { text: preparedText, variables } = prepareForTranslation(text);
      
      const prompt = `Translate the following text to ${targetLang}. Keep the placeholders <0>, <1>, etc. exactly as they are: "${preparedText}"`;
      
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that translates text only. Keep all placeholders like <0>, <1> exactly as they are.' },
          { role: 'user', content: prompt }
        ],
      });

      let translatedText = response.choices[0].message.content.trim();
      translatedText = translatedText.replace(/^\"(.*)\"$/, '$1'); // Remove quotes if they appear
      
      // Restore variables in the translated text
      return restoreVariables(translatedText, variables);
    } catch (error) {
      console.error('OpenAI translation error:', error.message);
      return null;
    }
  }
}

module.exports = OpenAITranslator;
