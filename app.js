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

  // check the position of the script
  let singleScript;
  if ($singleScriptBody('pre').length === 2) {
    singleScript = ($singleScriptBody('pre').last().children().length > $singleScriptBody('pre').first().children().length)
      ? $singleScriptBody('pre').last().children()
      : $singleScriptBody('pre').first().children();
  } else {
    singleScript = $singleScriptBody('pre').children();
  }
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
          .replace(/\s\s+/g, '')
          .split('Revision')[0]
          .replace(/\n/g, '');
        if (!script[role] && isNaN(role[0])) {
          script[role] = [];
          script[role].push(content);
        } else if (isNaN(role[0]) && content.length !== 0) {
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
  for (const role in script) {
    if (script[role].length < 2 ||
    role === (
      'SLAM CUT TO:' ||
      'DISSOLVE TO:' ||
      'CUT TO:' ||
      ''
    ) || script[role][0].includes('Written by')) {
      delete script[role];
    } else {
      single.script.push({ role, dialog: script[role] });
    }
  }
  // fs.writeFileSync('scripts/single8_fullTalk.json', JSON.stringify(single));
  return single;
};



const parseEveryScripts = () => {
  let realIndex = 1;
  return Promise.all(Object.keys(scriptLinks).map((movieName, index) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const newMovieName = (movieName.includes(', The Script'))
          ? movieName.replace(', The Script', '').replace(/^/, 'The ')
          : movieName.replace(' Script', '');

        const singleScript = await getSingleScript(newMovieName, scriptLinks[movieName]);
        console.log(realIndex + ': ' + index + ': ' + singleScript.movie);
        console.log(' ' + singleScript.script.length + ' roles');
        realIndex += 1;
        resolve(singleScript);
      }, index * 500);
    });
  })).then((fullScripts) => {
    return fullScripts;
  }).catch((e) => {
    console.log(e);
  });
};



const buildMovieScriptJson = async () => {
  console.log('START - scriptLinks count: ' + Object.keys(scriptLinks).length);
  const fullScripts = { list: [] };
  fullScripts.li
  st = await parseEveryScripts();
  console.log('FINISH - fullScripts count: ' + Object.keys(fullScripts.list).length);
  fs.writeFileSync('scripts/full_2.json', JSON.stringify(fullScripts));
};

buildMovieScriptJson();



// getSingleScript('0', 'http://www.imsdb.com/scripts/48-Hrs..html');












