#!/usr/bin/env node

var express = require('express');
var http = require('http'); // TODO: At some point change the protocol to HTTPS. or give the two options?

var config = require('./config');
var pkg_info = require('./package.json');

var app = express();

// All environments
app.set('port', config.website.port
	|| process.env.PORT
	|| 3000);

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(pkg_info.name));
app.use(express.session());

// Log API requests.
app.use(function (req, res, next) {
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

	next();
});

app.use(app.router);

if (app.get('env') == 'development') {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack     : true
	}));

	app.locals.pretty = true;
}

if (app.get('env') == 'production') {
	app.use(express.errorHandler());
}

var logger = require('./common/logger').logger;
var log_tags = require('./common/logger').tags;

// Connect to database.
require('./common/db').connect();

// Setup routes.
require('./routes')(app);

// Initialize app.
require('./init')(function (error) {
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
	}
	else {
		var server = http.createServer(app);
		server.listen(app.get('port'), function () {
			logger.info('Server listening on port ' + app.get('port') + '.', {
				module: 'core',
				tags  : [
					log_tags.init
				]
			});
		});
	}
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