const mongoose = require('mongoose');
const Restaurant = require('./Restaurant');

const ReservationSchema = new mongoose.Schema({
    resDate: {
        type: Date,
        required: true
    },
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
    quantity: {
        type: Number,
        ref: 'Quantity',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports=mongoose.model('Reservation', ReservationSchema);