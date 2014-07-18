var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var VLAN = require('../../models/vlan').VLAN;

var addresses_create = require('../../../common/addresses/routes/create');

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  VLAN.findOne({
    interface: req.params.vlan_interface,
    tag      : req.params.vlan_tag
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/vlans',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
      try {
        /*
         * Delegate the responsibility to send the response to this method.
         */
        addresses_create(req, res, {
          interface: req.params.vlan_interface + '.' + req.params.vlan_tag,
          base_url : '/vlans/' + req.params.vlan_interface + '.' + req.params.vlan_tag
        });
      }
      catch (error) {
        logger.error(error.name, {
          module: 'interfaces/vlans',
          tags  : [
            log_tags.api_request
          ]
        });

        res.send(500); // Internal Server Error.
      }

      return;
    }

    res.send(404); // Not found.
  });
};