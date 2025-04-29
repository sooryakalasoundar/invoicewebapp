// app.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const invoiceRoutes = require('./routes/invoicesRoutes');

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//image
app.use(express.static('public'));


// Routes
app.use('/', invoiceRoutes);

// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
