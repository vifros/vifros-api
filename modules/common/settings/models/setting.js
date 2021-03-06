var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var SettingSchema = new Schema({
  // Read-only.
  module     : {
    type    : String,
    required: true,
    select  : false
  },
  /*
   * Read-only.
   * Unique per module basis. Already guaranteed by not allowing to create new settings.
   */
  name       : {
    type    : String,
    required: true
  },
  value      : {
    type    : Schema.Types.Mixed, // To being able to save a commodity of values (strings & objects).
    required: true
  },
  description: String
});

exports.Setting = mongoose.model('Setting', SettingSchema);

exports.statuses = {
  enabled : 'enabled',
  disabled: 'disabled'
};