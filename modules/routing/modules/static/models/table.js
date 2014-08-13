var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var StaticRoutingTableSchema = new Schema({
  // Read-only.
  name       : {
    type    : String,
    unique  : true,
    required: true
  },
  // Read-only.
  id         : {
    type    : Number,
    min     : 0,
    max     : 2147483648, // 2 ^ 31
    unique  : true,
    required: true
  },
  description: String
});

exports.StaticRoutingTable = mongoose.model('StaticRoutingTable', StaticRoutingTableSchema);