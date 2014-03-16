var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;
var Ethernet = require('../../../models/interfaces/ethernet').Ethernet;

var startup = require('./startup');
var install = require('./install');

module.exports = function (cb_init) {
	Setting.findOne({
		module: 'interfaces/ethernets',
		name  : 'status'
	}, function (error, doc) {
		if (error) {
			logger.error(error.message, {
				module: 'interfaces/ethernets',
				tags  : [
					log_tags.init,
					log_tags.db,
				]
			});

			cb_init(error);
		}
		else if (doc) {
			/*
			 * Already initialized.
			 */
			startup(function (error) {
				if (error) {
					cb_init(error);
				}
				else {
					/*
					 * Monitor changes on interface to update operational state.
					 */
					Ethernet.setMonitor(function (error) {
						if (error) {
							cb_init(error);
						}
						else {
							cb_init(null);
						}
					});
				}
			});
		}
		else {
			/*
			 * Not yet initialized.
			 */
			install(function (error) {
				if (error) {
					cb_init(error);
				}
				else {
					/*
					 * Monitor changes on interface to update operational state.
					 */
					Ethernet.setMonitor(function (error) {
						if (error) {
							cb_init(error);
						}
						else {
							cb_init(null);
						}
					});
				}
			});
		}
	});
};