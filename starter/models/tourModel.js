const mongoose = require('mongoose');

const slugify = require('slugify');

// const User = require('./userModel');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minLength: [10, 'A name must have more or equal to 10'],
      maxLength: [40, 'A name must have less or equal to 40'],
    },
    slug: String,
    difficulty: {
      type: String,
      required: [true, 'A tour must have Diffuculty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy,medium,difficult',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    summary: {
      type: String,
      required: [true, 'A tour must have Summary'],
      trim: true,
    },
    description: {
      type: String,
      // required: [true, 'A tour must have description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have imageCover'],
      trim: true,
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The Average Rating must be above 1'],
      max: [5, 'The Average Rating must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: [
        function (val) {
          return val < this.price;
        },
        'the Discount must be lower than Price',
      ],
    },
    images: [String],
    startDates: [String],

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
      description: {
        type: String,
      },
      address: {
        type: String,
      },
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    // child Referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
    },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post('save', function (next) {
//   console.log(this);
//   next();
// });

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changedAt',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
