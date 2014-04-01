var ip_rule = require('iproute').rule;

var config = require('../../../../config');

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var StaticRoutingTable = require('../../../../models/routing/static/table').StaticRoutingTable;
var StaticRoutingRule = require('../../../../models/routing/static/rule').StaticRoutingRule;

module.exports = function (req, res) {
	if (!req.is('application/vnd.api+json')) {
		res.send(415); // Unsupported Media Type.
	}
	else {
		res.type('application/vnd.api+json');

		var json_api_body = {
			links: {
				rules: req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/rules/{rules.priority}'
			},
			rules: []
		};

		var json_api_errors = {
			errors: []
		};

		/*
		 * Check for required values.
		 */
		var failed_required_fields = [];

		if (typeof req.body.rules[0].type == 'undefined') {
			failed_required_fields.push('type');
		}
		if (typeof req.body.rules[0].priority == 'undefined') {
			failed_required_fields.push('priority');
		}
		if (typeof req.body.rules[0].table == 'undefined') {
			failed_required_fields.push('table');
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
			 * Check if the table exists.
			 */
			StaticRoutingTable.findOne({
				id: req.body.rules[0].table
			}, function (error, doc) {
				if (error) {
					logger.error(error.message, {
						module: 'routing/static/rules',
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
					 * Check if there is already a rule with the same priority.
					 */
					StaticRoutingRule.findOne({
						priority: req.body.rules[0].priority
					}, function (error, doc) {
						if (error) {
							logger.error(error.message, {
								module: 'routing/static/rules',
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
								field  : 'priority',
								message: 'A rule with the same data is already present.'
							});

							res.json(500, json_api_errors); // Internal Server Error.
						}
						else {
							var rule = new StaticRoutingRule(req.body.rules[0]);

							ip_rule.add(rule, function (error) {
								if (error) {
									logger.error(error, {
										module: 'routing/static/rules',
										tags  : [
											log_tags.api_request,
											log_tags.os
										]
									});

									json_api_errors.errors.push({
										code   : 'iproute',
										field  : '',
										message: error
									});

									res.json(500, json_api_errors); // Internal Server Error.
								}
								else {
									/*
									 * Save changes to database.
									 */
									rule.save(function (error) {
										if (error) {
											logger.error(error.message, {
												module: 'routing/static/rules',
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
											var item_to_send = req.body.rules[0];

											item_to_send.href = req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing/static/rules/' + rule.priority;
											item_to_send.id = rule._id;

											res.location(item_to_send.href);

											/*
											 * Build JSON API response.
											 */
											json_api_body.rules = [];
											json_api_body.rules.push(item_to_send);

											res.json(200, json_api_body); // OK.
										}
									});
								}
							});
						}
					});
				}
				else {
					json_api_errors.errors.push({
						code   : 'not_found',
						field  : 'table',
						message: 'The provided table does not exists yet.'
					});

					res.json(500, json_api_errors); // Internal Server Error.
				}
			});
		}
	}
};