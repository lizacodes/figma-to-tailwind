const fs = require('fs');
const request = require('request-promise');
const snakeCase = require('lodash.snakecase');

const AUTH_TOKEN = '<INSERT_AUTH_TOKEN_HERE>';
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
const getColourKey = (group, figmaStyles) => snakeCase(figmaStyles[group.styles.fill].name)
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

const scrapeFig = () =>
  getFile().then((file) => {
    const colours = parseColours(file.document, file.styles);
    fs.writeFileSync('./colours.json', JSON.stringify(colours, null, 2), 'utf-8');
  }).catch((e) => {
    console.log(e);
  });

module.exports = { parseColours, scrapeFig }
