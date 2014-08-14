var async = require('async');

var config = require('../../../../../../config');
var lodash = require('lodash');

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;
var StaticRoutingRoute = require('../../models/route').StaticRoutingRoute;

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

  var json_api_body = {
    links : {
      routes: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static' + options.base_url + '/routes/{routes.id}'
    },
    routes: (options.single) ? {} : []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'routes',
    model        : StaticRoutingRoute
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'routes',
    model        : StaticRoutingRoute
  });

  var filter = {};
  if (is_public_call && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  query_filter = lodash.merge(query_filter, filter);

  StaticRoutingRoute.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'routing/static/routes',
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
        routes: {
          total : null, // Below will be reseted to the correct value
          limit : Number(query_options.limit),
          offset: Number(query_options.skip)
        }
      };
    }

    if (!docs.length && !options.single) {
      json_api_body.meta.routes.total = 0;

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
          buffer.id = item._id;

          delete buffer._id;
          delete buffer.__v;

          if (options.single) {
            json_api_body.routes = buffer;
          }
          else {
            json_api_body.routes.push(buffer);
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
        StaticRoutingRoute.count(query_filter, filter, function (error, count) {
          if (error) {
            cb_parallel(error);
            return;
          }

          if (!options.single) {
            json_api_body.meta.routes.total = count;
          }

          cb_parallel(null);
        });
      }
    ], function (error) {
      if (error) {
        logger.error(error.message, {
          module: 'routing/static/routes',
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