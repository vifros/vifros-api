#!/usr/bin/env node

var path = require('path');
var http = require('http'); // TODO: At some point change the protocol to HTTPS. or give the two options?
var express = require('express');
var errorHandler = require('errorhandler');

var config = require('./config');

var logger = require('./common/logger').logger;
var log_tags = require('./common/logger').tags;
var log_codes = require('./common/logger').codes;

global['vifros'] = {};
global.vifros.logger = logger;
global.vifros.logger.tags = log_tags;
global.vifros.logger.codes = log_codes;

var app = express();

// All environments
app.set('port', config.get('api:port')
  || process.env.PORT
  || 3000);

// TODO: At some point move this to the POST/PUT calls themselves?
app.use(require('body-parser').json({type: 'application/vnd.api+json'}));
app.use(require('method-override')());

// Log API requests.
app.use(function (req, res, next) {
  res.links({
    profile: 'http://api.example.com/profile' // TODO: Update the URL when the API documentation gets published.
  });

  // Unless explicitly stated, all responses are JSON API ones.
  res.type('application/vnd.api+json');

  res.on('finish', function cbOnResFinish() {
    logger.info('API request.', {
      module: 'core',
      tags  : [
        log_tags.api_request
      ],
      data  : {
        req: {
          method: req.method,
          url   : req.url,
          ip    : req.ip
        },
        res: {
          status_code: res.statusCode
        }
      }
    });
  });

  next();
});

if (app.get('env') == 'development'
  || app.get('env') == 'test') {

  app.use(errorHandler({
    dumpExceptions: true,
    showStack     : true
  }));
  app.locals.pretty = true;
}

if (app.get('env') == 'production') {
  app.use(errorHandler());
}

// Connect to database.
require('./common/db').connect();

// Setup root routes.
require('./routes')(app);

// Initialize app.
require('./init')(app, function cbOnAppInit(error) {
  if (error) {
    /*
     * Do nothing. This error is already handled by the innermost package.
     * For now, log a final error and do not start the server.
     */
    logger.error('Application won\'t start due init errors.', {
      module: 'core',
      tags  : [
        log_tags.init
      ]
    });

    // Exit the app with error status.
    process.exit(1);
    return;
  }

  var server = http.createServer(app);
  server.listen(app.get('port'), function cbOnServerListen() {
    logger.info('Server listening on port ' + app.get('port') + '.', {
      module: 'core',
      tags  : [
        log_tags.init
      ]
    });

    // Init the REPL.
    require('./repl-server')();
  });
});

/*
 * Log uncaught errors and act accordingly.
 * http://shapeshed.com/uncaught-exceptions-in-node/
 */
process.on('uncaughtException', function cbOnUncaughtException(error) {
  logger.error(error, {
    module: 'core',
    tags  : [
      log_tags.uncaught
    ]
  });

  // Exit the app with error status.
  process.exit(1);
});