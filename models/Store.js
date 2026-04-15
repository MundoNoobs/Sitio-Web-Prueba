const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  localId: { type: Number, required: true, unique: true },
  name: String,
  iconUrl: String,
  description: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }
}, { timestamps: true });

module.exports = mongoose.model('Store', StoreSchema);
