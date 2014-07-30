var config = require('../../../../config');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/system/logging')
    .get(require('./routes/index'));

  /*
   * System. Logging. Logs.
   */
  app.route(config.get('api:prefix') + '/system/logging/logs')
    .get(require('./routes/logs/index'));

  app.route(config.get('api:prefix') + '/system/logging/logs/:log')
    .get(require('./routes/logs/show'))
    .delete(require('./routes/logs/delete'));

  /*
   * System. Logging. Settings.
   */
  app.route(config.get('api:prefix') + '/system/logging/settings')
    .get(require('./routes/settings/index'));

  app.route(config.get('api:prefix') + '/system/logging/settings/:setting')
    .get(require('./routes/settings/show'))
    .put(require('./routes/settings/update'));
};