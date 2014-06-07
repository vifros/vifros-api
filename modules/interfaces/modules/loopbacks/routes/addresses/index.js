var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;

var Loopback = require('../../models/loopback').Loopback;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_errors = {
    errors: []
  };

  Loopback.findOne({
    name: req.params.loopback
  }, function (error, doc) {
    if (error) {
      logger.error(error.name, {
        module: 'interfaces/loopbacks',
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
            interface: doc.name
          },
          base_url: '/loopbacks/' + req.params.loopback
        });
      }
      catch (error) {
        logger.error(error.name, {
          module: 'interfaces/loopbacks',
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