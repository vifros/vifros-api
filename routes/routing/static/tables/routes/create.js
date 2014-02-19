var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var StaticRoutingTable = require('../../../../../models/routing/static/table').StaticRoutingTable;

var routes_create = require('../../routes/create');

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_errors = {
		errors: []
	};

	StaticRoutingTable.findOne({
		id: req.params.table
	}, function (error, doc) {
		if (error) {
			logger.error(error.message, {
				module: 'routing/static/tables',
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
		else if (doc) {
			try {
				/*
				 * Delegate the responsibility to send the response to this method.
				 */
				routes_create(req, res, {
					base_url: '/tables/' + req.params.table
				});
			}
			catch (error) {
				logger.error(error.message, {
					module: 'routing/static/tables',
					tags  : [
						log_tags.api_request
					]
				});

				json_api_errors.errors.push({
					code   : error.name,
					field  : '',
					message: error.message
				});

				res.json(500, json_api_errors); // Internal Server Error.
			}
		}
		else {
			res.send(404); // Not found.
		}
	});
};