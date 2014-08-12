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

  VLAN.findOne({
    interface: vlan_interface,
    tag      : vlan_tag
  }, function (error, doc) {
    if (error) {
      logger.error(error.name, {
        module: 'interfaces/vlans',
        tags  : [
          log_tags.api_request,
          log_tags.db
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
      return;
    }

    if (!doc) {
      res.json(404, {
        errors: [
          {
            code : 'not_found',
            title: 'Not found.'
          }
        ]
      }); // Not Found.
      return;
    }

    try {
      /*
       * Delegate the responsibility to send the response to this method.
       */
      addresses_index(req, res, {
        filter  : {
          interface: doc.interface + '.' + doc.tag
        },
        base_url: '/vlans/' + vlan_interface + '.' + vlan_tag
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
  });
};