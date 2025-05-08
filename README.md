## QR Analytics

QR Analytics is a Node.js-based backend platform that tracks QR code scans and provides valuable analytics such as timestamp, location, and scan frequency. It's designed for businesses and developers who want insights into how their QR codes are being used.

##  Features

-  Geolocation Tracking using LocationIQ
-  Timestamp Logging
-  Scan Statistics API (total scans, scans by city/state, etc.)
-  Rate Limiting to prevent abuse
-  Modular and Scalable Codebase
-  MongoDB integration for scan data storage

##  Project Structure


qr-analytics/
├── app.js
├── routes/
│   ├── scan.js
│   └── stats.js
├── models/
│   └── Scan.js
├── middlewares/
│   └── logger.js
├── utils/
│   └── geolocation.js
├── .env
└── package.json



##  Getting Started

### 1. Clone the Repository

bash
git clone https://github.com/harshit1836/qr-analytics.git
cd qr-analytics


### 2. Install Dependencies

bash
npm install


### 3. Configure Environment Variables

Create a `.env` file in the root folder:


PORT=5000
MONGO_URI=your_mongodb_connection_string
LOCATIONIQ_API_KEY=your_locationiq_api_key

### 4. Start the Server

bash
npm start


Server will run at `http://localhost:5000`

## 📡 API Endpoints

### POST `/api/scan`

Logs a new scan entry.

**Request:**

json
{
  "latitude": "26.6500",
  "longitude": "84.9167"
}


**Response:**

json
{
  "message": "Scan logged successfully"
}


### GET `/api/stats/total-scans`

Returns the total number of scans recorded.

json
{
  "totalScans": 123
}


## 🧠 Built With

* Node.js
* Express.js
* MongoDB & Mongoose
* LocationIQ API
* dotenv
* express-rate-limit

## 📈 Future Enhancements

* 📊 Frontend dashboard for real-time analytics
* 🗺️ Live map view of scan locations
* 📦 Export scan data as CSV
* 🔐 Admin authentication and access control
* 🧾 Built-in QR Code generator and tracker

## 🤝 Contributing

Feel free to submit issues or pull requests for improvements.

## 📄 License

This project is licensed under the MIT License.

## 📬 Contact

Developed by \[Harshit Anand ]
Email: [your.email@example.com](mailto:harshitanand1836.email@example.com)
