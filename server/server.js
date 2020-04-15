const express = require('express');
const path = require('path');
const rv = require('./reverbApi.js');
const ebay = require('./ebayApi.js');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/ebaySearch', (req, res) => {

  let searchText = req.query.searchQuery;

  ebay.ebaySearch(searchText, (err, result) => {
    if (err) {
      //console.log(err);
      res.send(err);
    } else {
      //console.log(result);
      res.send(result);
    }
  })
})

app.get('/reverbSearch', (req, res) => {

  let searchText = req.query.searchQuery;

  rv.reverbSearch(searchText, (err, result) => {
    if (err) {
      //console.log(err);
      res.send(err);
    } else {
      //console.log(result);
      res.send(result);
    }
  })
})

app.listen(port, () => console.log(`GearFinder app listening at http://localhost:${port}`));