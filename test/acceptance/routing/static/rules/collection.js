var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/routing/static/rules', function () {
  describe('when OPTIONS', function () {
    it('should return methods GET,POST', function (done) {
      api
        .options('/routing/static/rules')
        .expect('Allow', 'GET,POST')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response', function (done) {
      api
        .get('/routing/static/rules')
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

    it('should return a valid `rules` collection response', function (done) {
      api
        .get('/routing/static/rules')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          body.links.should.have.property('rules');
          body.should.have.property('rules');
          body.rules.should.be.an.Array;
        })
        .expect(200, done);
    });

    it('should reflect the proper pagination object by default', function (done) {
      api
        .get('/routing/static/rules')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          // Body tests.
          body.should.have.property('meta');
          body.meta.should.have.property('rules');
          body.meta.rules.should.have.properties([
            'total',
            'offset',
            'limit'
          ]);
          body.meta.rules.limit.should.be.equal(10);
          body.meta.rules.offset.should.be.equal(0);
        })
        .expect(200, done);
    });

    describe('and limit:2, offset:1', function () {
      it('should reflect the proper pagination object', function (done) {
        api
          .get('/routing/static/rules')
          .query({
            limit : 2,
            offset: 1
          })
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // Body tests.
            body.should.have.property('meta');
            body.meta.should.have.property('rules');
            body.meta.rules.should.have.properties([
              'total',
              'offset',
              'limit'
            ]);
            body.meta.rules.limit.should.be.equal(2);
            body.meta.rules.offset.should.be.equal(1);
          })
          .expect(200, done);
      });
    });
  });

  describe('when POST', function () {
    describe('and missing data required fields', function () {
      it('should return a 400 error', function (done) {
        api
          .post('/routing/static/rules')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            rules: {
            }
          }))
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('errors');
            body.errors.should.be.an.Array.of.length(3);
          })
          .expect(400, done);
      });
    });

    describe('and trying to create a valid vlan', function () {
      after(function (done) {
        // Delete the resource.
        api
          .delete('/routing/static/rules/500')
          .expect(204, done);
      });

      it('should create a `vlan` and return a valid JSON-API response', function (done) {
        api
          .post('/routing/static/rules')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            rules: {
              type    : 'unicast',
              priority: 500,
              table   : 254
            }
          }))
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // Header tests.
            res.header.link.should.exist;
            res.header.location.should.exist;

            // Body tests.
            body.should.have.property('links');
            body.links.should.not.be.empty;
            body.should.have.property('rules');
            body.rules.should.have.properties({
              type    : 'unicast',
              priority: 500,
              table   : 254
            });
            body.rules.should.have.properties([
              'href',
              'id'
            ]);
            body.rules.href.should.be.equal(res.header.location);
          })
          .expect(200, done);
      });
    });
  });
});