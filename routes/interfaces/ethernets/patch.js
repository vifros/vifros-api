var jsonpatch = require('json-patch');

var ip_link = require('iproute').link;

var Ethernet = require('../../../models/interfaces/ethernet').Ethernet;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
	if (!req.is('application/json-patch+json')) {
		res.send(415); // Unsupported Media Type.
	}
	else {
		res.type('application/vnd.api+json');

		var json_api_errors = {
			errors: []
		};

		Ethernet.findById(req.params.ethernet, function (error, doc) {
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
				/*
				 * Validate received patch.
				 */
				// Prepare doc for patching.
				var doc_patch = {};

				var buffer = doc.toObject();

				delete buffer._id;
				delete buffer.__v;

				doc_patch.ethernets = [buffer];

				/*
				 * Add the not present variables since the patch needed those to work properly.
				 * Remember to remove the null variables later, after processing is done.
				 */
				var schema_vars = JSON.parse(JSON.stringify(Ethernet.schema.paths)); // This construction is to do a deep copy.
				delete schema_vars._id;
				delete schema_vars.__v;

				for (var i = 0, j = Object.keys(schema_vars).length;
				     i < j;
				     i++) {

					var key = Object.keys(schema_vars)[i];

					if (!doc_patch.ethernets[0].hasOwnProperty(key)) {
						doc_patch.ethernets[0][key] = null;
					}
				}

				try {
					jsonpatch.apply(doc_patch, req.body);
				}
				catch (error) {
					logger.error(error.name, {
						module: 'interfaces/ethernets',
						tags  : [
							log_tags.api_request,
							log_tags.validation
						]
					});

					json_api_errors.errors.push({
						code   : error.name,
						field  : '',
						message: error.message
					});

					res.json(400, json_api_errors); // Internal Server Error.

					return;
				}

				/*
				 * Remove the null variables needed by json-patch.
				 */
				for (var i = 0, j = Object.keys(doc_patch.ethernets[0]).length;
				     i < j;
				     i++) {

					var key = Object.keys(schema_vars)[i];

					if (doc_patch.ethernets[0][key] == null) {
						delete doc_patch.ethernets[0][key];
					}
				}

				var valid_changed_options = {};
				var readonly_changed_fields = [];
				for (var i = 0, j = req.body.length;
				     i < j;
				     i++) {

					var path = req.body[i].path.split('/ethernets/0/')[1];

					// Check for readonly params.
					if (path == 'name'
						|| path == 'status/operational') {
						readonly_changed_fields.push(path);
					}
					else {
						valid_changed_options[path] = req.body[i].value;
					}
				}

				if (readonly_changed_fields.length) {
					// There are requests to change readonly values, so throw an error.
					// Build the error response with the required fields.
					for (var i = 0, j = readonly_changed_fields.length;
					     i < j;
					     i++) {

						// TODO: See how log the errors here.

						json_api_errors.errors.push({
							code   : 'readonly_field',
							field  : readonly_changed_fields[i],
							message: 'The field is readonly and can not be changed.'
						});
					}

					res.json(400, json_api_errors); // Bad Request.
				}
				else if (Object.keys(valid_changed_options).length == 1
					&& valid_changed_options.hasOwnProperty('description')) {
					// If only the description was changed, only save it to DB without touching the OS.

					Ethernet.findByIdAndUpdate(req.params.ethernet, doc_patch.ethernets[0], function (error) {
						if (error) {
							logger.error(error, {
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
						else {
							res.send(204); // No Content.
						}
					});
				}
				else {
					/*
					 * Compatibilize attributes.
					 */
					doc_patch.ethernets[0].dev = doc_patch.ethernets[0].name;
					delete doc_patch.ethernets[0].name; // Since it clashes with another field name.

					doc_patch.ethernets[0].state = doc_patch.ethernets[0].status.admin;

					// Update the interface in the OS.
					ip_link.set(doc_patch.ethernets[0], function (error) {
						if (error) {
							logger.error(error, {
								module: 'interfaces/ethernets',
								tags  : [
									log_tags.api_request,
									log_tags.db
								]
							});

							json_api_errors.errors.push({
								code   : 'iproute',
								field  : '',
								message: error
							});

							res.json(500, json_api_errors); // Internal Server Error.
						}
						else {
							/*
							 * Search its current operational state after the change and update db with it.
							 * This is so the state still can be different than the desired one by the admin.
							 */
							ip_link.show({
								dev: doc_patch.ethernets[0].dev
							}, function (error, links) {
								if (error) {
									logger.error(error, {
										module: 'interfaces/ethernets',
										tags  : [
											log_tags.api_request,
											log_tags.db
										]
									});

									json_api_errors.errors.push({
										code   : 'iproute',
										field  : '',
										message: error
									});

									res.json(500, json_api_errors); // Internal Server Error.
								}
								else {
									doc_patch.ethernets[0].status.operational = links[0].state;

									Ethernet.findByIdAndUpdate(req.params.ethernet, doc_patch.ethernets[0], function (error) {
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
												message: error[0]
											});

											res.json(500, json_api_errors); // Internal Server Error.
										}
										else {
											res.send(204); // No Content.
										}
									});
								}
							});
						}
					});
				}
			}
			else {
				res.send(404); // Not found.
			}
		});
	}
};