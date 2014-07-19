var config = require('../../../../../config');

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var Tunable = require('../models/tunable').Tunable;

module.exports = function (req, res) {
  var json_api_body = {
    links   : {
      tunables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/tunables' + '/' + '{tunables.path}'
    },
    tunables: []
  };

  var json_api_errors = {
    errors: []
  };

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

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
      /*
       * Build JSON API response.
       */
      var buffer = doc.toObject();
      buffer.id = doc._id;

      delete buffer._id;
      delete buffer.__v;

      json_api_body.tunables.push(buffer);

      res.json(200, json_api_body); // OK.

      return;
    }

    res.send(404); // Not found.
  });
};