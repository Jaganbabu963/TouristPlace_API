const APIerror = require('../utils/apiError');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.deleteone = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new APIerror('Page Not Found', 404));
    }
    res.status(204).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new APIerror('Page Not Found', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    if (!doc) {
      return next(new APIerror('Page Not Found', 404));
    }

    res.status(201).send({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, populateOpts) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (populateOpts) query.populate(populateOpts);

    const doc = await query;

    if (!doc) {
      return next(new APIerror('Page Not Found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAllOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    // send Response
    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime,
      results: doc.length,
      data: {
        doc,
      },
    });
  });
