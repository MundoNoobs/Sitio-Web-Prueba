const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zofri_db';
// Ensure Node resolver uses reliable public DNS servers for SRV lookups
const dns = require('dns');
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(',').map(s => s.trim());
  dns.setServers(servers);
} else {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}
console.log('DNS servers used by Node resolver:', dns.getServers());

if (MONGO_URI.startsWith('mongodb+srv://')) {
  const host = MONGO_URI.split('@')[1].split('/')[0];
  const dnsPromises = dns.promises || require('dns').promises;
  dnsPromises.resolveSrv('_mongodb._tcp.' + host)
    .then(records => console.log('SRV records for', host, records))
    .catch(err => console.error('SRV resolve failed for', host, err));
}

// Connect to MongoDB with retry logic
function connectWithRetry() {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error', err);
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
}
connectWithRetry();

// If DB isn't ready, return 503 for API routes to avoid long timeouts
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ msg: 'Base de datos no disponible' });
  }
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');
const storeRoutes = require('./routes/stores');
const salesRoutes = require('./routes/sales');
const cartRoutes = require('./routes/cart');

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/cart', cartRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
