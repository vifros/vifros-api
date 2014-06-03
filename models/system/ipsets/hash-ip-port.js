var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashIPPortSchema = new Schema({
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

var HashIPPortOptionsSchema = new Schema({
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

exports.HashIPPort = mongoose.model('HashIPPort', HashIPPortSchema);
exports.HashIPPortOptions = mongoose.model('HashIPPortOptions', HashIPPortOptionsSchema);