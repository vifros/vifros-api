var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  StaticRoutingRoute.purgeFromOSandDB({
    filter: {
      _id: req.params.route
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