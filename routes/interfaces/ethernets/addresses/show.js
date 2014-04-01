var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var Ethernet = require('../../../../models/interfaces/ethernet').Ethernet;

var addresses_index = require('../../addresses/index');

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_errors = {
		errors: []
	};

	try {
		/*
		 * Delegate the responsibility to send the response to this method.
		 */
		addresses_index(req, res, {
			filter  : {
				address: req.params.address
			},
			base_url: '/ethernets/' + req.params.ethernet
		});
	}
	catch (error) {
		logger.error(error.name, {
			module: 'interfaces/ethernets',
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