var async = require('async');

var config = require('../../../../../config');

var VLAN = require('../models/vlan').VLAN;

var logger = global.vifros.logger;
var log_tags = logger.tags;

var jsonapi = require('../../../../../utils/jsonapi');

module.exports = function (req, res) {
  var json_api_body = {
    links: {
      vlans            : req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/vlans/{vlans.interface}.{vlans.tag}',
      'vlans.addresses': req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/vlans/{vlans.interface}.{vlans.tag}/addresses'
    },
    vlans: []
  };

  var query_filter = jsonapi.buildQueryFilterFromReq({
    req          : req,
    resource_name: 'vlans',
    model        : VLAN
  });

  var query_options = jsonapi.buildQueryOptionsFromReq({
    req          : req,
    resource_name: 'vlans',
    model        : VLAN
  });

  VLAN.find(query_filter, {}, query_options, function (error, docs) {
    if (error) {
      logger.error(error.message, {
        module: 'interfaces/vlans',
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
      vlans: {
        total : null, // Below will be reseted to the correct value
        limit : Number(query_options.limit),
        offset: Number(query_options.skip)
      }
    };

    if (!docs.length) {
      json_api_body.meta.vlans.total = 0;

      res.json(200, json_api_body); // OK.
      return;
    }

    async.parallel([
      function (cb_parallel) {
        async.each(docs, function (item, cb_each) {
          var buffer_vlan = item.toObject();

          delete buffer_vlan._id;
          delete buffer_vlan.__v;

          json_api_body.vlans.push(buffer_vlan);

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
        VLAN.count(query_filter, function (error, count) {
          if (error) {
            cb_parallel(error);
            return;
          }

          json_api_body.meta.vlans.total = count;

          cb_parallel(null);
        });
      }
    ], function (error) {
      if (error) {
        logger.error(error, {
          module: 'interfaces/vlans',
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