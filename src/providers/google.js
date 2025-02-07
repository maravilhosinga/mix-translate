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
      
      // Split text into translatable segments and variables
      const segments = [];
      const extractedVariables = [];
      let currentText = '';
      let lastIndex = 0;
      
      // Match @variable pattern
      const regex = /@[a-zA-Z_][a-zA-Z0-9_]*/g;
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Add text before the variable
        if (match.index > lastIndex) {
          currentText = text.slice(lastIndex, match.index).trim();
          if (currentText) segments.push(currentText);
        }
        
        // Store the variable
        extractedVariables.push(match[0]);
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text after last variable
      if (lastIndex < text.length) {
        currentText = text.slice(lastIndex).trim();
        if (currentText) segments.push(currentText);
      }
      
      // Translate all segments
      const translatedSegments = await Promise.all(
        segments.map(segment =>
          this.translator.translate(segment, {
            to: googleLangCode,
            format: 'text'
          }).then(([translation]) => translation)
        )
      );
      
      // Reconstruct the text with variables
      let result = text;
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].trim()) {
          result = result.replace(segments[i], translatedSegments[i]);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Google translation error:', error.message);
      return null;
    }
  }
}

module.exports = GoogleTranslator;
