var async = require('async');

var config = require('../../../../../config');

var Loopback = require('../models/loopback').Loopback;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var jsonapi = require('../../../../../utils/jsonapi');

module.exports = function (req, res) {
  var json_api_body = {
    links    : {
      loopbacks: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks/{loopbacks.name}'
    },
    loopbacks: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'loopbacks',
    model        : Loopback
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'loopbacks',
    model        : Loopback
  });

  Loopback.find(query_filter, {}, query_options, function (error, docs) {
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

    json_api_body['meta'] = {
      loopbacks: {
        total : null, // Below will be reseted to the correct value
        limit : Number(query_options.limit),
        offset: Number(query_options.skip)
      }
    };

    if (!docs.length) {
      json_api_body.meta.loopbacks.total = 0;

      res.json(200, json_api_body); // OK.
      return;
    }

    async.parallel([
      function (cb_parallel) {
        async.each(docs, function (item, cb_each) {
          var buffer_loopback = item.toObject();

          delete buffer_loopback._id;
          delete buffer_loopback.__v;

          json_api_body.loopbacks.push(buffer_loopback);

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
        Loopback.count(query_filter, function (error, count) {
          if (error) {
            cb_parallel(error);
            return;
          }

          json_api_body.meta.loopbacks.total = count;

          cb_parallel(null);
        });
      }
    ], function (error) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/loopbacks',
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