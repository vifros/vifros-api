var async = require('async');
var lodash = require('lodash');

var config = require('../../../../config');

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;

var Setting = require('../models/setting').Setting;

var jsonapi = require('../../../../utils/jsonapi');

module.exports = function (req, res, options) {
  /*
   * Check for external calling.
   */
  var is_public_call = false;
  if (typeof options == 'object') {
    is_public_call = true;
  }

  var json_api_body = {
    links   : {
      settings: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + options.base_url + '/settings/{settings.name}'
    },
    settings: (options.single) ? {} : []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'settings',
    model        : Setting
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'settings',
    model        : Setting
  });

  var filter = {};
  if (is_public_call && typeof options.filter != 'undefined') {
    filter = options.filter;
  }

  query_filter = lodash.merge(query_filter, filter);
  query_options.nor = [
    {
      name: 'status'
    }
  ];

  Setting.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'common/settings',
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

    if (!docs.length && options.single) {
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
            json_api_body.settings = buffer;
          }
          else {
            json_api_body.settings.push(buffer);
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
        query_filter.$nor = [
          {
            name: 'status'
          }
        ];
        Setting.count(query_filter, function (error, count) {
            if (error) {
              cb_parallel(error);
              return;
            }

            if (!options.single) {
              json_api_body['meta'] = {
                settings: {
                  total : count,
                  limit : Number(query_options.limit),
                  offset: Number(query_options.skip)
                }
              };
            }

            cb_parallel(null);
          }
        );
      }
    ], function (error) {
      if (error) {
        logger.error(error, {
          module: 'common/settings',
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