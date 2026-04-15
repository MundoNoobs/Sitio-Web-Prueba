const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const stores = await Store.find().limit(100);
  res.json(stores);
});

router.get('/:localId', async (req, res) => {
  const localId = parseInt(req.params.localId, 10);
  const store = await Store.findOne({ localId });
  if (!store) return res.status(404).json({ msg: 'No encontrado' });
  const products = await Product.find({ storeLocalId: localId });
  res.json({ store, products });
});

router.put('/:localId', async (req, res) => {
  try {
    const localId = parseInt(req.params.localId, 10);
    const { name, description, iconUrl } = req.body;
    const store = await Store.findOneAndUpdate({ localId }, { name, description, iconUrl }, { new: true });
    if (!store) return res.status(404).json({ msg: 'No encontrado' });
    res.json({ msg: 'Guardado', store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

module.exports = router;
