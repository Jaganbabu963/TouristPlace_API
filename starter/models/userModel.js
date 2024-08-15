// const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have a Name'],
  },
  email: {
    type: String,
    required: [true, 'Must Enter an E-mail'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide correct E-mail'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  changedAt: Date,
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not matched',
    },
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //Actually runs if this Password is Actually modified
  if (!this.isModified('password')) return next();
  //hash the original password
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (this.isNew) {
    // If the document is new, skip setting the 'changedAt' field
    return next();
  }

  if (this.isModified('password')) {
    // If the password is modified and the document is not new, set the 'changedAt' field
    this.changedAt = Date.now() - 1000;
  }

  next();
});

// Query MiddleWare

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (issuedTime) {
  if (this.changedAt) {
    const changedTime = Math.floor(this.changedAt.getTime() / 1000);
    return issuedTime < changedTime;
  }
  // console.log(this.changedAt);
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 6000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
