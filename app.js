#!/usr/bin/env node

var http = require('http'); // TODO: At some point change the protocol to HTTPS. or give the two options?
var express = require('express');
var errorHandler = require('errorhandler');

var config = require('./config');
var logger = require('./common/logger').logger;
var log_tags = require('./common/logger').tags;

var app = express();

// All environments
app.set('port', config.get('api:port')
  || process.env.PORT
  || 3000);

// TODO: At some point move this to the POST calls themselves.
// TODO: Add the parser for PATCH verbs too.
app.use(require('body-parser').json({type: 'application/vnd.api+json'}));
app.use(require('method-override')()); // TODO: What is this for?

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
     * For now, do not start the server.
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