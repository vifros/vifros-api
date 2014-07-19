var async = require('async');
var lodash = require('lodash');

var config = require('../../../../../../config');

var Address = require('../models/address').Address;

var logger = require('../../../../../../common/logger').logger;
var log_tags = require('../../../../../../common/logger').tags;
var log_codes = require('../../../../../../common/logger').codes;

var jsonapi = require('../../../../../../utils/jsonapi');

module.exports = function (req, res, options) {
  /*
   * Check for external calling.
   */
  var is_public_call = false;
  if (typeof options == 'object') {
    is_public_call = true;
  }

  var json_api_body = {
    links    : {
      addresses: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces' + options.base_url + '/addresses/{addresses.address}'
    },
    addresses: []
  };

  var json_api_errors = {
    errors: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'addresses',
    model        : Address
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'addresses',
    model        : Address
  });

  var filter = {};
  if (is_public_call && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  // TODO: Find a way to do a merge to let go `lodash`.
  query_filter = lodash.merge(query_filter, filter);

  Address.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/addresses',
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

            json_api_body.addresses.push(buffer);

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
          Address.count(query_filter, function (error, count) {
            if (error) {
              cb_parallel(error);

              return;
            }

            json_api_body['meta'] = {
              addresses: {
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
          logger.error(error.message, {
            module: 'interfaces/addresses',
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