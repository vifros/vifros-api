var config = require('../../../../../config');

var Address = require('../../common/addresses/models/address').Address;
var Loopback = require('../models/loopback').Loopback;

var logger = global.vifros.logger;
var log_tags = logger.tags;

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
      href: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces/loopbacks/{loopbacks.name}/addresses/{loopbacks.addresses.address}',
      type: 'addresses'
    };

    json_api_body['linked'] = {
      addresses: []
    };
  }

  var json_api_errors = {
    errors: []
  };

  Loopback.findOne({
    name: req.params.loopback
  }, function (error, doc) {
    if (error) {
      logger.error(error.name, {
        module: 'interfaces/loopbacks',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (doc) {
      /*
       * Build JSON API response.
       */
      var buffer = doc.toObject();
      buffer.id = doc._id;

      delete buffer._id;
      delete buffer.__v;

      json_api_body.loopbacks.push(buffer);

      if (!is_addresses_requested) {
        res.json(200, json_api_body); // OK.

        return;
      }

      Address.find({
        interface: buffer.name
      }, function (error, docs) {
        if (error) {
          logger.error(error.name, {
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
          for (var i = 0, j = docs.length;
               i < j;
               i++) {

            var buffer_address = docs[i].toObject();
            buffer_address.id = docs[i]._id;

            delete buffer_address._id;
            delete buffer_address.__v;

            var loopbacks_current_index = json_api_body.loopbacks.length - 1;

            if (!json_api_body.loopbacks[loopbacks_current_index].hasOwnProperty('links')) {
              json_api_body.loopbacks[loopbacks_current_index]['links'] = {};
            }

            if (!json_api_body.loopbacks[loopbacks_current_index]['links'].hasOwnProperty('addresses')) {
              json_api_body.loopbacks[loopbacks_current_index].links['addresses'] = [];
            }

            json_api_body.loopbacks[loopbacks_current_index].links.addresses.push({
              id  : buffer_address.id,
              type: 'addresses'
            });

            json_api_body.linked.addresses.push(buffer_address);
          }
        }

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.send(404); // Not found.
  });
};