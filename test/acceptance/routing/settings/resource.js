var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/routing/settings/:setting', function () {
  describe('when OPTIONS', function () {
    describe('and `:setting` is anything', function () {
      it('should return methods GET,PUT', function (done) {
        api
          .options('/routing/settings/anything')
          .expect('Allow', 'GET,PUT')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:setting` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/routing/settings/unknown')
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

    describe('and `:setting` is `ip_forward_v4`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/routing/settings/ip_forward_v4')
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

      it('should return a valid `settings/ip_forward_v4` resource response', function (done) {
        api
          .get('/routing/settings/ip_forward_v4')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('settings');
            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value'
            ]);
            body.settings.name.should.be.equal('ip_forward_v4');
            body.settings.value.should.be.a.Number;
          })
          .expect(200, done);
      });
    });

    describe('and `:setting` is `ip_forward_v6`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/routing/settings/ip_forward_v6')
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

      it('should return a valid `settings/ip_forward_v6` resource response', function (done) {
        api
          .get('/routing/settings/ip_forward_v6')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('settings');
            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value'
            ]);
            body.settings.name.should.be.equal('ip_forward_v6');
            body.settings.value.should.be.a.Number;
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/routing/settings/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:setting` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/routing/settings/unknown')
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
            .put('/routing/settings/ip_forward_v4')
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
              body.errors.should.be.an.Array.of.length(1);
            })
            .expect(400, done);
        });
      });

      describe('and not sent the required values', function () {
        it('should return a 304 Not modified response', function (done) {
          api
            .put('/routing/settings/ip_forward_v4')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              settings: {
              }
            }))
            .expect(304, done);
        });
      });

      describe('and tried to disable the IPv4 routing', function () {
        it('should return a 204 response and update the values', function (done) {
          // Updates the values.
          api
            .put('/routing/settings/ip_forward_v4')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              settings: {
                value: 1
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
                .get('/routing/settings/ip_forward_v4')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('settings');
                  body.settings.should.have.property('value');
                  body.settings.value.should.be.equal(1);
                })
                .expect(200, done);
            });
        });
      });
    });
  });
});