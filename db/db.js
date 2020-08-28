const mongoose = require('mongoose');
const db = mongoose.connection;
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/gearfinder', {useNewUrlParser: true});

db.on('error', console.error.bind(console, 'connection error:'));

const brandSchema = new Schema ({
  brandName: String
}, { collection: 'brands' });

const brandModel = mongoose.model('Brand', brandSchema);

const validateBrandName = (word, callback) => {
  brandModel.find({ brandName: word.toLowerCase() }, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  })
}

const addBrandName = (brand, callback) => {
  let brandNameLower = brand.toLowerCase();
  brandModel.find({ brandName: brandNameLower }, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      if (result.length === 0) {
        brandModel.create({ brandName: brandNameLower }, (err, result) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, result);
          }
        })
      } else {
        callback(null, result);
      }
    }
  })
}

module.exports = {validateBrandName, addBrandName}
