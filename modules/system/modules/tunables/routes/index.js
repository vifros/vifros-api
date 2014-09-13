var async = require('async');

var config = require('../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var Tunable = require('../models/tunable').Tunable;

var jsonapi = require('../../../../../utils/jsonapi');

module.exports = function (req, res) {
  var json_api_body = {
    links   : {
      tunables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/tunables' + '/' + '{tunables.path}'
    },
    tunables: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'tunables',
    model        : Tunable
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'tunables',
    model        : Tunable
  });

  Tunable.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error, {
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

    json_api_body['meta'] = {
      tunables: {
        total : null, // Below will be reseted to the correct value
        limit : Number(query_options.limit),
        offset: Number(query_options.skip)
      }
    };

    if (!docs.length) {
      json_api_body.meta.tunables.total = 0;

      res.json(200, json_api_body); // OK.
      return;
    }

    async.parallel([
      function (cb_parallel) {
        async.each(docs, function (item, cb_each) {
          var buffer = item.toObject();

          delete buffer._id;
          delete buffer.__v;

          json_api_body.tunables.push(buffer);

          cb_each(null);
        }, function (error) {
          if (error) {
            cb_parallel(error);
            return;
          }

          cb_parallel(null);
        });
      },
      function (cb_parallel) {
        Tunable.count(query_filter, function (error, count) {
          if (error) {
            cb_parallel(error);
            return;
          }

          json_api_body.meta.tunables.total = count;

          cb_parallel(null);
        });
      }
    ], function (error) {
      if (error) {
        logger.error(error, {
          module: 'system/tunables',
          tags  : [
            log_tags.api_request
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

      res.json(200, json_api_body); // OK.
    });
  });
};