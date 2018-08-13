const isEqual = require("lodash.isequal")
const { parseColours } = require("./scrape-fig");
const sampleJson = require("./sample.json");

const goldGroup = {
    fills: [
        {
            color: {
                r: 0.984313725490196,
                g: 0.6941176470588235,
                b: 0.08627450980392157,
                a: 1
            }
        }
    ],
    styles: {
        fill: "1:99"
    },
}

const skyGroup = {
    fills: [
        {
            color: {
                r: 0,
                g: 0.4588235294117647,
                b: 0.8941176470588236,
                a: 1
            }
        }
    ],
    styles: {
        fill: "1:101"
    },
}

const testParseColours = () => {
    const parsedColours = parseColours(sampleJson.document, sampleJson.styles)
    const expectedResults = {
        gold: 'rgba(252,178,22,1)',
        sky: 'rgba(0,117,229,1)',
        just_green: 'rgba(35,157,78,1)',
        steel: 'rgba(26,34,44,1)',
        cherry: 'rgba(230,26,65,1)',
        violet: 'rgba(195,4,234,1)',
        mint: 'rgba(48,213,201,1)',
        mint_dark: 'rgba(0,132,123,1)'
    }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}

const testEmptyColours = () => {
    const parsedColours = parseColours({}, sampleJson.styles)
    const expectedResults = {}
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}
const testShallowColours = () => {
    const parsedColours = parseColours(goldGroup, sampleJson.styles)
    const expectedResults = { gold: 'rgba(252,178,22,1)' }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}

const testNestedColours = () => {
    const parsedColours = parseColours({
        ...goldGroup,
        children: [skyGroup]
    }, sampleJson.styles)
    const expectedResults = { gold: 'rgba(252,178,22,1)', sky: 'rgba(0,117,229,1)', }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}
[testEmptyColours, testParseColours, testShallowColours, testNestedColours].forEach(fn => fn())
