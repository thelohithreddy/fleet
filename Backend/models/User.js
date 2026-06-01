const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        trim: true,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        trim: true,
        default: ''
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ]
}, {
    timestamps: true
});

// Drop existing indexes and create new ones
userSchema.statics.recreateIndexes = async function() {
    try {
        // Drop all existing indexes except _id
        const indexes = await this.collection.indexes();
        for (let index of indexes) {
            if (index.name !== '_id_') {
                await this.collection.dropIndex(index.name);
                console.log(`Dropped index: ${index.name}`);
            }
        }
    } catch (error) {
        console.log('Error dropping indexes:', error);
    }
    
    // Create only the email unique index
    await this.collection.createIndex({ email: 1 }, { 
        unique: true,
        background: true 
    });
    console.log('Created email index');
};

const User = mongoose.model('User', userSchema);

module.exports = User;