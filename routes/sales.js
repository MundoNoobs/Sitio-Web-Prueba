const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { productName, price, quantity, userId, address, storeLocalId } = req.body;
    if (!productName || !price || !quantity || !userId || !address || !storeLocalId) return res.status(400).json({ msg: 'Faltan campos' });
    const saleId = 'VENTA-' + Date.now();
    const buyer = await User.findById(userId);
    const sale = new Sale({
      saleId,
      productName,
      price,
      quantity,
      buyer: buyer ? buyer._id : null,
      buyerEmail: buyer ? buyer.email : '',
      address,
      storeLocalId,
      status: 'En proceso'
    });
    await sale.save();
    res.json({ msg: 'Venta registrada', sale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

router.get('/', async (req, res) => {
  const sales = await Sale.find().sort({ createdAt: -1 }).limit(100);
  res.json(sales);
});

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const sales = await Sale.find({ buyer: userId }).sort({ createdAt: -1 }).limit(100);
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

module.exports = router;
