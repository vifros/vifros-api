var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Tunable = require('../../../models/system/tunable').Tunable;

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_errors = {
		errors: []
	};

	Tunable.findByIdAndRemove(req.params.tunable, function (error) {
		if (error) {
			logger.error(error.message, {
				module: 'system/tunables',
				tags  : [
					log_tags.api_request,
					log_tags.db
				]
			});

			json_api_errors.errors.push({
				code   : error.name,
				field  : '',
				message: error.message
			});

			res.json(500, json_api_errors); // Internal Server Error.
		}
		else {
			res.send(204); // No Content.
		}
	});
};