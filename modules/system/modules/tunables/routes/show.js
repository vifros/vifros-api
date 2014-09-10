var config = require('../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Tunable = require('../models/tunable').Tunable;

module.exports = function (req, res) {
  var json_api_body = {
    links   : {
      tunables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/tunables' + '/' + '{tunables.path}'
    },
    tunables: {}
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

    /*
     * Build JSON API response.
     */
    var buffer = doc.toObject();

    delete buffer._id;
    delete buffer.__v;

    json_api_body.tunables = buffer;

    res.json(200, json_api_body); // OK.
  });
};