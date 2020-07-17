const axios = require('axios');
const reverbToken = require('./reverbToken.js');

const reverbSearch = (searchText, pageNum, sortOrder, sortField, callback) => {
  axios.get(`https://api.reverb.com/api/listings`, {
    headers: {
      Authorization: `Bearer ${reverbToken}`,
      'Accept-Version': '3.0'
    },
    params: {
      current_page: pageNum,
      page: pageNum,
      query: searchText,
      sort: `${sortField}|${sortOrder}`
    }
  })
  .then((results) => {
    //console.log(results);
    callback(results.data);
  })
  .catch((error) => {
    //console.log(error)
    callback(error);
  })
}

module.exports={reverbSearch}