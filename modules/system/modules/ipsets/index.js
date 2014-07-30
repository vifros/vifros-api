var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/system/ipsets')
    .get(require('./routes/index'));

  app.route(config.get('api:prefix') + '/system/ipsets/:ipset')
    .get(require('./routes/show'));
};