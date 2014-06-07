var config = require('../../config');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/services')
    .get(require('./routes/index'));
};