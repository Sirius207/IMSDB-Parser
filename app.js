const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

request({
  url: 'http://www.imsdb.com/scripts/La-La-Land.html',
  method: 'GET',
}, (err, response, body) => {
  if (err || !body) {
    console.log(err);
  } else {
    const $ = cheerio.load(body);
    const result = [];
    const script = $('pre');
    for (let i = 0; i < script.length; i += 1) {
      result.push($(script[i]).text());
    }
    fs.writeFileSync('result.json', JSON.stringify(result));
  }
});



