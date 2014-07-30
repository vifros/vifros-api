var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/interfaces/loopbacks', function () {
  describe('when OPTIONS', function () {
    it('should return methods GET', function (done) {
      api
        .options('/interfaces/loopbacks')
        .expect('Allow', 'GET')
        .expect(200, done);
    });
  });

  describe('when GET', function () {
    it('should return a valid JSON-API response', function (done) {
      api
        .get('/interfaces/loopbacks')
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

    it('should return a valid `loopbacks` collection response', function (done) {
      api
        .get('/interfaces/loopbacks')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          body.links.should.have.property('loopbacks');
          body.should.have.property('loopbacks');
          body.loopbacks.should.be.an.Array;
        })
        .expect(200, done);
    });

    it('should reflect the proper pagination object by default', function (done) {
      api
        .get('/interfaces/loopbacks')
        .set('Accept', 'application/vnd.api+json')
        .expect('Content-Type', 'application/vnd.api+json')
        .expect(function (res) {
          var body = JSON.parse(res.text);

          // Body tests.
          body.should.have.property('meta');
          body.meta.should.have.property('loopbacks');
          body.meta.loopbacks.should.have.properties([
            'total',
            'offset',
            'limit'
          ]);
          body.meta.loopbacks.limit.should.be.equal(10);
          body.meta.loopbacks.offset.should.be.equal(0);
        })
        .expect(200, done);
    });

    describe('and limit:2, offset:1', function () {
      it('should reflect the proper pagination object', function (done) {
        api
          .get('/interfaces/loopbacks')
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
            body.meta.should.have.property('loopbacks');
            body.meta.loopbacks.should.have.properties([
              'total',
              'offset',
              'limit'
            ]);
            body.meta.loopbacks.limit.should.be.equal(2);
            body.meta.loopbacks.offset.should.be.equal(1);
          })
          .expect(200, done);
      });
    });
  });
});