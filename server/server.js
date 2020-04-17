const express = require('express');
const path = require('path');
const rv = require('./reverbApi.js');
const ebay = require('./ebayApi.js');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));

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
  })
})

app.get('/reverbSearch', (req, res) => {

  let searchText = req.query.searchQuery;
  let pageNum = req.query.pageNum;
  let sortField = req.query.sortField;
  let sortOrder = req.query.sortOrder;

  console.log(sortField, sortOrder)

  rv.reverbSearch(searchText, pageNum, sortOrder, sortField, (err, reverbResult) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      console.log(reverbResult);
      res.send(reverbResult);
    }
  })
})

app.listen(port, () => console.log(`GearFinder app listening at http://localhost:${port}`));