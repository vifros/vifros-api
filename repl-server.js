// TODO: Add command completion. Needs core Node.js modification.
var exec = require('child_process').exec;
var repl = require('repl');
var net = require('net');

var logger = global.vifros.logger;
var log_tags = logger.tags;
var log_codes = logger.codes;

module.exports = function () {
  /*
   * Checks if `vifros` CLI availability.
   * Don't start the REPL server if is not present in the CLI.
   */
  exec('command -v vifros', function (error, stdout, stderror) {
    if (error) {
      // Is not present. Don't show an error.
      return;
    }

    logger.info('REPL server listening on port 3001.', {
      module: 'core',
      tags  : [
        log_tags.init
      ]
    });

    net.createServer(function (socket) {
      repl
        .start({
          prompt         : 'vifros::remote> ', // TODO: Adding `'remote'.cyan` causes an ugly extra padding.
          input          : socket,
          output         : socket,
          terminal       : true,
          eval           : evalCommand,
          ignoreUndefined: true,
          writer         : writer
        })
        .on('exit', function () {
          socket.end();
        });
    }).listen(3001);
  });
};

/**
 * Custom `eval` function to leverage the CLI functionality.
 *
 * @param {String}    cmd
 * @param {Object}    context
 * @param {String}    filename
 * @param {Function}  cb_eval
 */
function evalCommand(cmd, context, filename, cb_eval) {
  /*
   * By prepending 'vifros' to the cmd to be executed, we are shielding `exec()`
   * against execution of arbitrary commands besides vifros related ones.
   *
   * This is extra to the intended leverage of the already built CLI.
   */
  // Removes extra chars setted by the REPL.
  var new_cmd = cmd.slice(1, -2);

  // Shielding agains re-execution of `configure` command.
  if (new_cmd.split(' ')[0] == 'configure') {
    console.log('You are already in %s mode.', 'configure'.cyan);
    cb_eval(null);
    return;
  }

  exec('vifros ' + new_cmd, function (error, stdout, stderror) {
    /*
     * Ignore `stderror`: `vifros` CLI is already handling that and outputting
     * to `stdout` a proper message to users.
     */
    cb_eval(null, stdout);
  });
}

/**
 * Custom `writer` function to get rid of `util.inspect()`.
 *
 * @param {String}  content
 * @return String}
 */
function writer(content) {
  return content;
}