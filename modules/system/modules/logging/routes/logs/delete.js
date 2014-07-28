var logger = global.vifros.logger;
var log_tags = logger.tags;

var Log = require('../../models/log').Log;

module.exports = function (req, res) {
  Log.findById(req.params.log, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'system/logging/logs',
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
          module: 'system/logging/logs',
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