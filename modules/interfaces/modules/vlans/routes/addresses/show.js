var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var VLAN = require('../../models/vlan').VLAN;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    addresses_index(req, res, {
      filter  : {
        interface: req.params.vlan_interface + '.' + req.params.vlan_tag,
        address  : req.params.address
      },
      base_url: '/vlans/' + req.params.vlan_interface + '.' + req.params.vlan_tag
    });
  }
  catch (error) {
    logger.error(error.name, {
      module: 'interfaces/vlans',
      tags  : [
        log_tags.api_request,
        log_tags.cross_rel
      ]
    });

    res.send(500); // Internal Server Error.
  }
};