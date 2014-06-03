var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashIPSchema = new Schema({
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

var HashIPOptionsSchema = new Schema({
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
  netmask : Number,
  timeout : Number
});

exports.HashIP = mongoose.model('HashIP', HashIPSchema);
exports.HashIPOptions = mongoose.model('HashIPOptions', HashIPOptionsSchema);