var async = require('async');

var ip_link = require('iproute').link;
var link_statuses = require('iproute').link.utils.statuses;

var Address = require('./address').Address;

/*
 * Removes all filtered VLANs from DB and OS.
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
			 * Remove the VLANs from OS.
			 */
			async.each(docs, function (item, cb_each) {
				/*
				 * Check if they are present in OS or not.
				 */
				if (item.status.operational == link_statuses.NOTPRESENT) {
					/*
					 * Only remove it from DB and its related addresses.
					 */
					item.remove(function (error) {
						if (error) {
							cb_each({
								server_code: 500, // Internal Server Error.
								errors     : [
									{
										code   : '',
										field  : '',
										message: error.message
									}
								]
							});
						}
						else {
							/*
							 * Delete associated addresses in DB.
							 * There is no need to delete them from OS since it is automatically done.
							 */
							Address.remove({
								interface: item.interface + '.' + item.tag
							}, function (error) {
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
				else {
					/*
					 * Is present in OS.
					 */
					ip_link.delete({
						// These options are enough to delete the interface and since they are required is safe to use them directly.
						dev: item.interface + '.' + item.tag
					}, function (error) {
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
							 * Delete the VLAN in DB.
							 */
							item.remove(function (error) {
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
									/*
									 * Delete associated addresses in DB.
									 * There is no need to delete them from OS since it is automatically done.
									 */
									Address.remove({
										interface: item.interface + '.' + item.tag
									}, function (error) {
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