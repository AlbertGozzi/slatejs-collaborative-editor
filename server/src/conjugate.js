// Download file
let fs = require('fs');

let languages = ['es', 'fr', 'pt', 'ro', 'it'];
let languagesLong = {
    es: 'Spanish',
    fr: 'French',
    pt: 'Portuguese',
    ro: 'Romanian',
    it: 'Italian'
}

let conjFile = {};
let verbFile = {};
let verbToConjugate = {};
let conjugate = {};

languages.forEach(language => {
    console.log(`<---- Loading ${languagesLong[language]} ---->`);
    conjFile[language] = JSON.parse(fs.readFileSync(`files/${language}.json`));
    console.log(`Number of conjugations: ${conjFile[language].template.length}`)
    verbFile[language] = JSON.parse(fs.readFileSync(`files/verbs-${language}.json`));
    console.log(`Number of verbs: ${verbFile[language].v.length}`);

    verbToConjugate[language] = {};
    language === 'fr' ?
        verbFile[language].v.forEach(verb => verbToConjugate[language][verb.i] = verb.t )
        : verbFile[language].v.forEach(verb => verbToConjugate[language][verb.i.__text] = verb.t.__text );

    conjugate[language] = {};
    conjFile[language].template.forEach(conjugableVerb => conjugate[language][conjugableVerb._name] = conjugableVerb )
});