const Booking = require('../models/Booking');
const mongoose = require('mongoose');  // Import mongoose to use ObjectId
const Vehicle = require('../models/Vehicle');
const { calculateTotalPayment } = require('../utils/calculatePayment');
const { markVehicleUnavailable } = require('./vehicleController');
const schedule = require('node-schedule');

// function mergeToUTC(dateStr, timeStr) {
//     const [year, month, day] = dateStr.split('-').map(Number);
//     const [hour, minute] = timeStr.split(':').map(Number);

//     // Create UTC date object
//     return new Date(Date.UTC(year, month - 1, day, hour, minute));
// }

const confirmBooking = async (req, res) => {
    try {
    const bookingData = req.body;
    console.log("Received booking data:", bookingData);

    // Later: process bookingData, store in DB, update vehicle availability, etc.
    // 1 & 2: Merge pickupDate & pickupTime, returnDate & returnTime
    const pickupDate = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
    const returnDate = new Date(`${bookingData.returnDate}T${bookingData.returnTime}`);
    // const pickupDate = mergeToUTC(bookingData.pickupDate, bookingData.pickupTime);
    // const returnDate = mergeToUTC(bookingData.returnDate, bookingData.returnTime);
    // console.log('Pickup Date UTC:', pickupDate.toISOString());
    // console.log('Return Date UTC:', returnDate.toISOString());
    // 3: Set vehicle availability to 'Not available'
//   await Vehicle.findByIdAndUpdate(bookingData.vehicleId, { availability: 'Not available' });

    // 4: Calculate total price (in days)
    const msPerDay = 1000 * 60 * 60 * 24;
    duration = Math.ceil((returnDate - pickupDate) / msPerDay);
    const totalAmount = duration * parseFloat(bookingData.price);

    //   console.log('Processed Booking:', {
    //         ...bookingData,
    //         pickupDate,
    //         returnDate,
    //         totalAmount,
    //         duration
    //  });
    // 5: Save selected fields to DB
    // Build booking object
    const bookingObj = {
        user: mongoose.Types.ObjectId.createFromHexString(bookingData.userId),
  vehicle: mongoose.Types.ObjectId.createFromHexString(bookingData.vehicleId),
        pickupDate: pickupDate,
        returnDate: returnDate,
        duration: bookingData.duration,
        totalAmount: totalAmount,
        city: bookingData.city,
        // rating: bookingData.rating ? parseInt(bookingData.rating) : null,
        address: bookingData.location,
      };
  
      // Only add rating if it's a number
    //   const parsedRating = parseFloat(bookingData.rating);
    //   if (!isNaN(parsedRating)) {
    //     bookingObj.rating = parsedRating;
    //   }

    // Save booking
    const newBooking = new Booking(bookingObj);
    const savedBooking = await newBooking.save();

    return res.status(201).json({
      message: "Booking confirmed and saved successfully",
      booking: savedBooking
    });

  } catch (error) {
    console.error("Error confirming booking:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const getActiveBookings = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const currentDate = new Date();

        // Find active bookings (pending or active) where the return date is in the future
        const activeBookings = await Booking.find({
            user: userId,
            // status: { $in: ['pending', 'active'] }, // Include both pending and active bookings
            returnDate: { $gte: currentDate } // Only include bookings with a return date in the future
        }).populate('vehicle', 'name image vehicleId driverName');

        console.log('Active bookings query:', {
            user: userId,
            status: { $in: ['pending', 'active'] },
            returnDate: { $gte: currentDate }
        });

        const formattedBookings = activeBookings.map(booking => {
            const startDate = new Date(booking.pickupDate);
            const endDate = new Date(booking.returnDate);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

            return {
                vehicleName: booking.vehicle.name,
                startDate: startDate.toLocaleString(),
                endDate: endDate.toLocaleString(),
                duration,
                driverName: booking.vehicle.driverName,
                vehicleId: booking.vehicle.vehicleId,
                price: booking.totalAmount,
                image: booking.vehicle.image,
                bookingId: booking._id,
                status: booking.status,
                withDriver: booking.withDriver,
                isDelivery: booking.isDelivery,
                address: booking.address
            };
        });

        res.status(200).json({
            success: true,
            bookings: formattedBookings
        });

    } catch (error) {
        console.error('Error in getActiveBookings:', error);
        next(error);
    }
};

const getPastBookings = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentTime = new Date();

        // Find bookings associated with the user that are not cancelled and have a returnDate before the current time
        const bookingsToComplete = await Booking.find({
            user: userId,
            status: { $ne: 'cancelled' }, // Exclude cancelled bookings
            returnDate: { $lt: currentTime } // Return date is before the current time
        });

        // Update the status of these bookings to 'completed'
        for (const booking of bookingsToComplete) {
            booking.status = 'completed';
            booking.updatedAt = new Date(); // Update the timestamp
            await booking.save();
        }

        // Fetch all completed bookings for the user
        const pastBookings = await Booking.find({
            user: userId,
            status: 'completed'
        }).populate('vehicle');

        // Format the past bookings for the response
        const formattedPastBookings = pastBookings.map(booking => ({
            vehicleName: booking.vehicle.name,
            startDate: new Date(booking.pickupDate).toLocaleString(),
            endDate: new Date(booking.returnDate).toLocaleString(),
            duration: Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)),
            image: booking.vehicle.image,
            bookingId: booking._id,
            price: booking.totalAmount
        }));

        // Send the response
        res.status(200).json({
            success: true,
            bookings: formattedPastBookings
        });

    } catch (error) {
        console.error('Error in getPastBookings:', error);
        next(error);
    }
};

const cancelBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        // Find the booking by ID
        const booking = await Booking.findById(bookingId).populate('vehicle');
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: "Booking not found"
            });
        }

        // Log the current status for debugging
        console.log('Current booking status:', booking.status);

        // Allow cancellation of only pending or active bookings
        if (!['pending', 'active'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                error: "Only pending or active bookings can be cancelled"
            });
        }

        // Update vehicle availability to 'Available'
        if (booking.vehicle) {
            await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
                availability: 'Available'
            });
        }

        // Update booking status to 'cancelled'
        booking.status = 'cancelled';
        booking.updatedAt = new Date(); // Update the timestamp
        await booking.save();

        // Send the response
        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking: {
                id: booking._id,
                status: booking.status,
                vehicle: booking.vehicle ? booking.vehicle.name : null,
                updatedAt: booking.updatedAt
            }
        });

    } catch (error) {
        console.error('Error in cancelBooking:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

module.exports = {
    confirmBooking,
    getActiveBookings,
    getPastBookings,
    cancelBooking
};



// export const confirmBooking = async (req, res) => {
//     try {
//       console.log("Confirm Booking Called");
//       res.status(200).json({ message: "Booking confirmed (placeholder)" });
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };

// const initializeBooking = async (req, res, next) => {
//     try {
//         const { pickupDate, returnDate, bookingType, city } = req.body;

//         // Validate dates
//         const pickup = new Date(pickupDate);
//         const return_ = new Date(returnDate);
//         const now = new Date();

//         if (pickup <= now) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Pickup date must be in the future",
//             });
//         }

//         if (return_ <= pickup) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Return date must be after pickup date",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Booking initialized successfully",
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const confirmBookingWithDriver = async (req, res, next) => {
//     try {
//         const { vehicleId, pickupDate, returnDate, address, isDelivery } = req.body;
        
//         // Check if user is authenticated
//         if (!req.user || !req.user._id) {
//             return res.status(401).json({
//                 success: false,
//                 error: "User not authenticated"
//             });
//         }

//         const userId = req.user._id;
// 
        // Validate dates
        // const pickup = new Date(pickupDate);
        // const return_ = new Date(returnDate);
        // const now = new Date();

        // if (pickup <= now) {
        //     return res.status(400).json({
        //         success: false,
        //         error: "Pickup date must be in the future"
        //     });
        // }

        // if (return_ <= pickup) {
        //     return res.status(400).json({
        //         success: false,
        //         error: "Return date must be after pickup date"
        //     });
        // }

        // const vehicle = await Vehicle.findById(vehicleId);
        // if (!vehicle) {
        //     return res.status(404).json({
        //         success: false,
        //         error: "Vehicle not found"
        //     });
        // }
// 
        // const totalPrice = calculateTotalPayment(vehicle.price, pickupDate, returnDate);
// 
        // const newBooking = new Booking({
        //     user: userId,
        //     vehicle: vehicleId,
        //     pickupDate: pickup,
        //     returnDate: return_,
        //     address,
        //     totalAmount: totalPrice,
        //     withDriver: true,
        //     isDelivery: isDelivery || false,
        //     status: 'pending',
        //     bookingDate: new Date()
        // });

        // await newBooking.save();
        
//         const statusUpdated = await markVehicleUnavailable(vehicleId, returnDate, newBooking._id);
        
//         if (!statusUpdated) {
//             await Booking.findByIdAndDelete(newBooking._id);
//             return res.status(500).json({
//                 success: false,
//                 error: "Failed to update vehicle status"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Booking confirmed successfully",
//             booking: newBooking
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// const confirmSelfDriveStorePickup = async (req, res, next) => {
//     try {
//         const { vehicleId, pickupDate, returnDate, userId, termsAccepted } = req.body;

//         if (!termsAccepted) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Terms and conditions must be accepted"
//             });
//         }

//         const vehicle = await Vehicle.findById(vehicleId);
//         if (!vehicle) {
//             return res.status(404).json({
//                 success: false,
//                 error: "Vehicle not found"
//             });
//         }

//         const totalPrice = calculateTotalPayment(vehicle.price, pickupDate, returnDate);

//         const newBooking = new Booking({
//             user: userId,
//             vehicle: vehicleId,
//             pickupDate,
//             returnDate,
//             totalAmount: totalPrice,
//             withDriver: false,
//             isDelivery: false,
//             status: 'pending',
//             termsAccepted,
//             bookingDate: new Date()
//         });

//         await newBooking.save();
        
    //     const statusUpdated = await markVehicleUnavailable(vehicleId, returnDate, newBooking._id);
        
    //     if (!statusUpdated) {
    //         await Booking.findByIdAndDelete(newBooking._id);
    //         return res.status(500).json({
    //             success: false,
    //             error: "Failed to update vehicle status"
    //         });
    //     }
        

    //     res.status(200).json({
    //         success: true,
    //         message: "Self-drive booking confirmed with store pickup",
    //         booking: newBooking
    //     });

    // } catch (error) {
    //     next(error);
//     }
// };

// const confirmSelfDriveHomeDelivery = async (req, res, next) => {
//     try {
//         const { vehicleId, pickupDate, returnDate, deliveryAddress, userId, termsAccepted } = req.body;

//         if (!termsAccepted) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Terms and conditions must be accepted"
//             });
//         }

//         if (!deliveryAddress) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Delivery address is required"
//             });
//         }

        // const vehicle = await Vehicle.findById(vehicleId);
        // if (!vehicle) {
        //     return res.status(404).json({
        //         success: false,
        //         error: "Vehicle not found"
        //     });
        // }

        // const totalPrice = calculateTotalPayment(vehicle.price, pickupDate, returnDate);

        // const newBooking = new Booking({
        //     user: userId,
        //     vehicle: vehicleId,
        //     pickupDate,
        //     returnDate,
        //     deliveryAddress,
        //     totalAmount: totalPrice,
        //     withDriver: false,
        //     isDelivery: true,
        //     status: 'pending',
//             termsAccepted,
//             bookingDate: new Date()
//         });

//         await newBooking.save();
        
//         const statusUpdated = await markVehicleUnavailable(vehicleId, returnDate, newBooking._id);
        
//         if (!statusUpdated) {
//             await Booking.findByIdAndDelete(newBooking._id);
//             return res.status(500).json({
//                 success: false,
//                 error: "Failed to update vehicle status"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Self-drive booking confirmed with home delivery",
//             booking: newBooking
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// const confirmBooking = async (req, res, next) => {
//     try {
//         const { vehicleId, pickupDate, returnDate, bookingType } = req.body;

//         // Check if user is authenticated
//         if (!req.user || !req.user._id) {
//             return res.status(401).json({
//                 success: false,
//                 error: "User not authenticated",
//             });
//         }

//         const userId = req.user._id;

//         // Validate dates
//         const pickup = new Date(pickupDate);
//         const return_ = new Date(returnDate);

//         if (pickup >= return_) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Return date must be after pickup date",
//             });
//         }

//         const vehicle = await Vehicle.findById(vehicleId);
//         if (!vehicle) {
//             return res.status(404).json({
//                 success: false,
//                 error: "Vehicle not found",
//             });
//         }

//         const totalPrice = calculateTotalPayment(vehicle.price, pickupDate, returnDate);

//         const newBooking = new Booking({
//             user: userId,
//             vehicle: vehicleId,
//             pickupDate: pickup,
//             returnDate: return_,
//             totalAmount: totalPrice,
//             bookingType,
//             status: "pending",
//             bookingDate: new Date(),
//         });

//         await newBooking.save();

//         res.status(200).json({
//             success: true,
//             message: "Booking confirmed successfully",
//             booking: newBooking,
//         });
//     } catch (error) {
//         next(error);
//     }
// };