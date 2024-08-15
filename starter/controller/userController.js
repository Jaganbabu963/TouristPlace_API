const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIerror = require('../utils/apiError');
const factory = require('./handlerFactory');

const filterObj = (Obj, ...neededFields) => {
  const getFields = {};
  Object.keys(Obj).forEach((el) => {
    if (neededFields.includes(el)) getFields[el] = Obj[el];
  });
  return getFields;
};

exports.getAllUsers = factory.getAllOne(User);

// catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       users,
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);

//   (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This Route is not yet Implimented',
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This Route is not yet Implimented. Insted use SignUp for creating new User',
  });
};

exports.updateUser = factory.updateOne(User);

//   (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This Route is not yet Implimented',
//   });
// };

exports.deleteUser = factory.deleteone(User);

// catchAsync(async (req, res) => {
//   await User.findByIdAndDelete(req.params.id);
//   res.status(201).json({
//     status: 'Success',
//     data: null,
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) if Password or PasswordConfirm are posted;
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new APIerror(
        'Here U Cant Change Your Password !Use Update Password Route',
        400,
      ),
    );
  }
  //  3) Filter only Required Fields
  const filteredObj = filterObj(req.body, 'name', 'email');
  //  2) update User
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    runValidators: true,
    new: true,
  });
  // console.log(updateUser);

  res.status(200).json({
    status: 'Success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
