var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashIPPortNetSchema = new Schema({
  ipset      : {
    type    : String,
    required: true
  },
  entry      : {
    type    : String,
    required: true
  },
  timeout    : Number,
  nomatch    : Boolean,
  description: String
});

var HashIPPortNetOptionsSchema = new Schema({
  ipset   : {
    type    : String,
    required: true
  },
  family  : {
    type: String,
    enum: [
      'inet',
      'inet6'
    ]
  },
  hashsize: Number,
  maxelem : Number,
  timeout : Number
});

exports.HashIPPortNet = mongoose.model('HashIPPortNet', HashIPPortNetSchema);
exports.HashIPPortNetOptions = mongoose.model('HashIPPortNetOptions', HashIPPortNetOptionsSchema);