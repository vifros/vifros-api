var async = require('async');

var ip_rule = require('iproute').rule;

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var Setting = require('../../../../models/common/setting').Setting;
var setting_statuses = require('../../../../models/common/setting').statuses;

var package_defaults = require('./defaults');

var StaticRoutingRule = require('../../../../models/routing/static/rule').StaticRoutingRule;

module.exports = function (cb_init) {
	/*
	 * Not yet initialized.
	 */
	// Clear all OS rules. Note: this will clear all rules but the special priority 0 rule.
	ip_rule.flush(function (error) {
		if (error) {
			logger.error(error, {
				module: 'routing/static/rules',
				tags  : [
					log_tags.init,
					log_tags.os
				]
			});

			cb_init(error);
		}
		else {
			/*
			 * Add package defaults to OS.
			 */
			async.each(package_defaults.rules, function (item, cb_each) {
				/*
				 * Don't re-add the special priority 0 rule since it is read-only and never gets deleted from OS.
				 */
				if (item.priority != 0) {
					ip_rule.add(item, function (error) {
						if (error) {
							cb_each(error);
						}
						else {
							var rule = new StaticRoutingRule(item);

							// Save the object to database.
							rule.save(function (error) {
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
				else {
					var rule = new StaticRoutingRule(item);

					// Save the object to database.
					rule.save(function (error) {
						if (error) {
							cb_each(error);
						}
						else {
							cb_each(null);
						}
					});
				}
			}, function (error) {
				if (error) {
					logger.error(error, {
						module: 'routing/static/rules',
						tags  : [
							log_tags.init
						]
					});

					cb_init(error);
				}
				else {
					var setting = new Setting({
						module: 'routing/static/rules',
						name  : 'status',
						value : setting_statuses.enabled
					});

					setting.save(function (error) {
						if (error) {
							logger.error(error.message, {
								module: 'routing/static/rules',
								tags  : [
									log_tags.init,
									log_tags.db
								]
							});

							cb_init(error);
						}
						else {
							logger.info('Module started.', {
								module: 'routing/static/rules',
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