var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/tunables/:tunable', function () {
  describe('when OPTIONS', function () {
    describe('and `:tunable` is anything', function () {
      it('should return methods GET,PUT,DELETE', function (done) {
        api
          .options('/system/tunables/anything')
          .expect('Allow', 'GET,PUT,DELETE')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:tunable` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/system/tunables/unknown')
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

    describe('and `:tunable` is `net.ipv4.neigh.default.gc_thresh2`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/tunables/net.ipv4.neigh.default.gc_thresh2')
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

      it('should return a valid `tunables/net.ipv4.neigh.default.gc_thresh2` resource response', function (done) {
        api
          .get('/system/tunables/net.ipv4.neigh.default.gc_thresh2')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('tunables');
            body.should.have.property('tunables');
            body.tunables.should.be.an.Object.and.not.an.Array;
            body.tunables.should.have.properties([
              'path',
              'value'
            ]);
            body.tunables.path.should.be.equal('net.ipv4.neigh.default.gc_thresh2');
            body.tunables.value.should.be.a.String;
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/system/tunables/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:tunable` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/system/tunables/unknown')
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

    describe('and `:tunable` is a valid key', function () {
      describe('and tried to modify the read-only values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/system/tunables/net.ipv4.neigh.default.gc_thresh3')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              tunables: {
                path: 'some_path'
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

      describe('and tried to update valid `net.ipv4.neigh.default.gc_thresh3` values (`value` and `description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();
          var new_value = 35000 + Math.round(Math.random() * 100);

          // Updates the values.
          api
            .put('/system/tunables/net.ipv4.neigh.default.gc_thresh3')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              tunables: {
                value      : new_value,
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
                .get('/system/tunables/net.ipv4.neigh.default.gc_thresh3')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('tunables');
                  body.tunables.should.have.properties({
                    value      : new_value,
                    description: 'a_description_' + now
                  });
                })
                .expect(200, done);
            });
        });
      });
    });
  });

  describe('when DELETE', function () {
    describe('and `:tunable` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .delete('/system/tunables/unknown')
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

    describe('and `path` is `net.ipv4.neigh.default.gc_thresh3` (a valid tunable)', function () {
      after(function (done) {
        // Re-create the resource.
        api
          .post('/system/tunables')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            tunables: {
              path       : 'net.ipv4.neigh.default.gc_thresh3',
              value      : '35034',
              description: 'Is the maximum No. of ARP entries which can be kept in table.'
            }
          }))
          .expect(200, done);
      });

      it('should return a 204 response', function (done) {
        api
          .delete('/system/tunables/net.ipv4.neigh.default.gc_thresh3')
          .expect(204)
          .end(function (error) {
            if (error) {
              done(error);
              return;
            }

            // Checks if the resource was really deleted.
            api
              .get('/system/tunables/net.ipv4.neigh.default.gc_thresh3')
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
  });
});