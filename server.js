"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Campaign} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));

// app.get('/campaigns', (req, res) => {
//     const filters = {};
//     const queryableFields = ['artist'];
//     queryableFields.forEach(field => {
//         if (req.query[field]) {
//             filters[field] = req.query[field];
//         }
//     });
//     Campaign
//         .find(filters)
//         .then(Campaigns => res.json(
//             Campaigns.map(campaign => campaign.serialize())
//         ))
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({message: 'Internal server error'})
//         });
// });

app.get('/campaigns', (req, res) => {
  Campaign
    .find()
    .then(campaigns => {
      res.json({
        campaigns: campaigns.map(
          (campaign) => campaign.serialize())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/campaigns/:id', (req, res) => {
  Campaign
    .findById(req.params.id)
    .then(campaign =>res.json(campaign.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/campaigns', (req, res) => {

  const requiredFields = ['artist', 'title', 'description', 'financialGoal'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Campaign
    .create({
      id: req.body._id,
      artist: req.body.artist,
      title: req.body.title,
      description: req.body.description,
      files: req.body.files,
      financialGoal: req.body.financialGoal,
      status: req.body.status,
      createdAt: req.body.createdAt})
    .then(
      campaign => res.status(201).json(campaign.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.put('/campaigns/:id', (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    // we return here to break out of this function
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['artist', 'title', 'description', 'files', 'financialGoal', 'status'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Campaign
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/campaigns/:id', (req, res) => {
  Campaign
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }

        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
