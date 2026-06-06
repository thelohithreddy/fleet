const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const appConfig = require('../config/app');

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('fullName phoneNumber email dateOfBirth address')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const formattedUser = {
            ...user,
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : null
        };

        res.status(200).json({
            success: true,
            user: formattedUser
        });
    } catch (error) {
        next(error);
    }
};

const updateUserProfile = async (req, res, next) => {
    try {
        const { fullName, phoneNumber, email, dateOfBirth, address } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already in use'
                });
            }
        }

        const updates = {};
        if (fullName) updates.fullName = fullName;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        if (email) updates.email = email;
        if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);
        if (address) updates.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        ).select('fullName phoneNumber email dateOfBirth address');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                ...updatedUser.toObject(),
                dateOfBirth: updatedUser.dateOfBirth ? new Date(updatedUser.dateOfBirth).toISOString().split('T')[0] : null
            }
        });
    } catch (error) {
        next(error);
    }
};

const getHelpInfo = async (_, res, next) => {
    try {
        res.status(200).json({
            success: true,
            helpInfo: {
                message: "You can contact us 24/7",
                supportEmail: appConfig.SUPPORT_EMAIL,
                supportPhone: appConfig.SUPPORT_PHONE_DISPLAY,
                supportPhoneTel: appConfig.SUPPORT_PHONE,
            }
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters',
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const currentValid = await bcrypt.compare(currentPassword, user.password);
        if (!currentValid) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect',
            });
        }

        const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (sameAsCurrent) {
            return res.status(400).json({
                success: false,
                error: 'New password cannot be the same as your current password. Please choose a different password.',
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

const isValidImageUrl = (url) => {
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const listHostVehicle = async (req, res, next) => {
    try {
        const {
            name, type, price, pricePerHour, city, fuelType, seatingCapacity,
            registrationPlate, vehicleId, image, hostAddress,
            description, modelYear, transmission,
        } = req.body;

        if (!name?.trim() || !price || !pricePerHour || !city || !fuelType || !seatingCapacity ||
            !registrationPlate?.trim() || !vehicleId?.trim() || !hostAddress?.trim() ||
            !image?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Please fill all required fields: name, prices, city, image URL, address, registration, and vehicle ID',
            });
        }

        if (!isValidImageUrl(image)) {
            return res.status(400).json({
                success: false,
                error: 'Image must be a valid http or https URL',
            });
        }

        if (Number(pricePerHour) <= 0 || Number(price) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Price per day and price per hour must be greater than zero',
            });
        }

        const existingPlate = await Vehicle.findOne({ registrationPlate: registrationPlate.trim() });
        if (existingPlate) {
            return res.status(400).json({
                success: false,
                error: 'A vehicle with this registration plate already exists',
            });
        }

        const existingId = await Vehicle.findOne({ vehicleId: vehicleId.trim() });
        if (existingId) {
            return res.status(400).json({
                success: false,
                error: 'This vehicle ID is already registered',
            });
        }

        const vehicle = await Vehicle.create({
            name: name.trim(),
            type: type || 'Car',
            price: Number(price),
            pricePerHour: Number(pricePerHour),
            city: city.trim(),
            fuelType,
            seatingCapacity: Number(seatingCapacity),
            registrationPlate: registrationPlate.trim(),
            vehicleId: vehicleId.trim(),
            image: image.trim(),
            description: description?.trim() || '',
            modelYear: modelYear ? Number(modelYear) : null,
            transmission: transmission || 'Manual',
            driverName: 'No Driver',
            driverId: '',
            availability: 'Available',
            rating: 0,
            hostUserId: req.user._id,
            hostAddress: hostAddress.trim(),
            listingStatus: 'approved',
        });

        res.status(201).json({
            success: true,
            message: 'Your vehicle is listed and visible in search and admin fleet — same as admin-added cars.',
            vehicle,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Registration plate or vehicle ID already exists',
            });
        }
        next(error);
    }
};

const getMyHostedVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ hostUserId: req.user._id })
            .select('name city price pricePerHour availability listingStatus hostAddress image createdAt')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, vehicles });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getHelpInfo,
    logout,
    changePassword,
    listHostVehicle,
    getMyHostedVehicles,
};