var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.api.prefix + '/services/nat')
    .get(require('./routes/index'));

  app.route(config.api.prefix + '/services/nat/source')
    .get(require('./routes/source'));

  app.route(config.api.prefix + '/services/nat/source/chains')
    .get(require('./routes/source/chains'))
    .post(require('./routes/source/chains/create'));

  app.route(config.api.prefix + '/services/nat/source/chains/:chain')
    .get(require('./routes/source/chains/show'))
    .delete(require('./routes/source/chains/delete'));

  app.route(config.api.prefix + '/services/nat/source/chains/:chain/rules')
    .get(require('./routes/source/chains/rules'))
    .post(require('./routes/source/chains/rules/create'));

  app.route(config.api.prefix + '/services/nat/source/chains/:chain/rules/:rule')
    .get(require('./routes/source/chains/rules/show'))
    .delete(require('./routes/source/chains/rules/delete'));
};