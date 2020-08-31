const express = require('express');
const path = require('path');
const rv = require('./reverbApi.js');
const ebay = require('./ebayApi.js');
const db = require('../db/db.js');
const app = express();
const port = 3000;

const addValidBrandNames = (brand) => {
    db.addBrandName(brand, (err, result) => {
      if (err) {
        console.log(err);
      }
    })

}

async function getBrandNamesFromListings(description) {
  let brands = [];
  let descWords = description.split(' ');

  for (let i = 0; i < descWords.length; i++) {

    let promiseBrandValidation = new Promise((resolve, reject) => {
      db.validateBrandName(descWords[i], (err, result) => {
        if (err) {
          reject(err);
        } else {
          if (result.length !== 0) {
            resolve(result);
          } else {
            resolve(result);
          }
        }
      })
    })
    let brand = await promiseBrandValidation;

    if (brand.length > 0) {
      brands.push(brand.map((b) => { return b.brandName }));
    }
  }

  return brands;

}

async function getListings(searchText, pageNum, sort, sortOrder, sortField) {
  let promiseEbay = new Promise((resolve, reject) => {
    ebay.ebaySearch(searchText, pageNum, sort, (ebayResult) => {
      let ebayPageNum = ebayResult.findItemsAdvancedResponse[0].paginationOutput[0].pageNumber[0];
      let ebaySearchResults = ebayResult.findItemsAdvancedResponse[0];
      let source = 'ebay';
      if (pageNum === ebayPageNum) {
        resolve(normalizeListings(ebaySearchResults, source));
      } else {
        ebayResult.findItemsAdvancedResponse[0].isDefaultPage = true;
        resolve(normalizeListings(ebaySearchResults, source));
      }
    });
  });
  let promiseReverb = new Promise((resolve, reject) => {
    rv.reverbSearch(searchText, pageNum, sortOrder, sortField, (reverbResult) => {
      resolve(normalizeListings(reverbResult, 'Reverb'));
    });
  })
  let ebayData = await promiseEbay;
  let reverbData = await promiseReverb;
  let result = {
    listings: [...ebayData.tempListings, ...reverbData.tempListings],
    listingCount: ebayData.tempCount + reverbData.tempCount,
    listingPages: ebayData.tempPageCount > reverbData.tempPageCount ? ebayData.tempPageCount : reverbData.tempPageCount,
    listingBrands: {...ebayData.tempBrands, ...reverbData.tempBrands}
  }
  return result;
}

async function normalizeListings(searchResults, source) {
  let tempObj = {
    tempListings: [],
    tempCount: source === 'ebay' ? parseInt(searchResults.paginationOutput[0].totalEntries[0]) : source === 'Reverb' ? searchResults.total : 0,
    tempPageCount: source === 'ebay' ? parseInt(searchResults.paginationOutput[0].totalPages[0]) : source === 'Reverb' ? searchResults.total_pages : 0,
    tempBrands: {}
  }
  if (searchResults.isDefaultPage === true) {
    return tempObj;
  }
  if (source === 'Reverb') {
    let listingResults = searchResults.listings;
    for (let i = 0; i < listingResults.length; i++) {
      let brandLower = listingResults[i].make.toLowerCase();
      tempObj.tempBrands[brandLower] = true;
      let listing = {
        id: listingResults[i].id,
        image: listingResults[i].photos[0]._links.large_crop.href,
        name: listingResults[i].title,
        brand: [brandLower],
        description: listingResults[i].description,
        price: parseInt(listingResults[i].price.amount),
        listingUrl: `http://reverb.com/item/${listingResults[i].id}`,
        source: source
      }
      addValidBrandNames(listingResults[i].make.toLowerCase());
      tempObj.tempListings.push(listing);
    }
  } else if (source === 'ebay') {
      let listingResults = searchResults.searchResult[0].item;
      for (let i = 0; i < listingResults.length; i++) {
        let descriptionWords = listingResults[i].title[0];
        let brands = await getBrandNamesFromListings(descriptionWords).then((data) => {
          data.forEach((d) => { tempObj.tempBrands[d] = true });
          return data });
        let listing = {
          id: listingResults[i].itemId[0],
          image: listingResults[i].galleryURL[0],
          name: listingResults[i].title[0],
          brand: brands.length >= 1 ? brands : 'Unknown',
          description: descriptionWords,
          price: parseInt(listingResults[i].sellingStatus[0].currentPrice[0].__value__),
          listingUrl: listingResults[i].viewItemURL[0],
          source: source
        }
        tempObj.tempListings.push(listing);
      }
  }
  return tempObj;
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

  let resultData = {
    listingCount: 0,
    listings: [],
    listingPages: 0
  }

  getListings(searchText, pageNum, sort, sortOrder, sortField)
  .then((data) => {
    resultData.listings = [...data.listings];
    resultData.listingCount = data.listingCount;
    resultData.listingPages = data.listingPages;
    resultData.listingBrands = data.listingBrands
    res.send(resultData);
  })
  .catch((error) => {
    console.log(error);
  })

});

const server = app.listen(port, () => console.log(`GearFinder app listening at http://localhost:${port}`));

module.exports = { addValidBrandNames, getBrandNamesFromListings, getListings, normalizeListings, server }