var async = require('async');

var config = require('../../../config');

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

var Tunable = require('../../../models/system/tunable').Tunable;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links   : {
      tunables: req.protocol + '://' + req.get('Host') + config.api.prefix + '/system/tunables' + '/' + '{tunables.path}'
    },
    tunables: []
  };

  var json_api_errors = {
    errors: []
  };

  Tunable.find({}, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'system/tunables',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      json_api_errors.errors.push({
        code   : error.name,
        field  : '',
        message: error.message
      });

      res.json(500, json_api_errors); // Internal Server Error.

      return;
    }

    if (docs && docs.length) {
      async.each(docs, function (item, cb_each) {
        var buffer = item.toObject();
        buffer.id = item._id;

        delete buffer._id;
        delete buffer.__v;

        json_api_body.tunables.push(buffer);

        cb_each(null);
      }, function (error) {
        if (error) {
          logger.error(error, {
            module: 'system/tunables',
            tags  : [
              log_tags.api_request
            ]
          });

          json_api_errors.errors.push({
            code   : '',
            field  : '',
            message: error
          });

          res.json(500, json_api_errors); // Internal Server Error.

          return;
        }

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.json(404, json_api_body); // Not found.
  });
};