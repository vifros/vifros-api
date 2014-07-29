var logger = global.vifros.logger;
var log_tags = logger.tags;

var Ethernet = require('../../models/ethernet').Ethernet;

var addresses_create = require('../../../common/addresses/routes/create');

module.exports = function (req, res) {
  Ethernet.findOne({
    name: req.params.ethernet
  }, function (error, doc) {
    if (error) {
      logger.error(error.name, {
        module: 'interfaces/ethernets',
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
      }); // Not found.
      return;
    }

    try {
      /*
       * Delegate the responsibility to send the response to this method.
       */
      addresses_create(req, res, {
        interface: req.params.ethernet,
        base_url : '/ethernets/' + req.params.ethernet
      });
    }
    catch (error) {
      logger.error(error.name, {
        module: 'interfaces/ethernets',
        tags  : [
          log_tags.api_request
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