var should = require('should');
var supertest = require('supertest');

var config = require('../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/routing', function () {
  describe('when OPTIONS', function () {
    it('should return only method GET', function (done) {
      api
        .options('/routing')
        .expect('Allow', 'GET')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response with the respective level menu items', function (done) {
      api
        .get('/routing')
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
            'static',
            'settings'
          ]);
        })
        .expect(200, done);
    });
  });
});