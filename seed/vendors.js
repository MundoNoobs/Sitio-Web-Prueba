const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('../models/Vendor');
const Store = require('../models/Store');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zofri_db';

// EDITA ESTE ARRAY para añadir vendedores manualmente.
// Formato: { localId: 1, storeName: 'Nombre', email: 'correo@ejemplo.com', password: 'pass123', ownerName: 'Dueño', ownerRut: '12.345.678-5' }
const vendorsToAdd = [
  { localId: 1, storeName: 'Demo Tienda', email: 'vendor1@zofri.com', password: 'VendorPass!23', ownerName: 'Juan Perez', ownerRut: '12.345.678-K' }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  if (vendorsToAdd.length === 0) {
    console.log('No hay vendedores para añadir. Edita seed/vendors.js');
    process.exit(0);
  }
  for (const v of vendorsToAdd) {
    const exists = await Vendor.findOne({ localId: v.localId });
    if (!exists) {
      const vendor = new Vendor(v);
      await vendor.save();
      const store = new Store({ localId: v.localId, name: v.storeName, vendor: vendor._id });
      await store.save();
      console.log('Añadido vendor', v.localId);
    } else {
      console.log('Vendedor ya existe', v.localId);
    }
  }
  console.log('Seed completado');
  process.exit(0);
}

if (require.main === module) seed();
