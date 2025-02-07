/**
 * Cleans and validates translation output to ensure consistency
 * @param {string} translation - The raw translation text
 * @param {string} originalText - The original text being translated
 * @returns {string} - The cleaned translation
 */
function cleanTranslation(translation, originalText) {
  if (!translation) return '';

  // Remove any surrounding quotes
  let cleaned = translation.replace(/^["'](.*)["']$/s, '$1');
  
  // Remove any newlines and normalize spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove any leaked translation instructions
  cleaned = cleaned.replace(/Rules:[\s\S]*?$/g, '');
  cleaned = cleaned.replace(/Instructions:[\s\S]*?$/g, '');
  
  // Preserve all placeholders from original text
  const placeholders = [];
  
  // Extract @variables
  const atVarRegex = /@[a-zA-Z_][a-zA-Z0-9_]*/g;
  let match;
  while ((match = atVarRegex.exec(originalText)) !== null) {
    placeholders.push(match[0]);
  }
  
  // Extract {variables}
  const braceVarRegex = /{[^}]+}/g;
  while ((match = braceVarRegex.exec(originalText)) !== null) {
    placeholders.push(match[0]);
  }
  
  // Ensure all placeholders from original text exist in translation
  placeholders.forEach(placeholder => {
    if (!cleaned.includes(placeholder)) {
      console.warn(`Warning: Translation is missing placeholder: ${placeholder}`);
      // Insert placeholder at the end if missing
      cleaned = `${cleaned} ${placeholder}`;
    }
  });

  return cleaned;
}

module.exports = {
  cleanTranslation
};
