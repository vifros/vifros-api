var async = require('async');

var ip_forward = require('iproute').utils.ip_forward;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var package_defaults = require('./defaults');

var Setting = require('../../common/settings/models/setting').Setting;
var setting_statuses = require('../../common/settings/models/setting').statuses;

module.exports = function (cb_init) {
  /*
   * Not yet initialized.
   */
  // Overwrites OS settings with DB ones.
  async.parallel([
    function (cb_parallel) {
      /*
       * Setting: ip_forward_v4.
       */
      if (package_defaults.settings.ip_forward_v4.value == 0) {
        ip_forward.v4.disable(function (error) {
          if (error) {
            cb_parallel(error);
          }
          else {
            cb_parallel(null);
          }
        });

        return;
      }

      if (package_defaults.settings.ip_forward_v4.value == 1) {
        ip_forward.v4.enable(function (error) {
          if (error) {
            cb_parallel(error);
          }
          else {
            cb_parallel(null);
          }
        });

        return;
      }

      cb_parallel('Error: invalid ip_forward_v4 value, has to be 0 or 1 and it is: ' + package_defaults.settings.ip_forward_v4.value);
    },
    function (cb_parallel) {
      /*
       * Setting: ip_forward_v6.
       */
      if (package_defaults.settings.ip_forward_v6.value == 0) {
        ip_forward.v6.disable(function (error) {
          if (error) {
            cb_parallel(error);
          }
          else {
            cb_parallel(null);
          }
        });

        return;
      }

      if (package_defaults.settings.ip_forward_v6.value == 1) {
        ip_forward.v6.enable(function (error) {
          if (error) {
            cb_parallel(error);

            return;
          }

          cb_parallel(null);
        });

        return;
      }

      cb_parallel('Error: invalid ip_forward_v6 value, has to be 0 or 1 and it is: ' + package_defaults.settings.ip_forward_v6.value);
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

        return;
      }

      var settings = [];

      var status = new Setting({
        module: 'routing/settings',
        name  : 'status',
        value : setting_statuses.enabled
      });
      settings.push(status);

      var ip_forward_v4 = new Setting({
        module     : 'routing/settings',
        name       : 'ip_forward_v4',
        value      : package_defaults.settings.ip_forward_v4.value,
        description: package_defaults.settings.ip_forward_v4.description
      });
      settings.push(ip_forward_v4);

      var ip_forward_v6 = new Setting({
        module     : 'routing/settings',
        name       : 'ip_forward_v6',
        value      : package_defaults.settings.ip_forward_v6.value,
        description: package_defaults.settings.ip_forward_v6.description
      });
      settings.push(ip_forward_v6);

      async.each(settings, function (item, cb_each) {
        item.save(function (error) {
          if (error) {
            cb_each(error);

            return;
          }

          cb_each(null);
        });
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/settings',
            tags  : [
              log_tags.init
            ]
          });

          cb_init(error);

          return;
        }

        logger.info('Module started.', {
          module: 'routing/settings',
          tags  : [
            log_tags.init
          ]
        });

        cb_init(null);
      });
    });
};