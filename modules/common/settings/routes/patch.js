var jsonpatch = require('json-patch');

var Setting = require('../models/setting').Setting;

var logger = require('../../../../common/logger').logger;
var log_tags = require('../../../../common/logger').tags;
var log_codes = require('../../../../common/logger').codes;

module.exports = function (req, res, options) {
  if (!req.is('application/json-patch+json')) {
    res.send(415); // Unsupported Media Type.

    return;
  }

  var json_api_errors = {
    errors: []
  };

  Setting.findOne({
    name: req.params.setting
  }, function (error, doc) {
    if (error) {
      logger.error(error.message, {
        module: 'common/settings',
        tags  : [
          log_tags.api_request,
          log_tags.db
        ]
      });

      res.send(500); // Internal Server Error.

      return;
    }

    if (!doc) {
      res.send(404); // Not found.

      return;
    }

    /*
     * Validate received patch.
     */
    // Prepare doc for patching.
    var doc_patch = {};

    var buffer = doc.toObject();

    delete buffer._id;
    delete buffer.__v;

    doc_patch.settings = [buffer];

    /*
     * Add the not present variables since the patch need those to work properly.
     * Remember to remove the null variables later, after processing is done.
     */
    var schema_vars = JSON.parse(JSON.stringify(Setting.schema.paths)); // This construction is to do a deep copy.
    delete schema_vars._id;
    delete schema_vars.__v;

    for (var i = 0, j = Object.keys(schema_vars).length;
         i < j;
         i++) {

      var key = Object.keys(schema_vars)[i];

      if (!doc_patch.settings[0].hasOwnProperty(key)) {
        doc_patch.settings[0][key] = null;
      }
    }

    try {
      jsonpatch.apply(doc_patch, req.body);
    }
    catch (error) {
      logger.error(error.message, {
        module: 'common/settings',
        tags  : [
          log_tags.api_request
        ]
      });

      json_api_errors.errors.push({
        code   : log_codes.json_patch_error.code,
        message: log_codes.json_patch_error.message
      });

      res.json(400, json_api_errors); // Bad Request.

      return;
    }

    /*
     * Remove the null variables needed by json-patch.
     */
    for (var i = 0, j = Object.keys(doc_patch.settings[0]).length;
         i < j;
         i++) {

      var key = Object.keys(schema_vars)[i];

      if (doc_patch.settings[0][key] == null) {
        delete doc_patch.settings[0][key];
      }
    }

    var valid_changed_options = {};
    var readonly_changed_fields = [];
    for (var i = 0, j = req.body.length;
         i < j;
         i++) {

      var path = req.body[i].path.split('/settings/0/')[1];

      // Check for readonly params.
      if (path == 'module'
        || path == 'name') {

        readonly_changed_fields.push(path);
      }
      else {
        valid_changed_options[path] = req.body[i].value;
      }
    }

    if (readonly_changed_fields.length) {
      // There are requests to change readonly values, so throw an error.
      // Build the error response with the required fields.
      for (var i = 0, j = readonly_changed_fields.length;
           i < j;
           i++) {

        json_api_errors.errors.push({
          code   : log_codes.readonly_field.code,
          field  : '/settings/0/' + readonly_changed_fields[i],
          message: log_codes.readonly_field.message
        });
      }

      res.json(400, json_api_errors); // Bad Request.

      return;
    }

    /*
     * Cross relationships functionality execution.
     * If this is used it means that changing this setting have side effects.
     */
    if (options && options.cb_patch) {
      options.cb_patch(doc_patch.settings[0], function (error) {
        if (error) {
          logger.error(error, {
            module: 'common/settings',
            tags  : [
              log_tags.cross_rel
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        Setting.findOneAndUpdate({
            name: req.params.setting
          }, doc_patch.settings[0],
          function (error) {
            if (error) {
              logger.error(error.message, {
                module: 'common/settings',
                tags  : [
                  log_tags.api_request
                ]
              });

              res.send(500); // Internal Server Error.

              return;
            }

            res.send(204); // No Content.
          });
      });

      return;
    }

    Setting.findOneAndUpdate({
        name: req.params.setting
      }, doc_patch.settings[0],
      function (error) {
        if (error) {
          logger.error(error.message, {
            module: 'common/settings',
            tags  : [
              log_tags.api_request
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        res.send(204); // No Content.
      });
  });
};