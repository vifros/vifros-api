var async = require('async');

var ip_link = require('iproute').link;
var link_vl_types = ip_link.utils.vl_types;
var link_statuses = ip_link.utils.statuses;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Address = require('../../../models/interfaces/address').Address;
var VLAN = require('../../../models/interfaces/vlan').VLAN;

module.exports = function (cb_init) {
	/*
	 * Already initialized.
	 */
	async.waterfall([
		function (cb_waterfall) {
			/*
			 * Flush all OS VLANs.
			 */
			ip_link.show(function (error, links) {
				if (error) {
					cb_waterfall(error);
				}
				else {
					async.each(links, function (item, cb_each) {
						if (!item.hasOwnProperty('vl_type')
							|| item.vl_type != link_vl_types.vlan) {

							cb_each(null);
						}
						else {
							/*
							 * Is a valid VLAN so remove it.
							 */
							ip_link.delete({
								dev: item.name
							}, function (error) {
								if (error) {
									logger.error(error, {
										module: 'interfaces/vlans',
										tags  : [
											log_tags.init,
											log_tags.os
										]
									});

									cb_each(error);
								}
								else {
									cb_each(null);
								}
							});
						}
					}, function (error) {
						if (error) {
							cb_waterfall(error);
						}
						else {
							cb_waterfall(null, links);
						}
					});
				}
			});
		},
		function (links, cb_waterfall) {
			/*
			 * Insert the DB VLANs in the OS.
			 *
			 * Get all rules from DB.
			 */
			VLAN.find({}, function (error, docs) {
				if (error) {
					logger.error(error, {
						module: 'interfaces/vlans',
						tags  : [
							log_tags.init,
							log_tags.os
						]
					});

					cb_waterfall(error);
				}
				else if (docs && docs.length) {
					async.each(docs, function (item, cb_each) {
						var is_parent_present = links.some(function (iface) {
							return iface.name == item.interface;
						});

						if (!is_parent_present) {
							item.status.operational = link_statuses.NOTPRESENT;

							item.save(function (error) {
								if (error) {
									logger.error(error, {
										module: 'interfaces/vlans',
										tags  : [
											log_tags.init,
											log_tags.os
										]
									});

									cb_each(error);
								}
								else {
									cb_each(null);
								}
							});
						}
						else {
							/*
							 * Insert the VLAN into the system.
							 */
							ip_link.add({
								link     : item.interface,
								name     : item.interface + '.' + item.tag,
								state    : item.status.admin,
								type     : link_vl_types.vlan,
								type_args: [
									{
										id: item.tag
									}
								]
							}, function (error) {
								if (error) {
									logger.error(error, {
										module: 'interfaces/vlans',
										tags  : [
											log_tags.init,
											log_tags.os
										]
									});

									cb_each(error);
								}
								else {
									/*
									 * Search its current operational state after the change and update db with it.
									 * This is so the state still can be different than the desired one by the admin.
									 */
									ip_link.show({
										dev: item.interface + '.' + item.tag
									}, function (error, links) {
										if (error) {
											logger.error(error, {
												module: 'interfaces/vlans',
												tags  : [
													log_tags.init,
													log_tags.os
												]
											});

											cb_each(error);
										}
										else {
											item.status.operational = links[0].state;

											item.save(function (error) {
												if (error) {
													cb_each(error);
												}
												else {
													/*
													 * Overwrites OS addresses with DB ones.
													 */
													Address.createFromDBtoOS({
														filter: {
															interface: item.interface + '.' + item.tag
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
					}, function (error) {
						if (error) {
							cb_waterfall(error);
						}
						else {
							cb_waterfall(null);
						}
					});
				}
				else {
					cb_waterfall(null);
				}
			});
		}
	], function (error) {
		if (error) {
			logger.error(error, {
				module: 'interfaces/vlans',
				tags  : [
					log_tags.init
				]
			});

			cb_init(error);
		}
		else {
			logger.info('Module started.', {
				module: 'interfaces/vlans',
				tags  : [
					log_tags.init
				]
			});

			cb_init(null);
		}
	});
};