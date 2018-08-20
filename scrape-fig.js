const fs = require('fs');
const request = require('request-promise');
const camelCase = require('lodash.camelCase');

const AUTH_TOKEN = '2780-d3331c58-9c0f-458d-a06e-ba89c5ae9138';
const API_ROOT = 'https://api.figma.com';

const fileKey = 'TTjfrS4jXao5JIiLHOraTRQu';

const getFile = async () => {
  try {
    // Get Figma JSON
    const response = await request.get(`${API_ROOT}/v1/files/${fileKey}`, {
      headers: {
        'X-FIGMA-TOKEN': AUTH_TOKEN
      }
    });

    return JSON.parse(response);
  } catch (e) {
    console.log(e);
  }
}

// Colours
const groupHasColours = (group, figmaStyles) => (group.styles && group.styles.fill && figmaStyles[group.styles.fill])
const getColourKey = (group, figmaStyles) => camelCase(figmaStyles[group.styles.fill].name)
const rgbDecToInt = (n) => Math.round(n * 256)
const generateRgb = ({ r, g, b, a }) => `rgba(${[r, g, b].map(rgbDecToInt).join(',')},${a})`
const generateColour = (group, figmaStyles) => ({
  ...(groupHasColours(group, figmaStyles) && {
    [getColourKey(group, figmaStyles)]: generateRgb(group.fills[0].color)
  })
})

// Typography helpers
const baseFontSize = 16;
const groupHasTextStyles = (group, figmaStyles) => (group.styles && group.styles.text && figmaStyles[group.styles.text])
const groupIsFontWeights = (group) => group.name.toLowerCase() === 'weights';
const groupIsLineHeights = (group) => camelCase(group.name).toLowerCase() === 'lineheights';
const groupIsSizes = (group) => group.name.toLowerCase() === 'sizes';
const getTextStyleKey = (group, figmaStyles) => camelCase(figmaStyles[group.styles.text].name)
const pixelToRem = (pixel) => pixel / baseFontSize;
const percentToMultiplier = (percentage) => percentage / 100;

const generateTextSize = (group, figmaStyles) => ({
  ...(groupHasTextStyles(group, figmaStyles) && {
    [getTextStyleKey(group, figmaStyles)]: `${pixelToRem(group.style.fontSize)}rem`
  })
})

const parseBlah = (group, figmaStyles) => ( generateBlah, blahCheck = () => true, inBlah = false) => {
  const currentlyInStyle =  inBlah || blahCheck(group);
  const currentStyles = currentlyInStyle ? generateBlah(group, figmaStyles) : {};
  if (group.children) {
    return group.children.reduce((childStyles, child) => ({
      ...childStyles,
      ...parseBlah(child, figmaStyles)(generateBlah, blahCheck, currentlyInStyle)
    }), currentStyles)
  }

  return currentStyles;
}

const generateLineHeight = (group, figmaStyles) => ({
  ...(groupHasTextStyles(group, figmaStyles) && {
    [getTextStyleKey(group, figmaStyles)]: `${percentToMultiplier(group.style.lineHeightPercent)}`
  })
})

const generateFontWeight = (group, figmaStyles) => ({
  ...(groupHasTextStyles(group, figmaStyles) && {
    [getTextStyleKey(group, figmaStyles)]: group.style.fontWeight
  })
})

const scrapeFig = () =>
  getFile().then((file) => {
    const parseStyles = parseBlah(file.document, file.styles)
    const colours = parseStyles(generateColour);

    // const sizeGroup = getBlahGroup(file.document, groupIsSizes);
    const textSizes = parseStyles(generateTextSize, groupIsSizes);

    // const lineHeightGroup = getBlahGroup(file.document, groupIsLineHeights);
    const lineHeights = parseStyles(generateLineHeight, groupIsLineHeights);

    // const fontWeightGroup = getBlahGroup(file.document, groupIsFontWeights);
    const fontWeights = parseStyles(generateFontWeight, groupIsFontWeights);

    fs.writeFile('./sample.json', JSON.stringify(file, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to sample.json');
    });

    fs.writeFile('./colours.json', JSON.stringify(colours, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to colours.json')
    });
    fs.writeFile('./text-sizes.json', JSON.stringify(textSizes, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to text-sizes.json')
    });
    fs.writeFile('./line-heights.json', JSON.stringify(lineHeights, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to line-heights.json')
    });
    fs.writeFile('./font-weights.json', JSON.stringify(fontWeights, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to font-weights.json')
    });

  }).catch((e) => {
    console.log(e);
  });

module.exports = { scrapeFig, parseBlah, generateColour, groupIsFontWeights, generateColour, groupIsSizes }
