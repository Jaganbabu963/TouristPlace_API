const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dataSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const morgan = require('morgan');
const APIerrors = require('./utils/apiError');
const errorHandler = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// MIDDLEWARES
// console.log(process.env.NODE_ENV);
app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Requests from the IP, try again Later',
});

app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use(dataSanitize());
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  next();
});

// app.use((req, res, next) => {
//   console.log(
//     'Hello From the MiddleWare\nIam Checking whatever U show is working or not',
//   );
//   next();
// });

// ROUTE HANDLERS
// HTTP Routes
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(400).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl}`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.statusCode = 400;
  // err.status = 'fail';
  next(new APIerrors(`Can't find ${req.originalUrl}`, 404));
});

app.use(errorHandler.errorHandler);

//START SERVER
module.exports = app;
