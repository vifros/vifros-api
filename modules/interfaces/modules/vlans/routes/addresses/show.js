var logger = global.vifros.logger;
var log_tags = logger.tags;

var VLAN = require('../../models/vlan').VLAN;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
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

  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    addresses_index(req, res, {
      filter  : {
        interface: vlan_interface + '.' + vlan_tag,
        address  : req.params.address
      },
      base_url: '/vlans/' + vlan_interface + '.' + vlan_tag,
      single  : true
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