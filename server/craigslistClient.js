const craigslist = require('node-craigslist');

let client = new craigslist.Client({});

const craigsListSearch = (options, query, callback) => {
  client.search({
    bundleDuplicates: true,
    city: options.city,
    offset: 1,
    category: 'msa'
  }, query, callback);
};

module.exports = { craigsListSearch };