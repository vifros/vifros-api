var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/interfaces/vlans/:vlan', function () {
  describe('when OPTIONS', function () {
    describe('and `:vlan` is anything', function () {
      it('should return methods GET,PUT,DELETE', function (done) {
        api
          .options('/interfaces/vlans/anything')
          .expect('Allow', 'GET,PUT,DELETE')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:vlan` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/interfaces/vlans/unknown')
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

    describe('and `:vlan` is `eth0.51`', function () {
      before(function (done) {
        // Create the resource.
        api
          .post('/interfaces/vlans')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            vlans: {
              interface: 'eth0',
              tag      : 51
            }
          }))
          .expect(200, done);
      });

      // Remove the resource.
      after(function (done) {
        // Delete the resource.
        api
          .delete('/interfaces/vlans/eth0.51')
          .expect(204, done);
      });

      it('should return a valid JSON-API response', function (done) {
        api
          .get('/interfaces/vlans/eth0.51')
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

      it('should return a valid `vlans/eth0.51` resource response', function (done) {
        api
          .get('/interfaces/vlans/eth0.51')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('vlans');
            body.should.have.property('vlans');
            body.vlans.should.be.an.Object.and.not.an.Array;
            body.vlans.should.have.properties([
              'interface',
              'tag'
            ]);
            body.vlans.interface.should.be.equal('eth0');
            body.vlans.tag.should.be.equal(51);
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/interfaces/vlans/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:vlan` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/interfaces/vlans/unknown')
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

    describe('and `:vlan` is a valid key', function () {
      beforeEach(function (done) {
        // Create the resource.
        api
          .post('/interfaces/vlans')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            vlans: {
              interface: 'eth0',
              tag      : '55'
            }
          }))
          .expect(200, done);
      });

      // Remove the resource.
      afterEach(function (done) {
        // Delete the resource.
        api
          .delete('/interfaces/vlans/eth0.55')
          .expect(204, done);
      });

      describe('and tried to modify the read-only values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/interfaces/vlans/eth0.55')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              vlans: {
                interface: 'eth1',
                tag      : 34
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

      describe('and tried to update valid `vlan` values (`description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/interfaces/vlans/eth0.55')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              vlans: {
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
                .get('/interfaces/vlans/eth0.55')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('vlans');
                  body.vlans.should.have.properties({
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
    describe('and `:vlan` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .delete('/interfaces/vlans/unknown')
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

    describe('and `vlan` is `eth0.52` (a valid vlan)', function () {
      before(function (done) {
        // Create the resource.
        api
          .post('/interfaces/vlans')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            vlans: {
              interface: 'eth0',
              tag      : 52
            }
          }))
          .expect(200, done);
      });

      it('should return a 204 response', function (done) {
        api
          .delete('/interfaces/vlans/eth0.52')
          .expect(204)
          .end(function (error) {
            if (error) {
              done(error);
              return;
            }

            // Checks if the resource was really deleted.
            api
              .get('/interfaces/vlans/eth0.52')
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