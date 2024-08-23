const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// for CORS
const cors = require('cors');
app.use(cors());

// for parsing request body
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DB_CONFIG = require('./config');

// Collections
let User;
let Puzzle;
let Score;

// Connect to database
mongoose.connect(DB_CONFIG.CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  // Create models
  User = mongoose.model('User', { username: String, password: String });
  Puzzle = mongoose.model('Puzzle', { name: String });
  Score = mongoose.model('Score', { name: String });

  console.log('Successfully connected to MongoDB.');
}).catch(err => {
  console.error(`
  Connection to MongoDB error.\n
  Make you you have Mongo DB is running at port 27017.\n
  Make sure you have Database named: puzzle \n`, err);
  process.exit();
});

mongoose.set('useFindAndModify', false);





// MIDDLEWARE

const verifyToken = (req, res, next) => {
  next();
}


async function checkDuplicateUsername (req, res, next) {
  User.findOne({username: req.body.username}).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: "Error Auth 1: "+err });
      return;
    }

    if (user) {
      res.status(400).send({ message: 'Failed! Username is already in use!' });
      return;
    }

    next();
  });
};

async function signup (req, res) {
  const user = new User({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: "Error Sign up: "+err });
      return;
    }

    res.send({ message: 'User registered successfully!' });
  });
};

async function signin (req, res) {
  User.findOne({
    username: req.body.username
  })
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: "Error signing in : "+err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'Invalid Password!'
        });
      }

      var token = jwt.sign({ id: user.id }, DB_CONFIG.AUTH_SECRET, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        id: user._id,
        username: user.username,
        accessToken: token
      });
    });
}





const router = express.Router();
const v1 = '/api/v1';

// Root test route
app.get('/', (req, res) => {
  res.send({message: 'API works'})
})

app.post(v1+'/user/signup', checkDuplicateUsername, signup);
app.post(v1+'/user/signin', signin);


// const user = new User({ name: 'Zildjian' });
// const puzzle = new Puzzle({ name: 'Zildjian' });
// const score = new Score({ name: 'Zildjian' });

// user.save().then(() => console.log('meow'));
// puzzle.save().then(() => console.log('meow'));
// score.save().then(() => console.log('meow'));

const PORT= 4200;
app.listen(PORT, () => console.log(`Commissary web service app listening on port ${PORT}`));
