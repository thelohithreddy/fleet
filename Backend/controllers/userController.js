const User = require('../models/User');

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
                supportEmail: "support@fleet.com",
                supportPhone: "+1 (555) 123-4567"
            }
        });
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
    logout
};