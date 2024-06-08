require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Users = require('../models/users');
const Reviews = require('../models/reviews');
const bcrypt = require('bcryptjs');
const serverless = require('serverless-http');

if (process.env.NODE_ENV !== 'production') { 
  require('dotenv').config(); 
  } 

const app = express();
const port = process.env.PORT || 5001; 

// Middleware
app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(express.json());
const router = express.Router();

mongoose.connect(process.env.CONN_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

  
  router.get('/search', async (req, res) => {
    const { by_city, by_name, by_type } = req.query;
    console.log(by_city);
    // Construct the query string based on available parameters
    const queryParameters = [];
    if (by_city) {
        queryParameters.push(`by_city=${by_city}`);
    }
    if (by_name) {
        queryParameters.push(`by_name=${by_name}`);
    }
    if (by_type) {
        queryParameters.push(`by_type=${by_type}`);
    }
    const queryString = queryParameters.join('&');
    console.log(queryString);

    try {
        const response = await axios.get(`https://api.openbrewerydb.org/v1/breweries?${queryString}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.get('/saved/reviews/:breweryId', async (req, res) => {
  const { breweryId } = req.params;
  // console.log(breweryId);
  try {
      const reviews = await Reviews.find({id : breweryId});
      return res.json(reviews);
  } catch (err) {
      res.status(500).send(err.message);
  }
});


router.post('/reviews', async (req, res) =>{
    const { id, username, rating, description} = req.body;

    const review = new Reviews({
        id,
        username,
        rating,
        description
    });
    await review.save();
    res.json(true);
})


router.post('/users/signup', async (req, res) => {
    const { username, password } = req.body;
  
    const validuser = await Users.findOne({ username: username });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  
    // Save the new user to the database
    if (!validuser) {
      const newUser = new Users({
        username,
        password: hash,
      });
      await newUser.save();
      res.json(true);
    }
    else {
      res.json(false);
    }
  });
  
  
  router.post('/users/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const validUser = await Users.findOne({ username: username });
      if (!validUser) {
        return res.status(401).json(false);
      }
  
      const isPasswordValid = await bcrypt.compare(password, validUser.password);
  
      if (!isPasswordValid) {
        return res.status(401).json(false);
      }
      res.json(true)
    } catch (error) {
      res.status(500).json({ message: "Error logging in." });
    }
  });

  // app.listen(port, () => {
  //   console.log(`Server is running on http://localhost:${port}`);
  // });

  app.use('/.netlify/functions/api',router);

module.exports.handler = serverless(app);
