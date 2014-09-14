var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./tunable-statics');

/*
 * Schema definition.
 */
var TunableSchema = new Schema({
  // Read-only.
  path       : {
    type    : String,
    required: true,
    unique  : true
  },
  value      : {
    // Read-only.
    original: {
      type    : String,
      required: true
    },
    current : {
      type    : String,
      required: true
    }
  },
  description: String
});

/*
 * Static definitions.
 */
TunableSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;
TunableSchema.statics.validate = statics.validate;

exports.Tunable = mongoose.model('Tunable', TunableSchema);