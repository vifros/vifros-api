var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var IPSetSchema = new Schema({
  name       : {
    type    : String,
    required: true
  },
  type       : {
    type    : String,
    enum    : [
      'bitmap:ip',
      'bitmap:ip,mac',
      'bitmap:port',

      'hash:ip',
      'hash:net',
      'hash:ip,port',
      'hash:net,port',
      'hash:ip,port,ip',
      'hash:ip,port,net',
      'hash:net,iface',

      'list:set',
    ],
    required: true
  },
  description: String
});

exports.IPSet = mongoose.model('IPSet', IPSetSchema);