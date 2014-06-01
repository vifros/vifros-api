var link_statuses = require('iproute').link.utils.statuses;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./vlan-statics');

/*
 * Schema definition.
 */
var VLANSchema = new Schema({
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
    operational: { // Readonly from user perspective.
      type: String,
      enum: [
        link_statuses.UP,
        link_statuses.DOWN,
        link_statuses.UNKNOWN,
        link_statuses.NOTPRESENT,
        link_statuses.LOWERLAYERDOWN
      ]
    }
  },
  interface  : { // Readonly after initially set.
    type    : String,
    required: true
  },
  tag        : { // Readonly after initially set.
    type    : Number,
    min     : 0,
    max     : 4095,
    unique  : true,
    required: true
  },
  description: String
});

/*
 * Static definitions.
 */
VLANSchema.statics.purgeFromOSandDB = statics.purgeFromOSandDB;
VLANSchema.statics.setMonitor = statics.setMonitor;

exports.VLAN = mongoose.model('VLAN', VLANSchema);