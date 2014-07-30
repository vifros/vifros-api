var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var BitmapPortSchema = new Schema({
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

var BitmapPortOptionsSchema = new Schema({
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

exports.BitmapPort = mongoose.model('BitmapPort', BitmapPortSchema);
exports.BitmapPortOptions = mongoose.model('BitmapPortOptions', BitmapPortOptionsSchema);