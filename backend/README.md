# VoltRide Backend API (Phase 1 & Phase 2)

VoltRide is an electric bike and scooty rental platform. This backend provides RESTful APIs built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, featuring **JWT Authentication**, **Bcrypt Password Hashing**, and **Role-Based Authorization**.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on `v24.x`)
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB community server (running on `mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.

---

## 2. Installation

Navigate into the `backend/` directory and install dependencies:

```bash
cd backend
npm install
```

Installed packages:
- `express`: Fast web framework for Node.js
- `mongoose`: MongoDB object modeling and schema validation
- `bcryptjs`: Secure one-way password hashing (salt rounds: 10)
- `jsonwebtoken`: JSON Web Token generation and validation
- `cors`: Cross-Origin Resource Sharing middleware
- `dotenv`: Environment variable management
- `nodemon`: Development hot-reload file watcher

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

# Password reset email delivery (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=VoltRide <no-reply@example.com>
```

> **Security Note**: `.env` is ignored by Git in both root and backend `.gitignore`. Never commit real credentials or secrets to version control.

For local transport-only testing, set `EMAIL_TRANSPORT=json`. This validates the Nodemailer path without delivering email; use real SMTP variables for the actual OTP flow. Never put SMTP credentials in frontend code.

---

## 4. Connecting to MongoDB

### Local MongoDB:
Ensure your local MongoDB daemon is running:
```bash
mongod
```
Connection URI: `mongodb://127.0.0.1:27017/voltride`

### MongoDB Atlas (Cloud):
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/voltride?retryWrites=true&w=majority`
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

When running, the server output displays:
```
🚀 VoltRide Backend server listening on port 5000
📡 Health Check URL: http://localhost:5000/api/health
✅ MongoDB Connected Successfully: 127.0.0.1
```

---

## 6. How JWT Authentication Works

1. **Registration / Login**: When a user registers (`POST /api/auth/register`) or logs in (`POST /api/auth/login`), the backend validates credentials and issues a signed JWT token containing `{ id: user._id, role: user.role }`.
2. **Authorization Header**: For all protected routes, send the token in the HTTP `Authorization` request header:
   ```http
   Authorization: Bearer <YOUR_JWT_TOKEN>
   ```
3. **Verification**: The `protect` middleware extracts the token, verifies the digital signature using `process.env.JWT_SECRET`, retrieves the user record (excluding password), and attaches it to `req.user`.
4. **Ownership Protection**: Bookings created while authenticated are automatically bound to `req.user._id`, preventing any client-side user impersonation.

---

## 7. Available API Endpoints

### 🩺 Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Verify that the API server is online |

---

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register user (`name`, `email`, `mobile`, `password`) |
| `POST` | `/api/auth/login` | Public | Login with `identifier` (email or mobile) & `password` |
| `POST` | `/api/auth/forgot-password` | Public | Request a 6-digit email OTP (`email`) |
| `POST` | `/api/auth/verify-reset-otp` | Public | Verify OTP and receive a short-lived reset authorization |
| `POST` | `/api/auth/reset-password` | Public | Set a new password using the reset authorization |

#### Sample Registration Request (`POST /api/auth/register`):
```json
{
  "name": "Anisha Dhaker",
  "email": "anisha@example.com",
  "mobile": "9079872848",
  "password": "Password@123"
}
```

#### Sample Registration / Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "66d8e123456789abcdef0123",
    "name": "Anisha Dhaker",
    "email": "anisha@example.com",
    "mobile": "9079872848",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 👤 User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Protected | Get current authenticated user profile |
| `PUT` | `/api/users/profile` | Protected | Update profile (`name`, `email`, `mobile`, `profileImage`) |
| `PUT` | `/api/users/change-password` | Protected | Change password (`currentPassword`, `newPassword`) |
| `GET` | `/api/users` | Admin Only | List all registered users |

#### Sample Change Password Request (`PUT /api/users/change-password`):
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewSecurePassword@456"
}
```

---

### 🛵 Vehicles (`/api/vehicles`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vehicles` | Public | List all vehicles (filters: `?type=`, `?status=`, `?location=`) |
| `GET` | `/api/vehicles/:id` | Public | Get single vehicle details by MongoDB ID |
| `POST` | `/api/vehicles` | Public/Dev | Register a new electric vehicle |

---

### 📅 Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Protected | Create booking (user automatically assigned from `req.user`) |
| `GET` | `/api/bookings/my-bookings` | Protected | Retrieve only the logged-in user's personal bookings |
| `GET` | `/api/bookings` | Protected | List bookings (customers see own; admins see all) |
| `GET` | `/api/bookings/:id` | Protected | View single booking (restricted to owner or admin) |

#### Sample Booking Request (`POST /api/bookings`):
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

---

## 8. Testing via PowerShell / cURL

### 1. Test Health:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health -Method GET
```

### 2. Register a User:
```powershell
$body = @{
    name = "Anisha Dhaker"
    email = "anisha@example.com"
    mobile = "9079872848"
    password = "SecurePassword@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method POST -Body $body -ContentType "application/json"
$token = $response.token
```

### 3. Login with Mobile Number:
```powershell
$loginBody = @{
    identifier = "9079872848"
    password = "SecurePassword@123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
```

### 4. Fetch Profile with Bearer Token:
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:5000/api/users/profile -Method GET -Headers $headers
```

### 5. Fetch My Bookings:
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:5000/api/bookings/my-bookings -Method GET -Headers $headers
```
