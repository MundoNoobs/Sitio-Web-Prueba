const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');

router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const products = await Product.find({ name: new RegExp(q, 'i') }).limit(100);
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Error servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'No encontrado' });
    const others = await Product.find({ name: product.name });
    // attach store name to each other item to avoid exposing store ID in UI
    const othersWithStore = await Promise.all(others.map(async (p) => {
      const store = await Store.findOne({ localId: p.storeLocalId }).lean();
      const obj = p.toObject ? p.toObject() : p;
      obj.storeName = store ? store.name : '';
      return obj;
    }));
    res.json({ product, others: othersWithStore });
  } catch (err) {
    res.status(500).json({ msg: 'Error servidor' });
  }
});

module.exports = router;
