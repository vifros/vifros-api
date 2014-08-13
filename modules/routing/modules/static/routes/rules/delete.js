var logger = global.vifros.logger;
var log_tags = logger.tags;

var StaticRoutingRule = require('../../models/rule').StaticRoutingRule;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  StaticRoutingRule.purgeFromOSandDB({
    filter: {
      priority: req.params.rule
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