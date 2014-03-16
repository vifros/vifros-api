#!/usr/bin/env node

var express = require('express');
var http = require('http'); // TODO: At some point change the protocol to HTTPS.

var config = require('./config');
var pkg_info = require('./package.json');

var app = express();

// All environments
app.set('port', config.website.port
	|| process.env.PORT
	|| 3000);

//// TODO: Log API requests.
//app.use(function (req, res, next) {
//	console.log(res.server_code)
//	next()
//});

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(pkg_info.name));
app.use(express.session());
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