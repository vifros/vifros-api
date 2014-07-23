var should = require('should');
var supertest = require('supertest');

var config = require('../../../../config/test.json').api;
var url = config.protocol + '://' + config.host + ':' + config.port + config.prefix;
var api = supertest(url);

describe('/api/system/settings/:setting', function () {
  describe('when OPTIONS', function () {
    describe('and `:setting` is anything', function () {
      it('should return methods GET,PUT', function (done) {
        api
          .options('/system/settings/anything')
          .expect('Allow', 'GET,PUT')
          .expect(200, done);
      });
    });
  });

  describe('when GET', function () {
    describe('and `:setting` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .get('/system/settings/unknown')
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

    describe('and `:setting` is `hostname`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/settings/hostname')
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

      it('should return a valid `settings/hostname` resource response', function (done) {
        api
          .get('/system/settings/hostname')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('settings');
            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value',
              'id'
            ]);
            body.settings.name.should.be.equal('hostname');
            body.settings.value.should.be.a.String;
            body.settings.id.should.be.a.String;
          })
          .expect(200, done);
      });
    });

    describe('and `:setting` is `nameservers`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/settings/nameservers')
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

      it('should return a valid `settings/nameservers` resource response', function (done) {
        api
          .get('/system/settings/nameservers')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('settings');
            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value',
              'id'
            ]);
            body.settings.name.should.be.equal('nameservers');
            body.settings.value.should.be.an.Array;
            body.settings.id.should.be.a.String;
          })
          .expect(200, done);
      });
    });

    describe('and `:setting` is `domain`', function () {
      it('should return a valid JSON-API response', function (done) {
        api
          .get('/system/settings/domain')
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

      it('should return a valid `settings/domain` resource response', function (done) {
        api
          .get('/system/settings/domain')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(function (res) {
            var body = JSON.parse(res.text);

            body.links.should.have.property('settings');
            body.should.have.property('settings');
            body.settings.should.be.an.Object.and.not.an.Array;
            body.settings.should.have.properties([
              'name',
              'value',
              'id'
            ]);
            body.settings.name.should.be.equal('domain');
            body.settings.value.should.be.a.String;
            body.settings.id.should.be.a.String;
          })
          .expect(200, done);
      });
    });
  });

  describe('when PUT', function () {
    describe('and `Content-Type` is `application/json` (an invalid Content-Type)', function () {
      it('should return a 415 error', function (done) {
        api
          .put('/system/settings/unknown')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', 'application/vnd.api+json')
          .expect(415, done);
      });
    });

    describe('and `:setting` is `unknown` (an invalid key)', function () {
      it('should return a 404 error', function (done) {
        api
          .put('/system/settings/unknown')
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
            .put('/system/settings/domain')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send('{'
              + '"settings": {'
              + '"module": "a_module",'
              + '"name"  : "a_name"'
              + '}'
              + '}'
            )
            .expect(function (res) {
              var body = JSON.parse(res.text);

              body.should.have.property('errors');
              body.errors.should.be.an.Array.of.length(2);
            })
            .expect(400, done);
        });
      });

      describe('and tried to update valid `hostname` values (`value` and `description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/system/settings/hostname')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send('{'
              + '"settings": {'
              + '"value": "a_hostname_' + now + '",'
              + '"description"  : "a_description_' + now + '"'
              + '}'
              + '}'
            )
            .expect(204)
            .end(function (error) {
              if (error) {
                done(error);
                return;
              }

              // Check the modified values.
              api
                .get('/system/settings/hostname')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('settings');
                  body.settings.should.have.properties({
                    value      : 'a_hostname_' + now,
                    description: 'a_description_' + now
                  });
                })
                .expect(200, done);
            });
        });
      });

      describe('and tried to update valid `nameservers` values (`value` and `description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          function getRandomIP() {
            return Math.round(Math.random() * 100)
              + '.' + Math.round(Math.random() * 100)
              + '.' + Math.round(Math.random() * 100)
              + '.' + Math.round(Math.random() * 100);
          }

          var random_IP_1 = getRandomIP();
          var random_IP_2 = getRandomIP();

          // Updates the values.
          api
            .put('/system/settings/nameservers')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send('{'
              + '"settings": {'
              + '"value": ["' + random_IP_1 + '","' + random_IP_2 + '"],'
              + '"description"  : "a_description_' + now + '"'
              + '}'
              + '}'
            )
            .expect(204)
            .end(function (error) {
              if (error) {
                done(error);
                return;
              }

              // Check the modified values.
              api
                .get('/system/settings/nameservers')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('settings');
                  body.settings.should.have.properties({
                    value      : [
                      random_IP_1,
                      random_IP_2
                    ],
                    description: 'a_description_' + now
                  });
                })
                .expect(200, done);
            });
        });
      });


      describe('and tried to update valid `domain` values (`value` and `description`)', function () {
        it('should return a 204 response and update the values', function (done) {
          var now = Date.now();

          // Updates the values.
          api
            .put('/system/settings/domain')
            .set('Content-Type', 'application/vnd.api+json')
            .set('Accept', 'application/vnd.api+json')
            .send('{'
              + '"settings": {'
              + '"value": "a_domain_' + now + '",'
              + '"description"  : "a_description_' + now + '"'
              + '}'
              + '}'
            )
            .expect(204)
            .end(function (error) {
              if (error) {
                done(error);
                return;
              }

              // Check the modified values.
              api
                .get('/system/settings/domain')
                .set('Accept', 'application/vnd.api+json')
                .expect('Content-Type', 'application/vnd.api+json')
                .expect(function (res) {
                  var body = JSON.parse(res.text);

                  // Body tests.
                  body.should.have.property('settings');
                  body.settings.should.have.properties({
                    value      : 'a_domain_' + now,
                    description: 'a_description_' + now
                  });
                })
                .expect(200, done);
            });
        });
      });
    });
  });
});