var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statics = require('./tunable-statics');

/*
 * Schema definition.
 */
var TunableSchema = new Schema({
  path       : String,
  value      : String,
  description: String
});

/*
 * Static definitions.
 */
TunableSchema.statics.createFromObjectToOS = statics.createFromObjectToOS;

exports.Tunable = mongoose.model('Tunable', TunableSchema);