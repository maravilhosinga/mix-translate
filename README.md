# Mix Translate

A flexible translation tool that supports multiple translation providers including OpenAI GPT, Google Translate, and more.

## Project Structure

```
.
├── config/                # Configuration directory
│   └── default.js         # API keys and provider settings
│
├── src/                   # Source code directory
│   ├── providers/         # Translation provider implementations
│   │   ├── openai.js      # OpenAI GPT translation provider
│   │   ├── google.js      # Google Cloud Translation provider
│   │   ├── claude.js      # Anthropic Claude translation provider
│   │   ├── deepseek.js    # DeepSeek translation provider
│   │   └── gemini.js      # Google Gemini translation provider
│   │
│   └── utils/             # Utility modules
│       └── translator.js  # Core translation utility class
│
├── output/                # Translation output directory
│   ├── openai/            # Translations by OpenAI
│   ├── google/            # Translations by Google Translate
│   ├── claude/            # Translations by Claude
│   ├── deepseek/          # Translations by DeepSeek
│   └── gemini/            # Translations by Gemini
│
├── input/                 # Input files directory
│   └── en.json            # Example input translation file
│
├── package.json           # Project dependencies and scripts
├── .gitignore             # Git ignore file
├── translate.js           # Main translation script
├── README.md              # Project documentation
└── .env                   # Environment variables (optional)
```

### Directory Descriptions

- `config/`: Stores configuration files for different translation providers
- `src/providers/`: Contains implementation for each translation provider
- `src/utils/`: Utility classes and helper functions
- `output/`: Stores translated files, organized by provider
- `input/`: Optional directory for input translation files
- `node_modules/`: (Not shown) Dependency directory created by npm

### Key Files

- `translate.js`: Main script to run translations
- `package.json`: Manages project dependencies and scripts
- `.gitignore`: Prevents sensitive files from being committed
- `.env`: (Optional) Stores environment-specific configurations

## Setup

### Installation

```bash
# Install the CLI tool globally
npm install -g mix-translate-cli

# Run the interactive setup
mix-translate-setup

# Verify installation
mix-translate --version
```

The setup wizard will guide you through:
1. Setting up API keys for each provider
2. Storing them securely in your home directory
3. Configuring the CLI to use your preferred providers

### Provider Configuration

All provider configurations are managed automatically through the setup wizard. The configuration is stored in `~/.config/mix-translate/.env`. Here's information about each supported provider:

#### OpenAI (Default Provider)
- Sign up at [OpenAI Platform](https://platform.openai.com/api-keys)
- Uses GPT models for high-quality translations
- Best for: Accurate translations with context understanding

Supported Models:
- `gpt-3.5-turbo`: Faster, cheaper, good for most translations
- `gpt-4`: Higher quality, better context understanding, more expensive

#### Google Cloud Translation
- Set up at [Google Cloud Console](https://console.cloud.google.com)
- Enable Cloud Translation API and create credentials
- Supports [100+ languages](https://cloud.google.com/translate/docs/languages)
- Best for: Fast, reliable translations

Supported Languages:
- All [Google Cloud Translation supported languages](https://cloud.google.com/translate/docs/languages)
- Common codes: 'en' (English), 'es' (Spanish), 'fr' (French), etc.

#### Claude
- Get API key from [Anthropic Console](https://console.anthropic.com/settings/keys)
- Uses Claude models for nuanced translations
- Best for: Complex text and maintaining tone

Supported Models:
- `claude-2`: Latest model, best performance
- `claude-instant`: Faster, more cost-effective

#### DeepSeek
- Register at [DeepSeek Platform](https://platform.deepseek.com/api_keys)
- Offers competitive translation quality
- Best for: Alternative to OpenAI

#### Gemini
- Access via [Google AI Studio](https://makersuite.google.com/app/apikey)
- Uses Gemini Pro for translations
- Best for: Modern, efficient translations

### Managing API Keys

#### Initial Setup
Run the setup wizard to configure your providers:
```bash
mix-translate-setup
```

#### Updating Keys
To update your API keys:
1. Run setup again: `mix-translate-setup`
2. Enter new keys when prompted
3. Skip other providers by pressing Enter

#### Security
API keys are stored securely in `~/.config/mix-translate/.env` and are:
- Never committed to version control
- Stored outside your project directory
- Loaded automatically when running translations

## Usage

### Quick Start
```bash
# Show help and available options
mix-translate --help

# Basic translation (current directory)
mix-translate strings.json es

# Translate with specific provider
mix-translate messages.json fr -p openai
```

### Translation Examples

#### Using Different Providers
```bash
# OpenAI (default)
mix-translate locale.json it

# Google Translate
mix-translate messages.json es -p google

# Anthropic Claude
mix-translate strings.json fr -p claude

# DeepSeek
mix-translate locale.json pt -p deepseek

# Google Gemini
mix-translate messages.json ru -p gemini
```

#### Working with Directories
```bash
# Input from specific directory
mix-translate en.json es -i ./locales

# Output to specific directory
mix-translate en.json fr -o ./translations

# Custom input and output directories
mix-translate en.json de -i ./source -o ./output

# Complete example with all options
mix-translate en.json it -i ./input -o ./translations -p openai
```

### CLI Reference

#### Command Format
```bash
mix-translate <input-file> <target-language> [options]
```

#### Arguments
- `input-file`: JSON file containing strings to translate
- `target-language`: Target language code (e.g., 'it', 'es', 'fr')

#### Options
- `-p, --provider <name>`: Translation provider (default: 'openai')
  - Available: openai, google, claude, deepseek, gemini
- `-i, --input-dir <path>`: Input directory (default: current directory)
- `-o, --output-dir <path>`: Output directory (default: './translations')
- `-h, --help`: Display help information
- `-V, --version`: Display version number

#### Notes
- Output directory is created automatically if it doesn't exist
- Input paths are relative to the input directory
- Each provider's translations are saved in their respective subdirectories
- Language codes follow ISO 639-1 standard (2-letter codes)

## Input File Format

The input file should be a JSON file with key-value pairs where values are the strings to translate:

```json
{
  "greeting": "Hello, world!",
  "farewell": "Goodbye!"
}
```

## Output

Translated files will be saved in the `output/<provider>` directory with the target language code as the filename:

```
output/
└── openai/
    └── it.json    # Italian translations using OpenAI
```

## Adding New Providers

To add a new translation provider:

1. Create a new provider file in `src/providers/`
2. Implement the required `translate(text, targetLang)` method
3. Add the provider configuration in `config/default.js`
4. Update the provider selection in `translate.js`
