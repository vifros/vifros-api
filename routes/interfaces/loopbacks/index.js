var async = require('async');

var config = require('../../../config');

var Address = require('../../../models/interfaces/address').Address;
var Loopback = require('../../../models/interfaces/loopback').Loopback;

var logger = require('../../../common/logger').logger;
var log_tags = require('../../../common/logger').tags;

module.exports = function (req, res) {
  res.type('application/vnd.api+json');

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
      loopbacks            : req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/loopbacks' + '/' + '{loopbacks.name}',
      'loopbacks.addresses': req.protocol + '://' + req.get('Host') + config.api.prefix + '/interfaces/loopbacks' + '/' + '{loopbacks.name}' + '/addresses'
    },
    loopbacks: []
  };

  /*
   * Add linked data if was requested to response.
   */
  if (is_addresses_requested) {
    json_api_body.links['loopbacks.addresses'] = {
      href: req.protocol + '://' + req.get('Host') + req.get('Host') + config.api.prefix + '/interfaces/loopbacks/{loopbacks.name}/addresses/{loopbacks.addresses.address}',
      type: 'addresses'
    };

    json_api_body['linked'] = {
      addresses: []
    };
  }

  var json_api_errors = {
    errors: []
  };

  Loopback.find({}, function (error, docs) {
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
        field  : '',
        message: error.message
      });

      res.json(500, json_api_errors); // Internal Server Error.

      return;
    }

    if (docs && docs.length) {
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
              field  : '',
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
          logger.error(error, {
            module: 'interfaces/loopbacks',
            tags  : [
              log_tags.api_request
            ]
          });

          json_api_errors.errors.push({
            code   : '',
            field  : '',
            message: error
          });

          res.json(500, json_api_errors); // Internal Server Error.

          return;
        }

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.json(404, json_api_body); // Not found.
  });
};