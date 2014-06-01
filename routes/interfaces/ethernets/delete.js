var ip_link = require('iproute').link;
var link_statuses = ip_link.utils.statuses;

var Address = require('../../../models/interfaces/address').Address;
var Ethernet = require('../../../models/interfaces/ethernet').Ethernet;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

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

      json_api_errors.errors.push({
        code   : error.name,
        field  : '',
        message: error.message
      });

      res.json(500, json_api_errors); // Internal Server Error.

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
        code   : '',
        field  : '',
        message: 'Only interfaces not present can be deleted.'
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

        json_api_errors.errors.push({
          code   : error.name,
          field  : '',
          message: error.message
        });

        res.json(500, json_api_errors); // Internal Server Error.

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

          json_api_errors.errors.push({
            code   : error.name,
            field  : '',
            message: error.message
          });

          res.json(500, json_api_errors); // Internal Server Error.

          return;
        }

        res.send(204, json_api_errors); // No Content.
      });
    });
  });
};