const request = require('supertest');
const expect = require('chai').expect;
const should = require('chai').should();
const assert = require('assert');
const server = require('../../app');

describe('get members', () => {
  
  it('fetch org members positive response code', function (done) {
    request(server)
      .get('/orgs/xendit/members')
      .end((err, response) => {
        response.status.should.be.equal(200);
        done();
      })
  });

  it('fetch org members negative response code', function (done) {
         request(server)
         .get('/orgs/dummy/members')
         .end((err, response) => {
            response.status.should.be.equal(500);
            done();
         })
  });

  it('fetch org members followers count in descending order', function(done) {
    request(server)
    .get('/orgs/xendit/members')
    .end((err, response) => {
        response.status.should.be.equal(200);
        var body = response.body;
        expect(body).to.be.an('array')
        expect(body).to.have.length.above(1);
        var isDescending = body.every((val, i, arr) => !i || (val <= arr[i - 1]));  
        expect(isDescending).to.equal(true);                  
        done();
    })
  });

  it('fetch git hub org members has login, avatarurl, following and followers count', function(done) {
    const res = request(server)
      .get('/orgs/xendit/members')
      .end((err, response) => {
        response.status.should.be.equal(200);
        response.body.forEach(element => {
            element.should.have.property('login');
            element.should.have.property('avatar_url');
            element.should.have.property('followers_count');
            element.should.have.property('following_count');
         })
         done();
    })
  });
})
