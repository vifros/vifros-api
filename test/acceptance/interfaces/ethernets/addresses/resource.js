var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/interfaces/ethernets/eth0/addresses/:address', function () {
  describe('when OPTIONS', function () {
    describe('and `:address` is anything', function () {
      it('should return methods GET,DELETE,PUT', function (done) {
        api
          .options('/interfaces/ethernets/eth0/addresses/anything')
          .expect('Allow', 'GET,DELETE,PUT')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:address` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/interfaces/ethernets/eth0/addresses/unknown')
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

    describe('and `:address` is `7.7.7.7/24`', function () {
      before(function (done) {
        // Create the resource.
        api
          .post('/interfaces/ethernets/eth0/addresses')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            addresses: {
              address: '7.7.7.7/24'
            }
          }))
          .expect(200, done);
      });

      // Remove the resource.
      after(function (done) {
        // Delete the resource.
        api
          .delete('/interfaces/ethernets/eth0/addresses/7.7.7.7%2F24')
          .expect(204, done);
      });

      it('should return a valid JSON-API response', function (done) {
        api
          .get('/interfaces/ethernets/eth0/addresses/7.7.7.7%2F24')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // Header tests.
            res.header.link.should.exist;
          })
          .expect(200, done);
      });

      it('should return a valid `addresses/7.7.7.7/24` resource response', function (done) {
        api
          .get('/interfaces/ethernets/eth0/addresses/7.7.7.7%2F24')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.should.have.property('addresses');
            body.addresses.should.be.an.Object.and.not.an.Array;
            body.addresses.should.have.properties([
              'address'
            ]);
            body.addresses.address.should.be.equal('7.7.7.7/24');
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/interfaces/ethernets/eth0/addresses/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:address` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/interfaces/ethernets/eth0/addresses/unknown')
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

    describe('and `:address` is a valid key', function () {
      before(function (done) {
        // Create the resource.
        api
          .post('/interfaces/ethernets/eth0/addresses')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            addresses: {
              address: '9.9.9.9/24'
            }
          }))
          .expect(200, done);
      });

      // Remove the resource.
      after(function (done) {
        // Delete the resource.
        api
          .delete('/interfaces/ethernets/eth0/addresses/9.9.9.9%2F24')
          .expect(204, done);
      });

      describe('and tried to modify the read-only values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/interfaces/ethernets/eth0/addresses/9.9.9.9%2F24')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              addresses: {
                address: 'some_address'
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

      describe('and tried to update valid `address` values (`description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/interfaces/ethernets/eth0/addresses/9.9.9.9%2F24')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              addresses: {
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
                .get('/interfaces/ethernets/eth0/addresses/9.9.9.9%2F24')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('addresses');
                  body.addresses.should.have.properties({
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
    describe('and `:address` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .delete('/interfaces/ethernets/eth0/addresses/unknown')
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

    describe('and `address` is `8.8.8.8/24` (a valid address)', function () {
      after(function (done) {
        // Re-create the resource.
        api
          .post('/interfaces/ethernets/eth0/addresses')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            addresses: {
              address: '8.8.8.8/24'
            }
          }))
          .expect(200, done);
      });

      it('should return a 204 response', function (done) {
        api
          .delete('/interfaces/ethernets/eth0/addresses/8.8.8.8%2F24')
          .expect(204)
          .end(function (error) {
            if (error) {
              done(error);
              return;
            }

            // Checks if the resource was really deleted.
            api
              .get('/interfaces/ethernets/eth0/addresses/8.8.8.8%2F24')
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