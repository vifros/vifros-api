var ip_link = require('iproute').link;
var link_statuses = ip_link.utils.statuses;

var Address = require('../../../models/interfaces/address').Address;
var VLAN = require('../../../models/interfaces/vlan').VLAN;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	var json_api_errors = {
		errors: []
	};

	VLAN.purgeFromOSandDB({
		filter: {
			_id: req.params.vlan
		}
	}, function (error, ret) {
		if (error) {
			for (var i = 0, j = ret.errors.length;
			     i < j;
			     i++) {

				json_api_errors.errors.push({
					code   : ret.errors[i].code,
					field  : ret.errors[i].field,
					message: ret.errors[i].message
				});
			}

			res.json(ret.server_code, json_api_errors);
		}
		else {
			res.send(ret.server_code);
		}
	});
};