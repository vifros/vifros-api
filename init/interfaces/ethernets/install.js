var async = require('async');

var ip_link = require('iproute').link;
var link_types = ip_link.utils.types;
var link_statuses = ip_link.utils.statuses;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;
var setting_statuses = require('../../../models/common/setting').statuses;

var Address = require('../../../models/interfaces/address').Address;
var Ethernet = require('../../../models/interfaces/ethernet').Ethernet;

module.exports = function (cb_init) {
	/*
	 * Not yet initialized.
	 */
	// Get the data for the currently list of installed devices.
	ip_link.show(function (error, links) {
		if (error) {
			logger.error(error, {
				module: 'interfaces/ethernets',
				tags  : [
					log_tags.init,
					log_tags.os
				]
			});

			cb_init(error);
		}
		else {
			async.each(links, function (item, cb_each) {
				if (item.type != link_types.ethernet
					|| item.hasOwnProperty('vl_type')) { // Due virtual links specifics they are handled on they own modules.

					cb_each(null);
				}
				else {
					/*
					 * Is a valid device so process it.
					 *
					 * Compatibilize fields.
					 */
					item.status = {
						operational: item.state,
						admin      : (item.state == link_statuses.UP || item.state == link_statuses.DOWN)
							? item.state
							: link_statuses.UP
					};

					var ethernet = new Ethernet(item);

					/*
					 * Save it to DB.
					 */
					ethernet.save(function (error) {
						if (error) {
							cb_each(error);
						}
						else {
							/*
							 * Detect OS addresses and insert them to DB.
							 */
							Address.createFromOStoDB({
								filter: {
									interface: item.name
								}
							}, function (error) {
								if (error) {
									cb_each(error);
								}
								else {
									cb_each(error);
								}
							});
						}
					});
				}
			}, function (error) {
				if (error) {
					logger.error(error, {
						module: 'interfaces/ethernets',
						tags  : [
							log_tags.init
						]
					});

					cb_init(error);
				}
				else {
					var setting = new Setting({
						module: 'interfaces/ethernets',
						name  : 'status',
						value : setting_statuses.enabled
					});

					setting.save(function (error) {
						if (error) {
							logger.error(error, {
								module: 'interfaces/ethernets',
								tags  : [
									log_tags.init,
									log_tags.db
								]
							});

							cb_init(error);
						}
						else {
							logger.info('Module started.', {
								module: 'interfaces/ethernets',
								tags  : [
									log_tags.init
								]
							});

							cb_init(null);
						}
					});
				}
			});
		}
	});
};