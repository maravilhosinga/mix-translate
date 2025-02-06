const path = require('path');
const Translator = require('./src/utils/translator');

// Command-line arguments: Input file name, target language, and provider
const [,, inputFileName, targetLanguageCode, provider = 'openai'] = process.argv;

if (!inputFileName || !targetLanguageCode) {
  console.log('Usage: node translate.js <inputFileName> <targetLanguageCode> [provider]');
  console.log('Available providers: openai, google, claude, deepseek, gemini');
  process.exit(1);
}

// Construct full input file path
const inputFilePath = path.join(__dirname, 'input', inputFileName);

// Create translator instance with the selected provider
let translator;
try {
  translator = new Translator(provider);

  // Start the translation process
  translator.translateFile(inputFilePath, targetLanguageCode)
    .then(outputPath => {
      console.log('Translation completed successfully!');
    })
    .catch(error => {
      console.error('Translation failed:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

// command to run the script
//node translate.js en.json it openai
