const parser = require('./parseMovieLinks.js');
const movieLinks = require('./movieLinks.json');
const fs = require('fs');

const getBodyByLink = parser.getBodyByLink;

const URL = 'http://www.imsdb.com';

const buildScriptLinks = async () => {
  const scriptLinks = {};
  for(const movieName in movieLinks) {
    const $singleMovieBody = await getBodyByLink(movieLinks[movieName]);
    const singleScriptLink = $singleMovieBody('.script-details a').last().attr('href'); 
    console.log(singleScriptLink);
    scriptLinks[movieName] = URL + singleScriptLink;
  }
  fs.writeFileSync('scriptLinks.json', JSON.stringify(scriptLinks));
}

buildScriptLinks();












