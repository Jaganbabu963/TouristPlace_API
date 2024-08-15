const APIerror = require('../utils/apiError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value} `;
  return new APIerror(message, 400);
};

const handleValidErrors = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input. ${errors.join('. ')}`;
  return new APIerror(message, 400);
};

const handleduplicateFields = (err) => {
  const value = err.enums.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicat name ${value} is not allowed`;
  return new APIerror(message, 400);
};

const handleJWTError = () =>
  new APIerror('You are Logged Out Please Login Again', 401);
const handleExpiredError = () =>
  new APIerror('Your Session has expired! Please Login Again', 401);

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stackflow: err.stackflow,
  });
};

const sendErrorProd = (res, err) => {
  //if error is Operational //
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //error is Programming or any Other

    res.status(500).json({
      status: 'error',
      message: 'Something Went Wrong',
    });
  }
};

exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.cose === 11000) error = handleduplicateFields(error);
    if (error.name === 'ValidationError') error = handleValidErrors(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleExpiredError();

    sendErrorProd(res, error);
  }
};
