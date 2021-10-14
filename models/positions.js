const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    positionName: {
        type: String,
        required: true,
    },
    orgName: {
        type: String,
        required: true,
    },
    positionLocation: String,
    positionZipCode: Number,
    
    location: {
        type: String,
        enum: ['Virtual', 'In-Person']
    },
    interests: Array,
    user_id: String,
})


const Position = mongoose.model('Position', positionSchema);

module.exports = Position; 