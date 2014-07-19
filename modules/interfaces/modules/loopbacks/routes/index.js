var async = require('async');

var config = require('../../../../../config');

var Address = require('../../common/addresses/models/address').Address;
var Loopback = require('../models/loopback').Loopback;

var logger = require('../../../../../common/logger').logger;
var log_tags = require('../../../../../common/logger').tags;

var jsonapi = require('../../../../../utils/jsonapi');

module.exports = function (req, res) {
  /*
   * Check for document inclusion.
   */
  var requested_docs_to_include = req.query.include;
  var is_addresses_requested = false;

  /*
   * Check if addresses documents were requested too.
   */
  if (typeof requested_docs_to_include != 'undefined'
    && requested_docs_to_include.split(',').indexOf('addresses') != -1) {

    is_addresses_requested = true;
  }

  var json_api_body = {
    links    : {
      loopbacks            : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks' + '/' + '{loopbacks.name}',
      'loopbacks.addresses': req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks' + '/' + '{loopbacks.name}' + '/addresses'
    },
    loopbacks: []
  };

  /*
   * Add linked data if was requested to response.
   */
  if (is_addresses_requested) {
    json_api_body.links['loopbacks.addresses'] = {
      href: req.protocol + '://' + req.get('Host') + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks/{loopbacks.name}/addresses/{loopbacks.addresses.address}',
      type: 'addresses'
    };

    json_api_body['linked'] = {
      addresses: []
    };
  }

  var json_api_errors = {
    errors: []
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
      logger.error(error.message, {
        module: 'interfaces/loopbacks',
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
            var buffer_loopback = item.toObject();
            buffer_loopback.id = item._id;

            delete buffer_loopback._id;
            delete buffer_loopback.__v;

            if (!is_addresses_requested) {
              json_api_body.loopbacks.push(buffer_loopback);

              cb_each(null);

              return;
            }

            Address.find({
              interface: buffer_loopback.name
            }, function (error, docs) {
              if (error) {
                logger.error(error.message, {
                  module: 'interfaces/loopbacks',
                  tags  : [
                    log_tags.api_request,
                    log_tags.db
                  ]
                });

                json_api_errors.errors.push({
                  code   : error.name,
                  message: error.message
                });

                cb_each(error);

                return;
              }

              if (docs && docs.length) {
                if (!buffer_loopback.hasOwnProperty('links')) {
                  buffer_loopback['links'] = {};
                }

                if (!buffer_loopback.hasOwnProperty('addresses')) {
                  buffer_loopback.links['addresses'] = [];
                }

                for (var i = 0, j = docs.length;
                     i < j;
                     i++) {

                  var buffer_address = docs[i].toObject();
                  buffer_address.id = docs[i]._id;

                  delete buffer_address._id;
                  delete buffer_address.__v;

                  buffer_loopback.links.addresses.push({
                    id  : buffer_address.id,
                    type: 'addresses'
                  });

                  json_api_body.linked.addresses.push(buffer_address);
                }
              }

              json_api_body.loopbacks.push(buffer_loopback);

              cb_each(null);
            });
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

            json_api_body['meta'] = {
              loopbacks: {
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
            module: 'interfaces/loopbacks',
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