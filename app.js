const fs = require('fs');
const parser = require('./parseMovieLinks.js');
const scriptLinks = require('./links/scriptLinks.json');

const getBodyByLink = parser.getBodyByLink;

const URL = 'http://www.imsdb.com';

const single = {};

const getSingleScript = async () => {
  const $singleScriptBody = await getBodyByLink('http://www.imsdb.com/scripts/La-La-Land.html');
  const singleScript = $singleScriptBody('pre').children();
  // console.log(singleScript);
  for (const key in singleScript) {
    if (singleScript[key].children && singleScript[key].next && singleScript[key].next.data) {
      console.log(singleScript[key].children[0].data);
      console.log(singleScript[key].next.data);
      const role = singleScript[key].children[0].data
        .replace(/\s\s+/g, '')
        .replace(/\r\n/g, '')
        .replace(" (CONT'D)", '')
        .replace(' (O.S.)', '');

      const content = singleScript[key].next.data
        .split('\r\n\r\n')[0]
        .replace(/\r\n/g, '')
        .replace(/\s\s+/g, ' ')
        .split('Revision')[0];
      if (!single[role] && isNaN(role[0])) {
        single[role] = [];
        single[role].push(content);
      } else if (isNaN(role[0])) {
        single[role].push(content);
      }
    } else if (!singleScript[key].next) {
      break;
    }
  }
  for (const name in single){
    if (single[name].length < 2) {
      delete single[name];
    }
  }
  fs.writeFileSync('scripts/single7_fullTalk.json', JSON.stringify(single));
}

getSingleScript();













