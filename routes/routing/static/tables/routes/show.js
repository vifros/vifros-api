var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var StaticRoutingTable = require('../../../../../models/routing/static/table').StaticRoutingTable;

var routes_index = require('../../routes/index');

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_errors = {
		errors: []
	};

	try {
		/*
		 * Delegate the responsibility to send the response to this method.
		 */
		routes_index(req, res, {
			filter  : {
				_id: req.params.route
			},
			base_url: '/tables/' + req.params.table
		});
	}
	catch (error) {
		logger.error(error.name, {
			module: 'routing/static/tables',
			tags  : [
				log_tags.api_request,
				log_tags.cross_rel
			]
		});

		json_api_errors.errors.push({
			code   : error.name,
			field  : '',
			message: error.message
		});

		res.json(500, json_api_errors); // Internal Server Error.
	}
};