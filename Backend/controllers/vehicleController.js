const Vehicle = require('../models/Vehicle');
const schedule = require('node-schedule');
const Booking = require('../models/Booking');

const searchVehicles = async (req, res, next) => {
    try {
        const { city, pickupDate, returnDate, withDriver, filter = 'All' } = req.query;
        
        console.log('Received search parameters:', { 
            city, 
            pickupDate, 
            returnDate, 
            withDriver, 
            filter 
        });

        // Only filter by city for display
        let query = {};
        if (city) {
            query.city = city;
            console.log('Filtering vehicles by city:', city);
        }

        if(withDriver === "true"){
            query.driverName = { $nin: ["No Driver"] }; // Filter vehicles with driver
        } else if(withDriver === "false"){
            query.driverName = 'No Driver';
         } // Filter vehicles without driver

        const pickupDateTime = new Date(pickupDate);
        const returnDateTime = new Date(returnDate);

        // Find all vehicles that are booked during the requested time range
        const bookedVehicleIds = await Booking.find({
            $or: [
                {
                    pickupDate: { $lte: returnDateTime },
                    returnDate: { $gte: pickupDateTime }
                }
            ]
        }).distinct('vehicle'); // Get only the vehicle IDs
        console.log('pickupDateTime:', pickupDateTime);
        console.log('returnDateTime:', returnDateTime);

        console.log('Booked vehicle IDs:', bookedVehicleIds);

        // Exclude booked vehicles from the query
        query._id = { $nin: bookedVehicleIds };

        console.log('Database query:', JSON.stringify(query, null, 2));

        // Log all available bookings in the database
        // const allBookings = await Booking.find({});
        // console.log('All available bookings:', JSON.stringify(allBookings, null, 2));
        
        let vehicles = await Vehicle.find(query);
        console.log('Found vehicles:', vehicles.length);

        const formattedVehicles = vehicles.map(vehicle => ({
            id: vehicle._id,
            name: vehicle.name,
            image: vehicle.image,
            type: vehicle.type,
            price: vehicle.price,
            availability: vehicle.availability,
            rating: vehicle.rating,
            driverName: vehicle.driverName,
            // driverId: vehicle.driverId,
            fuelType: vehicle.fuelType,
            seatingCapacity: vehicle.seatingCapacity,
            registrationPlate: vehicle.registrationPlate,
            vehicleId: vehicle.vehicleId,
            city: vehicle.city
        }));

        // Log all available cities in the database
        const allCities = await Vehicle.distinct('city');
        // console.log('Available cities in database:', allCities);

        // Store all search parameters in the response
        res.status(200).json({
            success: true,
            count: formattedVehicles.length,
            vehicles: formattedVehicles,
            searchCriteria: {
                city,
                pickupDate,
                returnDate,
                withDriver,
                filter
            }
        });

    } catch (error) {
        console.error('Error in searchVehicles:', error);
        next(error);
    }
};

const updateVehicleStatus = async (vehicleId, status, bookingId) => {
    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (vehicle) {
            vehicle.availability = status;
            await vehicle.save();

            if (bookingId) {
                if (status === 'Not available') {
                    await Booking.findByIdAndUpdate(bookingId, { 
                        status: 'active',
                        bookingStartDate: new Date()
                    });
                } else if (status === 'Available') {
                    await Booking.findByIdAndUpdate(bookingId, { 
                        status: 'completed',
                        bookingEndDate: new Date()
                    });
                }
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating vehicle status:', error);
        return false;
    }
};

const markVehicleUnavailable = async (vehicleId, returnDate, bookingId) => {
    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return false;
        }

        // Update vehicle status
        vehicle.availability = 'Not available';
        await vehicle.save();

        // Schedule the vehicle to become available again after return date
        const returnDateTime = new Date(returnDate);
        const nextDay = new Date(returnDateTime);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);

        // Schedule the job to make vehicle available again
        schedule.scheduleJob(nextDay, async () => {
            vehicle.availability = 'Available';
            await vehicle.save();
        });

        return true;
    } catch (error) {
        console.error('Error marking vehicle unavailable:', error);
        return false;
    }
};

module.exports = { 
    searchVehicles,
    markVehicleUnavailable,
    updateVehicleStatus
};
