var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Schema definition.
 */
var TunableSchema = new Schema({
	path       : String,
	value      : String,
	description: String
});

/*
 * Methods definitions.
 *
 * Used to build the object dependant command line strings.
 */
TunableSchema.methods.os_apply = function os_apply() {
	return 'sysctl -w ' + this.path + '=' + this.value;
};

exports.Tunable = mongoose.model('Tunable', TunableSchema);