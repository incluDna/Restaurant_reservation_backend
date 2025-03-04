const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const { register } = require('./auth');

//get all reservation -Public
// GET api/v1/reservations

exports.getReservations = async (req,res,next) => {
    let query;
    if(req.user.role !== 'admin') { //general users can see only their reservations
        query=Reservation.find({user:req.user.id}).populate({
            path:'restaurant',
            select:'name province tel'
        });
    } else {
        if(req.params.restaurantId) {
            console.log(req.params.restaurantId);
            query = Reservation.find({restaurant:req.params.restaurantId}).populate({
                path:"restaurant",
                select: "name province tel",
            });
        }
        else {  //if you are admin, you can see all reservations
            query = Reservation.find().populate({
                path:'restaurant',
                select: 'name province tel'
            });
    
        }
    }
    try {
        const reservations = await query;
        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }

};
    //get single reservation -Public
    // GET api/v1/reservations/:id
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name description tel'
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Reservation"
        });
    }
};

    //add reservation -Private
    // POST api/v1/reservations/:id
exports.addReservation = async (req, res, next) => {
    
    try {
        req.body.restaurant = req.params.restaurantId;
    
        const restaurant = await Restaurant.findById(req.params.restaurantId);
    
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            });
        }
        const openHour = restaurant.opentime.slice(0, 2);
        const closeHour = restaurant.closetime.slice(0, 2);
        const openMin = restaurant.opentime.slice(3);
        const closeMin = restaurant.closetime.slice(3);
        const openMinitues=parseInt(openHour)*60+parseInt(openMin);
        const closeMinitues=parseInt(closeHour)*60+parseInt(closeMin);

        const timePart = req.body.resDate.match(/T(\d{1,2}:\d{2})/)[1]
        const reservationHour = timePart.slice(0, 2);
        const reservationMin = timePart.slice(3);
        const reserveMinitues=parseInt(reservationHour)*60+parseInt(reservationMin);
        // console.log(openMinitues);
        // console.log(closeMinitues);
        // console.log(reserveMinitues);
        if(!(openMinitues<=reserveMinitues&&reserveMinitues<=closeMinitues)){
            return res.status(400).json({
                success: false,
                msg: 'Cannot make reservation'
            });
        }

        // }
        // Add user ID to req.body
        req.body.user = req.user.id;

        // Check for existing reservations
        const existingReservations = await Reservation.find({ user: req.user.id });

        // If the user is not an admin, they can only create 3 reservations
        if (existingReservations.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 reservations`
            });
        }

        const reservation = await Reservation.create(req.body);
    
        res.status(200).json({
            success: true,
            data: reservation
        });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Reservation"
        });
    }
};

//Update reservation -Private
//PUT /api/v1/reservations/:id
exports.updateReservation = async (req, res, next) => {
    
    // Make sure user is the reservation owner
    
    try {
        let reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this reservation`
            });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Reservation"
        });
    }
};

// delete reservation -Private
// DELETE /api/v1/reservations/:id

exports.deleteReservation = async (req, res, next) => {
    
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this reservation`
            });
        }
        await reservation.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Reservation"
        });
    }
};

