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

module.exports = {validateBrandName}
