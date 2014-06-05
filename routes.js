var config = require('./config');

module.exports = function (app) {
  /*
   * API root.
   */
  app.route(config.api.prefix)
    .get(require('./routes/index'));
};