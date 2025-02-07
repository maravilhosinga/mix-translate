/**
 * Helper functions for translation providers
 */

/**
 * Extracts variables (text after @ or inside {}) from the input text and returns them with their positions
 * @param {string} text Input text
 * @returns {Array<{value: string, start: number, end: number}>} Array of variables with their positions
 */
function extractVariables(text) {
  const variables = [];
  // Match both @variable and {variable} formats
  const patterns = [
    { regex: /@([^\s]+)/g, includeDelimiter: true },  // @variable format
    { regex: /\{([^}]+)\}/g, includeDelimiter: true }   // {variable} format
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      variables.push({
        value: match[0], // Full match including @ or {}
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }
  
  // Sort by position to handle replacements correctly
  variables.sort((a, b) => b.start - a.start);
  
  return variables;
}

/**
 * Prepares text for translation by replacing variables with placeholders
 * @param {string} text Input text
 * @param {boolean} useSpecialFormat Whether to use special format for Google Translate
 * @returns {{text: string, variables: Array}} Prepared text and variables
 */
function prepareForTranslation(text, useSpecialFormat = false) {
  const variables = extractVariables(text);
  let preparedText = text;
  
  // Replace variables with numbered placeholders from end to start
  // to avoid affecting the positions of subsequent variables
  for (let i = variables.length - 1; i >= 0; i--) {
    const variable = variables[i];
    // For Google Translate, use a special format that's less likely to be modified
    const placeholder = useSpecialFormat ? 
      `NOTRANSLATE_VAR_${i}_` :  // Special format for Google Translate with NOTRANSLATE prefix
      `<${i}>`                    // Normal format for other providers
    preparedText = preparedText.slice(0, variable.start) + 
                   placeholder +
                   preparedText.slice(variable.end);
  }
  
  return { text: preparedText, variables };
}

/**
 * Restores variables in the translated text
 * @param {string} translatedText Translated text with placeholders
 * @param {Array} variables Original variables
 * @param {boolean} useSpecialFormat Whether to use special format for Google Translate
 * @returns {string} Text with restored variables
 */
function restoreVariables(translatedText, variables, useSpecialFormat = false) {
  let restoredText = translatedText;
  
  // Replace placeholders with original variables
  for (let i = 0; i < variables.length; i++) {
    const placeholder = useSpecialFormat ? 
      `NOTRANSLATE_VAR_${i}_` :  // Special format for Google Translate with NOTRANSLATE prefix
      `<${i}>`                    // Normal format for other providers
    // Use a global regex to ensure all instances are replaced
    const regex = new RegExp(placeholder, 'g');
    restoredText = restoredText.replace(regex, variables[i].value);
  }
  
  return restoredText;
}

module.exports = {
  prepareForTranslation,
  restoreVariables
};
