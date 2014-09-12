var ip_link = require('iproute').link;
var link_statuses = ip_link.utils.statuses;

var Address = require('../../common/addresses/models/address').Address;
var Loopback = require('../models/loopback').Loopback;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

  Loopback.findOne({
    name: req.params.loopback
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/loopbacks',
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

    if (doc.status.operational != link_statuses.NOTPRESENT) {
      json_api_errors.errors.push({
        code : log_codes.delete_present_interface_error.code,
        path : 'status.operational',
        title: 'Only not present interfaces can be deleted.'
      });

      res.json(403, {
        errors: [
          {
            code : 'forbidden',
            title: 'forbidden Server Error.'
          }
        ]
      }); // Forbidden.
      return;
    }

    /*
     * Only allow interface deletion if its status is NOTPRESENT.
     */
    doc.remove(function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'interfaces/loopbacks',
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

      /*
       * Delete related addresses from DB.
       */
      Address.remove({
        interface: doc.name
      }, function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'interfaces/loopbacks',
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

        res.send(204, json_api_errors); // No Content.
      });
    });
  });
};