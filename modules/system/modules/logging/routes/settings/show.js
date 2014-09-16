var config = require('../../../../../../config');

module.exports = function (req, res) {
  var json_api_body = {
    settings: {}
  };

  var buffer = {
    name : req.params.setting,
    value: null
  };

  switch (req.params.setting) {
    case 'transport_console':
      buffer.value = config.get('logging:transports:console');

      json_api_body.settings = buffer;

      res.json(200, json_api_body); // OK.
      break;

    case 'transport_file':
      buffer.value = config.get('logging:transports:file');

      json_api_body.settings = buffer;

      res.json(200, json_api_body); // OK.
      break;

    case 'transport_mongodb':
      buffer.value = config.get('logging:transports:mongodb');

      json_api_body.settings = buffer;

      res.json(200, json_api_body); // OK.
      break;

    default:
      res.json(404, {
        errors: [
          {
            code : 'not_found',
            title: 'Not found.'
          }
        ]
      }); // Not found.
      break;
  }
};