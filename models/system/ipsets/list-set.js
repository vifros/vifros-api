var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var ListSetSchema = new Schema({
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

var ListSetOptionsSchema = new Schema({
  ipset  : {
    type    : String,
    required: true
  },
  size   : Number,
  timeout: Number
});

exports.ListSet = mongoose.model('ListSet', ListSetSchema);
exports.ListSetOptions = mongoose.model('ListSetOptions', ListSetOptionsSchema);