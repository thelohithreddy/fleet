const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        // required: function() {
        //     return this.withDriver === true;
        // }
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        // required: true
    },
    pickupDate: {
        type: Date,
        // required: true,
        validate: {
            validator: function(v) {
                return v >= new Date();
            },
            message: 'Pickup date must be in the future'
        }
    },
    returnDate: {
        type: Date,
        // required: true,
        validate: {
            validator: function(v) {
                return v > this.pickupDate;
            },
            message: 'Return date must be after pickup date'
        }
    },
    duration: {
        type: Number,
        // required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        // required: true,
        min: 0
    },
    withDriver: {
        type: Boolean,
        // required: true,
        default: false
    },
    city: {
        type: String,
        trim: true,
        // required: function() {
        //     return this.withDriver === true || this.isDelivery === true;
        // }
    },
    address: {
        type: String,
        trim: true,
        // required: function() {
        //     return this.withDriver === true || this.isDelivery === true;
        // }
    },
    isDelivery: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending',
        // required: true
    },
    termsAccepted: {
        type: Boolean,
        // required: function() {
        //     return this.withDriver === false;
        // }
    },
    bookingDate: {
        type: Date,
        default: Date.now,
        // required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
        validate: {
            validator: function(v) {
                return v === null || (Number.isInteger(v) && v >= 1 && v <= 5);
            },
            message: 'Rating must be a whole number between 1 and 5'
        }
    }
}, {
    timestamps: true
});

// Compound index for optimized queries
bookingSchema.index({ user: 1, status: 1, vehicle: 1 });

module.exports = mongoose.model('Booking', bookingSchema);