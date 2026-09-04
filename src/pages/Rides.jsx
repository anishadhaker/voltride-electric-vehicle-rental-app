import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  Check,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { bookingAPI } from "../services/api";

const TABS = [
  { id: "Upcoming", label: "Upcoming" },
  { id: "Active", label: "Active" },
  { id: "Completed", label: "Completed" },
  { id: "Cancelled", label: "Cancelled" },
];

function Rides() {
  const { bookings, cancelBooking } = useBooking();
  const [apiRides, setApiRides] = useState(null);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    bookingAPI
      .getMyBookings()
      .then((res) => {
        if (isMounted && res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((b) => ({
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
            securityDeposit: b.securityDeposit,
            totalAmount: b.totalAmount,
            status: b.bookingStatus,
          }));
          setApiRides(mapped);
        }
      })
      .catch(() => {
        // Fallback to local bookings gracefully
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayedBookings = apiRides || bookings;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const filteredBookings = displayedBookings.filter((b) => {
    if (activeTab === "Upcoming") return b.status === "Upcoming";
    if (activeTab === "Active") return b.status === "Active";
    if (activeTab === "Completed") return b.status === "Completed";
    if (activeTab === "Cancelled") return b.status === "Cancelled";
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-900">
            <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
            Upcoming
          </span>
        );
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Active Ride
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
            <Check className="h-3.5 w-3.5 text-emerald-700" />
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            {status}
          </span>
        );
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    const bookingId = cancelModalBooking.id;
    cancelBooking(bookingId);
    setCancelModalBooking(null);
    showToast(`Booking ${bookingId} was successfully cancelled.`);
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] px-6 pb-28 pt-32 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-5 w-5 text-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-lime-600">
              YOUR EV ADVENTURES
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
              My Rides
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your upcoming reservations, live rides, past rentals, and cancellations.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-lime-500 hover:text-gray-950"
          >
            Rent Another EV <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
          {TABS.map((tab) => {
            const count = displayedBookings.filter((b) => b.status === tab.id).length;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
                  isCurrent
                    ? "bg-gray-950 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                    isCurrent
                      ? "bg-lime-400 text-gray-950"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rides List or Empty State */}
        <div className="mt-8">
          {filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((ride) => (
                <div
                  key={ride.id}
                  className="group overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md sm:p-7"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Thumbnail & Info */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {ride.vehicleImage && (
                        <img
                          src={ride.vehicleImage}
                          alt={ride.vehicleName}
                          className="h-28 w-full rounded-2xl object-cover sm:h-24 sm:w-28"
                        />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-950">
                            {ride.vehicleName}
                          </h2>
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            {ride.vehicleType}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="font-mono font-bold text-gray-800">
                            ID: {ride.id}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-lime-600" />
                            {ride.pickupLocation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Amount */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end sm:gap-2">
                      <div className="sm:order-1">{getStatusBadge(ride.status)}</div>
                      <div className="text-right sm:order-2">
                        <span className="text-xs text-gray-400">Total Amount</span>
                        <p className="text-xl font-extrabold text-gray-950">
                          ₹{ride.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details Strip */}
                  <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-gray-50/80 p-4 border border-gray-100 sm:grid-cols-3">
                    <div>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Pickup
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-gray-900">
                        {ride.pickupDate} &bull; {ride.pickupTime}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Return
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-gray-900">
                        {ride.returnDate} &bull; {ride.returnTime}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        Duration
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-lime-800">
                        {ride.rentalHours} {ride.rentalHours === 1 ? "Hour" : "Hours"}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-lime-600" />
                      <span>Zero emission journey</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {ride.status === "Upcoming" && (
                        <button
                          type="button"
                          onClick={() => setCancelModalBooking(ride)}
                          className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Cancel Booking
                        </button>
                      )}

                      <Link
                        to={`/booking-confirmation/${ride.id}`}
                        className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-800 transition hover:bg-gray-200"
                      >
                        View Receipt
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-14 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 text-lime-800">
                <Bike className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-gray-950">
                No {activeTab.toLowerCase()} rides found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {activeTab === "Upcoming"
                  ? "You have no upcoming rentals booked right now. Explore our EV fleet and book your next clean ride in seconds!"
                  : `You do not have any rides in the "${activeTab}" status.`}
              </p>

              <div className="mt-6 flex justify-center gap-4">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-lime-500 hover:text-gray-950"
                >
                  Explore Fleet <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CANCEL BOOKING MODAL DIALOG */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-6 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-xl font-bold text-gray-950">
                Cancel Booking?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Are you sure you want to cancel your reservation for{" "}
                <strong className="text-gray-900">
                  {cancelModalBooking.vehicleName}
                </strong>{" "}
                (Reference:{" "}
                <span className="font-mono font-bold text-gray-800">
                  {cancelModalBooking.id}
                </span>
                )?
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-3.5 text-xs text-gray-600 border border-gray-100 space-y-1">
              <p>
                &bull; Your refundable security deposit of <strong>₹500</strong> will remain uncharged.
              </p>
              <p>
                &bull; The booking will be moved to your <strong>Cancelled</strong> tab.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Rides;
