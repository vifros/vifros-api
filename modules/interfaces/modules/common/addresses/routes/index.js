var async = require('async');
var lodash = require('lodash');

var config = require('../../../../../../config');

var Address = require('../models/address').Address;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var jsonapi = require('../../../../../../utils/jsonapi');

module.exports = function (req, res, options) {
  /*
   * Check for external calling.
   */
  var is_public_call = false;
  if (typeof options == 'object') {
    is_public_call = true;
  }

  var json_api_body = {};
  if (!options.single) {
    json_api_body.links = {
      addresses: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces' + options.base_url + '/addresses/{addresses.address}'
    };
  }
  json_api_body.addresses = (options.single) ? {} : [];

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

  query_filter = lodash.merge(query_filter, filter);
  query_options.select = '-interface';

  Address.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error, {
        module: 'interfaces/addresses',
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

    if (!options.single) {
      json_api_body['meta'] = {
        addresses: {
          total : null, // Below will be reseated to the correct value
          limit : Number(query_options.limit),
          offset: Number(query_options.skip)
        }
      };
    }

    if (!docs.length && !options.single) {
      json_api_body.meta.addresses.total = 0;

      res.json(200, json_api_body); // OK.
      return;
    }
    else if (!docs.length && options.single) {
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

    async.parallel([
      function (cb_parallel) {
        async.each(docs, function (item, cb_each) {
          var buffer = item.toObject();

          delete buffer._id;
          delete buffer.__v;

          if (options.single) {
            json_api_body.addresses = buffer;
          }
          else {
            json_api_body.addresses.push(buffer);
          }

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

          if (!options.single) {
            json_api_body.meta.addresses.total = count;
          }

          cb_parallel(null);
        });
      }
    ], function (error) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/addresses',
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