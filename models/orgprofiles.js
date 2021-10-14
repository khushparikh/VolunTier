const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
    orgName: String,
    townLocation: String,
    zipCode: Number,
    taxID: Number,
    interests: Array,   
    phoneNum: Number,
})

const orgProfile = mongoose.model('orgProfile', userSchema);

module.exports = orgProfile; 