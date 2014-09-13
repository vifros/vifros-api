var logger = global.vifros.logger;
var log_codes = logger.codes;

/**
 * Validate a doc.
 * Returns an errors array suitable for JSON API responses.
 *
 * @param   {object}      object
 * @param   {function}    cb
 */
exports.validate = function validate(object, cb) {
  var errors = [];

  if (object.id
    && (object.id < 0 || object.id > 2147483648)) {

    errors.push({
      code : log_codes.invalid_value.code,
      path : 'id',
      title: log_codes.invalid_value.message
    });
  }

  cb(null, errors);
};