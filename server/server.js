const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan'); 
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Choose the database URI based on the environment
const mongoURI = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_URL : process.env.MONGO_URI;

// Connect to MongoDB using the chosen URI
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use('/shopping-lists', shoppingListRoutes);
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app for testing
module.exports = app;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(5000, () => {
    console.log("Server started on port 5000");
  });
}


// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const morgan = require('morgan'); 
// const shoppingListRoutes = require('./routes/shoppingListRoutes'); // Ensure this matches the filename exactly
// const userRoutes = require('./routes/userRoutes');
// const dotenv = require('dotenv'); //for testing

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));

// mongoose.connect('mongodb://localhost:27017/mydatabase', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch(err => {
//   console.error('Could not connect to MongoDB', err);
// });

// app.use('/shopping-lists', shoppingListRoutes); //Shopping list routes
// app.use('/users', userRoutes); //User routes

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// // Export app for testing
// module.exports = app;

// // Start the server only if not in test environment
// if (process.env.NODE_ENV !== 'test') {
//   app.listen(5000, () => {
//     console.log("Server started on port 5000");
//   });
// }
