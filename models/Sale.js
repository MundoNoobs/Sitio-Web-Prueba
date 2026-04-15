const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  saleId: { type: String, unique: true },
  productName: String,
  price: Number,
  quantity: Number,
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerEmail: String,
  address: String,
  storeLocalId: Number,
  status: { type: String, default: 'En proceso' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'ventas' });

module.exports = mongoose.model('Sale', SaleSchema);
