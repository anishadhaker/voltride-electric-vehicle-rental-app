import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bike,
  Calendar,
  CheckCircle2,
  Clock3,
  Compass,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { bookingAPI } from "../services/api";

function BookingConfirmation() {
  const { bookingId } = useParams();
  const [apiBooking, setApiBooking] = useState(null);
  const [loading, setLoading] = useState(Boolean(bookingId));

  useEffect(() => {
    let isMounted = true;
    if (bookingId) {
      bookingAPI
        .getById(bookingId)
        .then((res) => {
          const b = res?.data?.data || res?.data;
          if (isMounted && b && (b.bookingId || b._id)) {
            setApiBooking({
              id: b.bookingId || b._id,
              vehicleName: b.vehicle?.name || "Electric Vehicle",
              vehicleType: b.vehicle?.type || "EV",
              vehicleBrand: b.vehicle?.brand || "",
              vehicleImage: b.vehicle?.image || "",
              pickupLocation: b.pickupLocation || b.vehicle?.location || "VoltRide Hub",
              pickupDate: new Date(b.pickupDateTime).toLocaleDateString(),
              pickupTime: new Date(b.pickupDateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              returnDate: new Date(b.returnDateTime).toLocaleDateString(),
              returnTime: new Date(b.returnDateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              rentalHours: b.duration,
              pricePerHour: b.vehicle?.pricePerHour || 59,
              rentalPrice: b.rentalPrice,
              serviceFee: b.serviceFee,
              taxes: b.taxes,
              totalAmount: (Number(b.rentalPrice) || 0) + (Number(b.serviceFee) || 0) + (Number(b.taxes) || 0),
              status: b.bookingStatus,
              paymentStatus: b.paymentStatus,
            });
          }
        })
        .catch(() => {
          // Fallback to not found
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const booking = apiBooking;

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 lg:px-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-lime-600 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading reservation confirmation...</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 lg:px-8">
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 text-lime-800">
            <Bike className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-950">Booking Not Found</h1>
          <p className="mt-2 text-sm text-gray-500">
            We couldn't locate booking reference <strong>{bookingId}</strong>. It may have been cleared or the link is incorrect.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/rides"
              className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-lime-500 hover:text-gray-950"
            >
              Check My Rides
            </Link>
            <Link
              to="/explore"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Explore Vehicles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-36 lg:px-8">
      {/* Celebration Card */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-b from-lime-50 to-white px-6 pb-8 pt-10 text-center sm:px-12 sm:pt-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-400 shadow-md shadow-lime-300/50">
            <CheckCircle2 className="h-10 w-10 text-gray-950" />
          </div>

          <span className="mt-6 inline-block rounded-full bg-lime-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-lime-900">
            Booking Confirmed
          </span>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
            Your Electric Ride is Reserved!
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            A confirmation has been recorded. Present this booking reference when picking up your vehicle at the hub.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-2.5 shadow-xs">
            <span className="text-xs text-gray-400">Booking ID:</span>
            <span className="font-mono text-base font-bold text-gray-950">{booking.id}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="border-t border-gray-100 p-6 sm:p-10 space-y-8">
          {/* Vehicle Snapshot */}
          <div className="flex flex-col gap-4 rounded-2xl bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:gap-6 border border-gray-100">
            {booking.vehicleImage && (
              <img
                src={booking.vehicleImage}
                alt={booking.vehicleName}
                className="h-28 w-full rounded-xl object-cover sm:w-36"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-800">
                  {booking.vehicleType}
                </span>
                <span className="text-xs text-gray-500">{booking.vehicleBrand}</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-gray-950">{booking.vehicleName}</h2>
              <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-lime-600 shrink-0" />
                <span>Pickup Hub: <strong>{booking.pickupLocation}</strong></span>
              </p>
            </div>
          </div>

          {/* Schedule Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Rental Schedule
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-lime-700">
                  <Calendar className="h-4 w-4" /> Pickup Schedule
                </div>
                <p className="mt-2 text-base font-bold text-gray-950">
                  {booking.pickupDate}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                  <Clock3 className="h-3.5 w-3.5 text-gray-400" /> {booking.pickupTime}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-lime-700">
                  <Calendar className="h-4 w-4" /> Return Schedule
                </div>
                <p className="mt-2 text-base font-bold text-gray-950">
                  {booking.returnDate}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                  <Clock3 className="h-3.5 w-3.5 text-gray-400" /> {booking.returnTime}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-lime-50/80 px-4 py-2.5 text-xs text-lime-900 border border-lime-100 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-lime-700" /> Total Duration:
              </span>
              <strong className="text-sm">{booking.rentalHours} {booking.rentalHours === 1 ? "Hour" : "Hours"}</strong>
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Price Details
            </h3>
            <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Rental Rate ({booking.rentalHours} hrs &times; ₹{booking.pricePerHour}/hr)
                </span>
                <span className="font-semibold text-gray-900">₹{booking.rentalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VoltRide Service Fee</span>
                <span className="font-semibold text-gray-900">₹{booking.serviceFee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes & Cess (5%)</span>
                <span className="font-semibold text-gray-900">₹{booking.taxes}</span>
              </div>
              <div className="border-t border-gray-200 pt-3.5 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-gray-950">Total Amount</span>
                </div>
                <span className="text-2xl font-extrabold text-lime-700">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
            <span className="font-semibold text-gray-600">Payment status</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.paymentStatus === "Paid" ? "bg-lime-100 text-lime-900" : "bg-amber-100 text-amber-900"}`}>
              {booking.paymentStatus || "Pending"}
            </span>
          </div>

          {/* Guarantee Badge */}
          <div className="flex items-center gap-3 rounded-2xl bg-gray-950 p-4 text-white text-xs">
            <ShieldCheck className="h-6 w-6 text-lime-400 shrink-0" />
            <p className="leading-relaxed text-gray-300">
              Zero-carbon mobility guaranteed. Your rental total includes the ride, service fee, and applicable taxes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to="/rides"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-lime-500 hover:text-gray-950"
            >
              <Bike className="h-4 w-4" /> View My Rides
            </Link>

            <Link
              to={`/my-rides/${booking.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              View Details
            </Link>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              <User className="h-4 w-4" /> Go to Profile
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              <Compass className="h-4 w-4" /> Explore More
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BookingConfirmation;
