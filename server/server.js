const express = require('express');
const path = require('path');
const rv = require('./reverbApi.js');
const ebay = require('./ebayApi.js');
const db = require('../db/db.js');
const app = express();
const port = 3000;

async function getListings(searchText, pageNum, sort, sortOrder, sortField) {
  let promiseEbay = new Promise((resolve, reject) => {
    ebay.ebaySearch(searchText, pageNum, sort, (ebayResult) => {
      resolve(normalizeListings(ebayResult.findItemsAdvancedResponse[0].searchResult[0].item, 'ebay'));
    });
  });
  let promiseReverb = new Promise((resolve, reject) => {
    rv.reverbSearch(searchText, pageNum, sortOrder, sortField, (reverbResult) => {
      resolve(normalizeListings(reverbResult.listings, 'Reverb'));
    });
  })
  let result = [...await promiseEbay, ...await promiseReverb];
  return result;
}

const normalizeListings = (searchResults, source) => {
  let tempArray = []; // normalize data and put in one listings array
  for (let i = 0; i < searchResults.length; i++) {
    if (source === 'Reverb') {
      let listing = {
        id: searchResults[i].id,
        image: searchResults[i].photos[0]._links.large_crop.href,
        name: searchResults[i].title,
        brand: [searchResults[i].make],
        description: searchResults[i].description,
        price: parseInt(searchResults[i].price.amount),
        listingUrl: `http://reverb.com/item/${searchResults[i].id}`,
        source: source
      }
      tempArray.push(listing);
    } else if (source === 'ebay') {
      let descriptionWords = searchResults[i].title[0];
      let listing = {
        id: searchResults[i].itemId[0],
        image: searchResults[i].galleryURL[0],
        name: searchResults[i].title[0],
        brand: '', //(() => { return this.getBrandFromDescription(descriptionWords)})(),
        description: descriptionWords,
        price: parseInt(searchResults[i].sellingStatus[0].currentPrice[0].__value__),
        listingUrl: searchResults[i].viewItemURL[0],
        source: source
      }
      tempArray.push(listing);
    }
  }
  return tempArray;
}

app.use(express.static(path.join(__dirname, '../public')));

app.get('/search', (req, res) => {

  let searchText = req.query.searchQuery;
  let pageNum = req.query.pageNum;
  let sortField = req.query.sortField;
  let sortOrder = req.query.sortOrder;
  let sort = 'BestMatch'; // ebay

  if (sortField === 'price') {
    if (sortOrder === 'asc') {
      sort = 'PricePlusShippingLowest';
    } else if (sortOrder === 'desc') {
      sort = 'PricePlusShippingHighest';
    }
  } // ebay

  let resultData = []

  getListings(searchText, pageNum, sort, sortOrder, sortField)
  .then((data) => {
    resultData.push(data)
    res.send(resultData)
  })


  // rv.reverbSearch(searchText, pageNum, sortOrder, sortField, (reverbResult) => {
  //     resultData.push(normalizeListings(reverbResult, 'Reverb'));
  // });

});

app.get('/ebaySearch', (req, res) => {

  let searchText = req.query.searchQuery;
  let pageNum = req.query.pageNum;
  let sortField = req.query.sortField;
  let sortOrder = req.query.sortOrder;
  let sort = 'BestMatch';

  if (sortField === 'price') {
    if (sortOrder === 'asc') {
      sort = 'PricePlusShippingLowest';
    } else if (sortOrder === 'desc') {
      sort = 'PricePlusShippingHighest';
    }
  }

  ebay.ebaySearch(searchText, pageNum, sort, (err, ebayResult) => {
    if (err) {
      //console.log(err);
      res.send(err);
    } else {
      //console.log(result);
      res.send(ebayResult);
    }
  });
});

app.get('/reverbSearch', (req, res) => {

  let searchText = req.query.searchQuery;
  let pageNum = req.query.pageNum;
  let sortField = req.query.sortField;
  let sortOrder = req.query.sortOrder;

  rv.reverbSearch(searchText, pageNum, sortOrder, sortField, (err, reverbResult) => {
    if (err) {
      //console.log(err);
      res.send(err);
    } else {
      //console.log(reverbResult);
      res.send(reverbResult);
    }
  })
})

app.get('/validateBrandName', (req, res) => {

  let word = req.query.brandToCheck;

  db.validateBrandName(word, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      if (result.length !== 0) {
        res.send(result);
      } else {
        res.send('Not Found');
      }
    }
  })
})

app.listen(port, () => console.log(`GearFinder app listening at http://localhost:${port}`));