const isEqual = require("lodash.isequal")
const { parseColours } = require("./scrape-fig");
const sampleJson = require("./sample.json");

const testParseColours = () => {
    const parsedColours = parseColours(sampleJson.document, sampleJson.styles)
    const expectedResults = {
        gold: 'rgba(251,178,22,1)',
        sky: 'rgba(0,117,229,1)',
        just_green: 'rgba(35,157,78,1)',
        steel: 'rgba(26,34,44,1)',
        cherry: 'rgba(229,26,65,1)',
        violet: 'rgba(194,4,234,1)',
        mint: 'rgba(48,213,201,1)',
        mint_dark: 'rgba(0,132,123,1)'
    }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}
testParseColours()
