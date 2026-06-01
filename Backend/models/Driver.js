const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    license: {
        type: String,
        required: true
    },
    vehicleId: {
        type: String,
        required: false
    },
    driverId: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'default-driver.jpg',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);