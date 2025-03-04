const express = require('express');
const {getReviews, getReview, addReview, updateReview, deleteReview,getReviewsForRestaurant} = require('../controllers/reviews');

const router = express.Router({mergeParams:true});

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, authorize('admin','user'), getReviews).post(protect, authorize('admin', 'user'), addReview);
router.route('/:id').get(protect, getReview).put(protect, authorize('admin', 'user'), updateReview)
      .delete(protect, authorize('admin', 'user'), deleteReview);
router.route('/means/:id').get(protect, authorize('admin', 'user'),getReviewsForRestaurant);

module.exports = router;