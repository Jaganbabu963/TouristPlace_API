// eslint-disable-next-line import/no-extraneous-dependencies
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database is Connected Securly');
  });

// console.log(process.env);

const port = 3000;
app.listen(port, () => {
  console.log(`App is Listening on ${port}`);
});
