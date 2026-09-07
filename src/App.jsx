import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { Zap } from "lucide-react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingDetails from "./pages/BookingDetails";
import Explore from "./pages/Explore";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Rides from "./pages/Rides";
import VerifyOtp from "./pages/VerifyOtp";
import VehicleDetails from "./pages/VehicleDetails";

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400">
            <Zap className="h-5 w-5 fill-black" />
          </span>
          <span className="font-bold">VoltRide</span>
        </Link>
        <p className="text-sm text-gray-500">&copy; 2026 VoltRide. Ride smarter. Go electric.</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
          <BrowserRouter>
          <div className="min-h-screen bg-[#f8faf9] text-gray-950">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/vehicles/:vehicleId" element={<VehicleDetails />} />

              {/* Protected user routes */}
              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation/:bookingId"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:bookingId"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rides/:bookingId"
                element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rides"
                element={
                  <ProtectedRoute>
                    <Rides />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Home />} />
            </Routes>
            <Footer />
          </div>
          </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
