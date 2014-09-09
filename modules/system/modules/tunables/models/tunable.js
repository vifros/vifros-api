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
    type    : String,
    required: true
  },
  description: String
});

/*
 * Static definitions.
 */
TunableSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;

exports.Tunable = mongoose.model('Tunable', TunableSchema);