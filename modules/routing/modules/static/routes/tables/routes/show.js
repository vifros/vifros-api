var logger = global.vifros.logger;
var log_tags = logger.tags;

var routes_index = require('../../routes/index');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    routes_index(req, res, {
      filter  : {
        _id: req.params.route
      },
      base_url: '/tables/' + req.params.table,
      single  : true
    });
  }
  catch (error) {
    logger.error(error.name, {
      module: 'routing/static/tables',
      tags  : [
        log_tags.api_request,
        log_tags.cross_rel
      ]
    });

    res.json(500, {
      errors: [
        {
          code : 'internal_server_error',
          title: 'Internal Server Error.'
        }
      ]
    }); // Internal Server Error.
  }
};