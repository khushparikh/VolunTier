const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
    name: String,
    location: String,
    zipCode: Number,
    interests: Array,
    matches: Array,
})


const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;