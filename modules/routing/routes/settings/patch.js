var ip_forward = require('iproute').utils.ip_forward;

var settings_patch = require('../../../common/settings/routes/patch');

module.exports = function (req, res) {
  try {
    /*
     * Delegate the responsibility to send the response to this method.
     */
    settings_patch(req, res, {
      cb_patch: cb_patch
    });
  }
  catch (error) {
    res.send(500); // Internal Server Error.
  }
};

/*
 * Function for cross-relationships.
 */
function cb_patch(setting, cb) {
  if (typeof arguments[0] != 'object'
    || typeof arguments[1] != 'function') {

    throw new Error('Invalid arguments. Signature: (setting, callback)');
  }

  switch (setting.name) {
    case 'ip_forward_v4':
      if (setting.value == '0') {
        ip_forward.v4.disable(function (error) {
          if (error) {
            cb(error);

            return;
          }

          cb(null);
        });

        return;
      }

      if (setting.value == '1') {
        ip_forward.v4.enable(function (error) {
          if (error) {
            cb(error);

            return;
          }

          cb(null);
        });

        return;
      }

      cb('Error: invalid ip_forward_v4 value, has to be 0 or 1 and it is: ' + setting.value);

      break;

    case 'ip_forward_v6':
      if (setting.value == '0') {
        ip_forward.v6.disable(function (error) {
          if (error) {
            cb(error);

            return;
          }

          cb(null);
        });

        return;
      }

      if (setting.value == '1') {
        ip_forward.v6.enable(function (error) {
          if (error) {
            cb(error);

            return;
          }

          cb(null);
        });

        return;
      }

      cb('Error: invalid ip_forward_v6 value, has to be 0 or 1 and it is: ' + setting.value);

      break;

    default:
      cb(null);

      break;
  }
}