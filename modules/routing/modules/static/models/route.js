var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var address_scopes = require('iproute').address.utils.scopes;
var route_types = require('iproute').route.utils.types;

var statics = require('./route-statics');

/*
 * Schema definition.
 */
var StaticRoutingRouteSchema = new Schema({
  // The pair table:to have to be unique.
  // Read-only.
  to         : {
    type    : String,
    required: true
  },
  type       : {
    type   : String,
    enum   : [
      route_types.unicast,
      route_types.unreachable,
      route_types.blackhole,
      route_types.prohibit,
      route_types.local,
      route_types.broadcast,
      route_types.throw,
      route_types.nat,
      route_types.anycast,
      route_types.multicast
    ],
    default: route_types.unicast
  },
  tos        : String,
  dsfield    : String,
  metric     : {
    type: Number,
    min : 0,
    max : 4294967296 // 2 ^ 32
  },
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
  scope      : {
    type: String,
    enum: [
      address_scopes.host,
      address_scopes.link,
      address_scopes.global,
      address_scopes.nowhere,
      address_scopes.site
    ]
  },
  protocol   : String,
  description: String
});

/*
 * Static definitions.
 */
StaticRoutingRouteSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;
StaticRoutingRouteSchema.statics.validate = statics.validate;

exports.StaticRoutingRoute = mongoose.model('StaticRoutingRoute', StaticRoutingRouteSchema);