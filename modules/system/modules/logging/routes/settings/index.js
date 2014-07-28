var config = require('../../../../../../config');


module.exports = function (req, res) {
  var json_api_body = {
    links   : {
      settings: req.protocol + '://' + req.get('Host') + config.get('api:prefix') + '/system/logging/settings/{settings.name}'
    },
    settings: [
      {
        name : 'transport_console',
        value: config.get('logging:transports:console')
      },
      {
        name : 'transport_file',
        value: config.get('logging:transports:file')
      },
      {
        name : 'transport_mongodb',
        value: config.get('logging:transports:mongodb')
      }
    ]
  };

  res.json(200, json_api_body); // OK.
};