var Address = require('../models/address').Address;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  var iface;
  for (var param in req.params) {
    if (req.params.hasOwnProperty(param)
      && param != 'address') {

      iface = req.params[param];
      break;
    }
  }

  Address.purgeFromOSandDB({
    filter: {
      address  : req.params.address,
      interface: iface
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