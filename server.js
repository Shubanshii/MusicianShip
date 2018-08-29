"use strict";

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const passport = require('passport');
const flash = require('connect-flash');

require('./passport')(passport);


const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session')

const {PORT, DATABASE_URL} = require('./config');
const {Contribution, Campaign, User} = require('./models');

const app = express();

require('./passport')(passport);

app.use(morgan('common'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.disable('etag');
// create application/json parser

app.use(session({ secret: 'ilovescotchyscotchyscotchscotch', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/index2', function(req, res) {
    res.render('index2');
  });

app.get('/create', isLoggedIn, (req, res) => {
  res.render('create');
});

app.get('/login', function(req, res) {
  res.render('login.ejs', {message: req.flash('loginMessage') });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/signup', function(req, res) {
  res.render('signup', { message: req.flash('signupMessage') });
});

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile', {
    user: req.user
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/contributions', isLoggedIn, (req, res) => {
  Contribution
    .find()
    .then(contributions => {
      res.json(contributions.map(contribution => {
        return {
          id: contribution._id,
          amount: contribution.amount

        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.get('/contributions/:id', isLoggedIn, (req, res) => {
  Contribution
    .findById(req.params.id)
    .then(contribution =>res.json(contribution.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

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
//         .then(Campaigns => res.status(200).json(
//             Campaigns.map(campaign => campaign.serialize())
//         ))
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({message: 'Internal server error'})
//         });
// });

// var people = [{
//   firstName: 'Peter',
//   lastName: 'Johnson'
// },
// {
//   firstName: 'John',
//   lastName: 'Doe'
// }
// ];
//
// app.get('/', (req, res) => {
//   res.render('home', {
//     content: 'This is some content',
//     published: true,
//     people
//   });
// });

app.get('/campaigns', isLoggedIn, (req, res) => {
  Campaign
    .find()
    .then(campaigns => {
      res.status(200).json({
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

app.get('/campaigns/:id', isLoggedIn, (req, res) => {

  Campaign
    .findById(req.params.id)
    .then(campaign => {
      res.render('contribute', campaign)
    })
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });

});

// app.get('/campaigns/:id', (req, res) => {
//
//   Campaign
//     .findById(req.params.id)
//     .then(campaign =>res.status(200).json(campaign.serialize()).render('contribute'))
//     .catch(err => {
//       console.error(err);
//         res.status(500).json({message: 'Internal server error'})
//     });
//
// });

app.get('/campaign-finance/:id', isLoggedIn, (req, res) => {
  Campaign
    .findById(req.params.id)
    .then(campaign =>res.json(campaign.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
})

app.post('/contributions', isLoggedIn, (req, res) => {
  console.log('this right here');
  const requiredFields = ['amount'];
  // const requiredFields = ['artist', 'title', 'description', 'financialGoal'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Contribution
    .create({
      id: req.body._id,
      amount: req.body.amount,
      user: req.body.user
    })
    .then(
      contribution => {

        return Campaign.findByIdAndUpdate(req.body.campaignId, {
          $push: {
            contributions: contribution._id
          }
        })
      })
      .then(
        campaign => {
          res.status(201).json(campaign.serialize());
        }
      )
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

// <h3><%= campaign.title %></h3>

// app.get('/campaigns/:id', (req, res) => {
//
//   Campaign
//     .findById(req.params.id)
//     .then(campaign =>res.status(200).json(campaign.serialize()).render('contribute'))
//     .catch(err => {
//       console.error(err);
//         res.status(500).json({message: 'Internal server error'})
//     });
//
// });

app.post('/campaigns', isLoggedIn, (req, res) => {
  const requiredFields = ['artist', 'title', 'description', 'financialGoal'];
  console.log(req.session.passport.user);
  User
    .find()
    .then(user => {
      // console.log(user);
    })
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
      contributions: req.body.contributions,
      user: req.session.passport.user,
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

app.put('/campaigns/:id', isLoggedIn, (req, res) => {

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

app.delete('/campaigns/:id', isLoggedIn, (req, res) => {
  Campaign
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated())
    return next();

    res.redirect('/');
}

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
