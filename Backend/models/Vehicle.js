const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Car', 'Bike', 'Truck', 'Van']
    },
    price: {
        type: Number,
        required: true
    },
    availability: {
        type: String,
        enum: ['Available', 'Not available'],
        default: 'Available'
    },
    rating: {
        type: Number,
        default: 0.0
    },
    driverName: {
        type: String,
        default: null
    },
    driverId: {
        type: String,
        required: function() {
            return this.driverName !== 'No Driver';
        }
    },
    city: {
        type: String,
        required: true
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['Petrol', 'Diesel', 'Electric']
    },
    seatingCapacity: {
        type: Number,
        required: true
    },
    registrationPlate: {
        type: String,
        required: true,
        unique: true
    },
    vehicleId: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false
    },
    
    bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Booking' // Reference to the Booking model
            }
        ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);