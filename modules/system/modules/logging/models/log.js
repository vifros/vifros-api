var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var LogSchema = new Schema({
  module   : {
    type    : String,
    required: true
  },
  tags     : {
    type: Array
  },
  timestamp: {
    type   : Date,
    default: Date.now
  },
  level    : {
    type    : String,
    enum    : [
      'info',
      'warn',
      'error'
    ],
    required: true
  },
  message  : {
    type    : String,
    required: true
  }
});

exports.Log = mongoose.model('Log', LogSchema);
