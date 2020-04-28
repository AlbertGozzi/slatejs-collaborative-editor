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
    // console.log(`<---- Loading ${languagesLong[language]} ---->`);
    conjFile[language] = JSON.parse(fs.readFileSync(`files/${language}.json`));
    // console.log(`Number of conjugations: ${conjFile[language].template.length}`)
    verbFile[language] = JSON.parse(fs.readFileSync(`files/verbs-${language}.json`));
    // console.log(`Number of verbs: ${verbFile[language].v.length}`);

    verbToConjugate[language] = {};
    language === 'fr' ?
        verbFile[language].v.forEach(verb => verbToConjugate[language][verb.i] = verb.t )
        : verbFile[language].v.forEach(verb => verbToConjugate[language][verb.i.__text] = verb.t.__text );

    conjugate[language] = {};
    conjFile[language].template.forEach(conjugableVerb => conjugate[language][conjugableVerb._name] = conjugableVerb )
});

// console.log(`<---------SPANISH--------->`);
let conjFileEs = JSON.parse(fs.readFileSync('files/es.json'));
// console.log(`Number of conjugations: ${conjFileEs.template.length}`)
let verbFileEs = JSON.parse(fs.readFileSync('files/verbs-es.json'));
// console.log(`Number of verbs: ${verbFileEs.v.length}`);

// Adapt files
let verbToConjugateEs = {}
verbFileEs.v.forEach(verb => verbToConjugateEs[verb.i.__text] = verb.t.__text )
// console.log(verbToConjugateEs)
let conjugateEs = {}
conjFileEs.template.forEach(conjugableVerb => conjugateEs[conjugableVerb._name] = conjugableVerb )
// console.log(conjugateEs);
console.log(conjugateEs[verbToConjugateEs['zurrir']]);

// console.log(`<---------FRENCH--------->`);
let conjFileFr = JSON.parse(fs.readFileSync('files/fr.json'));
// console.log(`Number of conjugations: ${conjFileFr.template.length}`)
let verbFileFr = JSON.parse(fs.readFileSync('files/verbs-fr.json'));
// console.log(`Number of verbs: ${verbFileFr.v.length}`);

// Adapt files
let verbToConjugateFr = {}
verbFileFr.v.forEach(verb => verbToConjugateFr[verb.i] = verb.t )
// console.log(verbToConjugateFr)
let conjugateFr = {}
conjFileFr.template.forEach(conjugableVerb => conjugateFr[conjugableVerb._name] = conjugableVerb )
// console.log(conjugateFr);
// console.log(conjugateFr[verbToConjugateFr['rendre']]);

// console.log(`<---------PORTUGUESE--------->`);
let conjFilePt = JSON.parse(fs.readFileSync('files/pt.json'));
// console.log(`Number of conjugations: ${conjFilePt.template.length}`)
let verbFilePt = JSON.parse(fs.readFileSync('files/verbs-pt.json'));
// console.log(`Number of verbs: ${verbFilePt.v.length}`);

// Adapt files
let verbToConjugatePt = {}
verbFilePt.v.forEach(verb => verbToConjugatePt[verb.i.__text] = verb.t.__text )
// console.log(verbToConjugatePt)
let conjugatePt = {}
conjFilePt.template.forEach(conjugableVerb => conjugatePt[conjugableVerb._name] = conjugableVerb )
// console.log(conjugatePt);
// console.log(conjugatePt[verbToConjugatePt['amar']]);

// console.log(`<---------ROMANIAN--------->`);
let conjFileRo = JSON.parse(fs.readFileSync('files/ro.json'));
// console.log(`Number of conjugations: ${conjFileRo.template.length}`)
let verbFileRo = JSON.parse(fs.readFileSync('files/verbs-ro.json'));
// console.log(`Number of verbs: ${verbFileRo.v.length}`);

// Adapt files
let verbToConjugateRo = {}
verbFileRo.v.forEach(verb => verbToConjugateRo[verb.i.__text] = verb.t.__text )
// console.log(verbToConjugateRo)
let conjugateRo = {}
conjFileRo.template.forEach(conjugableVerb => conjugateRo[conjugableVerb._name] = conjugableVerb )
// console.log(conjugateRo);
// console.log(conjugateRo[verbToConjugateRo['fi']]);

// console.log(`<---------ITALIAN--------->`);
let conjFileIt = JSON.parse(fs.readFileSync('files/it.json'));
// console.log(`Number of conjugations: ${conjFileIt.template.length}`)
let verbFileIt = JSON.parse(fs.readFileSync('files/verbs-it.json'));
// console.log(`Number of verbs: ${verbFileIt.v.length}`);

// Adapt files
let verbToConjugateIt = {}
verbFileIt.v.forEach(verb => verbToConjugateIt[verb.i.__text] = verb.t.__text )
// console.log(verbToConjugateIt)
let conjugateIt = {}
conjFileIt.template.forEach(conjugableVerb => conjugateIt[conjugableVerb._name] = conjugableVerb )
// console.log(conjugateIt);
// console.log(conjugateIt[verbToConjugateIt['mangiare']]);
