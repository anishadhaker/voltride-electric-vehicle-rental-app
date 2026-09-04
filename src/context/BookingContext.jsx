import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getVehicleById } from "../data/vehicles";

const BookingContext = createContext(null);

const STORAGE_KEY = "voltride_bookings";

const SEED_BOOKINGS = [
  {
    id: "VR-2026-10842",
    vehicleId: "ather-450x",
    vehicleName: "Ather 450X",
    vehicleType: "Electric Scooter",
    vehicleBrand: "Ather Energy",
    vehicleImage:
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1200&q=85",
    pickupLocation: "Phagwara City Hub",
    pickupDate: "2026-08-24",
    pickupTime: "10:00",
    returnDate: "2026-08-24",
    returnTime: "13:00",
    rentalHours: 3,
    pricePerHour: 59,
    rentalPrice: 177,
    serviceFee: 10,
    taxes: 9,
    securityDeposit: 500,
    totalAmount: 696,
    status: "Completed",
    createdAt: "2026-08-24T09:30:00.000Z",
  },
  {
    id: "VR-2026-21950",
    vehicleId: "revolt-rv400",
    vehicleName: "Revolt RV400",
    vehicleType: "Electric Bike",
    vehicleBrand: "Revolt Motors",
    vehicleImage:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85",
    pickupLocation: "Jalandhar Central Station",
    pickupDate: "2026-08-18",
    pickupTime: "11:00",
    returnDate: "2026-08-18",
    returnTime: "16:00",
    rentalHours: 5,
    pricePerHour: 69,
    rentalPrice: 345,
    serviceFee: 10,
    taxes: 17,
    securityDeposit: 500,
    totalAmount: 872,
    status: "Completed",
    createdAt: "2026-08-18T10:15:00.000Z",
  },
];

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return SEED_BOOKINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  const addBooking = (bookingData) => {
    const vehicle = getVehicleById(bookingData.vehicleId) || {};
    const bookingId =
      bookingData.id || `VR-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking = {
      id: bookingId,
      vehicleId: bookingData.vehicleId,
      vehicleName: bookingData.vehicleName || vehicle.name || "Electric Vehicle",
      vehicleType: bookingData.vehicleType || vehicle.type || "Electric Scooter",
      vehicleBrand: bookingData.vehicleBrand || vehicle.brand || "VoltRide",
      vehicleImage: bookingData.vehicleImage || vehicle.image || "",
      pickupLocation:
        bookingData.pickupLocation || vehicle.location || "City Hub",
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime,
      returnDate: bookingData.returnDate,
      returnTime: bookingData.returnTime,
      rentalHours: bookingData.rentalHours || 1,
      pricePerHour: bookingData.pricePerHour || vehicle.pricePerHour || 59,
      rentalPrice: bookingData.rentalPrice || 59,
      serviceFee: bookingData.serviceFee ?? 10,
      taxes: bookingData.taxes ?? 3,
      securityDeposit: bookingData.securityDeposit ?? 500,
      totalAmount: bookingData.totalAmount || 572,
      status: bookingData.status || "Upcoming",
      customerName: bookingData.customerName || "Anisha Dhaker",
      customerMobile: bookingData.customerMobile || "9079872848",
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    let updated = false;
    setBookings((prev) =>
      prev.map((item) => {
        if (item.id === bookingId) {
          updated = true;
          return { ...item, status: "Cancelled", cancelledAt: new Date().toISOString() };
        }
        return item;
      })
    );
    return updated;
  };

  const getBookingById = (bookingId) => {
    if (!bookingId) return null;
    return bookings.find((b) => b.id.toLowerCase() === bookingId.toLowerCase()) || null;
  };

  const stats = useMemo(() => {
    const totalRides = bookings.length;
    const upcomingRides = bookings.filter((b) => b.status === "Upcoming").length;
    const activeRides = bookings.filter((b) => b.status === "Active").length;
    const completedRides = bookings.filter((b) => b.status === "Completed").length;
    const cancelledRides = bookings.filter((b) => b.status === "Cancelled").length;

    const totalAmountSpent = bookings
      .filter((b) => b.status !== "Cancelled")
      .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

    const totalHours = bookings
      .filter((b) => b.status !== "Cancelled")
      .reduce((acc, curr) => acc + (Number(curr.rentalHours) || 1), 0);

    const co2SavedKg = Math.max(12, Math.round(totalHours * 3.2));
    const totalDistanceKm = Math.max(150, Math.round(totalHours * 24));

    return {
      totalRides,
      upcomingRides,
      activeRides,
      completedRides,
      cancelledRides,
      totalAmountSpent,
      totalHours,
      co2SavedKg,
      totalDistanceKm,
    };
  }, [bookings]);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
        getBookingById,
        stats,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
