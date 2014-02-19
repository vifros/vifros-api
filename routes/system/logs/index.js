var async = require('async');

var config = require('../../../config');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Log = require('../../../models/system/log').Log;

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_body = {
		links: {
			logs: req.protocol + '://' + req.get('Host') + config.api.prefix + '/system/logs' + '/' + '{logs.id}'
		},
		logs : []
	};

	var json_api_errors = {
		errors: []
	};

	Log.find({}, function (error, docs) {
		if (error) {
			logger.error(error.message, {
				module: 'system/logs',
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

				json_api_body.logs.push(buffer);

				cb_each(null);
			}, function (error) {
				if (error) {
					logger.error(error, {
						module: 'system/logs',
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