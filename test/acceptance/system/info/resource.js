var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/info/:name', function () {
  describe('when OPTIONS', function () {
    describe('and `:name` is anything', function () {
      it('should return only method GET', function (done) {
        api
          .options('/system/info/anything')
          .expect('Allow', 'GET')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:name` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/system/info/unknown')
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

    describe('and `:name` is `time`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/time')
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

      it('should return a valid `info/time` resource response', function (done) {
        api
          .get('/system/info/time')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.have.properties([
              'up',
              'current'
            ]);
            body.info.value.up.should.be.a.Number;
            body.info.value.current.should.be.a.Number;
          })
          .expect(200, done);
      });
    });

    describe('and `:name` is `os`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/os')
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

      it('should return a valid `info/os` resource response', function (done) {
        api
          .get('/system/info/os')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.have.properties([
              'type',
              'arch',
              'release',
              'platform'
            ]);
            body.info.value.type.should.be.a.String;
            body.info.value.arch.should.be.a.String;
            body.info.value.release.should.be.a.String;
            body.info.value.platform.should.be.a.String;
          })
          .expect(200, done);
      });
    });

    describe('and `:name` is `memory`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/memory')
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

      it('should return a valid `info/memory` resource response', function (done) {
        api
          .get('/system/info/memory')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.have.properties([
              'installed',
              'usage'
            ]);
            body.info.value.installed.should.be.a.Number;
            body.info.value.usage.should.be.a.Number;
          })
          .expect(200, done);
      });
    });

    describe('and `:name` is `load`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/load')
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

      it('should return a valid `info/load` resource response', function (done) {
        api
          .get('/system/info/load')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.be.an.Array.and.have.a.lengthOf(3);
          })
          .expect(200, done);
      });
    });

    describe('and `:name` is `cpus`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/cpus')
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

      it('should return a valid `info/cpus` resource response', function (done) {
        api
          .get('/system/info/cpus')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.be.an.Array.and.should.not.be.empty;
          })
          .expect(200, done);
      });
    });

    describe('and `:name` is `swap`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/swap')
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

      it('should return a valid `info/swap` resource response', function (done) {
        api
          .get('/system/info/swap')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.have.properties([
              'installed',
              'usage'
            ]);
            body.info.value.installed.should.be.a.Number;
            body.info.value.usage.should.be.a.Number;
          })
          .expect(200, done);
      });
    });

    describe('and `:name` is `disks`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/info/disks')
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

      it('should return a valid `info/disks` resource response', function (done) {
        api
          .get('/system/info/disks')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('info');
            body.should.have.property('info');
            body.info.should.be.an.Object.and.not.an.Array;
            body.info.should.have.properties([
              'name',
              'value'
            ]);
            body.info.value.should.be.an.Array.and.should.not.be.empty;
          })
          .expect(200, done);
      });
    });
  });
});