const isEqual = require("lodash.isequal")
const { parseStyles, generateColour, styleExtaction } = require("./scrape-fig");
const sampleJson = require("./src/figma-styles/sample.json");

const goldGroup = {
    name: "name",
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
    name: "name",
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
    const parsedColours = parseStyles(sampleJson.document, sampleJson.styles, styleExtaction).colours
    const expectedColoursResults = {
      gold: 'rgba(252,178,22,1)',
      sky: 'rgba(0,117,229,1)',
      justGreen: 'rgba(35,157,78,1)',
      steel: 'rgba(26,34,44,1)',
      cherry: 'rgba(230,26,65,1)',
      violet: 'rgba(181,85,256,1)',
      mint: 'rgba(70,245,130,1)',
      mintDark: 'rgba(68,194,118,1)'
   }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedColoursResults))
}

const testEmptyColours = () => {
    const parsedColours = parseStyles({name: "blank"}, sampleJson.styles, styleExtaction).colours
    const expectedResults = {}
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}
const testShallowColours = () => {
    const parsedColours = parseStyles(goldGroup, sampleJson.styles, styleExtaction).colours
    const expectedResults = { gold: 'rgba(252,178,22,1)' }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}

const testNestedColours = () => {
  const goldGroupWithChildren = {
        ...goldGroup,
        children: [skyGroup]
    };
    const parsedColours = parseStyles(goldGroupWithChildren, sampleJson.styles, styleExtaction).colours
    const expectedResults = { gold: 'rgba(252,178,22,1)', sky: 'rgba(0,117,229,1)', }
    console.log(parsedColours)
    console.log(isEqual(parsedColours, expectedResults))
}

[testParseColours, testEmptyColours, testShallowColours, testNestedColours].forEach(fn => fn())
