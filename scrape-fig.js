const fs = require('fs');
const util = require('util');
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
  } catch(e) {
    console.log(e);
  }
}

const parseColours = (group, figmaStyles, colours = {}) => {
  if (group.styles && group.styles.fill && figmaStyles[group.styles.fill]) {
    const { r, g, b, a } = group.fills[0].color;

    colours[snakeCase(figmaStyles[group.styles.fill].name)] = `rgba(${Math.floor(r*256)},${Math.round(g*256)},${Math.round(b*256)},${a})`;
  }

  if (group.children) {
    for (let index = 0; index < group.children.length; index++) {
      const child = group.children[index];
      parseColours(child, figmaStyles, colours);
    }
  }

  return colours;
}

getFile().then((file) => {
  const colours = parseColours(file.document, file.styles);
  fs.writeFileSync('./colours.json', JSON.stringify(colours, null, 2) , 'utf-8');
}).catch((e) => {
  console.log(e);
});
