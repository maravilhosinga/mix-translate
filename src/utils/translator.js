const fs = require('fs');
const path = require('path');
const OpenAITranslator = require('../providers/openai');
const GoogleTranslator = require('../providers/google');
const ClaudeTranslator = require('../providers/claude');
const DeepSeekTranslator = require('../providers/deepseek');
const GeminiTranslator = require('../providers/gemini');

class Translator {
  constructor(provider = 'openai') {
    switch (provider.toLowerCase()) {
      case 'openai':
        this.provider = new OpenAITranslator();
        break;
      case 'google':
        this.provider = new GoogleTranslator();
        break;
      case 'claude':
        this.provider = new ClaudeTranslator();
        break;
      case 'deepseek':
        this.provider = new DeepSeekTranslator();
        break;
      case 'gemini':
        this.provider = new GeminiTranslator();
        break;
      default:
        throw new Error(`Unknown provider: ${provider}\nAvailable providers: openai, google, claude, deepseek, gemini`);
    }
  }

  async translateFile(inputFilePath, targetLanguageCode, outputBaseDir = 'output') {
    try {
      console.log('Reading the input JSON file...');
      const content = fs.readFileSync(inputFilePath, 'utf-8');
      
      // Parse JSON content
      console.log('Parsing JSON content...');
      const translations = JSON.parse(content);

      // Create translation for the target language
      console.log('Starting translation process...');
      const translatedContent = {};
      let progress = 0;
      const totalTranslations = Object.keys(translations).length;

      for (const key in translations) {
        const originalText = translations[key];
        console.log(`Translating [${progress + 1}/${totalTranslations}] ${originalText}`);
        const translatedText = await this.provider.translate(originalText, targetLanguageCode);
        if (translatedText) {
          translatedContent[key] = translatedText;
          progress++;
        }
      }

      // Generate the translated JSON file
      console.log('Generating translated JSON file...');
      const outputContent = JSON.stringify(translatedContent, null, 2);

      // Create provider-specific output directory
      const providerName = this.provider.constructor.name.toLowerCase().replace('translator', '');
      const absoluteOutputDir = path.resolve(outputBaseDir);
      const outputDir = path.join(
        absoluteOutputDir,
        providerName
      );
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write to a new JSON file in the provider's output directory
      const outputFilePath = path.join(
        outputDir,
        `${targetLanguageCode}.json`
      );
      fs.writeFileSync(outputFilePath, outputContent);

      console.log(`JSON file generated: ${outputFilePath}`);
      return outputFilePath;
    } catch (error) {
      console.error('Error during file processing:', error);
      console.error('Full error details:', error.stack);
      throw error;
    }
  }
}

module.exports = Translator;
