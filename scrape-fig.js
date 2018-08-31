const fs = require('fs');
const request = require('request-promise');
const camelCase = require('lodash.camelCase');

const figmaToken = require('./tokens.json').figma;
const fileKey = 'TTjfrS4jXao5JIiLHOraTRQu';
const API_ROOT = 'https://api.figma.com';

const getFile = async () => {
  try {
    // Get Figma JSON
    const response = await request.get(`${API_ROOT}/v1/files/${fileKey}`, {
      headers: {
        'X-FIGMA-TOKEN': figmaToken
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

const parseStyles = (group, figmaStyles, styleExtaction, currentlyInStyles = {}) => {
  const stylesCurrentlyIn = Object.entries(styleExtaction).reduce((accu, [styleKey, { groupDeterminer }]) => ({
    ...accu,
    [styleKey]: currentlyInStyles[styleKey] || groupDeterminer(group),
  }), {})
  const currentStyles = Object.entries(styleExtaction).reduce((accu, [styleKey, { extractor }]) => ({
    ...accu,
    ...(stylesCurrentlyIn[styleKey] && {
      [styleKey]: extractor(group, figmaStyles)
    })
  }), {})

  if (group.children) {
    return group.children.reduce((childStyles, child) =>{
      const parsedStyles = parseStyles(child, figmaStyles, styleExtaction, stylesCurrentlyIn, currentStyles);
      return Object.entries(styleExtaction).reduce((accu, [styleKey, _]) => ({
        ...accu,
        [styleKey]: {
          ...childStyles[styleKey],
          ...parsedStyles[styleKey]
        }
       }), {})
    }, currentStyles)
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

const styleExtaction = {
  colours: { extractor: generateColour, groupDeterminer: () => true},
  textSizes: { extractor: generateTextSize, groupDeterminer: groupIsSizes },
  lineHeights: { extractor: generateLineHeight, groupDeterminer: groupIsLineHeights },
  fontWeights: { extractor: generateFontWeight, groupDeterminer: groupIsFontWeights },
}

const scrapeFig = () =>
  getFile().then((file) => {
    const {
      colours,
      textSizes,
      lineHeights,
      fontWeights,
    } = parseStyles(file.document, file.styles, styleExtaction);

    fs.writeFile('./src/figma-styles/sample.json', JSON.stringify(file, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to sample.json');
    });

    fs.writeFile('./src/figma-styles/colours.json', JSON.stringify(colours, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to colours.json')
    });
    fs.writeFile('./src/figma-styles/text-sizes.json', JSON.stringify(textSizes, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to text-sizes.json')
    });
    fs.writeFile('./src/figma-styles/line-heights.json', JSON.stringify(lineHeights, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to line-heights.json')
    });
    fs.writeFile('./src/figma-styles/font-weights.json', JSON.stringify(fontWeights, null, 2), 'utf-8', () => {
      console.log('Successfully wrote to font-weights.json')
    });

  }).catch((e) => {
    console.log(e);
  });

module.exports = { scrapeFig, parseStyles, generateColour, groupIsFontWeights, generateColour, groupIsSizes, styleExtaction }
