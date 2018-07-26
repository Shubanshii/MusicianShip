"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {User} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));

app.get("/users", (req, res) => {
  User
  .find()
  .then(users => {
    res.json(
      users.map(user => user.serialize()));
  })
  .catch(
    err => {
      console.log(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/users/:id', (req, res) => {
  User
    .findById(req.params.id)
    .then(user => res.json(user.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/users', (req, res) => {
  const requiredFields = ['username', 'email'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  User
    .create({
      username: req.body.username,
      email: req.body.email,
      campaigns: req.body.campaigns,
      contributedTo: req.body.contributedTo,
      createdAt: req.body.createdAt})
    .then(
      user => res.status(201).json(user.serialize()))
    .catch(err => {
      res.status(500).json({message: 'Internal server error'});
    });
});

app.put('/users/:id', (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id} must match)`);
    console.error(message);
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['username', 'email', 'campaigns', 'contributedTo'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  User
    .findByIdAndUpdate(req.params.id, {$set: toUpdate}, { new: true })
    .then(user => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}))
});

app.delete('/users/:id', (req, res) => {
  User
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}))
});

let server;

function runServer(databaseUrl = DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
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
