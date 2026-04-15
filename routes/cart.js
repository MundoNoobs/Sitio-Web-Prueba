const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Sale = require('../models/Sale');

// Get cart for user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ msg: 'Falta userId' });
    const user = await User.findById(userId).populate('cart.productId').lean();
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ cart: user.cart || [] });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error servidor' }); }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, name, price, quantity, storeLocalId } = req.body;
    if (!userId || !productId || !name || !price || !quantity) return res.status(400).json({ msg: 'Faltan campos' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    const existing = user.cart.find(c => String(c.productId) === String(productId));
    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ productId, name, price, quantity, storeLocalId });
    }
    await user.save();
    res.json({ msg: 'Añadido', cart: user.cart });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error servidor' }); }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ msg: 'Faltan campos' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    user.cart = user.cart.filter(c => String(c.productId) !== String(productId));
    await user.save();
    res.json({ msg: 'Eliminado', cart: user.cart });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error servidor' }); }
});

// Checkout: create Sales from cart items and clear cart
router.post('/checkout', async (req, res) => {
  try {
    const { userId, address } = req.body;
    if (!userId) return res.status(400).json({ msg: 'Falta userId' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    if (!user.cart || user.cart.length === 0) return res.status(400).json({ msg: 'Carrito vacío' });
    const buyerAddress = address || user.address || '';
    const created = [];
    let totalAmount = 0;
    for (const item of user.cart) {
      const saleId = 'VENTA-' + Date.now() + '-' + Math.floor(Math.random()*1000);
      const sale = new Sale({ saleId, productName: item.name, price: item.price, quantity: item.quantity, buyer: user._id, buyerEmail: user.email, address: buyerAddress, storeLocalId: item.storeLocalId, status: 'En proceso' });
      await sale.save();
      created.push(sale);
      totalAmount += (Number(item.price) || 0) * (Number(item.quantity) || 0);
    }
    user.cart = [];
    await user.save();
    res.json({ msg: 'Compra simulada', sales: created, total: totalAmount });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error servidor' }); }
});

module.exports = router;
