var bodyParser = require('body-parser');

var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  var url_prefix = config.api.prefix + '/services/nat';

  app.route(url_prefix)
    .get(require('./routes/index'));

  // TODO: At some point unify `source`, `destination` & `bidirectional` NAT types in only one set of files.
  /*
   * Source.
   */
  app.route(url_prefix + '/source')
    .get(require('./routes/source'));

  /*
   * Source. Chains.
   */
  app.route(url_prefix + '/source/chains')
    .get(require('./routes/source/chains'))
    .post(bodyParser.json({type: 'application/vnd.api+json'}), require('./routes/source/chains/create'));

  app.route(url_prefix + '/source/chains/:chain')
    .get(require('./routes/source/chains/show'))
    .delete(require('./routes/source/chains/delete'))
    .patch(bodyParser.json({type: 'application/json-patch+json'}), require('./routes/source/chains/patch'));

  /*
   * Source. Rules.
   */
  app.route(url_prefix + '/source/chains/:chain/rules')
    .get(require('./routes/source/chains/rules'))
    .post(bodyParser.json({type: 'application/vnd.api+json'}), require('./routes/source/chains/rules/create'));

  app.route(url_prefix + '/source/chains/:chain/rules/:rule')
    .get(require('./routes/source/chains/rules/show'))
    .delete(require('./routes/source/chains/rules/delete'));
};