var async = require('async');

var config = require('../../../../../config');

var Ethernet = require('../models/ethernet').Ethernet;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var jsonapi = require('../../../../../utils/jsonapi');

module.exports = function (req, res) {
  var json_api_body = {
    links    : {
      ethernets: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/ethernets/{ethernets.name}'
    },
    ethernets: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'ethernets',
    model        : Ethernet
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'ethernets',
    model        : Ethernet
  });

  Ethernet.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/ethernets',
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
      ethernets: {
        total : null, // Below will be reseated to the correct value.
        limit : Number(query_options.limit),
        offset: Number(query_options.skip)
      }
    };

    if (!docs.length) {
      json_api_body.meta.ethernets.total = 0;

      res.json(200, json_api_body); // OK.
      return;
    }

    async.parallel([
      function (cb_parallel) {
        async.each(docs, function (item, cb_each) {
          var buffer_ethernet = item.toObject();

          delete buffer_ethernet._id;
          delete buffer_ethernet.__v;

          json_api_body.ethernets.push(buffer_ethernet);

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
        Ethernet.count(query_filter, function (error, count) {
          if (error) {
            cb_parallel(error);
            return;
          }

          json_api_body.meta.ethernets.total = count;

          cb_parallel(null);
        });
      }
    ], function (error) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/ethernets',
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