var config = require('../../../../config');

exports.init = require('./init');

exports.setRoutes = function (app) {
  app.route(config.get('api:prefix') + '/routing/static')
    .get(require('./routes/index'));

  /*
   * Routing. Static. Tables.
   */
  app.route(config.get('api:prefix') + '/routing/static/tables')
    .get(require('./routes/tables/index'))
    .post(require('./routes/tables/create'));

  app.route(config.get('api:prefix') + '/routing/static/tables/:table')
    .get(require('./routes/tables/show'))
    .delete(require('./routes/tables/delete'))
    .patch(require('./routes/tables/patch'));

  /*
   * Routing. Static. Tables. Routes.
   */
  app.route(config.get('api:prefix') + '/routing/static/tables/:table/routes')
    .get(require('./routes/tables/routes/index'))
    .post(require('./routes/tables/routes/create'));

  app.route(config.get('api:prefix') + '/routing/static/tables/:table/routes/:route')
    .get(require('./routes/tables/routes/show'))
    .delete(require('./routes/routes/delete'))
    .patch(require('./routes/routes/patch'));

  /*
   * Routing. Static. Rules.
   */
  app.route(config.get('api:prefix') + '/routing/static/rules')
    .get(require('./routes/rules/index'))
    .post(require('./routes/rules/create'));

  app.route(config.get('api:prefix') + '/routing/static/rules/:rule')
    .get(require('./routes/rules/show'))
    .delete(require('./routes/rules/delete'))
    .put(require('./routes/rules/update'));
};