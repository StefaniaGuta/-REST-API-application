const mongoose = require('mongoose')
const { Schema } = mongoose

const mongoSchema = new Schema({
  name: {
    type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
    type: Boolean,
      default: false,
  },
})


const Contact = mongoose.model("Contact", mongoSchema);
module.exports = Contact;
