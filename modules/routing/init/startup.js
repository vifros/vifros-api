var async = require('async');

var ip_forward = require('iproute').utils.ip_forward;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../common/settings/models/setting').Setting;

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
          return;
        }

        if (doc.value == '0') {
          ip_forward.v4.disable(function (error) {
            if (error) {
              cb_parallel(error);
              return;
            }

            cb_parallel(null);
          });
          return;
        }

        if (doc.value == '1') {
          ip_forward.v4.enable(function (error) {
            if (error) {
              cb_parallel(error);
              return;
            }

            cb_parallel(null);
          });
          return;
        }

        cb_parallel('Error: invalid ip_forward_v4 value, has to be 0 or 1 and it is: ' + doc.value);
      });
    },
    function (cb_parallel) {
      Setting.findOne({
        module: 'routing/settings',
        name  : 'ip_forward_v6'
      }, function (error, doc) {
        if (error) {
          cb_parallel(error);
          return;
        }

        if (doc.value == '0') {
          ip_forward.v6.disable(function (error) {
            if (error) {
              cb_parallel(error);
              return;
            }

            cb_parallel(null);
          });
          return;
        }

        if (doc.value == '1') {
          ip_forward.v6.enable(function (error) {
            if (error) {
              cb_parallel(error);
              return;
            }

            cb_parallel(null);
          });
          return;
        }

        cb_parallel('Error: invalid ip_forward_v6 value, has to be 0 or 1 and it is: ' + doc.value);
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
};