var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/routing/static/tables', function () {
  describe('when OPTIONS', function () {
    it('should return methods GET,POST', function (done) {
      api
        .options('/routing/static/tables')
        .expect('Allow', 'GET,POST')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response', function (done) {
      api
        .get('/routing/static/tables')
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

    it('should return a valid `tables` collection response', function (done) {
      api
        .get('/routing/static/tables')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          body.links.should.have.property('tables');
          body.should.have.property('tables');
          body.tables.should.be.an.Array;
        })
        .expect(200, done);
    });

    it('should reflect the proper pagination object by default', function (done) {
      api
        .get('/routing/static/tables')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          // Body tests.
          body.should.have.property('meta');
          body.meta.should.have.property('tables');
          body.meta.tables.should.have.properties([
            'total',
            'offset',
            'limit'
          ]);
          body.meta.tables.limit.should.be.equal(10);
          body.meta.tables.offset.should.be.equal(0);
        })
        .expect(200, done);
    });

    describe('and limit:2, offset:1', function () {
      it('should reflect the proper pagination object', function (done) {
        api
          .get('/routing/static/tables')
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
            body.meta.should.have.property('tables');
            body.meta.tables.should.have.properties([
              'total',
              'offset',
              'limit'
            ]);
            body.meta.tables.limit.should.be.equal(2);
            body.meta.tables.offset.should.be.equal(1);
          })
          .expect(200, done);
      });
    });
  });

  describe('when POST', function () {
    describe('and missing data required fields', function () {
      it('should return a 400 error', function (done) {
        api
          .post('/routing/static/tables')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            tables: {
            }
          }))
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('errors');
            body.errors.should.be.an.Array.of.length(2);
          })
          .expect(400, done);
      });
    });

    describe('and trying to create a valid table', function () {
      after(function (done) {
        // Delete the resource.
        api
          .delete('/routing/static/tables/500')
          .expect(204, done);
      });

      it('should create a `table` and return a valid JSON-API response', function (done) {
        api
          .post('/routing/static/tables')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            tables: {
              name: 'table-500',
              id  : 500
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
            body.should.have.property('tables');
            body.tables.should.have.properties({
              name: 'table-500',
              id  : 500
            });
            body.tables.should.have.properties([
              'href',
              'id'
            ]);
            body.tables.href.should.be.equal(res.header.location);
          })
          .expect(200, done);
      });
    });
  });
});