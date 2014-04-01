var async = require('async');

var config = require('../../../config');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;

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
		links   : {
			settings: req.protocol + '://' + req.get('Host') + config.api.prefix + options.base_url + '/settings/{settings.name}'
		},
		settings: []
	};

	var json_api_errors = {
		errors: []
	};

	var filter = {};
	if (is_public_call && typeof options.filter != 'undefined') {
		filter = options.filter;
	}

	Setting.find(filter, function (error, docs) {
		if (error) {
			logger.error(error.message, {
				module: 'common/settings',
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

				json_api_body.settings.push(buffer);

				cb_each(null);
			}, function (error) {
				if (error) {
					logger.error(error, {
						module: 'common/settings',
						tags  : [
							log_tags.api_request
						]
					});

					json_api_errors.errors.push({
						code   : '',
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