const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

// Load JSON data
const reviews_data = JSON.parse(
  fs.readFileSync('./data/reviews.json', 'utf8')
);

const dealerships_data = JSON.parse(
  fs.readFileSync('./data/dealerships.json', 'utf8')
);

// Connect to MongoDB
mongoose.connect('mongodb://mongo-db:27017/', {
  dbName: 'dealershipsDB'
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Populate MongoDB with initial data
mongoose.connection.once('open', async () => {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data.reviews);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data.dealerships);

    console.log('Reviews and dealerships data loaded successfully');
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
});

// Home endpoint
app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// Q8: Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Q8: Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({
      dealership: req.params.id
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Q9: Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Q11: Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({
      state: req.params.state
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Q10: Fetch dealership by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const documents = await Dealerships.find({
      id: Number(req.params.id)
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Insert a review
app.post(
  '/insert_review',
  express.raw({ type: '*/*' }),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.toString());

      const documents = await Reviews.find().sort({ id: -1 });
      const new_id = documents.length > 0
        ? documents[0].id + 1
        : 1;

      const review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        sentiment: data.sentiment || 'neutral',
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year
      });

      const savedReview = await review.save();
      res.json(savedReview);
    } catch (error) {
      console.error('Error inserting review:', error);

      res.status(500).json({
        error: 'Error inserting review'
      });
    }
  }
);

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});