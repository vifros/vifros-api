var logger = global.vifros.logger;
var log_tags = logger.tags;

var VLAN = require('../../models/vlan').VLAN;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  VLAN.findOne({
    interface: req.params.vlan_interface,
    tag      : req.params.vlan_tag
  }, function (error, doc) {
    if (error) {
      logger.error(error.name, {
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
        addresses_index(req, res, {
          filter  : {
            interface: doc.interface + '.' + doc.tag
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

      return;
    }

    res.send(404); // Not found.
  });
};