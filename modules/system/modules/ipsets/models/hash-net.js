var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashNetSchema = new Schema({
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

var HashNetOptionsSchema = new Schema({
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

exports.HashNet = mongoose.model('HashNet', HashNetSchema);
exports.HashNetOptions = mongoose.model('HashNetOptions', HashNetOptionsSchema);