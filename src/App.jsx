import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Zap } from "lucide-react";
import Navbar from "./components/Navbar";
import { BookingProvider } from "./context/BookingContext";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Rides from "./pages/Rides";
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
    <BookingProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f8faf9] text-gray-950">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/vehicles/:vehicleId" element={<VehicleDetails />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/booking" element={<Booking />} />
            <Route
              path="/booking-confirmation/:bookingId"
              element={<BookingConfirmation />}
            />
            <Route path="/rides" element={<Rides />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;
