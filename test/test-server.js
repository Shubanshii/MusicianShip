'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {ObjectID} = require('mongodb');
const {Campaign} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(require('chai-datetime'));
chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedCampaignData() {
  console.info('seeding campaign data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateCampaignData());
  }
  // this will return a promise
  return Campaign.insertMany(seedData);
}

function generateCampaignData() {
  return {
    artist: faker.random.words(),
    title: faker.random.words(),
    description: faker.random.words(),
    files: ['ddd.wav', 'alone.wav'],
    financialGoal: faker.random.number(),
    status: 'current',
    createdAt: faker.date.recent()
  };
}


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Campaign API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedCampaignData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing campaigns', function() {
      // strategy:
      //    1. get back all restaurants returned by by GET request to `/restaurants`
      //    2. prove res has right status, data type
      //    3. prove the number of restaurants we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/campaigns')
        .then(function(_res) {
          // so subsequent .then blocks can access response object
          res = _res;
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.campaigns).to.have.lengthOf.at.least(1);
          return Campaign.count();
        })
        .then(function(count) {
          expect(res.body.campaigns).to.have.lengthOf(count);
        });
    });

    it('should return campaigns with right fields', function() {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resCampaign;
      return chai.request(app)
        .get('/campaigns')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.campaigns).to.be.a('array');
          expect(res.body.campaigns).to.have.lengthOf.at.least(1);

          res.body.campaigns.forEach(function(campaign) {
            expect(campaign).to.be.a('object');
            expect(campaign).to.include.keys(
              'id', 'artist', 'title', 'description', 'files', 'financialGoal', 'status', 'createdAt');
          });
          resCampaign = res.body.campaigns[0];
          return Campaign.findById(resCampaign.id);
        })
        .then(function(campaign) {
          expect(resCampaign.id).to.equal(campaign.id);
          expect(resCampaign.artist).to.equal(campaign.artist);
          expect(resCampaign.title).to.equal(campaign.title);
          expect(resCampaign.description).to.equal(campaign.description);
          expect(resCampaign.files).to.eql(campaign.files);
          expect(resCampaign.financialGoal).to.equal(campaign.financialGoal);
          expect(resCampaign.status).to.equal(campaign.status);
          const newDate = new Date(resCampaign.createdAt).getTime();
          const newDate2 = new Date(campaign.createdAt).getTime();
          expect(newDate).to.equal(newDate2);

        });
    });
  });

  describe('GET /campaigns/:id', function() {
  it('should return campaign', function() {
    return Campaign
      .findOne()
      .then(function(campaign) {
        let res;
        return chai.request(app)
          .get(`/campaigns/${campaign.id}`)
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);

            expect(res.body.artist).to.equal(campaign.artist);
          })
      })
  });

  it('should return 500 if campaign not found', function() {
    var hexId = new ObjectID().toHexString();

    return chai.request(app)
      .get(`/campaigns/${hexId}`)
      .then(function(res) {
         expect(res).to.have.status(500)
       })

  });

  it('should return 500 for non-object ids', function() {
    return chai.request(app)
      .get('/campaigns/123abc')
      .then(function(res) {
          expect(res).to.have.status(500)
    })
  });
});

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the restaurant we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new campaign', function() {

      const newCampaign = generateCampaignData();

      return chai.request(app)
        .post('/campaigns')
        .send(newCampaign)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'artist', 'title', 'description', 'files', 'financialGoal', 'status', 'createdAt');
          expect(res.body.artist).to.equal(newCampaign.artist);
          // cause Mongo should have created id on insertion
          expect(res.body.id).to.not.be.null;
          expect(res.body.title).to.equal(newCampaign.title);
          expect(res.body.description).to.equal(newCampaign.description);
          expect(res.body.files).to.eql(newCampaign.files);
          expect(res.body.status).to.equal(newCampaign.status);
          const newResDate = new Date(res.body.createdAt).getTime();
          const newResDate2 = new Date(newCampaign.createdAt).getTime();
          expect(newResDate).to.equal(newResDate2);



          return Campaign.findById(res.body.id);
        })
        .then(function(campaign) {
          expect(campaign.title).to.equal(newCampaign.title);
          expect(campaign.description).to.equal(newCampaign.description);
          expect(campaign.files).to.eql(newCampaign.files);
          expect(campaign.status).to.equal(newCampaign.status);
          const newDate = new Date(campaign.createdAt).getTime();
          const newDate2 = new Date(newCampaign.createdAt).getTime();
          expect(newDate).to.equal(newDate2);
        });
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing restaurant from db
    //  2. Make a PUT request to update that restaurant
    //  3. Prove restaurant returned by request contains data we sent
    //  4. Prove restaurant in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        artist: 'Ronald Jankiez',
        title: 'Full Album',
        description: "We're making a metal album!",
        financialGoal: 200
      };

      return Campaign
        .findOne()
        .then(function(campaign) {
          updateData.id = campaign.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/campaigns/${campaign.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return Campaign.findById(updateData.id);
        })
        .then(function(campaign) {
          expect(campaign.artist).to.equal(updateData.artist);
          expect(campaign.title).to.equal(updateData.title);
          expect(campaign.description).to.equal(updateData.description);
          expect(campaign.financialGoal).to.equal(updateData.financialGoal);
        });
    });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a restaurant
    //  2. make a DELETE request for that restaurant's id
    //  3. assert that response has right status code
    //  4. prove that restaurant with the id doesn't exist in db anymore
    it('delete a campaign by id', function() {

      let campaign;

      return Campaign
        .findOne()
        .then(function(_campaign) {
          campaign = _campaign;
          return chai.request(app).delete(`/campaigns/${campaign.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Campaign.findById(campaign.id);
        })
        .then(function(_campaign) {
          expect(_campaign).to.be.null;
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
        expect(res).to.be.html;
        expect(res).to.have.status(200);
      });
  });
});

describe("contribute page", function() {
  it("should exist", function() {
    return chai
      .request(app)
      .get("/contribute.html")
      .then(function(res) {
        expect(res).to.be.html;
        expect(res).to.have.status(200);
      });
  });
});

describe("create page", function() {
  it("should exist", function() {
    return chai
      .request(app)
      .get("/create.html")
      .then(function(res) {
        expect(res).to.be.html;
        expect(res).to.have.status(200);
      });
  });
});
