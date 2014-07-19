var config = require('../../config');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/services')
    .get(require('./routes/index'));
};