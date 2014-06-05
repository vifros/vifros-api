var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var HashNetIfaceSchema = new Schema({
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

var HashNetIfaceOptionsSchema = new Schema({
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

exports.HashNetIface = mongoose.model('HashNetIface', HashNetIfaceSchema);
exports.HashNetIfaceOptions = mongoose.model('HashNetIfaceOptions', HashNetIfaceOptionsSchema);