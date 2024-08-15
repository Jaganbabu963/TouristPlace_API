const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const APIerror = require('../utils/apiError');
// const APIfeatures = require('../utils/apiFeatures');

exports.cheapTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,summary,duration,difficulty,ratingsAverage';
  next();
};

exports.getAllTours = factory.getAllOne(Tour);

//   catchAsync(async (req, res, next) => {
//   const features = new APIfeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // send Response
//   res.status(200).json({
//     status: 'success',
//     // requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

//   catchAsync(async (req, res, next) => {
//   // const id = req.params.id * 1;
//   // const tour = tours.find((el) => el.id === id);
//   // try {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new APIerror('Page Not Found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

exports.createTour = factory.createOne(Tour);

//     catchAsync(async (req, res, next) => {
//   // console.log(req.body);
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.spread({ id: newId }, req.body);
//   // tours.push(newTour);
//   // try {
//   const newTour = await Tour.create(req.body);

//   if (!newTour) {
//     return next(new APIerror('Page Not Found', 404));
//   }

//   res.status(201).send({
//     status: 'Success',
//     data: {
//       tour: newTour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

exports.updateTour = factory.updateOne(Tour);

//   catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new APIerror('Page Not Found', 404));
//   }

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

exports.deleteTour = factory.deleteone(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const newTour = await Tour.findByIdAndDelete(req.params.id);

//   if (!newTour) {
//     return next(new APIerror('Page Not Found', 404));
//   }
//   res.status(204).json({
//     status: 'Success',
//     data: {
//       newTour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });
exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        totalRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyplan = catchAsync(async (req, res, next) => {
  // try {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $addFields: {
        startDate: {
          $dateFromString: {
            dateString: '$startDates',
            format: '%Y-%m-%d,%H:%M',
          },
        },
      },
    },
    {
      $match: {
        startDate: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDate' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});
// /gettourswithin/233/center/-45,45/unit/mi;
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3968.2 : distance / 6343.9;

  if (!lat || !lng) {
    return next(
      new APIerror('Please provide Correct latlng in lat,lng format.', 400),
    );
  }
  // console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'Success',
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new APIerror('Please provide Correct latlng in lat,lng format.', 400),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
