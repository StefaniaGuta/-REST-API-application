const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
    default: '',
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
});

userSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('email')) {
    const avatarURL = gravatar.url(this.email, {
      s: '200', 
      r: 'pg', 
      d: 'mm'  
    });
    this.avatarURL = avatarURL;
  }
  next();


});

userSchema.methods.setPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;