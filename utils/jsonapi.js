var config = require('../config');

/**
 * Build a query filter object suitable for db queries from a JSON API request.
 *
 * @param options.req
 * @param options.resource_name
 * @param options.model
 *
 * @returns {Object}
 */
exports.buildQueryFilterFromReq = function buildQueryFilterFromReq(options) {
  var query_fields = {};

  if (options.req.query) {
    var schema_vars = JSON.parse(JSON.stringify(options.model.schema.paths)); // This construction is to do a deep copy.
    delete schema_vars._id;
    delete schema_vars.__v;

    for (var param in options.req.query) {
      // Ensure iteration over own properties.
      if (options.req.query.hasOwnProperty(param)) {
        // Actual checking.
        if (schema_vars.hasOwnProperty(param)) {
          if (schema_vars[param].instance != 'Number') {
            query_fields[param] = new RegExp(options.req.query[param]);
          }
          else {
            query_fields[param] = options.req.query[param];
          }
        }
      }
    }
  }
  return query_fields;
};

/**
 * Build a query options object suitable for db queries from a JSON API request.
 *
 * @param options.req
 * @param options.resource_name
 * @param options.model
 *
 * @returns {Object}
 */
exports.buildQueryOptionsFromReq = function buildQueryOptionsFromReq(options) {
  var query_options = {};

  /*
   * Pagination.
   */
  // Limit.
  if (options.req.query.limit
    && typeof options.req.query.limit != 'object') {

    query_options.limit = options.req.query.limit;
  }
  else if (options.req.query.limit
    && typeof options.req.query.limit == 'object'
    && options.req.query.limit[options.resource_name]) {

    query_options.limit = options.req.query.limit[options.resource_name];
  }
  else {
    query_options.limit = config.get('api:pagination:limit');
  }

  // Offset.
  if (options.req.query.offset
    && typeof options.req.query.offset != 'object') {

    query_options.skip = options.req.query.offset;
  }
  else if (options.req.query.offset
    && typeof options.req.query.offset == 'object'
    && options.req.query.offset[options.resource_name]) {

    query_options.skip = options.req.query.offset[options.resource_name];
  }
  else {
    query_options.skip = 0;
  }

  /*
   * Sorting.
   */
  if (options.req.query.sort
    && typeof options.req.query.sort != 'object') {

    query_options.sort = options.req.query.sort.replace(',', ' ');
  }
  else if (options.req.query.sort
    && typeof options.req.query.sort == 'object'
    && options.req.query.sort[options.resource_name]) {

    query_options.sort = options.req.query.sort[options.resource_name].replace(',', ' ');
  }

  /*
   * Sparse fields.
   */
  var req_fields;

  if (options.req.query.fields) {
    if (typeof options.req.query.fields != 'object') {

      req_fields = options.req.query.fields;
    }
    else if (typeof options.req.query.fields == 'object'
      && options.req.query.fields[options.resource_name]) {

      req_fields = options.req.query.fields[options.resource_name];
    }
    else {
      req_fields = '';
    }

    if (req_fields) {
      var schema_vars = JSON.parse(JSON.stringify(options.model.schema.paths)); // This construction is to do a deep copy.
      delete schema_vars._id;
      delete schema_vars.__v;

      var fields = [];

      for (var i = 0, j = Object.keys(schema_vars).length;
           i < j;
           i++) {

        var key = Object.keys(schema_vars)[i];

        if (req_fields.search(key) == -1) {
          fields.push('-' + key);
        }
      }

      query_options.select = fields.join(' ');
    }
  }
  return query_options;
};