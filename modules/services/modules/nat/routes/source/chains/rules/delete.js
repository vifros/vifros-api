var logger = global.vifros.logger;
var log_tags = logger.tags;

var NATRule = require('../../../../models/rule').NATRule;

module.exports = function (req, res) {
  NATRule.findById(req.params.rule, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'services/nat/source/routes',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
      NATRule.purgeFromOS(doc, function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'services/nat/source/routes',
            tags  : [
              log_tags.api_request,
              log_tags.db
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        NATRule.findByIdAndRemove(req.params.rule, function (error) {
          if (error) {
            logger.error(error.message, {
              module: 'services/nat/source/routes',
              tags  : [
                log_tags.api_request,
                log_tags.db
              ]
            });

            res.send(500); // Internal Server Error.

            return;
          }

          res.send(204); // No Content.
        });
      });

      return;
    }

    res.send(404); // Not found.
  });
};