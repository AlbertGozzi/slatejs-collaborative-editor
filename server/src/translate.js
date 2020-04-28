// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate();

async function listLanguages() {
    // Lists available translation language with their names in English (the default).
    const [languages] = await translate.getLanguages();
  
    console.log('Languages:');
    languages.forEach(language => console.log(language));
}

// listLanguages()

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const text = 'Hello world! How are you doing?';
const target = 'fr';
const model = 'nmt';


async function translateTextWithModel() {
  const options = {
    // The target language, e.g. "ru"
    to: target,
    // Make sure your project is whitelisted.
    // Possible values are "base" and "nmt"
    model: model,
  };

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, options);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log('Translations:');
  translations.forEach((translation, i) => {
    console.log(`${text} => (${target}) ${translation}`);
  });
}

translateTextWithModel();