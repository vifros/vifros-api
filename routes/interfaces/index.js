var config = require('../../config');

// TODO: Define how to return the interfaces list with its homogeneous attributes: id, type, status, name, description.
// TODO: I think the best would be to return all kind of interfaces. See how do it.
module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_body = {
		links: {
			ethernets: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/ethernets',
			loopbacks: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/loopbacks',
			vlans    : req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans'
		}
	};

	res.json(200, json_api_body); // OK.
};