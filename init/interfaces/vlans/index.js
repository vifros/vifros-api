var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;
var setting_statuses = require('../../../models/common/setting').statuses;

var startup = require('./startup');

module.exports = function (cb_init) {
	Setting.findOne({
		module: 'interfaces/vlans',
		name  : 'status'
	}, function (error, doc) {
		if (error) {
			logger.error(error.message, {
				module: 'interfaces/vlans',
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
			startup(cb_init);
		}
		else {
			/*
			 * Not yet initialized.
			 * Just save the setting and do nothing since there are nothing to be installed nor detected.
			 */
			var setting = new Setting({
				module: 'interfaces/vlans',
				name  : 'status',
				value : setting_statuses.enabled
			});

			setting.save(function (error) {
				if (error) {
					logger.error(error, {
						module: 'interfaces/vlans',
						tags  : [
							log_tags.init,
							log_tags.db
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
		}
	});
};