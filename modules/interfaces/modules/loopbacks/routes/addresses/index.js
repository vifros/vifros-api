var logger = global.vifros.logger;
var log_tags = logger.tags;

var Loopback = require('../../models/loopback').Loopback;

var addresses_index = require('../../../common/addresses/routes/index');

module.exports = function (req, res) {
  Loopback.findOne({
    name: req.params.loopback
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
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
      logger.error(error, {
        module: 'interfaces/loopbacks',
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