const { Translate } = require('@google-cloud/translate').v2;
const config = require('../../config/default');
const { prepareForTranslation, restoreVariables } = require('../utils/translation-helper');

class GoogleTranslator {
  constructor() {
    this.translator = new Translate({
      key: config.google.apiKey
    });
  }

  async translate(text, targetLang) {
    try {
      // Map common language codes to Google's format
      const languageMap = {
        'it': 'it',    // Italian
        'es': 'es',    // Spanish
        'fr': 'fr',    // French
        'de': 'de',    // German
        'pt': 'pt',    // Portuguese
        'ru': 'ru',    // Russian
        'zh': 'zh-CN', // Chinese (Simplified)
        'ja': 'ja',    // Japanese
        'ko': 'ko'     // Korean
      };

      const googleLangCode = languageMap[targetLang.toLowerCase()] || targetLang;
      
      // Extract and replace variables before translation using special format
      const { text: preparedText, variables } = prepareForTranslation(text, true);
      
      // Perform the translation
      const [translation] = await this.translator.translate(preparedText, {
        to: googleLangCode,
        format: 'text'  // Use text format to minimize formatting changes
      });
      
      // Restore variables in the translated text using special format
      return restoreVariables(translation, variables, true);
    } catch (error) {
      console.error('Google translation error:', error.message);
      return null;
    }
  }
}

module.exports = GoogleTranslator;
