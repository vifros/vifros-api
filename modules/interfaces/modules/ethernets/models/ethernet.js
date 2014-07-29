var link_statuses = require('iproute').link.utils.statuses;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./ethernet-statics');

/*
 * Schema definition.
 */
var EthernetSchema = new Schema({
  status     : {
    admin      : {
      type    : String,
      enum    : [
        link_statuses.UP,
        link_statuses.DOWN
      ],
      default : link_statuses.UP,
      required: true
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
  mtu        : Number,
  description: String
});

/*
 * Static definitions.
 */
EthernetSchema.statics.setMonitor = statics.setMonitor;
EthernetSchema.statics.validate = statics.validate;

exports.Ethernet = mongoose.model('Ethernet', EthernetSchema);