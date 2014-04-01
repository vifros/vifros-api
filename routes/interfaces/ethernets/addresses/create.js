var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var Ethernet = require('../../../../models/interfaces/ethernet').Ethernet;

var addresses_create = require('../../addresses/create');

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_errors = {
		errors: []
	};

	Ethernet.findOne({
		name: req.params.ethernet
	}, function (error, doc) {
		if (error) {
			logger.error(error.name, {
				module: 'interfaces/ethernets',
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
				addresses_create(req, res, {
					interface: req.params.ethernet,
					base_url : '/ethernets/' + req.params.ethernet
				});
			}
			catch (error) {
				logger.error(error.name, {
					module: 'interfaces/ethernets',
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