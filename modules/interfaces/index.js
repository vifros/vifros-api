var config = require('../../config');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/interfaces')
    .get(require('./routes'));
};