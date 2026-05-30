const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer so it survives the Render build phase
  cacheDirectory: join(__dirname, '.puppeteer-cache'),
};
