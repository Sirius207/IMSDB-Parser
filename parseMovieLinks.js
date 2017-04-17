const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const movieLinks = require('./links/movieLinks.json');

const URL = 'http://www.imsdb.com';

// get html body from link
const getBodyByLink = (link) => {
  return new Promise((resolve, reject) => {
    request({
      url: link,
      method: 'GET',
    }, (err, response, body) => {
      if (err || !body) {
        reject(err);
      } else {
        const $body = cheerio.load(body);
        resolve($body);
      }
    });
  });
};

// get AlphabeticalLinks in index body
const getAlphabeticalLinks = ($) => {
  return new Promise((resolve) => {
    const alphabeticalLinks = [];
    const totalLink = $('td a');
    for (const key in totalLink) {
      if (key > 2 && key < 30) {
        alphabeticalLinks[alphabeticalLinks.length] = URL + totalLink[key].attribs.href;
      } else if (key === 30) {
        break;
      }
    }
    resolve(alphabeticalLinks);
  });
};

// get MovieLinks in AlphabeticalLink Page
const getMovieLinks = async (AlphabeticalLinks) => {
  const movieLinks = {};
  for (const SingleAlphabeticalLink of AlphabeticalLinks){
    const $alphabeticalBody = await getBodyByLink(SingleAlphabeticalLink);
    const singleAlphabeticalLinkList = $alphabeticalBody('p a');
    for (const key in singleAlphabeticalLinkList) {
      if (singleAlphabeticalLinkList[key].name === 'a') {
        // console.log('href: ' + singleAlphabeticalLinkList[key].attribs.href);
        movieLinks[singleAlphabeticalLinkList[key].attribs.title]
          = URL + singleAlphabeticalLinkList[key].attribs.href;
      } else {
        break;
      }
    }
  }
  return (movieLinks);
};


// create movie links json file
const buildMovieLinkJson = async () => {
  const $indexBody = await getBodyByLink(URL);
  const alphabeticalLinks = await getAlphabeticalLinks($indexBody);
  const movieLinks = await getMovieLinks(alphabeticalLinks);
  fs.writeFileSync('movieLinks.json', JSON.stringify(movieLinks));
};


// create script links json file from movieLinks json file
const buildScriptLinkJson = async () => {
  const scriptLinks = {};
  for(const movieName in movieLinks) {
    const $singleMovieBody = await getBodyByLink(movieLinks[movieName]);
    const singleScriptLink = $singleMovieBody('.script-details a').last().attr('href'); 
    // console.log(singleScriptLink);
    scriptLinks[movieName] = URL + singleScriptLink;
  }
  fs.writeFileSync('scriptLinks.json', JSON.stringify(scriptLinks));
};

module.exports = {
  getBodyByLink,
  buildMovieLinkJson,
  buildScriptLinkJson,
};
