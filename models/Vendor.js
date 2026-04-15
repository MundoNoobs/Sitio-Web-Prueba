const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VendorSchema = new mongoose.Schema({
  localId: { type: Number, required: true, unique: true },
  storeName: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  ownerName: String,
  ownerRut: String,
  iconUrl: String
}, { timestamps: true });

VendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

VendorSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Vendor', VendorSchema);
