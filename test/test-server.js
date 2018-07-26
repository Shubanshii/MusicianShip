"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const should = chai.should();

const { User } = require('../models');
const {app, runServer, closeServer} = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedUserData() {
  console.info('seeding user data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      username: faker.internet.userName(),
      email: faker.internet.email()
    });
  }
  return User.insertMany(seedData);
}

describe('Users API resource', function() {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedUserData();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return all existing users', function () {
      // strategy:
      //    1. get back all posts returned by by GET request to `/posts`
      //    2. prove res has right status, data type
      //    3. prove the number of posts we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/users')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.lengthOf.at.least(1);

          return User.count();
        })
        .then(count => {
          // the number of returned posts should be same
          // as number of posts in DB
          res.body.should.have.lengthOf(count);
        });
    });

    it('should return users with right fields', function() {
      let resUser;
      return chai.request(app)
        .get('/users')
        .then(function (res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf.at.least(1);

          res.body.forEach(function (user) {
            user.should.be.a('object');
            user.should.include.keys('username', 'email', 'id', 'createdAt');
          });

          resUser = res.body[0];
          return User.findById(resUser.id);
        })
        .then(user => {
          resUser.username.should.equal(user.username);
          resUser.email.should.equal(user.email);
        });
    });
  });

  describe('POST endpoint', function () {
    it('should add a new user', function () {
      const newUser = {
        username: faker.internet.userName(),
        email: faker.internet.email()
      };

      return chai.request(app)
        .post('/users')
        .send(newUser)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('id', 'createdAt', 'username', 'email');
          res.body.username.should.equal(newUser.username);
          res.body.email.should.equal(newUser.email);
          res.body.id.should.not.be.null;
          return User.findById(res.body.id);
        })
        .then(function (user) {
          user.username.should.equal(newUser.username);
          user.email.should.equal(newUser.email);
        });
    });
  });

  describe('PUT endpoint', function () {

    it('should update fields you send over', function () {
      const updateData = {
        username: 'BuckDuck',
        email: 'chroniclesofreeeeeedik@dff.com',
        campaigns: [
          {
            artist: 'ShubanshNansh',
            title: 'Frogger',
            description: "solo you can't hurrr me",
            files: ['wtf.wav'],
            financialGoal: 50000,
            status: 'Current'
          }
        ],
        contributedTo: [
          {
            artist: "TOOL",
            title: "Textural vocals",
            amount: 45
          }
        ]
      };

      return User
        .findOne()
        .then(user => {
          updateData.id = user.id;

          return chai.request(app)
          .put(`/users/${user.id}`)
          .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return User.findById(updateData.id);
        })
        .then(user => {
          user.username.should.equal(updateData.username);
          user.email.should.equal(updateData.email);
          console.log(user.campaigns);
          expect(user.campaigns).to.eql(updateData.campaigns);
          // expect(user.campaigns).to.eql(updateData.campaigns);
          // user.campaigns[0].should.equal(updateData.campaigns[0]);
          // user.contributedTo[0].should.equal(updateData.contributedTo[0]);
        });
    });
  });

});

describe("index page", function() {
  it("should exist", function() {
    return chai
      .request(app)
      .get("/")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe("create campaign page", function() {
  it("should exist", function() {
    return chai
      .request(app)
      .get("/create.html")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe("contribute page", function() {
  it("should exist", function() {
    return chai
      .request(app)
      .get("/contribute.html")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});
