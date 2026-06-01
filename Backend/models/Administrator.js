// const mongoose = require('mongoose');

// const administratorSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         default: 'admin',
//         immutable: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//         immutable: true
//     }
// });

// module.exports = mongoose.model('Administrator', administratorSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const administratorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin',
        immutable: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

// Hash the password before saving
administratorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare the provided password with the hashed password
administratorSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Administrator', administratorSchema);