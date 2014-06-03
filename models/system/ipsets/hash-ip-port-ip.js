var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashIPPortIPSchema = new Schema({
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

var HashIPPortIPOptionsSchema = new Schema({
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

exports.HashIPPortIP = mongoose.model('HashIPPortIP', HashIPPortIPSchema);
exports.HashIPPortIPOptions = mongoose.model('HashIPPortIPOptions', HashIPPortIPOptionsSchema);