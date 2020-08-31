const { addValidBrandNames, getBrandNamesFromListings, getListings, normalizeListings, server } = require('./server');
const axios = require('axios');
axios.defaults.adapter = require('axios/lib/adapters/http');

// describe('Add a new brand name to the database', () => {

//   test('Brand name "Spizzichino" is added to the database', () => {
//     expect(addValidBrandNames('Spizzichino')).to
//   })
// })
afterAll(async () => {
  await server.close();
})

describe('Get a valid brand name from a product listing', () => {

  test('Brand name "zildjian" exists in the DB, and therefore is valid', async () => {
    let desc = 'zildjian k light ride 22"';
    const result = await getBrandNamesFromListings(desc);
    expect(result).toEqual([['zildjian']]);
  });

  test('Valid brand not found in provided description', async () => {
    let desc = 'NoName ride cymbal 22"';
    const result = await getBrandNamesFromListings(desc);
    expect(result).toEqual([]);
  });

});

describe('Get listings from external APIs', () => {

  test('Get results for search query "sabian legacy ride 21", page 1, no specific sort order should return an object with results from eBay and Reverb', async () => {
    let searchQ = 'sabian legacy ride 21';
    let page = 1;
    let sortBy = 'BestMatch';
    let sortOrder = '';
    let sortField = '';
    const result = await getListings(searchQ, page, sortBy, sortOrder, sortField);
    expect(result.listings.length).toBeGreaterThan(0);
    expect(result.listingCount).toBeGreaterThan(0);
    expect(result.listingPages).toBeGreaterThan(0);
    expect(result.listingBrands['sabian']).toBeTruthy();
  });
});