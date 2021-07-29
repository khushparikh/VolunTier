const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    townLocation: String,
    zipCode: Number,
    taxID: Number,
    interestTag1: String,
    phoneNum: Number,
})


const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile; 