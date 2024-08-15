const express = require('express');
const reviewController = require('../controller/reviewController');
const authContruller = require('../controller/authController');

const router = express.Router({
  mergeParams: true,
});

router.use(authContruller.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authContruller.restrictTo('user'),
    reviewController.setTourandUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authContruller.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authContruller.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
