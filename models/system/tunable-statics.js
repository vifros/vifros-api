var exec = require('child_process').exec;

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
    && typeof options.value != 'undefined') {

    args = args.concat('-w', options.path + '=' + options.value); // It can not be --write since is not supported in older kernels.
  }

  /*
   * Execute command.
   */
  exec(cmd.concat(args).join(' '), function (error, stdout, stderror) {
    if (error) {
      cb(stderror.replace(/\n/g, '') + '. Executed command line: ' + cmd.concat(args).join(' '));

      return;
    }

    cb(null);
  });
};