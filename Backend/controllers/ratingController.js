const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res, next) => {
    try {
        const { bookingId, rating } = req.body;
        
        // Validate rating
        const ratingValue = Number(rating);
        if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5 stars'
            });
        }

        const booking = await Booking.findById(bookingId).populate('vehicle');
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Cannot rate an incomplete booking'
            });
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ booking: bookingId });
        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                error: 'Rating already submitted'
            });
        }

        // Create new feedback
        const newFeedback = new Feedback({
            booking: bookingId,
            rating: ratingValue
        });
        await newFeedback.save();

        // Update vehicle's average rating
        const allFeedbacks = await Feedback.find({
            booking: { $in: await Booking.find({ vehicle: booking.vehicle._id }).select('_id') }
        });

        const averageRating = allFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / allFeedbacks.length;
        
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
            rating: Number(averageRating.toFixed(1)),
            totalRatings: allFeedbacks.length
        });

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            rating: ratingValue
        });

    } catch (error) {
        next(error);
    }
};

const getFeedbackStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const feedback = await Feedback.findOne({ booking: bookingId });

        res.status(200).json({
            success: true,
            hasRating: !!feedback,
            rating: feedback ? feedback.rating : null
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitFeedback,
    getFeedbackStatus
};