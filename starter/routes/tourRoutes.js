const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
// const reviewController = require('../controller/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews/', reviewRouter);

router
  .route('/top-5-tours')
  .get(tourController.cheapTours, tourController.getAllTours);

// Aggregate pipeline Using
router.route('/gettourstats').get(tourController.getTourStats);

// /gettourswithin/?distance=233&center=-45,45&unit=mi;
// /gettourswithin/233/center/-45,45/unit/mi;
router
  .route('/gettoursWithin/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

// /getdistances/:latlng/unit/:unit'

router
  .route('/getdistances/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/getplan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyplan,
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// router
//   .route('/:tourId/reviews/')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

module.exports = router;
