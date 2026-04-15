const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  photoUrl: String,
  price: Number,
  storeLocalId: Number,
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
