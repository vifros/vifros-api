var async = require('async');

var config = require('../../../config');

var Address = require('../../../models/interfaces/address').Address;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res, options) {
	res.type('application/vnd.api+json');

	/*
	 * Check for external calling.
	 */
	var is_public_call = false;
	if (typeof options == 'object') {
		is_public_call = true;
	}

	var json_api_body = {
		links    : {
			addresses: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces' + options.base_url + '/addresses/{addresses.address}'
		},
		addresses: []
	};

	var json_api_errors = {
		errors: []
	};

	var filter = {};
	if (is_public_call && typeof options.filter != 'undefined') {
		filter = options.filter;
	}

	Address.find(filter, function (error, docs) {
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
		else if (docs && docs.length) {
			async.each(docs, function (item, cb_each) {
				var buffer = item.toObject();
				buffer.id = item._id;

				delete buffer._id;
				delete buffer.__v;

				json_api_body.addresses.push(buffer);

				cb_each(null);
			}, function (error) {
				if (error) {
					logger.error(error.message, {
						module: 'interfaces/addresses',
						tags  : [
							log_tags.api_request
						]
					});

					json_api_errors.errors.push({
						code   : 'unclassified',
						field  : '',
						message: error
					});

					res.json(500, json_api_errors); // Internal Server Error.
				}
				else {
					res.json(200, json_api_body); // OK.
				}
			});
		}
		else {
			res.json(404, json_api_body); // Not found.
		}
	});
};