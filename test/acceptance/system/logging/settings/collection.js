// TODO: Add system/settings tests and move this one to logging/settings

var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/logging/settings', function () {
  describe('when OPTIONS', function () {
    it('should return only method GET', function (done) {
      api
        .options('/system/logging/settings')
        .expect('Allow', 'GET')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response', function (done) {
      api
        .get('/system/logging/settings')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          // Header tests.
          res.header.link.should.exist;

          // Body tests.
          body.should.have.property('links');
          body.links.should.not.be.empty;
        })
        .expect(200, done);
    });

    it('should return a valid `settings` collection response', function (done) {
      api
        .get('/system/logging/settings')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          body.links.should.have.property('settings');
          body.should.have.property('settings');
          body.settings.should.be.an.Array;
          body.settings.should.have.a.lengthOf(3);
        })
        .expect(200, done);
    });
  });
});