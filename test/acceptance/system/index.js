var should = require('should');
var supertest = require('supertest');

var config = require('../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system', function () {
  describe('when OPTIONS', function () {
    it('should return only method GET', function (done) {
      api
        .options('/system')
        .expect('Allow', 'GET')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response with the respective level menu items', function (done) {
      api
        .get('/system')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          // Header tests.
          res.header.link.should.exist;

          // Body tests.
          body.should.have.property('links');
          body.links.should.not.be.empty;
          body.links.should.have.properties([
            'logging',
            'tunables',
            'settings',
            'info',
            'ipsets'
          ]);
        })
        .expect(200, done);
    });
  });
});