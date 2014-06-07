var async = require('async');

var config = require('../../../../../../../config');

var logger = require('../../../../../../../common/logger').logger;
var log_tags = require('../../../../../../../common/logger').tags;

var NATChain = require('../../../models/chain').NATChain;

var jsonapi = require('../../../../../../../utils/jsonapi');

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

  var json_api_body = {
    links : {
      chains: req.protocol + '://' + req.get('Host') + config.api.prefix + '/services/nat/source/chains/{chains.name}'
    },
    chains: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'chains',
    model        : NATChain
  });
  query_filter.type = 'source';

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'chains',
    model        : NATChain
  });

  NATChain.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'services/nat/source/chains',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (docs && docs.length) {
      async.parallel([
        function (cb_parallel) {
          async.each(docs, function (item, cb_each) {
            var buffer = item.toObject();
            buffer.id = item._id;

            delete buffer._id;
            delete buffer.__v;

            json_api_body.chains.push(buffer);

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
          NATChain.count({
            type: 'source'
          }, function (error, count) {
            if (error) {
              cb_parallel(error);

              return;
            }

            json_api_body['meta'] = {
              chains: {
                total : count,
                limit : Number(query_options.limit),
                offset: Number(query_options.skip)
              }
            };

            cb_parallel(null);
          });
        }
      ], function (error) {
        if (error) {
          logger.error(error, {
            module: 'services/nat/source/chains',
            tags  : [
              log_tags.api_request
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.send(404); // Not found.
  });
};