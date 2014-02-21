var async = require('async');

var ip_forward = require('iproute').utils.ip_forward;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;

module.exports = function (cb_init) {
	/*
	 * Already initialized.
	 */
	// Overwrites OS settings with DB ones.
	async.parallel([
		function (cb_parallel) {
			Setting.findOne({
				module: 'routing/settings',
				name  : 'ip_forward_v4'
			}, function (error, doc) {
				if (error) {
					cb_parallel(error);
				}
				else if (doc.value == '0') {
					ip_forward.v4.disable(function (error) {
						if (error) {
							cb_parallel(error);
						}
						else {
							cb_parallel(null);
						}
					});
				}
				else if (doc.value == '1') {
					ip_forward.v4.enable(function (error) {
						if (error) {
							cb_parallel(error);
						}
						else {
							cb_parallel(null);
						}
					});
				}
				else {
					cb_parallel('Error: invalid ip_forward_v4 value, has to be 0 or 1 and it is: ' + doc.value);
				}
			});
		},
		function (cb_parallel) {
			Setting.findOne({
				module: 'routing/settings',
				name  : 'ip_forward_v6'
			}, function (error, doc) {
				if (error) {
					cb_parallel(error);
				}
				else if (doc.value == '0') {
					ip_forward.v6.disable(function (error) {
						if (error) {
							cb_parallel(error);
						}
						else {
							cb_parallel(null);
						}
					});
				}
				else if (doc.value == '1') {
					ip_forward.v6.enable(function (error) {
						if (error) {
							cb_parallel(error);
						}
						else {
							cb_parallel(null);
						}
					});
				}
				else {
					cb_parallel('Error: invalid ip_forward_v6 value, has to be 0 or 1 and it is: ' + doc.value);
				}
			});
		}
	],
		function (error) {
			if (error) {
				logger.error(error, {
					module: 'routing/settings',
					tags  : [
						log_tags.init
					]
				});

				cb_init(error);
			}
			else {
				logger.info('Module started.', {
					module: 'routing/settings',
					tags  : [
						log_tags.init
					]
				});

				cb_init(null);
			}
		});
};