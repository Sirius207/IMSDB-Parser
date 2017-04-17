const fs = require('fs');
const parser = require('./parseMovieLinks.js');
const scriptLinks = require('./scriptLinks.json');


const getBodyByLink = parser.getBodyByLink;

const URL = 'http://www.imsdb.com';

const single = {};

const getSingleScript = async () => {
  const $singleScriptBody = await getBodyByLink('http://www.imsdb.com/scripts/La-La-Land.html');
  const singleScript = $singleScriptBody('pre').children();
  // console.log(singleScript);
  for (const key in singleScript) {
    if (singleScript[key].children && singleScript[key].next.data) {
      // console.log(singleScript[key].children[0].data);
      // console.log(singleScript[key].next.data);
      const role = singleScript[key].children[0].data.replace(/\s\s+/g, '').replace(/\r\n/g, '').replace(" (CONT'D)", '');
      const content = singleScript[key].next.data.replace(/\r\n/g, '').replace(/\s\s+/g, ' ');
      if (!single[role] && isNaN(role[0])) {
        single[role] = [];
        single[role].push(content);
      } else if (isNaN(role[0])) {
        single[role].push(content);
      }
    } else {
      break;
    }
  }
  fs.writeFileSync('single5.json', JSON.stringify(single));
}

getSingleScript();













