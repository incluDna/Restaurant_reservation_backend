const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { register } = require('./auth');
const Reserve= require('../models/Reservation');
//const Review =require('../models/Review');

//get all review -Public
// GET api/v1/reviews

exports.getReviews = async (req,res,next) => {
    let query;
    if(req.user.role !== 'admin') { //general users can see only their reviews
        query=Review.find({user:req.user.id}).populate({
            path:'restaurant',
            select:'name reviews'
        });
    } else {
        if(req.params.restaurantId) {
            console.log(req.params.restaurantId);
            query = Review.find({restaurant:req.params.restaurantId}).populate({
                path:"restaurant",
                select: "name reviews",
            });
        }else {  //if you are admin, you can see all reviews
            query = Review.find().populate({
                path:'restaurant',
                select: 'name reviews'
            });
        }
    
    }try {
        const reviews = await query;
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Review"
        });
    }

};
    //get single review -Public
    // GET api/v1/reviews/:id
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name reviews'
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Review"
        });
    }
};

    //add review -Private
    // POST api/v1/reviews/:id
exports.addReview = async (req, res, next) => {
    
    try {
        req.body.restaurant = req.params.restaurantId;
    
        const restaurant = await Restaurant.findById(req.params.restaurantId);
    
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            });
        }
        // Add user ID to req.body
        req.body.user = req.user.id;

        // Check for existing reviews
        const existingReserves = await Reserve.find({ user: req.user.id, restaurant: req.params.restaurantId });

        // If the user is not an admin, they can only create 3 reviews
        if (!existingReserves && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} hasn't reserved any restaurants yet`
            });
        }

        // check review date after resDate
        //console.log(Date.now());
        //console.log(new Date(existingReserves[(existingReserves.length-1)].resDate).getTime()) ;\
        existingReserves.sort((a, b) => new Date(a.resDate) - new Date(b.resDate));

        //console.log(existingReserves);
        const dt=new Date(existingReserves[0].resDate).getTime();
        //console.log(dt);
        if (Date.now() < dt) {
            return res.status(400).json({
                success: false,
                message: `You can only review after the reservation date (${existingReserves[0].resDate})`
            });
        }

        const review = await Review.create(req.body);
    
        res.status(200).json({
            success: true,
            data: review
        });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot create Review"
        });
    }
};

//Update review -Private
//PUT /api/v1/reviews/:id
exports.updateReview = async (req, res, next) => {
    
    // Make sure user is the review owner
    
    try {
        let review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this review`
            });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update Review"
        });
    }
};

// delete review -Private
// DELETE /api/v1/reviews/:id

exports.deleteReview = async (req, res, next) => {
    
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `No review with the id of ${req.params.id}`
            });
        }
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this review`
            });
        }
        await review.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Review"
        });
    }
};


// Controller method to get all reviews for a specific restaurant
exports.getReviewsForRestaurant = async (req, res, next) => {
    const  restaurantID  = req.params.id;  

    try {
        // Find all reviews for the given restaurant ID
        const reviews = await Review.find({ restaurant: restaurantID });

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No reviews found for restaurant with ID ${restaurantID}`
            });
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.reviewStar, 0);
        const meanRating = totalRating / reviews.length;

        const review = await Restaurant.findById(req.params.id);
        console.log(totalRating);
        res.status(200).json({
            success: true,
            name:review.name,
            totalRating: meanRating.toFixed(2), 
            count: reviews.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
