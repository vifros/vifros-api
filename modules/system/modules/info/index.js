var config = require('../../../../config');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/system/info')
    .get(require('./routes/index'));

  app.route(config.api.prefix + '/system/info/:info')
    .get(require('./routes/show'));
};