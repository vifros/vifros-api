var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var Ethernet = require('../../models/ethernet').Ethernet;

var addresses_create = require('../../../common/addresses/routes/create');

module.exports = function (req, res) {
  var json_api_errors = {
    errors: []
  };

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

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
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

        res.send(500); // Internal Server Error.
      }

      return;
    }

    res.send(404); // Not found.
  });
};