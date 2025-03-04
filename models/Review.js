const mongoose = require('mongoose');
const Restaurant = require('./Restaurant');

const ReviewSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant : {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    reviewStar: {
        type: Number,
        required: true,
        min:0,
        max:5
    },
    Description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports=mongoose.model('Review', ReviewSchema);