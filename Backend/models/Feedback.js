const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true  // This already creates an index
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

// Remove this line as it's creating a duplicate index
// feedbackSchema.index({ booking: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);