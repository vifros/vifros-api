var routing_tables = require('iproute').utils.routing_tables;

var config = require('../../../../config');

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var StaticRoutingTable = require('../../../../models/routing/static/table').StaticRoutingTable;

module.exports = function (req, res) {
	if (!req.is('application/vnd.api+json')) {
		res.send(415); // Unsupported Media Type.
	}
	else {
		res.type('application/vnd.api+json');

		var json_api_body = {
			links : {
				tables: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/{tables.id}'
			},
			tables: []
		};

		var json_api_errors = {
			errors: []
		};

		/*
		 * Check for required values.
		 */
		var failed_required_fields = [];

		if (typeof req.body.tables[0].id == 'undefined') {
			failed_required_fields.push('id');
		}
		if (typeof req.body.tables[0].name == 'undefined') {
			failed_required_fields.push('name');
		}

		if (failed_required_fields.length) {
			// Build the error response with the required fields.
			for (var i = 0, j = failed_required_fields.length;
			     i < j;
			     i++) {

				json_api_errors.errors.push({
					code   : 'required_field',
					field  : failed_required_fields[i],
					message: 'Required field was not provided.'
				});
			}

			res.json(400, json_api_errors); // Bad Request.
		}
		else {
			/*
			 * Check if there is already a table with the same id or name.
			 */
			StaticRoutingTable.findOne({
				$or: [
					{
						id: req.body.tables[0].id
					},
					{
						name: req.body.tables[0].name
					}
				]
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
					/*
					 * There is already a table, so throw an error.
					 */
					json_api_errors.errors.push({
						code   : 'duplicated',
						field  : '',
						message: 'A table with the same data is already present.'
					});

					res.json(500, json_api_errors); // Internal Server Error.
				}
				else {
					var table = new StaticRoutingTable(req.body.tables[0]);

					routing_tables.add(table, function (error) {
						if (error) {
							logger.error(error, {
								module: 'routing/static/tables',
								tags  : [
									log_tags.api_request,
									log_tags.os
								]
							});

							json_api_errors.errors.push({
								code   : 'routing_tables',
								field  : '',
								message: error
							});

							res.json(500, json_api_errors); // Internal Server Error.
						}
						else {
							/*
							 * Save changes to database.
							 */
							table.save(function (error) {
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
								else {
									var item_to_send = req.body.tables[0];

									item_to_send.href = req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/tables/' + table.id;

									res.location(item_to_send.href);

									/*
									 * Build JSON API response.
									 */
									json_api_body.tables = [];
									json_api_body.tables.push(item_to_send);

									res.json(200, json_api_body); // OK.
								}
							});
						}
					});
				}
			});
		}
	}
};