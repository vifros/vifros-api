var async = require('async');

var ip_link = require('iproute').link;
var link_types = ip_link.utils.types;
var link_statuses = ip_link.utils.statuses;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Address = require('../../../models/interfaces/address').Address;
var Ethernet = require('../../../models/interfaces/ethernet').Ethernet;

module.exports = function (cb_init) {
	/*
	 * Already initialized.
	 */
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
					 */
					Ethernet.findOne({
						name: item.name
					}, function (error, doc) {
						if (error) {
							cb_each(error);
						}
						else if (doc) {
							/*
							 * B: Is in OS and in DB.
							 * Overwrite OS with DB config.
							 *
							 * Compatibilize names.
							 */
							var item_to_exec = JSON.parse(JSON.stringify(doc));

							item_to_exec.dev = doc.name;
							delete item_to_exec.name; // Since it conflicts when trying to insert it to devices.

							item_to_exec.state = doc.status.admin;
							delete item_to_exec.status;

							ip_link.set(item_to_exec, function (error) {
								if (error) {
									cb_each(error);
								}
								else {
									/*
									 * Search its current operational state after the change and update db with it.
									 * This is so the state still can be different than the desired one by the admin.
									 */
									ip_link.show({
										dev: item_to_exec.dev
									}, function (error, links) {
										if (error) {
											cb_each(error);
										}
										else {
											doc.status.operational = links[0].state;

											doc.save(function (error) {
												if (error) {
													cb_each(error);
												}
												else {
													/*
													 * Overwrites OS addresses with DB ones.
													 */
													Address.createFromDBtoOS({
														filter: {
															interface: item_to_exec.dev
														}
													}, function (error) {
														if (error) {
															cb_each(error);
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
							});
						}
						else {
							/*
							 * A: Is in OS and not in DB.
							 * Add it to DB.
							 *
							 * Compatibilize names.
							 */
							item.status = {
								operational: item.state
							};

							var ethernet = new Ethernet(item);

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
											cb_init(error);
										}
										else {
											cb_init(error);
										}
									});
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
					Ethernet.find({}, function (error, docs) {
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
						else if (docs && docs.length) {
							async.each(docs, function (item, cb_each) {
								var is_not_present = true;

								for (var i = 0, j = links.length;
								     i < j;
								     i++) {

									if (item.name == links[i].name) {
										is_not_present = false;
									}
								}

								if (is_not_present) {
									/*
									 * C: Is not in OS but it is in DB.
									 * Set NOT PRESENT state.
									 */
									item.status.operational = link_statuses.NOTPRESENT;

									item.save(function (error) {
										if (error) {
											cb_each(error);
										}
										else {
											cb_each(null);
										}
									});
								}
								else {
									cb_each(null);
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
						else {
							/*
							 * D: Is neither in OS or DB.
							 * Do nothing.
							 * This is so since if there was an interface present in the OS in the previous steps it had to have to be already in DB.
							 * And since there is nothing in DB the condition is meet.
							 */
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