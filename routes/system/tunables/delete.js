var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Tunable = require('../../../models/system/tunable').Tunable;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  Tunable.findOneAndRemove({
    path: req.params.tunable
  }, function (error) {
    if (error) {
      logger.error(error.message, {
        module: 'system/tunables',
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
};