var link_statuses = require('iproute').link.utils.statuses;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./loopback-statics');

/*
 * Schema definition.
 */
var LoopbackSchema = new Schema({
  status     : {
    admin      : {
      type   : String,
      enum   : [
        link_statuses.UP,
        link_statuses.DOWN
      ],
      default: link_statuses.UP
    },
    // Readonly.
    operational: {
      type: String,
      enum: [
        link_statuses.UP,
        link_statuses.DOWN,
        link_statuses.UNKNOWN,
        link_statuses.NOTPRESENT
      ]
    }
  },
  // Readonly.
  name       : {
    type    : String,
    unique  : true,
    required: true
  },
  mac        : {
    type : String,
    match: /^([0-9a-f]{2}([:-]|$)){6}$/i
  },
  mtu        : {
    type: Number,
    min : 0
  },
  description: String
});

/*
 * Static definitions.
 */
LoopbackSchema.statics.setMonitor = statics.setMonitor;
LoopbackSchema.statics.validate = statics.validate;

exports.Loopback = mongoose.model('Loopback', LoopbackSchema);