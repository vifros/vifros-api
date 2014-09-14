var routing_tables = require('iproute').utils.routing_tables;

var config = require('../../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

var StaticRoutingTable = require('../../models/table').StaticRoutingTable;

module.exports = function (req, res) {
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
    links : {
      tables: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/tables/{tables.id}'
    },
    tables: {}
  };

  var json_api_errors = {
    errors: []
  };

  /*
   * Check for required values.
   */
  var failed_required_fields = [];

  if (typeof req.body.tables.id == 'undefined') {
    failed_required_fields.push('id');
  }
  if (typeof req.body.tables.name == 'undefined') {
    failed_required_fields.push('name');
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
   * Check if there is already a table with the same id or name.
   */
  StaticRoutingTable.findOne({
    $or: [
      {
        id: req.body.tables.id
      },
      {
        name: req.body.tables.name
      }
    ]
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'routing/static/tables',
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

    if (doc) {
      /*
       * There is already a table, so throw an error.
       * TODO: Research how to be more specific in returning the actual path
       * that triggered the error since it can be one of them or both.
       */
      json_api_errors.errors.push({
        code : log_codes.already_present.code,
        path : 'id',
        title: log_codes.already_present.message
      });

      json_api_errors.errors.push({
        code : log_codes.already_present.code,
        path : 'name',
        title: log_codes.already_present.message
      });

      res.json(400, json_api_errors); // Bad Request.
      return;
    }

    // Run the field validations.
    StaticRoutingTable.validate(req.body.tables, function (error, api_errors) {
      if (error) {
        logger.error(error, {
          module: 'routing/static/tables',
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

      if (api_errors.length) {
        res.json(400, {
          errors: api_errors
        }); // Bad Request.
        return;
      }

      var table = new StaticRoutingTable(req.body.tables);
      routing_tables.add(table, function (error) {
        if (error) {
          logger.error(error, {
            module: 'routing/static/tables',
            tags  : [
              log_tags.api_request,
              log_tags.os
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
        table.save(function (error) {
          if (error) {
            logger.error(error, {
              module: 'routing/static/tables',
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

          var item_to_send = req.body.tables;

          item_to_send.href = req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/routing/static/tables/' + table.id;

          res.location(item_to_send.href);

          /*
           * Build JSON API response.
           */
          json_api_body.tables = item_to_send;

          res.json(200, json_api_body); // OK.
        });
      });
    });
  });
};