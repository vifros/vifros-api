var Address = require('../models/address').Address;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  Address.purgeFromOSandDB({
    filter: {
      address: req.params.address
    }
  }, function (error, ret) {
    if (error) {
      for (var i = 0, j = ret.errors.length;
           i < j;
           i++) {

        var errors = {};

        if (ret.errors[i].code) {
          errors.code = ret.errors[i].code;
        }
        if (ret.errors[i].field) {
          errors.field = ret.errors[i].field;
        }
        if (ret.errors[i].message) {
          errors.message = ret.errors[i].message;
        }

        json_api_errors.errors.push(errors);
      }

      res.json(ret.server_code, json_api_errors);

      return;
    }

    res.send(ret.server_code);
  });
};