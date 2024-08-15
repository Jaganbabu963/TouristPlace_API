const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const APIerror = require('../utils/apiError');
// const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = factory.getAllOne(Review);

//   catchAsync(async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId) filter = { tourId: req.params.tourId };

//   const review = await Review.find(filter);

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       review,
//     },
//   });
// });

//   catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);

//   if (!review) {
//     return next(new APIerror('No review for Given Id', 400));
//   }

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       review,
//     },
//   });
// });

exports.setTourandUserIds = (req, res, next) => {
  if (!req.body.tourId) req.body.tour = req.params.tourId;
  if (!req.body.userId) req.body.user = req.user.id;

  next();
};

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

//   catchAsync(async (req, res, next) => {

//   const review = await Review.create(req.body);

//   if (!review) {
//     return next(new APIerror('No review for Given Id', 400));
//   }

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       review,
//     },
//   });
// });

exports.updateReview = factory.updateOne(Review);

//   catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndUpdate(req.params.id);

//   if (!review) {
//     return next(new APIerror('No review for Given Id', 400));
//   }

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       review,
//     },
//   });
// });

exports.deleteReview = factory.deleteone(Review);
// catchAsync(async (req, res, next) => {
//   await Review.findByIdAndDelete(req.params.id);

//   res.status(204).json({
//     status: 'Success',
//     data: null,
//   });
// });
