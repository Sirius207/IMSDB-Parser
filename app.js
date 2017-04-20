const fs = require('fs');
const parser = require('./parseMovieLinks.js');
const scriptLinks = require('./links/scriptLinks.json');

const getBodyByLink = parser.getBodyByLink;


// parse & format single script
const getSingleScript = async (movieName, singleSriptLink) => {
  // single movie info (with movie name & script)
  const single = {};
  // single movie script
  const script = {};

  const $singleScriptBody = await getBodyByLink(singleSriptLink);
  const singleScript = $singleScriptBody('pre').children();


    for (const key in singleScript) {
      try {
        if ((singleScript[key].children && singleScript[key].children.length !== 0)
          && singleScript[key].children[0].data
          && singleScript[key].next
          && singleScript[key].next.data) {
          // console.log(singleScript[key].children[0].data);
          // console.log(singleScript[key].next.data);
          const role = await singleScript[key].children[0].data
            .replace(/\s\s+/g, '')
            .replace(/\r\n/g, '')
            .replace(" (CONT'D)", '')
            .replace(' (O.S.)', '')
            .replace(/\n/g, '');

          const content = await singleScript[key].next.data
            .split('\r\n\r\n')[0]
            .replace(/\r\n/g, '')
            .replace(/\s\s+/g, ' ')
            .split('Revision')[0]
            .replace(/\n/g, '');
          if (!script[role] && isNaN(role[0])) {
            script[role] = [];
            script[role].push(content);
          } else if (isNaN(role[0])) {
            script[role].push(content);
          }
        } else if (!singleScript[key].next) {
          break;
        }
      } catch (e) {
        console.log(movieName + ',' + e);
        console.log(singleScript[key]);
        console.log(key);
      } 
    } 

  single.movie = movieName;
  single.script = [];
  console.log(single.movie);
  for (const role in script) {
    if (script[role].length < 2 ||
    role === ('SLAM CUT TO:' || 'DISSOLVE TO:' || 'CUT TO:' || '') ||
    script[role][0] === ' Written by') {
      delete script[role];
    } else {
      single.script.push({ role, dialog: script[role] });
    }
  }
  // fs.writeFileSync('scripts/single8_fullTalk.json', JSON.stringify(single));
  return single;
};

// getSingleScript('12', 'http://www.imsdb.com/scripts/La-La-Land.html');



const scriptLinksFile = require('./links/scriptLinks2.json');

const parseEveryScripts = async () => {
  const fullScripts = { list: [] };
  await Promise.all(Object.keys(scriptLinksFile).map(async (movieName) => {
    const newMovieName = (movieName.includes(', The Script'))
      ? movieName.replace(', The Script', '').replace(/^/, 'The ')
      : movieName.replace(' Script', '');

    const single = await getSingleScript(newMovieName, scriptLinksFile[movieName]);
    fullScripts.list.push(single);
  }));
  return fullScripts;
};

const buildMovieScriptJson = async () => {
  const fullScripts = await parseEveryScripts();
  console.log(fullScripts);
  await fs.writeFileSync('scripts/fullScript.json', JSON.stringify(fullScripts));
};

buildMovieScriptJson();














