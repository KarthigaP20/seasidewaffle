const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
    }
  ],
  shippingAddress: {
    name: { type: String, required: true },   
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },     
    country: { type: String, required: true },   
    pincode: { type: String, required: true },   
  },
  deliveryStatus: { type: String, default: 'Pending' }, // e.g. Pending, Shipped, Delivered
  totalPrice: { type: Number, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
