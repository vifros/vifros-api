var config = require('../../../../../config');

var Loopback = require('../models/loopback').Loopback;

var logger = global.vifros.logger;
var log_tags = logger.tags;

module.exports = function (req, res) {
  var json_api_body = {
    links    : {
      loopbacks            : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks/{loopbacks.name}',
      'loopbacks.addresses': req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks/{loopbacks.name}/addresses'
    },
    loopbacks: {}
  };

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
      }); // Not found.
      return;
    }

    /*
     * Build JSON API response.
     */
    var buffer = doc.toObject();
    buffer.id = doc._id;

    delete buffer._id;
    delete buffer.__v;

    json_api_body.loopbacks = buffer;

    res.json(200, json_api_body); // OK.
  });
};