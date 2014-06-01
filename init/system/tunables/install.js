var async = require('async');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Setting = require('../../../models/common/setting').Setting;
var setting_statuses = require('../../../models/common/setting').statuses;

var package_defaults = require('./defaults');

var Tunable = require('../../../models/system/tunable').Tunable;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  /*
   * Add package defaults to OS.
   */
  async.each(package_defaults.tunables, function (item, cb_each) {
    Tunable.createFromObjectToOS(item, function (error) {
      if (error) {
        cb_each(error);

        return;
      }

      var tunable = new Tunable(item);

      // Save the object to database.
      tunable.save(function (error) {
        if (error) {
          cb_each(error);

          return;
        }

        cb_each(null);
      });
    });
  }, function (error) {
    if (error) {
      logger.error(error, {
        module: 'system/tunables',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(error);

      return;
    }

    var setting = new Setting({
      module: 'system/tunables',
      name  : 'status',
      value : setting_statuses.enabled
    });

    setting.save(function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'system/tunables',
          tags  : [
            log_tags.init,
            log_tags.db
          ]
        });

        cb_init(error);

        return;
      }

      logger.info('Module started.', {
        module: 'system/tunables',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(null);
    });
  });
};