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

const groupHasColours = (group, figmaStyles) => (group.styles && group.styles.fill && figmaStyles[group.styles.fill])
const getColourKey = (group, figmaStyles) => camelCase(figmaStyles[group.styles.fill].name)
const rgbDecToInt = (n) => Math.round(n * 256)
const generateRgb = ({ r, g, b, a }) => `rgba(${[r, g, b].map(rgbDecToInt).join(',')},${a})`
const parseColours = (group, figmaStyles) => {
  const currentGroupColours = {
    ...(groupHasColours(group, figmaStyles) && { [getColourKey(group, figmaStyles)]: generateRgb(group.fills[0].color) })
  }
  return group.children
    ? group.children.reduce((childColours, child) => ({ ...childColours, ...parseColours(child, figmaStyles) }), currentGroupColours)
    : currentGroupColours
}


const groupHasTypography = (group, figmaStyles) => (group.styles && group.styles.text && figmaStyles[group.styles.text])
const getTextSizeKey = (group, figmaStyles) => camelCase(figmaStyles[group.styles.text].name)

const parseTextSize = (group, figmaStyles, textSizes = {}) => {
  if (groupHasTypography(group, figmaStyles)) {
    textSizes[getTextSizeKey(group, figmaStyles)] = `${group.style.fontSize}px`;
  }

  if (group.children) {
    for (let index = 0; index < group.children.length; index++) {
      const child = group.children[index];
      parseTextSize(child, figmaStyles, textSizes);
    }
  }

  return textSizes;
}

const scrapeFig = () =>
  getFile().then((file) => {
    const colours = parseColours(file.document, file.styles);
    fs.writeFileSync('./colours.json', JSON.stringify(colours, null, 2), 'utf-8');
  }).catch((e) => {
    console.log(e);
  });

module.exports = { parseColours, scrapeFig }
