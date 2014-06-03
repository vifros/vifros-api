var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashNetPortSchema = new Schema({
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

var HashNetPortOptionsSchema = new Schema({
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

exports.HashNetPort = mongoose.model('HashNetPort', HashNetPortSchema);
exports.HashNetPortOptions = mongoose.model('HashNetPortOptions', HashNetPortOptionsSchema);