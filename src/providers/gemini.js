const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/default');
const { cleanTranslation } = require('../utils/translation-cleaner');

class GeminiTranslator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-pro',
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }
      ]
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
      const prompt = `You are a professional translator working on a software localization task. Translate this text from English to ${targetLanguage}. This is a UI string that may contain technical terms and placeholders:
      
"${text}"

Rules:
1. Translate ONLY to ${targetLanguage}, never mix languages
2. Keep all @variables and {variables} exactly as they are
3. Respond with ONLY the translation
4. Do not add quotes, explanations, or comments`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,  // Lower temperature for more consistent translations
          topK: 1,
          topP: 0.8,
        }
      });
      
      const response = await result.response;
      const rawTranslation = response.text().trim();
return cleanTranslation(rawTranslation, text);
    } catch (error) {
      console.error('Gemini translation error:', error.message);
      return null;
    }
  }
}

module.exports = GeminiTranslator;
