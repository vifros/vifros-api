var ip_link = require('iproute').link;
var link_statuses = ip_link.utils.statuses;

var Address = require('../../common/addresses/models/address').Address;
var Ethernet = require('../models/ethernet').Ethernet;

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;
var log_codes = require('../../../../../common/logger').codes;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  Ethernet.findOne({
    name: req.params.ethernet
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/ethernets',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc.status.operational != link_statuses.NOTPRESENT) {
      logger.error('Only interfaces with status NOT_PRESENT can be deleted.', {
        module: 'interfaces/ethernets',
        tags  : [
          log_tags.api_request,
          log_tags.validation
        ]
      });

      json_api_errors.errors.push({
        code   : log_codes.json_patch_error.code.delete_present_interface_error,
        field  : '/ethernets/0/status/operational',
        message: 'Only not present interfaces can be deleted.'
      });

      res.json(403, json_api_errors); // Forbidden.

      return;
    }

    /*
     * Only allow interface deletion if its status is NOTPRESENT.
     */
    doc.remove(function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'interfaces/ethernets',
          tags  : [
            log_tags.api_request,
            log_tags.db
          ]
        });

        res.send(500); // Internal Server Error.

        return;
      }

      /*
       * Delete related addresses from DB.
       */
      Address.remove({
        interface: doc.name
      }, function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'interfaces/ethernets',
            tags  : [
              log_tags.api_request,
              log_tags.db
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        res.send(204, json_api_errors); // No Content.
      });
    });
  });
};