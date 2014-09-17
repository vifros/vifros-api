// TODO: Add system/settings tests and move this one to logging/settings

var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/logging/settings/:setting', function () {
  describe('when OPTIONS', function () {
    describe('and `:setting` is anything', function () {
      it('should return methods GET,PUT', function (done) {
        api
          .options('/system/logging/settings/anything')
          .expect('Allow', 'GET,PUT')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:setting` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/system/logging/settings/unknown')
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

    describe('and `:setting` is `transport_console`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/logging/settings/transport_console')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // Header tests.
            res.header.link.should.exist;
          })
          .expect(200, done);
      });

      it('should return a valid `settings/transport_console` resource response', function (done) {
        api
          .get('/system/logging/settings/transport_console')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value'
            ]);
            body.settings.name.should.be.equal('transport_console');
            body.settings.value.should.be.an.Object.and.not.an.Array;
          })
          .expect(200, done);
      });
    });

    describe('and `:setting` is `transport_file`', function () {
      it('should return a valid `settings/transport_file` resource response', function (done) {
        api
          .get('/system/logging/settings/transport_file')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value'
            ]);
            body.settings.name.should.be.equal('transport_file');
            body.settings.value.should.be.an.Object.and.not.an.Array;
          })
          .expect(200, done);
      });
    });

    describe('and `:setting` is `transport_mongodb`', function () {
      it('should return a valid `settings/transport_mongodb` resource response', function (done) {
        api
          .get('/system/logging/settings/transport_mongodb')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value'
            ]);
            body.settings.name.should.be.equal('transport_mongodb');
            body.settings.value.should.be.an.Object.and.not.an.Array;
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/system/logging/settings/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:setting` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/system/logging/settings/unknown')
          .set('Content-Type', 'application/vnd.api+json')
          .set('Accept', 'application/vnd.api+json')
          .send('{}')
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

    describe('and `:setting` is a valid key', function () {
      describe('and tried to modify the read-only values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/system/logging/settings/transport_file')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              settings: {
                name: 'some_name'
              }
            }))
            .expect(function (res) {
              var body = JSON.parse(res.text);

              body.should.have.property('errors');
              body.errors.should.be.an.Array.of.length(2);
            })
            .expect(400, done);
        });
      });

      describe('and not sent the required values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/system/logging/settings/transport_file')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              settings: {
              }
            }))
            .expect(function (res) {
              var body = JSON.parse(res.text);

              body.should.have.property('errors');
              body.errors.should.be.an.Array.of.length(1);
            })
            .expect(400, done);
        });
      });

      describe('and tried to disable the transport', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/system/logging/settings/transport_file')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              settings: {
                value: {
                  enabled: false
                }
              }
            }))
            .expect(204)
            .end(function (error) {
              if (error) {
                done(error);
                return;
              }

              // Check the modified values.
              api
                .get('/system/logging/settings/transport_file')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('settings');
                  body.settings.should.have.property('value');
                  body.settings.value.should.have.property('enabled');
                  body.settings.value.enabled.should.be.false;
                })
                .expect(200, done);
            });
        });
      });
    });
  });
});