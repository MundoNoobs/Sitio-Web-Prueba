const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Store = require('../models/Store');
const fs = require('fs');
const path = require('path');
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

router.post('/login', async (req, res) => {
  try {
    const { localId, email, password } = req.body;
    // write attempt to log file for debugging
    try { fs.appendFileSync(path.join(LOG_DIR, 'vendor-login.log'), `${new Date().toISOString()} - attempt - ${JSON.stringify({ localId, email, passwordPresent: !!password })}\n`); } catch (e) { console.error('Failed to write vendor-login.log', e); }
    if (!localId || !email || !password) return res.status(400).json({ msg: 'Faltan campos' });
    // Ensure localId is numeric for query
    const localIdNum = Number(localId);
    let vendor = await Vendor.findOne({ localId: localIdNum, email });
    if (!vendor) {
      // Fallback: try to find by email alone (allow login by email)
      const vendorByEmail = await Vendor.findOne({ email });
      if (vendorByEmail) {
        try { fs.appendFileSync(path.join(LOG_DIR, 'vendor-login.log'), `${new Date().toISOString()} - fallback-email - providedLocalId:${localId} matchedLocalId:${vendorByEmail.localId} email:${email}\n`); } catch (e) {}
        vendor = vendorByEmail;
      } else {
        try { fs.appendFileSync(path.join(LOG_DIR, 'vendor-login.log'), `${new Date().toISOString()} - not found - localId:${localId} email:${email}\n`); } catch (e) {}
        return res.status(400).json({ msg: 'Vendedor no encontrado' });
      }
    }
    try { fs.appendFileSync(path.join(LOG_DIR, 'vendor-login.log'), `${new Date().toISOString()} - found - id:${vendor._id} localId:${vendor.localId}\n`); } catch (e) {}
    const match = await vendor.comparePassword(password);
    if (!match) return res.status(400).json({ msg: 'Contraseña incorrecta' });
    res.json({ msg: 'OK', vendor: { id: vendor._id, localId: vendor.localId, storeName: vendor.storeName, email: vendor.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

router.get('/:localId/products', async (req, res) => {
  const localId = parseInt(req.params.localId, 10);
  const products = await Product.find({ storeLocalId: localId });
  res.json(products);
});

router.post('/:localId/products', async (req, res) => {
  try {
    const localId = parseInt(req.params.localId, 10);
    const { photoUrl, name, price } = req.body;
    const product = new Product({ photoUrl, name, price, storeLocalId: localId });
    await product.save();
    res.json({ msg: 'Producto añadido', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

router.put('/:localId/products/:id', async (req, res) => {
  const { photoUrl, name, price } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { photoUrl, name, price }, { new: true });
  res.json({ msg: 'Producto actualizado', product });
});

router.delete('/:localId/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Eliminado' });
});

module.exports = router;
