var ip_address = require('iproute').address;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var config = require('../../../config');

var Address = require('../../../models/interfaces/address').Address;

module.exports = function (req, res, options) {
	if (!req.is('application/vnd.api+json')) {
		res.send(415); // Unsupported Media Type.
	}
	else {
		res.type('application/vnd.api+json');

		var json_api_body = {
			links    : {
				addresses: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces' + options.base_url + '/addresses/{addresses.address}'
			},
			addresses: []
		};

		var json_api_errors = {
			errors: []
		};

		/*
		 * Check for required values.
		 */
		var failed_required_fields = [];

		if (typeof req.body.addresses[0].address == 'undefined') {
			failed_required_fields.push('address');
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
			 * Add the needed key aliases.
			 */
			var doc_req = req.body.addresses[0];

			doc_req['dev'] = doc_req['interface'] = options.interface;
			doc_req['local'] = doc_req.address;

			var address = new Address(doc_req);

			ip_address.add(doc_req, function (error) {
				if (error) {
					logger.error(error, {
						module: 'interfaces/addresses',
						tags  : [
							log_tags.api_request
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
					address.save(function (error) {
						if (error) {
							logger.error(error.message, {
								module: 'interfaces/addresses',
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
							var item_to_send = req.body.addresses[0];

							/*
							 * Clean unneeded alias.
							 */
							delete item_to_send.dev;
							delete item_to_send.local;

							item_to_send.href = req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces' + options.base_url + '/addresses/' + encodeURIComponent(address.address);
							item_to_send.id = address._id;

							res.location(item_to_send.href);

							/*
							 * Build JSON API response.
							 */
							json_api_body.addresses = [];
							json_api_body.addresses.push(item_to_send);

							res.json(200, json_api_body); // OK.
						}
					});
				}
			});
		}
	}
};