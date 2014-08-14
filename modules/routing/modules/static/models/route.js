var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./route-statics');

/*
 * Schema definition.
 */
var StaticRoutingRouteSchema = new Schema({
  // Read-only.
  to         : {
    type    : String,
    required: true
  },
  type       : {
    type    : String,
    required: true
  },
  tos        : String,
  dsfield    : String,
  metric     : Number,
  preference : {
    type: Number,
    min : 0,
    max : 4294967296 // 2 ^ 32
  },
  table      : {
    type    : Number,
    min     : 0,
    max     : 2147483648, // 2 ^ 31
    required: true
  },
  dev        : String,
  via        : {
    type    : String,
    required: true
  },
  src        : String,
  realm      : String,
  mtu        : String,
  window     : Number,
  rtt        : String,
  rttvar     : String,
  rto_min    : String,
  ssthresh   : Number,
  cwnd       : Number,
  initcwnd   : Number,
  initrwnd   : Number,
  advmss     : Number,
  reordering : Number,
  nexthop    : [
    {
      via   : String,
      dev   : String,
      weight: Number
    }
  ],
  scope      : String,
  protocol   : String,
  description: String
});

/*
 * Static definitions.
 */
StaticRoutingRouteSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;
StaticRoutingRouteSchema.statics.validate = statics.validate;

exports.StaticRoutingRoute = mongoose.model('StaticRoutingRoute', StaticRoutingRouteSchema);