# VoltRide Backend API (Phase 1)

VoltRide is an electric bike and scooty rental platform. This backend provides RESTful APIs built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on `v24.x`)
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB community server (running on `mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.

---

## 2. Installation

Navigate into the `backend/` directory and install the dependencies:

```bash
cd backend
npm install
```

Installed packages:
- `express`: Fast web framework for Node.js
- `mongoose`: Elegant MongoDB object modeling and validation
- `cors`: Cross-Origin Resource Sharing middleware
- `dotenv`: Environment variable configuration
- `nodemon`: Automatic server restart during development

---

## 3. Environment Variables Configuration

Create a `.env` file in the `backend/` root (or copy `.env.example`):

```bash
cp .env.example .env
```

Configure the following variables in `backend/.env`:

```env
# Server Port
PORT=5000

# MongoDB Database Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/voltride

# JWT Authentication Secret Key
JWT_SECRET=your_jwt_secret_key_here
```

> **Note**: `.env` is ignored by Git in both root and backend `.gitignore`. Never commit real credentials.

---

## 4. Connecting to MongoDB

### Local MongoDB:
Ensure your local MongoDB daemon is running:
```bash
# Windows / Mac / Linux
mongod
```
Your connection URI is: `mongodb://127.0.0.1:27017/voltride`

### MongoDB Atlas (Cloud):
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/voltride?retryWrites=true&w=majority`
3. Paste the string into `MONGODB_URI` in `backend/.env`.

---

## 5. Running the Backend

From the `backend/` folder:

```bash
# Start in development mode with nodemon
npm run dev

# Start in production mode
npm start
```

When running, you will see:
```
🚀 VoltRide Backend server listening on port 5000
📡 Health Check URL: http://localhost:5000/api/health
✅ MongoDB Connected Successfully: 127.0.0.1
```

---

## 6. Available API Endpoints

### Health Check
| Method | Endpoint | Description | Sample Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Check API server status | `{"success": true, "message": "VoltRide API is running"}` |

### Vehicles
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vehicles` | List all vehicles (supports `?type=`, `?status=`, `?location=`) |
| `GET` | `/api/vehicles/:id` | Get vehicle details by MongoDB ID |
| `POST` | `/api/vehicles` | Register a new electric vehicle |

#### Sample Vehicle JSON for `POST /api/vehicles`:
```json
{
  "name": "Ather 450X",
  "brand": "Ather Energy",
  "model": "Gen 3 Pro",
  "type": "Electric Scooter",
  "registrationNumber": "PB-08-EV-1001",
  "image": "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1200&q=85",
  "location": "Phagwara City Hub",
  "battery": 94,
  "range": 111,
  "topSpeed": 90,
  "chargingTime": "5.4 hrs",
  "pricePerHour": 59,
  "pricePerDay": 999,
  "rating": 4.8,
  "status": "Available"
}
```

### Bookings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/bookings` | List all bookings with populated vehicle & user |
| `GET` | `/api/bookings/:id` | Get single booking by MongoDB ID or `VR-2026-XXXXX` |
| `POST` | `/api/bookings` | Create a new rental booking |

#### Sample Booking JSON for `POST /api/bookings`:
```json
{
  "vehicle": "<VEHICLE_MONGODB_ID>",
  "pickupLocation": "Phagwara City Hub",
  "pickupDateTime": "2026-09-06T10:00:00.000Z",
  "returnDateTime": "2026-09-06T14:00:00.000Z",
  "duration": 4,
  "rentalPrice": 236,
  "serviceFee": 10,
  "taxes": 12,
  "securityDeposit": 500,
  "totalAmount": 758
}
```

### Users (Placeholder)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | List users (passwords excluded) |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/users` | Create user record |

---

## 7. Response Format

### Success:
```json
{
  "success": true,
  "data": {}
}
```

### Error:
```json
{
  "success": false,
  "message": "Error description"
}
```
