var config = require('../../config');

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_body = {
		links: {
			logs    : req.protocol + '://' + req.get('Host') + config.api.prefix + '/system/logs',
			tunables: req.protocol + '://' + req.get('Host') + config.api.prefix + '/system/tunables'
		}
	};

	res.json(200, json_api_body); // OK.
};