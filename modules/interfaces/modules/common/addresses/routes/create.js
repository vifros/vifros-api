var ip_address = require('iproute').address;

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var config = require('../../../../../../config');

var Address = require('../models/address').Address;

module.exports = function (req, res, options) {
  if (!req.is('application/vnd.api+json')) {
    res.json(415, {
      errors: [
        {
          code : 'unsupported_media_type',
          title: 'Unsupported Media Type.'
        }
      ]
    }); // Unsupported Media Type.
    return;
  }

  var json_api_body = {
    links    : {
      addresses: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces' + options.base_url + '/addresses/{addresses.address}'
    },
    addresses: {}
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.addresses.address == 'undefined') {
    failed_required_fields.push('address');
  }

  if (failed_required_fields.length) {
    // Build the error response with the required fields.
    for (var i = 0, j = failed_required_fields.length;
         i < j;
         i++) {

      json_api_errors.errors.push({
        code : log_codes.required_field.code,
        path : failed_required_fields[i],
        title: log_codes.required_field.message
      });
    }

    res.json(400, json_api_errors); // Bad Request.
    return;
  }

  /*
   * Add the needed key aliases.
   */
  var doc_req = req.body.addresses;

  doc_req['dev'] = doc_req['interface'] = options.interface;
  doc_req['local'] = doc_req.address;

  var address = new Address(doc_req);

  ip_address.add(doc_req, function (error) {
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

    /*
     * Save changes to database.
     */
    address.save(function (error) {
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

      var item_to_send = req.body.addresses;

      /*
       * Clean unneeded alias.
       */
      delete item_to_send.dev;
      delete item_to_send.local;

      item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/interfaces' + options.base_url + '/addresses/' + encodeURIComponent(address.address);

      res.location(item_to_send.href);

      /*
       * Build JSON API response.
       */
      json_api_body.addresses = {};
      json_api_body.addresses = item_to_send;

      res.json(200, json_api_body); // OK.
    });
  });
};