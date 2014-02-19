var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var Setting = require('../../../../models/common/setting').Setting;

var startup = require('./startup');
var install = require('./install');

module.exports = function (cb_init) {
	Setting.findOne({
		module: 'routing/static/tables',
		name  : 'status'
	}, function (error, doc) {
		if (error) {
			logger.error(error.message, {
				module: 'routing/static/tables',
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
			 */
			install(cb_init);
		}
	});
};