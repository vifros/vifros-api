var async = require('async');

var ip_rule = require('iproute').rule;

/*
 * Removes all filtered rules from DB and OS.
 */
exports.purgeFromOSandDB = function (options, cb) {
	var self = this;

	this.find(options.filter, function (error, docs) {
		if (error) {
			cb({
				server_code: 500, // Internal Server Error.
				errors     : [
					{
						code   : error.name,
						field  : '',
						message: error.message
					}
				]
			});
		}
		else if (docs && docs.length) {
			/*
			 * Remove the rule from OS.
			 */
			async.each(docs, function (item, cb_each) {
				if (item.priority == '0') {
					cb_each({
						server_code: 403, // Forbidden.
						errors     : [
							{
								code   : 'readonly_field',
								field  : '',
								message: 'The rule is readonly and can not be deleted.'
							}
						]
					});
				}
				else {
					/*
					 * Remove the rule from OS.
					 */
					ip_rule.delete(item, function (error) {
						if (error) {
							cb_each({
								server_code: 500, // Internal Server Error.
								errors     : [
									{
										code   : 'iproute',
										field  : '',
										message: error
									}
								]
							});
						}
						else {
							/*
							 * Delete rule in DB.
							 */
							self.findByIdAndRemove(item._id, function (error) {
								if (error) {
									cb_each({
										server_code: 500, // Internal Server Error.
										errors     : [
											{
												code   : error.name,
												field  : '',
												message: error.message
											}
										]
									});
								}
								else {
									cb_each(null);
								}
							});
						}
					});
				}
			}, function (error) {
				if (error) {
					cb(error);
				}
				else {
					cb(null, {
						server_code: 204 // No Content.
					});
				}
			});
		}
		else {
			cb(null, {
				server_code: 404 // Not found.
			});
		}
	});
};