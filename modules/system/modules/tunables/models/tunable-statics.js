var exec = require('child_process').exec;
var async = require('async');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

/*
 *  Overwrites OS status with DB attributes.
 */
exports.createFromObjectToOS = function (options, cb) {
  if (typeof arguments[0] != 'object'
    || typeof arguments[1] != 'function') {

    throw new Error('Invalid arguments. Signature: (options, callback)');
  }

  /*
   * Build cmd to execute.
   */
  var cmd = ['sysctl'];
  var args = [];

  /*
   * Process options.
   */
  if (typeof options.path != 'undefined'
    && typeof options.value != 'undefined'
    && typeof options.value.current != 'undefined') {

    args = args.concat('-w', options.path + '=' + options.value.current); // It can not be --write since is not supported in older kernels.
  }

  /*
   * Execute command.
   */
  exec(cmd.concat(args).join(' '), function (error, stdout, stderror) {
    if (error) {
      var err = new Error(stderror.replace(/\n/g, ''));
      err.cmd = cmd.concat(args).join(' ');
      err.code = error.code;

      cb(err);
      return;
    }

    cb(null);
  });
};

/**
 * Validate a doc to be updated.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  async.parallel([
    function (cb_parallel) {
      /*
       * path.
       */
      if (object.path) {
        // Tests for file descriptor existence. Throws error if is not there.
        exec('sysctl ' + object.path, function (error, stdout, stderror) {
          if (error) {
            errors.push({
              code : log_codes.invalid_value.code,
              path : 'path',
              title: log_codes.invalid_value.message
            });

            cb_parallel(null);
            return;
          }

          cb_parallel(null);
        });
        return;
      }

      cb_parallel(null);
    }
  ], function (error) {
    if (error) {
      cb(error);
      return;
    }

    cb(null, errors);
  });
};