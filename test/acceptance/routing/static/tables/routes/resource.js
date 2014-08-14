var should = require('should');
var supertest = require('supertest');

var config = require('../../../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/routing/static/tables/601/routes/:route', function () {
  before(function (done) {
    // Create the resource.
    api
      .post('/routing/static/tables')
      .set('Accept', 'application/vnd.api+json')
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        tables: {
          name: 'table-601',
          id  : 601
        }
      }))
      .expect(200, done);
  });

  // Remove the resource.
  after(function (done) {
    // Delete the resource.
    api
      .delete('/routing/static/tables/601')
      .expect(204, done);
  });

  describe('when OPTIONS', function () {
    describe('and `:route` is anything', function () {
      it('should return methods GET,DELETE,PUT', function (done) {
        api
          .options('/routing/static/tables/601/routes/53c8ef6557d7c12312e82c96')
          .expect('Allow', 'GET,DELETE,PUT')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:route` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/routing/static/tables/601/routes/53c8ef6557d7c12312z82c96')
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

    describe('and `:route` is a valid route', function () {
      var route_id;

      before(function (done) {
        // Create the resource.
        api
          .post('/routing/static/tables/601/routes')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            routes: {
              to   : '80.80.80.0/24',
              type : 'unicast',
              table: 601,
              via  : '127.0.0.1'
            }
          }))
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // For being able to delete the route after the test.
            route_id = body.routes.id;
          })
          .expect(200, done);
      });

      // Remove the resource.
      after(function (done) {
        // Delete the resource.
        api
          .delete('/routing/static/tables/601/routes/' + route_id)
          .expect(204, done);
      });

      it('should return a valid JSON-API response', function (done) {
        api
          .get('/routing/static/tables/601/routes/' + route_id)
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

      it('should return a valid `routes` resource response', function (done) {
        api
          .get('/routing/static/tables/601/routes/' + route_id)
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('routes');
            body.should.have.property('routes');
            body.routes.should.be.an.Object.and.not.an.Array;
            body.routes.should.have.properties([
              'to',
              'type',
              'table',
              'via'
            ]);

            body.routes.to.should.be.equal('80.80.80.0/24');
            body.routes.type.should.be.equal('unicast');
            body.routes.table.should.be.equal(601);
            body.routes.via.should.be.equal('127.0.0.1');
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/routing/static/tables/601/routes/53c8ef6557d7c12312z82c96')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:route` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/routing/static/tables/601/routes/53c8ef6557d7c12312z82c9z')
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

    describe('and `:route` is a valid key', function () {
      var route_id;
      
      beforeEach(function (done) {
        // Create the resource.
        api
          .post('/routing/static/tables/601/routes')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            routes: {
              to   : '82.82.82.0/24',
              type : 'unicast',
              table: 601,
              via  : '127.0.0.1'
            }
          }))
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // For being able to delete the route after the test.
            route_id = body.routes.id;
          })
          .expect(200, done);
      });

      // Remove the resource.
      afterEach(function (done) {
        // Delete the resource.
        api
          .delete('/routing/static/tables/601/routes/' + route_id)
          .expect(204, done);
      });

      describe('and tried to modify the read-only values', function () {
        it('should return a 400 error and an error collection stating the errors', function (done) {
          api
            .put('/routing/static/tables/601/routes/' + route_id)
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              routes: {
                to: 'some_to'
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

      describe('and tried to update valid `route` values (`description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/routing/static/tables/601/routes/' + route_id)
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send(JSON.stringify({
              routes: {
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
                .get('/routing/static/tables/601/routes/' + route_id)
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('routes');
                  body.routes.should.have.properties({
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
    describe('and `:route` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .delete('/routing/static/tables/601/routes/53c8ef6557d7c12312e82c9x')
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

    describe('and `route` is a valid route', function () {
      var route_id;

      before(function (done) {
        // Create the resource.
        api
          .post('/routing/static/tables/601/routes')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            routes: {
              to   : '81.81.81.0/24',
              type : 'unicast',
              table: 601,
              via  : '127.0.0.1'
            }
          }))
          .expect(function (res) {
            var body = JSON.parse(res.text);

            // For being able to delete the route after the test.
            route_id = body.routes.id;
          })
          .expect(200, done);
      });

      it('should return a 204 response', function (done) {
        api
          .delete('/routing/static/tables/601/routes/' + route_id)
          .expect(204)
          .end(function (error) {
            if (error) {
              done(error);
              return;
            }

            // Checks if the resource was really deleted.
            api
              .get('/routing/static/tables/601/routes/' + route_id)
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