var config = require('../../../config');

var Address = require('../../../models/interfaces/address').Address;
var VLAN = require('../../../models/interfaces/vlan').VLAN;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
	res.type('application/vnd.api+json');

	/*
	 * Check for document inclusion.
	 */
	var requested_docs_to_include = req.query.include;
	var is_addresses_requested = false;

	/*
	 * Check if addresses documents were requested too.
	 */
	if (typeof requested_docs_to_include != 'undefined'
		&& requested_docs_to_include.split(',').indexOf('addresses') != -1) {

		is_addresses_requested = true;
	}

	var json_api_body = {
		links: {
			vlans            : req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans' + '/' + '{vlans.id}',
			'vlans.addresses': req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans' + '/' + '{vlans.id}' + '/addresses'
		},
		vlans: []
	};

	/*
	 * Add linked data if was requested to response.
	 */
	if (is_addresses_requested) {
		json_api_body.links['vlans.addresses'] = {
			href: req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/vlans/{vlans.id}/addresses/{vlans.addresses.id}',
			type: 'addresses'
		};

		json_api_body['linked'] = {
			addresses: []
		};
	}

	var json_api_errors = {
		errors: []
	};

	VLAN.findById(req.params.vlan, function (error, doc) {
		if (error) {
			logger.error(error.message, {
				module: 'interfaces/vlans',
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
			/*
			 * Build JSON API response.
			 */
			var buffer = doc.toObject();
			buffer.id = doc._id;

			delete buffer._id;
			delete buffer.__v;

			json_api_body.vlans.push(buffer);

			if (!is_addresses_requested) {
				res.json(200, json_api_body); // OK.
			}
			else {
				Address.find({
					interface: buffer.interface + '.' + buffer.tag
				}, function (error, docs) {
					if (error) {
						logger.error(error.name, {
							module: 'interfaces/vlans',
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
						if (docs && docs.length) {
							for (var i = 0, j = docs.length;
							     i < j;
							     i++) {

								var buffer_address = docs[i].toObject();
								buffer_address.id = docs[i]._id;

								delete buffer_address._id;
								delete buffer_address.__v;

								var vlans_current_index = json_api_body.vlans.length - 1;

								if (!json_api_body.vlans[vlans_current_index].hasOwnProperty('links')) {
									json_api_body.vlans[vlans_current_index]['links'] = {};
								}

								if (!json_api_body.vlans[vlans_current_index]['links'].hasOwnProperty('addresses')) {
									json_api_body.vlans[vlans_current_index].links['addresses'] = [];
								}

								json_api_body.vlans[vlans_current_index].links.addresses.push({
									id  : buffer_address.id,
									type: 'addresses'
								});

								json_api_body.linked.addresses.push(buffer_address);
							}
						}

						res.json(200, json_api_body); // OK.
					}
				});
			}
		}
		else {
			res.json(404, json_api_body); // Not found.
		}
	});
};