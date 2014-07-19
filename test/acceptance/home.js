var should = require('should');
var supertest = require('supertest');
var api = supertest('http://localhost:3000');

describe('GET /users', function () {
  it('respond with json', function (done) {
    api
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
});