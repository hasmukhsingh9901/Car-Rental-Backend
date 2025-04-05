const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v > 1900 && v <= new Date().getFullYear() + 1;
            },
            message: props => `${props.value} is not a valid year!`
        }
    },
    type: {
        type: String,
        required: true,
        enum: ['SUV', 'Sedan', 'Hatchback', 'Convertible', 'Truck', 'Van','Coupe']
    },
    rentalPricePerDay: {
        type: Number,
        required: true,
        min: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    currentRental: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        startDate: Date,
        endDate: Date,
        totalCost: Number
    },
    rentalHistory: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        startDate: Date,
        endDate: Date,
        totalCost: Number
    }]
}, { timestamps: true });


carSchema.index({ brand: 'text', model: 'text', type: 'text' });

const Car = mongoose.model('Car', carSchema);

module.exports = Car