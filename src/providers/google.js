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
      
      // First, detect the source language to ensure consistent translation
      const [detections] = await this.translator.detect(preparedText);
      const sourceLanguage = Array.isArray(detections) ? detections[0].language : detections.language;
      
      // Split text into segments around variables to prevent them from being translated
      const segments = preparedText.split(/NOTRANSLATE_VAR_\d+_/);
      const translatedSegments = await Promise.all(
        segments.map(segment => 
          segment.trim() ? 
            this.translator.translate(segment, {
              from: sourceLanguage,
              to: googleLangCode,
              format: 'text'
            }).then(([t]) => t) : 
            Promise.resolve(segment)
        )
      );
      
      // Reconstruct the text with variables
      let reconstructed = preparedText;
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].trim()) {
          reconstructed = reconstructed.replace(segments[i], translatedSegments[i]);
        }
      }
      
      // Restore variables in the translated text using special format
      return restoreVariables(reconstructed, variables, true);
    } catch (error) {
      console.error('Google translation error:', error.message);
      return null;
    }
  }
}

module.exports = GoogleTranslator;
