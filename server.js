const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const carRoutes = require('./routes/carRoutes');
const authRoutes = require('./routes/authRoutes');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

dotenv.config();
const app = express();


connectDB();
// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'))

// Routes
app.use('/api/cars', carRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Car Rental API!');
})




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));