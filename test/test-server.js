"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server.js");

const expect = chai.expect;

chai.use(chaiHttp);

describe("index page", function() {
  it("should exist", function() {
    return chai
      .request(app)
      .get("/")
      .then(function(res) {
        expect(res).to.have.status(200);
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
      });
  });
});
