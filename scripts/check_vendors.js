const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('../models/Vendor');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zofri_db';

async function run(){
  try{
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Mongo for inspection');
    const all = await Vendor.find().lean().limit(100);
    console.log('Vendors count:', all.length);
    console.log(JSON.stringify(all, null, 2));
    process.exit(0);
  } catch(err){
    console.error('Error', err);
    process.exit(1);
  }
}

run();
