const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.static('public'));
const mongoURI = 'mongodb+srv://harshitanand1836:%40Harshit123@cluster.itkm1t5.mongodb.net/qrAnalytics?retryWrites=true&w=majority&appName=qrAnalytics4';

// MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Define a schema for scan data
const scanSchema = new mongoose.Schema({
  qrId: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
});

// Create model for scan data
const Scan = mongoose.model('Scan', scanSchema);

// Parse JSON data from body
app.use(express.json());

// Route to handle scan and save data
app.post('/scan', async (req, res) => {
  const { qrId, latitude, longitude, userAgent } = req.body;

  try {
    // Save scan data to MongoDB
    const scan = new Scan({
      qrId,
      location: { latitude, longitude },
      userAgent,
    });
    await scan.save();
    res.status(200).json({ message: 'Scan data saved successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving scan data', error: err });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

// Add a root route for testing the server
app.get('/', (req, res) => {
  res.send('🎉 QR Analytics Server is running!');
});
