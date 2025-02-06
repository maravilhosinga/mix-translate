#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const Translator = require('../src/utils/translator');

program
  .name('mix-translate')
  .description('AI-powered translation CLI supporting multiple providers')
  .version('1.0.0');

program
  .argument('<input-file>', 'Input JSON file to translate')
  .argument('<target-language>', 'Target language code (e.g., "it", "es", "fr")')
  .option('-p, --provider <provider>', 'Translation provider (default: openai)', 'openai')
  .option('-o, --output <output-dir>', 'Output directory for translations', './translations')
  .option('-i, --input-dir <input-dir>', 'Input directory containing translation files', process.cwd())
  .action((inputFile, targetLanguage, options) => {
    // Resolve input file path
    const inputPath = path.resolve(options.inputDir, inputFile);

    // Validate input file
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Error: Input file ${inputPath} does not exist.`);
      process.exit(1);
    }

    // Ensure output directory exists
    const outputDir = path.resolve(options.output);
    fs.mkdirSync(outputDir, { recursive: true });

    // Validate provider
    const validProviders = ['openai', 'google', 'claude', 'deepseek', 'gemini'];
    if (!validProviders.includes(options.provider)) {
      console.error(`❌ Error: Invalid provider. Must be one of: ${validProviders.join(', ')}`);
      process.exit(1);
    }

    // Create translator instance
    let translator;
    try {
      translator = new Translator(options.provider);
    } catch (error) {
      console.error(`❌ Error initializing translator: ${error.message}`);
      process.exit(1);
    }

    // Translate file
    translator.translateFile(inputPath, targetLanguage, outputDir)
      .then(outputPath => {
        console.log(`✅ Translation completed successfully!`);
        console.log(`📄 Output: ${outputPath}`);
      })
      .catch(error => {
        console.error(`❌ Translation failed: ${error.message}`);
        process.exit(1);
      });
  });

program.parse(process.argv);
