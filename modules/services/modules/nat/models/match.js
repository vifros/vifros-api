var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var MatchSchema = new Schema({
  addrtype: {
    'src-type'       : {
      inverted: Boolean,
      value   : {
        type: String,
        enum: [
          'UNSPEC',
          'UNICAST',
          'LOCAL',
          'BROADCAST',
          'ANYCAST',
          'MULTICAST',
          'BLACKHOLE',
          'UNREACHABLE',
          'PROHIBIT',
          'THROW',
          'NAT',
          'XRESOLVE',
        ]
      }
    },
    'dst-type'       : {
      inverted: Boolean,
      value   : String
    },
    'limit-iface-in' : Boolean,
    'limit-iface-out': Boolean
  },
  ah      : {
    ahspi: {
      inverted: Boolean,
      value   : String
    },
    ahlen: {
      inverted: Boolean,
      value   : String
    },
    ahres: Boolean
  }
});

exports.MatchSchema = MatchSchema;