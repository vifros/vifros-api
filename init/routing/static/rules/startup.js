var async = require('async');

var ip_rule = require('iproute').rule;

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var StaticRoutingRule = require('../../../../models/routing/static/rule').StaticRoutingRule;

module.exports = function (cb_init) {
	/*
	 * Already initialized.
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
			 * Get all rules from DB.
			 */
			StaticRoutingRule.find({}, function (error, docs) {
				if (error) {
					logger.error(error, {
						module: 'routing/static/rules',
						tags  : [
							log_tags.init,
							log_tags.db
						]
					});

					cb_init(error);
				}
				else if (docs && docs.length) {
					async.each(docs, function (item, cb_each) {
						// The priority 0 rule never gets deleted from OS so pass from it.
						if (item.priority == 0) {
							cb_each(null);
						}
						else {
							// Insert the rule into OS.
							ip_rule.add(item, function (error) {
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
};
