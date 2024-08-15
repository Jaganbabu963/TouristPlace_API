const nodemailer = require('nodemailer');
// const { toString } = require('validator');

const sendEmail = async (options) => {
  // 1) create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) create Options

  const mailOptions = {
    from: 'Jagan babu <jagancheemala@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send the Email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
