const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const express = require('express');
const { 
  getCars, 
  getCarById, 
  addCar, 
  updateCar, 
  deleteCar,
  rentCar,
  returnCar
} = require('../controllers/carController');


const router = express.Router();

// GET /api/cars - Get all cars (public)
router.get('/', getCars);

// GET /api/cars/:id - Get car by ID (public)
router.get('/:id', getCarById);

// POST /api/cars - Add a new car (admin only)
router.post('/', addCar);

// PUT /api/cars/:id - Update a car (admin only)
router.put('/:id', updateCar);

// DELETE /api/cars/:id - Delete a car (admin only)
router.delete('/:id', deleteCar);

// POST /api/cars/:id/rent - Rent a car
router.post('/:id/rent', rentCar);

// POST /api/cars/:id/return - Return a rented car
router.post('/:id/return', returnCar);



// router.get('/dashboard', authenticate, authorizeAdmin, (req, res) => {
//   res.json({ message: 'Welcome to admin dashboard', user: req.user });
// });

module.exports = router;