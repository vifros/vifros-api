var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  StaticRoutingRoute.purgeFromOSandDB({
    filter: {
      to   : req.params.route,
      table: req.params.table
    }
  }, function (error, ret) {
    if (error) {
      json_api_errors.errors = error.errors;

      res.json(error.server_code, json_api_errors);
      return;
    }

    res.send(ret.server_code);
  });
};