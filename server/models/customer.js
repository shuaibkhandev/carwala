// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: {
    city: String,
    country: String,
    line1: String,
    line2: String,
    postal_code: String,
    state: String,
  },
  serviceName: String,         // ✅ changed from serverName
  servicePrice: Number,
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  },
  subServiceId: String,
  features: [String],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Customer', customerSchema);
