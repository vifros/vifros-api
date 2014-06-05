var ip_link = require('iproute').link;
var link_statuses = ip_link.utils.statuses;

var Address = require('../../common/addresses/models/address').Address;
var VLAN = require('../models/vlan').VLAN;

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  VLAN.purgeFromOSandDB({
    filter: {
      interface: req.params.vlan_interface,
      tag      : req.params.vlan_tag
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