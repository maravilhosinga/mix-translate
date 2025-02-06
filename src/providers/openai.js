const { OpenAI } = require('openai');
const config = require('../../config/default');

class OpenAITranslator {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async translate(text, targetLang) {
    try {
      const prompt = `Translate the following text to ${targetLang} without any extra explanation or commentary: "${text}"`;
      
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that translates text only, without any extra commentary.' },
          { role: 'user', content: prompt }
        ],
      });

      let translatedText = response.choices[0].message.content.trim();
      translatedText = translatedText.replace(/^\"(.*)\"$/, '$1'); // Remove quotes if they appear
      return translatedText;
    } catch (error) {
      console.error('OpenAI translation error:', error.message);
      return null;
    }
  }
}

module.exports = OpenAITranslator;
