var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var BitmapIPSchema = new Schema({
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

var BitmapIPOptionsSchema = new Schema({
  ipset  : {
    type    : String,
    required: true
  },
  range  : {
    type    : String,
    required: true
  },
  netmask: Number,
  timeout: Number
});

exports.BitmapIP = mongoose.model('BitmapIP', BitmapIPSchema);
exports.BitmapIPOptions = mongoose.model('BitmapIPOptions', BitmapIPOptionsSchema);