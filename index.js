const express = require('express');
const app = express();

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
  User = mongoose.model('User', { name: String });
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


const v1 = '/api/v1';
// app.use('/', indexRouter);
// app.use(v1+'/etc', etcRouter);

// const user = new User({ name: 'Zildjian' });
// const puzzle = new Puzzle({ name: 'Zildjian' });
// const score = new Score({ name: 'Zildjian' });

// user.save().then(() => console.log('meow'));
// puzzle.save().then(() => console.log('meow'));
// score.save().then(() => console.log('meow'));

const PORT= 3000;
app.listen(PORT, () => console.log(`Commissary web service app listening on port ${PORT}`));
