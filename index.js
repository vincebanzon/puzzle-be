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
  User = mongoose.model('User', {
    username: String,
    password: String
  });

  Puzzle = mongoose.model('Puzzle', {
    _id: Number,
    name: String,
    img: String
  });

  Score = mongoose.model('Score', {
    user_id: String,
    puzzle_id: Number,
    difficulty: Number,
    time: Number,
    score: Number,
    values: String      // To save game progress and be retrievable after logout
  });

  // Check if Puzzle is empty
  // if empty, populate puzzles
  const puzzles  = [
    {_id: 0, name: 'Sudoku', img: 'https://duckduckgo.com/i/bf13d1d9.png'},
    {_id: 1, name: 'Nonograms', img: 'https://d3lj2s469wtjp0.cloudfront.net/images/nonograms-logo.png'}]
  Puzzle.countDocuments({}, (err, count) => {
    if (count == 0) {
      puzzles.forEach(puzzle => {
        const puzzleModel = new Puzzle({_id: puzzle._id, name: puzzle.name, img: puzzle.img});
        puzzleModel.save().then(() => console.log(`Populated puzzle ${puzzle.name}`));
      })
    }
  })

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

async function isUserSignedIn(req, res, next) {
  next();
}

async function getAllPuzzles (req, res) {
  Puzzle.find({}, (err, result) => {
    res.send(result)
  })
}

async function getAllScores (req, res) {
  Score.find({}, (err, result) => {
    res.send(result)
  })
}

async function insertNewScore(req, res) {
  const userId=0;
  const puzzleId=0;
  console.log('req.params: ', req.body);
  const difficulty = req.body.difficulty;
  const time = req.body.time;
  const score = req.body.score;
  const values = req.body.values;


  // add validations here
  if (false) {
    res.status(404).end();
    return;
  }

  newScore = new Score({
    user_id: userId,
    puzzle_id: puzzleId,
    difficulty,
    time,
    score,
    values
  })
  newScore.save().then(() => {
    res.send('ok')
  })
}


const router = express.Router();
const v1 = '/api/v1';

// Root test route
app.get('/', (req, res) => {
  res.send({message: 'API works'})
})

app.put(v1+'/user/signup', checkDuplicateUsername, signup);
app.post(v1+'/user/signin', signin);
app.get(v1+'/puzzles/', getAllPuzzles);
app.get(v1+'/scores', getAllScores);
app.put(v1+'/score/new', isUserSignedIn, insertNewScore);

const PORT= 4200;
app.listen(PORT, () => console.log(`Commissary web service app listening on port ${PORT}`));
