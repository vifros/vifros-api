var VLAN = require('../models/vlan').VLAN;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  var vlan_interface = req.params.vlan.split('.')[0];
  var vlan_tag = req.params.vlan.split('.')[1];

  if (req.params.vlan.split('.').length != 2) {
    res.json(404, {
      errors: [
        {
          code : 'not_found',
          title: 'Not found.'
        }
      ]
    }); // Not found.
    return;
  }

  VLAN.purgeFromOSandDB({
    filter: {
      interface: vlan_interface,
      tag      : vlan_tag
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