const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  description: { type: String, default: "" },
  category: { type: String, default: "General" },
  image: { type: String, default: "" },

  ingredients: {
    type: [String],   // always an array of strings
    default: []
  }
});

module.exports = mongoose.model('Product', productSchema);
