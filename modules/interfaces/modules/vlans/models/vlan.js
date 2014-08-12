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
    // Readonly.
    operational: {
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
  // Readonly.
  interface  : {
    type    : String,
    required: true
  },
  // Readonly.
  tag        : {
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
VLANSchema.statics.validate = statics.validate;

exports.VLAN = mongoose.model('VLAN', VLANSchema);