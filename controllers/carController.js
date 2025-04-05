// backend/controllers/carController.js
const Car = require('../models/carModel');

// Get all cars with pagination and filters
// 

// backend/controllers/carController.js

exports.getCars = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      model,
      available,
      type,
      sortBy
    } = req.query;

    const query = {};

   
    if (brand && brand.toLowerCase() !== 'all' && brand.trim() !== '') {
      query.brand = new RegExp(brand, 'i');
    }

  
    if (model && model.trim() !== '') {
      query.model = new RegExp(model, 'i');
    }

    
    if (available === 'true' || available === 'false') {
      query.available = available === 'true';
    }

    
    if (type && type.toLowerCase() !== 'all' && type.trim() !== '') {
      query.type = type;
    }

    
    let sortOptions = {};
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions = { createdAt: -1 }; 
    }

    
    const cars = await Car.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCars = await Car.countDocuments(query);

    res.json({
      cars,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCars / parseInt(limit)),
      totalCars
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.addCar = async (req, res) => {
  try {
    const { brand, model, year, type, rentalPricePerDay, imageUrl } = req.body;

    const newCar = new Car({
      brand,
      model,
      year,
      type,
      rentalPricePerDay,
      imageUrl: imageUrl || undefined
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(400).json({ message: 'Invalid car data', error: error.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { brand, model, year, type, rentalPricePerDay, available, imageUrl } = req.body;

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        brand,
        model,
        year,
        type,
        rentalPricePerDay,
        available,
        imageUrl
      },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(updatedCar);
  } catch (error) {
    res.status(400).json({ message: 'Invalid car data', error: error.message });
  }
};


exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.rentCar = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const carId = req.params.id;
    // const userId = req.user.id;

    // Parse and normalize dates (remove time for fair comparison)
    const start = new Date(startDate);
    const end = new Date(endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove current time
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Check if dates are valid
    if (start >= end || start < today) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    // Calculate rental duration and cost
    const durationInMs = end - start;
    const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));

    // Find the car
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'Car is not available for rent' });
    }

    // Calculate total cost
    const totalCost = car.rentalPricePerDay * durationInDays;

    // Update car rental status
    car.available = false;
    car.currentRental = {
      // user: userId,
      startDate: start,
      endDate: end,
      totalCost
    };

    await car.save();

    res.json({
      message: 'Car rented successfully',
      rental: {
        car: {
          id: car._id,
          brand: car.brand,
          model: car.model
        },
        startDate: start,
        endDate: end,
        durationInDays,
        totalCost
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.returnCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const userId = req.user.id;

    
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.available) {
      return res.status(400).json({ message: 'Car is not currently rented' });
    }

    
    if (!car.currentRental || car.currentRental.user.toString() !== userId) {
      return res.status(403).json({ message: 'You did not rent this car' });
    }

    
    car.rentalHistory.push(car.currentRental);

    
    car.available = true;
    car.currentRental = null;

    await car.save();

    res.json({
      message: 'Car returned successfully',
      car: {
        id: car._id,
        brand: car.brand,
        model: car.model
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};