const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    id: {
        type: String,
        // required: true
    },
    username: {
        type: String,
        // required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

const Reviews = mongoose.model('Reviews', reviewSchema);

module.exports = Reviews;