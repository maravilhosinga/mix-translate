const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/default');
const { prepareForTranslation, restoreVariables } = require('../utils/translation-helper');

class GeminiTranslator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async translate(text, targetLang) {
    try {
      // Extract and replace variables before translation
      const { text: preparedText, variables } = prepareForTranslation(text);

      const prompt = `Translate the following text to ${targetLang}. Keep the placeholders <0>, <1>, etc. exactly as they are. Respond with ONLY the translation: "${preparedText}"`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translation = response.text().trim();
      
      const cleanTranslation = translation.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
      
      // Restore variables in the translated text
      return restoreVariables(cleanTranslation, variables);
    } catch (error) {
      console.error('Gemini translation error:', error.message);
      return null;
    }
  }
}

module.exports = GeminiTranslator;
