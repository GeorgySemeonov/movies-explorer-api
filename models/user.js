const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (email) => validator.isEmail(email),
      },
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

  },
);

module.exports = mongoose.model('user', userSchema);
