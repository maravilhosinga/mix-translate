const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/default');

class GeminiTranslator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async translate(text, targetLang) {
    try {
      const prompt = `Translate the following text to ${targetLang}. Keep all placeholders like @variable and {variable} exactly as they are. Respond with ONLY the translation: "${text}"`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translation = response.text().trim();
      
      return translation.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
    } catch (error) {
      console.error('Gemini translation error:', error.message);
      return null;
    }
  }
}

module.exports = GeminiTranslator;
