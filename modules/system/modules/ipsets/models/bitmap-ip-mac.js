var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var BitmapIPMACSchema = new Schema({
  ipset      : {
    type    : String,
    required: true
  },
  entry      : {
    type    : String,
    required: true
  },
  timeout    : Number,
  description: String
});

var BitmapIPMACOptionsSchema = new Schema({
  ipset  : {
    type    : String,
    required: true
  },
  range  : {
    type    : String,
    required: true
  },
  timeout: Number
});

exports.BitmapIPMAC = mongoose.model('BitmapIPMAC', BitmapIPMACSchema);
exports.BitmapIPMACOptions = mongoose.model('BitmapIPMACOptions', BitmapIPMACOptionsSchema);