const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIerror = require('../utils/apiError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createNewToken = (user, statuscode, res) => {
  const token = signToken(user._id);

  const cookiesOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'development') cookiesOptions.secure = true;

  res.cookie('jwt', token, cookiesOptions);

  res.status(statuscode).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  // {
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  // }

  createNewToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check email and password Exists
  if (!email || !password) {
    return new APIerror('Please enter Your email and Password', 400);
  }

  // 2) check if email exists & password is correct
  const user = await User.findOne({ email }).select('+password');
  const correct = user.correctPassword(password, user.password);

  if (!correct || !user) {
    return next(new APIerror('Invalid Password or Email', 401));
  }
  // 3) if everything is ok

  createNewToken(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) check if token is there or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new APIerror('You are not Logged in!Please Log in', 401));
  }
  // 2)Verification Step
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3) check if User Still exists

  const userCheck = await User.findById(decoded.id);
  if (!userCheck) {
    return next(
      new APIerror('User belonging to this token no longer exists', 401),
    );
  }

  // 4) if User changes his Password;

  if (userCheck.changedPassword(decoded.iat)) {
    return next(new APIerror('User Changed Password! Login Again', 401));
  }

  req.user = userCheck;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new APIerror('You are not allowed to perform this Task', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Check if user Exists
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new APIerror('No user Found with that email', 404));
  }
  // 2) Generate Random resetToken

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot PassWord? use this Link ${resetURL} to set New One`;

  // 3) send it to user's email;
  try {
    await sendEmail({
      email: user.email,
      subject: 'reset URL for PassWord (Valid For 10 min)',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Mail sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new APIerror('Something went Wrong', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user by Token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new APIerror('User not Found or Token Expired'));
  }

  // 2) Generate New Password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // 3) send JWT token
  createNewToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get an user
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if posted password are matched or not
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new APIerror('password not found', 404));
  }
  // 3) update new Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4)send Token
  createNewToken(user, 201, res);
});
