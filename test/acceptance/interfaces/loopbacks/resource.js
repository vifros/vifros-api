var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/interfaces/loopbacks/:loopback', function () {
  describe('when OPTIONS', function () {
    describe('and `:loopback` is anything', function () {
      it('should return methods GET,PUT,DELETE', function (done) {
        api
          .options('/interfaces/loopbacks/anything')
          .expect('Allow', 'GET,PUT,DELETE')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:loopback` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/interfaces/loopbacks/unknown')
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

    describe('and `:loopback` is `lo', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/interfaces/loopbacks/lo')
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

      it('should return a valid `lo` resource response', function (done) {
        api
          .get('/interfaces/loopbacks/lo')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('loopbacks');
            body.should.have.property('loopbacks');
            body.loopbacks.should.be.an.Object.and.not.an.Array;
            body.loopbacks.should.have.properties([
              'name',
              'mac',
              'mtu',
              'status',
              'id'
            ]);
            body.loopbacks.name.should.be.equal('lo');
            body.loopbacks.mac.should.be.a.String;
            body.loopbacks.mtu.should.be.a.Number;
            body.loopbacks.status.should.be.an.Object;
            body.loopbacks.id.should.be.a.String;
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/interfaces/loopbacks/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:loopback` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/interfaces/loopbacks/unknown')
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

    describe('and `:loopback` is a valid key', function () {
      describe('and tried to modify the read-only values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/interfaces/loopbacks/lo')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              loopbacks: {
                name  : 'some_name',
                status: {
                  operational: 'UP'
                }
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

      describe('and tried to update valid `lo` values', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/interfaces/loopbacks/lo')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              loopbacks: {
                status     : {
                  admin: 'UP'
                },
                description: 'a_description_' + now
              }
            })
            )
            .expect(204)
            .end(function (error) {
              if (error) {
                done(error);
                return;
              }

              // Check the modified values.
              api
                .get('/interfaces/loopbacks/lo')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('loopbacks');
                  body.loopbacks.should.have.properties([
                    'status',
                    'description'
                  ]);
                  body.loopbacks.status.should.have.property('admin', 'UP');
                  body.loopbacks.description.should.be.equal('a_description_' + now);
                })
                .expect(200, done);
            });
        });
      });
    });
  });

  describe('when DELETE', function () {
    describe('and `:loopback` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .delete('/interfaces/loopbacks/unknown')
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

    describe('and `name` is `lo` (a valid loopback) but still present', function () {
      it('should return a 403 response', function (done) {
        api
          .delete('/interfaces/loopbacks/lo')
          .expect(403, done);
      });
    });
  });
});