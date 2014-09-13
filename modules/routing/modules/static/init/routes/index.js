var logger = global.vifros.logger;
var log_tags = logger.tags;

var Setting = require('../../../../../common/settings/models/setting').Setting;
var setting_statuses = require('../../../../../common/settings/models/setting').statuses;

var startup = require('./startup');

module.exports = function (cb_init) {
  Setting.findOne({
    module: 'routing/static/routes',
    name  : 'status'
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/routes',
        tags  : [
          log_tags.init,
          log_tags.db,
        ]
      });

      cb_init(error);
      return;
    }

    if (doc) {
      /*
       * Already initialized.
       */
      startup(cb_init);
      return;
    }

    /*
     * Not yet initialized.
     * Just save the setting and do nothing since there are nothing to be installed.
     */
    var setting = new Setting({
      module: 'routing/static/routes',
      name  : 'status',
      value : setting_statuses.enabled
    });

    setting.save(function (error) {
      if (error) {
        logger.error(error, {
          module: 'routing/static/routes',
          tags  : [
            log_tags.init,
            log_tags.db
          ]
        });

        cb_init(error);
        return;
      }

      logger.info('Module started.', {
        module: 'routing/static/routes',
        tags  : [
          log_tags.init
        ]
      });

      cb_init(null);
    });
  });
};