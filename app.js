require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const ExcelJS = require('exceljs');
const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas & Models
const scanSchema = new mongoose.Schema({
  qrId: { type: mongoose.Schema.Types.ObjectId, ref: 'QrCode' },
  latitude: Number,
  longitude: Number,
  city: String,
  state: String,
  scannedAt: { type: Date, default: Date.now }
});
const qrCodeSchema = new mongoose.Schema({
  destinationUrl: String,
  allowedLocation: {
    lat: Number,
    lng: Number,
    radius: { type: Number, default: 1 } // radius in KM
  }
});
const Scan = mongoose.model('Scan', scanSchema);
const QrCode = mongoose.model('QrCode', qrCodeSchema);

// LocationIQ
const locationIQKey = process.env.LOCATIONIQ_KEY;
const locationIQAPI = 'https://us1.locationiq.com/v1/reverse.php';

async function getLocationDetails(lat, lon) {
  try {
    const { data } = await axios.get(locationIQAPI, {
      params: { key: locationIQKey, lat, lon, format: 'json' }
    });
    const addr = data.address || {};
    return {
      city: addr.city || addr.town || addr.village || 'Unknown',
      state: addr.state || 'Unknown'
    };
  } catch (e) {
    console.error('LocationIQ error:', e.message);
    return { city: 'Unknown', state: 'Unknown' };
  }
}

// 🔄 Distance checker (Haversine formula)
function isWithinRadius(lat1, lon1, lat2, lon2, radiusKm) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= radiusKm;
}

// 📥 POST /scan/:qrId
app.post('/scan/:qrId', async (req, res) => {
  const { latitude, longitude } = req.body;
  const { qrId } = req.params;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  const qr = await QrCode.findById(qrId);
  if (!qr) return res.status(404).json({ error: 'QR code not found.' });

  const allowed = qr.allowedLocation;
  if (!isWithinRadius(latitude, longitude, allowed.lat, allowed.lng, allowed.radius)) {
    return res.status(403).json({ message: 'Access denied: outside allowed area.' });
  }

  const loc = await getLocationDetails(latitude, longitude);
  const scan = await new Scan({ qrId, latitude, longitude, city: loc.city, state: loc.state }).save();

  res.status(201).json({ message: 'Scan successful.', scan });
});

// 📊 GET total scans
app.get('/api/stats/total-scans', async (req, res) => {
  const totalScans = await Scan.countDocuments();
  res.json({ totalScans });
});

// 📤 GET export Excel
app.get('/export/excel', async (req, res) => {
  try {
    const scans = await Scan.find().lean();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Scans');
    ws.columns = [
      { header: 'QR ID', key: 'qrId', width: 24 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'City', key: 'city', width:
