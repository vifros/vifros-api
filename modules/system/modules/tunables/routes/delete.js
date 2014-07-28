var logger = global.vifros.logger;
var log_tags = logger.tags;

var Tunable = require('../models/tunable').Tunable;

module.exports = function (req, res) {
  Tunable.findOne({
    path: req.params.tunable
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'system/tunables',
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

    doc.remove(function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'system/tunables',
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

      res.send(204); // No Content.
    });
  });
};