var async = require('async');

var config = require('../../../../../config');

var logger = global.vifros.logger;
var log_tags = logger.tags;

var IPSet = require('../models/ipset').IPSet;

module.exports = function (req, res) {
  var json_api_body = {
    links : {
      ipsets: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/ipsets' + '/' + '{ipsets.name}'
    },
    ipsets: []
  };

  IPSet.findOne({
    name: req.params.ipset
  }, function (error, doc) {
    if (error) {
      logger.error(error, {
        module: 'system/ipsets',
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

      var ipset_models = require('../models/' + doc.type.replace(/:|,/, '-'));

      var model_name = '';
      for (var i = 0, j = doc.type.split(/:|,/), k = j.length;
           i < k;
           i++) {

        // Capitalize.
        model_name += j[i].charAt(0).toUpperCase() + j[i].slice(1);
      }

      ipset_models[model_name + 'Options'].findOne({
        ipset: doc.name
      }, function (error, doc_option) {
        if (error) {
          logger.error(error, {
            module: 'system/ipsets',
            tags  : [
              log_tags.api_request,
              log_tags.db
            ]
          });

          res.send(500); // Internal Server Error.

          return;
        }

        if (doc_option) {
          buffer.options = doc_option;
        }

        json_api_body.ipsets.push(buffer);

        res.json(200, json_api_body); // OK.
      });

      return;
    }

    res.send(404); // Not found.
  });
};