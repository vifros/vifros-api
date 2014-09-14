var fs = require('fs');
var async = require('async');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../common/settings/models/setting').statuses;

var package_defaults = require('./defaults');

var Tunable = require('../models/tunable').Tunable;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  /*
   * Add package defaults to OS.
   */
  async.each(package_defaults.tunables, function (item, cb_each) {
    var tunable = new Tunable(item);

    async.series([
      /*
       * Get the original value for the tunable so it can be reseted later.
       */
      function (cb_series) {
        if (!tunable.value.original) {
          fs.readFile('/proc/sys/' + tunable.path.replace(/\./g, '/'), {
            encoding: 'utf8'
          }, function (error, file_content) {
            if (error) {
              cb_series(error);
              return;
            }

            tunable.value.original = file_content;
            cb_series(null);
          });
          return;
        }
        cb_series(null);
      }
    ], function (error) {
      if (error) {
        cb_each(null);
        return;
      }

      Tunable.createFromObjectToOS(item, function (error) {
        if (error) {
          cb_each(error);
          return;
        }

        // Save the object to database.
        tunable.save(function (error) {
          if (error) {
            cb_each(error);
            return;
          }

          cb_each(null);
        });
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
        logger.error(error, {
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