import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BatteryCharging,
  Check,
  ChevronLeft,
  Clock3,
  Gauge,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { getAllVehicles, getVehicleById } from "../data/vehicles";
import { vehicleAPI } from "../services/api";

const today = new Date().toISOString().split("T")[0];

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
      <Icon className="h-5 w-5 text-lime-600" />
      <p className="mt-3 text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-950 sm:text-base">{value}</p>
    </div>
  );
}

function VehicleDetails() {
  const { id, vehicleId } = useParams();
  const navigate = useNavigate();
  const currentId = id || vehicleId;
  const [vehicle, setVehicle] = useState(() => {
    const all = getAllVehicles();
    return getVehicleById(currentId) || all[0];
  });

  useEffect(() => {
    let isMounted = true;
    if (currentId) {
      vehicleAPI
        .getById(currentId)
        .then((res) => {
          if (isMounted && res?.data?.data) {
            setVehicle(res.data.data);
          }
        })
        .catch(() => {
          // Gracefully retain local fallback vehicle
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentId]);

  const [favorite, setFavorite] = useState(false);
  const [booking, setBooking] = useState({
    pickupDate: today,
    pickupTime: "10:00",
    returnDate: today,
    returnTime: "14:00",
  });

  const rentalHours = useMemo(() => {
    const start = new Date(`${booking.pickupDate}T${booking.pickupTime}`);
    const end = new Date(`${booking.returnDate}T${booking.returnTime}`);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    return Math.max(1, Number.isFinite(hours) && hours > 0 ? hours : 1);
  }, [booking]);

  const pricePerHour = vehicle.pricePerHour || vehicle.price || 59;
  const pricePerDay = vehicle.pricePerDay || vehicle.dailyPrice || 999;
  const deposit = 500;
  const estimatedRental = rentalHours * pricePerHour;
  const estimatedTotal = estimatedRental + 10 + Math.round(estimatedRental * 0.05) + deposit;

  const updateBooking = (field, value) => {
    setBooking((current) => ({ ...current, [field]: value }));
  };

  const shareVehicle = async () => {
    if (navigator.share) {
      await navigator.share({
        title: vehicle.name,
        text: `Check out the ${vehicle.name} on VoltRide!`,
        url: window.location.href,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleProceedToBook = () => {
    navigate(`/booking/${vehicle._id || vehicle.id}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
        >
          <ChevronLeft className="h-4 w-4" /> Back to explore
        </Link>
        <span className="text-xs font-semibold text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
          VoltRide Verified EV
        </span>
      </div>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Left Column: Image & Quick Specs */}
        <div>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-950 shadow-xl ring-1 ring-gray-100">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="h-[380px] w-full object-cover sm:h-[500px]"
            />

            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-xs px-4 py-2 text-xs font-bold text-gray-900 shadow-md">
              <span className="h-2.5 w-2.5 rounded-full bg-lime-500 animate-pulse" />
              {vehicle.availability || "Available Now"}
            </div>

            <div className="absolute right-6 top-6 rounded-full bg-gray-950/80 backdrop-blur-xs px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
              {vehicle.brand}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailItem
              icon={BatteryCharging}
              label="Battery Level"
              value={`${vehicle.battery}%`}
            />
            <DetailItem
              icon={Zap}
              label="True Range"
              value={`${vehicle.range} km`}
            />
            <DetailItem
              icon={Gauge}
              label="Top Speed"
              value={`${vehicle.topSpeed || vehicle.speed || 85} km/h`}
            />
            <DetailItem
              icon={Clock3}
              label="Charging Time"
              value={vehicle.chargingTime || vehicle.charging || "4.5 hrs"}
            />
          </div>

          {/* About this Vehicle */}
          <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-950">About this Vehicle</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              {vehicle.about ||
                `The ${vehicle.name} is a high-performance electric vehicle built for modern city commuting and weekend rides. Clean, quiet, and loaded with smart features, it offers an effortless electric experience.`}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-700">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 px-3.5 py-2 border border-gray-100">
                <ShieldCheck className="h-4 w-4 text-lime-600" />
                Zero Tailpipe Emissions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 px-3.5 py-2 border border-gray-100">
                <Sparkles className="h-4 w-4 text-lime-600" />
                Sanitized & Inspected
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 px-3.5 py-2 border border-gray-100">
                <Zap className="h-4 w-4 text-lime-600" />
                Instant Torque & Responsive Throttle
              </span>
            </div>
          </section>

          {/* Vehicle Specifications */}
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-950">Vehicle Specifications</h2>
            <div className="mt-6 divide-y divide-gray-100">
              <div className="flex flex-col py-3.5 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-sm font-semibold text-gray-500">Electric Motor</span>
                <span className="text-sm font-bold text-gray-900 mt-1 sm:mt-0">
                  {vehicle.specifications?.motor || "PMSM High Efficiency Motor"}
                </span>
              </div>
              <div className="flex flex-col py-3.5 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-sm font-semibold text-gray-500">Battery Pack</span>
                <span className="text-sm font-bold text-gray-900 mt-1 sm:mt-0">
                  {vehicle.specifications?.batteryCapacity || "Lithium-ion IP67 Water Resistant"}
                </span>
              </div>
              <div className="flex flex-col py-3.5 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-sm font-semibold text-gray-500">Fast Charging</span>
                <span className="text-sm font-bold text-gray-900 mt-1 sm:mt-0">
                  {vehicle.specifications?.charging || "Quick charge supported at public hubs"}
                </span>
              </div>
              <div className="flex flex-col py-3.5 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-sm font-semibold text-gray-500">Braking System</span>
                <span className="text-sm font-bold text-gray-900 mt-1 sm:mt-0">
                  {vehicle.specifications?.brakes || "Disc Brakes with Combined Braking System"}
                </span>
              </div>
              <div className="flex flex-col py-3.5 sm:flex-row sm:justify-between sm:items-center">
                <span className="text-sm font-semibold text-gray-500">Smart Features</span>
                <span className="text-sm font-bold text-gray-900 mt-1 sm:mt-0 max-w-sm sm:text-right">
                  {vehicle.specifications?.features || "Digital display, GPS tracking, Anti-theft"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Pricing & Booking Card */}
        <div className="sticky top-28 space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-800">
                  {vehicle.type}
                </span>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                  {vehicle.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-lime-600" />
                    {vehicle.location}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <strong className="text-gray-900">{vehicle.rating}</strong>
                    <span>({vehicle.reviews} reviews)</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => setFavorite(!favorite)}
                  className="rounded-full border border-gray-200 p-2.5 text-gray-500 transition hover:border-lime-500 hover:text-lime-600"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorite ? "fill-lime-400 text-lime-600" : ""
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={shareVehicle}
                  aria-label="Share vehicle"
                  className="rounded-full border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Pricing Rates Bar */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-y border-gray-100 py-5 text-center">
              <div>
                <p className="text-xl font-extrabold text-gray-950">₹{pricePerHour}</p>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Per Hour
                </p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-950">₹{pricePerDay}</p>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Per Day
                </p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-950">₹{deposit}</p>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Deposit
                </p>
              </div>
            </div>

            {/* Quick Time Selector Preview */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-950">Plan your ride</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Choose pickup & return to check availability and exact cost
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={booking.pickupDate}
                    onChange={(e) => updateBooking("pickupDate", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={booking.pickupTime}
                    onChange={(e) => updateBooking("pickupTime", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Return Date
                  </label>
                  <input
                    type="date"
                    min={booking.pickupDate}
                    value={booking.returnDate}
                    onChange={(e) => updateBooking("returnDate", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Return Time
                  </label>
                  <input
                    type="time"
                    value={booking.returnTime}
                    onChange={(e) => updateBooking("returnTime", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Live Preview Calculation */}
              <div className="mt-5 rounded-2xl bg-gray-50 p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Duration</span>
                  <p className="font-bold text-gray-950">
                    {rentalHours} {rentalHours === 1 ? "Hour" : "Hours"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Estimated Total</span>
                  <p className="text-xl font-extrabold text-lime-700">
                    ₹{estimatedTotal}
                  </p>
                </div>
              </div>

              {/* Action Button: Book this Vehicle */}
              <button
                type="button"
                onClick={handleProceedToBook}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-4 font-bold text-white shadow-md transition hover:bg-lime-500 hover:text-gray-950"
              >
                <Zap className="h-5 w-5 fill-current" /> Book This Vehicle
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Transparent pricing. Refundable ₹500 deposit included.
              </p>
            </div>
          </div>

          {/* Trust & Safety Highlights */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-base font-bold text-gray-950">Included with Every Ride</h3>
            <div className="mt-4 space-y-3 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-lime-600 shrink-0" />
                DOT certified sanitised helmet
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-lime-600 shrink-0" />
                Full 40-point safety check before handover
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-lime-600 shrink-0" />
                24/7 Roadside assistance & live helpline
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-lime-600 shrink-0" />
                Comprehensive third-party vehicle insurance
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default VehicleDetails;
