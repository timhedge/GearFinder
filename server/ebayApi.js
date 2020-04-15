const axios = require('axios');
const ebayTokens = require('./ebayTokens.js');

const ebaySearch = (searchText, pageNum, callback) => {
  axios.get(`https://svcs.ebay.com/services/search/FindingService/v1`, {
    headers: {
      'X-EBAY-SOA-OPERATION-NAME': 'findItemsAdvanced',
      'X-EBAY-SOA-SECURITY-APPNAME': ebayTokens.prodAppId,
      'X-EBAY-SOA-RESPONSE-DATA-FORMAT': 'JSON'
    },
    params: {
      keywords: searchText,
      'paginationInput.entriesPerPage': 24,
      'paginationInput.pageNumber': pageNum
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

module.exports={ebaySearch}