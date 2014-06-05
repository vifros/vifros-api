#!/usr/bin/env node

var http = require('http'); // TODO: At some point change the protocol to HTTPS. or give the two options?

var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

var config = require('./config');

var app = express();

// All environments
app.set('port', config.website.port
  || process.env.PORT
  || 3000);

app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(require('method-override')());

var logger = require('./common/logger').logger;
var log_tags = require('./common/logger').tags;

// Log API requests.
app.use(function (req, res, next) {
  res.links({
    profile: 'http://api.example.com/profile' // TODO: Update the URL when the API documentation gets published.
  });

  res.on('finish', function () {
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

if (app.get('env') == 'development') {
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
require('./init')(app, function (error) {
  if (error) {
    /*
     * Do nothing. This error is already handled by the innermost package.
     * For now, do not start the server.
     */
    logger.error('Application will not start due init errors.', {
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
  server.listen(app.get('port'), function () {
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
process.on('uncaughtException', function (error) {
  logger.error(error.message, {
    module: 'core',
    tags  : [
      log_tags.uncaught
    ],
    data  : {
      stack: error.stack
    }
  });

  // Exit the app with error status.
  process.exit(1);
});