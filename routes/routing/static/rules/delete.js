var StaticRoutingRule = require('../../../../models/routing/static/rule').StaticRoutingRule;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  StaticRoutingRule.purgeFromOSandDB({
    filter: {
      priority: req.params.rule
    }
  }, function (error, ret) {
    if (error) {
      for (var i = 0, j = ret.errors.length;
           i < j;
           i++) {

        json_api_errors.errors.push({
          code   : ret.errors[i].code,
          field  : ret.errors[i].field,
          message: ret.errors[i].message
        });
      }

      res.json(ret.server_code, json_api_errors);

      return;
    }

    res.send(ret.server_code);
  });
};