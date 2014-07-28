var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/logging/logs/:log', function () {
  describe('when OPTIONS', function () {
    describe('and `:log` is `53ca88f0e4d463e01a14cz1e`', function () {
      it('should return methods GET,DELETE', function (done) {
        api
          .options('/system/logging/logs/53ca88f0e4d463e01a14cz1e')
          .expect('Allow', 'GET,DELETE')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:log` is `53ca88f0e4d463e01a14cz1e` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/system/logging/logs/53ca88f0e4d463e01a14cz1e')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('errors');
            body.errors.should.be.an.Array.of.length(1);
            body.errors[0].should.have.properties([
              'code',
              'title'
            ]);
            body.errors[0].code.should.be.a.String.equal('not_found');
            body.errors[0].title.should.be.a.String.equal('Not found.');
          })
          .expect(404, done);
      });
    });
  });

  describe('when DELETE', function () {
    describe('and `:log` is `53ca88f0e4d463e01a14cz1e` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .delete('/system/logging/logs/53ca88f0e4d463e01a14cz1e')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('errors');
            body.errors.should.be.an.Array.of.length(1);
            body.errors[0].should.have.properties([
              'code',
              'title'
            ]);
            body.errors[0].code.should.be.a.String.equal('not_found');
            body.errors[0].title.should.be.a.String.equal('Not found.');
          })
          .expect(404, done);
      });
    });
  });
});