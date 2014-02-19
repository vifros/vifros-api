var config = require('../config');

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_body = {
		meta : {
			name   : 'REST JSON API',
			version: '0.0.0'
		},
		links: {
			system    : req.protocol + '://' + req.get('Host') + config.api.prefix + '/system',
			interfaces: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces',
			routing   : req.protocol + '://' + req.get('Host') + config.api.prefix + '/routing'
		}
	};

	res.json(200, json_api_body); // OK.
};