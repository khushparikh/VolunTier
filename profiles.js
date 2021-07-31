const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    townLocation: String,
    zipCode: Number,
    location: {
        type: String,
        enum: ['Virtual', 'In-Person']
    },
    interestTag1: String,
    interestTag2: String,
    interestTag3: String
})


const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;