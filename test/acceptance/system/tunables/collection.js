var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/tunables', function () {
  describe('when OPTIONS', function () {
    it('should return methods GET,POST', function (done) {
      api
        .options('/system/tunables')
        .expect('Allow', 'GET,POST')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response', function (done) {
      api
        .get('/system/tunables')
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

    it('should return a valid `tunables` collection response', function (done) {
      api
        .get('/system/tunables')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          body.links.should.have.property('tunables');
          body.should.have.property('tunables');
          body.tunables.should.be.an.Array;
        })
        .expect(200, done);
    });

    it('should reflect the proper pagination object by default', function (done) {
      api
        .get('/system/tunables')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          // Body tests.
          body.should.have.property('meta');
          body.meta.should.have.property('tunables');
          body.meta.tunables.should.have.properties([
            'total',
            'offset',
            'limit'
          ]);
          body.meta.tunables.limit.should.be.equal(10);
          body.meta.tunables.offset.should.be.equal(0);
        })
        .expect(200, done);
    });

    describe('and limit:2, offset:1', function () {
      it('should reflect the proper pagination object', function (done) {
        api
          .get('/system/tunables')
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
            body.meta.should.have.property('tunables');
            body.meta.tunables.should.have.properties([
              'total',
              'offset',
              'limit'
            ]);
            body.meta.tunables.limit.should.be.equal(2);
            body.meta.tunables.offset.should.be.equal(1);
          })
          .expect(200, done);
      });
    });
  });

  describe('when POST', function () {
    describe('and missing data required fields', function () {
      it('should return a 400 error', function (done) {
        api
          .post('/system/tunables')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            tunables: {
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

    describe('and trying to create an already created tunable', function () {
      it('should return a 400 error', function (done) {
        api
          .post('/system/tunables')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            tunables: {
              path : 'net.ipv4.neigh.default.gc_thresh1',
              value: '9216'
            }
          }))
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('errors');
            body.errors.should.be.an.Array.of.length(1);
          })
          .expect(400, done);
      });
    });

    describe('and trying to create a valid tunable', function () {
      it('should create a `tunable` and return a valid JSON-API response', function (done) {
        after(function (done) {
          // Delete the resource.
          api
            .delete('/system/tunables/net.ipv4.conf.all.log_martians')
            .expect(204, done);
        });

        api
          .post('/system/tunables')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            tunables: {
              path : 'net.ipv4.conf.all.log_martians',
              value: '1'
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
            body.should.have.property('tunables');
            body.tunables.should.have.properties({
              path : 'net.ipv4.conf.all.log_martians',
              value: '1'
            });
            body.tunables.should.have.properties([
              'href',
              'id'
            ]);
            body.tunables.href.should.be.equal(res.header.location);
          })
          .expect(200, done);
      });
    });
  });
});